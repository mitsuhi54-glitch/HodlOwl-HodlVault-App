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

export const emailApi = {
  async registerEmail(email) {
    const response = await apiClient.post('/wallet/preferences/email/register', { email })
    return response.data
  },

  async unregisterEmail() {
    const response = await apiClient.post('/wallet/preferences/email/unregister')
    return response.data
  },

  async getPreferences() {
    const response = await apiClient.get('/wallet/preferences')
    return response.data
  },

  async updateEmailNotificationPreference(enabled) {
    const response = await apiClient.put('/wallet/preferences', {
      preferences: { emailNotifications: enabled },
    })
    return response.data
  },

  async verifyEmailCode(code) {
    const response = await apiClient.post('/wallet/preferences/email/verify', { code })
    return response.data
  },

  async resendVerificationCode() {
    const response = await apiClient.post('/wallet/preferences/email/resend')
    return response.data
  },
}

export default emailApi
