function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let mockEmail = null
let mockEmailVerified = false
let mockVerificationCode = null

export const emailApi = {
  async registerEmail(email) {
    await delay(500)
    mockEmail = email
    mockEmailVerified = false
    mockVerificationCode = '123456'
    return {
      success: true,
      email,
      verificationSent: true,
      message: 'Verification code sent to email',
    }
  },

  async unregisterEmail() {
    await delay()
    mockEmail = null
    mockEmailVerified = false
    return { success: true, message: 'Email removed' }
  },

  async getPreferences() {
    await delay()
    return {
      success: true,
      email: mockEmail,
      emailVerified: mockEmailVerified,
      notificationPreferences: { emailNotifications: !!mockEmail },
    }
  },

  async updateEmailNotificationPreference(enabled) {
    await delay()
    return { success: true, preferences: { emailNotifications: enabled } }
  },

  async verifyEmailCode(code) {
    await delay(500)
    if (code === mockVerificationCode || code === '123456') {
      mockEmailVerified = true
      return { success: true, message: 'Email verified' }
    }
    throw new Error('Invalid verification code')
  },

  async resendVerificationCode() {
    await delay()
    return { success: true, message: 'New verification code sent' }
  },
}

export default emailApi
