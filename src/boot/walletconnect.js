import { boot } from 'quasar/wrappers'

const DEMO_ADDRESS = 'bitcoincash:qpm2qsr7959qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'
const DEMO_PUBLIC_KEY = '02891f242b141f43f0c983ad00a1bebb3578f092d7c7051c5b4415cf80ff609f90'

let storeRef = null

export function initializeWalletConnect(store) {
  storeRef = store
  return {
    async connect(onModalOpen) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      if (onModalOpen) onModalOpen()
      store.commit('wallet/SET_WALLET', {
        address: DEMO_ADDRESS,
        addresses: [DEMO_ADDRESS],
        publicKey: DEMO_PUBLIC_KEY,
        privateKey: null,
      })
      return DEMO_ADDRESS
    },
    async disconnect() { if (storeRef) storeRef.commit('wallet/CLEAR_WALLET') },
    isConnected() { return !!(storeRef?.state?.wallet?.address) },
    getAddress() { return storeRef?.state?.wallet?.address ?? null },
    getSignatureTemplate() { return null },
    getOwnerPublicKeyHex() { return storeRef?.state?.wallet?.publicKey ?? null },
    getSessionTopic() { return 'mock-session-topic' },
    getChainId() { return 'bch:bitcoincash' },
    async request(method, params) {
      if (method === 'bch_getAddresses') return [DEMO_ADDRESS]
      if (method === 'bch_getPublicKey') return DEMO_PUBLIC_KEY
      return { success: true }
    },
    async recoverPublicKey() { return DEMO_PUBLIC_KEY },
    resetConnectionState() {},
  }
}

export async function recoverPublicKey(store) {
  store.commit('wallet/SET_PUBLIC_KEY', DEMO_PUBLIC_KEY)
  return DEMO_PUBLIC_KEY
}

export async function recoverPublicKeyHash() {
  return 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0'
}

export async function restoreSessionIfAny(store) {}

export default boot(async ({ app }) => {
  const store = app.config.globalProperties.$store
  if (!store) return
  const wc = initializeWalletConnect(store)
  app.config.globalProperties.$walletConnect = wc
  app.provide('walletConnect', wc)
})
