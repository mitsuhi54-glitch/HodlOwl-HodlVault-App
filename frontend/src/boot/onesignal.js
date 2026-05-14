import { boot } from 'quasar/wrappers'
import store from '../store'
import { oneSignalApi } from '../services/onesignal-api'

const ONESIGNAL_APP_ID = process.env.VITE_ONESIGNAL_APP_ID || 'fcdaef27-646a-4dd3-9ac8-b0b44b0bba8b'

function log(tag, msg, data) {
  const prefix = `[NotifDebug:boot]`
  if (data !== undefined) {
    console.log(`${prefix} ${tag} — ${msg}`, data)
  } else {
    console.log(`${prefix} ${tag} — ${msg}`)
  }
}

function warn(tag, msg, err) {
  console.warn(`[NotifDebug:boot] ${tag} — ${msg}`, err || '')
}

export default boot(({ app, router }) => {
  log('BOOT', `OneSignal boot starting | appId=${ONESIGNAL_APP_ID ? ONESIGNAL_APP_ID.slice(0, 8) + '...' : 'MISSING'}`)

  if (!ONESIGNAL_APP_ID) {
    warn('BOOT', 'VITE_ONESIGNAL_APP_ID not set — notifications disabled')
    return
  }

  const script = document.createElement('script')
  script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
  script.defer = true
  script.onload = () => log('BOOT', 'SDK script loaded from CDN')
  script.onerror = (err) => warn('BOOT', 'SDK script failed to load', err)
  document.head.appendChild(script)
  log('BOOT', 'SDK script element appended to head')

  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async function (OneSignal) {
    log('INIT', 'OneSignal deferred push executing — OneSignal object available:', typeof OneSignal)

    try {
      const initStart = Date.now()
      log('INIT', `Calling OneSignal.init({ appId: ${ONESIGNAL_APP_ID.slice(0, 8)}..., serviceWorkerPath: "OneSignalSDKWorker.js" })`)

      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        serviceWorkerParam: { scope: '/' },
        serviceWorkerPath: 'OneSignalSDKWorker.js',
      })

      const initElapsed = Date.now() - initStart
      log('INIT', `OneSignal.init() completed in ${initElapsed}ms`)

      log('INIT', `Post-init state: optedIn=${OneSignal.User.PushSubscription.optedIn}, subscriptionId=${OneSignal.User.PushSubscription.id || 'null'}`)

      OneSignal.User.PushSubscription.addEventListener('change', async () => {
        const optState = OneSignal.User.PushSubscription.optedIn
        const subId = OneSignal.User.PushSubscription.id
        const walletAddr = store.state.wallet?.address
        log('SUB_CHANGE', `Push subscription changed | optedIn=${optState} | subscriptionId=${subId || 'null'} | walletAddress=${walletAddr || 'null'}`)

        if (!walletAddr) {
          log('SUB_CHANGE', 'No wallet connected — skipping registration')
          return
        }

        if (optState) {
          if (subId) {
            try {
              log('SUB_CHANGE', `Registering subscriptionId=${subId} with backend`)
              await oneSignalApi.registerPlayerId(subId)
              log('SUB_CHANGE', 'Backend registration successful')
            } catch (err) {
              warn('SUB_CHANGE', 'Backend registration failed', err)
            }
          } else {
            warn('SUB_CHANGE', 'optedIn=true but subscriptionId is null/empty')
          }
        } else {
          log('SUB_CHANGE', 'User opted out')
        }
      })

      if (typeof OneSignal.Notifications.addEventListener === 'function') {
        log('INIT', 'Setting up notification click handler')
        OneSignal.Notifications.addEventListener('click', async (event) => {
          const notificationData = event?.data || event?.notification?.data || {}
          log('NOTIF_CLICK', `Notification clicked | data=${JSON.stringify(notificationData)}`)
          if (notificationData.type === 'AUTO_WITHDRAWAL' && notificationData.contractAddress) {
            log('NOTIF_CLICK', `Routing to vault manage: ${notificationData.contractAddress}`)
            router.push(`/vault/manage?contract=${encodeURIComponent(notificationData.contractAddress)}`)
          } else {
            log('NOTIF_CLICK', 'Routing to /my-vaults (default)')
            router.push('/my-vaults')
          }
        })
      } else {
        warn('INIT', 'OneSignal.Notifications.addEventListener is not a function — click handler NOT registered')
      }

      log('INIT', 'OneSignal SDK fully initialized and ready')
    } catch (err) {
      warn('INIT', `SDK initialization threw exception: ${err.message}`, err)
    }

    app.config.globalProperties.$oneSignal = OneSignal
    window.OneSignal = OneSignal
    log('INIT', 'OneSignal exposed on global scope and Vue prototype')
  })
})

