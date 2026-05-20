<template>
  <main class="container container--page-dashboard">
    <div class="page-grid">
      <!-- LEFT SIDEBAR -->
      <aside>
        <div class="card card--elevated hodler-rank-card" style="padding: 20px; cursor: pointer" @click="showLeaderboardModal = true; fetchRankings()">
          <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px;">
            <span class="label-tiny" style="margin-bottom: 0;">Hodler Rank</span>
            <span class="text-neon text-mono" style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">All Time</span>
          </div>

          <div v-if="!walletConnected" class="hodler-rank-card__message text-muted">
            Connect your wallet to see your leaderboard rank.
          </div>

          <div v-else-if="loadingHodlerRank" class="hodler-rank-card__message text-muted">
            Loading rank...
          </div>

          <div v-else-if="hodlerRankRows.length === 0" class="hodler-rank-card__message text-muted">
            Create a vault to enter the rankings.
          </div>

          <div v-else class="hodler-rank-card__rows">
            <div
              v-for="row in hodlerRankRows"
              :key="row.key"
              class="hodler-rank-card__row"
            >
              <span class="hodler-rank-card__medal-slot">
                <i v-if="row.showMedal" class="material-icons hodler-rank-card__medal"
                  >emoji_events</i
                >
              </span>
              <span
                v-if="row.notRanked"
                class="hodler-rank-card__rank"
                style="font-size: 11px; color: var(--color-text-dim); min-width: 2.25rem; flex-shrink: 0;"
                >Not Ranked</span
              >
              <span v-else class="hodler-rank-card__rank text-neon text-mono"
                >#{{ row.rank }}</span
              >
              <span class="hodler-rank-card__type">{{ row.label }}</span>
            </div>
          </div>
        </div>

        <div class="card card--elevated" style="margin-top: 16px">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <span class="label-tiny">Market Feed</span>
            <button
              v-if="!priceLoading"
              class="btn btn--outline"
              style="padding: 4px 12px; font-size: 10px"
              @click="refreshPrice"
            >
              Refresh
            </button>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 10px">
            <i v-if="priceLoading" class="material-icons text-muted" style="font-size: 16px"
              >sync</i
            >
            <i v-else-if="oracleSuccess" class="material-icons text-neon" style="font-size: 16px"
              >check_circle</i
            >
            <i v-else class="material-icons" style="color: var(--color-warning); font-size: 16px">warning</i>
            <span v-if="priceLoading" style="font-size: 12px; color: var(--color-text-dim)"
              >Fetching oracle price...</span
            >
            <span v-else-if="oracleSuccess" style="font-size: 12px; color: var(--color-neon)"
              >Oracle online</span
            >
            <span v-else style="font-size: 12px; color: var(--color-warning)"
              >Oracle unavailable — refresh before deploying</span
            >
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 10px">
            <span class="text-muted" style="font-size: 13px">BCH Price (Oracle)</span>
            <span v-if="priceLoading" style="font-size: 12px; color: var(--color-text-dim)"
              >Loading...</span
            >
            <span v-else-if="oracleSuccess" class="text-neon text-heading" style="font-size: 14px"
              >₱{{ formatPrice(currentBchPrice) }}</span
            >
            <span
              v-else
              class="text-muted"
              style="font-size: 12px; cursor: pointer"
              @click="refreshPrice"
              >Offline — Tap to retry</span
            >
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px">
            <span class="text-muted" style="font-size: 13px">Network Fee</span>
            <span style="color: var(--color-warning); font-family: var(--font-mono); font-size: 12px"
              >1 sat/B</span
            >
          </div>
        </div>

        <div
          class="card card--elevated portfolio-summary"
          style="padding-bottom: 20px; margin-top: 16px"
        >
          <div
            v-if="!walletConnected"
            class="portfolio-view-disconnected"
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px 0;
              text-align: center;
            "
          >
            <i
              class="material-icons"
              style="font-size: 48px; color: var(--color-text-dim); margin-bottom: 16px"
              >account_balance_wallet</i
            >
            <p style="font-size: 14px; margin-bottom: 16px; color: var(--color-text-muted)">
              Connect your wallet to view portfolio.
            </p>
          </div>

          <div v-else class="portfolio-view-connected">
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
              "
            >
              <div
                class="portfolio-summary__title label-tiny"
                style="color: var(--color-text); font-weight: 700; margin-bottom: 0"
              >
                Portfolio Summary
              </div>
              <div style="display: flex; align-items: center; gap: 8px">
                <span
                  style="font-size: 10px; color: var(--color-text-dim); text-transform: uppercase"
                  >Display:</span
                >
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
                <div style="display: flex; align-items: baseline; gap: 4px">
                  <span
                    class="portfolio-summary__value portfolio-summary__value--neon val-sync-balance"
                    :data-sats="totalLockedSats"
                    style="font-size: 20px"
                    >{{ formatBalance(totalLockedSats) }}</span
                  >
                  <span
                    class="text-mono val-sync-unit"
                    style="font-size: 10px; color: var(--color-neon); font-weight: 700"
                    >{{ unit }}</span
                  >
                </div>
              </div>
            </div>

            <div
              v-if="loadingVaults"
              style="
                border-top: 1px solid var(--color-border);
                margin-top: 16px;
                padding-top: 12px;
              "
            >
              <span style="font-size: 12px; color: var(--color-text-dim)">Loading vaults...</span>
            </div>

            <div
              v-else
              style="
                border-top: 1px solid var(--color-border);
                margin-top: 16px;
                padding-top: 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
              "
            >
              <div style="display: flex; gap: 24px">
                <div class="portfolio-summary__stat-item">
                  <span class="portfolio-summary__label">Vaults</span>
                  <span class="portfolio-summary__value">{{ vaults.length }}</span>
                </div>
                <div class="portfolio-summary__stat-item">
                  <span class="portfolio-summary__label">Ready</span>
                  <span class="portfolio-summary__value portfolio-summary__value--neon">{{
                    readyCount
                  }}</span>
                </div>
              </div>
              <button
                class="portfolio-summary__activity-btn"
                style="margin-top: 0"
                @click="showActivityModal = true; loadActivityHistory()"
              >
                <i class="material-icons" style="font-size: 14px">history</i>
                Activity
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- CENTER COLUMN: Create Vault Form -->
      <section id="create-vault-section">
        <div class="create-vault-header">
          <div class="create-vault-header__titles">
            <h1 style="font-size: 32px; display: inline-block">
              CREATE <span class="text-neon">HODL</span> VAULT
            </h1>
            <p class="text-muted create-vault-header__tagline">
              Set your target price and secure your Bitcoin Cash.
            </p>
          </div>
          <div
            class="slideshow-container create-vault-header__slideshow"
            :style="{
              cursor: walletConnected ? 'pointer' : 'default',
              position: 'relative',
            }"
            @click="walletConnected && openProfileModal()"
          >
            <!-- Disconnected state: silhouette avatar with cube-like theme -->
            <div
              v-if="!walletConnected"
              class="create-vault-header__avatar-empty"
            >
              <div class="tech-glow-lines" aria-hidden="true">
                <div class="glow-line" style="left: 20%; animation-delay: 0s;" />
                <div class="glow-line" style="left: 80%; animation-delay: 1.5s;" />
              </div>
              <i class="material-icons create-vault-header__avatar-icon">person_outline</i>
              <span class="create-vault-header__avatar-label">Wallet not connected</span>
            </div>
            <!-- Connected state: DiceBear avatar + profile overlay -->
            <template v-else>
              <!-- DiceBear avatar when seed is set -->
              <div
                v-if="avatarSeed"
                class="profile-header-avatar"
              >
                <img
                  :src="`https://api.dicebear.com/7.x/pixel-art/svg?seed=${avatarSeed}`"
                  alt="Avatar"
                  class="profile-header-avatar__img"
                  loading="lazy"
                  @error="onAvatarError"
                />
              </div>
              <!-- Fallback initials -->
              <div
                v-else
                class="profile-header-avatar profile-header-avatar--fallback"
              >
                <span class="profile-header-avatar__initials">{{ getInitials(profileName) }}</span>
              </div>
              <!-- Profile name overlay -->
              <div
                v-if="profileName"
                style="
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  padding: 8px 12px;
                  background: linear-gradient(transparent, rgba(0,0,0,0.7));
                  border-radius: 0 0 8px 8px;
                "
              >
                <span
                  class="text-neon text-mono"
                  style="font-size: 13px; font-weight: 700;"
                >{{ profileName }}</span>
              </div>
              <!-- Prompt to set name when connected but no name -->
              <div
                v-else
                style="
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  padding: 8px 12px;
                  background: linear-gradient(transparent, rgba(0,0,0,0.7));
                  border-radius: 0 0 8px 8px;
                "
              >
                <span
                  style="font-size: 11px; color: var(--color-text-dim);"
                >Set profile name</span>
              </div>
            </template>
          </div>
        </div>

        <div class="card" style="padding: 28px; border: 1px solid var(--color-border)">
          <div style="grid-template-columns: 1fr 1fr; display: grid; gap: 20px">
            <div class="field">
              <label class="label-tiny">Vault Name</label>
              <q-input
                v-model="vaultName"
                placeholder="My Alpha HODL"
                outlined
                dense
                dark
                class="custom-input"
              />
            </div>
            <div class="field">
              <label class="label-tiny">Target Price (PHP)</label>
              <q-input
                v-model="targetPrice"
                type="number"
                outlined
                dense
                dark
                class="custom-input"
                prefix="₱"
              />
              <div
                v-if="targetPrice"
                style="font-size: 12px; color: var(--color-text-dim); margin-top: 4px; text-align: right"
              >
                ₱{{ Number(targetPrice).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </div>
            </div>
          </div>

          <div v-if="currentBchPrice" class="field">
            <label class="label-tiny">Preset Targets</label>
            <div class="chip-row">
              <div
                v-for="preset in priceTargetPresets"
                :key="preset.key"
                class="chip"
                :class="{ active: selectedPreset === preset.key }"
                @click="selectPreset(preset.key, preset.multiplier)"
              >
                {{ preset.label }}
                <span style="opacity: 0.7; margin-left: 2px">(+{{ preset.percent }}%)</span>
                <span class="text-neon" style="margin-left: 4px">₱{{ preset.formattedPrice }}</span>
              </div>
            </div>
          </div>

          <div
            class="field"
            style="display: flex; align-items: center; gap: 12px; margin-top: 12px"
          >
            <q-toggle v-model="autoWithdrawal" color="positive" />
            <span style="font-size: 14px">Enable Auto-Withdrawal</span>
          </div>

          <q-btn
            class="btn btn--primary btn--full"
            style="height: 56px; margin-top: 24px"
            :label="deploying ? 'Creating vault...' : 'Create Vault'"
            :loading="deploying"
            @click="deployContract"
            :disable="!walletConnected || !canDeploy"
          />
        </div>
      </section>

      <!-- RIGHT SIDEBAR: Active Vaults -->
      <aside style="display: flex; flex-direction: column; gap: 0">
        <VaultsEmptyState v-if="showVaultsEmptyState" @action="onVaultsEmptyStateAction" />

        <div v-else class="active-vaults-view-connected">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
              padding: 0 4px;
            "
          >
            <h2 class="label-tiny" style="margin: 0">Active Vaults</h2>
            <span
              v-if="walletConnected && vaults.length > 0"
              class="text-neon"
              style="font-family: var(--font-mono); font-size: 12px"
              >Avg Progress: {{ avgProgress }}%</span
            >
          </div>

          <div id="vaults-list">
            <div
              v-if="loadingVaults"
              style="
                text-align: center;
                padding: 40px 20px;
                color: var(--color-text-dim);
                font-size: 12px;
              "
            >
              Loading vaults...
            </div>

            <div v-else-if="backendError" style="text-align: center; padding: 40px 20px">
              <i class="material-icons" style="font-size: 32px; color: var(--color-text-dim)"
                >cloud_off</i
              >
              <p style="font-size: 12px; color: var(--color-text-dim); margin-top: 8px">
                {{ backendError }}
              </p>
              <button
                class="btn btn--outline"
                style="margin-top: 12px; padding: 6px 16px; font-size: 11px"
                @click="loadVaults()"
              >
                Retry
              </button>
            </div>

            <template v-else>
              <div
                v-for="(vault, index) in vaults"
                :key="vault.contractAddress || vault.id || index"
                class="vault-card"
                @click="onVaultCardClick($event, vault)"
              >
              <div class="vault-card__header">
                <div
                  class="vault-card__avatar"
                  :class="
                    canVaultWithdraw(vault)
                      ? 'vault-card__avatar--ready'
                      : 'vault-card__avatar--hodl'
                  "
                >
                  <i class="material-icons">{{ canVaultWithdraw(vault) ? 'lock_open' : 'lock' }}</i>
                </div>
                <div class="vault-card__title-area">
                  <div class="vault-card__name">
                    {{ vault.name || `Vault #${(vault.contractAddress || '').slice(-8)}` }}
                  </div>
                </div>
                <i class="material-icons vault-card__arrow">arrow_forward</i>
              </div>

              <div class="vault-card__metrics">
                <div>
                  <div class="vault-card__metric-label">Balance</div>
                  <div class="vault-card__metric-value">
                    <span class="val-sync-balance" :data-sats="vault.balance || 0">{{
                      formatBalance(vault.balance || 0)
                    }}</span>
                    <span
                      class="val-sync-unit"
                      style="font-size: 0.8em; color: var(--color-neon); opacity: 0.8"
                      >{{ unit }}</span
                    >
                  </div>
                </div>
                <div>
                  <div class="vault-card__metric-label">Target Price</div>
                  <div class="vault-card__metric-value">₱{{ formatPrice(vault.priceTarget) }}</div>
                </div>
              </div>

              <div class="vault-card__meta">Created: {{ formatDate(vault.createdAt) }}</div>

              <div style="display: flex; justify-content: space-between; align-items: center">
                <div
                  class="status-chip"
                  :class="canVaultWithdraw(vault) ? 'status-chip--ready' : 'status-chip--hodl'"
                >
                  <i class="material-icons" style="font-size: 14px">{{
                    canVaultWithdraw(vault) ? 'check_circle' : 'lock'
                  }}</i>
                  {{ canVaultWithdraw(vault) ? 'Ready to Withdraw' : 'HODLing' }}
                </div>
                <div
                  class="vault-card__actions"
                  style="display: flex; align-items: center; gap: 8px"
                  @click.stop
                >
                  <span
                    class="badge--auto"
                    :title="
                      vault.autoWithdrawal ? 'Auto-withdrawal enabled' : 'Auto-withdrawal disabled'
                    "
                    :style="{ opacity: vault.autoWithdrawal ? 1 : 0.5 }"
                    >Auto</span
                  >
                  <label
                    class="toggle-switch"
                    style="transform: scale(0.8); transform-origin: right"
                    @click.stop
                  >
                    <input
                      type="checkbox"
                      :checked="vault.autoWithdrawal"
                      @click.stop
                      @change="toggleAutoWithdraw(vault)"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
              <div class="vault-card__progress-container">
                <div
                  class="vault-card__progress-fill"
                  :class="
                    canVaultWithdraw(vault)
                      ? 'vault-card__progress-fill--ready'
                      : 'vault-card__progress-fill--hodl'
                  "
                  :style="{ width: getVaultProgress(vault) + '%' }"
                ></div>
              </div>
              </div>
            </template>
          </div>
        </div>
      </aside>
    </div>

    <!-- Floating Widget -->
    <div class="floating-widget">
      <div
        class="card card--neon"
        style="
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 0 20px var(--color-neon-dim);
        "
      >
        <i class="material-icons text-neon" style="font-size: 18px">sensors</i>
        <span
          class="text-mono text-neon"
          style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em"
          >{{ walletConnected ? 'SECURE CONNECTION ACTIVE' : 'WALLET DISCONNECTED' }}</span
        >
      </div>
    </div>
  </main>

  <!-- Vault Management Modal -->
  <q-dialog v-model="showVaultManageModal">
    <q-card class="modal-content" style="max-width: 700px; width: 100%">
      <q-card-section class="modal-header">
        <div style="display: flex; align-items: center; gap: 12px">
          <h3
            style="
              margin: 0;
              font-size: 20px;
              text-transform: uppercase;
              font-family: var(--font-heading);
            "
          >
            {{ manageVault?.name || 'Vault' }}
          </h3>
          <div
            class="status-chip"
            :class="canVaultWithdraw(manageVault) ? 'status-chip--ready' : 'status-chip--hodl'"
            style="padding: 4px 12px"
          >
            STATUS: {{ canVaultWithdraw(manageVault) ? 'READY TO WITHDRAW' : 'HODLING' }}
          </div>
        </div>
        <q-btn flat dense round icon="close" v-close-popup />
      </q-card-section>
      <q-card-section class="modal-body">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px">
          <div class="card card--elevated" style="padding: 16px">
            <span class="label-tiny">Vault Statistics</span>
            <div style="margin-top: 12px; display: grid; gap: 10px">
              <div style="display: flex; justify-content: space-between; font-size: 12px">
                <span class="text-muted">Locked Balance</span>
                <span style="font-weight: 700"
                  >{{ manageVault ? formatBalance(manageVault.balance || 0) : '0.00' }}
                  {{ unit }}</span
                >
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px">
                <span class="text-muted">Target Price</span>
                <span style="font-weight: 700"
                  >₱{{ manageVault ? formatPrice(manageVault.priceTarget) : '0.00' }}</span
                >
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px">
                <span class="text-muted">Auto-Withdraw</span>
                <span class="text-neon">{{
                  manageVault?.autoWithdrawal ? 'ENABLED' : 'DISABLED'
                }}</span>
              </div>
            </div>
          </div>

          <div class="card card--elevated" style="padding: 16px">
            <span class="label-tiny">Oracle Feed</span>
            <div style="margin-top: 12px; display: grid; gap: 8px">
              <div style="display: flex; justify-content: space-between; font-size: 12px">
                <span class="text-muted">Market Price</span>
                <span v-if="oracleSuccess" class="text-neon text-heading" style="font-size: 14px"
                  >₱{{ formatPrice(currentBchPrice) }}</span
                >
                <span v-else class="text-muted" style="font-size: 12px">Unavailable</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px">
                <span class="text-muted">Gap to Target</span>
                <span
                  v-if="manageVault && currentBchPrice"
                  :style="{ color: manageGap >= 0 ? 'var(--color-neon)' : '#ffb300' }"
                  >{{ manageGap >= 0 ? '+' : '' }}{{ manageGap }}%</span
                >
                <span v-else class="text-muted">—</span>
              </div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px">
          <div class="card card--elevated">
            <span class="label-tiny">Contract Details</span>
            <div style="margin-top: 12px">
              <div
                class="text-muted"
                style="font-size: 10px; margin-bottom: 4px; text-transform: uppercase"
              >
                Smart Contract Address
              </div>
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  background: var(--color-surface-input);
                  padding: 10px;
                  border-radius: 6px;
                  border: 1px solid var(--color-border);
                  word-break: break-all;
                "
              >
                <code class="text-mono" style="font-size: 11px">{{
                  manageVault?.contractAddress || 'N/A'
                }}</code>
                <i
                  class="material-icons"
                  style="
                    font-size: 14px;
                    color: var(--color-text-dim);
                    cursor: pointer;
                    margin-left: 8px;
                  "
                  @click="copyAddress"
                  >content_copy</i
                >
              </div>
            </div>
          </div>

          <div
            class="card card--elevated"
            @click="showQrModal = true"
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 16px;
              cursor: pointer;
            "
          >
            <div
              style="width: 80px; height: 80px; background: white; padding: 4px; border-radius: 4px"
            >
              <img :src="manageQrCodeUrl" alt="QR Code" style="width: 100%; height: 100%" />
            </div>
            <span
              class="text-muted"
              style="
                font-size: 10px;
                margin-top: 8px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: bold;
              "
              >Deposit via QR</span
            >
          </div>
        </div>

        <div style="margin-top: 24px; display: flex; gap: 12px">
          <q-btn
            class="btn btn--primary"
            style="flex: 1; font-size: 12px; padding: 12px"
            :label="canVaultWithdraw(manageVault) ? 'Withdraw Funds (Unlocked)' : 'Vault Locked'"
            :disable="!canVaultWithdraw(manageVault) || withdrawing"
            :loading="withdrawing"
            @click="onWithdraw"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Manage vault: deposit QR modal -->
  <q-dialog v-model="showQrModal">
    <div
      style="
        position: relative;
        background: white;
        padding: 24px;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 90vw;
      "
    >
      <q-btn
        flat
        dense
        round
        icon="close"
        v-close-popup
        style="
          position: absolute;
          top: -16px;
          right: -16px;
          background: var(--color-surface);
          color: var(--color-text);
        "
      />
      <img
        :src="manageLargeQrUrl"
        alt="Full QR Code"
        style="width: 300px; height: 300px; max-width: 100%"
      />
      <div
        class="text-mono"
        style="
          margin-top: 16px;
          font-size: 12px;
          color: var(--color-text-dim);
          word-break: break-all;
          text-align: center;
        "
      >
        {{ manageVault?.contractAddress || 'N/A' }}
      </div>
    </div>
  </q-dialog>

  <!-- Activity Modal -->
  <q-dialog v-model="showActivityModal">
    <q-card class="modal-content" style="max-width: 800px; width: 100%">
      <q-card-section class="modal-header">
        <div style="display: flex; align-items: center; gap: 12px">
          <i class="material-icons text-neon" style="font-size: 24px">history</i>
          <h3
            style="
              margin: 0;
              font-size: 18px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-family: var(--font-heading);
            "
          >
            Activity History
          </h3>
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
          <div
            v-if="loadingLogs"
            style="text-align: center; padding: 40px; color: var(--color-text-dim)"
          >
            Loading activity...
          </div>
          <div v-else class="activity-list">
            <div
              v-for="(log, index) in filteredActivities"
              :key="log._id || index"
              class="activity-item"
            >
              <div style="display: flex; align-items: center; gap: 16px">
                <i class="material-icons" :style="{ color: getActivityColor(log.activityType) }">{{
                  getActivityIcon(log.activityType)
                }}</i>
                <div class="activity-item__info">
                  <span class="activity-item__title">{{
                    formatActivityType(log.activityType)
                  }}</span>
                  <span class="activity-item__date">
                    Vault: {{ log.vaultName || 'Unknown' }}
                    <span v-if="log.details?.amountSatoshis">
                      • {{ formatBCH(log.details.amountSatoshis) }} BCH</span
                    >
                  </span>
                </div>
              </div>
              <span class="activity-item__date">{{ formatDate(log.timestamp) }}</span>
              <button
                v-if="log.details?.txHash"
                class="btn btn--tx"
                @click="openTxExplorer(log.details.txHash)"
              >
                <i class="material-icons" style="font-size: 14px">open_in_new</i>
                View TX
              </button>
            </div>
            <div
              v-if="activityLogs.length === 0 && !loadingLogs"
              style="text-align: center; padding: 40px; color: var(--color-text-dim)"
            >
              No activity yet.
            </div>
          </div>
          <div v-if="hasMoreLogs && !loadingLogs" style="text-align: center; padding: 16px">
            <button
              class="btn btn--outline"
              style="padding: 8px 32px"
              :disabled="loadingMore"
              @click="loadMoreLogs"
            >
              {{ loadingMore ? 'Loading...' : 'Load More' }}
            </button>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Leaderboard Modal -->
  <q-dialog v-model="showLeaderboardModal" :maximized="false">
    <q-card class="modal-content" style="max-width: 960px; width: 100%;">
      <q-card-section class="modal-header">
        <div style="display: flex; align-items: center; gap: 16px">
          <i class="material-icons text-neon" style="font-size: 32px">leaderboard</i>
          <h3 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 0.05em; font-family: var(--font-heading);">
            BCH Leaderboard — Top {{ rankingTopLimit }}
          </h3>
        </div>
        <q-btn flat dense round icon="close" v-close-popup size="lg" />
      </q-card-section>
      <q-card-section class="modal-body">
        <div v-if="loadingRankings" style="text-align: center; padding: 60px; color: var(--color-text-dim); font-size: 16px;">
          Loading leaderboard...
        </div>
        <div v-else>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <span class="label-tiny" style="margin: 0; font-size: 14px;">Largest BCH Locked</span>
            <span class="text-neon text-mono" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Active Vaults</span>
          </div>
          <div v-if="rankings.lockedBCH.length === 0" class="text-muted" style="font-size: 14px; padding: 24px 0;">
            No data yet.
          </div>
          <div v-else class="leaderboard-table">
            <div class="leaderboard-table__header">
              <span>Rank</span>
              <span>Trader</span>
              <span>BCH Locked</span>
              <span>Vaults</span>
            </div>
            <div
              v-for="(entry, i) in rankings.lockedBCH"
              :key="entry.walletAddress"
              class="leaderboard-table__row"
              :class="{ 'leaderboard-table__row--me': entry.walletAddress === walletAddress }"
            >
              <span class="leaderboard-table__rank">#{{ i + 1 }}</span>
              <span class="leaderboard-table__wallet">
                <img
                  v-if="entry.avatarSeed"
                  :src="`https://api.dicebear.com/7.x/pixel-art/svg?seed=${entry.avatarSeed}`"
                  alt=""
                  class="leaderboard-table__avatar"
                  loading="lazy"
                />
                <span class="leaderboard-table__avatar leaderboard-table__avatar--fallback" v-else>
                  {{ getInitials(entry.profileName) }}
                </span>
                <span class="leaderboard-table__name">{{ entry.profileName || truncateAddress(entry.walletAddress) }}</span>
              </span>
              <span class="leaderboard-table__value">{{ formatBalance(entry.totalBalance) }}</span>
              <span class="leaderboard-table__value">{{ entry.vaultCount }}</span>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Profile Setup Modal -->
  <q-dialog v-model="showProfileModal">
    <q-card class="modal-content" style="max-width: 480px; width: 100%">
      <q-card-section class="modal-header">
        <div style="display: flex; align-items: center; gap: 12px">
          <i class="material-icons text-neon" style="font-size: 24px">person</i>
          <h3 style="margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.05em; font-family: var(--font-heading);">
            Profile Setup
          </h3>
        </div>
        <q-btn flat dense round icon="close" v-close-popup />
      </q-card-section>
      <q-card-section class="modal-body">
        <div class="profile-avatar-picker">
          <!-- Avatar Preview -->
          <div class="profile-avatar-preview">
            <img
              :src="`https://api.dicebear.com/7.x/pixel-art/svg?seed=${avatarSeedInput || 'default'}`"
              alt="Avatar"
              class="profile-avatar-preview__img"
              loading="lazy"
              @error="onAvatarError"
            />
          </div>
          <!-- Avatar Options -->
          <div class="profile-avatar-options">
            <div class="profile-avatar-options__header">
              <span class="label-tiny">Select Face</span>
              <button
                type="button"
                class="btn btn--outline"
                style="padding: 4px 12px; font-size: 10px; display: flex; align-items: center; gap: 4px;"
                @click="generateAvatarOptions"
              >
                <i class="material-icons" style="font-size: 14px">refresh</i> Re-roll
              </button>
            </div>
            <div class="profile-avatar-grid">
              <button
                v-for="seed in avatarOptions"
                :key="seed"
                type="button"
                class="profile-avatar-option"
                :class="{ 'profile-avatar-option--selected': avatarSeedInput === seed }"
                @click="avatarSeedInput = seed"
              >
                <img
                  :src="`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`"
                  alt="Option"
                  class="profile-avatar-option__img"
                  loading="lazy"
                  @error="onAvatarError"
                />
              </button>
            </div>
          </div>
          <!-- Display Name -->
          <div class="field" style="margin-top: 8px;">
            <label class="label-tiny">Display Name</label>
            <q-input
              v-model="profileNameInput"
              placeholder="Enter your display name"
              outlined
              dense
              dark
              class="custom-input"
              maxlength="30"
              counter
              @keyup.enter="saveProfile"
            />
            <div class="text-muted" style="font-size: 11px; margin-top: 4px;">
              This name will appear on the leaderboard.
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-section class="modal-footer" style="display: flex; justify-content: flex-end; gap: 8px; padding: 12px 24px 20px;">
        <button class="btn btn--outline" style="padding: 8px 24px; font-size: 12px;" @click="showProfileModal = false">Cancel</button>
        <button class="btn btn--primary" style="padding: 8px 24px; font-size: 12px;" :disabled="savingProfile" @click="saveProfile">
          {{ savingProfile ? 'Saving...' : 'Save' }}
        </button>
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
import { vaultApi, preferencesApi } from 'src/services/api.service'
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
        oracle_pubkey_hex: ORACLE_PUBKEY,
      },

      // Wallet balance (internal use only)
      walletSats: 0,

      // Profile
      profileName: null,
      profileNameInput: '',
      avatarSeed: null,
      avatarSeedInput: '',
      avatarOptions: [],
      showProfileModal: false,
      savingProfile: false,

      // Hodler rank / leaderboard
      rankingTopLimit: 10,
      userRanks: {
        lockedFund: null,
      },
      loadingHodlerRank: false,
      showLeaderboardModal: false,
      loadingRankings: false,
      rankings: {
        lockedBCH: [],
      },

      // Vault list
      vaults: [],
      loadingVaults: false,
      backendError: null,

      // Create form
      deploying: false,
      vaultName: '',
      targetPrice: null,
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

      // Deposit watch
      isWatchingDeposit: false,
      depositWatchAddress: null,

      // Intervals
      balanceInterval: null,
      manageModalInterval: null,

      // Diagnostics
      qrOpenedAt: null,
    }
  },

  computed: {
    walletConnected() {
      return !!(this.$store && this.$store.state.wallet && this.$store.state.wallet.address)
    },

    walletAddress() {
      const addr = this.$store.state.wallet?.address ?? null
      return addr
    },

    walletAddresses() {
      const addrs = this.$store.state.wallet?.addresses ?? []
      return addrs.length > 0 ? addrs : this.walletAddress ? [this.walletAddress] : []
    },

    showVaultsEmptyState() {
      if (!this.walletConnected) return true
      if (this.loadingVaults || this.backendError) return false
      return this.vaults.length === 0
    },

    hasTargetPrice() {
      const n = Number(this.targetPrice)
      return Number.isFinite(n) && n > 0
    },

    canDeploy() {
      return this.walletConnected && this.hasTargetPrice
    },

    hodlerRankRows() {
      if (!this.walletConnected || !this.userRanks) return []
      const locked = this.userRanks.lockedFund
      if (locked) {
        return [{
          key: 'locked',
          rank: locked.rank,
          label: 'BCH amount locked',
          showMedal: locked.rank && locked.rank <= this.rankingTopLimit,
          notRanked: !locked.rank || locked.rank > this.rankingTopLimit,
        }]
      }
      return []
    },

    phpBalance() {
      if (!this.currentBchPrice || !this.walletSats) {
        console.log(
          `[BAL_TRACE] phpBalance | no price or no sats — returning ₱0.00 | currentBchPrice=${this.currentBchPrice} | walletSats=${this.walletSats}`,
        )
        return '₱0.00'
      }
      const php = (this.walletSats / 100000000) * this.currentBchPrice
      const formatted =
        '₱' + php.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      console.log(
        `[BAL_TRACE] phpBalance | walletSats=${this.walletSats} | bchPrice=${this.currentBchPrice} | php=${php} | formatted="${formatted}"`,
      )
      return formatted
    },

    totalLockedSats() {
      return this.vaults.reduce((sum, v) => sum + (v.balance || 0), 0)
    },

    readyCount() {
      return this.vaults.filter((v) => this.canVaultWithdraw(v)).length
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
        formattedPrice: Number(Math.round(base * p.multiplier * 100) / 100).toLocaleString('en-PH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
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

    showVaultManageModal(open) {
      if (open) {
        this.startManageModalRefresh()
      } else {
        this.stopManageModalRefresh()
      }
    },

    showQrModal(open) {
      if (open && this.manageVault?.contractAddress) {
        this.startDepositWatch()
      } else {
        this.stopDepositWatch()
      }
    },

    walletAddress(newAddr, oldAddr) {
      console.log(`[BAL_TRACE] walletAddress watcher | old="${oldAddr}" → new="${newAddr}"`)
      if (newAddr && newAddr !== oldAddr) {
        this.loadVaults()
        this.fetchWalletBalance()
        this.fetchHodlerRank()
        this.loadProfile()
        this.activityLogs = []
        disconnectSSE()
        connectSSE()
      }
      if (!newAddr) {
        console.log(
          '[BAL_TRACE] walletAddress watcher | address cleared — resetting vaults and balance',
        )
        this.vaults = []
        this.walletSats = 0
        this.userRanks = { lockedFund: null }
        this.rankings = { lockedBCH: [] }
        this.profileName = null
        this.activityLogs = []
        disconnectSSE()
      }
    },
  },

  mounted() {
    console.log(
      `[BAL_TRACE] DashboardPage mounted | walletAddress="${this.walletAddress}" | walletSats=${this.walletSats}`,
    )
    this.refreshPrice()
    this.fetchWalletBalance()
    this.fetchHodlerRank()
    this.loadProfile()
    this.loadVaults()
    this.startBalancePolling()
    connectSSE()
    window.addEventListener('vault-withdrawn', this.handleVaultWithdrawn)
    window.addEventListener('deposit-confirmed', this.handleDepositConfirmed)
    window.addEventListener('new-activity', this.handleNewActivity)
  },

  beforeUnmount() {
    this.stopBalancePolling()
    this.stopManageModalRefresh()
    this.stopDepositWatch()
    disconnectSSE()
    console.log('[SSE] Disconnected — page unmounted')
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
          oracle_pubkey_hex: result.oracle_pubkey_hex || ORACLE_PUBKEY,
        }
        this.oracleSuccess = true
      } catch (err) {
        console.error('Oracle fetch error:', err)
        this.oracleData.oracle_pubkey_hex = ORACLE_PUBKEY
      } finally {
        this.priceLoading = false
      }
    },

    // ─── Hodler Rank ─────────────────────────────────────────
    async fetchHodlerRank() {
      if (this.loadingHodlerRank) return
      this.loadingHodlerRank = true
      try {
        const wallet = this.walletConnected ? this.walletAddress : null
        const resp = await vaultApi.getGlobalStats(this.rankingTopLimit, wallet)
        if (resp?.userRanks) {
          this.userRanks = {
            lockedFund: resp.userRanks.lockedFund || null,
          }
        } else if (!wallet) {
          this.userRanks = { lockedFund: null }
        }
        if (resp?.rankings) {
          this.rankings = {
            lockedBCH: resp.rankings.lockedBCH || [],
          }
        }
      } catch (e) {
        console.warn('[HodlerRank] Failed to fetch:', e?.message || e)
      } finally {
        this.loadingHodlerRank = false
      }
    },

    async fetchRankings() {
      if (this.loadingRankings) return
      this.loadingRankings = true
      try {
        const resp = await vaultApi.getGlobalStats(this.rankingTopLimit)
        if (resp?.rankings) {
          this.rankings = {
            lockedBCH: resp.rankings.lockedBCH || [],
          }
        }
      } catch (e) {
        console.warn('[Leaderboard] Failed to fetch rankings:', e?.message || e)
      } finally {
        this.loadingRankings = false
      }
    },

    truncateAddress(addr) {
      if (!addr) return ''
      return addr.slice(0, 6) + '...' + addr.slice(-4)
    },

    // ─── Profile ─────────────────────────────────────────────
    async loadProfile() {
      if (!this.walletConnected) return
      try {
        const resp = await preferencesApi.getPreferences()
        if (resp?.profileName) {
          this.profileName = resp.profileName
        }
        if (resp?.avatarSeed) {
          this.avatarSeed = resp.avatarSeed
        }
      } catch (e) {
        console.warn('[Profile] Failed to load:', e?.message || e)
      }
    },

    generateAvatarOptions() {
      const options = []
      for (let i = 0; i < 6; i++) {
        options.push(`face_${Math.random().toString(36).substring(2, 9)}`)
      }
      this.avatarOptions = options
      if (!this.avatarSeedInput || !options.includes(this.avatarSeedInput)) {
        this.avatarSeedInput = options[0]
      }
    },

    getInitials(name) {
      if (!name) return '?'
      const parts = name.trim().split(/\s+/)
      if (parts.length === 1) return parts[0][0].toUpperCase()
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    },

    onAvatarError(e) {
      e.target.style.display = 'none'
    },

    openProfileModal() {
      this.profileNameInput = this.profileName || ''
      this.avatarSeedInput = this.avatarSeed || ''
      this.generateAvatarOptions()
      this.showProfileModal = true
    },

    async saveProfile() {
      const name = (this.profileNameInput || '').trim()
      if (!name) return
      this.savingProfile = true
      try {
        await preferencesApi.updatePreferences({
          profileName: name,
          avatarSeed: this.avatarSeedInput || null,
        })
        this.profileName = name
        this.avatarSeed = this.avatarSeedInput || null
        this.showProfileModal = false
      } catch (e) {
        console.warn('[Profile] Failed to save:', e?.message || e)
      } finally {
        this.savingProfile = false
      }
    },

    // ─── Wallet Balance ──────────────────────────────────────
    async fetchWalletBalance() {
      const addrs = this.walletAddresses
      if (addrs.length === 0) {
        console.log('[BAL_TRACE] fetchWalletBalance: no addresses, setting 0')
        this.walletSats = 0
        return
      }
      console.log(
        `[BAL_TRACE] fetchWalletBalance: querying ${addrs.length} address(es) @ ${new Date().toISOString()}`,
        JSON.stringify(addrs),
      )
      let totalBalance = null
      let source = 'none'
      // Try backend aggregate endpoint
      try {
        const t0 = performance.now()
        const total = await vaultApi.getAggregateWalletBalance(addrs)
        const elapsed = (performance.now() - t0).toFixed(1)
        if (total >= 0) {
          totalBalance = total
          source = `backend-aggregate (${addrs.length} addrs)`
          console.log(
            `[BAL_TRACE] fetchWalletBalance: backend-aggregate returned ${total} sats in ${elapsed}ms`,
          )
        }
      } catch (e) {
        console.log(
          `[BAL_TRACE] fetchWalletBalance: backend-aggregate failed (${e?.message}), falling back to individual queries`,
        )
      }
      // Fallback: query each address directly via electrum
      if (totalBalance == null) {
        totalBalance = 0
        source = `electrum (${addrs.length} addrs)`
        for (let i = 0; i < addrs.length; i++) {
          try {
            const t0 = performance.now()
            const bal = Number(await getAddressBalance(addrs[i]))
            const elapsed = (performance.now() - t0).toFixed(1)
            console.log(
              `[BAL_TRACE] fetchWalletBalance: electrum address[${i}]="${addrs[i]}" → ${bal} sats in ${elapsed}ms`,
            )
            totalBalance += bal
          } catch (e) {
            console.warn(
              `[BAL_TRACE] fetchWalletBalance: electrum address[${i}]="${addrs[i]}" FAILED: ${e?.message}`,
            )
          }
        }
      }
      console.log(
        `[BAL_TRACE] fetchWalletBalance: FINAL total=${totalBalance} sats (source=${source}) — updating walletSats`,
      )
      this.walletSats = totalBalance
    },

    // ─── Vault List ──────────────────────────────────────────
    async loadVaults(options = {}) {
      const silent = options.silent === true
      if (!this.walletAddress) {
        this.vaults = []
        return
      }
      if (!silent) {
        this.loadingVaults = true
      }
      this.backendError = null
      try {
        const storedVaults = await vaultStorage.getVaultsByWallet(this.walletAddress)
        const mapped = await Promise.all(
          storedVaults.map(async (vault) => {
            if (!vault.priceTarget && vault.priceTargetCents) {
              vault.priceTarget = vault.priceTargetCents / 100
            }
            try {
              const balance = await getAddressBalance(vault.contractAddress)
              void vaultStorage.updateVaultBalance(vault.contractAddress, Number(balance))
              return { ...vault, balance: Number(balance) }
            } catch {
              return vault
            }
          }),
        )
        // Active Vaults: only show live vaults (hide withdrawn / backend cleanup lag)
        this.vaults = mapped.filter((v) => !v.status || v.status === 'active')
      } catch (err) {
        console.error('Failed to load vaults:', err)
        this.backendError = err.message || 'Backend unreachable'
        this.vaults = []
      } finally {
        if (!silent) {
          this.loadingVaults = false
        }
        this.fetchHodlerRank()
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
        } catch {
          /* silent */
        }
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

    startManageModalRefresh() {
      this.stopManageModalRefresh()
      // Refresh oracle price and balance every 10s while manage modal is open
      this.manageModalInterval = setInterval(() => {
        this.refreshPrice()
        if (this.manageVault?.contractAddress) {
          getAddressBalance(this.manageVault.contractAddress)
            .then((balance) => {
              this.manageVault.balance = Number(balance)
            })
            .catch(() => {})
        }
      }, 10000)
    },

    stopManageModalRefresh() {
      if (this.manageModalInterval) {
        clearInterval(this.manageModalInterval)
        this.manageModalInterval = null
      }
    },

    async startDepositWatch() {
      if (this.isWatchingDeposit || !this.manageVault?.contractAddress) return
      const addr = this.manageVault.contractAddress
      this.depositWatchAddress = addr
      this.qrOpenedAt = Date.now()
      console.log(`[DepositWatch] ⏱️ QR opened at T+0ms — watching ${addr}`)
      try {
        const { activityLogApi } = await import('src/services/activity-log-api.js')
        await activityLogApi.watchDeposit({
          vaultId: this.manageVault._id || this.manageVault.id,
          vaultName: this.manageVault.name,
          contractAddress: addr,
          expectedAmount: null,
        })
        this.isWatchingDeposit = true
        console.log(`[DepositWatch] ✅ Watch started for ${addr}`)
      } catch (err) {
        this.depositWatchAddress = null
        console.warn('[DepositWatch] Failed to start watch:', err.message)
      }
    },

    async stopDepositWatch() {
      if (!this.isWatchingDeposit || !this.depositWatchAddress) return
      const addr = this.depositWatchAddress
      try {
        const { activityLogApi } = await import('src/services/activity-log-api.js')
        await activityLogApi.stopWatchingDeposit(addr)
      } catch {
        /* silent */
      }
      this.isWatchingDeposit = false
      this.depositWatchAddress = null
      console.log(`[DepositWatch] 🛑 Watch stopped for ${addr}`)
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
      if (this.currentBchPrice) {
        this.targetPrice = Math.round(Number(this.currentBchPrice) * multiplier * 100) / 100
      }
    },

    async deployContract() {
      if (!this.canDeploy) return
      this.deploying = true
      try {
        const wc = this.$walletConnect
        if (!wc || !wc.isConnected()) {
          console.warn('[deployContract] WalletConnect session check failed', {
            wcExists: !!wc,
            storeAddress: this.$store?.state?.wallet?.address,
            sessionTopic: wc?.getSessionTopic?.(),
          })
          const { restoreSessionIfAny } = await import('src/boot/walletconnect')
          await restoreSessionIfAny(this.$store)
          if (!wc.isConnected()) {
            throw new Error('Please connect your wallet first')
          }
        }

        const ownerPkhHex = await recoverPublicKeyHash()
        const oraclePkHex = this.oracleData.oracle_pubkey_hex || ORACLE_PUBKEY
        const priceTargetCents = Math.floor(Number(this.targetPrice) * 100)

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
          oraclePkHex,
          priceTargetCents,
          this.walletAddress,
        )

        const balance = Number(await getAddressBalance(contractAddress))
        const vaultId = vaultStorage.generateVaultId()
        const vaultName = this.vaultName || `Vault #${contractAddress.slice(-8)}`

        await vaultStorage.saveVault({
          id: vaultId,
          _id: vaultId,
          walletAddress: this.walletAddress,
          contractAddress,
          priceTarget: this.targetPrice,
          priceTargetCents,
          ownerPkhHex,
          oraclePkHex,
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
        } catch {
          /* silent */
        }

        // Reload vault list
        await this.loadVaults()

        // Reset form
        this.vaultName = ''
        this.targetPrice = null
        this.selectedPreset = null
        this.autoWithdrawal = false

        if (balance > 0) {
          this.$q.notify({
            type: 'info',
            message: `Vault created with ${this.formatBalance(balance)} ${this.unit} on-chain balance.`,
            timeout: 6000,
          })
        }
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
    onVaultCardClick(event, vault) {
      if (event.target.closest('.vault-card__actions, .toggle-switch')) {
        return
      }
      this.openVaultManage(vault)
    },

    async openVaultManage(vault) {
      const wc = this.$walletConnect
      if (!wc || !wc.isConnected()) {
        this.$q.notify({ type: 'negative', message: 'Please connect your wallet first' })
        return
      }

      try {
        const vaultData = await vaultStorage.getVaultByContractAddressFromBackend(
          vault.contractAddress,
        )
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
        console.log('[DEBUG:Withdraw] Calling paytacaOptimizedWithdrawal...', {
          ownerAddress,
          networkPrefix: ownerAddress?.includes(':') ? ownerAddress.split(':')[0] : 'no-prefix',
          contractAddress: this.manageVault.contractAddress,
          vaultBalance: this.manageVault.balance,
        })

        const result = await paytacaOptimizedWithdrawal(
          this.manageVault.contract,
          ownerAddress,
          this.oracleData.message_hex,
          this.oracleData.signature_hex,
        )

        console.log('[DEBUG:Withdraw] Result from paytacaOptimizedWithdrawal:', {
          success: result?.success,
          hasTxHash: !!result?.txHash,
          txHash: result?.txHash ? (typeof result.txHash === 'string' ? result.txHash.slice(0, 64) : result.txHash) : null,
          txHashLength: result?.txHash?.length,
          is64Hex: /^[0-9a-f]{64}$/i.test(String(result?.txHash || '')),
          amountSatoshis: result?.amountSatoshis,
          error: result?.error,
          resultKeys: result ? Object.keys(result) : null,
        })

        if (result?.success) {
          this.$q.notify({
            type: 'positive',
            message: `Withdrawal successful! Vault will be removed.`,
            icon: 'check_circle',
          })

          try {
            const { activityLogApi } = await import('src/services/activity-log-api.js')
            const logPayload = {
              vaultId: this.manageVault._id || this.manageVault.id,
              vaultName: this.manageVault.name,
              contractAddress: this.manageVault.contractAddress,
              amountSatoshis: result.amountSatoshis || this.manageVault.balance || 0,
              txHash: result.txHash,
            }
            console.log('[DEBUG:Withdraw] Logging withdrawal activity:', logPayload)
            await activityLogApi.logWithdrawal(logPayload)
          } catch {
            /* silent */
          }

          try {
            await vaultStorage.deleteVault(
              this.manageVault.contractAddress,
              this.manageVault._id || this.manageVault.id,
            )
          } catch {
            /* silent */
          }

          this.showVaultManageModal = false
          this.manageVault = null
          await this.loadVaults({ silent: true })
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

    getExplorerNetwork() {
      const addr = this.walletAddress || ''
      if (!addr) return 'chipnet'
      const prefix = addr.includes(':') ? addr.split(':')[0] : null
      if (prefix === 'bitcoincash') return 'mainnet'
      if (prefix === 'bchtest') return 'chipnet'
      if (prefix === 'chipnet') return 'chipnet'
      return 'chipnet'
    },

    openTxExplorer(txHash) {
      const network = this.getExplorerNetwork()
      const urls = {
        mainnet: `https://explorer.bitcoin.com/bch/tx/${txHash}`,
        chipnet: `https://chipnet.bch.ninja/tx/${txHash}`,
      }
      const url = urls[network] || urls.chipnet
      console.log('[DEBUG:explorer] Opening tx:', { txHash: txHash?.slice(0, 16) + '...', network, url })
      window.open(url, '_blank')
    },

    // ─── SSE Handlers ────────────────────────────────────────
    handleVaultWithdrawn(event) {
      const { contractAddress, amountSatoshis } = event.detail || {}
      console.log(
        `[SSE] vault-withdrawn | contract: ${contractAddress} | amount: ${amountSatoshis}sats`,
      )
      if (contractAddress) {
        this.vaults = this.vaults.filter((v) => v.contractAddress !== contractAddress)
      }
      // If the withdrawn vault is currently in the manage modal, close it
      if (this.manageVault?.contractAddress === contractAddress) {
        this.showQrModal = false
        this.showVaultManageModal = false
        this.manageVault = null
      }
      const bchStr =
        amountSatoshis != null && Number.isFinite(Number(amountSatoshis))
          ? (Number(amountSatoshis) / 100000000).toFixed(8)
          : '0.00000000'
      this.$q.notify({
        type: 'positive',
        message: `Auto-withdrawal complete! ${bchStr} BCH returned to your wallet`,
        timeout: 5000,
      })
      void this.loadVaults({ silent: true })
      void this.fetchWalletBalance()
    },

    handleDepositConfirmed(event) {
      const { contractAddress, amountSatoshis, newBalance } = event.detail
      const elapsed = this.qrOpenedAt ? Date.now() - this.qrOpenedAt : -1
      console.log(
        `[DepositWatch] ✅ deposit-confirmed SSE received` +
          ` | contract: ${contractAddress}` +
          ` | amount: ${amountSatoshis}sats` +
          ` | newBalance: ${newBalance}` +
          (elapsed >= 0 ? ` | ⏱️ T+${elapsed}ms since QR opened` : ''),
      )
      // Update vault in list
      const vault = this.vaults.find((v) => v.contractAddress === contractAddress)
      if (vault && newBalance !== undefined) {
        vault.balance = newBalance
      }
      // Update manage modal live if it's the same vault
      if (this.manageVault?.contractAddress === contractAddress && newBalance !== undefined) {
        this.manageVault.balance = newBalance
      }
      // Auto-close manage deposit QR after deposit
      if (this.showQrModal) {
        this.showQrModal = false
      }
      this.isWatchingDeposit = false
      this.$q.notify({
        type: 'positive',
        message: `Deposit confirmed! +${amountSatoshis} satoshis`,
        icon: 'check_circle',
        timeout: 5000,
      })
      void this.fetchHodlerRank()
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
      let result
      if (this.unit === 'sats') result = n.toLocaleString()
      else if (this.unit === 'mBCH') result = (n / 100000).toFixed(5)
      else result = (n / 100000000).toFixed(8)
      console.log(
        `[BAL_TRACE] formatBalance | input=${sats} sats | unit=${this.unit} | formatted="${result}"`,
      )
      return result
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
