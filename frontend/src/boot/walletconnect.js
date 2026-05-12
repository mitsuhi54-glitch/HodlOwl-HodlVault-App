/**
 * WalletConnect Boot File (v2.1.1)
 * Real Paytaca connectivity via WalletConnect v2 Sign Client + Modal.
 * Using Paytaca-compatible chain IDs: bch:bchtest (testnet) and bch:bitcoincash (mainnet).
 * Reference: https://github.com/mainnet-pat/wc2-bch-bcr
 */

import { boot } from 'quasar/wrappers'
import SignClient from '@walletconnect/sign-client'
import { WalletConnectModal } from '@walletconnect/modal'
import { base64ToBin, binToHex, hexToBin, secp256k1, sha256 } from '@bitauth/libauth'
import {
  cashAddressToLockingBytecode,
  lockingBytecodeToBase58Address,
  encodeBase58Address,
  decodeBase58Address,
} from '@bitauth/libauth'

// Paytaca/WalletConnect v2 BCH chain IDs (wc2-bch-bcr spec)
// bch:bchtest = testnet3, bch:chipnet = chipnet, bch:bitcoincash = mainnet, bch:bchreg = regtest
const BCH_TESTNET_CHAIN = 'bch:bchtest'
const BCH_CHIPNET_CHAIN = 'bch:chipnet'
const BCH_MAINNET_CHAIN = 'bch:bitcoincash'

/** BCH config for WalletConnect v2 (matches wc2-bch-bcr spec for Paytaca compatibility) */
const REQUIRED_METHODS = ['bch_getAddresses', 'bch_signTransaction', 'bch_signMessage']

const REQUIRED_NAMESPACES = {}

const OPTIONAL_NAMESPACES = {
  bch: {
    chains: [BCH_TESTNET_CHAIN, BCH_CHIPNET_CHAIN, BCH_MAINNET_CHAIN],
    methods: REQUIRED_METHODS,
    events: ['addressesChanged'],
  },
}

const MODAL_METADATA = {
  name: 'BCH Hodl Vault',
  description: 'HodlVault – lock BCH until price target',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: ['https://quasar.dev/img/icons/favicon-192x192.png'],
}

const PROJECT_ID =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_WALLETCONNECT_PROJECT_ID
    ? import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
    : 'YOUR_REOWN_PROJECT_ID'

// Validate PROJECT_ID on init
if (PROJECT_ID === 'YOUR_REOWN_PROJECT_ID') {
  console.warn(
    '⚠️ WalletConnect PROJECT_ID not set! Set VITE_WALLETCONNECT_PROJECT_ID in .env or get one from https://cloud.reown.com',
  )
}

let signClient = null
let modal = null
let currentSession = null
let isConnecting = false // Prevent multiple simultaneous connections
let connectionPromise = null // Track ongoing connection attempts
let connectionStatusInterval = null // Periodic status checker

const BITCOIN_SIGNED_MESSAGE_PREFIX = (() => {
  const encoder = new TextEncoder()
  const text = encoder.encode('Bitcoin Signed Message:\n')
  const out = new Uint8Array(1 + text.length)
  out[0] = 0x18
  out.set(text, 1)
  return out
})()

function encodeBitcoinVarInt(n) {
  if (n < 0xfd) return Uint8Array.from([n])
  if (n <= 0xffff) return Uint8Array.from([0xfd, n & 0xff, (n >>> 8) & 0xff])
  if (n <= 0xffffffff) {
    return Uint8Array.from([0xfe, n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff])
  }
  throw new Error('Message too long')
}

function concatBytes(...parts) {
  const total = parts.reduce((sum, p) => sum + p.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const p of parts) {
    out.set(p, offset)
    offset += p.length
  }
  return out
}

