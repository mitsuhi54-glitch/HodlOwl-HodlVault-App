import { WalletPreferences } from '../models/wallet-preferences.model.js'
import { registerPlayerId, unregisterPlayerId } from '../services/onesignal.service.js'

function log(tag, msg, data) {
  const prefix = `[NotifDebug:backend:wallet-prefs-ctrl]`
  if (data !== undefined) {
    console.log(`${prefix} ${tag} — ${msg}`, data)
  } else {
    console.log(`${prefix} ${tag} — ${msg}`)
  }
}

function warn(tag, msg, err) {
  console.warn(`[NotifDebug:backend:wallet-prefs-ctrl] ${tag} — ${msg}`, err || '')
}

export const getWalletPreferences = async (req, res) => {
  const walletAddress = req.walletAddress || req.headers['x-wallet-address']
  log('GET', `>>> GET /wallet/preferences | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'}`)

  try {
    if (!walletAddress) {
      log('GET', 'Missing wallet address — 400')
      return res.status(400).json({ message: 'Wallet address is required', error: 'MISSING_WALLET_ADDRESS' })
    }

    const preferences = await WalletPreferences.getOrCreate(walletAddress)
    log('GET', `Preferences retrieved/created | hasPlayerId=${!!preferences.oneSignalPlayerId} | notifications=${preferences.preferences?.notifications}`)

    const response = {
      message: 'Wallet preferences retrieved successfully',
      walletAddress: preferences.walletAddress,
      oneSignalPlayerId: preferences.oneSignalPlayerId,
      preferences: preferences.preferences,
      createdAt: preferences.createdAt,
      updatedAt: preferences.updatedAt,
    }
    log('GET', `<<< 200 OK | response=${JSON.stringify({ ...response, oneSignalPlayerId: response.oneSignalPlayerId ? '****' : null })}`)
    res.status(200).json(response)
  } catch (error) {
    warn('GET', `Error: ${error.message}`, error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

export const updateWalletPreferences = async (req, res) => {
  const walletAddress = req.walletAddress || req.headers['x-wallet-address']
  const { preferences: prefsBody } = req.body
  log('PUT', `>>> PUT /wallet/preferences | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'} | body=${JSON.stringify(prefsBody)}`)

  try {
    if (!walletAddress) {
      log('PUT', 'Missing wallet address — 400')
      return res.status(400).json({ message: 'Wallet address is required', error: 'MISSING_WALLET_ADDRESS' })
    }

    if (!prefsBody || typeof prefsBody !== 'object') {
      log('PUT', 'Missing/invalid preferences body — 400')
      return res.status(400).json({ message: 'Preferences object is required', error: 'MISSING_PREFERENCES' })
    }

    const updatedPreferences = await WalletPreferences.updatePreferences(walletAddress, prefsBody)
    log('PUT', `Preferences updated | notifications=${updatedPreferences.preferences?.notifications} | autoWithdrawal=${updatedPreferences.preferences?.autoWithdrawal}`)

    const response = {
      message: 'Wallet preferences updated successfully',
      walletAddress: updatedPreferences.walletAddress,
      preferences: updatedPreferences.preferences,
      updatedAt: updatedPreferences.updatedAt,
    }
    log('PUT', `<<< 200 OK`)
    res.status(200).json(response)
  } catch (error) {
    warn('PUT', `Error: ${error.message}`, error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

export const deleteWalletPreferences = async (req, res) => {
  const walletAddress = req.walletAddress || req.headers['x-wallet-address']
  log('DEL', `>>> DELETE /wallet/preferences | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'}`)

  try {
    if (!walletAddress) {
      log('DEL', 'Missing wallet address — 400')
      return res.status(400).json({ message: 'Wallet address is required', error: 'MISSING_WALLET_ADDRESS' })
    }

    const deleted = await WalletPreferences.deleteByWalletAddress(walletAddress)

    if (!deleted) {
      log('DEL', 'Preferences not found — 404')
      return res.status(404).json({ message: 'Wallet preferences not found', error: 'PREFERENCES_NOT_FOUND' })
    }

    log('DEL', `<<< 200 OK | deleted for ${deleted.walletAddress}`)
    res.status(200).json({ message: 'Wallet preferences deleted successfully', walletAddress: deleted.walletAddress })
  } catch (error) {
    warn('DEL', `Error: ${error.message}`, error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

export const registerOneSignalPlayer = async (req, res) => {
  const walletAddress = req.walletAddress || req.headers['x-wallet-address']
  const { playerId } = req.body
  log('REG', `>>> POST /onesignal/register | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'} | playerId=${playerId ? playerId.slice(0, 16) + '...' : 'null'}`)

  try {
    if (!walletAddress) {
      log('REG', 'Missing wallet address — 400')
      return res.status(400).json({ message: 'Wallet address is required', error: 'MISSING_WALLET_ADDRESS' })
    }

    if (!playerId) {
      log('REG', 'Missing playerId in body — 400')
      return res.status(400).json({ message: 'Player ID is required', error: 'MISSING_PLAYER_ID' })
    }

    log('REG', `Calling registerPlayerId service`)
    const preferences = await registerPlayerId(walletAddress, playerId)
    log('REG', `Service returned | registeredId=${preferences?.oneSignalPlayerId ? preferences.oneSignalPlayerId.slice(0, 16) + '...' : 'null'}`)

    log('REG', `<<< 200 OK`)
    res.status(200).json({
      message: 'Player ID registered successfully',
      walletAddress: preferences.walletAddress,
      oneSignalPlayerId: preferences.oneSignalPlayerId,
    })
  } catch (error) {
    warn('REG', `Error: ${error.message}`, error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

export const unregisterOneSignalPlayer = async (req, res) => {
  const walletAddress = req.walletAddress || req.headers['x-wallet-address']
  log('UNREG', `>>> POST /onesignal/unregister | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'}`)

  try {
    if (!walletAddress) {
      log('UNREG', 'Missing wallet address — 400')
      return res.status(400).json({ message: 'Wallet address is required', error: 'MISSING_WALLET_ADDRESS' })
    }

    log('UNREG', `Calling unregisterPlayerId service`)
    const preferences = await unregisterPlayerId(walletAddress)
    log('UNREG', `Service returned | playerIdNow=${preferences?.oneSignalPlayerId}`)

    log('UNREG', `<<< 200 OK`)
    res.status(200).json({
      message: 'Player ID unregistered successfully',
      walletAddress: preferences.walletAddress,
      oneSignalPlayerId: null,
    })
  } catch (error) {
    warn('UNREG', `Error: ${error.message}`, error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}
