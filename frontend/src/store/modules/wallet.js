/**
 * Vuex wallet module: persistent wallet state across the app.
 * State: address, publicKey, privateKey (from generated wallet).
 */

function loadPersistedWallet() {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem('hodl-vault-wallet')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return {
      address: parsed.address ?? null,
      publicKey: parsed.publicKey ?? null,
      privateKey: null,
    }
  } catch {
    return null
  }
}

const persisted = loadPersistedWallet()

const state = {
  address: persisted?.address ?? null,
  addresses: persisted?.addresses ?? [],
  publicKey: persisted?.publicKey ?? null,
  privateKey: persisted?.privateKey ?? null,
}

const mutations = {
  SET_WALLET(state, payload) {
    const oldAddr = state.address
    state.address = payload.address ?? null
    state.addresses = Array.isArray(payload.addresses) ? payload.addresses : (state.address ? [state.address] : [])
    state.publicKey = payload.publicKey ?? null
    state.privateKey = payload.privateKey ?? null
    console.log(`[BAL_TRACE] Vuex SET_WALLET | oldAddress: "${oldAddr}" → newAddress: "${state.address}" | addresses count=${state.addresses.length}`)
    if (typeof localStorage !== 'undefined') {
      try {
        if (state.address || state.publicKey) {
          localStorage.setItem(
            'hodl-vault-wallet',
            JSON.stringify({
              address: state.address,
              addresses: state.addresses,
              publicKey: state.publicKey,
            }),
          )
        } else {
          localStorage.removeItem('hodl-vault-wallet')
        }
      } catch {
        // ignore persistence errors
      }
    }
  },
  SET_PUBLIC_KEY(state, publicKey) {
    state.publicKey = publicKey ?? null
    if (typeof localStorage !== 'undefined') {
      try {
        if (state.address || state.publicKey) {
          localStorage.setItem(
            'hodl-vault-wallet',
            JSON.stringify({
              address: state.address,
              addresses: state.addresses,
              publicKey: state.publicKey,
            }),
          )
        }
      } catch {
        // ignore persistence errors
      }
    }
  },
  CLEAR_WALLET(state) {
    state.address = null
    state.publicKey = null
    state.privateKey = null
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('hodl-vault-wallet')
      } catch {
        // ignore persistence errors
      }
    }
  },
}

const actions = {
  loginUser({ commit, dispatch }, walletData) {
    commit('SET_WALLET', walletData)
    // Clear any stale vault data from previous session, then sync with backend
    dispatch('clearLocalVaultData')
    dispatch('syncWithBackend')
  },
  clearWallet({ commit, dispatch }) {
    dispatch('clearLocalVaultData')
    commit('CLEAR_WALLET')
  },

  /**
   * Clear stale vault data from localStorage when switching wallets
   */
  async clearLocalVaultData() {
    try {
      const { vaultStorage } = await import('src/services/vault-storage')
      vaultStorage.clearLocalVaultData()
      console.log('Local vault data cleared for wallet switch')
    } catch {
      // vaultStorage may not be needed if wallet is being cleared
    }
  },

  /**
   * Sync vaults with backend after wallet connection
   * Backend is the single source of truth — no localStorage caching.
   */
  async syncWithBackend({ state }) {
    if (!state.address) {
      console.log('No wallet address, skipping backend sync')
      return
    }

    try {
      const { vaultStorage } = await import('src/services/vault-storage')

      // Fetch vaults from backend for the connected wallet
      console.log('Fetching vaults from backend for:', state.address)
      const backendVaults = await vaultStorage.getVaultsByWallet(state.address)
      console.log(`Fetched ${backendVaults.length} vaults from backend`)

      return backendVaults
    } catch (error) {
      console.error('Backend sync failed:', error.message || error)
      // Don't fall back to localStorage — show error state in UI
      return []
    }
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