// Periodic connection status checker - runs less frequently to avoid overhead
function startConnectionStatusChecker(store) {
  if (connectionStatusInterval) {
    clearInterval(connectionStatusInterval)
  }

  connectionStatusInterval = setInterval(async () => {
    if (currentSession && signClient) {
      try {
        // Quick check if session still exists without full validation
        const session = signClient.session.get(currentSession.topic)
        if (!session || session.expiry * 1000 < Date.now()) {
          console.log('Connection status checker: Session no longer valid, clearing state')
          currentSession = null
          if (store) {
            store.commit('wallet/CLEAR_WALLET')
          }
        }
      } catch {
        // Silent fail - don't spam console
      }
    }
  }, 30000) // Check every 30 seconds instead of 5
}

function stopConnectionStatusChecker() {
  if (connectionStatusInterval) {
    clearInterval(connectionStatusInterval)
    connectionStatusInterval = null
  }
}

function hash256(payload) {
  return sha256.hash(sha256.hash(payload))
}

function hashBitcoinSignedMessage(message) {
  const encoder = new TextEncoder()
  const msg = encoder.encode(message)
  const preimage = concatBytes(BITCOIN_SIGNED_MESSAGE_PREFIX, encodeBitcoinVarInt(msg.length), msg)
  return hash256(preimage)
}

function isHexString(value) {
  return typeof value === 'string' && /^[0-9a-fA-F]+$/.test(value)
}

function tryExtractCompactSignature(buffer) {
  if (buffer.length === 65 && buffer[0] >= 27 && buffer[0] <= 35) {
    return buffer
  }
  for (let i = 0; i <= buffer.length - 65; i++) {
    const header = buffer[i]
    if (header >= 27 && header <= 35) {
      return buffer.slice(i, i + 65)
    }
  }
  return null
}

function toLegacyAddress(address = '') {
  const lockingBytecode = cashAddressToLockingBytecode(address)
  if (typeof lockingBytecode === 'string') throw lockingBytecode

  const legacyAddress = lockingBytecodeToBase58Address(lockingBytecode.bytecode)
  if (typeof legacyAddress !== 'string') {
    return encodeBase58Address(legacyAddress.type, legacyAddress.payload)
  }
  return legacyAddress
}

function addressToPkHash(address = '') {
  const legacyAddress = toLegacyAddress(address)

  // Decode the Base58Check-encoded legacy address
  const decodedLegacyAddress = decodeBase58Address(legacyAddress)
  if (typeof decodedLegacyAddress === 'string') throw decodedLegacyAddress

  return binToHex(decodedLegacyAddress.payload)
}

export async function recoverPublicKeyHash() {
  const wallet = JSON.parse(localStorage.getItem('hodl-vault-wallet'))
  console.log('Wallet from localStorage:', wallet)

  const address = wallet?.address
  if (!address) {
    throw new Error('No wallet address found in store')
  }
  const pkHash = addressToPkHash(address)
  console.log('Recovered public key hash:', pkHash)
  return addressToPkHash(address)
}

