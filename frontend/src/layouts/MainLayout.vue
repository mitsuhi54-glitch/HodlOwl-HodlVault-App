<template>
  <div>
    <q-layout view="lHh Lpr lFf">
      <q-header class="app-header" :height-hint="64">
        <div class="container header-content">
          <router-link to="/" class="brand">
            <i class="material-icons text-neon" style="font-size: 20px;">lock</i>
            <span>HODLVAULT</span>
          </router-link>

          <nav>
            <router-link to="/">Home</router-link>
            <router-link to="/dashboard">Dashboard</router-link>
            <router-link to="/about">About</router-link>
          </nav>

          <div class="header-right">
            <button v-if="connectedAddress" class="wallet-pill" type="button" @click="onDisconnectWallet">
              <span class="dot connected"></span>
              <span style="display: flex; flex-direction: column; line-height: 1.2;">
                <span style="font-size: 8px; opacity: 0.8; font-weight: 700; letter-spacing: 0.05em;">
                  SECURE CONNECTION ACTIVE
                </span>
                <span class="wallet-addr text-mono" style="font-size: 11px;">
                  {{ shortAddress }}
                </span>
              </span>
            </button>
            <button v-else class="wallet-pill" type="button" @click="onConnectWallet">
              <span class="dot"></span>
              <span style="display: flex; flex-direction: column; line-height: 1.2;">
                <span style="font-size: 8px; opacity: 0.8; font-weight: 700; letter-spacing: 0.05em;">
                  WALLET DISCONNECTED
                </span>
                <span class="wallet-addr text-mono" style="font-size: 11px;">
                  CONNECT WALLET
                </span>
              </span>
            </button>
            <button v-if="!connectedAddress" class="btn--icon" style="background:none; border:1px solid var(--color-warning); color:var(--color-warning); cursor:pointer; font-size:10px; padding:2px 8px; border-radius:4px; font-family:var(--font-mono);" @click="onMockConnect" title="Mock wallet for testing">
              MOCK
            </button>
            <button class="btn--icon" style="background:none; border:none; color:inherit; cursor:pointer;" @click="onTestClick">
              <i class="material-icons" style="font-size: 20px;">notifications</i>
            </button>
            <button class="btn--icon" style="background:none; border:none; color:inherit; cursor:pointer;" @click="toggleTheme">
              <i class="material-icons" style="font-size: 20px;">{{ $q.dark.isActive ? 'light_mode' : 'dark_mode' }}</i>
            </button>
            <button class="menu-toggle">
              <i class="material-icons">menu</i>
            </button>
          </div>
        </div>
      </q-header>

      <q-page-container :class="{ 'page-container--dashboard': isDashboardRoute }">
        <router-view />
      </q-page-container>

      <q-footer>
        <div class="container footer-content">
          <div class="footer-left">
            &copy; 2024 HODLVAULT PROTOCOL
          </div>
          <div class="footer-right">
            <span class="status-item">SYSTEM VERSION: v2.3.0</span>
            <span class="status-item" :class="networkLabel === 'CHIPNET' ? 'text-neon' : (networkLabel === 'MAINNET' ? 'text-green' : 'text-grey')">NETWORK: {{ networkLabel }}</span>
          </div>
        </div>
      </q-footer>
    </q-layout>

    <!-- Notification Modal -->
    <q-dialog v-model="showNotificationModal" persistent>
      <q-card style="max-width: 420px; width: 100%;">
        <q-card-section class="modal-header">
          <h3 style="margin: 0; font-size: 16px; font-family: var(--font-heading);">Notification Settings</h3>
          <q-btn flat dense round icon="close" v-close-popup @click="showNotificationModal = false" />
        </q-card-section>
        <q-card-section class="modal-body">
          <!-- Push Notifications Toggle -->
          <div class="setting-item">
            <div>
              <div style="font-weight: 600; font-size: 14px;">Web Push Notifications</div>
              <div class="text-muted" style="font-size: 11px;">Get alerts in your browser</div>
            </div>
            <label class="toggle-switch" :class="{ 'toggle-switch--disabled': !connectedAddress || notificationPermissionDenied }">
              <input type="checkbox" v-model="notificationsEnabled" :disabled="!connectedAddress || notificationPermissionDenied" @change="toggleNotifications(notificationsEnabled)">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div v-if="notificationPermissionDenied" class="text-muted" style="font-size: 10px; display: flex; align-items: center; gap: 4px; margin-top: -8px;">
            <i class="material-icons" style="font-size: 12px; color: var(--color-warning);">warning</i>
            Permission denied. Enable in browser settings.
          </div>

          <!-- Email Notifications -->
          <div class="setting-item" style="flex-direction: column; align-items: stretch; gap: 12px; margin-top: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <div>
                <div style="font-weight: 600; font-size: 14px;">Email Notifications</div>
                <div class="text-muted" style="font-size: 11px;">Receive updates via email</div>
              </div>
              <label class="toggle-switch" :class="{ 'toggle-switch--disabled': !connectedAddress }">
                <input type="checkbox" v-model="emailNotificationsEnabled" :disabled="!connectedAddress || !savedEmail" @change="toggleEmailNotifications(emailNotificationsEnabled)">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <!-- Email registered: show address + status -->
            <template v-if="savedEmail">
              <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0;">
                <span class="text-mono" style="font-size: 12px; flex: 1;">{{ savedEmail }}</span>
                <span v-if="emailVerified" style="font-size: 10px; color: var(--color-neon); font-weight: 700;">VERIFIED</span>
                <span v-else style="font-size: 10px; color: var(--color-warning); font-weight: 700;">UNVERIFIED</span>
                <button style="background: none; border: none; color: #ff3366; cursor: pointer; font-size: 16px; padding: 0 4px;" @click="removeEmail" title="Remove email">&times;</button>
              </div>
              <!-- Verification code input (shown when unverified) -->
              <div v-if="!emailVerified && showVerifyCodeInput" style="display: flex; gap: 8px; align-items: center;">
                <input type="text" v-model="verificationCode" placeholder="6-digit code" maxlength="6" style="flex: 1; background: var(--color-background); border: 1px solid var(--color-border); color: var(--color-text); padding: 8px 12px; border-radius: 4px; font-size: 14px; outline: none; text-align: center; letter-spacing: 0.5em; font-family: var(--font-mono);" :disabled="verifyingCode" @keyup.enter="verifyCode">
                <button class="btn btn--primary" style="padding: 8px 16px; font-size: 12px;" :loading="verifyingCode" :disabled="verificationCode.length !== 6" @click="verifyCode">Verify</button>
                <button class="btn btn--outline" style="padding: 8px 12px; font-size: 11px;" :disabled="verifyingCode" @click="resendCode">Resend</button>
              </div>
              <div v-else-if="!emailVerified && !showVerifyCodeInput" style="padding: 4px 0;">
                <button class="btn btn--outline" style="padding: 6px 16px; font-size: 11px;" @click="showVerifyCodeInput = true">Verify Email</button>
              </div>
            </template>

            <!-- No email registered: show input -->
            <template v-else>
              <div style="display: flex; gap: 8px;">
                <input type="email" v-model="emailInput" placeholder="your@email.com" style="flex: 1; background: var(--color-background); border: 1px solid var(--color-border); color: var(--color-text); padding: 8px 12px; border-radius: 4px; font-size: 12px; outline: none;" :disabled="!connectedAddress || savingEmail" @keyup.enter="saveEmail">
                <button class="btn btn--outline" style="padding: 8px 16px; font-size: 12px;" :disabled="!emailInput || !connectedAddress || savingEmail" @click="saveEmail">{{ savingEmail ? 'Saving...' : 'Save' }}</button>
              </div>
            </template>
          </div>
        </q-card-section>
        <q-card-actions class="modal-footer">
          <button class="btn btn--primary" style="padding: 8px 24px; font-size: 12px;" @click="showNotificationModal = false">Done</button>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import {
  requestNotificationPermission,
  unsubscribeFromNotifications,
  isNotificationSubscribed,
} from 'src/boot/onesignal'
import { oneSignalApi } from 'src/services/onesignal-api'
import { emailApi } from 'src/services/email-api'
import { suggestDomainFix } from 'src/utils/email-utils'

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

