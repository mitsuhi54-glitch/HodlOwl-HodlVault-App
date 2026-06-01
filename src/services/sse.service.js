import store from '../store'

let mockInterval = null
let isConnecting = false

const MOCK_EVENT_TYPES = ['DEPOSIT_CONFIRMED', 'VAULT_WITHDRAWN', 'NEW_ACTIVITY']

const MOCK_EVENT_PAYLOADS = {
  DEPOSIT_CONFIRMED: () => ({
    type: 'DEPOSIT_CONFIRMED',
    contractAddress: 'bitcoincash:zr5v3q8s9j2t4m6p7k1h2f3d5g6h7j8k9l0q1w2e',
    amountSats: Math.floor(Math.random() * 50000000) + 1000000,
    txid: 'mock_tx_' + Date.now().toString(36),
    timestamp: new Date().toISOString(),
    message: 'Deposit confirmed — balance updated',
  }),
  VAULT_WITHDRAWN: () => ({
    type: 'VAULT_WITHDRAWN',
    contractAddress: 'bitcoincash:p9k2l3m4n5b6v7c8x9z1a2s3d4f5g6h7j8k0l1p2',
    amountSats: Math.floor(Math.random() * 100000000) + 10000000,
    txid: 'mock_tx_' + Date.now().toString(36),
    timestamp: new Date().toISOString(),
    message: 'Price target reached — vault withdrawn',
  }),
  NEW_ACTIVITY: () => ({
    type: 'NEW_ACTIVITY',
    activityType: ['VAULT_CREATED', 'DEPOSIT', 'AUTO_WITHDRAWAL_ENABLED'][Math.floor(Math.random() * 3)],
    vaultName: ['First Hodl Vault', 'Long Term Hold', 'Stacking Sats'][Math.floor(Math.random() * 3)],
    timestamp: new Date().toISOString(),
    message: 'New activity recorded',
  }),
}

function pushMockEvent() {
  const eventType = MOCK_EVENT_TYPES[Math.floor(Math.random() * MOCK_EVENT_TYPES.length)]
  const data = MOCK_EVENT_PAYLOADS[eventType]()
  handleSSEEvent(data)
}

export function connectSSE() {
  const walletAddress = store.state.wallet?.address
  if (!walletAddress) return

  disconnectSSE()
  isConnecting = true

  setTimeout(() => { isConnecting = false }, 500)

  const scheduleNext = () => {
    const delay = Math.random() * 15000 + 30000
    mockInterval = setTimeout(() => {
      pushMockEvent()
      scheduleNext()
    }, delay)
  }
  scheduleNext()
}

function handleSSEEvent(data) {
  switch (data.type) {
    case 'VAULT_WITHDRAWN':
      window.dispatchEvent(new CustomEvent('vault-withdrawn', { detail: data }))
      break
    case 'DEPOSIT_CONFIRMED':
      window.dispatchEvent(new CustomEvent('deposit-confirmed', { detail: data }))
      break
    case 'NEW_ACTIVITY':
      window.dispatchEvent(new CustomEvent('new-activity', { detail: data }))
      break
  }
}

export function disconnectSSE() {
  if (mockInterval) {
    clearTimeout(mockInterval)
    mockInterval = null
  }
  isConnecting = false
}

export function isSSEConnected() {
  return !isConnecting
}
