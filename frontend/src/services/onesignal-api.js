import axios from 'axios'
import store from '../store'

const API_BASE_URL = process.env.VUE_APP_API_URL || '/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const walletAddress = store.state.wallet?.address
    if (walletAddress) {
      config.headers['x-wallet-address'] = walletAddress
    }
    console.log(`[NotifDebug:api] REQ ${config.method?.toUpperCase()} ${config.url} | wallet=${walletAddress ? walletAddress.slice(0, 12) + '...' : 'null'} | body=${JSON.stringify(config.data)}`)
    return config
  },
  (error) => {
    console.warn(`[NotifDebug:api] REQ INTERCEPTOR ERROR`, error)
    return Promise.reject(error)
  },
)

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[NotifDebug:api] RES ${response.status} ${response.config.url} | data=${JSON.stringify(response.data).slice(0, 300)}`)
    return response
  },
  (error) => {
    const detail = error.response
      ? `status=${error.response.status} | body=${JSON.stringify(error.response.data).slice(0, 200)}`
      : `network_error | message=${error.message}`
    console.warn(`[NotifDebug:api] RES ERROR ${error.config?.url} | ${detail}`)
    return Promise.reject(error)
  },
)

export const oneSignalApi = {
  async registerPlayerId(playerId) {
    console.log(`[NotifDebug:api] registerPlayerId() called | playerId=${playerId ? playerId.slice(0, 16) + '...' : 'null'}`)
    try {
      const response = await apiClient.post('/wallet/preferences/onesignal/register', { playerId })
      console.log(`[NotifDebug:api] registerPlayerId() success | oneSignalPlayerId=${response.data?.oneSignalPlayerId ? 'set' : 'unset'}`)
      return response.data
    } catch (err) {
      console.warn(`[NotifDebug:api] registerPlayerId() failed | playerId=${playerId ? playerId.slice(0, 16) + '...' : 'null'} | error=${err.message}`)
      throw err
    }
  },

  async unregisterPlayerId() {
    console.log(`[NotifDebug:api] unregisterPlayerId() called`)
    try {
      const response = await apiClient.post('/wallet/preferences/onesignal/unregister')
      console.log(`[NotifDebug:api] unregisterPlayerId() success | oneSignalPlayerId=${response.data?.oneSignalPlayerId}`)
      return response.data
    } catch (err) {
      console.warn(`[NotifDebug:api] unregisterPlayerId() failed | error=${err.message}`)
      throw err
    }
  },

  async getPreferences() {
    console.log(`[NotifDebug:api] getPreferences() called`)
    try {
      const response = await apiClient.get('/wallet/preferences')
      console.log(`[NotifDebug:api] getPreferences() success | hasPlayerId=${!!response.data?.oneSignalPlayerId} | notifications=${response.data?.preferences?.notifications}`)
      return response.data
    } catch (err) {
      console.warn(`[NotifDebug:api] getPreferences() failed | error=${err.message}`)
      throw err
    }
  },

  async updateNotificationPreference(enabled) {
    console.log(`[NotifDebug:api] updateNotificationPreference() called | enabled=${enabled}`)
    try {
      const response = await apiClient.put('/wallet/preferences', { preferences: { notifications: enabled } })
      console.log(`[NotifDebug:api] updateNotificationPreference() success | notifications=${response.data?.preferences?.notifications}`)
      return response.data
    } catch (err) {
      console.warn(`[NotifDebug:api] updateNotificationPreference() failed | enabled=${enabled} | error=${err.message}`)
      throw err
    }
  },
}

export default oneSignalApi