export default defineComponent({
  name: 'MainLayout',

  data() {
    return {
      connecting: false,
      showNotificationModal: false,
      inactivityTimer: null,
      lastActivityTime: null,
      activityListenerCleanup: null,
      // Push notification state
      notificationsEnabled: false,
      notificationPermissionDenied: false,
      // Email notification state
      savedEmail: null,
      emailVerified: false,
      emailInput: '',
      emailNotificationsEnabled: false,
      savingEmail: false,
      showVerifyCodeInput: false,
      verificationCode: '',
      verifyingCode: false,
      resendCount: 0,
    }
  },

  computed: {
    connectedAddress() {
      return this.$store.state.wallet?.address ?? null
    },

    shortAddress() {
      if (!this.connectedAddress) return ''
      const addr = this.connectedAddress
      return `${addr.slice(0, 8)}...${addr.slice(-8)}`
    },

    isDashboardRoute() {
      return this.$route.path === '/dashboard'
    },

    networkLabel() {
      const address = this.$store.state.wallet?.address
      if (!address) return 'DISCONNECTED'
      if (address.includes('bitcoincash:')) return 'MAINNET'
      if (address.includes('bchtest:') || address.includes('chipnet:')) return 'CHIPNET'
      return 'DISCONNECTED'
    },
  },

  watch: {
    connectedAddress(newVal, oldVal) {
      if (oldVal && !newVal) {
        this.stopInactivityTimer()
        this.$q.notify({
          type: 'warning',
          message: 'Wallet disconnected. Redirecting to homepage.',
          timeout: 3000,
        })
        if (this.$route.path !== '/') {
          this.$router.push('/')
        }
      }
      if (newVal && !oldVal) {
        this.startInactivityTimer()
        this.loadNotificationPreferences()
      }
    },
  },

  mounted() {
    console.log('[MainLayout] $walletConnect available:', !!this.$walletConnect)
    if (this.$walletConnect) {
      console.log('[MainLayout] $walletConnect methods:', Object.keys(this.$walletConnect))
      this.$walletConnect.resetConnectionState()
    }
    this.startActivityTracking()
    this.initializeTheme()
    if (this.connectedAddress) {
      this.startInactivityTimer()
      this.loadNotificationPreferences()
    }
    document.addEventListener('visibilitychange', this.onVisibilityChange)
  },

  beforeUnmount() {
    this.stopInactivityTimer()
    this.stopActivityTracking()
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
  },

  methods: {
    initializeTheme() {
      const savedTheme = localStorage.getItem('theme')
      let isDark
      if (savedTheme) {
        isDark = savedTheme === 'dark'
        this.$q.dark.set(isDark)
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        this.$q.dark.set(isDark)
      }
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    },

    // ─── Inactivity Timeout ─────────────────────────────────
    startInactivityTimer() {
      this.stopInactivityTimer()
      this.lastActivityTime = Date.now()
      this.inactivityTimer = setTimeout(() => {
        this.onInactivityTimeout()
      }, INACTIVITY_TIMEOUT_MS)
    },

    stopInactivityTimer() {
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer)
        this.inactivityTimer = null
      }
    },

    resetInactivityTimer() {
      if (!this.connectedAddress) return
      this.lastActivityTime = Date.now()
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer)
      }
      this.inactivityTimer = setTimeout(() => {
        this.onInactivityTimeout()
      }, INACTIVITY_TIMEOUT_MS)
    },

    onInactivityTimeout() {
      if (!this.connectedAddress) return
      console.log('[Inactivity] 30 minutes of inactivity — disconnecting wallet')
      this.$q.notify({
        type: 'warning',
        message: 'Disconnected due to inactivity (30 min). Please reconnect.',
        timeout: 5000,
        icon: 'timer_off',
      })
      this.$store.dispatch('wallet/clearWallet')
      if (this.$walletConnect) {
        this.$walletConnect.disconnect()
      }
      if (this.$route.path !== '/') {
        this.$router.push('/')
      }
    },

    // ─── Activity Tracking ──────────────────────────────────
    startActivityTracking() {
      this.stopActivityTracking()
      const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove']
      const handler = () => {
        const now = Date.now()
        if (!this.lastActivityTime || now - this.lastActivityTime > 1000) {
          this.resetInactivityTimer()
        }
      }
      for (const event of events) {
        window.addEventListener(event, handler, { passive: true })
      }
      this.activityListenerCleanup = () => {
        for (const event of events) {
          window.removeEventListener(event, handler)
        }
      }
    },

    stopActivityTracking() {
      if (this.activityListenerCleanup) {
        this.activityListenerCleanup()
        this.activityListenerCleanup = null
      }
    },

    // ─── Notification Preferences ───────────────────────────
    async loadNotificationPreferences() {
      if (!this.connectedAddress) {
        console.log('[NotifDebug:MainLayout] loadNotificationPreferences skipped — no connectedAddress')
        return
      }
      console.log(`[NotifDebug:MainLayout] loadNotificationPreferences() called | address=${this.connectedAddress.slice(0, 16)}...`)
      try {
        if (Notification.permission === 'denied') {
          this.notificationPermissionDenied = true
          this.notificationsEnabled = false
        } else {
          this.notificationPermissionDenied = false
          const subscribed = await isNotificationSubscribed()
          this.notificationsEnabled = subscribed
        }

        const prefs = await oneSignalApi.getPreferences()
        console.log(`[NotifDebug:MainLayout] getPreferences response | email=${prefs?.email ? prefs.email.slice(0, 6) + '...' : 'null'} | emailVerified=${prefs?.emailVerified} | emailNotifications=${prefs?.preferences?.emailNotifications} | notifications=${prefs?.preferences?.notifications}`)

        if (prefs?.preferences?.notifications === false) {
          this.notificationsEnabled = false
        }
        this.savedEmail = prefs?.email || null
        this.emailVerified = prefs?.emailVerified === true
        this.emailNotificationsEnabled = prefs?.preferences?.emailNotifications === true
        if (this.savedEmail && !this.emailVerified) {
          this.showVerifyCodeInput = false
        }
        console.log(`[NotifDebug:MainLayout] loadNotificationPreferences done | savedEmail=${this.savedEmail ? this.savedEmail.slice(0, 6) + '...' : 'null'} | emailVerified=${this.emailVerified} | emailNotif=${this.emailNotificationsEnabled} | showVerify=${this.showVerifyCodeInput}`)
      } catch (err) {
        console.warn('[NotifDebug:MainLayout] Failed to load preferences:', err.message, err)
      }
    },

    onVisibilityChange() {
      if (document.visibilityState === 'visible' && this.connectedAddress) {
        this.loadNotificationPreferences()
      }
    },

    // ─── Push Notifications ─────────────────────────────────
    async toggleNotifications(enabled) {
      if (enabled) {
        const result = await requestNotificationPermission()
        if (result.success) {
          this.notificationsEnabled = true
          this.notificationPermissionDenied = false
          await oneSignalApi.updateNotificationPreference(true)
          this.$q.notify({ type: 'positive', message: 'Push notifications enabled' })
        } else {
          this.notificationsEnabled = false
          const errMsg = (result.error || '').toLowerCase()
          if (errMsg.includes('denied') || Notification.permission === 'denied') {
            this.notificationPermissionDenied = true
            this.$q.notify({ type: 'warning', message: 'Notification permission denied. Enable in browser settings.' })
          } else if (errMsg.includes('timeout')) {
            this.$q.notify({ type: 'warning', message: 'Notification setup timed out. Please try again.' })
          } else {
            this.$q.notify({ type: 'negative', message: 'Failed to enable notifications: ' + (result.error || 'Unknown error') })
          }
        }
      } else {
        await unsubscribeFromNotifications()
        this.notificationsEnabled = false
        this.$q.notify({ type: 'info', message: 'Push notifications disabled' })
      }
    },

    // ─── Email Notifications ────────────────────────────────
    async toggleEmailNotifications(enabled) {
      console.log(`[NotifDebug:MainLayout] toggleEmailNotifications(${enabled}) | savedEmail=${!!this.savedEmail} | emailVerified=${this.emailVerified}`)
      try {
        if (enabled && !this.savedEmail) {
          console.log('[NotifDebug:MainLayout] toggleEmailNotifications blocked — no savedEmail')
          this.emailNotificationsEnabled = false
          return
        }
        if (enabled && !this.emailVerified) {
          console.log('[NotifDebug:MainLayout] toggleEmailNotifications blocked — email not verified')
          this.emailNotificationsEnabled = false
          this.$q.notify({ type: 'warning', message: 'Please verify your email first.' })
          return
        }
        await emailApi.updateEmailNotificationPreference(enabled)
        this.emailNotificationsEnabled = enabled
        console.log(`[NotifDebug:MainLayout] toggleEmailNotifications success | now=${enabled}`)
        this.$q.notify({
          type: enabled ? 'positive' : 'info',
          message: enabled ? 'Email notifications enabled' : 'Email notifications disabled',
        })
      } catch (err) {
        console.error(`[NotifDebug:MainLayout] toggleEmailNotifications failed | error=${err.message}`, err)
        this.emailNotificationsEnabled = !enabled
        this.$q.notify({ type: 'negative', message: 'Failed to update email notification preference' })
      }
    },

    async saveEmail() {
      if (!this.emailInput) return
      console.log(`[NotifDebug:MainLayout] saveEmail() called | email=${this.emailInput.slice(0, 6)}...`)

      const typo = suggestDomainFix(this.emailInput)
      if (typo) {
        console.log(`[NotifDebug:MainLayout] Domain typo detected | typed=${typo.typed} | suggested=${typo.suggestion}`)
        const confirmed = await new Promise((resolve) => {
          this.$q.dialog({
            title: 'Did you mean...',
            message: `It looks like "<strong>${typo.typed}</strong>" might be a typo. Did you mean <strong>${typo.suggestion}</strong>?`,
            html: true,
            cancel: 'No, keep my email',
            ok: { label: `Yes, use ${typo.suggestion.split('@')[1]}`, color: 'primary' },
          }).onOk(() => resolve(true)).onCancel(() => resolve(false)).onDismiss(() => resolve(false))
        })
        if (confirmed) {
          this.emailInput = typo.suggestion
          console.log(`[NotifDebug:MainLayout] Domain corrected | now=${this.emailInput}`)
        }
      }

      this.savingEmail = true
      try {
        console.time('[NotifDebug:MainLayout] saveEmail API call')
        const result = await emailApi.registerEmail(this.emailInput)
        console.timeEnd('[NotifDebug:MainLayout] saveEmail API call')
        console.log(`[NotifDebug:MainLayout] saveEmail response | verificationSent=${result.verificationSent} | verificationError=${result.verificationError || 'none'} | email=${result.email ? result.email.slice(0, 6) + '...' : 'null'}`)

        this.savedEmail = result.email
        this.emailVerified = false
        this.emailInput = ''
        this.emailNotificationsEnabled = true
        this.showVerifyCodeInput = true
        this.verificationCode = ''
        this.resendCount = 0

        if (result.verificationSent) {
          this.$q.notify({ type: 'positive', message: 'Verification code sent to your email' })
        } else {
          this.$q.notify({ type: 'warning', message: 'Email saved but verification email could not be sent. Check SMTP settings or click Resend.', timeout: 8000 })
        }
      } catch (err) {
        const errMsg = err?.response?.data?.message || err.message || 'Unknown error'
        console.error(`[NotifDebug:MainLayout] saveEmail failed | error=${errMsg} | responseStatus=${err?.response?.status || 'N/A'}`, err)
        this.$q.notify({ type: 'negative', message: `Failed to save email: ${errMsg}`, timeout: 8000 })
      } finally {
        this.savingEmail = false
        console.log(`[NotifDebug:MainLayout] saveEmail() complete | savingEmail=false | savedEmail now=${this.savedEmail ? this.savedEmail.slice(0, 6) + '...' : 'null'}`)
      }
    },

    async verifyCode() {
      if (this.verificationCode.length !== 6) return
      console.log(`[NotifDebug:MainLayout] verifyCode() called | code=${this.verificationCode}`)
      this.verifyingCode = true
      try {
        await emailApi.verifyEmailCode(this.verificationCode)
        console.log('[NotifDebug:MainLayout] verifyCode success')
        this.emailVerified = true
        this.showVerifyCodeInput = false
        this.verificationCode = ''
        this.resendCount = 0
        this.$q.notify({ type: 'positive', message: 'Email verified successfully!' })
      } catch (err) {
        const msg = err?.response?.data?.message || 'Verification failed'
        console.error(`[NotifDebug:MainLayout] verifyCode failed | error=${msg}`, err)
        if (msg.toLowerCase().includes('expired')) {
          this.$q.notify({ type: 'warning', message: 'Code expired. Request a new one.' })
        } else {
          this.$q.notify({ type: 'negative', message: msg })
        }
      } finally {
        this.verifyingCode = false
        console.log(`[NotifDebug:MainLayout] verifyCode() complete | emailVerified=${this.emailVerified}`)
      }
    },

    async resendCode() {
      console.log('[NotifDebug:MainLayout] resendCode() called')
      this.resendCount++
      console.log(`[NotifDebug:MainLayout] resendCount=${this.resendCount}`)
      if (this.resendCount >= 2) {
        this.$q.notify({
          type: 'warning',
          message: 'Double-check your email address for typos before trying again.',
          icon: 'email',
          timeout: 6000,
        })
      }
      this.verifyingCode = true
      try {
        await emailApi.resendVerificationCode()
        console.log('[NotifDebug:MainLayout] resendCode success')
        this.verificationCode = ''
        this.$q.notify({ type: 'positive', message: 'New verification code sent' })
      } catch (err) {
        console.error(`[NotifDebug:MainLayout] resendCode failed | error=${err.message}`, err)
        this.$q.notify({ type: 'negative', message: 'Failed to resend code' })
      } finally {
        this.verifyingCode = false
      }
    },

    async removeEmail() {
      console.log('[NotifDebug:MainLayout] removeEmail() called')
      try {
        await emailApi.unregisterEmail()
        console.log('[NotifDebug:MainLayout] removeEmail success')
        this.savedEmail = null
        this.emailNotificationsEnabled = false
        this.emailVerified = false
        this.showVerifyCodeInput = false
        this.verificationCode = ''
        this.$q.notify({ type: 'info', message: 'Email removed' })
      } catch (err) {
        console.error(`[NotifDebug:MainLayout] removeEmail failed | error=${err.message}`, err)
        this.$q.notify({ type: 'negative', message: 'Failed to remove email' })
      }
    },

    async onConnectWallet() {
      console.log('[MainLayout] onConnectWallet called', {
        hasWalletConnect: !!this.$walletConnect,
        isConnected: this.$walletConnect?.isConnected?.(),
      })
      if (this.$walletConnect?.resetConnectionState) {
        this.$walletConnect.resetConnectionState()
      }
      this.connecting = true
      try {
        if (!this.$walletConnect) {
          throw new Error('WalletConnect not initialized (boot may have failed)')
        }
        await this.$walletConnect.connect(() => {
          console.log('[MainLayout] Modal open callback fired')
          this.connecting = false
        })
        console.log('[MainLayout] Wallet connected successfully')
        this.$q.notify({
          type: 'positive',
          message: 'Connected to Paytaca',
          icon: 'check_circle',
        })
      } catch (err) {
        console.error('[MainLayout] WalletConnect error:', err)
        this.$q.notify({
          type: 'negative',
          message: `Connection failed: ${err?.message || err || 'Unknown error'}`,
          timeout: 10000,
          actions: [{ icon: 'close', color: 'white' }],
        })
      } finally {
        this.connecting = false
      }
    },

    onDisconnectWallet() {
      this.$store.dispatch('wallet/clearWallet')
      if (this.$walletConnect) {
        this.$walletConnect.disconnect()
      }
    },

    onMockConnect() {
      console.log('[MainLayout] onMockConnect called')
      this.$store.dispatch('wallet/setWallet', {
        address: 'chipnet:qz4wqx8kjzlk7yalev0x8c8nppd6vqszxg5xqf8jrp',
        publicKey: '02d09613d20ce44da55956799863c0a5e82c5896a2df33502b4859664650529d2f',
      })
      this.$q.notify({
        type: 'positive',
        message: 'Mock connection established',
        icon: 'check_circle',
      })
    },

    onTestClick() {
      console.log('[MainLayout] notification bell clicked')
      this.showNotificationModal = true
      if (this.connectedAddress) {
        this.loadNotificationPreferences()
      }
    },

    toggleTheme() {
      this.$q.dark.toggle()
      const isDark = this.$q.dark.isActive
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    },
  },
})
</script>
