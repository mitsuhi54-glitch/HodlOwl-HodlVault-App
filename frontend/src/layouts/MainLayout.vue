<template>
  <div :data-theme="$q.dark.isActive ? 'dark' : 'light'">
    <q-layout view="lHh Lpr lFf">
      <q-header>
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
            <button v-if="!connectedAddress" class="btn--icon" style="background:none; border:1px solid #ffb800; color:#ffb800; cursor:pointer; font-size:10px; padding:2px 8px; border-radius:4px; font-family:var(--font-mono);" @click="onMockConnect" title="Mock wallet for testing">
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

      <q-page-container>
        <router-view />
      </q-page-container>

      <q-footer>
        <div class="container footer-content">
          <div class="footer-left">
            &copy; 2024 HODLVAULT PROTOCOL
          </div>
          <div class="footer-right">
            <span class="status-item">SYSTEM VERSION: v2.3.0</span>
            <span class="status-item text-neon">NETWORK: CHIPNET</span>
          </div>
        </div>
      </q-footer>
    </q-layout>

    <!-- Notification Modal -->
    <q-dialog v-model="showNotificationModal" persistent>
      <q-card style="max-width: 400px; width: 100%;">
        <q-card-section class="modal-header">
          <h3 style="margin: 0; font-size: 16px; font-family: var(--font-heading);">Notification Settings</h3>
          <q-btn flat dense round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="modal-body">
          <div class="setting-item">
            <div>
              <div style="font-weight: 600; font-size: 14px;">Web Push Notifications</div>
              <div class="text-muted" style="font-size: 11px;">Get alerts in your browser</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox">
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="setting-item" style="flex-direction: column; align-items: stretch; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <div>
                <div style="font-weight: 600; font-size: 14px;">Email Notifications</div>
                <div class="text-muted" style="font-size: 11px;">Receive updates via daily mail</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="emailNotifyToggle">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div v-show="emailNotifyToggle" style="display: flex; flex-direction: column; gap: 12px; padding-top: 12px; border-top: 1px dashed var(--color-border);">
              <div style="display: flex; gap: 8px;">
                <input type="email" placeholder="Enter email address" style="flex: 1; background: var(--color-background); border: 1px solid var(--color-border); color: var(--color-text); padding: 8px 12px; border-radius: 4px; font-size: 12px; outline: none;">
                <button class="btn btn--outline" style="padding: 8px 16px; font-size: 12px;">Send Code</button>
              </div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="text" placeholder="------" maxlength="6" style="flex: 1; background: var(--color-background); border: 1px solid var(--color-border); color: var(--color-text); padding: 8px 12px; border-radius: 4px; font-size: 14px; outline: none; text-align: center; letter-spacing: 0.5em; font-family: var(--font-mono);">
                <button class="btn btn--primary" style="padding: 8px 16px; font-size: 12px;">Verify</button>
              </div>
              <div class="text-muted" style="font-size: 10px; display: flex; align-items: center; gap: 4px;">
                <i class="material-icons" style="font-size: 12px; color: #ffb800;">info</i>
                Verification required to receive alerts
              </div>
            </div>
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

export default defineComponent({
  name: 'MainLayout',

  data() {
    return {
      connecting: false,
      walletWatchInterval: null,
      showNotificationModal: false,
      emailNotifyToggle: false,
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
  },

  watch: {
    connectedAddress(newVal, oldVal) {
      if (oldVal && !newVal) {
        this.$q.notify({
          type: 'warning',
          message: 'Wallet disconnected. Redirecting to homepage.',
          timeout: 3000,
        })
        if (this.$route.path !== '/') {
          this.$router.push('/')
        }
      }
    },
  },

  mounted() {
    console.log('[MainLayout] $walletConnect available:', !!this.$walletConnect)
    if (this.$walletConnect) {
      console.log('[MainLayout] $walletConnect methods:', Object.keys(this.$walletConnect))
      this.$walletConnect.resetConnectionState()
    }
    this.startWalletStatusWatcher()
    this.initializeTheme()
  },

  beforeUnmount() {
    this.stopWalletStatusWatcher()
  },

  methods: {
    initializeTheme() {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.$q.dark.set(savedTheme === 'dark')
      } else {
        this.$q.dark.set(window.matchMedia('(prefers-color-scheme: dark)').matches)
      }
    },

    startWalletStatusWatcher() {
      this.stopWalletStatusWatcher()
      this.walletWatchInterval = setInterval(() => {
        this.checkWalletConnectionStatus()
      }, 2000)
    },

    stopWalletStatusWatcher() {
      if (this.walletWatchInterval) {
        clearInterval(this.walletWatchInterval)
        this.walletWatchInterval = null
      }
    },

    checkWalletConnectionStatus() {
      const currentAddress = this.$store.state.wallet?.address ?? null
      const walletConnectConnected = this.$walletConnect?.isConnected() ?? false

      if (!walletConnectConnected && currentAddress) {
        this.$store.dispatch('wallet/clearWallet')
        this.$q.notify({
          type: 'warning',
          message: 'Wallet disconnected. Redirecting to homepage.',
          timeout: 3000,
        })
        if (this.$route.path !== '/') {
          this.$router.push('/')
        }
      }

      if (walletConnectConnected && !currentAddress) {
        // The walletconnect boot file handles session restoration
      }
    },

    async onConnectWallet() {
      console.log('[MainLayout] onConnectWallet called', {
        hasWalletConnect: !!this.$walletConnect,
        isConnected: this.$walletConnect?.isConnected?.(),
      })
      // Reset any stuck connection state so every click attempts a fresh connection
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
      console.log('[MainLayout] notification bell clicked - checking event system works')
      this.showNotificationModal = true
    },

    toggleTheme() {
      this.$q.dark.toggle()
      localStorage.setItem('theme', this.$q.dark.isActive ? 'dark' : 'light')
    },
  },
})
</script>
