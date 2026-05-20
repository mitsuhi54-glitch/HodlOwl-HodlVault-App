<template>
  <main class="about-container">
    <nav class="about-nav-sticky">
      <span class="about-nav-link" @click="scrollTo('hero')">Opening</span>
      <span class="about-nav-link" @click="scrollTo('problem')">Problem</span>
      <span class="about-nav-link" @click="scrollTo('solution')">Solution</span>
      <span class="about-nav-link" @click="scrollTo('journey')">Journey</span>
      <span class="about-nav-link" @click="scrollTo('contract')">Contract</span>
      <span class="about-nav-link" @click="scrollTo('arch')">Architecture</span>
      <span class="about-nav-link" @click="scrollTo('features')">Features</span>
      <span class="about-nav-link" @click="scrollTo('identity')">Identity</span>
      <span class="about-nav-link" @click="scrollTo('ranking')">Ranking</span>
      <span class="about-nav-link" @click="scrollTo('security')">Security</span>
      <span class="about-nav-link" @click="scrollTo('stack')">Stack</span>
      <span class="about-nav-link" @click="scrollTo('demo')">Demo</span>
    </nav>

    <section id="hero" class="about-section">
      <div class="about-hero">
        <div class="about-hero__content">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <img :src="logoSrc" alt="HodlVault" style="height: 48px; width: auto;" />
            <h1 style="font-size: 56px; margin: 0;">HODL<span class="text-neon">OWL</span></h1>
          </div>
          <p style="font-size: 20px; color: var(--color-text);">Force-HODL Your Bitcoin Cash via Price-Target Smart Contracts.</p>
          <p>HodlVault is a non-custodial commitment device designed to enforce disciplined Bitcoin Cash (BCH) investing by locking funds until specific price targets are met, verified by decentralized oracles.</p>
          <div style="display: flex; gap: 24px; margin-top: 32px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="material-icons text-neon">verified_user</i>
              <span class="text-mono" style="font-size: 13px;">NON-CUSTODIAL</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="material-icons text-neon">sensors</i>
              <span class="text-mono" style="font-size: 13px;">ORACLE-DRIVEN</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="material-icons text-neon">gavel</i>
              <span class="text-mono" style="font-size: 13px;">COVENANT-ENFORCED</span>
            </div>
          </div>
        </div>
        <div class="about-hero__image">
          <img :src="mascotHero" alt="HodlVault Mascot" class="about-mascot-img" />
        </div>
      </div>
    </section>

    <section id="problem" class="about-section">
      <h2>The Problem</h2>
      <p>Crypto investors frequently suffer from "paper hands," selling their assets prematurely due to short-term market volatility or emotional stress. This prevents long-term holders from reaching their ultimate financial goals as they exit positions during temporary dips or minor rallies.</p>
      <p>Traditional self-custody offers total control but requires immense willpower to stick to a plan. Conversely, exchange custody introduces counterparty risk and allows for impulsive "market sell" clicks. There is a distinct lack of permissionless commitment devices that treat an investor's future self as the only authorized recipient of funds once a specific, objective condition has been satisfied.</p>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="solution" class="about-section">
      <h2>Our Solution</h2>
      <p>HodlVault leverages Bitcoin Cash smart contracts (covenants) to lock funds on-chain. Unlike a simple time-lock, HodlVault uses a price-lock. Funds only become spendable when a signed message from a trusted oracle (Oracles.cash) proves that the market price of BCH has reached or exceeded the user's pre-defined target in Philippine Pesos (PHP).</p>
      <p>This is "Force-HODLing": you aren't just promising to hold; the network itself is enforcing your discipline. The platform never holds your keys; the rules are written in immutable script and verified by every node on the BCH network.</p>

      <div class="pull-quote">
        "Your keys. Your vault. Your target. The chain enforces the rest."
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="journey" class="about-section">
      <h2>Technical User Journey</h2>
      <div class="about-journey-layout">
        <div class="user-flow">
          <div class="flow-step">
            <div class="step-number">01</div>
            <div>
              <h3>Connect Wallet</h3>
              <p>User authenticates via WalletConnect v2 using the Paytaca mobile wallet. No passwords or accounts required.</p>
            </div>
          </div>
          <div class="flow-step">
            <div class="step-number">02</div>
            <div>
              <h3>Configure Vault</h3>
              <p>User defines a target price (e.g. &#x20B1;50,000/BCH) with preset multipliers (x1.5, x2, x5). The system compiles and deploys a unique CashScript contract.</p>
            </div>
          </div>
          <div class="flow-step">
            <div class="step-number">03</div>
            <div>
              <h3>Fund Contract</h3>
              <p>User sends BCH to the generated contract address. The backend deposit-watcher detects the UTXO and updates the dashboard in real-time via SSE.</p>
            </div>
          </div>
          <div class="flow-step">
            <div class="step-number">04</div>
            <div>
              <h3>On-Chain Lock</h3>
              <p>The BCH is now locked in a covenant. It can only be spent if an oracle signature confirms the price target has been hit.</p>
            </div>
          </div>
          <div class="flow-step">
            <div class="step-number">05</div>
            <div>
              <h3>Target Triggers</h3>
              <p>When current price &ge; target, the "spend" path of the contract unlocks. Auto-withdrawal can submit the transaction automatically. The UI status shifts to "Ready to Withdraw."</p>
            </div>
          </div>
          <div class="flow-step">
            <div class="step-number">06</div>
            <div>
              <h3>Secure Withdrawal</h3>
              <p>User signs a transaction via Paytaca. Funds are sent directly from the contract to the user's wallet address — or withdrawn automatically if auto-withdrawal was enabled.</p>
            </div>
          </div>
        </div>
        <div class="about-journey-image">
          <img :src="mascotJourney" alt="Journey" class="about-mascot-img" />
        </div>
      </div>

      <div class="arch-diagram">
        <div class="arch-card">USER (PAYTACA WALLET)</div>
        <div class="arch-arrow"><i class="material-icons">south</i></div>
        <div class="arch-card" style="border-color: var(--color-neon);">HODLOWL FRONTEND</div>
        <div class="arch-arrow"><i class="material-icons">sync</i></div>
        <div class="arch-card">BLOCKCHAIN (BCH) & ORACLE</div>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="contract" class="about-section">
      <h2>Smart Contract (HodlVault.cash)</h2>
      <p>The core logic is written in <strong>CashScript v0.11.0</strong>. It is a covenant, meaning it constrains how the funds can be spent.</p>
      <div class="card card--elevated" style="padding: 32px;">
        <h3 class="label-tiny">Constructor Parameters</h3>
        <ul class="text-muted" style="font-size: 14px; margin-bottom: 24px;">
          <li><code class="text-neon">ownerPkh</code>: The Public Key Hash of the owner.</li>
          <li><code class="text-neon">oraclePk</code>: The Public Key of the General Protocols Price Oracle.</li>
          <li><code class="text-neon">priceTarget</code>: The target price in whole pesos/cents.</li>
        </ul>
        <h3 class="label-tiny">Security Requirements</h3>
        <p style="font-size: 13px;">The <code class="text-neon">spend()</code> function requires:
        <br>1. A valid <code class="text-mono">checkDataSig</code> from the Oracle on a price message.
        <br>2. The reported message price must be numerically greater than or equal to the target.
        <br>3. An op_return or transaction output check ensuring funds return ONLY to the <code class="text-mono">ownerPkh</code>.</p>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="arch" class="about-section">
      <h2>System Architecture</h2>
      <div class="feature-grid">
        <div class="feature-item">
          <h3>Frontend Layer</h3>
          <p>Built with <strong>Vue 3 & Vite</strong>. Handles WalletConnect integration, DiceBear avatar generation, contract compilation, and real-time UI state management via Vuex.</p>
        </div>
        <div class="feature-item">
          <h3>Service Layer</h3>
          <p><strong>Node.js & Express</strong> backend managing vault metadata, oracle feed caching, auto-withdrawal engine, email notifications (OneSignal/Nodemailer), and Server-Sent Events (SSE) for instant deposit notifications.</p>
        </div>
        <div class="feature-item">
          <h3>Protocol Layer</h3>
          <p><strong>Bitcoin Cash Network</strong> (Chipnet/Mainnet) providing the infrastructure for decentralized, permissionless contract execution with covenant-enforced spending rules.</p>
        </div>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="features" class="about-section">
      <h2>Core Feature Matrix</h2>
      <div class="feature-grid">
        <div class="feature-item">
          <i class="material-icons">account_balance_wallet</i>
          <h3>Paytaca Integration</h3>
          <p>Deep-linked mobile wallet support via WalletConnect v2 for signing on-chain actions without exposing private keys.</p>
        </div>
        <div class="feature-item">
          <i class="material-icons">track_changes</i>
          <h3>Price-Target Vaults</h3>
          <p>Set custom targets or use preset multipliers (x1.5, x2, x5) for strategic exits. Multi-deposit support for a single vault.</p>
        </div>
        <div class="feature-item">
          <i class="material-icons">rss_feed</i>
          <h3>Live Oracle Data</h3>
          <p>Powered by General Protocols (Oracles.cash) for reliable PHP/BCH price verification via cryptographic data signatures.</p>
        </div>
        <div class="feature-item">
          <i class="material-icons">bolt</i>
          <h3>Auto-Withdrawal</h3>
          <p>Optional server-side withdrawal submission once target is hit. Supports both Chipnet testnet and Mainnet sessions for "set and forget" exits.</p>
        </div>
        <div class="feature-item">
          <i class="material-icons">dashboard</i>
          <h3>Portfolio Summary</h3>
          <p>Unified view of total assets across all vaults with real-time conversion (sats/mBCH/BCH) and HODLing vs Ready state indicators.</p>
        </div>
        <div class="feature-item">
          <i class="material-icons">notifications_active</i>
          <h3>Smart Alerts</h3>
          <p>Push notifications via OneSignal and email alerts via Nodemailer for deposits, withdrawals, and target achievement events.</p>
        </div>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="identity" class="about-section">
      <h2>Profile & Identity System</h2>
      <div class="about-identity-layout">
        <div class="about-identity-content">
          <p>Every connected wallet can create a personalized on-chain identity. The profile system allows users to stand out in the community with pixel-art avatars and display names.</p>
          <div class="feature-grid" style="margin-top: 24px;">
            <div class="feature-item">
              <h3>DiceBear Avatars</h3>
              <p>Generate unique pixel-art avatars from a seed string. Choose from multiple generated options or re-roll for a new set. Your avatar appears on the dashboard header and leaderboard.</p>
            </div>
            <div class="feature-item">
              <h3>Display Names</h3>
              <p>Set a custom display name that appears across the platform — on your profile card, vault list, and leaderboard rankings instead of raw wallet addresses.</p>
            </div>
            <div class="feature-item">
              <h3>Persistent Identity</h3>
              <p>Your profile (name + avatar seed) is stored server-side and persists across sessions. Reconnect with any device and your identity remains intact.</p>
            </div>
          </div>
        </div>
        <div class="about-identity-image">
          <div class="about-avatar-showcase">
            <img :src="dicebearUrl('face_alice')" alt="Avatar sample" class="about-avatar-sample" />
            <img :src="dicebearUrl('face_bob')" alt="Avatar sample" class="about-avatar-sample" />
            <img :src="dicebearUrl('face_charlie')" alt="Avatar sample" class="about-avatar-sample" />
            <img :src="dicebearUrl('face_diana')" alt="Avatar sample" class="about-avatar-sample" />
            <img :src="dicebearUrl('face_eliot')" alt="Avatar sample" class="about-avatar-sample" />
            <img :src="dicebearUrl('face_fiona')" alt="Avatar sample" class="about-avatar-sample" />
          </div>
          <p class="text-muted" style="font-size: 12px; text-align: center; margin-top: 12px;">DiceBear Pixel Art avatars — unique per seed</p>
          <div class="about-avatar-features">
            <div class="about-avatar-feature">
              <i class="material-icons text-neon" style="font-size: 16px;">casino</i>
              <span>Seed-based generation</span>
            </div>
            <div class="about-avatar-feature">
              <i class="material-icons text-neon" style="font-size: 16px;">refresh</i>
              <span>Re-roll options</span>
            </div>
            <div class="about-avatar-feature">
              <i class="material-icons text-neon" style="font-size: 16px;">person</i>
              <span>Initials fallback</span>
            </div>
          </div>
        </div>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="ranking" class="about-section">
      <h2>BCH Leaderboard & Ranking</h2>
      <div class="about-ranking-layout">
        <div class="about-ranking-content">
          <p>The platform features a competitive leaderboard ranked by total BCH locked across all active vaults. This gamification element encourages users to HODL more and build their on-chain reputation.</p>
          <div class="feature-grid" style="margin-top: 24px;">
            <div class="feature-item">
              <h3>Unified Ranking</h3>
              <p>Single leaderboard sorted by total BCH locked across all vaults. Your rank updates in real-time as vaults are created, funded, or withdrawn.</p>
            </div>
            <div class="feature-item">
              <h3>Profile Integration</h3>
              <p>Leaderboard displays each trader's DiceBear avatar, display name, BCH locked, and vault count. Your rank card shows on the dashboard sidebar.</p>
            </div>
            <div class="feature-item">
              <h3>Top Trader Recognition</h3>
              <p>Top 10 hodlers earn a special medal icon on their rank card. The leaderboard modal provides a full view of the competitive landscape.</p>
            </div>
          </div>
        </div>
        <div class="about-ranking-preview">
          <div class="about-ranking-table">
            <div class="about-ranking-table-header">
              <span>Rank</span>
              <span>Trader</span>
              <span>BCH Locked</span>
              <span>Vaults</span>
            </div>
            <div class="about-ranking-table-row">
              <span class="about-ranking-rank">#1</span>
              <span class="about-ranking-name"><img :src="dicebearUrl('rank_winner')" alt="" class="about-rank-avatar" /> crypto_whale</span>
              <span class="about-ranking-value">42.50</span>
              <span class="about-ranking-value">12</span>
            </div>
            <div class="about-ranking-table-row">
              <span class="about-ranking-rank">#2</span>
              <span class="about-ranking-name"><img :src="dicebearUrl('rank_runner')" alt="" class="about-rank-avatar" /> diamond_hands</span>
              <span class="about-ranking-value">31.20</span>
              <span class="about-ranking-value">8</span>
            </div>
            <div class="about-ranking-table-row">
              <span class="about-ranking-rank">#3</span>
              <span class="about-ranking-name"><img :src="dicebearUrl('rank_third')" alt="" class="about-rank-avatar" /> bch_maxi</span>
              <span class="about-ranking-value">18.75</span>
              <span class="about-ranking-value">5</span>
            </div>
          </div>
          <p class="text-muted" style="font-size: 12px; text-align: center; margin-top: 12px;">Live leaderboard — ranked by total BCH locked</p>
        </div>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="security" class="about-section">
      <h2>Security & Trust Model</h2>
      <ul class="text-muted" style="display: grid; gap: 12px; font-size: 15px;">
        <li><strong class="text-neon">Non-Custodial:</strong> Neither HodlVault nor any 3rd party holds your private keys. Funds are locked in a script you control.</li>
        <li><strong class="text-neon">Oracle Integrity:</strong> Locked funds cannot be released without a valid cryptographic signature from the General Protocols oracle.</li>
        <li><strong class="text-neon">Covenant Security:</strong> Bitcoin Cash script ensures that even if the contract is triggered, funds can only go to YOUR address.</li>
        <li><strong class="text-neon">Transparency:</strong> All vault addresses are public and verifiable on any BCH block explorer.</li>
      </ul>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="stack" class="about-section">
      <h2>Technology Stack</h2>
      <table class="table-stack">
        <thead>
          <tr>
            <th>Layer</th>
            <th>Technologies</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Frontend</td><td><span class="tech-icon"><img :src="techIcons.vue" alt="" />Vue 3</span> <span class="tech-icon"><img :src="techIcons.quasar" alt="" />Quasar</span> <span class="tech-icon"><img :src="techIcons.vite" alt="" />Vite</span> <span class="tech-icon"><img :src="techIcons.axios" alt="" />Axios</span> <span class="tech-icon"><img :src="techIcons.vuex" alt="" />Vuex</span></td></tr>
          <tr><td>Wallet</td><td><span class="tech-icon"><img :src="techIcons.walletconnect" alt="" />WalletConnect v2</span> <span class="tech-icon">Paytaca (BCH)</span></td></tr>
          <tr><td>Smart Contracts</td><td><span class="tech-icon">CashScript 0.11</span> <span class="tech-icon">cashc</span> <span class="tech-icon">libauth</span></td></tr>
          <tr><td>Backend</td><td><span class="tech-icon"><img :src="techIcons.nodejs" alt="" />Node.js</span> <span class="tech-icon"><img :src="techIcons.express" alt="" />Express 5</span> <span class="tech-icon"><img :src="techIcons.mongodb" alt="" />MongoDB</span> <span class="tech-icon"><img :src="techIcons.mongoose" alt="" />Mongoose</span></td></tr>
          <tr><td>Real-time</td><td><span class="tech-icon">Server-Sent Events (SSE)</span></td></tr>
          <tr><td>Notifications</td><td><span class="tech-icon">OneSignal</span> <span class="tech-icon"><img :src="techIcons.nodemailer" alt="" />Nodemailer</span></td></tr>
          <tr><td>Oracle</td><td><span class="tech-icon">Oracles.cash (General Protocols)</span></td></tr>
          <tr><td>Avatars</td><td><span class="tech-icon"><img :src="techIcons.dicebear" alt="" />DiceBear Pixel Art</span></td></tr>
        </tbody>
      </table>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="demo" class="about-section">
      <div class="presenter-checklist">
        <h2 style="font-size: 20px; color: var(--color-neon);">Live Demo Walkthrough</h2>
        <div style="display: grid; gap: 12px; margin-top: 16px;">
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Present Hero Page & value proposition.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Connect Paytaca wallet (simulated/real) — show wallet pill update.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Set up profile — generate DiceBear avatar, enter display name.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Create a new vault with preset or custom price target.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Fund vault via QR code — show real-time deposit detection (SSE).</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Navigate portfolio — show HODLing vs Ready states, conversion units.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Open Leaderboard — demonstrate ranking system with avatars.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Configure email notifications — register, verify, toggle.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>(Optional) Enable auto-withdrawal for "set and forget" demonstration.</span>
          </div>
        </div>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section class="about-section" style="border-top: 1px solid var(--color-border); padding-top: 40px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
        <div>
          <h3 class="label-tiny">Project Objective</h3>
          <p style="font-size: 13px;">To provide a secure, full-stack Web 3.0 demonstration of how Bitcoin Cash smart contracts can solve common behavioral economic challenges in retail investing.</p>
        </div>
        <div>
          <h3 class="label-tiny">Development Info</h3>
          <p style="font-size: 13px;">
            Institution: [Academic System Project]<br>
            Version: v2.3.0 (Chipnet Release)<br>
            Author: [Technical Development Team]
          </p>
        </div>
      </div>
      <div style="margin-top: 40px; text-align: center;">
        <img :src="mascotFooter" alt="HodlVault" class="about-footer-mascot" />
        <p style="font-size: 11px; color: var(--color-text-dim); margin-top: 16px;">HODLOWL &mdash; disciplined investing, enforced by code.</p>
        <div style="display: flex; justify-content: center; gap: 16px; margin-top: 24px;">
          <router-link to="/dashboard" class="btn btn--primary" style="padding: 10px 20px; font-size: 12px;">Dashboard</router-link>
          <router-link to="/" class="btn btn--outline" style="padding: 10px 20px; font-size: 12px;">Home</router-link>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import { defineComponent } from "vue"
import logoSrc from 'src/assets/images/mascot/logo.webp'

const DICEBEAR_BASE = 'https://api.dicebear.com/7.x/pixel-art/svg'

export default defineComponent({
  name: "AboutPage",

  data() {
    return {
      logoSrc,
      mascotHero: null,
      mascotJourney: null,
      mascotFooter: null,
    }
  },

  created() {
    this.mascotHero = new URL('../assets/images/HodlVault Mascot.webp', import.meta.url).href
    this.mascotJourney = new URL('../assets/images/MascotDark.webp', import.meta.url).href
    this.mascotFooter = new URL('../assets/images/MascotLight.webp', import.meta.url).href
  },

  methods: {
    scrollTo(id) {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },

    dicebearUrl(seed) {
      return `${DICEBEAR_BASE}?seed=${encodeURIComponent(seed)}`
    },
  },

  computed: {
    techIcons() {
      const s = (url) => url
      return {
        vue: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/vuedotjs.svg'),
        quasar: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/quasar.svg'),
        vite: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/vite.svg'),
        axios: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/axios.svg'),
        vuex: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/vuex.svg'),
        walletconnect: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/walletconnect.svg'),
        nodejs: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/nodedotjs.svg'),
        express: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/express.svg'),
        mongodb: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/mongodb.svg'),
        mongoose: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/mongoose.svg'),
        nodemailer: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/nodemailer.svg'),
        dicebear: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/dicebear.svg'),
      }
    },
  },
})
</script>
