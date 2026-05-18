<template>
  <main class="about-container">
    
    <!-- Table of Contents sticky -->
    <div class="about-nav-sticky">
      <a href="#hero">Opening</a>
      <a href="#problem">Problem</a>
      <a href="#solution">Solution</a>
      <a href="#journey">Journey</a>
      <a href="#contract">Contract</a>
      <a href="#arch">Architecture</a>
      <a href="#features">Features</a>
      <a href="#security">Security</a>
      <a href="#stack">Stack</a>
      <a href="#demo">Demo</a>
    </div>

    <!-- 1. HERO -->
    <section id="hero" class="about-section">
      <h1 style="font-size: 48px; margin-bottom: 16px;">HODL<span class="text-neon">VAULT</span></h1>
      <p style="font-size: 20px; color: var(--color-text);">Force-HODL Your Bitcoin Cash via Price-Target Smart Contracts.</p>
      <p>HodlVault is a non-custodial commitment device designed to enforce disciplined Bitcoin Cash (BCH) investing by locking funds until specific price targets are met, verified by decentralized oracles.</p>
      <div style="display: flex; gap: 24px; margin-top: 32px;">
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
    </section>

    <!-- 2. THE PROBLEM -->
    <section id="problem" class="about-section">
      <h2>The Problem</h2>
      <p>Crypto investors frequently suffer from "paper hands," selling their assets prematurely due to short-term market volatility or emotional stress. This prevents long-term holders from reaching their ultimate financial goals as they exit positions during temporary dips or minor rallies.</p>
      <p>Traditional self-custody offers total control but requires immense willpower to stick to a plan. Conversely, exchange custody introduces counterparty risk and allows for impulsive "market sell" clicks. There is a distinct lack of permissionless commitment devices that treat an investor's future self as the only authorized recipient of funds once a specific, objective condition has been satisfied.</p>
      <div class="back-to-top"><a href="#">Back to top</a></div>
    </section>

    <!-- 3. OUR SOLUTION -->
    <section id="solution" class="about-section">
      <h2>Our Solution</h2>
      <p>HodlVault leverages Bitcoin Cash smart contracts (covenants) to lock funds on-chain. Unlike a simple time-lock, HodlVault uses a price-lock. Funds only become spendable when a signed message from a trusted oracle (Oracles.cash) proves that the market price of BCH has reached or exceeded the user's pre-defined target in Philippine Pesos (PHP).</p>
      <p>This is "Force-HODLing": you aren't just promising to hold; the network itself is enforcing your discipline. The platform never holds your keys; the rules are written in immutable script and verified by every node on the BCH network.</p>
      
      <div class="pull-quote">
        "Your keys. Your vault. Your target. The chain enforces the rest."
      </div>
      <div class="back-to-top"><a href="#">Back to top</a></div>
    </section>

    <!-- 4. HOW IT WORKS -->
    <section id="journey" class="about-section">
      <h2>Technical User Journey</h2>
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
            <p>User defines a target price (e.g. ₱50,000/BCH). The system compiles and deploys a unique CashScript contract to the network.</p>
          </div>
        </div>
        <div class="flow-step">
          <div class="step-number">03</div>
          <div>
            <h3>Fund Contract</h3>
            <p>User sends BCH to the generated contract address. The backend deposit-watcher detects the UTXO and updates the dashboard.</p>
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
            <p>When current price ≥ target, the "spend" path of the contract unlocks. The UI status shifts to "Ready to Withdraw."</p>
          </div>
        </div>
        <div class="flow-step">
          <div class="step-number">06</div>
          <div>
            <h3>Secure Withdrawal</h3>
            <p>User signs a transaction via Paytaca. Funds are sent directly from the contract to the user's wallet address.</p>
          </div>
        </div>
      </div>

      <div class="arch-diagram">
        <div class="arch-card">USER (PAYTACA WALLET)</div>
        <div class="arch-arrow"><i class="material-icons">south</i></div>
        <div class="arch-card" style="border-color: var(--color-neon);">HODLVAULT FRONTEND</div>
        <div class="arch-arrow"><i class="material-icons">sync</i></div>
        <div class="arch-card">BLOCKCHAIN (BCH) & ORACLE</div>
      </div>
      <div class="back-to-top"><a href="#">Back to top</a></div>
    </section>

    <!-- 5. SMART CONTRACT -->
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
      <div class="back-to-top"><a href="#">Back to top</a></div>
    </section>

    <!-- 6. SYSTEM ARCHITECTURE -->
    <section id="arch" class="about-section">
      <h2>System Architecture</h2>
      <div class="feature-grid">
        <div class="feature-item">
          <h3>Frontend Layer</h3>
          <p>Built with <strong>Vue 3 & Vite</strong>. Handles WalletConnect integration, contract compilation, and real-time UI state management.</p>
        </div>
        <div class="feature-item">
          <h3>Service Layer</h3>
          <p><strong>Node.js & Express</strong> backend managing vault metadata, oracle feed caching, and Server-Sent Events (SSE) for instant deposit notifications.</p>
        </div>
        <div class="feature-item">
          <h3>Protocol Layer</h3>
          <p><strong>Bitcoin Cash Network</strong> (Chipnet) providing the infrastructure for decentralized, permissionless contract execution.</p>
        </div>
      </div>
      <div class="back-to-top"><a href="#">Back to top</a></div>
    </section>

    <!-- 7. KEY FEATURES -->
    <section id="features" class="about-section">
      <h2>Core Feature Matrix</h2>
      <div class="feature-grid">
        <div class="feature-item">
          <i class="material-icons">account_balance_wallet</i>
          <h3>Paytaca Integration</h3>
          <p>Deep-linked mobile wallet support for signing on-chain actions without exposing keys.</p>
        </div>
        <div class="feature-item">
          <i class="material-icons">track_changes</i>
          <h3>Price-Target Vaults</h3>
          <p>Set custom targets or use preset multipliers (x1.5, x2, x5) for strategic exits.</p>
        </div>
        <div class="feature-item">
          <i class="material-icons">rss_feed</i>
          <h3>Live Oracle Data</h3>
          <p>Powered by General Protocols (Oracles.cash) for reliable PHP/BCH price verification.</p>
        </div>
        <div class="feature-item">
          <i class="material-icons">bolt</i>
          <h3>Auto-Withdrawal</h3>
          <p>Optional server-side withdrawal submission once target is hit for "set and forget" exits.</p>
        </div>
        <div class="feature-item">
          <i class="material-icons">dashboard</i>
          <h3>Portfolio Summary</h3>
          <p>Unified view of total assets across all vaults with real-time conversion (sats/mBCH/BCH).</p>
        </div>
        <div class="feature-item">
          <i class="material-icons">notifications_active</i>
          <h3>Smart Alerts</h3>
          <p>Push and email notifications for deposits, withdrawals, and target achievement events.</p>
        </div>
      </div>
      <div class="back-to-top"><a href="#">Back to top</a></div>
    </section>

    <!-- 8. SECURITY -->
    <section id="security" class="about-section">
      <h2>Security & Trust Model</h2>
      <ul class="text-muted" style="display: grid; gap: 12px; font-size: 15px;">
        <li><strong class="text-neon">Non-Custodial:</strong> Neither HodlVault nor any 3rd party holds your private keys. Funds are locked in a script you control.</li>
        <li><strong class="text-neon">Oracle Integrity:</strong> Locked funds cannot be released without a valid cryptographic signature from the General Protocols oracle.</li>
        <li><strong class="text-neon">Covenant Security:</strong> Bitcoin Cash script ensures that even if the contract is triggered, funds can only go to YOUR address.</li>
        <li><strong class="text-neon">Transparancy:</strong> All vault addresses are public and verifiable on any BCH block explorer.</li>
      </ul>
      <div class="back-to-top"><a href="#">Back to top</a></div>
    </section>

    <!-- 9. TECH STACK -->
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
          <tr><td>Frontend</td><td>Vue 3, Quasar, Vite, Axios, Recharts</td></tr>
          <tr><td>Wallet</td><td>WalletConnect v2, Paytaca (BCH)</td></tr>
          <tr><td>Smart Contracts</td><td>CashScript 0.11, cashc, libauth</td></tr>
          <tr><td>Backend</td><td>Node.js, Express 5, MongoDB, Mongoose</td></tr>
          <tr><td>Real-time</td><td>Server-Sent Events (SSE)</td></tr>
          <tr><td>Notifications</td><td>OneSignal, Nodemailer</td></tr>
          <tr><td>Oracle</td><td>Oracles.cash (General Protocols)</td></tr>
        </tbody>
      </table>
      <div class="back-to-top"><a href="#">Back to top</a></div>
    </section>

    <!-- 10. DEMO WALKTHROUGH -->
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
            <span>Connect Paytaca wallet (simulated/real).</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Create a new vault with ₱40,000 target.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Fund vault via QR code / show deposit watcher.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Navigate portfolio and show HODLing vs Ready states.</span>
          </div>
        </div>
      </div>
      <div class="back-to-top"><a href="#">Back to top</a></div>
    </section>

    <!-- 11. PROJECT CONTEXT -->
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
        <p style="font-size: 11px; color: var(--color-text-dim);">HODLVAULT — disciplined investing, enforced by code.</p>
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
export default defineComponent({
  name: "AboutPage"
})
</script>