export async function recoverPublicKey(store) {
  console.log('recoverpublickey:')
  if (!store) throw new Error('Vuex store not available')

  const client = await getSignClient(store)
  console.log('CLIENT PRINT:', client)
  if (!currentSession?.topic) {
    throw new Error('Wallet not connected. Connect Paytaca first.')
  }

  const chainId = currentSession.namespaces?.bch?.chains?.[0] ?? BCH_CHIPNET_CHAIN
  console.log('CHAIN ID:', chainId)
  console.log('CURRENT SESSION:', currentSession)
  const message = 'Login to HodlVault'

  const signatureResponse = await client.request({
    chainId,
    topic: currentSession.topic,
    request: { method: 'bch_signMessage', params: { message, userPrompt: message } },
  })

  console.log('Raw Paytaca Signature:', signatureResponse)

  if (!signatureResponse) {
    throw new Error('Wallet did not return a message signature')
  }

  const rawString =
    typeof signatureResponse === 'string'
      ? signatureResponse.trim()
      : JSON.stringify(signatureResponse)

  let decoded = base64ToBin(rawString)
  let sigWithHeader = tryExtractCompactSignature(decoded)

  if (!sigWithHeader && isHexString(rawString) && rawString.length % 2 === 0) {
    const hexDecoded = hexToBin(rawString)
    sigWithHeader = tryExtractCompactSignature(hexDecoded)
  }

  if (!sigWithHeader) {
    throw new Error(
      `Unable to locate compact signature in payload (decoded length: ${decoded.length})`,
    )
  }

  const header = sigWithHeader[0]
  if (header < 27 || header > 35) {
    throw new Error(`Unexpected signature header: ${header}`)
  }

  let recoveryId = header - 27
  const compressed = recoveryId >= 4
  if (compressed) recoveryId -= 4

  const compactSig = sigWithHeader.slice(1) // 64 bytes: r||s
  const messageHash = hashBitcoinSignedMessage(message)

  let pubKey = compressed
    ? secp256k1.recoverPublicKeyCompressed(compactSig, recoveryId, messageHash)
    : secp256k1.recoverPublicKeyUncompressed(compactSig, recoveryId, messageHash)

  if (typeof pubKey === 'string') throw new Error(pubKey)

  if (!compressed) {
    const compressedPub = secp256k1.compressPublicKey(pubKey)
    if (typeof compressedPub === 'string') throw new Error(compressedPub)
    pubKey = compressedPub
  }

  if (!secp256k1.validatePublicKey(pubKey)) {
    throw new Error('Recovered public key is invalid')
  }

  const publicKeyHex = binToHex(pubKey)
  store.commit('wallet/SET_PUBLIC_KEY', publicKeyHex)
  return publicKeyHex
}

async function getSignClient(store) {
  if (signClient) return signClient
  console.log('[WC TIMING] getSignClient: Initializing SignClient...')
  const initStart = performance.now()
  signClient = await SignClient.init({
    projectId: PROJECT_ID,
    metadata: MODAL_METADATA,
  })
  console.log(
    `[WC TIMING] getSignClient: SignClient initialized (${(performance.now() - initStart).toFixed(2)}ms)`,
  )

  // Add session event listeners for better state management
  signClient.on('session_event', ({ event, chainId }) => {
    console.log('WalletConnect session event:', { event, chainId })
    // Handle session events like addressesChanged
    if (event.name === 'addressesChanged' && currentSession) {
      // Refresh wallet state when addresses change
      syncSessionToStore(store, signClient, currentSession)
    }
  })

  signClient.on('session_delete', () => {
    console.log('WalletConnect session deleted - clearing wallet state')
    currentSession = null
    // Clear wallet state immediately when session is deleted externally
    if (store) {
      store.commit('wallet/CLEAR_WALLET')
    }
  })

  // Add session expire event listener
  signClient.on('session_expire', () => {
    console.log('WalletConnect session expired - clearing wallet state')
    currentSession = null
    if (store) {
      store.commit('wallet/CLEAR_WALLET')
    }
  })

  return signClient
}

function getModal() {
  if (modal) return modal
  // Enhanced modal configuration for better QR code display
  modal = new WalletConnectModal({
    projectId: PROJECT_ID,
    chains: [BCH_TESTNET_CHAIN, BCH_CHIPNET_CHAIN, BCH_MAINNET_CHAIN],
    themeMode: 'light',
    themeVariables: {
      '--wcm-z-index': '9999',
      '--wcm-background-color': '#ffffff',
      '--wcm-fallback-color': '#ffffff',
      '--wcm-accent-color': '#00d588',
      '--wcm-accent-fill-color': '#ffffff',
    },
    standaloneChains: [BCH_CHIPNET_CHAIN], // Default to chipnet
    qrModalSize: 'lg', // Larger QR code
    enableMobileWalletFocus: true, // Better mobile experience
  })
  return modal
}

