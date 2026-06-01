const MOCK_WALLET = 'bitcoincash:qpm2qsr795qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'

const MOCK_VAULTS = [
  {
    _id: 'mock_vault_1',
    walletAddress: MOCK_WALLET,
    contractAddress: 'bitcoincash:zr5v3q8s9j2t4m6p7k1h2f3d5g6h7j8k9l0q1w2e',
    priceTargetCents: 5000000,
    balance: 50000000,
    name: 'First Hodl Vault',
    status: 'active',
    autoWithdrawal: true,
    ownerPkhHex: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
    oraclePkHex: '02891f242b141f43f0c983ad00a1bebb3578f092d7c7051c5b4415cf80ff609f90',
    originalFundingAddress: MOCK_WALLET,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock_vault_2',
    walletAddress: MOCK_WALLET,
    contractAddress: 'bitcoincash:p9k2l3m4n5b6v7c8x9z1a2s3d4f5g6h7j8k0l1p2',
    priceTargetCents: 10000000,
    balance: 25000000,
    name: 'Long Term Hold',
    status: 'active',
    autoWithdrawal: false,
    ownerPkhHex: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
    oraclePkHex: '02891f242b141f43f0c983ad00a1bebb3578f092d7c7051c5b4415cf80ff609f90',
    originalFundingAddress: MOCK_WALLET,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock_vault_3',
    walletAddress: MOCK_WALLET,
    contractAddress: 'bitcoincash:q8w9e0r1t2y3u4i5o6p7a8s9d0f1g2h3j4k5l6z7',
    priceTargetCents: 2500000,
    balance: 100000000,
    name: 'Stacking Sats',
    status: 'active',
    autoWithdrawal: true,
    ownerPkhHex: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    oraclePkHex: '02891f242b141f43f0c983ad00a1bebb3578f092d7c7051c5b4415cf80ff609f90',
    originalFundingAddress: MOCK_WALLET,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const MOCK_PREFERENCES = {
  _id: 'mock_prefs_1',
  walletAddress: MOCK_WALLET,
  profileName: 'Demo Hodler',
  avatarSeed: 'hodlvault-demo',
  email: 'demo@example.com',
  emailVerified: true,
  oneSignalPlayerId: 'mock-onesignal-id',
  preferences: {
    autoWithdrawal: true,
    notifications: true,
    emailNotifications: true,
    defaultOracle: 'generalprotocols',
    theme: 'dark',
  },
}

let vaultIdCounter = 3

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export const vaultApi = {
  async getVaults(params = {}) {
    await delay()
    let vaults = clone(MOCK_VAULTS)
    if (params.status) {
      vaults = vaults.filter((v) => v.status === params.status)
    }
    return { success: true, vaults, total: vaults.length, page: 1, limit: 50 }
  },

  async createVault(vaultData) {
    await delay(500)
    vaultIdCounter++
    const newVault = {
      _id: `mock_vault_${vaultIdCounter}`,
      walletAddress: vaultData.walletAddress || MOCK_WALLET,
      contractAddress: vaultData.contractAddress || `bitcoincash:mock${vaultIdCounter}${Date.now().toString(36)}`,
      priceTargetCents: vaultData.priceTargetCents,
      balance: 0,
      name: vaultData.name || 'New Vault',
      status: 'active',
      autoWithdrawal: false,
      ownerPkhHex: vaultData.ownerPkhHex || 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
      oraclePkHex: vaultData.oraclePkHex || '02891f242b141f43f0c983ad00a1bebb3578f092d7c7051c5b4415cf80ff609f90',
      originalFundingAddress: vaultData.originalFundingAddress || MOCK_WALLET,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    MOCK_VAULTS.push(newVault)
    return { success: true, vault: newVault }
  },

  async getVaultById(id) {
    await delay()
    const vault = MOCK_VAULTS.find((v) => v._id === id)
    if (!vault) throw new Error('Vault not found')
    return { success: true, vault: clone(vault) }
  },

  async updateVault(id, data) {
    await delay()
    const idx = MOCK_VAULTS.findIndex((v) => v._id === id)
    if (idx === -1) throw new Error('Vault not found')
    Object.assign(MOCK_VAULTS[idx], data, { updatedAt: new Date().toISOString() })
    return { success: true, vault: clone(MOCK_VAULTS[idx]) }
  },

  async deleteVault(id) {
    await delay()
    const idx = MOCK_VAULTS.findIndex((v) => v._id === id)
    if (idx === -1) throw new Error('Vault not found')
    MOCK_VAULTS.splice(idx, 1)
    return { success: true, message: 'Vault deleted' }
  },

  async checkDuplicate(walletAddress, priceTargetCents) {
    await delay()
    const existing = MOCK_VAULTS.find(
      (v) => v.walletAddress === walletAddress && v.priceTargetCents === priceTargetCents && v.status === 'active',
    )
    return { success: true, isDuplicate: !!existing, vault: existing ? clone(existing) : null }
  },

  async updateVaultBalance(contractAddress, balance) {
    await delay()
    const vault = MOCK_VAULTS.find((v) => v.contractAddress === contractAddress)
    if (vault) {
      vault.balance = balance
      vault.updatedAt = new Date().toISOString()
    }
    return { success: true, vault: vault ? clone(vault) : null }
  },

  async getVaultStats(walletAddress) {
    await delay()
    const vaults = MOCK_VAULTS.filter((v) => v.walletAddress === walletAddress)
    const totalLocked = vaults.reduce((sum, v) => sum + v.balance, 0)
    return {
      success: true,
      stats: {
        totalVaults: vaults.length,
        totalLockedSats: totalLocked,
        activeVaults: vaults.filter((v) => v.status === 'active').length,
        withdrawnVaults: vaults.filter((v) => v.status === 'withdrawn').length,
        totalLockedBCH: (totalLocked / 100000000).toFixed(8),
      },
    }
  },

  async getVaultsByWallet(walletAddress, params = {}) {
    await delay()
    let vaults = clone(MOCK_VAULTS.filter((v) => v.walletAddress === walletAddress))
    if (params.status) {
      vaults = vaults.filter((v) => v.status === params.status)
    }
    return { success: true, vaults, total: vaults.length }
  },

  async getVaultByContractAddress(contractAddress) {
    await delay()
    const vault = MOCK_VAULTS.find((v) => v.contractAddress === contractAddress)
    return { success: true, vault: vault ? clone(vault) : null }
  },

  async toggleAutoWithdrawal(id, autoWithdrawal) {
    await delay()
    const idx = MOCK_VAULTS.findIndex((v) => v._id === id)
    if (idx === -1) throw new Error('Vault not found')
    MOCK_VAULTS[idx].autoWithdrawal = autoWithdrawal
    MOCK_VAULTS[idx].updatedAt = new Date().toISOString()
    return { success: true, vault: clone(MOCK_VAULTS[idx]) }
  },

  async getWalletBalance(address) {
    await delay()
    return { success: true, address, balanceSats: 50000000 }
  },

  async getAggregateWalletBalance(addresses) {
    await delay()
    return 175000000
  },

  async getGlobalStats(limit = 10, walletAddress = null) {
    await delay()
    return {
      success: true,
      stats: {
        totalVaults: 1427,
        totalValueLocked: 52300000000,
        activeUsers: 892,
      },
      rankings: {
        byVaultCount: [
          { walletAddress: 'bitcoincash:qpm2qsr795...', count: 12, rank: 1 },
          { walletAddress: 'bitcoincash:qqqqqqqq...', count: 8, rank: 2 },
        ],
        byTotalLocked: [
          { walletAddress: MOCK_WALLET, totalSats: 175000000, rank: 1 },
          { walletAddress: 'bitcoincash:qtest...', totalSats: 100000000, rank: 2 },
        ],
      },
    }
  },
}

export const preferencesApi = {
  async getPreferences() {
    await delay()
    return { success: true, ...clone(MOCK_PREFERENCES) }
  },

  async updatePreferences(preferences) {
    await delay()
    Object.assign(MOCK_PREFERENCES.preferences, preferences.preferences || preferences)
    return { success: true, ...clone(MOCK_PREFERENCES) }
  },

  async deletePreferences() {
    await delay()
    return { success: true, message: 'Preferences deleted' }
  },
}

export async function checkBackendHealth() {
  await delay(200)
  return true
}

export const apiClient = {
  get: async () => ({ data: { success: true } }),
  post: async () => ({ data: { success: true } }),
  put: async () => ({ data: { success: true } }),
  delete: async () => ({ data: { success: true } }),
  interceptors: {
    request: { use: () => {}, eject: () => {} },
    response: { use: () => {}, eject: () => {} },
  },
  defaults: { headers: { common: {} } },
}

export default {
  vault: vaultApi,
  preferences: preferencesApi,
  checkHealth: checkBackendHealth,
  client: apiClient,
}
