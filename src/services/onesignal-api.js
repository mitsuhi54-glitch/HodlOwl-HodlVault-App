function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let mockPlayerId = null

export const oneSignalApi = {
  async registerPlayerId(playerId) {
    await delay()
    mockPlayerId = playerId
    return { success: true, oneSignalPlayerId: playerId }
  },

  async unregisterPlayerId() {
    await delay()
    mockPlayerId = null
    return { success: true, oneSignalPlayerId: null }
  },

  async getPreferences() {
    await delay()
    return {
      success: true,
      oneSignalPlayerId: mockPlayerId,
      email: 'demo@example.com',
      emailVerified: true,
      preferences: { notifications: true, emailNotifications: true },
    }
  },

  async updateNotificationPreference(enabled) {
    await delay()
    return { success: true, preferences: { notifications: enabled } }
  },
}

export default oneSignalApi
