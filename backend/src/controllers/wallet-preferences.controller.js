import { WalletPreferences } from '../models/wallet-preferences.model.js'
import { registerPlayerId, unregisterPlayerId } from '../services/onesignal.service.js'

/**
 * Get wallet preferences
 * If preferences don't exist, creates default preferences
 */
export const getWalletPreferences = async (req, res) => {
  try {
    const walletAddress = req.walletAddress || req.headers['x-wallet-address']

    if (!walletAddress) {
      return res.status(400).json({
        message: 'Wallet address is required',
        error: 'MISSING_WALLET_ADDRESS',
      })
    }

    const preferences = await WalletPreferences.getOrCreate(walletAddress)

    res.status(200).json({
      message: 'Wallet preferences retrieved successfully',
      walletAddress: preferences.walletAddress,
      oneSignalPlayerId: preferences.oneSignalPlayerId,
      preferences: preferences.preferences,
      createdAt: preferences.createdAt,
      updatedAt: preferences.updatedAt,
    })
  } catch (error) {
    console.error('Get wallet preferences error:', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
}

/**
 * Update wallet preferences
 */
export const updateWalletPreferences = async (req, res) => {
  try {
    const walletAddress = req.walletAddress || req.headers['x-wallet-address']
    const { preferences } = req.body

    if (!walletAddress) {
      return res.status(400).json({
        message: 'Wallet address is required',
        error: 'MISSING_WALLET_ADDRESS',
      })
    }

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        message: 'Preferences object is required',
        error: 'MISSING_PREFERENCES',
      })
    }

    const updatedPreferences = await WalletPreferences.updatePreferences(walletAddress, preferences)

    res.status(200).json({
      message: 'Wallet preferences updated successfully',
      walletAddress: updatedPreferences.walletAddress,
      preferences: updatedPreferences.preferences,
      updatedAt: updatedPreferences.updatedAt,
    })
  } catch (error) {
    console.error('Update wallet preferences error:', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
}

/**
 * Delete wallet preferences
 */
export const deleteWalletPreferences = async (req, res) => {
  try {
    const walletAddress = req.walletAddress || req.headers['x-wallet-address']

    if (!walletAddress) {
      return res.status(400).json({
        message: 'Wallet address is required',
        error: 'MISSING_WALLET_ADDRESS',
      })
    }

    const deleted = await WalletPreferences.deleteByWalletAddress(walletAddress)

    if (!deleted) {
      return res.status(404).json({
        message: 'Wallet preferences not found',
        error: 'PREFERENCES_NOT_FOUND',
      })
    }

    res.status(200).json({
      message: 'Wallet preferences deleted successfully',
      walletAddress: deleted.walletAddress,
    })
  } catch (error) {
    console.error('Delete wallet preferences error:', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
}

/**
 * Register OneSignal player ID for push notifications
 */
export const registerOneSignalPlayer = async (req, res) => {
  try {
    const walletAddress = req.walletAddress || req.headers['x-wallet-address']
    const { playerId } = req.body

    if (!walletAddress) {
      return res.status(400).json({
        message: 'Wallet address is required',
        error: 'MISSING_WALLET_ADDRESS',
      })
    }

    if (!playerId) {
      return res.status(400).json({
        message: 'Player ID is required',
        error: 'MISSING_PLAYER_ID',
      })
    }

    const preferences = await registerPlayerId(walletAddress, playerId)

    res.status(200).json({
      message: 'Player ID registered successfully',
      walletAddress: preferences.walletAddress,
      oneSignalPlayerId: preferences.oneSignalPlayerId,
    })
  } catch (error) {
    console.error('Register player ID error:', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
}

/**
 * Unregister OneSignal player ID (disable push notifications)
 */
export const unregisterOneSignalPlayer = async (req, res) => {
  try {
    const walletAddress = req.walletAddress || req.headers['x-wallet-address']

    if (!walletAddress) {
      return res.status(400).json({
        message: 'Wallet address is required',
        error: 'MISSING_WALLET_ADDRESS',
      })
    }

    const preferences = await unregisterPlayerId(walletAddress)

    res.status(200).json({
      message: 'Player ID unregistered successfully',
      walletAddress: preferences.walletAddress,
      oneSignalPlayerId: null,
    })
  } catch (error) {
    console.error('Unregister player ID error:', error)
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
}