function waitForSubscription(timeoutMs = 8000) {
  return new Promise((resolve) => {
    const OneSignal = window.OneSignal
    if (!OneSignal) {
      log('WAIT_SUB', 'OneSignal SDK not loaded — resolving immediately with error')
      resolve({ success: false, error: 'OneSignal SDK not loaded' })
      return
    }

    if (OneSignal.User.PushSubscription.optedIn) {
      const subscriptionId = OneSignal.User.PushSubscription.id
      log('WAIT_SUB', `Already opted in — resolving immediately | subscriptionId=${subscriptionId || 'null'}`)
      resolve({ success: true, playerId: subscriptionId })
      return
    }

    log('WAIT_SUB', `Not yet opted in — waiting up to ${timeoutMs}ms`)

    let settled = false

    const unsubscribe = OneSignal.User.PushSubscription.addEventListener('change', () => {
      if (OneSignal.User.PushSubscription.optedIn) {
        settled = true
        unsubscribe()
        clearInterval(pollTimer)
        clearTimeout(failTimer)
        const subscriptionId = OneSignal.User.PushSubscription.id
        log('WAIT_SUB', `Change event fired with optedIn=true | subscriptionId=${subscriptionId || 'null'}`)
        resolve({ success: true, playerId: subscriptionId })
      } else {
        log('WAIT_SUB', 'Change event fired but optedIn is still false — continuing to wait')
      }
    })

    const pollTimer = setInterval(() => {
      if (!settled && OneSignal.User.PushSubscription.optedIn) {
        settled = true
        clearInterval(pollTimer)
        clearTimeout(failTimer)
        try { unsubscribe() } catch { /* listener already removed */ }
        const subscriptionId = OneSignal.User.PushSubscription.id
        log('WAIT_SUB', `Poll detected optedIn=true | subscriptionId=${subscriptionId || 'null'}`)
        resolve({ success: true, playerId: subscriptionId })
      }
    }, 300)

    const failTimer = setTimeout(() => {
      if (settled) return
      settled = true
      clearInterval(pollTimer)
      log('WAIT_SUB', `Timeout (${timeoutMs}ms) reached — user did not opt in`)
      try { unsubscribe() } catch { /* listener already removed */ }
      const reason = Notification.permission === 'denied'
        ? 'User denied notification permission'
        : 'Subscription timeout — user did not opt in'
      resolve({ success: false, error: reason })
    }, timeoutMs)
  })
}

export async function requestNotificationPermission() {
  const OneSignal = window.OneSignal
  log('REQ_PERM', `requestNotificationPermission() called | Notification.permission=${Notification.permission}`)

  if (!OneSignal) {
    warn('REQ_PERM', 'OneSignal SDK not loaded yet')
    return { success: false, error: 'OneSignal SDK not loaded yet' }
  }

  try {
    if (OneSignal.User.PushSubscription.optedIn) {
      const subscriptionId = OneSignal.User.PushSubscription.id
      const walletAddress = store.state.wallet?.address
      log('REQ_PERM', `Already opted in | subscriptionId=${subscriptionId || 'null'} | walletAddress=${walletAddress || 'null'}`)
      if (subscriptionId && walletAddress) {
        log('REQ_PERM', 'Registering existing player ID with backend')
        await oneSignalApi.registerPlayerId(subscriptionId)
        log('REQ_PERM', 'Backend registration of existing sub successful')
      }
      return { success: true, playerId: subscriptionId }
    }

    if (Notification.permission === 'denied') {
      log('REQ_PERM', 'Permission previously denied by user — cannot subscribe')
      return { success: false, error: 'User denied notification permission' }
    }

    if (Notification.permission === 'granted') {
      log('REQ_PERM', 'Permission already granted but optedIn=false — calling optIn() directly')
      await OneSignal.User.PushSubscription.optIn()
      log('REQ_PERM', 'optIn() called — waiting for subscription (SUB_CHANGE handler will register with backend)')
      const result = await waitForSubscription()
      log('REQ_PERM', `waitForSubscription result: success=${result.success} | playerId=${result.playerId || 'null'} | error=${result.error || 'null'}`)
      return result
    }

    log('REQ_PERM', 'Permission=default — calling Slidedown.promptPush()')
    await OneSignal.Slidedown.promptPush()
    log('REQ_PERM', 'Slidedown.promptPush() returned — waiting for subscription')

    const result = await waitForSubscription()
    log('REQ_PERM', `waitForSubscription result: success=${result.success} | playerId=${result.playerId || 'null'} | error=${result.error || 'null'}`)

    if (result.success && result.playerId) {
      const walletAddress = store.state.wallet?.address
      if (walletAddress) {
        log('REQ_PERM', 'Registering new player ID with backend')
        await oneSignalApi.registerPlayerId(result.playerId)
        log('REQ_PERM', 'Backend registration of new sub successful')
      }
    }
    return result
  } catch (err) {
    warn('REQ_PERM', `Prompt/registration failed: ${err.message}`, err)
    return { success: false, error: err.message }
  }
}

export async function unsubscribeFromNotifications() {
  log('UNSUB', 'unsubscribeFromNotifications() called')

  const OneSignal = window.OneSignal
  if (!OneSignal) {
    warn('UNSUB', 'OneSignal SDK not loaded')
    return { success: false }
  }

  try {
    log('UNSUB', 'Calling optOut()')
    await OneSignal.User.PushSubscription.optOut()
    log('UNSUB', 'optOut() completed')

    log('UNSUB', 'Unregistering player ID from backend')
    await oneSignalApi.unregisterPlayerId()
    log('UNSUB', 'Backend unregister successful')

    log('UNSUB', 'Updating notification preference to false')
    await oneSignalApi.updateNotificationPreference(false)
    log('UNSUB', 'Preference update successful')

    return { success: true }
  } catch (err) {
    warn('UNSUB', `Failed: ${err.message}`, err)
    return { success: false, error: err.message }
  }
}

export async function isNotificationSubscribed() {
  if (!window.OneSignal) {
    log('IS_SUB', 'OneSignal not available — returning false')
    return false
  }
  try {
    const result = window.OneSignal.User.PushSubscription.optedIn || false
    log('IS_SUB', `optedIn=${result} | subscriptionId=${window.OneSignal.User.PushSubscription.id || 'null'}`)
    return result
  } catch (err) {
    warn('IS_SUB', `Error checking subscription: ${err.message}`, err)
    return false
  }
}