// Fast session cleanup - only clean current session if invalid
async function cleanupStaleSessions(client, store) {
  // Only check current session for performance - bulk cleanup not needed every connect
  if (currentSession) {
    try {
      const session = client.session.get(currentSession.topic)
      const methods = currentSession.namespaces?.bch?.methods ?? []
      const hasRequiredMethods = REQUIRED_METHODS.every((m) => methods.includes(m))

      if (!session || !hasRequiredMethods || session.expiry * 1000 < Date.now()) {
        console.log('Cleaning up stale current session:', currentSession.topic)
        try {
          await client.disconnect({ topic: currentSession.topic })
        } catch {
          // Ignore disconnect errors
        }
        currentSession = null
        if (store) {
          store.commit('wallet/CLEAR_WALLET')
        }
      }
    } catch {
      // Silent fail for performance
    }
  }
}

export function initializeWalletConnect(store) {
  // Start the connection status checker
  startConnectionStatusChecker(store)

  return {
    async connect(onModalOpen) {
      // Prevent multiple simultaneous connections
      if (isConnecting) {
        console.log('[WC TIMING] Connection already in progress, returning existing promise')
        return connectionPromise
      }

      const connectStart = performance.now()
      console.log('[WC TIMING] === Connection started ===')

      isConnecting = true
      connectionPromise = this._performConnection(store, connectStart, onModalOpen)

      try {
        const result = await connectionPromise
        const totalTime = performance.now() - connectStart
        console.log(`[WC TIMING] === Connection completed in ${totalTime.toFixed(2)}ms ===`)
        return result
      } catch (err) {
        const totalTime = performance.now() - connectStart
        console.log(`[WC TIMING] === Connection failed after ${totalTime.toFixed(2)}ms ===`)
        throw err
      } finally {
        isConnecting = false
        connectionPromise = null
      }
    },

    async _performConnection(store, connectStart, onModalOpen) {
      if (!store) return null

      const stepStart = performance.now()
      try {
        console.log('[WC TIMING] Step 1: Getting SignClient...')
        const client = await getSignClient(store)
        console.log(
          `[WC TIMING] Step 1: SignClient ready (${(performance.now() - stepStart).toFixed(2)}ms)`,
        )

        // Quick cleanup of current session only (not all sessions)
        console.log('[WC TIMING] Step 2: Cleaning up stale sessions...')
        const cleanupStart = performance.now()
        await cleanupStaleSessions(client, store)
        console.log(
          `[WC TIMING] Step 2: Cleanup done (${(performance.now() - cleanupStart).toFixed(2)}ms)`,
        )

        // Check for existing valid session
        console.log('[WC TIMING] Step 3: Checking existing sessions...')
        const checkStart = performance.now()
        const existingSessions = client.session.getAll()
        const bchSession = existingSessions.find((s) => s.namespaces?.bch?.accounts?.length)
        if (bchSession) {
          const methods = bchSession.namespaces?.bch?.methods ?? []
          const hasRequiredMethods = REQUIRED_METHODS.every((m) => methods.includes(m))

          if (hasRequiredMethods && bchSession.expiry * 1000 > Date.now()) {
            console.log(
              `[WC TIMING] Step 3: Found existing valid session (${(performance.now() - checkStart).toFixed(2)}ms)`,
            )
            currentSession = bchSession
            console.log('[WC TIMING] Step 4: Syncing existing session to store...')
            const syncStart = performance.now()
            await syncSessionToStore(store, client, currentSession)
            console.log(
              `[WC TIMING] Step 4: Session synced (${(performance.now() - syncStart).toFixed(2)}ms)`,
            )
            const totalTime = performance.now() - connectStart
            console.log(
              `[WC TIMING] === TOTAL: ${totalTime.toFixed(2)}ms (using existing session) ===`,
            )
            return store.state.wallet?.address ?? null
          } else {
            console.log(
              `[WC TIMING] Step 3: Session invalid or expired (${(performance.now() - checkStart).toFixed(2)}ms)`,
            )
            // Disconnect invalid session - fire and forget
            client.disconnect({ topic: bchSession.topic }).catch(() => {})
          }
        }

        // Create new connection
        console.log('[WC TIMING] Step 4: Creating new WalletConnect session...')
        const connectStartTime = performance.now()
        const { uri, approval } = await client.connect({
          requiredNamespaces: REQUIRED_NAMESPACES,
          optionalNamespaces: OPTIONAL_NAMESPACES,
        })
        console.log(
          `[WC TIMING] Step 4: Session created, URI generated (${(performance.now() - connectStartTime).toFixed(2)}ms)`,
        )

        const wcModal = getModal()

        // Fast modal opening - no artificial delays
        if (uri) {
          try {
            console.log('[WC TIMING] Step 5: Opening modal...')
            const modalStart = performance.now()
            // Open modal immediately without delay
            wcModal.openModal({ uri })
            console.log(
              `[WC TIMING] Step 5: Modal opened (${(performance.now() - modalStart).toFixed(2)}ms)`,
            )
            // Notify UI that modal is open - clear loading state
            if (onModalOpen) {
              console.log('[WC TIMING] Notifying UI: Modal is open, clearing loading state')
              onModalOpen()
            }
          } catch (modalError) {
            console.error('Failed to open WalletConnect modal:', modalError)
            throw new Error('Failed to display QR code. Please try again.')
          }
        }

        // Wait for user approval - this resolves when wallet connects
        console.log('[WC TIMING] Step 6: Waiting for wallet approval (QR scan)...')
        const approvalStart = performance.now()
        const session = await approval()
        const approvalTime = performance.now() - approvalStart
        console.log(`[WC TIMING] Step 6: Wallet approved connection (${approvalTime.toFixed(2)}ms)`)

        // Close modal immediately upon approval - no delay
        const closeStart = performance.now()
        wcModal.closeModal()
        console.log(
          `[WC TIMING] Step 7: Modal closed (${(performance.now() - closeStart).toFixed(2)}ms)`,
        )

        currentSession = session
        console.log('[WC TIMING] Step 8: Syncing new session to store...')
        const syncStart = performance.now()
        await syncSessionToStore(store, client, session)
        console.log(
          `[WC TIMING] Step 8: Session synced to store (${(performance.now() - syncStart).toFixed(2)}ms)`,
        )

        const totalTime = performance.now() - connectStart
        console.log(`[WC TIMING] === TOTAL: ${totalTime.toFixed(2)}ms (new connection) ===`)
        return store.state.wallet?.address ?? null
      } catch (err) {
        // Fast cleanup - close modal immediately on error
        try {
          getModal().closeModal()
        } catch {
          // Ignore close errors
        }

        // Only disconnect if we have a current session
        if (currentSession) {
          try {
            await this.disconnect()
          } catch {
            // Ignore disconnect errors
          }
        }

        // Minimal error logging
        console.error('WalletConnect connection error:', err?.message || err)

        throw err
      }
    },

    async disconnect() {
      // Clear state immediately for responsive UI
      currentSession = null
      isConnecting = false
      connectionPromise = null

      if (store) {
        store.commit('wallet/CLEAR_WALLET')
      }

      // Stop the connection status checker
      stopConnectionStatusChecker()

      // Fire and forget disconnect - don't wait for network
      if (signClient) {
        const sessionTopic = currentSession?.topic
        if (sessionTopic) {
          signClient.disconnect({ topic: sessionTopic }).catch(() => {})
        }
      }
    },

    isConnected() {
      return !!store?.state?.wallet?.address && !!currentSession?.topic
    },

    getAddress() {
      return store?.state?.wallet?.address ?? null
    },

    getSignatureTemplate() {
      return null
    },

    getOwnerPublicKeyHex() {
      return store?.state?.wallet?.publicKey ?? null
    },

    getSessionTopic() {
      return currentSession?.topic ?? null
    },

    getChainId() {
      return currentSession?.namespaces?.bch?.chains?.[0] ?? null
    },

    async request(method, params) {
      const client = await getSignClient(store)
      if (!currentSession?.topic) {
        throw new Error('Wallet not connected. Connect Paytaca first.')
      }
      const chainId = currentSession.namespaces?.bch?.chains?.[0] ?? BCH_CHIPNET_CHAIN
      console.log('session', currentSession)
      return await client.request({
        chainId,
        topic: currentSession.topic,
        request: { method, params },
      })
    },

    async recoverPublicKey() {
      return await recoverPublicKey(store)
    },
  }
}

