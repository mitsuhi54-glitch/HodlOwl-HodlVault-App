import { Router } from 'express'
import { extractWalletAddress } from '../middleware/wallet.middleware.js'
import {
  getWalletPreferences,
  updateWalletPreferences,
  deleteWalletPreferences,
  registerOneSignalPlayer,
  unregisterOneSignalPlayer,
  registerEmailAddress,
  unregisterEmailAddress,
  verifyEmailCodeHandler,
  resendVerificationCodeHandler,
} from '../controllers/wallet-preferences.controller.js'

const router = Router()

// Apply wallet address extraction middleware to all routes
router.use(extractWalletAddress)

/**
 * @route   GET /api/v1/wallet/preferences
 * @desc    Get wallet preferences (creates default if not exists)
 * @access  Wallet-based
 * @header  x-wallet-address - Wallet address
 */
router.get('/', getWalletPreferences)

/**
 * @route   PUT /api/v1/wallet/preferences
 * @desc    Update wallet preferences
 * @access  Wallet-based
 * @header  x-wallet-address - Wallet address
 * @body    preferences - Preferences object to update
 */
router.put('/', updateWalletPreferences)

/**
 * @route   DELETE /api/v1/wallet/preferences
 * @desc    Delete wallet preferences
 * @access  Wallet-based
 * @header  x-wallet-address - Wallet address
 */
router.delete('/', deleteWalletPreferences)

/**
 * @route   POST /api/v1/wallet/preferences/onesignal/register
 * @desc    Register OneSignal player ID for push notifications
 * @access  Wallet-based
 * @body    playerId - OneSignal player/subscriber ID
 */
router.post('/onesignal/register', registerOneSignalPlayer)

/**
 * @route   POST /api/v1/wallet/preferences/onesignal/unregister
 * @desc    Unregister OneSignal player ID (disable push notifications)
 * @access  Wallet-based
 */
router.post('/onesignal/unregister', unregisterOneSignalPlayer)

/**
 * @route   POST /api/v1/wallet/preferences/email/register
 * @desc    Register email address for email notifications
 * @access  Wallet-based
 * @body    email - Email address
 */
router.post('/email/register', registerEmailAddress)

/**
 * @route   POST /api/v1/wallet/preferences/email/unregister
 * @desc    Unregister email address (disable email notifications)
 * @access  Wallet-based
 */
router.post('/email/unregister', unregisterEmailAddress)

/**
 * @route   POST /api/v1/wallet/preferences/email/verify
 * @desc    Verify email with 6-digit code
 * @access  Wallet-based
 * @body    code - 6-digit verification code
 */
router.post('/email/verify', verifyEmailCodeHandler)

/**
 * @route   POST /api/v1/wallet/preferences/email/resend
 * @desc    Resend verification code
 * @access  Wallet-based
 */
router.post('/email/resend', resendVerificationCodeHandler)

export default router
