import { hexToBin } from '@bitauth/libauth'

export async function getAddressBalance(address) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return BigInt(Math.floor(Math.random() * 100000000) + 1000000)
}

export function initializeHodlVaultContract(ownerPkhHex, oraclePkHex, priceTarget, ownerAddress) {
  return {
    address: `bitcoincash:mock${Date.now().toString(36)}`,
    getUtxos: async () => [],
  }
}

export async function calculateContractAddress(ownerPkhHex, oraclePkHex, priceTarget, ownerAddress) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return `bitcoincash:mock${Date.now().toString(36)}`
}

export async function getContractBalance(contract) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return BigInt(Math.floor(Math.random() * 100000000))
}

export async function spendVault(contract, { ownerPkHex, ownerAddress }) {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const fakeTxId = 'mock_tx_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  return { txid: fakeTxId, success: true }
}

export async function depositToVault(toAddress, amountSats) {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  const fakeTxId = 'mock_deposit_' + Date.now().toString(36)
  return { txid: fakeTxId, success: true }
}

export async function simulateSpend(contract, { ownerPkHex, ownerAddress }) {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const fakeTxId = 'simulated_tx_' + Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('')
  return { txid: fakeTxId }
}
