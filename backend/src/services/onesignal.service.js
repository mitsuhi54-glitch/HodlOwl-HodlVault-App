/**
 * OneSignal Push Notification Service
 * Sends web push notifications to users when auto-withdrawal occurs.
 * Uses OneSignal REST API v1 for server-side notification delivery.
 */

import { WalletPreferences } from '../models/wallet-preferences.model.js'

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY
const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1/notifications'

/**
 * Send auto-withdrawal push notification to a user
 * @param {string} walletAddress - User's wallet address
 * @param {object} data - { vaultName, contractAddress }
 * @returns {Promise<{sent: boolean, reason?: string, result?: object}>}
 */
export async function sendAutoWithdrawalNotification(walletAddress, data) {
  try {
    // 1. Validate OneSignal config
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      console.warn('[OneSignal] Missing ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY in env')
      return { sent: false, reason: 'missing_config' }
    }

    // 2. Check if user has notifications enabled
    const prefs = await WalletPreferences.findByWalletAddress(walletAddress)
    if (!prefs || !prefs.preferences.notifications) {
      console.log('[OneSignal] Notifications disabled for', walletAddress)
      return { sent: false, reason: 'disabled' }
    }

    // 3. Get player ID
    const playerId = prefs.oneSignalPlayerId
    if (!playerId) {
      console.log('[OneSignal] No player ID for', walletAddress)
      return { sent: false, reason: 'no_player_id' }
    }

    // 4. Send notification via OneSignal REST API
    const notificationPayload = {
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: [playerId],
      headings: { en: '🎉 Vault Auto-Withdrawn' },
      contents: {
        en: `Your "${data.vaultName || 'Unnamed Vault'}" vault was automatically withdrawn.`,
      },
      data: {
        type: 'AUTO_WITHDRAWAL',
        contractAddress: data.contractAddress,
      },
      web_url: '/#/my-vaults',
    }

    const response = await fetch(ONESIGNAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notificationPayload),
    })

    const result = await response.json()

    if (result.errors) {
      console.warn('[OneSignal] API returned errors:', result.errors)
      return { sent: false, reason: 'api_error', errors: result.errors }
    }

    console.log('[OneSignal] Notification sent to', walletAddress, '- ID:', result.id)
    return { sent: true, result }
  } catch (error) {
    console.error('[OneSignal] Failed to send notification:', error.message)
    return { sent: false, reason: 'exception', error: error.message }
  }
}

/**
 * Register a OneSignal player ID for a wallet address
 * Called from the frontend when user subscribes to push notifications
 * @param {string} walletAddress - User's wallet address
 * @param {string} playerId - OneSignal player/subscriber ID
 * @returns {Promise<object>} Updated preferences
 */
export async function registerPlayerId(walletAddress, playerId) {
  try {
    const normalizedAddress = walletAddress.toLowerCase()

    const preferences = await WalletPreferences.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      { $set: { oneSignalPlayerId: playerId } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )

    console.log('[OneSignal] Player ID registered for', walletAddress)
    return preferences
  } catch (error) {
    console.error('[OneSignal] Failed to register player ID:', error.message)
    throw error
  }
}

/**
 * Remove a OneSignal player ID (when user disables notifications)
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<object>} Updated preferences
 */
export async function unregisterPlayerId(walletAddress) {
  try {
    const normalizedAddress = walletAddress.toLowerCase()

    const preferences = await WalletPreferences.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      { $set: { oneSignalPlayerId: null } },
      { new: true },
    )

    console.log('[OneSignal] Player ID removed for', walletAddress)
    return preferences
  } catch (error) {
    console.error('[OneSignal] Failed to unregister player ID:', error.message)
    throw error
  }
}
