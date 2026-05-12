/**
 * Vault Storage Service
 * Manages multiple vaults per wallet using backend API as the single source of truth.
 * No localStorage caching — always fetches fresh data from the backend.
 */

import { vaultApi } from './api.service.js'

class VaultStorageService {
  constructor() {
    this.storageKey = 'hodl-vault-all-vaults'
    this.legacyKey = 'hodl-vault-active-vault'
  }

  /**
   * Generate a unique vault ID
   * @returns {string} Unique vault identifier
   */
  generateVaultId() {
    return 'vault_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * Save a new vault to backend
   * @param {Object} vaultData - Vault information
   * @returns {Promise<Object>} Saved vault
   */
  async saveVault(vaultData) {
    try {
      const result = await vaultApi.createVault(vaultData)
      console.log('Vault saved to backend:', result.vault)
      return result.vault
    } catch (error) {
      console.error('Backend vault save failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      throw new Error(
        `Failed to save vault: ${error.response?.data?.message || error.message}`,
      )
    }
  }

  /**
   * Get vaults for a specific wallet from backend
   * @param {string} walletAddress - Wallet address to filter by
   * @returns {Promise<Array>} Array of vault objects for the wallet
   */
  async getVaultsByWallet(walletAddress) {
    if (!walletAddress) return []

    try {
      const result = await vaultApi.getVaultsByWallet(walletAddress)
      console.log(
        `Vaults loaded from backend for ${walletAddress}:`,
        result.vaults?.length || 0,
      )
      return result.vaults || []
    } catch (error) {
      console.error('Failed to load vaults from backend:', error.message || error)
      throw new Error(
        `Unable to load vaults — backend offline: ${error.response?.data?.message || error.message}`,
      )
    }
  }

  /**
   * Fetch a specific vault by contract address from backend
   * @param {string} contractAddress - Contract address of the vault
   * @returns {Promise<Object|null>} Vault object or null if not found
   */
  async getVaultByContractAddressFromBackend(contractAddress) {
    if (!contractAddress) return null

    try {
      console.log('Fetching vault by contract address from backend:', contractAddress)
      const result = await vaultApi.getVaultByContractAddress(contractAddress)
      console.log('Vault found:', result.vault?.contractAddress)
      return result.vault || null
    } catch (error) {
      console.error('Failed to fetch vault from backend:', error.message || error)
      throw new Error(
        `Unable to load vault — backend offline: ${error.response?.data?.message || error.message}`,
      )
    }
  }

  /**
   * Update vault balance on backend
   * @param {string} contractAddress - Contract address of the vault
   * @param {number} balance - New balance in satoshis
   */
  async updateVaultBalance(contractAddress, balance) {
    const balanceNumber = Number(balance)

    try {
      await vaultApi.updateVaultBalance(contractAddress, balanceNumber)
      console.log('Vault balance updated in backend:', {
        contractAddress,
        balance: balanceNumber,
      })
    } catch (error) {
      console.warn('Failed to update balance in backend:', error.message || error)
    }
  }

  /**
   * Update vault properties on backend
   * @param {string} contractAddress - Contract address of the vault to update
   * @param {Object} updates - Object containing properties to update
   */
  async updateVault(contractAddress, updates) {
    // First find the vault by contract address to get its _id
    try {
      const vault = await this.getVaultByContractAddressFromBackend(contractAddress)
      if (vault && vault._id) {
        await vaultApi.updateVault(vault._id, updates)
        console.log('Vault updated in backend:', { contractAddress, updates })
      }
    } catch (error) {
      console.warn('Failed to update vault in backend:', error.message || error)
    }
  }

  /**
   * Delete a vault from backend
   * @param {string} contractAddress - Contract address of the vault to delete
   * @param {string} vaultId - Vault ID (required for backend deletion)
   */
  async deleteVault(contractAddress, vaultId) {
    if (!vaultId) {
      throw new Error('Vault ID is required for deletion')
    }

    try {
      await vaultApi.deleteVault(vaultId)
      console.log('Vault deleted from backend:', contractAddress)
    } catch (error) {
      console.error('Backend delete failed:', {
        vaultId,
        contractAddress,
        error: error.response?.data || error.message,
        status: error.response?.status,
      })
      throw new Error(
        `Backend delete failed: ${error.response?.data?.message || error.message}`,
      )
    }
  }

  /**
   * Clear all vault localStorage keys (to be called on wallet disconnect/switch)
   */
  clearLocalVaultData() {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.removeItem(this.storageKey)
      localStorage.removeItem(this.legacyKey)
      localStorage.removeItem('hodl-vault-selected-vault')
      console.log('All local vault data cleared')
    } catch {
      // ignore persistence errors
    }
  }
}

// Export singleton instance
export const vaultStorage = new VaultStorageService()
export default vaultStorage
