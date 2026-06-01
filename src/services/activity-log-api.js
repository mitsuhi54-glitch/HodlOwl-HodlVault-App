function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomHex(len = 16) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

const MOCK_HISTORY = [
  {
    _id: 'log_1',
    walletAddress: 'bitcoincash:qpm2qsr795...',
    activityType: 'VAULT_CREATED',
    vaultId: 'mock_vault_1',
    vaultName: 'First Hodl Vault',
    contractAddress: 'bitcoincash:mock_contract_1',
    details: 'Created vault with price target ₱50,000',
    status: 'completed',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'log_2',
    walletAddress: 'bitcoincash:qpm2qsr795...',
    activityType: 'DEPOSIT',
    vaultId: 'mock_vault_1',
    vaultName: 'First Hodl Vault',
    contractAddress: 'bitcoincash:mock_contract_1',
    details: 'Deposited 0.5 BCH into vault',
    status: 'completed',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    _id: 'log_3',
    walletAddress: 'bitcoincash:qpm2qsr795...',
    activityType: 'WITHDRAWAL',
    vaultId: 'mock_vault_2',
    vaultName: 'Long Term Hold',
    contractAddress: 'bitcoincash:mock_contract_2',
    details: 'Price target reached — vault auto-withdrew 0.25 BCH',
    status: 'completed',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: 'log_4',
    walletAddress: 'bitcoincash:qpm2qsr795...',
    activityType: 'AUTO_WITHDRAWAL_ENABLED',
    vaultId: 'mock_vault_3',
    vaultName: 'Stacking Sats',
    contractAddress: 'bitcoincash:mock_contract_3',
    details: 'Auto-withdrawal enabled at ₱25,000 target',
    status: 'completed',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    _id: 'log_5',
    walletAddress: 'bitcoincash:qpm2qsr795...',
    activityType: 'DEPOSIT',
    vaultId: 'mock_vault_3',
    vaultName: 'Stacking Sats',
    contractAddress: 'bitcoincash:mock_contract_3',
    details: 'Deposited 1.0 BCH into vault',
    status: 'completed',
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
]

export const activityLogApi = {
  async getHistory(limit = 50, skip = 0, activityType = null) {
    await delay()
    let logs = [...MOCK_HISTORY]
    if (activityType) {
      logs = logs.filter((l) => l.activityType === activityType)
    }
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    const paginated = logs.slice(skip, skip + limit)
    return { success: true, logs: paginated, total: logs.length }
  },

  async getStats() {
    await delay()
    return {
      success: true,
      stats: {
        totalActivities: 142,
        vaultsCreated: 12,
        deposits: 85,
        withdrawals: 3,
        autoWithdrawals: 2,
      },
    }
  },

  async logWithdrawal(data) {
    await delay()
    return { success: true, log: { _id: `log_${randomHex()}`, ...data, timestamp: new Date().toISOString() } }
  },

  async logDeposit(data) {
    await delay()
    return { success: true, log: { _id: `log_${randomHex()}`, ...data, timestamp: new Date().toISOString() } }
  },

  async watchDeposit(data) {
    await delay()
    return { success: true, message: 'Watching for deposit' }
  },

  async stopWatchingDeposit(contractAddress) {
    await delay()
    return { success: true, message: 'Stopped watching deposit' }
  },
}

export default activityLogApi
