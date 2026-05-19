<template>
  <q-page class="q-pa-lg" :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'">
    <div class="container">
      <div class="row justify-center">
        <div class="col-12 col-md-10 col-lg-8">
          <!-- Header -->
          <div class="text-center q-mb-xl">
            <h1
              class="text-h4 text-weight-bold"
              :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
              q-mb-md
            >
              My Vaults
            </h1>
            <p :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-7'" q-mb-lg>
              Manage all your BCH HODL vaults in one place
            </p>
          </div>

          <!-- Vault List -->
          <div v-if="loading" class="text-center q-pa-xl">
            <q-spinner-dots color="primary" size="64px" />
            <div :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'" class="q-mt-md">
              Loading your vaults...
            </div>
          </div>

          <!-- Backend Error State -->
          <div v-else-if="backendError" class="text-center q-pa-xl">
            <q-icon name="cloud_off" size="64px" class="text-negative q-mb-md" />
            <h3
              class="text-h5"
              :class="$q.dark.isActive ? 'text-negative q-mb-md' : 'text-negative q-mb-md'"
            >
              Unable to Load Vaults
            </h3>
            <p :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-8'" q-mb-lg>
              {{ backendError }}
            </p>
            <q-btn
              color="primary"
              label="Retry"
              icon="refresh"
              size="lg"
              class="text-weight-bold"
              style="background-color: #00d588; color: #000"
              @click="loadVaults"
            />
          </div>

          <div v-else-if="vaults.length === 0" class="text-center q-pa-xl">
            <q-icon
              name="account_balance"
              size="64px"
              :class="$q.dark.isActive ? 'text-grey-6 q-mb-md' : 'text-grey-7 q-mb-md'"
            />
            <h3
              class="text-h5"
              :class="$q.dark.isActive ? 'text-grey-4 q-mb-md' : 'text-grey-7 q-mb-md'"
            >
              No Vaults Found
            </h3>
            <p :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-8'" q-mb-lg>
              You haven't created any vaults yet. Start by creating your first HODL vault.
            </p>
            <q-btn
              color="primary"
              label="Create Your First Vault"
              icon="add_circle"
              size="lg"
              class="text-weight-bold"
              style="background-color: #00d588; color: #000"
              @click="$router.push('/vault')"
            />
          </div>

          <div v-else class="q-gutter-md">
            <!-- Vault Summary Cards -->
            <q-card
              v-for="vault in vaults"
              :key="vault.id"
              flat
              bordered
              class="vault-card cursor-pointer"
              style="background-color: #1e1e1e; border-color: #333"
              @click="selectVault(vault)"
            >
              <q-card-section class="q-pa-lg">
                <div class="row items-center q-gutter-md">
                  <!-- Vault Icon and Status -->
                  <div class="col-auto">
                    <q-avatar
                      :color="vault.canWithdraw ? 'positive' : 'primary'"
                      text-color="black"
                      size="64px"
                      class="text-weight-bold"
                    >
                      <q-icon name="account_balance" size="32px" />
                    </q-avatar>
                  </div>

                  <!-- Vault Info -->
                  <div class="col">
                    <div class="text-h6 text-weight-bold text-white q-mb-sm">
                      {{ vault.name || `Vault #${vault.contractAddress.slice(-8)}` }}
                      <q-badge
                        v-if="vault.autoWithdrawal"
                        color="positive"
                        label="Auto"
                        class="q-ml-sm"
                      >
                        <q-tooltip
                          >Auto-withdrawal enabled — server will withdraw when target is
                          reached</q-tooltip
                        >
                      </q-badge>
                    </div>

                    <div class="row q-gutter-md text-body2">
                      <div class="col-auto">
                        <div class="text-grey-5">Balance</div>
                        <div class="text-white text-weight-medium">
                          {{ formatBalance(vault.balance) }} {{ balanceUnit }}
                        </div>
                      </div>

                      <div class="col-auto">
                        <div class="text-grey-5">Target Price</div>
                        <div class="text-white text-weight-medium">
                          ₱{{ vault.priceTarget.toFixed(2) }}
                        </div>
                      </div>

                      <div class="col-auto">
                        <div class="text-grey-5">Current Price</div>
                        <div class="text-white text-weight-medium">
                          ₱{{ currentBchPrice ? currentBchPrice.toFixed(2) : 'Loading...' }}
                        </div>
                      </div>
                    </div>

                    <!-- Creation Date -->
                    <div class="text-caption text-grey-6 q-mt-sm">
                      Created: {{ formatDate(vault.createdAt) }}
                    </div>

                    <!-- Status Badge -->
                    <div class="q-mt-sm">
                      <q-chip
                        :color="vault.canWithdraw ? 'positive' : 'warning'"
                        text-color="white"
                        size="sm"
                        class="text-weight-medium"
                      >
                        <q-icon
                          :name="vault.canWithdraw ? 'check_circle' : 'lock'"
                          class="q-mr-xs"
                        />
                        {{ vault.canWithdraw ? 'Ready to Withdraw' : 'HODLing' }}
                      </q-chip>
                    </div>
                  </div>

                  <!-- Action Button -->
                  <div class="col-auto">
                    <q-btn
                      flat
                      dense
                      round
                      color="primary"
                      icon="arrow_forward"
                      @click.stop="selectVault(vault)"
                    />
                  </div>
                </div>

                <!-- Auto-Withdrawal Toggle -->
                <div class="row items-center q-mt-sm">
                  <div class="col">
                    <q-toggle
                      v-model="vault.autoWithdrawal"
                      :label="vault.autoWithdrawal ? 'Auto-withdrawal ON' : 'Auto-withdrawal OFF'"
                      color="positive"
                      :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'"
                      dense
                      :disable="togglingAutoWithdrawal[vault.id] || vault.status === 'withdrawn'"
                      @update:model-value="(val) => toggleAutoWithdrawal(vault, val)"
                    >
                      <q-tooltip>
                        {{
                          vault.autoWithdrawal
                            ? 'Server will automatically withdraw when price target is reached'
                            : 'Enable to allow server to auto-withdraw when target is reached'
                        }}
                      </q-tooltip>
                    </q-toggle>
                  </div>
                  <div class="col-auto" v-if="togglingAutoWithdrawal[vault.id]">
                    <q-spinner size="16px" color="primary" />
                  </div>
                </div>
              </q-card-section>

              <!-- Progress Bar -->
              <q-linear-progress
                :value="getProgressPercentage(vault)"
                :color="vault.canWithdraw ? 'positive' : 'primary'"
                size="4px"
                class="q-mt-none"
              />
            </q-card>
          </div>

          <!-- Summary Stats -->
          <div class="q-mt-xl">
            <q-card
              flat
              bordered
              class="q-pa-lg"
              style="background-color: #1e1e1e; border-color: #333"
            >
              <div class="text-h6 text-weight-bold text-white q-mb-md">Portfolio Summary</div>

              <!-- Main Stats Row -->
              <div class="row q-gutter-lg">
                <div class="col-12 col-sm-3">
                  <div class="text-grey-5">Total Locked</div>
                  <div class="row items-center q-gutter-sm">
                    <div class="text-h4 text-primary text-weight-bold">
                      {{ formatBalance(getTotalSatoshis()) }}
                    </div>
                    <q-select
                      v-model="balanceUnit"
                      :options="balanceUnitOptions"
                      option-value="value"
                      option-label="label"
                      emit-value
                      map-options
                      dense
                      outlined
                      dark
                      style="min-width: 90px; font-size: 12px"
                    />
                  </div>
                </div>
                <div class="col-12 col-sm-3">
                  <div class="text-grey-5">Total Vaults</div>
                  <div class="text-h4 text-white text-weight-bold">
                    {{ vaults.length }}
                  </div>
                </div>
                <div class="col-12 col-sm-3">
                  <div class="text-grey-5">Ready to Withdraw</div>
                  <div class="text-h4 text-positive text-weight-bold">
                    {{ getReadyToWithdrawCount() }}
                  </div>
                </div>
                <div class="col-12 col-sm-3">
                  <div class="text-grey-5">Wallet Address</div>
                  <div
                    class="text-caption text-primary ellipsis"
                    style="max-width: 150px"
                    :title="connectedAddress"
                  >
                    {{
                      connectedAddress
                        ? connectedAddress.slice(0, 8) + '...' + connectedAddress.slice(-6)
                        : 'Not Connected'
                    }}
                  </div>
                  <q-btn
                    flat
                    dense
                    color="primary"
                    icon="history"
                    label="Activity"
                    size="sm"
                    @click="showActivityHistory = true"
                    class="q-mt-xs"
                  />
                  <!-- Notification Toggle -->
                  <div class="q-mt-sm">
                    <q-toggle
                      v-model="notificationsEnabled"
                      label="Notifications"
                      color="primary"
                      dense
                      :disable="!connectedAddress || notificationPermissionDenied"
                      @update:model-value="toggleNotifications"
                    />
                    <q-tooltip v-if="!connectedAddress">Connect wallet first</q-tooltip>
                    <q-tooltip v-if="notificationPermissionDenied">
                      Permission denied. Enable in browser settings.
                    </q-tooltip>
                  </div>

                  <!-- Email Notification -->
                  <div class="q-mt-sm">
                    <template v-if="savedEmail">
                      <div class="row items-center q-gutter-xs">
                        <q-toggle
                          v-model="emailNotificationsEnabled"
                          label="Email Notif"
                          color="primary"
                          dense
                          :disable="!connectedAddress || !emailVerified"
                          @update:model-value="toggleEmailNotifications"
                        />
                        <span class="text-caption text-grey-5">{{ savedEmail }}</span>
                        <q-badge
                          v-if="emailVerified"
                          color="positive"
                          label="Verified"
                          class="q-ml-xs"
                        />
                        <q-badge
                          v-else
                          color="warning"
                          label="Unverified"
                          class="q-ml-xs"
                        />
                        <q-btn
                          flat
                          dense
                          round
                          size="xs"
                          color="negative"
                          icon="close"
                          @click="removeEmail"
                        >
                          <q-tooltip>Remove email</q-tooltip>
                        </q-btn>
                      </div>
                      <!-- Verification code input (shown when unverified) -->
                      <div v-if="!emailVerified && showVerifyCodeInput" class="row items-center q-gutter-xs q-mt-xs">
                        <q-input
                          v-model="verificationCode"
                          placeholder="6-digit code"
                          dense
                          dark
                          outlined
                          type="text"
                          maxlength="6"
                          style="min-width: 130px"
                          :disable="verifyingCode"
                          @keyup.enter="verifyCode"
                        />
                        <q-btn
                          flat
                          dense
                          color="primary"
                          label="Verify"
                          :loading="verifyingCode"
                          :disable="verificationCode.length !== 6"
                          @click="verifyCode"
                        />
                        <q-btn
                          flat
                          dense
                          color="grey"
                          label="Resend"
                          size="sm"
                          :disable="verifyingCode"
                          @click="resendCode"
                        />
                      </div>
                      <div v-else-if="!emailVerified && !showVerifyCodeInput" class="q-mt-xs">
                        <q-btn
                          flat
                          dense
                          color="primary"
                          label="Verify Email"
                          size="sm"
                          @click="showVerifyCodeInput = true"
                        />
                      </div>
                    </template>
                    <template v-else>
                      <div class="row items-center q-gutter-xs">
                        <q-input
                          v-model="emailAddress"
                          placeholder="your@email.com"
                          dense
                          dark
                          outlined
                          type="email"
                          style="min-width: 170px"
                          :disable="!connectedAddress || savingEmail"
                          @keyup.enter="saveEmail"
                        />
                        <q-btn
                          flat
                          dense
                          color="primary"
                          icon="save"
                          :loading="savingEmail"
                          :disable="!emailAddress || !connectedAddress"
                          @click="saveEmail"
                        >
                          <q-tooltip>Save email for notifications</q-tooltip>
                        </q-btn>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity History Modal -->
    <q-dialog v-model="showActivityHistory" persistent>
      <q-card
        :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'"
        style="max-width: 800px; width: 90vw"
      >
        <q-card-section class="row items-center">
          <q-icon name="history" size="32px" class="q-mr-sm" color="primary" />
          <div class="text-h6">Activity History</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <!-- ✅ Activity Filters -->
        <q-card-section>
          <div class="row q-gutter-md q-mb-md">
            <!-- Time Filter -->
            <div class="col-12 col-sm-6">
              <label class="text-caption text-grey-6 q-mb-xs block">Time Period</label>
              <q-select
                v-model="timeFilter"
                :options="timeFilterOptions"
                outlined
                dense
                dark
                emit-value
                map-options
                @update:model-value="onFilterChange"
              />
            </div>

            <!-- Activity Type Filter -->
            <div class="col-12 col-sm-6">
              <label class="text-caption text-grey-6 q-mb-xs block">Activity Type</label>
              <q-select
                v-model="activityTypeFilter"
                :options="activityTypeOptions"
                outlined
                dense
                dark
                emit-value
                map-options
                @update:model-value="onFilterChange"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none" style="max-height: 70vh; overflow-y: auto">
          <q-list v-if="filteredActivityLogs.length > 0">
            <q-item v-for="log in filteredActivityLogs" :key="log._id" class="activity-item">
              <q-item-section avatar>
                <q-icon
                  :name="getActivityIcon(log.activityType)"
                  :color="getActivityColor(log.activityType)"
                  size="md"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ formatActivityType(log.activityType) }}
                </q-item-label>
                <q-item-label caption>
                  <span v-if="log.vaultName">Vault: {{ log.vaultName }}</span>
                  <span v-if="log.details?.amountSatoshis">
                    • {{ formatBCH(log.details.amountSatoshis) }} BCH
                  </span>
                </q-item-label>
                <q-item-label caption class="text-grey-6">
                  {{ formatDate(log.timestamp) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side v-if="log.details?.txHash">
                <q-btn
                  flat
                  dense
                  size="sm"
                  color="primary"
                  icon="open_in_new"
                  label="View TX"
                  @click="openTxExplorer(log.details.txHash)"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else-if="loadingLogs" class="text-center q-pa-lg">
            <q-spinner color="primary" size="32px" />
            <p class="text-grey-6 q-mt-sm">Loading activity history...</p>
          </div>

          <div v-else class="text-center q-pa-lg text-grey-6">
            <q-icon name="history" size="48px" class="q-mb-sm" />
            <p>No activity found for selected filters</p>
            <p class="text-caption">Try adjusting your time period or activity type filters</p>
          </div>

          <!-- Load More -->
          <div v-if="hasMoreLogs && !loadingLogs" class="text-center q-pa-md">
            <q-btn
              flat
              color="primary"
              label="Load More"
              :loading="loadingMore"
              @click="loadMoreLogs"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { vaultStorage } from 'src/services/vault-storage'
import { connectSSE, disconnectSSE } from 'src/services/sse.service'
import {
  requestNotificationPermission,
  unsubscribeFromNotifications,
  isNotificationSubscribed,
} from 'src/boot/onesignal'
import { oneSignalApi } from 'src/services/onesignal-api'
import { emailApi } from 'src/services/email-api'
import { suggestDomainFix } from 'src/utils/email-utils'
import { vaultApi } from 'src/services/api.service'

export default defineComponent({
  name: 'MyVaultsPage',

  data() {
    return {
      loading: false,
      vaults: [],
      backendError: null,
      currentBchPrice: null,
      priceLoading: false,
      balanceInterval: null,
      refreshInterval: null, // ✅ Auto-refresh interval for vault list
      showActivityHistory: false,
      activityLogs: [],
      loadingLogs: false,
      loadingMore: false,
      logsSkip: 0,
      logsLimit: 20,
      hasMoreLogs: false,
      // ✅ Activity log filters
      timeFilter: 'all', // today, yesterday, thisWeek, thisMonth, thisYear, all
      activityTypeFilter: 'all', // all, deposits, withdrawals
      // ✅ Balance unit display
      balanceUnit: 'sats', // 'sats', 'mBCH', 'BCH'
      balanceUnitOptions: [
        { label: 'sats', value: 'sats' },
        { label: 'mBCH', value: 'mBCH' },
        { label: 'BCH', value: 'BCH' },
      ],
      // ✅ Push notification state
      notificationsEnabled: false,
      notificationPermissionDenied: false,
      // ✅ Email notification state
      savedEmail: null,
      emailVerified: false,
      emailAddress: '',
      emailNotificationsEnabled: false,
      savingEmail: false,
      showVerifyCodeInput: false,
      verificationCode: '',
      verifyingCode: false,
      resendCount: 0,
      // ✅ Auto-withdrawal toggle loading states
      togglingAutoWithdrawal: {},
    }
  },

  computed: {
    connectedAddress() {
      return this.$store.state.wallet?.address ?? null
    },

    timeFilterOptions() {
      return [
        { label: 'All Time', value: 'all' },
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'This Week', value: 'thisWeek' },
        { label: 'This Month', value: 'thisMonth' },
        { label: 'This Year', value: 'thisYear' },
      ]
    },

    activityTypeOptions() {
      return [
        { label: 'All Activities', value: 'all' },
        { label: 'Deposits Only', value: 'deposits' },
        { label: 'Withdrawals Only', value: 'withdrawals' },
      ]
    },

    filteredActivityLogs() {
      let filtered = [...this.activityLogs]

      // Filter by time period
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const thisWeek = new Date(today)
      thisWeek.setDate(thisWeek.getDate() - 7)
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const thisYear = new Date(now.getFullYear(), 0, 1)

      switch (this.timeFilter) {
        case 'today':
          filtered = filtered.filter((log) => new Date(log.timestamp) >= today)
          break
        case 'yesterday':
          filtered = filtered.filter((log) => {
            const logDate = new Date(log.timestamp)
            return logDate >= yesterday && logDate < today
          })
          break
        case 'thisWeek':
          filtered = filtered.filter((log) => new Date(log.timestamp) >= thisWeek)
          break
        case 'thisMonth':
          filtered = filtered.filter((log) => new Date(log.timestamp) >= thisMonth)
          break
        case 'thisYear':
          filtered = filtered.filter((log) => new Date(log.timestamp) >= thisYear)
          break
      }

      // Filter by activity type
      switch (this.activityTypeFilter) {
        case 'deposits':
          filtered = filtered.filter((log) => log.activityType === 'DEPOSIT')
          break
        case 'withdrawals':
          filtered = filtered.filter((log) => log.activityType === 'WITHDRAWAL')
          break
      }

      return filtered
    },
  },

  mounted() {
    this.loadVaults()
    this.startSilentBalanceRefresh() // ✅ Start silent balance refresh (no blinking)
    this.fetchCurrentPrice()
    this.startBalancePolling()

    // ✅ Connect to real-time SSE updates
    connectSSE()

    // ✅ Check notification subscription status
    this.checkNotificationStatus()

    // Re-check notification status when tab becomes visible (permission may have changed)
    document.addEventListener('visibilitychange', this.onVisibilityChange)

    // Listen for vault withdrawal events
    window.addEventListener('vault-withdrawn', this.handleVaultWithdrawn)

    // Listen for new activity events (real-time activity history updates)
    window.addEventListener('new-activity', this.handleNewActivity)
  },

  beforeUnmount() {
    this.stopBalancePolling()
    this.stopSilentBalanceRefresh() // ✅ Stop silent balance refresh

    // ✅ Disconnect SSE and remove event listeners
    disconnectSSE()
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    window.removeEventListener('vault-withdrawn', this.handleVaultWithdrawn)
    window.removeEventListener('new-activity', this.handleNewActivity)
  },

  methods: {
    /**
     * Toggle push notifications on/off
     */
    async toggleNotifications(enabled) {
      console.log(`[NotifDebug:page] toggleNotifications() called | enabled=${enabled} | current_perm=${Notification.permission} | optIn_connected=${!!this.connectedAddress}`)
      const startTime = Date.now()

      if (enabled) {
        console.log(`[NotifDebug:page] Turning ON — calling requestNotificationPermission()`)
        const result = await requestNotificationPermission()
        console.log(`[NotifDebug:page] requestNotificationPermission() returned | success=${result.success} | playerId=${result.playerId ? result.playerId.slice(0, 16) + '...' : 'null'} | error=${result.error || 'null'} | elapsed=${Date.now() - startTime}ms`)

        if (result.success) {
          this.notificationsEnabled = true
          this.notificationPermissionDenied = false
          console.log(`[NotifDebug:page] Permission granted — updating backend preference to true`)
          await oneSignalApi.updateNotificationPreference(true)
          this.$q.notify({ type: 'positive', message: 'Push notifications enabled' })
        } else {
          this.notificationsEnabled = false
          const errMsg = (result.error || '').toLowerCase()
          const isDenied = errMsg.includes('denied') || Notification.permission === 'denied'
          const isTimeout = errMsg.includes('timeout')
          console.log(`[NotifDebug:page] Permission result | errMsg=${result.error} | isDenied=${isDenied} | isTimeout=${isTimeout} | Notification.permission=${Notification.permission}`)
          if (isDenied) {
            this.notificationPermissionDenied = true
            this.$q.notify({
              type: 'warning',
              message: 'Notification permission denied. Enable in browser settings.',
            })
          } else if (isTimeout) {
            this.$q.notify({
              type: 'warning',
              message: 'Notification setup timed out. Please try again.',
            })
          } else {
            this.$q.notify({
              type: 'negative',
              message: 'Failed to enable notifications: ' + (result.error || 'Unknown error'),
            })
          }
        }
      } else {
        console.log(`[NotifDebug:page] Turning OFF — calling unsubscribeFromNotifications()`)
        const unsubResult = await unsubscribeFromNotifications()
        console.log(`[NotifDebug:page] unsubscribeFromNotifications() returned | success=${unsubResult.success} | error=${unsubResult.error || 'null'} | elapsed=${Date.now() - startTime}ms`)
        this.notificationsEnabled = false
        this.$q.notify({ type: 'info', message: 'Push notifications disabled' })
      }
    },

    /**
     * Toggle email notifications on/off
     */
    async toggleEmailNotifications(enabled) {
      try {
        if (enabled && !this.savedEmail) {
          this.emailNotificationsEnabled = false
          return
        }
        await emailApi.updateEmailNotificationPreference(enabled)
        this.emailNotificationsEnabled = enabled
        this.$q.notify({
          type: enabled ? 'positive' : 'info',
          message: enabled ? 'Email notifications enabled' : 'Email notifications disabled',
        })
      } catch {
        this.emailNotificationsEnabled = !enabled
        this.$q.notify({
          type: 'negative',
          message: 'Failed to update email notification preference',
        })
      }
    },

    /**
     * Save email address for notifications
     */
    async saveEmail() {
      if (!this.emailAddress) return
      console.log(`[NotifDebug:page] saveEmail() called | email=${this.emailAddress.slice(0, 6)}...`)

      const typo = suggestDomainFix(this.emailAddress)
      if (typo) {
        console.log(`[NotifDebug:page] Domain typo detected | typed=${typo.typed} | suggested=${typo.suggestion}`)
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
          this.emailAddress = typo.suggestion
          console.log(`[NotifDebug:page] Domain corrected | now=${this.emailAddress}`)
        }
      }

      this.savingEmail = true
      try {
        console.time('[NotifDebug:page] saveEmail API call')
        const result = await emailApi.registerEmail(this.emailAddress)
        console.timeEnd('[NotifDebug:page] saveEmail API call')
        console.log(`[NotifDebug:page] saveEmail response | verificationSent=${result.verificationSent} | verificationError=${result.verificationError || 'none'}`)

        this.savedEmail = result.email
        this.emailVerified = false
        this.emailAddress = ''
        this.emailNotificationsEnabled = true
        this.showVerifyCodeInput = true
        this.verificationCode = ''
        this.resendCount = 0

        if (result.verificationSent) {
          this.$q.notify({
            type: 'positive',
            message: 'Verification code sent to your email',
          })
        } else {
          this.$q.notify({
            type: 'warning',
            message: 'Email saved but verification email could not be sent. Check SMTP settings or click Resend.',
            timeout: 8000,
          })
        }
      } catch (err) {
        const errMsg = err?.response?.data?.message || err.message || 'Unknown error'
        console.error(`[NotifDebug:page] saveEmail failed | error=${errMsg} | responseStatus=${err?.response?.status || 'N/A'}`, err)
        this.$q.notify({
          type: 'negative',
          message: `Failed to save email: ${errMsg}`,
          timeout: 8000,
        })
      } finally {
        this.savingEmail = false
        console.log(`[NotifDebug:page] saveEmail() complete | savedEmail=${this.savedEmail ? this.savedEmail.slice(0, 6) + '...' : 'null'}`)
      }
    },

    async verifyCode() {
      if (this.verificationCode.length !== 6) return
      console.log(`[NotifDebug:page] verifyCode() called | code=${this.verificationCode}`)
      this.verifyingCode = true
      try {
        await emailApi.verifyEmailCode(this.verificationCode)
        console.log('[NotifDebug:page] verifyCode success')
        this.emailVerified = true
        this.showVerifyCodeInput = false
        this.verificationCode = ''
        this.resendCount = 0
        this.$q.notify({
          type: 'positive',
          message: 'Email verified successfully!',
        })
      } catch (err) {
        const msg = err?.response?.data?.message || 'Verification failed'
        console.error(`[NotifDebug:page] verifyCode failed | error=${msg}`, err)
        if (msg.toLowerCase().includes('expired')) {
          this.$q.notify({
            type: 'warning',
            message: 'Code expired. Request a new one.',
          })
        } else {
          this.$q.notify({
            type: 'negative',
            message: msg,
          })
        }
      } finally {
        this.verifyingCode = false
        console.log(`[NotifDebug:page] verifyCode() complete | emailVerified=${this.emailVerified}`)
      }
    },

    async resendCode() {
      console.log('[NotifDebug:page] resendCode() called')
      this.resendCount++
      console.log(`[NotifDebug:page] resendCount=${this.resendCount}`)
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
        console.log('[NotifDebug:page] resendCode success')
        this.verificationCode = ''
        this.$q.notify({
          type: 'positive',
          message: 'New verification code sent',
        })
      } catch (err) {
        console.error(`[NotifDebug:page] resendCode failed | error=${err.message}`, err)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to resend code',
        })
      } finally {
        this.verifyingCode = false
      }
    },

    /**
     * Remove email address
     */
    async removeEmail() {
      console.log('[NotifDebug:page] removeEmail() called')
      try {
        await emailApi.unregisterEmail()
        console.log('[NotifDebug:page] removeEmail success')
        this.savedEmail = null
        this.emailNotificationsEnabled = false
        this.$q.notify({
          type: 'info',
          message: 'Email removed',
        })
        this.emailVerified = false
        this.showVerifyCodeInput = false
        this.verificationCode = ''
      } catch (err) {
        console.error(`[NotifDebug:page] removeEmail failed | error=${err.message}`, err)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to remove email',
        })
      }
    },

    /**
     * Check current notification subscription status
     */
    async checkNotificationStatus() {
      console.log(`[NotifDebug:page] checkNotificationStatus() called | Notification.permission=${Notification.permission} | connected=${!!this.connectedAddress}`)
      try {
        if (Notification.permission === 'denied') {
          console.log(`[NotifDebug:page] Permission is denied — disabling`)
          this.notificationPermissionDenied = true
          this.notificationsEnabled = false
          return
        }

        if (this.notificationPermissionDenied && Notification.permission === 'granted') {
          console.log(`[NotifDebug:page] Permission was previously denied but now granted — resetting flag`)
          this.notificationPermissionDenied = false
        }

        console.log(`[NotifDebug:page] Checking OneSignal subscription status`)
        const subscribed = await isNotificationSubscribed()
        console.log(`[NotifDebug:page] isNotificationSubscribed() = ${subscribed}`)
        this.notificationsEnabled = subscribed

        if (this.connectedAddress) {
          console.log(`[NotifDebug:page] Fetching backend preferences`)
          const prefs = await oneSignalApi.getPreferences()
          console.log(`[NotifDebug:page] Backend prefs | notifications=${prefs?.preferences?.notifications} | hasPlayerId=${!!prefs?.oneSignalPlayerId} | email=${!!prefs?.email} | emailNotifications=${prefs?.preferences?.emailNotifications}`)
          if (prefs?.preferences?.notifications === false) {
            console.log(`[NotifDebug:page] Backend says notifications disabled — overriding toggle to OFF`)
            this.notificationsEnabled = false
          }
          // Email notification state
          this.savedEmail = prefs?.email || null
          this.emailVerified = prefs?.emailVerified === true
          this.emailNotificationsEnabled = prefs?.preferences?.emailNotifications === true
          if (this.savedEmail && !this.emailVerified) {
            this.showVerifyCodeInput = false
          }
        }

        console.log(`[NotifDebug:page] checkNotificationStatus() final state | notificationsEnabled=${this.notificationsEnabled} | permissionDenied=${this.notificationPermissionDenied}`)
      } catch (err) {
        console.warn(`[NotifDebug:page] Status check failed: ${err.message}`, err)
      }
    },

    /**
     * Re-check notification status when tab becomes visible
     */
    onVisibilityChange() {
      console.log(`[NotifDebug:page] visibilitychange | state=${document.visibilityState}`)
      if (document.visibilityState === 'visible') {
        console.log(`[NotifDebug:page] Tab became visible — re-checking notification status`)
        this.checkNotificationStatus()
      }
    },

    /**
     * Toggle auto-withdrawal for a vault
     */
    async toggleAutoWithdrawal(vault, enabled) {
      const vaultId = vault.id || vault._id

      // Set loading state
      this.togglingAutoWithdrawal = { ...this.togglingAutoWithdrawal, [vaultId]: true }

      try {
        const response = await vaultApi.toggleAutoWithdrawal(vaultId, enabled)

        // Update local vault state
        vault.autoWithdrawal = enabled

        // Update in vaultStorage too
        await vaultStorage.updateVault(vault.contractAddress, { autoWithdrawal: enabled })

        this.$q.notify({
          type: 'positive',
          message: `Auto-withdrawal ${enabled ? 'enabled' : 'disabled'} for ${vault.name || 'vault'}`,
          timeout: 3000,
        })

        console.log('[AutoWithdrawal] Toggled:', response)
      } catch (err) {
        console.error('[AutoWithdrawal] Toggle failed:', err)

        // Revert the toggle on error
        vault.autoWithdrawal = !enabled

        this.$q.notify({
          type: 'negative',
          message: err?.response?.data?.message || 'Failed to toggle auto-withdrawal',
          timeout: 5000,
        })
      } finally {
        // Clear loading state
        this.togglingAutoWithdrawal = { ...this.togglingAutoWithdrawal, [vaultId]: false }
      }
    },

    /**
     * Handle real-time vault withdrawal event from SSE
     */
    handleVaultWithdrawn(event) {
      const { vaultId, contractAddress, amountSatoshis } = event.detail
      console.log('[SSE] Vault withdrawn in real-time:', {
        vaultId,
        contractAddress,
        amountSatoshis,
      })

      // Remove the withdrawn vault from the list immediately
      this.vaults = this.vaults.filter((v) => v.contractAddress !== contractAddress)

      // Show notification
      this.$q.notify({
        type: 'positive',
        message: `Auto-withdrawal complete! ${(amountSatoshis / 100000000).toFixed(8)} BCH returned to your wallet`,
        timeout: 5000,
      })

      // Refresh vaults from backend to ensure sync
      setTimeout(() => this.loadVaults(), 1000)
    },

    /**
     * Handle real-time new activity event from SSE
     */
    handleNewActivity(event) {
      const { activity } = event.detail
      console.log('[SSE] New activity received:', activity)

      // Add new activity to the beginning of the list
      if (this.showActivityHistory) {
        this.activityLogs.unshift(activity)
        console.log('[SSE] Activity history updated with new entry')
      }
    },

    async loadVaults() {
      this.loading = true
      this.backendError = null
      try {
        let storedVaults = []

        if (this.connectedAddress) {
          try {
            console.log('Fetching vaults from backend for wallet:', this.connectedAddress)
            storedVaults = await vaultStorage.getVaultsByWallet(this.connectedAddress)
            console.log(`Loaded ${storedVaults.length} vaults from backend`)
          } catch (backendError) {
            console.error('Failed to fetch vaults from backend:', backendError)
            this.backendError = backendError.message || 'Backend is unreachable'
            this.vaults = []
            this.loading = false
            return
          }
        } else {
          // No wallet connected
          this.vaults = []
          this.loading = false
          return
        }

        // Process vaults with blockchain balance refresh
        this.vaults = await Promise.all(
          storedVaults.map(async (vault) => {
            if (!vault.priceTarget && vault.priceTargetCents) {
              vault.priceTarget = vault.priceTargetCents / 100
            }

            try {
              const { getAddressBalance } = await import('src/services/blockchain')
              const currentBalance = await getAddressBalance(vault.contractAddress)

              vaultStorage.updateVaultBalance(vault.contractAddress, Number(currentBalance))

              return {
                ...vault,
                balance: Number(currentBalance),
                canWithdraw: this.checkCanWithdraw({ ...vault, balance: Number(currentBalance) }),
              }
            } catch (balanceError) {
              console.warn(
                `Failed to fetch balance for vault ${vault.contractAddress}:`,
                balanceError,
              )
              return {
                ...vault,
                canWithdraw: this.checkCanWithdraw(vault),
              }
            }
          }),
        )

        console.log('Loaded vaults with refreshed balances:', this.vaults)
      } catch (error) {
        console.error('Failed to load vaults:', error)
        this.backendError = 'An unexpected error occurred while loading vaults'
      } finally {
        this.loading = false
      }
    },

    // ✅ Auto-refresh methods for automatic data updates (silent balance-only updates)
    startSilentBalanceRefresh() {
      // Silently refresh only balances every 30 seconds - no full page re-render
      this.refreshInterval = setInterval(() => {
        this.silentRefreshBalances()
      }, 30000)
      console.log('✅ Silent balance refresh started (every 30s)')
    },

    stopSilentBalanceRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
        this.refreshInterval = null
        console.log('🛑 Silent balance refresh stopped')
      }
    },

    // Silently refresh only vault balances without re-rendering the entire list
    async silentRefreshBalances() {
      if (this.vaults.length === 0) return

      console.log('🔄 Silently refreshing vault balances...')

      for (let i = 0; i < this.vaults.length; i++) {
        const vault = this.vaults[i]
        try {
          const { getAddressBalance } = await import('src/services/blockchain')
          const newBalance = Number(await getAddressBalance(vault.contractAddress))

          // Only update if balance changed to avoid unnecessary re-renders
          if (vault.balance !== newBalance) {
            vault.balance = newBalance
            vault.canWithdraw = this.checkCanWithdraw(vault)
            // Update storage silently
            vaultStorage.updateVaultBalance(vault.contractAddress, newBalance)
          }
        } catch (error) {
          // Silently fail - don't disrupt UI
          console.warn(`Silent balance refresh failed for ${vault.contractAddress}:`, error)
        }
      }

      console.log('✅ Silent balance refresh complete')
    },

    async fetchCurrentPrice() {
      this.priceLoading = true
      try {
        // Import oracle service
        const { fetchOraclePrice } = await import('src/services/oracle')
        const result = await fetchOraclePrice()
        this.currentBchPrice = result.price
      } catch (error) {
        console.error('Failed to fetch current price:', error)
        // Fallback price
        this.currentBchPrice = 450.0
      } finally {
        this.priceLoading = false
      }
    },

    checkCanWithdraw(vault) {
      if (!this.currentBchPrice || !vault.priceTarget) return false
      return Number(this.currentBchPrice) >= Number(vault.priceTarget)
    },

    formatBalance(satoshis) {
      if (!satoshis) return '0'

      const sats = Number(satoshis)

      switch (this.balanceUnit) {
        case 'BCH':
          return (sats / 100000000).toFixed(8)
        case 'mBCH':
          return (sats / 100000).toFixed(5)
        case 'sats':
        default:
          return sats.toLocaleString()
      }
    },

    formatDate(timestamp) {
      if (!timestamp) return 'Unknown'
      const date = new Date(timestamp)
      const dateStr = date.toLocaleDateString()
      const timeStr = date.toLocaleTimeString()
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      return `${dateStr} ${timeStr} (${timeZone})`
    },

    getProgressPercentage(vault) {
      if (!this.currentBchPrice || !vault.priceTarget) return 0
      const progress = (this.currentBchPrice / vault.priceTarget) * 100
      return Math.min(progress, 100)
    },

    getTotalSatoshis() {
      return this.vaults.reduce((total, vault) => {
        return total + (vault.balance || 0)
      }, 0)
    },

    getTotalBalance() {
      return this.vaults.reduce((total, vault) => {
        return total + (vault.balance || 0) / 100000000
      }, 0)
    },

    getReadyToWithdrawCount() {
      return this.vaults.filter((vault) => vault.canWithdraw).length
    },

    selectVault(vault) {
      // Pass contract address via route query — VaultManagePage fetches from backend
      this.$router.push(`/vault/manage?contract=${encodeURIComponent(vault.contractAddress)}`)
    },

    startBalancePolling() {
      this.stopBalancePolling()
      this.balanceInterval = setInterval(() => {
        this.refreshVaultBalances()
      }, 30000) // Poll every 30 seconds
    },

    stopBalancePolling() {
      if (this.balanceInterval) {
        clearInterval(this.balanceInterval)
        this.balanceInterval = null
      }
    },

    async refreshVaultBalances() {
      if (this.vaults.length === 0) return

      try {
        // Refresh balances for all vaults
        const updatedVaults = await Promise.all(
          this.vaults.map(async (vault) => {
            try {
              const { getAddressBalance } = await import('src/services/blockchain')
              const currentBalance = await getAddressBalance(vault.contractAddress)

              // Update vault balance in storage (convert BigInt to Number for JSON serialization)
              vaultStorage.updateVaultBalance(vault.contractAddress, Number(currentBalance))

              return {
                ...vault,
                balance: Number(currentBalance),
                canWithdraw: this.checkCanWithdraw({ ...vault, balance: Number(currentBalance) }),
              }
            } catch (balanceError) {
              console.warn(
                `Failed to refresh balance for vault ${vault.contractAddress}:`,
                balanceError,
              )
              return vault
            }
          }),
        )

        this.vaults = updatedVaults
        console.log('Vault balances refreshed automatically')
      } catch (error) {
        console.error('Failed to refresh vault balances:', error)
      }
    },

    onFilterChange() {
      // When filters change, just recompute filteredActivityLogs
      // The computed property handles the filtering automatically
      console.log('Filters changed:', {
        timeFilter: this.timeFilter,
        activityTypeFilter: this.activityTypeFilter,
      })
    },

    async loadActivityHistory() {
      this.loadingLogs = true
      this.logsSkip = 0
      try {
        const { activityLogApi } = await import('src/services/activity-log-api.js')
        const result = await activityLogApi.getHistory(this.logsLimit, this.logsSkip)

        this.activityLogs = result.logs || []
        this.hasMoreLogs = result.hasMore || false
      } catch (error) {
        console.error('Failed to load activity history:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load activity history',
          timeout: 3000,
        })
      } finally {
        this.loadingLogs = false
      }
    },

    async loadMoreLogs() {
      this.loadingMore = true
      this.logsSkip += this.logsLimit

      try {
        const { activityLogApi } = await import('src/services/activity-log-api.js')
        const result = await activityLogApi.getHistory(this.logsLimit, this.logsSkip)

        this.activityLogs.push(...(result.logs || []))
        this.hasMoreLogs = result.hasMore || false
      } catch (error) {
        console.error('Failed to load more logs:', error)
      } finally {
        this.loadingMore = false
      }
    },

    getActivityIcon(type) {
      const icons = {
        VAULT_CREATED: 'add_circle',
        DEPOSIT: 'arrow_downward',
        WITHDRAWAL: 'arrow_upward',
        PRICE_TARGET_REACHED: 'check_circle',
        VAULT_DELETED: 'delete',
      }
      return icons[type] || 'info'
    },

    getActivityColor(type) {
      const colors = {
        VAULT_CREATED: 'positive',
        DEPOSIT: 'red', // 🔴 Red for deposits (money going in)
        WITHDRAWAL: 'positive', // 🟢 Green for withdrawals (money going out)
        PRICE_TARGET_REACHED: 'warning',
        VAULT_DELETED: 'grey',
      }
      return colors[type] || 'grey'
    },

    formatActivityType(type) {
      return type
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase())
    },

    formatBCH(satoshis) {
      return (satoshis / 100000000).toFixed(8)
    },

    openTxExplorer(txHash) {
      window.open(`https://chipnet.bch.ninja/tx/${txHash}`, '_blank')
    },
  },

  watch: {
    showActivityHistory(val) {
      if (val) {
        this.loadActivityHistory()
      }
    },
  },
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.vault-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.vault-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 213, 136, 0.15);
  border-color: #00d588;
}

.q-linear-progress {
  border-radius: 0 0 12px 12px;
}

/* Custom primary color override */
.q-btn.color-primary {
  background-color: #00d588 !important;
  color: #000 !important;
}
</style>
