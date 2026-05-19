import { WalletPreferences } from '../models/wallet-preferences.model.js'
import { registerPlayerId, unregisterPlayerId } from '../services/onesignal.service.js'
import { registerEmail, unregisterEmail, verifyEmailCode, resendVerificationCode } from '../services/email.service.js'

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
      email: preferences.email,
      emailVerified: preferences.emailVerified || false,
      preferences: preferences.preferences,
      createdAt: preferences.createdAt,
      updatedAt: preferences.updatedAt,
    }
    log('GET', `<<< 200 OK | response=${JSON.stringify({ ...response, oneSignalPlayerId: response.oneSignalPlayerId ? '****' : null, email: response.email ? '****@' + response.email.split('@')[1] : null, emailVerified: response.emailVerified })}`)
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

export const registerEmailAddress = async (req, res) => {
  const walletAddress = req.walletAddress || req.headers['x-wallet-address']
  const { email } = req.body
  log('REG_EMAIL', `>>> POST /email/register | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'} | email=${email ? email.slice(0, 6) + '...' : 'null'}`)

  try {
    if (!walletAddress) {
      log('REG_EMAIL', 'Missing wallet address — 400')
      return res.status(400).json({ message: 'Wallet address is required', error: 'MISSING_WALLET_ADDRESS' })
    }

    if (!email || typeof email !== 'string') {
      log('REG_EMAIL', 'Missing/invalid email in body — 400')
      return res.status(400).json({ message: 'Valid email is required', error: 'MISSING_EMAIL' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      log('REG_EMAIL', 'Invalid email format — 400')
      return res.status(400).json({ message: 'Invalid email format', error: 'INVALID_EMAIL' })
    }

    log('REG_EMAIL', `Calling registerEmail service`)
    const result = await registerEmail(walletAddress, email)
    const prefs = result.preferences
    log('REG_EMAIL', `Service returned | storedEmail=${prefs?.email ? prefs.email.slice(0, 6) + '...' : 'null'} | verificationSent=${result.verificationSent}`)

    log('REG_EMAIL', `<<< 200 OK | message="Email registered. Verification code sent."`)
    res.status(200).json({
      message: 'Email registered. Verification code sent.',
      walletAddress: prefs.walletAddress,
      email: prefs.email,
      emailVerified: false,
      verificationSent: true,
    })
  } catch (error) {
    warn('REG_EMAIL', `Error: ${error.message}`, error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

export const unregisterEmailAddress = async (req, res) => {
  const walletAddress = req.walletAddress || req.headers['x-wallet-address']
  log('UNREG_EMAIL', `>>> POST /email/unregister | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'}`)

  try {
    if (!walletAddress) {
      log('UNREG_EMAIL', 'Missing wallet address — 400')
      return res.status(400).json({ message: 'Wallet address is required', error: 'MISSING_WALLET_ADDRESS' })
    }

    log('UNREG_EMAIL', `Calling unregisterEmail service`)
    const preferences = await unregisterEmail(walletAddress)
    log('UNREG_EMAIL', `Service returned | emailNow=${preferences?.email}`)

    log('UNREG_EMAIL', `<<< 200 OK`)
    res.status(200).json({
      message: 'Email unregistered successfully',
      walletAddress: preferences.walletAddress,
      email: null,
    })
  } catch (error) {
    warn('UNREG_EMAIL', `Error: ${error.message}`, error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

export const verifyEmailCodeHandler = async (req, res) => {
  const walletAddress = req.walletAddress || req.headers['x-wallet-address']
  const { code } = req.body
  log('VERIFY_EMAIL', `>>> POST /email/verify | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'} | code=${code}`)

  try {
    if (!walletAddress) {
      log('VERIFY_EMAIL', 'Missing wallet address — 400')
      return res.status(400).json({ message: 'Wallet address is required', error: 'MISSING_WALLET_ADDRESS' })
    }

    if (!code || typeof code !== 'string') {
      log('VERIFY_EMAIL', 'Missing/invalid code in body — 400')
      return res.status(400).json({ message: 'Verification code is required', error: 'MISSING_CODE' })
    }

    log('VERIFY_EMAIL', `Calling verifyEmailCode service`)
    const result = await verifyEmailCode(walletAddress, code)

    if (!result.success) {
      const statusMap = { not_found: 404, no_email: 400, no_code: 400, expired: 400, incorrect: 400 }
      const status = statusMap[result.reason] || 400
      const messageMap = {
        not_found: 'Wallet preferences not found',
        no_email: 'No email registered',
        no_code: 'No verification code found — register your email again',
        expired: 'Verification code has expired. Request a new one.',
        incorrect: 'Incorrect verification code',
      }
      log('VERIFY_EMAIL', `Verification failed | reason=${result.reason} — ${status}`)
      return res.status(status).json({ message: messageMap[result.reason] || 'Verification failed', error: result.reason })
    }

    if (result.alreadyVerified) {
      log('VERIFY_EMAIL', 'Email was already verified — 200')
      return res.status(200).json({ message: 'Email already verified', emailVerified: true })
    }

    log('VERIFY_EMAIL', `<<< 200 OK — email verified`)
    res.status(200).json({
      message: 'Email verified successfully',
      walletAddress: result.preferences.walletAddress,
      email: result.preferences.email,
      emailVerified: true,
    })
  } catch (error) {
    warn('VERIFY_EMAIL', `Error: ${error.message}`, error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

export const resendVerificationCodeHandler = async (req, res) => {
  const walletAddress = req.walletAddress || req.headers['x-wallet-address']
  log('RESEND_VERIFY', `>>> POST /email/resend | wallet=${walletAddress ? walletAddress.slice(0, 16) + '...' : 'null'}`)

  try {
    if (!walletAddress) {
      log('RESEND_VERIFY', 'Missing wallet address — 400')
      return res.status(400).json({ message: 'Wallet address is required', error: 'MISSING_WALLET_ADDRESS' })
    }

    log('RESEND_VERIFY', `Calling resendVerificationCode service`)
    const result = await resendVerificationCode(walletAddress)

    if (!result.success) {
      log('RESEND_VERIFY', `Resend failed | reason=${result.reason}`)
      return res.status(400).json({ message: 'No email registered', error: result.reason })
    }

    if (result.alreadyVerified) {
      log('RESEND_VERIFY', 'Email already verified — 200')
      return res.status(200).json({ message: 'Email already verified', emailVerified: true })
    }

    log('RESEND_VERIFY', `<<< 200 OK — code resent`)
    res.status(200).json({ message: 'Verification code resent' })
  } catch (error) {
    warn('RESEND_VERIFY', `Error: ${error.message}`, error)
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
