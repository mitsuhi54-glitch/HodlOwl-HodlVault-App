/**
 * Electrum Subscriber Service
 * Maintains a persistent WebSocket connection to an Electrum server
 * and subscribes to blockchain headers. When a new block arrives,
 * triggers immediate deposit checking — no polling delay.
 *
 * Falls back gracefully: if WebSocket fails, the existing polling cron
 * continues as before.
 */

import { ElectrumClient } from '@electrum-cash/network'
import crypto from 'crypto'

const BCH_NETWORK = process.env.BCH_NETWORK || 'chipnet'

// Map network to Electrum server hostname + port
const ELECTRUM_SERVERS = {
  mainnet: { host: 'bch.imaginary.cash', port: 50004, encrypted: true },
  chipnet: { host: 'chipnet.bch.ninja', port: 50004, encrypted: true },
  testnet3: { host: 'testnet.imaginary.cash', port: 50004, encrypted: true },
  testnet4: { host: 'testnet4.imaginary.cash', port: 50004, encrypted: true },
}

let client = null
let onNewBlockCallback = null
let isConnected = false
let reconnectTimer = null

/**
 * Convert a P2SH20 address to an Electrum scripthash.
 * scripthash = reverse(sha256(sha256(script)))
 * For P2SH: script = 0xa9 + hash160(20 bytes) + 0x87
 * @param {string} scriptHex - The script hex
 * @returns {string} Reversed double-sha256 hash
 */
function scriptHexToScripthash(scriptHex) {
  const hash = crypto.createHash('sha256').update(Buffer.from(scriptHex, 'hex')).digest()
  const doubleHash = crypto.createHash('sha256').update(hash).digest()
  return Buffer.from(doubleHash).reverse().toString('hex')
}

/**
 * Decode a base58 P2SH address to its hash160 hex.
 * P2SH addresses start with '2' on mainnet, '2M' or 'chipnet:' etc.
 * @param {string} address
 * @returns {string} 40-char hex hash160
 */
function p2shAddressToScriptHex(address) {
  // Remove network prefix if present
  const cleanAddr = address.includes(':') ? address.split(':')[1] : address

  // Base58 decode
  const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let num = 0n
  for (const char of cleanAddr) {
    num = num * 58n + BigInt(BASE58_ALPHABET.indexOf(char))
  }

  let hex = num.toString(16)
  // Pad to even length
  if (hex.length % 2) hex = '0' + hex
  // Decoded: version(1) + hash160(20) + checksum(4) = 25 bytes = 50 hex chars
  // Extract hash160: skip version byte and take 20 bytes (40 hex chars)
  const hash160 = hex.substring(2, 42)

  // P2SH script: OP_HASH160 a9 + hash160 + OP_EQUAL 87
  return 'a9' + hash160 + '87'
}

/**
 * Subscribe to scripthash changes for a watched contract address.
 * When a deposit arrives, the callback fires immediately.
 * @param {string} contractAddress - P2SH20 contract address
 */
export async function subscribeAddress(contractAddress) {
  if (!client || !isConnected) return false
  try {
    const scriptHex = p2shAddressToScriptHex(contractAddress)
    const scripthash = scriptHexToScripthash(scriptHex)
    await client.subscribe('blockchain.scripthash.subscribe', scripthash)
    console.log(`[ElectrumSub] Subscribed to scripthash for ${contractAddress}`)
    return true
  } catch (error) {
    console.warn(`[ElectrumSub] Failed to subscribe ${contractAddress}: ${error?.message ?? error ?? 'Unknown error'}`)
    return false
  }
}

/**
 * Unsubscribe from scripthash changes for a contract address.
 * @param {string} contractAddress - P2SH20 contract address
 */
export async function unsubscribeAddress(contractAddress) {
  if (!client || !isConnected) return false
  try {
    const scriptHex = p2shAddressToScriptHex(contractAddress)
    const scripthash = scriptHexToScripthash(scriptHex)
    await client.unsubscribe('blockchain.scripthash.subscribe', scripthash)
    console.log(`[ElectrumSub] Unsubscribed from scripthash for ${contractAddress}`)
    return true
  } catch (error) {
    console.warn(`[ElectrumSub] Failed to unsubscribe ${contractAddress}: ${error?.message ?? error ?? 'Unknown error'}`)
    return false
  }
}

/**
 * Register a callback to fire when a deposit notification arrives.
 * The callback receives (contractAddress, txid, vout, satoshis).
 * @param {function} callback
 */
export function onDepositNotification(callback) {
  onNewBlockCallback = callback
}

/**
 * Start the Electrum WebSocket connection and subscription.
 * @returns {Promise<boolean>} true if connected successfully
 */
export async function startElectrumSubscriber() {
  const server = ELECTRUM_SERVERS[BCH_NETWORK] || ELECTRUM_SERVERS.chipnet

  try {
    // Pass hostname only — ElectrumClient constructs wss://hostname:port internally
    client = new ElectrumClient('HodlVault', '1.4.1', server.host, {
      sendKeepAliveIntervalInMilliSeconds: 30000,
      reconnectAfterMilliSeconds: 5000,
    })

    client.on('connected', () => {
      isConnected = true
      console.log(`[ElectrumSub] ✅ Connected to ${server.host}:${server.port}`)
    })

    client.on('disconnected', () => {
      isConnected = false
      console.log('[ElectrumSub] Disconnected — will auto-reconnect')
    })

    client.on('error', (err) => {
      console.warn(`[ElectrumSub] Connection error: ${err.message}`)
    })

    // Handle subscription notifications (scripthash changes = deposits)
    client.on('notification', (message) => {
      if (message.method === 'blockchain.scripthash.subscribe') {
        const [scripthash, status] = message.params || []
        if (status && onNewBlockCallback) {
          // We can't reverse-map scripthash → address here easily,
          // so we trigger the full deposit check instead
          onNewBlockCallback('scripthash')
        }
      }
    })

    await client.connect()
    console.log(`[ElectrumSub] Connected to ${server.host}:${server.port}`)

    // Subscribe to block headers as additional trigger
    await client.subscribe('blockchain.headers.subscribe')
    console.log('[ElectrumSub] Subscribed to blockchain headers')

    return true
  } catch (error) {
    console.warn(`[ElectrumSub] Failed to connect: ${error?.message ?? error ?? 'Unknown error'}`)
    console.log('[ElectrumSub] Will rely on fallback polling')
    return false
  }
}

/**
 * Stop the Electrum WebSocket connection.
 */
export async function stopElectrumSubscriber() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (client) {
    try {
      await client.disconnect()
    } catch { }
    client = null
  }
  isConnected = false
  console.log('[ElectrumSub] Stopped')
}

/**
 * Check if the Electrum subscriber is connected.
 */
export function isSubscriberConnected() {
  return isConnected
}
