<template>
  <div :data-theme="theme">
    <!-- SECTION: Header -->
    <header>
      <div class="container header-content">
        <router-link to="/" class="brand">
          <i class="material-icons text-neon" style="font-size: 20px;">lock</i>
          <span>HODLVAULT</span>
        </router-link>
        
        <nav>
          <router-link to="/" exact-active-class="active">Home</router-link>
          <router-link to="/dashboard" exact-active-class="active">Dashboard</router-link>
          <router-link to="/about" exact-active-class="active">About</router-link>
        </nav>

        <div class="header-right">
          <div class="wallet-pill" @click="toggleMockWallet">
            <div class="dot" :class="{ connected: isConnected }"></div>
            <div style="display: flex; flex-direction: column; line-height: 1.2;">
              <span style="font-size: 8px; opacity: 0.8; font-weight: 700; letter-spacing: 0.05em;">
                {{ isConnected ? 'SECURE CONNECTION ACTIVE' : 'WALLET DISCONNECTED' }}
              </span>
              <span class="wallet-addr text-mono" style="font-size: 11px;">
                {{ isConnected ? formattedAddress : 'CONNECT WALLET' }}
              </span>
            </div>
          </div>
          <button id="notification-bell" class="btn--icon" style="background:none; border:none; color:inherit; cursor:pointer;" @click="showNotificationModal = true">
            <i class="material-icons" style="font-size: 20px;">notifications</i>
          </button>
          <button id="theme-toggle" class="btn--icon" style="background:none; border:none; color:inherit; cursor:pointer;" @click="toggleTheme">
            <i class="material-icons" style="font-size: 20px;">light_mode</i>
          </button>
          <button class="menu-toggle">
            <i class="material-icons">menu</i>
          </button>
        </div>
      </div>
    </header>

    <router-view />

    <!-- SECTION: Footer -->
    <footer>
      <div class="container footer-content">
        <div class="footer-left">
          © 2024 HODLVAULT PROTOCOL
        </div>
        <div class="footer-right">
          <span class="status-item">SYSTEM VERSION: v2.3.0</span>
          <span class="status-item text-neon">NETWORK: CHIPNET</span>
        </div>
      </div>
    </footer>

    <!-- SECTION: Notification Modal -->
    <div id="notification-modal" class="modal-overlay" :class="{ active: showNotificationModal }" @click.self="showNotificationModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3 style="margin: 0; font-size: 16px;">Notification Settings</h3>
          <button style="background:none; border:none; color:var(--color-text-dim); cursor:pointer;" @click="showNotificationModal = false">
            <i class="material-icons">close</i>
          </button>
        </div>
        <div class="modal-body">
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
        </div>
        <div class="modal-footer">
          <button class="btn btn--primary" style="padding: 8px 24px; font-size: 12px;" @click="showNotificationModal = false">Done</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MainLayout',
  data() {
    return {
      theme: 'dark',
      showNotificationModal: false,
      emailNotifyToggle: false,
      mockConnected: null
    }
  },
  computed: {
    walletAddress() {
      // Assuming store structure is available. Graceful fallback.
      return this.$store && this.$store.state.wallet && this.$store.state.wallet.address 
        ? this.$store.state.wallet.address 
        : null
    },
    isConnected() {
      // Real app condition
      if (this.walletAddress) return true;
      // Mock toggle fallback if store isn't there
      return this.mockConnected;
    },
    formattedAddress() {
      if (this.walletAddress) {
        const addr = this.walletAddress
        return addr.slice(0, 15) + '...' + addr.slice(-7)
      }
      return 'chipnet:qz4wqx8k...xqf8jrp'
    }
  },
  mounted() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    this.theme = savedTheme;
    // Apply theme variable to document
    document.documentElement.setAttribute('data-theme', this.theme);
  },
  methods: {
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', this.theme);
      localStorage.setItem('theme', this.theme);
    },
    toggleMockWallet() {
      if (!this.$store || !this.$store.state.wallet || !this.$store.state.wallet.address) {
        this.mockConnected = !this.mockConnected;
      }
    }
  }
})
</script>