async function syncSessionToStore(store, client, session) {
  const syncStart = performance.now()
  const chainId = session.namespaces?.bch?.chains?.[0] ?? BCH_CHIPNET_CHAIN

  console.log('[WC TIMING] syncSessionToStore: Starting...')

  try {
    console.log('[WC TIMING] syncSessionToStore: Requesting bch_getAddresses...')
    const addrStart = performance.now()
    const addresses = await client.request({
      chainId,
      topic: session.topic,
      request: { method: 'bch_getAddresses', params: {} },
    })
    const address = Array.isArray(addresses) && addresses.length ? addresses[0] : null
    console.log(
      `[WC TIMING] syncSessionToStore: bch_getAddresses took ${(performance.now() - addrStart).toFixed(2)}ms`,
    )

    // Try to extract public key from session accounts or request it
    let publicKey = null
    if (address) {
      try {
        console.log('[WC TIMING] syncSessionToStore: Requesting bch_getPublicKey...')
        const pkStart = performance.now()
        const pubKeyResult = await client.request({
          chainId,
          topic: session.topic,
          request: { method: 'bch_getPublicKey', params: {} },
        })
        console.log(
          `[WC TIMING] syncSessionToStore: bch_getPublicKey took ${(performance.now() - pkStart).toFixed(2)}ms`,
        )
        if (pubKeyResult && typeof pubKeyResult === 'string') {
          publicKey = pubKeyResult
        }
      } catch {
        console.log('[WC TIMING] syncSessionToStore: bch_getPublicKey not supported (optional)')
        // Method not supported - that's okay, we'll work with address only
      }
    }

    if (address) {
      const commitStart = performance.now()
      store.commit('wallet/SET_WALLET', {
        address,
        publicKey,
        privateKey: null,
      })
      console.log(
        `[WC TIMING] syncSessionToStore: Store commit took ${(performance.now() - commitStart).toFixed(2)}ms`,
      )
      console.log(
        `[WC TIMING] syncSessionToStore: TOTAL ${(performance.now() - syncStart).toFixed(2)}ms`,
      )
    } else {
      console.warn('DEBUG: No address retrieved from wallet')
    }
  } catch (e) {
    console.warn('WalletConnect: could not get addresses', e)
  }
}

