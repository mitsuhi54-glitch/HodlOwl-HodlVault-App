<template>
  <main class="container container--page-dashboard">
    <div class="page-grid">

        <!-- LEFT SIDEBAR -->
        <aside>
          <div class="card card--elevated" style="padding: 20px;">
            <span class="label-tiny">Wallet Balance</span>
            <div style="font-size: 24px; font-weight: 700; margin-top: 4px; display: flex; align-items: baseline; gap: 4px;">
              <span class="val-sync-balance" :data-sats="walletSats">{{ formatBalance(walletSats) }}</span>
              <span class="text-neon val-sync-unit" style="font-size: 14px; font-weight: 700;">{{ unit }}</span>
            </div>
            <div class="text-muted text-mono" style="font-size: 12px; margin-top: 2px;">
              {{ phpBalance }}
            </div>
          </div>

          <div class="card card--elevated" style="margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="label-tiny">Market Feed</span>
              <button v-if="!priceLoading" class="btn btn--outline" style="padding: 4px 12px; font-size: 10px;" @click="refreshPrice">Refresh</button>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 10px;">
              <i v-if="priceLoading" class="material-icons text-muted" style="font-size: 16px;">sync</i>
              <i v-else-if="oracleSuccess" class="material-icons text-neon" style="font-size: 16px;">check_circle</i>
              <i v-else class="material-icons" style="color: #ffb300; font-size: 16px;">warning</i>
              <span v-if="priceLoading" style="font-size: 12px; color: var(--color-text-dim);">Fetching oracle price...</span>
              <span v-else-if="oracleSuccess" style="font-size: 12px; color: var(--color-neon);">Oracle online</span>
              <span v-else style="font-size: 12px; color: #ffb300;">Oracle unavailable — refresh before deploying</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 10px;">
              <span class="text-muted" style="font-size: 13px;">BCH Price (Oracle)</span>
              <span v-if="priceLoading" style="font-size: 12px; color: var(--color-text-dim);">Loading...</span>
              <span v-else-if="oracleSuccess" class="text-neon text-heading" style="font-size: 14px;">₱{{ formatPrice(currentBchPrice) }}</span>
              <span v-else class="text-muted" style="font-size: 12px; cursor: pointer;" @click="refreshPrice">Offline — Tap to retry</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 8px;">
              <span class="text-muted" style="font-size: 13px;">Network Fee</span>
              <span style="color: #ffb800; font-family: var(--font-mono); font-size: 12px;">1 sat/B</span>
            </div>
            <div v-if="walletConnected && vaults.length > 0" style="margin-top: 12px; border-top: 1px solid var(--color-border); padding-top: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span class="text-muted">Avg Progress</span>
                <span class="text-neon" style="font-family: var(--font-mono);">{{ avgProgress }}%</span>
              </div>
            </div>
          </div>

          <div class="card card--elevated portfolio-summary" style="padding-bottom: 20px; margin-top: 16px;">
            <div v-if="!walletConnected" class="portfolio-view-disconnected" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 0; text-align: center;">
              <i class="material-icons" style="font-size: 48px; color: var(--color-text-dim); margin-bottom: 16px;">account_balance_wallet</i>
              <p style="font-size: 14px; margin-bottom: 16px; color: var(--color-text-muted);">Connect your wallet to view portfolio.</p>
            </div>

            <div v-else class="portfolio-view-connected">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div class="portfolio-summary__title label-tiny" style="color: var(--color-text); font-weight: 700; margin-bottom: 0;">Portfolio Summary</div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 10px; color: var(--color-text-dim); text-transform: uppercase;">Display:</span>
                  <select class="unit-selector balance-unit-sync" v-model="unit">
                    <option value="sats">sats</option>
                    <option value="mBCH">mBCH</option>
                    <option value="BCH">BCH</option>
                  </select>
                </div>
              </div>

              <div class="portfolio-summary__stats-grid">
                <div class="portfolio-summary__stat-item portfolio-summary__stat-item--flex">
                  <span class="portfolio-summary__label">Total Locked</span>
                  <div style="display: flex; align-items: baseline; gap: 4px;">
                    <span class="portfolio-summary__value portfolio-summary__value--neon val-sync-balance" :data-sats="totalLockedSats" style="font-size: 20px;">{{ formatBalance(totalLockedSats) }}</span>
                    <span class="text-mono val-sync-unit" style="font-size: 10px; color: var(--color-neon); font-weight: 700;">{{ unit }}</span>
                  </div>
                </div>
              </div>

              <div v-if="loadingVaults" style="border-top: 1px solid rgba(255, 255, 255, 0.05); margin-top: 16px; padding-top: 12px;">
                <span style="font-size: 12px; color: var(--color-text-dim);">Loading vaults...</span>
              </div>

              <div v-else style="border-top: 1px solid rgba(255, 255, 255, 0.05); margin-top: 16px; padding-top: 12px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; gap: 24px;">
                  <div class="portfolio-summary__stat-item">
                    <span class="portfolio-summary__label">Vaults</span>
                    <span class="portfolio-summary__value">{{ vaults.length }}</span>
                  </div>
                  <div class="portfolio-summary__stat-item">
                    <span class="portfolio-summary__label">Ready</span>
                    <span class="portfolio-summary__value portfolio-summary__value--neon">{{ readyCount }}</span>
                  </div>
                </div>
                <button class="portfolio-summary__activity-btn" style="margin-top: 0;" @click="showActivityModal = true; loadActivityHistory()">
                  <i class="material-icons" style="font-size: 14px;">history</i>
                  Activity
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- CENTER COLUMN: Create Vault Form -->
        <section id="create-vault-section">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
            <div>
              <h1 style="font-size: 32px; display: inline-block;">CREATE <span class="text-neon">HODL</span> VAULT</h1>
              <p class="text-muted" style="font-size: 14px; margin-top: 4px;">Set your target price and secure your Bitcoin Cash.</p>
            </div>
            <div class="slideshow-container" style="width: 260px; height: 72px; position: relative; border-radius: 8px; overflow: hidden; border: 1px solid var(--color-border); box-shadow: 0 0 15px rgba(0, 255, 136, 0.1); background: var(--color-surface-input);">
              <div class="slide" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                <img src="https://images.unsplash.com/photo-1639762681485-074b7f4ec651?auto=format&fit=crop&q=80&w=400" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8; mix-blend-mode: screen;">
              </div>
              <div class="slide" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                <img src="https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&q=80&w=400" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8; mix-blend-mode: screen;">
              </div>
              <div class="slide" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                <img src="https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&q=80&w=400" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8; mix-blend-mode: screen;">
              </div>
            </div>
          </div>

          <div class="card" style="padding: 28px; border: 1px solid var(--color-border);">
            <div style="grid-template-columns: 1fr 1fr; display: grid; gap: 20px;">
              <div class="field">
                <label class="label-tiny">Vault Name</label>
                <q-input v-model="vaultName" placeholder="My Alpha HODL" outlined dense dark class="custom-input" />
              </div>
              <div class="field">
                <label class="label-tiny">Target Price (PHP)</label>
                <q-input v-model="targetPrice" type="number" outlined dense dark class="custom-input" prefix="₱" />
              </div>
            </div>

            <div class="field">
              <label class="label-tiny">Amount to Lock ({{ unit }})</label>
              <q-input v-model="lockAmount" type="number" step="0.001" placeholder="5.000" outlined dense dark class="custom-input" :suffix="unit" />
            </div>

            <div v-if="currentBchPrice" class="field">
              <label class="label-tiny">Preset Targets</label>
              <div class="chip-row">
                <div v-for="preset in priceTargetPresets" :key="preset.key" class="chip" :class="{ active: selectedPreset === preset.key }" @click="selectPreset(preset.key, preset.multiplier)">
                  {{ preset.label }}
                  <span style="opacity: 0.7; margin-left: 2px;">(+{{ preset.percent }}%)</span>
                </div>
              </div>
            </div>

            <div class="field" style="display: flex; align-items: center; gap: 12px; margin-top: 12px;">
              <q-toggle v-model="autoWithdrawal" color="positive" />
              <span style="font-size: 14px;">Enable Auto-Withdrawal</span>
            </div>

            <q-btn
              class="btn btn--primary btn--full"
              style="height: 56px; margin-top: 24px;"
              :label="deploying ? 'Deploying...' : 'Deploy Smart Contract'"
              :loading="deploying"
              @click="deployContract"
              :disable="!walletConnected || !canDeploy"
            />
          </div>
        </section>

        <!-- RIGHT SIDEBAR: Active Vaults -->
        <aside style="display: flex; flex-direction: column; gap: 0;">
          <VaultsEmptyState
            v-if="showVaultsEmptyState"
            @action="onVaultsEmptyStateAction"
          />


          <div v-else class="active-vaults-view-connected">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 0 4px;">
              <h2 class="label-tiny" style="margin: 0; display: flex; align-items: center; gap: 8px;">
                Active Vaults
                <span style="background: var(--color-border); padding: 1px 6px; border-radius: 10px; font-size: 9px; color: var(--color-text-dim);">{{ vaults.length }}</span>
              </h2>
            </div>

            <div id="vaults-list">
              <div v-if="loadingVaults" style="text-align: center; padding: 40px 20px; color: var(--color-text-dim); font-size: 12px;">
                Loading vaults...
              </div>

              <div v-else-if="backendError" style="text-align: center; padding: 40px 20px;">
                <i class="material-icons" style="font-size: 32px; color: var(--color-text-dim);">cloud_off</i>
                <p style="font-size: 12px; color: var(--color-text-dim); margin-top: 8px;">{{ backendError }}</p>
                <button class="btn btn--outline" style="margin-top: 12px; padding: 6px 16px; font-size: 11px;" @click="loadVaults">Retry</button>
              </div>

              <div v-for="(vault, index) in vaults" :key="vault.id || index" class="vault-card" @click="openVaultManage(vault)">
                <div class="vault-card__header">
                  <div class="vault-card__avatar" :class="canVaultWithdraw(vault) ? 'vault-card__avatar--ready' : 'vault-card__avatar--hodl'">
                    <i class="material-icons">{{ canVaultWithdraw(vault) ? 'lock_open' : 'lock' }}</i>
                  </div>
                  <div class="vault-card__title-area">
                    <div class="vault-card__name">{{ vault.name || `Vault #${(vault.contractAddress || '').slice(-8)}` }}</div>
                  </div>
                  <i class="material-icons vault-card__arrow">arrow_forward</i>
                </div>

                <div class="vault-card__metrics">
                  <div>
                    <div class="vault-card__metric-label">Balance</div>
                    <div class="vault-card__metric-value">
                      <span class="val-sync-balance" :data-sats="vault.balance || 0">{{ formatBalance(vault.balance || 0) }}</span>
                      <span class="val-sync-unit" style="font-size: 0.8em; color: var(--color-neon); opacity: 0.8;">{{ unit }}</span>
                    </div>
                  </div>
                  <div>
                    <div class="vault-card__metric-label">Target Price</div>
                    <div class="vault-card__metric-value">₱{{ formatPrice(vault.priceTarget) }}</div>
                  </div>
                </div>

                <div class="vault-card__meta">Created: {{ formatDate(vault.createdAt) }}</div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div class="status-chip" :class="canVaultWithdraw(vault) ? 'status-chip--ready' : 'status-chip--hodl'">
                    <i class="material-icons" style="font-size: 14px;">{{ canVaultWithdraw(vault) ? 'check_circle' : 'lock' }}</i>
                    {{ canVaultWithdraw(vault) ? 'Ready to Withdraw' : 'HODLing' }}
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge--auto" :title="vault.autoWithdrawal ? 'Auto-withdrawal enabled' : 'Auto-withdrawal disabled'" :style="{ opacity: vault.autoWithdrawal ? 1 : 0.5 }">Auto</span>
                    <label class="toggle-switch" style="transform: scale(0.8); transform-origin: right;">
                      <input type="checkbox" :checked="vault.autoWithdrawal" @click.stop @change="toggleAutoWithdraw(vault)">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                <div class="vault-card__progress-container">
                  <div class="vault-card__progress-fill" :class="canVaultWithdraw(vault) ? 'vault-card__progress-fill--ready' : 'vault-card__progress-fill--hodl'" :style="{ width: getVaultProgress(vault) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <!-- Floating Widget -->
      <div class="floating-widget">
        <div class="card card--neon" style="padding: 10px 16px; display: flex; align-items: center; gap: 8px; box-shadow: 0 0 20px var(--color-neon-dim);">
          <i class="material-icons text-neon" style="font-size: 18px;">sensors</i>
          <span class="text-mono text-neon" style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em;">{{ walletConnected ? 'SECURE CONNECTION ACTIVE' : 'WALLET DISCONNECTED' }}</span>
        </div>
      </div>
  </main>

  <!-- Vault Management Modal -->
    <q-dialog v-model="showVaultManageModal" persistent maximized>
      <q-card class="modal-content" style="max-width: 700px; width: 100%;">
        <q-card-section class="modal-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <h3 style="margin: 0; font-size: 20px; text-transform: uppercase; font-family: var(--font-heading);">{{ manageVault?.name || 'Vault' }}</h3>
            <div class="status-chip" :class="canVaultWithdraw(manageVault) ? 'status-chip--ready' : 'status-chip--hodl'" style="padding: 4px 12px;">
              STATUS: {{ canVaultWithdraw(manageVault) ? 'READY TO WITHDRAW' : 'HODLING' }}
            </div>
          </div>
          <q-btn flat dense round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="modal-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
            <div class="card card--elevated" style="padding: 16px;">
              <span class="label-tiny">Vault Statistics</span>
              <div style="margin-top: 12px; display: grid; gap: 10px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <span class="text-muted">Locked Balance</span>
                  <span style="font-weight: 700;">{{ manageVault ? formatBalance(manageVault.balance || 0) : '0.00' }} {{ unit }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <span class="text-muted">Target Price</span>
                  <span style="font-weight: 700;">₱{{ manageVault ? formatPrice(manageVault.priceTarget) : '0.00' }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <span class="text-muted">Auto-Withdraw</span>
                  <span class="text-neon">{{ manageVault?.autoWithdrawal ? 'ENABLED' : 'DISABLED' }}</span>
                </div>
              </div>
            </div>

            <div class="card card--elevated" style="padding: 16px;">
              <span class="label-tiny">Oracle Feed</span>
              <div style="margin-top: 12px; display: grid; gap: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <span class="text-muted">Market Price</span>
                  <span v-if="oracleSuccess" class="text-neon text-heading" style="font-size: 14px;">₱{{ formatPrice(currentBchPrice) }}</span>
                  <span v-else class="text-muted" style="font-size: 12px;">Unavailable</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                  <span class="text-muted">Gap to Target</span>
                  <span v-if="manageVault && currentBchPrice" :style="{ color: manageGap >= 0 ? 'var(--color-neon)' : '#ffb300' }">{{ manageGap >= 0 ? '+' : '' }}{{ manageGap }}%</span>
                  <span v-else class="text-muted">—</span>
                </div>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="card card--elevated">
              <span class="label-tiny">Contract Details</span>
              <div style="margin-top: 12px;">
                <div class="text-muted" style="font-size: 10px; margin-bottom: 4px; text-transform: uppercase;">Smart Contract Address</div>
                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--color-surface-input); padding: 10px; border-radius: 6px; border: 1px solid var(--color-border); word-break: break-all;">
                  <code class="text-mono" style="font-size: 11px;">{{ manageVault?.contractAddress || 'N/A' }}</code>
                  <i class="material-icons" style="font-size: 14px; color: var(--color-text-dim); cursor: pointer; margin-left: 8px;" @click="copyAddress">content_copy</i>
                </div>
              </div>
            </div>

            <div class="card card--elevated" @click="showQrModal = true" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; cursor: pointer;">
              <div style="width: 80px; height: 80px; background: white; padding: 4px; border-radius: 4px;">
                <img :src="manageQrCodeUrl" alt="QR Code" style="width: 100%; height: 100%;" />
              </div>
              <span class="text-muted" style="font-size: 10px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Deposit via QR</span>
            </div>
          </div>

          <div style="margin-top: 24px; display: flex; gap: 12px;">
            <q-btn
              class="btn btn--primary"
              style="flex: 1; font-size: 12px; padding: 12px;"
              :label="canVaultWithdraw(manageVault) ? 'Withdraw Funds (Unlocked)' : 'Vault Locked'"
              :disable="!canVaultWithdraw(manageVault) || withdrawing"
              :loading="withdrawing"
              @click="onWithdraw"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- QR Code Modal -->
    <q-dialog v-model="showQrModal" persistent>
      <div style="position: relative; background: white; padding: 24px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; max-width: 90vw;">
        <q-btn flat dense round icon="close" v-close-popup style="position: absolute; top: -16px; right: -16px; background: var(--color-surface); color: var(--color-text);" />
        <img :src="manageLargeQrUrl" alt="Full QR Code" style="width: 300px; height: 300px; max-width: 100%;" />
        <div class="text-mono" style="margin-top: 16px; font-size: 12px; color: #111; word-break: break-all; text-align: center;">{{ manageVault?.contractAddress || 'N/A' }}</div>
      </div>
    </q-dialog>

    <!-- Activity Modal -->
    <q-dialog v-model="showActivityModal" persistent maximized>
      <q-card class="modal-content" style="max-width: 800px; width: 100%;">
        <q-card-section class="modal-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <i class="material-icons text-neon" style="font-size: 24px;">history</i>
            <h3 style="margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.05em; font-family: var(--font-heading);">Activity History</h3>
          </div>
          <q-btn flat dense round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="modal-body">
          <div class="modal-filter-row">
            <select v-model="activityFilterTime" @change="loadActivityHistory">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
            </select>
            <select v-model="activityFilterType" @change="loadActivityHistory">
              <option value="all">All Activities</option>
              <option value="deposits">Deposits Only</option>
              <option value="withdrawals">Withdrawals Only</option>
            </select>
          </div>

          <div class="activity-scroll">
            <div v-if="loadingLogs" style="text-align: center; padding: 40px; color: var(--color-text-dim);">
              Loading activity...
            </div>
            <div v-else class="activity-list">
              <div v-for="(log, index) in filteredActivities" :key="log._id || index" class="activity-item">
                <div style="display: flex; align-items: center; gap: 16px;">
                  <i class="material-icons" :style="{ color: getActivityColor(log.activityType) }">{{ getActivityIcon(log.activityType) }}</i>
                  <div class="activity-item__info">
                    <span class="activity-item__title">{{ formatActivityType(log.activityType) }}</span>
                    <span class="activity-item__date">
                      Vault: {{ log.vaultName || 'Unknown' }}
                      <span v-if="log.details?.amountSatoshis"> • {{ formatBCH(log.details.amountSatoshis) }} BCH</span>
                    </span>
                  </div>
                </div>
                <span class="activity-item__date">{{ formatDate(log.timestamp) }}</span>
              </div>
              <div v-if="activityLogs.length === 0 && !loadingLogs" style="text-align: center; padding: 40px; color: var(--color-text-dim);">
                No activity yet.
              </div>
            </div>
            <div v-if="hasMoreLogs && !loadingLogs" style="text-align: center; padding: 16px;">
              <button class="btn btn--outline" style="padding: 8px 32px;" :disabled="loadingMore" @click="loadMoreLogs">{{ loadingMore ? 'Loading...' : 'Load More' }}</button>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
</template>

<script>
import { defineComponent } from 'vue'
import { recoverPublicKeyHash } from 'src/boot/walletconnect'
import {
  calculateContractAddress,
  initializeHodlVaultContract,
  getAddressBalance,
} from 'src/services/blockchain'
import { fetchOraclePrice, ORACLE_PUBKEY } from 'src/services/oracle'
import { vaultStorage } from 'src/services/vault-storage'
import { connectSSE, disconnectSSE } from 'src/services/sse.service'
import { paytacaOptimizedWithdrawal } from 'src/services/paytaca-optimized-withdrawal'
import { vaultApi } from 'src/services/api.service'
import VaultsEmptyState from 'src/components/VaultsEmptyState.vue'

export default defineComponent({
  name: 'DashboardPage',

  components: {
    VaultsEmptyState,
  },

  data() {
    return {
      // Display
      unit: localStorage.getItem('balanceUnit') || 'sats',
      showVaultManageModal: false,
      showActivityModal: false,
      showQrModal: false,
      manageVault: null,

      // Oracle
      priceLoading: false,
      oracleSuccess: false,
      currentBchPrice: null,
      oracleData: {
        message_hex: '',
        signature_hex: '',
        oracle_pubkey_hex: '',
      },

      // Wallet balance
      walletSats: 0,

      // Vault list
      vaults: [],
      loadingVaults: false,
      backendError: null,

      // Create form
      deploying: false,
      vaultName: '',
      targetPrice: null,
      lockAmount: null,
      selectedPreset: null,
      autoWithdrawal: false,

      // Activity
      activityLogs: [],
      loadingLogs: false,
      loadingMore: false,
      logsSkip: 0,
      logsLimit: 20,
      hasMoreLogs: false,
      activityFilterType: 'all',
      activityFilterTime: 'all',

      // Withdrawal
      withdrawing: false,

      // Intervals
      balanceInterval: null,
    }
  },

  computed: {
    walletConnected() {
      return !!(this.$store && this.$store.state.wallet && this.$store.state.wallet.address)
    },

    walletAddress() {
      return this.$store.state.wallet?.address ?? null
    },

    showVaultsEmptyState() {
      if (!this.walletConnected) return true
      if (this.loadingVaults || this.backendError) return false
      return this.vaults.length === 0
    },

    canDeploy() {
      return (
        this.walletConnected &&
        this.targetPrice &&
        this.targetPrice > 0 &&
        this.oracleData.oracle_pubkey_hex
      )
    },

    phpBalance() {
      if (!this.currentBchPrice || !this.walletSats) return '₱0.00'
      const php = (this.walletSats / 100000000) * this.currentBchPrice
      return '₱' + php.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },

    totalLockedSats() {
      return this.vaults.reduce((sum, v) => sum + (v.balance || 0), 0)
    },

    readyCount() {
      return this.vaults.filter(v => this.canVaultWithdraw(v)).length
    },

    avgProgress() {
      if (this.vaults.length === 0) return 0
      const total = this.vaults.reduce((s, v) => s + this.getVaultProgress(v), 0)
      return Math.round(total / this.vaults.length)
    },

    priceTargetPresets() {
      if (!this.currentBchPrice) return []
      const base = Number(this.currentBchPrice)
      return [
        { key: '1.25', label: 'x1.25', percent: 25, multiplier: 1.25 },
        { key: '1.5', label: 'x1.5', percent: 50, multiplier: 1.5 },
        { key: '2.0', label: 'x2.0', percent: 100, multiplier: 2.0 },
        { key: '5.0', label: 'x5.0', percent: 400, multiplier: 5.0 },
      ].map((p) => ({
        ...p,
        targetPrice: Math.round(base * p.multiplier * 100) / 100,
      }))
    },

    manageGap() {
      if (!this.manageVault || !this.currentBchPrice || !this.manageVault.priceTarget) return 0
      const target = Number(this.manageVault.priceTarget)
      const current = Number(this.currentBchPrice)
      if (target === 0) return 0
      return Math.round(((current - target) / target) * 100)
    },

    manageQrCodeUrl() {
      const addr = this.manageVault?.contractAddress || ''
      return `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(addr)}`
    },

    manageLargeQrUrl() {
      const addr = this.manageVault?.contractAddress || ''
      return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(addr)}`
    },

    filteredActivities() {
      let filtered = [...this.activityLogs]

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const thisWeek = new Date(today)
      thisWeek.setDate(thisWeek.getDate() - 7)
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const thisYear = new Date(now.getFullYear(), 0, 1)

      switch (this.activityFilterTime) {
        case 'today':
          filtered = filtered.filter((l) => new Date(l.timestamp) >= today)
          break
        case 'yesterday':
          filtered = filtered.filter((l) => {
            const d = new Date(l.timestamp)
            return d >= yesterday && d < today
          })
          break
        case 'thisWeek':
          filtered = filtered.filter((l) => new Date(l.timestamp) >= thisWeek)
          break
        case 'thisMonth':
          filtered = filtered.filter((l) => new Date(l.timestamp) >= thisMonth)
          break
        case 'thisYear':
          filtered = filtered.filter((l) => new Date(l.timestamp) >= thisYear)
          break
      }

      switch (this.activityFilterType) {
        case 'deposits':
          filtered = filtered.filter((l) => l.activityType === 'DEPOSIT')
          break
        case 'withdrawals':
          filtered = filtered.filter((l) => l.activityType === 'WITHDRAWAL')
          break
      }

      return filtered
    },
  },

  watch: {
    unit(val) {
      localStorage.setItem('balanceUnit', val)
    },

    walletAddress(newAddr, oldAddr) {
      if (newAddr && newAddr !== oldAddr) {
        this.loadVaults()
        this.fetchWalletBalance()
      }
      if (!newAddr) {
        this.vaults = []
        this.walletSats = 0
      }
    },
  },

  mounted() {
    this.refreshPrice()
    this.fetchWalletBalance()
    this.loadVaults()
    this.startBalancePolling()

    connectSSE()
    window.addEventListener('vault-withdrawn', this.handleVaultWithdrawn)
    window.addEventListener('deposit-confirmed', this.handleDepositConfirmed)
    window.addEventListener('new-activity', this.handleNewActivity)
  },

  beforeUnmount() {
    this.stopBalancePolling()
    disconnectSSE()
    window.removeEventListener('vault-withdrawn', this.handleVaultWithdrawn)
    window.removeEventListener('deposit-confirmed', this.handleDepositConfirmed)
    window.removeEventListener('new-activity', this.handleNewActivity)
  },

  methods: {
    async onVaultsEmptyStateAction() {
      if (!this.walletConnected) {
        const wc = this.$walletConnect
        if (!wc) return
        try {
          await wc.connect()
        } catch (err) {
          console.error('Wallet connect failed:', err)
        }
        return
      }
      const el = document.getElementById('create-vault-section')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },

    // ─── Oracle ───────────────────────────────────────────────
    async refreshPrice() {
      this.priceLoading = true
      this.oracleSuccess = false
      try {
        const result = await fetchOraclePrice()
        this.currentBchPrice = result.price
        this.oracleData = {
          message_hex: result.message_hex,
          signature_hex: result.signature_hex,
          oracle_pubkey_hex: result.oracle_pubkey_hex,
        }
        this.oracleSuccess = true
      } catch (err) {
        console.error('Oracle fetch error:', err)
      } finally {
        this.priceLoading = false
      }
    },

    // ─── Wallet Balance ──────────────────────────────────────
    async fetchWalletBalance() {
      if (!this.walletAddress) {
        this.walletSats = 0
        return
      }
      try {
        const balance = await getAddressBalance(this.walletAddress)
        this.walletSats = Number(balance)
      } catch {
        console.warn('Failed to fetch wallet balance')
        this.walletSats = 0
      }
    },

    // ─── Vault List ──────────────────────────────────────────
    async loadVaults() {
      if (!this.walletAddress) {
        this.vaults = []
        return
      }
      this.loadingVaults = true
      this.backendError = null
      try {
        const storedVaults = await vaultStorage.getVaultsByWallet(this.walletAddress)
        this.vaults = await Promise.all(
          storedVaults.map(async (vault) => {
            if (!vault.priceTarget && vault.priceTargetCents) {
              vault.priceTarget = vault.priceTargetCents / 100
            }
            try {
              const balance = await getAddressBalance(vault.contractAddress)
              vaultStorage.updateVaultBalance(vault.contractAddress, Number(balance))
              return { ...vault, balance: Number(balance) }
            } catch {
              return vault
            }
          }),
        )
      } catch (err) {
        console.error('Failed to load vaults:', err)
        this.backendError = err.message || 'Backend unreachable'
        this.vaults = []
      } finally {
        this.loadingVaults = false
      }
    },

    silentRefreshBalances() {
      if (this.vaults.length === 0) return
      this.vaults.forEach(async (vault) => {
        try {
          const balance = Number(await getAddressBalance(vault.contractAddress))
          if (vault.balance !== balance) {
            vault.balance = balance
            vaultStorage.updateVaultBalance(vault.contractAddress, balance)
          }
        } catch { /* silent */ }
      })
    },

    startBalancePolling() {
      this.stopBalancePolling()
      this.balanceInterval = setInterval(() => {
        this.silentRefreshBalances()
        this.fetchWalletBalance()
      }, 30000)
    },

    stopBalancePolling() {
      if (this.balanceInterval) {
        clearInterval(this.balanceInterval)
        this.balanceInterval = null
      }
    },

    canVaultWithdraw(vault) {
      if (!vault || !this.currentBchPrice || !vault.priceTarget) return false
      return Number(this.currentBchPrice) >= Number(vault.priceTarget)
    },

    getVaultProgress(vault) {
      if (!this.currentBchPrice || !vault.priceTarget) return 0
      const pct = (this.currentBchPrice / vault.priceTarget) * 100
      return Math.min(pct, 100)
    },

    // ─── Create Vault ────────────────────────────────────────
    selectPreset(key, multiplier) {
      this.selectedPreset = key
      if (this.targetPrice) {
        this.targetPrice = Math.round(this.targetPrice * multiplier)
      }
    },

    async deployContract() {
      if (!this.canDeploy) return
      this.deploying = true
      try {
        const wc = this.$walletConnect
        if (!wc || !wc.isConnected()) {
          throw new Error('Please connect your wallet first')
        }

        const ownerPkhHex = await recoverPublicKeyHash()
        const oraclePkHex = this.oracleData.oracle_pubkey_hex
        const priceTargetCents = Math.floor(this.targetPrice * 100)

        if (!oraclePkHex) {
          throw new Error('Oracle public key not loaded. Refresh the price first.')
        }

        const existingVault = await vaultStorage.checkForDuplicateVault(
          this.walletAddress,
          priceTargetCents,
        )
        if (existingVault) {
          this.$q.notify({
            type: 'warning',
            message: `You already have a vault with target price ₱${this.targetPrice}. Each vault must have a unique target price.`,
            timeout: 5000,
          })
          return
        }

        const contractAddress = await calculateContractAddress(
          ownerPkhHex,
          ORACLE_PUBKEY,
          priceTargetCents,
          this.walletAddress,
        )

        const balance = Number(await getAddressBalance(contractAddress))
        const vaultId = vaultStorage.generateVaultId()
        const vaultName = this.vaultName || `Vault #${contractAddress.slice(-8)}`

        vaultStorage.saveVault({
          id: vaultId,
          _id: vaultId,
          walletAddress: this.walletAddress,
          contractAddress,
          priceTarget: this.targetPrice,
          priceTargetCents,
          ownerPkhHex,
          oraclePkHex: ORACLE_PUBKEY,
          originalFundingAddress: this.walletAddress,
          balance,
          createdAt: Date.now(),
          name: vaultName,
          autoWithdrawal: this.autoWithdrawal,
        })

        this.$q.notify({
          type: 'positive',
          message: `Vault "${vaultName}" created at ${contractAddress}`,
          icon: 'check_circle',
        })

        // Tell backend to watch for deposit
        try {
          const { activityLogApi } = await import('src/services/activity-log-api.js')
          await activityLogApi.watchDeposit({
            vaultId,
            vaultName,
            contractAddress,
            expectedAmount: null,
          })
        } catch { /* silent */ }

        // Reload vault list
        await this.loadVaults()

        // Reset form
        this.vaultName = ''
        this.targetPrice = null
        this.lockAmount = null
        this.selectedPreset = null
        this.autoWithdrawal = false
      } catch (err) {
        console.error('Vault creation failed:', err)
        this.$q.notify({
          type: 'negative',
          message: err?.message || 'Failed to deploy contract',
          timeout: 10000,
        })
      } finally {
        this.deploying = false
      }
    },

    // ─── Vault Management ────────────────────────────────────
    async openVaultManage(vault) {
      const wc = this.$walletConnect
      if (!wc || !wc.isConnected()) {
        this.$q.notify({ type: 'negative', message: 'Please connect your wallet first' })
        return
      }

      try {
        const vaultData = await vaultStorage.getVaultByContractAddressFromBackend(vault.contractAddress)
        if (!vaultData) {
          this.$q.notify({ type: 'negative', message: 'Vault not found' })
          return
        }

        if (!vaultData.ownerPkhHex || !vaultData.oraclePkHex || !vaultData.priceTargetCents) {
          this.$q.notify({ type: 'negative', message: 'Incomplete vault data' })
          return
        }

        const contract = initializeHodlVaultContract(
          vaultData.ownerPkhHex,
          vaultData.oraclePkHex,
          vaultData.priceTargetCents,
          vaultData.walletAddress,
        )

        this.manageVault = {
          _id: vaultData._id || vaultData.id,
          id: vaultData.id || vaultData._id,
          name: vaultData.name || 'Unnamed Vault',
          contractAddress: vaultData.contractAddress,
          balance: vaultData.balance || 0,
          priceTarget: vaultData.priceTargetCents
            ? vaultData.priceTargetCents / 100
            : vaultData.priceTarget,
          priceTargetCents: vaultData.priceTargetCents,
          ownerPkhHex: vaultData.ownerPkhHex,
          oraclePkHex: vaultData.oraclePkHex,
          contract,
          originalFundingAddress: vaultData.originalFundingAddress,
          autoWithdrawal: !!vaultData.autoWithdrawal,
        }
        this.showVaultManageModal = true
      } catch (err) {
        console.error('Failed to load vault:', err)
        this.$q.notify({ type: 'negative', message: err.message || 'Failed to load vault' })
      }
    },

    // ─── Auto-Withdrawal Toggle ──────────────────────────────
    async toggleAutoWithdraw(vault) {
      const newVal = !vault.autoWithdrawal
      const vaultId = vault.id || vault._id
      try {
        await vaultApi.toggleAutoWithdrawal(vaultId, newVal)
        vault.autoWithdrawal = newVal
        await vaultStorage.updateVault(vault.contractAddress, { autoWithdrawal: newVal })
      } catch (err) {
        console.error('Toggle auto-withdrawal failed:', err)
        this.$q.notify({ type: 'negative', message: 'Failed to toggle auto-withdrawal' })
      }
    },

    // ─── Withdrawal ──────────────────────────────────────────
    async onWithdraw() {
      if (!this.manageVault || !this.canVaultWithdraw(this.manageVault)) return
      if (this.manageVault.balance <= 0) {
        this.$q.notify({ type: 'info', message: 'Vault has no balance to withdraw' })
        return
      }

      const wc = this.$walletConnect
      if (!wc || !wc.isConnected()) {
        this.$q.notify({ type: 'negative', message: 'Please connect your wallet first' })
        return
      }

      const ownerAddress = this.manageVault.originalFundingAddress || wc.getAddress()
      if (!ownerAddress) {
        this.$q.notify({ type: 'negative', message: 'Could not get wallet address' })
        return
      }

      if (!this.oracleData.message_hex || !this.oracleData.signature_hex) {
        this.$q.notify({ type: 'negative', message: 'Oracle data not available. Refresh price.' })
        return
      }

      this.withdrawing = true
      try {
        const result = await paytacaOptimizedWithdrawal(
          this.manageVault.contract,
          ownerAddress,
          this.oracleData.message_hex,
          this.oracleData.signature_hex,
        )

        if (result?.success) {
          this.$q.notify({
            type: 'positive',
            message: `Withdrawal successful! Vault will be removed.`,
            icon: 'check_circle',
          })

          try {
            const { activityLogApi } = await import('src/services/activity-log-api.js')
            await activityLogApi.logWithdrawal({
              vaultId: this.manageVault._id || this.manageVault.id,
              vaultName: this.manageVault.name,
              contractAddress: this.manageVault.contractAddress,
              amountSatoshis: result.amountSatoshis || this.manageVault.balance || 0,
              txHash: result.txHash,
            })
          } catch { /* silent */ }

          try {
            await vaultStorage.deleteVault(
              this.manageVault.contractAddress,
              this.manageVault._id || this.manageVault.id,
            )
          } catch { /* silent */ }

          this.showVaultManageModal = false
          this.manageVault = null
          await this.loadVaults()
        } else {
          this.$q.notify({
            type: 'negative',
            message: result?.error || 'Withdrawal failed',
            timeout: 8000,
          })
        }
      } catch (err) {
        console.error('Withdrawal failed:', err)
        this.$q.notify({
          type: 'negative',
          message: err.message || 'Withdrawal failed',
          timeout: 8000,
        })
      } finally {
        this.withdrawing = false
      }
    },

    // ─── Copy Address ────────────────────────────────────────
    copyAddress() {
      if (this.manageVault?.contractAddress) {
        navigator.clipboard.writeText(this.manageVault.contractAddress)
        this.$q.notify({ type: 'positive', message: 'Address copied!', icon: 'content_copy' })
      }
    },

    // ─── Activity History ────────────────────────────────────
    async loadActivityHistory() {
      this.loadingLogs = true
      this.logsSkip = 0
      try {
        const { activityLogApi } = await import('src/services/activity-log-api.js')
        const result = await activityLogApi.getHistory(this.logsLimit, this.logsSkip)
        this.activityLogs = result.logs || []
        this.hasMoreLogs = result.hasMore || false
      } catch (err) {
        console.error('Failed to load activity history:', err)
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
      } catch {
        this.logsSkip -= this.logsLimit
      } finally {
        this.loadingMore = false
      }
    },

    // ─── Activity Helpers ────────────────────────────────────
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
        VAULT_CREATED: 'var(--color-neon)',
        DEPOSIT: '#ff3366',
        WITHDRAWAL: 'var(--color-neon)',
        PRICE_TARGET_REACHED: '#ffb300',
        VAULT_DELETED: 'var(--color-text-dim)',
      }
      return colors[type] || 'var(--color-text-dim)'
    },

    formatActivityType(type) {
      if (!type) return 'Unknown'
      return type
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase())
    },

    // ─── SSE Handlers ────────────────────────────────────────
    handleVaultWithdrawn(event) {
      const { contractAddress, amountSatoshis } = event.detail
      this.vaults = this.vaults.filter((v) => v.contractAddress !== contractAddress)
      this.$q.notify({
        type: 'positive',
        message: `Auto-withdrawal complete! ${(amountSatoshis / 100000000).toFixed(8)} BCH returned to your wallet`,
        timeout: 5000,
      })
      setTimeout(() => this.loadVaults(), 1000)
    },

    handleDepositConfirmed(event) {
      const { contractAddress, amountSatoshis, newBalance } = event.detail
      const vault = this.vaults.find((v) => v.contractAddress === contractAddress)
      if (vault && newBalance !== undefined) {
        vault.balance = newBalance
      }
      this.$q.notify({
        type: 'positive',
        message: `Deposit confirmed! +${amountSatoshis} satoshis`,
        icon: 'check_circle',
        timeout: 5000,
      })
    },

    handleNewActivity(event) {
      const { activity } = event.detail
      if (this.showActivityModal) {
        this.activityLogs.unshift(activity)
      }
    },

    // ─── Formatting ──────────────────────────────────────────
    formatBalance(sats) {
      if (!sats) sats = 0
      const n = Number(sats)
      if (this.unit === 'sats') return n.toLocaleString()
      if (this.unit === 'mBCH') return (n / 100000).toFixed(5)
      return (n / 100000000).toFixed(8)
    },

    formatPrice(value) {
      if (value == null) return '0.00'
      return Number(value).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    },

    formatDate(timestamp) {
      if (!timestamp) return 'Unknown'
      const date = new Date(timestamp)
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`
    },

    formatBCH(satoshis) {
      return (satoshis / 100000000).toFixed(8)
    },
  },
})
</script>
