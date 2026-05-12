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
    return config
  },
  (error) => Promise.reject(error),
)

export const oneSignalApi = {
  /**
   * Register OneSignal player ID with the backend
   * @param {string} playerId - OneSignal subscriber/player ID
   */
  async registerPlayerId(playerId) {
    const response = await apiClient.post('/wallet/preferences/onesignal/register', {
      playerId,
    })
    return response.data
  },

  /**
   * Unregister OneSignal player ID from the backend
   */
  async unregisterPlayerId() {
    const response = await apiClient.post('/wallet/preferences/onesignal/unregister')
    return response.data
  },

  /**
   * Get wallet preferences (includes oneSignalPlayerId)
   */
  async getPreferences() {
    const response = await apiClient.get('/wallet/preferences')
    return response.data
  },

  /**
   * Update notification preference (on/off)
   * @param {boolean} enabled - Whether notifications are enabled
   */
  async updateNotificationPreference(enabled) {
    const response = await apiClient.put('/wallet/preferences', {
      preferences: { notifications: enabled },
    })
    return response.data
  },
}

export default oneSignalApi