async function restoreSessionIfAny(store) {
  if (!store) return
  try {
    const client = await getSignClient(store)
    const sessions = client.session.getAll()
    const bchSession = sessions.find((s) => s.namespaces?.bch?.accounts?.length)

    if (bchSession && bchSession.expiry * 1000 > Date.now()) {
      // Check if session has required methods
      const methods = bchSession.namespaces?.bch?.methods ?? []
      const hasRequiredMethods = REQUIRED_METHODS.every((m) => methods.includes(m))

      if (hasRequiredMethods) {
        currentSession = bchSession
        await syncSessionToStore(store, client, bchSession)
      } else {
        // Clean up invalid session
        await client.disconnect({ topic: bchSession.topic })
      }
    } else if (bchSession) {
      // Clean up expired session
      await client.disconnect({ topic: bchSession.topic })
    }
  } catch (e) {
    console.debug('WalletConnect session restore failed:', e)
  }
}

export default boot(({ app }) => {
  const store = app.config.globalProperties.$store
  if (!store) {
    console.warn('WalletConnect boot: Vuex store not available yet')
    return
  }
  const wc = initializeWalletConnect(store)
  app.config.globalProperties.$walletConnect = wc
  app.provide('walletConnect', wc)
  restoreSessionIfAny(store)
})
