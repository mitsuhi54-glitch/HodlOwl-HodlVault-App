/**
 * Boot file: Initialize OneSignal Web Push SDK v16
 * - Loads the SDK script dynamically
 * - Initializes with our App ID
 * - Handles subscription changes (player ID registration)
 * - Handles notification clicks (navigate to MyVaults)
 * - Does NOT auto-prompt; permission is requested when user enables notifications
 *
 * OneSignal SDK v16 API Reference:
 * - OneSignal.User.PushSubscription.optedIn - check subscription status
 * - OneSignal.User.PushSubscription.id - get subscription ID (player ID)
 * - OneSignal.User.PushSubscription.optIn() - subscribe
 * - OneSignal.User.PushSubscription.optOut() - unsubscribe
 */

import { boot } from 'quasar/wrappers'
import store from '../store'
import { oneSignalApi } from '../services/onesignal-api'

const ONESIGNAL_APP_ID = 'fcdaef27-646a-4dd3-9ac8-b0b44b0bba8b'

export default boot(({ app }) => {
  // Load OneSignal SDK dynamically
  const script = document.createElement('script')
  script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
  script.defer = true
  document.head.appendChild(script)

  // Initialize after SDK loads
  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async function (OneSignal) {
    try {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
      })

      // Listen for push subscription changes using v16 API
      OneSignal.User.PushSubscription.addEventListener('change', async (event) => {
        console.log('[OneSignal] Push subscription changed:', event)
        const walletAddress = store.state.wallet?.address
        if (!walletAddress) return

        // If user opted in, register the player ID
        if (OneSignal.User.PushSubscription.optedIn) {
          const subscriptionId = OneSignal.User.PushSubscription.id
          if (subscriptionId) {
            try {
              await oneSignalApi.registerPlayerId(subscriptionId)
              console.log('[OneSignal] Subscription ID registered:', subscriptionId)
            } catch (err) {
              console.warn('[OneSignal] Failed to register subscription ID:', err)
            }
          }
        }
      })

      console.log('[OneSignal] SDK initialized successfully')
    } catch (err) {
      console.error('[OneSignal] SDK initialization failed:', err)
    }

    // Expose OneSignal globally for components
    app.config.globalProperties.$oneSignal = OneSignal
    window.OneSignal = OneSignal
  })
})

/**
 * Request notification permission and subscribe the user
 * Call this from a component when user toggles notifications ON
 * @returns {Promise<{success: boolean, playerId?: string, error?: string}>}
 */
export async function requestNotificationPermission() {
  if (!window.OneSignal) {
    return { success: false, error: 'OneSignal SDK not loaded yet' }
  }

  try {
    const OneSignal = window.OneSignal

    // Check if already opted in (v16 API)
    if (OneSignal.User.PushSubscription.optedIn) {
      const subscriptionId = OneSignal.User.PushSubscription.id
      const walletAddress = store.state.wallet?.address
      if (subscriptionId && walletAddress) {
        await oneSignalApi.registerPlayerId(subscriptionId)
      }
      return { success: true, playerId: subscriptionId }
    }

    // Request permission - v16 uses slidedown prompt or native permission
    await OneSignal.Slidedown.promptPush()

    // Wait for the subscription to process
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          if (OneSignal.User.PushSubscription.optedIn) {
            const subscriptionId = OneSignal.User.PushSubscription.id
            const walletAddress = store.state.wallet?.address
            if (subscriptionId && walletAddress) {
              await oneSignalApi.registerPlayerId(subscriptionId)
            }
            resolve({ success: true, playerId: subscriptionId })
          } else {
            resolve({ success: false, error: 'User denied permission or prompt dismissed' })
          }
        } catch (err) {
          resolve({ success: false, error: err.message })
        }
      }, 2000)
    })
  } catch (err) {
    console.error('[OneSignal] Permission request failed:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Unsubscribe from push notifications
 * Call this when user toggles notifications OFF
 * @returns {Promise<{success: boolean}>}
 */
export async function unsubscribeFromNotifications() {
  if (!window.OneSignal) {
    return { success: false }
  }

  try {
    const OneSignal = window.OneSignal

    // Opt out of push notifications (v16 API)
    await OneSignal.User.PushSubscription.optOut()

    // Remove player ID from backend
    await oneSignalApi.unregisterPlayerId()

    // Update preference
    await oneSignalApi.updateNotificationPreference(false)

    console.log('[OneSignal] Unsubscribed successfully')
    return { success: true }
  } catch (err) {
    console.error('[OneSignal] Unsubscribe failed:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Check if user is currently subscribed to push notifications
 * @returns {Promise<boolean>}
 */
export async function isNotificationSubscribed() {
  if (!window.OneSignal) return false
  try {
    // v16 API: check if optedIn
    return window.OneSignal.User.PushSubscription.optedIn || false
  } catch {
    return false
  }
}
