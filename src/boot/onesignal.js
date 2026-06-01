import { boot } from 'quasar/wrappers'

export default boot(({ app }) => {
  app.config.globalProperties.$oneSignal = {
    User: { PushSubscription: { optedIn: false, id: null, optIn: async () => {}, optOut: async () => {}, addEventListener: () => {} } },
    Notifications: { addEventListener: () => {} },
    Slidedown: { promptPush: async () => {} },
    init: async () => {},
  }
})

export async function requestNotificationPermission() {
  return { success: false, error: 'Notifications disabled in demo mode' }
}

export async function unsubscribeFromNotifications() {
  return { success: true }
}

export async function isNotificationSubscribed() {
  return true
}
