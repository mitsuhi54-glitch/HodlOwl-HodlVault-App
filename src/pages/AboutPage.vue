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
      <span class="about-nav-link" @click="scrollTo('presets')">Presets</span>
      <span class="about-nav-link" @click="scrollTo('timing')">Timing</span>
      <span class="about-nav-link" @click="scrollTo('demo')">Demo</span>
    </nav>

    <section id="hero" class="about-section">
      <div class="about-hero">
        <div class="about-hero__content">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <img :src="logoSrc" alt="HodlVault" style="height: 48px; width: auto;" />
            <h1 style="font-size: 56px; margin: 0;">HODL<span class="text-neon">OWL</span></h1>
          </div>
          <p style="font-size: 20px; color: var(--color-text);">Force yourself to HODL Bitcoin Cash using smart contracts that lock your funds until your price target is met.</p>
          <p>HodlVault is a tool that helps you stick to your investment plan. You set a target price for Bitcoin Cash (BCH), lock your funds in a smart contract, and the system only lets you withdraw when that price is reached. No banks, no middlemen — just code enforcing your discipline.</p>
          <div style="display: flex; gap: 24px; margin-top: 32px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="material-icons text-neon">verified_user</i>
              <span class="text-mono" style="font-size: 13px;">YOU control the keys</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="material-icons text-neon">sensors</i>
              <span class="text-mono" style="font-size: 13px;">Live price feed</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="material-icons text-neon">gavel</i>
              <span class="text-mono" style="font-size: 13px;">Code-enforced rules</span>
            </div>
          </div>
        </div>
        <div class="about-hero__image">
          <img :src="mascotHero" alt="HodlVault Mascot" class="about-mascot-img" />
        </div>
      </div>
    </section>

    <section id="problem" class="about-section">
      <h2><i class="material-icons" style="font-size: 28px; color: var(--color-neon);">report_problem</i> The Problem</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px;">
        <div class="card" style="border-top: 3px solid #ff4444;">
          <i class="material-icons" style="font-size: 36px; color: #ff4444; margin-bottom: 12px; display: block;">sentiment_very_dissatisfied</i>
          <h3 style="font-size: 14px; margin-bottom: 8px;">Selling Too Early</h3>
          <p style="font-size: 13px; margin: 0;">When prices drop, many people panic and sell. They miss out on the big gains that come later.</p>
        </div>
        <div class="card" style="border-top: 3px solid #ffaa00;">
          <i class="material-icons" style="font-size: 36px; color: #ffaa00; margin-bottom: 12px; display: block;">psychology</i>
          <h3 style="font-size: 14px; margin-bottom: 8px;">Weak Willpower</h3>
          <p style="font-size: 13px; margin: 0;">Keeping your own crypto gives you full control, but it takes strong discipline not to sell when you get nervous.</p>
        </div>
        <div class="card" style="border-top: 3px solid #ff4444;">
          <i class="material-icons" style="font-size: 36px; color: #ff4444; margin-bottom: 12px; display: block;">gpp_bad</i>
          <h3 style="font-size: 14px; margin-bottom: 8px;">Exchange Dangers</h3>
          <p style="font-size: 13px; margin: 0;">Keeping crypto on an exchange means you don't truly own it. Plus, it's too easy to click "sell" on impulse.</p>
        </div>
      </div>
      <div class="card card--elevated" style="padding: 20px; border-left: 4px solid var(--color-neon);">
        <p style="margin: 0; font-size: 14px; color: var(--color-text);"><strong class="text-neon">The bottom line:</strong> There was no way to force yourself to HODL until a specific price was reached — until now.</p>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="solution" class="about-section">
      <h2><i class="material-icons" style="font-size: 28px; color: var(--color-neon);">lightbulb</i> Our Solution</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
        <div class="card" style="border-color: var(--color-neon-dim);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <i class="material-icons text-neon" style="font-size: 28px;">lock</i>
            <h3 style="font-size: 15px; margin: 0;">Price-Locked Vault</h3>
          </div>
          <p style="font-size: 13px; margin: 0;">Your BCH is locked in a smart contract that can only release funds when the price reaches your target. Think of it as a digital piggy bank that only opens when BCH hits a certain value.</p>
        </div>
        <div class="card" style="border-color: var(--color-neon-dim);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <i class="material-icons text-neon" style="font-size: 28px;">gavel</i>
            <h3 style="font-size: 15px; margin: 0;">Automatic Enforcement</h3>
          </div>
          <p style="font-size: 13px; margin: 0;">You're not just promising to hold — the blockchain enforces it. The rules are written in code and verified by the entire Bitcoin Cash network. Nobody can break them, not even us.</p>
        </div>
      </div>
      <div class="pull-quote">
        "Your keys. Your vault. Your target. The code handles the rest."
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="journey" class="about-section">
      <h2><i class="material-icons" style="font-size: 28px; color: var(--color-neon);">route</i> How It Works — Step by Step</h2>
      <div class="user-flow">
        <div class="flow-step">
          <div class="step-number">01</div>
          <div>
            <h3>Connect Your Wallet</h3>
            <p>Open the Paytaca mobile wallet and scan a QR code to connect. No need to create an account or remember a password — your wallet is your identity.</p>
          </div>
        </div>
        <div class="flow-step">
          <div class="step-number">02</div>
          <div>
            <h3>Set Your Target</h3>
            <p>Choose a preset multiplier (x1.25, x1.5, x2, or x5) or type a custom price. The system creates a unique smart contract based on your target.</p>
          </div>
        </div>
        <div class="flow-step">
          <div class="step-number">03</div>
          <div>
            <h3>Send BCH to the Vault</h3>
            <p>Transfer your Bitcoin Cash to the contract address. The system detects your deposit in seconds and updates your dashboard automatically.</p>
          </div>
        </div>
        <div class="flow-step">
          <div class="step-number">04</div>
          <div>
            <h3>Funds Are Locked</h3>
            <p>Your BCH is now trapped in the smart contract. It can only be released if a trusted price feed confirms your target has been reached.</p>
          </div>
        </div>
        <div class="flow-step">
          <div class="step-number">05</div>
          <div>
            <h3>Target Reached</h3>
            <p>When the current price meets or exceeds your target, the contract unlocks. If you enabled auto-withdrawal, the system sends your funds back automatically.</p>
          </div>
        </div>
        <div class="flow-step">
          <div class="step-number">06</div>
          <div>
            <h3>Automatic Payout</h3>
            <p>Once the price target is met, the system sends your BCH back to your wallet automatically — no signing required. Your address was built into the contract at creation, so the funds can only go to you.</p>
          </div>
        </div>
      </div>

      <div class="arch-diagram">
        <div class="arch-card">YOUR WALLET (PAYTACA)</div>
        <div class="arch-arrow"><i class="material-icons">south</i></div>
        <div class="arch-card" style="border-color: var(--color-neon);">HODLOWL APP</div>
        <div class="arch-arrow"><i class="material-icons">sync</i></div>
        <div class="arch-card">BITCOIN CASH BLOCKCHAIN + PRICE FEED</div>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="contract" class="about-section">
      <h2><i class="material-icons" style="font-size: 28px; color: var(--color-neon);">contract</i> The Smart Contract</h2>
      <p>The vault is powered by a contract written in <strong>CashScript</strong>, which runs on the Bitcoin Cash blockchain. Think of it as a set of rules that the entire network agrees to enforce.</p>
      <div class="card card--elevated" style="padding: 32px;">
        <h3 class="label-tiny">What the Contract Contains</h3>
        <ul class="text-muted" style="font-size: 14px; margin-bottom: 24px;">
          <li><strong class="text-neon">Your identity</strong>: A hash of your public key proving you're the owner.</li>
          <li><strong class="text-neon">Price feed key</strong>: The public key of the trusted price provider (General Protocols).</li>
          <li><strong class="text-neon">Your target price</strong>: The BCH price in Philippine Pesos that must be reached.</li>
        </ul>
        <h3 class="label-tiny">Security Rules</h3>
        <p style="font-size: 13px;">To withdraw, three things must be true:
        <br>1. The price feed must sign a message proving the current price.
        <br>2. That price must be at or above your target.
        <br>3. The funds can ONLY go back to your wallet address.</p>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="arch" class="about-section">
      <h2><i class="material-icons" style="font-size: 28px; color: var(--color-neon);">account_tree</i> How the System is Built</h2>
      <div class="feature-grid">
        <div class="feature-item">
          <h3>App Layer (Frontend)</h3>
          <p>The dashboard and pages you see are built with <strong>Vue 3</strong>. This handles wallet connections, avatars, contract creation, and showing your real-time portfolio.</p>
        </div>
        <div class="feature-item">
          <h3>Server Layer (Backend)</h3>
          <p>A <strong>Node.js</strong> server runs in the background managing vault data, caching price feeds, sending notifications, and handling automatic withdrawals.</p>
        </div>
        <div class="feature-item">
          <h3>Blockchain Layer</h3>
          <p>The <strong>Bitcoin Cash network</strong> is where the contracts live. It's decentralized and permissionless — nobody can stop your vault or freeze your funds.</p>
        </div>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="features" class="about-section">
      <h2><i class="material-icons" style="font-size: 28px; color: var(--color-neon);">dashboard</i> Key Features</h2>
      <div class="feature-grid">
        <div class="feature-item">
          <i class="material-icons">account_balance_wallet</i>
          <h3>WalletConnect Support</h3>
          <p>Connect using the Paytaca wallet on your phone via QR code. Your private keys stay on your device — we never see them.</p>
        </div>
        <div class="feature-item">
          <i class="material-icons">track_changes</i>
          <h3>Price-Target Vaults</h3>
          <p>Set a target price using quick presets (x1.25, x1.5, x2, x5) or type your own. You can even add more BCH to an existing vault later.</p>
        </div>
        <div class="feature-item">
          <i class="material-icons">rss_feed</i>
          <h3>Live Price Feed</h3>
          <p>A trusted price provider (General Protocols) supplies accurate BCH/PHP prices, cryptographically signed so they can't be faked.</p>
        </div>
        <div class="feature-item">
          <i class="material-icons">bolt</i>
          <h3>Auto-Withdrawal</h3>
          <p>Turn on auto-withdrawal and the system will send your funds back the moment your target is hit. Set it and forget it.</p>
        </div>
        <div class="feature-item">
          <i class="material-icons">dashboard</i>
          <h3>Portfolio Dashboard</h3>
          <p>See all your vaults in one place. Check how much you have locked, which vaults are ready to withdraw, and your total balance.</p>
        </div>
        <div class="feature-item">
          <i class="material-icons">notifications_active</i>
          <h3>Smart Alerts</h3>
          <p>Get notified via push notification or email when you receive a deposit, when a target is hit, or when a withdrawal happens.</p>
        </div>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="identity" class="about-section">
      <h2><i class="material-icons" style="font-size: 28px; color: var(--color-neon);">face</i> Profile &amp; Identity</h2>
      <div class="about-identity-layout">
        <div class="about-identity-content">
          <p>Every connected wallet can create a profile to stand out in the community. Your identity follows you across all sessions.</p>
          <div class="feature-grid" style="margin-top: 24px;">
            <div class="feature-item">
              <h3>Pixel Art Avatars</h3>
              <p>Generate a unique pixel-art avatar from any word or phrase. You can re-roll to get a different one anytime. Your avatar shows on your dashboard and the leaderboard.</p>
            </div>
            <div class="feature-item">
              <h3>Display Names</h3>
              <p>Set a custom name that appears everywhere instead of your long wallet address. Make it fun or keep it mysterious.</p>
            </div>
            <div class="feature-item">
              <h3>Saved Profile</h3>
              <p>Your name and avatar are saved on our server. Reconnect on any device and your profile is still there.</p>
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
          <p class="text-muted" style="font-size: 12px; text-align: center; margin-top: 12px;">Sample DiceBear avatars — each seed gives a unique design</p>
          <div class="about-avatar-features">
            <div class="about-avatar-feature">
              <i class="material-icons text-neon" style="font-size: 16px;">casino</i>
              <span>Random from any word</span>
            </div>
            <div class="about-avatar-feature">
              <i class="material-icons text-neon" style="font-size: 16px;">refresh</i>
              <span>Re-roll anytime</span>
            </div>
            <div class="about-avatar-feature">
              <i class="material-icons text-neon" style="font-size: 16px;">person</i>
              <span>Shows initials as backup</span>
            </div>
          </div>
        </div>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="ranking" class="about-section">
      <h2><i class="material-icons" style="font-size: 28px; color: var(--color-neon);">leaderboard</i> Leaderboard &amp; Ranking</h2>
      <div class="about-ranking-layout">
        <div class="about-ranking-content">
          <p>Compete with other users! The leaderboard ranks everyone by total BCH locked in vaults. It updates automatically as vaults are created or withdrawn.</p>
          <div class="feature-grid" style="margin-top: 24px;">
            <div class="feature-item">
              <h3>Live Rankings</h3>
              <p>One leaderboard sorted by total BCH locked. Your rank moves up or down in real-time as activity happens.</p>
            </div>
            <div class="feature-item">
              <h3>Your Profile Card</h3>
              <p>The leaderboard shows each user's avatar, display name, BCH locked, and vault count. Your own rank card appears on your dashboard sidebar.</p>
            </div>
            <div class="feature-item">
              <h3>Top Trader Medals</h3>
              <p>The top 10 hodlers earn a special medal icon. A full leaderboard modal lets you see where everyone stands.</p>
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
          <p class="text-muted" style="font-size: 12px; text-align: center; margin-top: 12px;">Example — ranked by total BCH locked in vaults</p>
        </div>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="security" class="about-section">
      <h2><i class="material-icons" style="font-size: 28px; color: var(--color-neon);">verified</i> Security &amp; Trust</h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div class="card" style="display: flex; align-items: flex-start; gap: 16px; padding: 20px;">
          <i class="material-icons text-neon" style="font-size: 36px; flex-shrink: 0;">vpn_key</i>
          <div>
            <h3 style="font-size: 14px; margin-bottom: 6px;">You Own Your Keys</h3>
            <p style="font-size: 13px; margin: 0; color: var(--color-text-dim);">We never hold your private keys. Your funds are locked in a contract that only <strong class="text-neon">you control</strong>. Not us, not anyone else.</p>
          </div>
        </div>
        <div class="card" style="display: flex; align-items: flex-start; gap: 16px; padding: 20px;">
          <i class="material-icons text-neon" style="font-size: 36px; flex-shrink: 0;">verified_user</i>
          <div>
            <h3 style="font-size: 14px; margin-bottom: 6px;">Trusted Price Feed</h3>
            <p style="font-size: 13px; margin: 0; color: var(--color-text-dim);">Your vault can't be unlocked without a valid signed message from <strong class="text-neon">General Protocols</strong>, a trusted price provider. No fake prices possible.</p>
          </div>
        </div>
        <div class="card" style="display: flex; align-items: flex-start; gap: 16px; padding: 20px;">
          <i class="material-icons text-neon" style="font-size: 36px; flex-shrink: 0;">lock</i>
          <div>
            <h3 style="font-size: 14px; margin-bottom: 6px;">Only You Can Withdraw</h3>
            <p style="font-size: 13px; margin: 0; color: var(--color-text-dim);">The contract is coded so that even when the target is hit, funds can only go <strong class="text-neon">back to your wallet</strong>. Nobody else can claim them.</p>
          </div>
        </div>
        <div class="card" style="display: flex; align-items: flex-start; gap: 16px; padding: 20px;">
          <i class="material-icons text-neon" style="font-size: 36px; flex-shrink: 0;">visibility</i>
          <div>
            <h3 style="font-size: 14px; margin-bottom: 6px;">Fully Transparent</h3>
            <p style="font-size: 13px; margin: 0; color: var(--color-text-dim);">Every vault contract address is <strong class="text-neon">public on the blockchain</strong>. Anyone can verify your funds are really there using a block explorer.</p>
          </div>
        </div>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="stack" class="about-section">
      <h2><i class="material-icons" style="font-size: 28px; color: var(--color-neon);">layers</i> Technology Stack</h2>
      <table class="table-stack">
        <thead>
          <tr>
            <th>Layer</th>
            <th>Technologies</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Frontend</td><td> <span class="tech-icon"><img :src="techIcons.vue" alt="" />Vue 3</span> <span class="tech-icon"><img :src="techIcons.quasar" alt="" />Quasar</span> <span class="tech-icon"><img :src="techIcons.vite" alt="" />Vite</span> <span class="tech-icon"><img :src="techIcons.axios" alt="" />Axios</span> <span class="tech-icon">Vuex</span></td></tr>
          <tr><td>Wallet</td><td><span class="tech-icon"><img :src="techIcons.walletconnect" alt="" />WalletConnect v2</span> <span class="tech-icon">Paytaca (BCH)</span></td></tr>
          <tr><td>Smart Contracts</td><td><span class="tech-icon">CashScript 0.11</span> <span class="tech-icon">cashc</span> <span class="tech-icon">libauth</span></td></tr>
          <tr><td>Backend</td><td><span class="tech-icon"><img :src="techIcons.nodejs" alt="" />Node.js</span> <span class="tech-icon"><img :src="techIcons.express" alt="" />Express 5</span> <span class="tech-icon"><img :src="techIcons.mongodb" alt="" />MongoDB</span> <span class="tech-icon"><img :src="techIcons.mongoose" alt="" />Mongoose</span></td></tr>
          <tr><td>Real-time</td><td><span class="tech-icon">Server-Sent Events (SSE)</span></td></tr>
          <tr><td>Notifications</td><td><span class="tech-icon">OneSignal</span> <span class="tech-icon">Nodemailer</span></td></tr>
          <tr><td>Oracle</td><td><span class="tech-icon">Oracles.cash (General Protocols)</span></td></tr>
          <tr><td>Avatars</td><td><span class="tech-icon">DiceBear Pixel Art</span></td></tr>
        </tbody>
      </table>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="presets" class="about-section">
      <h2><i class="material-icons" style="font-size: 28px; color: var(--color-neon);">trending_up</i> Why These Presets?</h2>
      <p>When you create a vault, you can pick from four preset multipliers: <strong class="text-neon">x1.25</strong>, <strong class="text-neon">x1.5</strong>, <strong class="text-neon">x2.0</strong>, and <strong class="text-neon">x5.0</strong>. Each one simply multiplies the current BCH price by that number to calculate your target. Here's why these specific values were chosen.</p>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 32px 0;">
        <div class="card" style="border-left: 3px solid var(--color-neon);">
          <h3 class="label-tiny">Highest Price Ever (All-Time High)</h3>
          <p style="font-size: 24px; font-weight: 700; color: var(--color-text); margin: 4px 0;">$4,355</p>
          <p style="font-size: 12px; margin: 0; color: var(--color-text-dim);">Reached in December 2017. Another peak of ~$3,785 happened in May 2021.</p>
        </div>
        <div class="card" style="border-left: 3px solid #ff4444;">
          <h3 class="label-tiny">Lowest Price Ever (All-Time Low)</h3>
          <p style="font-size: 24px; font-weight: 700; color: var(--color-text); margin: 4px 0;">$77</p>
          <p style="font-size: 12px; margin: 0; color: var(--color-text-dim);">Reached in December 2018. In the last year, BCH has traded between $249 and $715.</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
        <div class="card" style="text-align: center; border-top: 3px solid #4caf50;">
          <div style="font-size: 20px; font-weight: 700; color: #4caf50;">x1.25</div>
          <div style="font-size: 12px; color: var(--color-text-dim);">+25% target</div>
          <div style="font-size: 11px; margin-top: 8px; color: var(--color-text-dim);">For short-term goals. BCH regularly moves 25% or more within a few weeks. Good for quick wins.</div>
        </div>
        <div class="card" style="text-align: center; border-top: 3px solid #8bc34a;">
          <div style="font-size: 20px; font-weight: 700; color: #8bc34a;">x1.5</div>
          <div style="font-size: 12px; color: var(--color-text-dim);">+50% target</div>
          <div style="font-size: 11px; margin-top: 8px; color: var(--color-text-dim);">For medium-term goals. BCH reached $715 recently — that's a 50% jump from around $475. Realistic in a few months.</div>
        </div>
        <div class="card" style="text-align: center; border-top: 3px solid #ff9800;">
          <div style="font-size: 20px; font-weight: 700; color: #ff9800;">x2.0</div>
          <div style="font-size: 12px; color: var(--color-text-dim);">+100% target</div>
          <div style="font-size: 11px; margin-top: 8px; color: var(--color-text-dim);">For bull market goals. BCH has doubled in value multiple times (e.g. from $249 to $715). Requires patience.</div>
        </div>
        <div class="card" style="text-align: center; border-top: 3px solid #f44336;">
          <div style="font-size: 20px; font-weight: 700; color: #f44336;">x5.0</div>
          <div style="font-size: 12px; color: var(--color-text-dim);">+400% target</div>
          <div style="font-size: 11px; margin-top: 8px; color: var(--color-text-dim);">For long-term believers. BCH has been over $4,000 before, so $2,000 is well within reach. This is for patient holders.</div>
        </div>
      </div>

      <div class="card card--elevated" style="padding: 24px; border: 1px solid var(--color-neon-dim);">
        <p style="font-size: 14px; margin: 0;"><strong class="text-neon">Think of it like a stairway:</strong> x1.25 is the first step (small and quick), x1.5 is a medium step, x2.0 is a big step during a bull run, and x5.0 is the top floor for long-term believers. If none of these fit your plan, you can type any custom target in the input field.</p>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="timing" class="about-section">
      <h2><i class="material-icons" style="font-size: 28px; color: var(--color-neon);">schedule</i> How the System Runs Behind the Scenes</h2>
      <p>HodlVault has several background processes that keep everything running smoothly. Each one runs on a timer that balances speed with server resources.</p>

      <div style="display: grid; gap: 16px; margin: 32px 0;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="card" style="display: flex; align-items: flex-start; gap: 16px; padding: 20px;">
            <i class="material-icons text-neon" style="font-size: 32px; flex-shrink: 0;">autorenew</i>
            <div>
              <h3 style="font-size: 14px; margin-bottom: 4px;">Automatic Withdrawal Check</h3>
              <p style="font-size: 12px; margin: 0; color: var(--color-text-dim);">Every <strong class="text-neon">3 seconds</strong>, the server checks if any vaults have reached their target and automatically sends the funds back. This runs constantly so you never miss your exit.</p>
            </div>
          </div>
          <div class="card" style="display: flex; align-items: flex-start; gap: 16px; padding: 20px;">
            <i class="material-icons text-neon" style="font-size: 32px; flex-shrink: 0;">visibility</i>
            <div>
              <h3 style="font-size: 14px; margin-bottom: 4px;">Deposit Detection</h3>
              <p style="font-size: 12px; margin: 0; color: var(--color-text-dim);">The system checks for incoming BCH every <strong class="text-neon">5 seconds</strong>. When it detects a deposit, your dashboard updates instantly so you know your vault is funded.</p>
            </div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="card" style="display: flex; align-items: flex-start; gap: 16px; padding: 20px;">
            <i class="material-icons text-neon" style="font-size: 32px; flex-shrink: 0;">price_change</i>
            <div>
              <h3 style="font-size: 14px; margin-bottom: 4px;">Price Feed Updates</h3>
              <p style="font-size: 12px; margin: 0; color: var(--color-text-dim);">The BCH price is fetched from the trusted provider every <strong class="text-neon">60 seconds</strong>. This avoids overloading their service while keeping the price accurate to within a minute.</p>
            </div>
          </div>
          <div class="card" style="display: flex; align-items: flex-start; gap: 16px; padding: 20px;">
            <i class="material-icons text-neon" style="font-size: 32px; flex-shrink: 0;">account_balance_wallet</i>
            <div>
              <h3 style="font-size: 14px; margin-bottom: 4px;">Wallet Balance Refresh</h3>
              <p style="font-size: 12px; margin: 0; color: var(--color-text-dim);">Your dashboard refreshes your wallet balance every <strong class="text-neon">30 seconds</strong>. The vault creation page checks more often (every <strong class="text-neon">10 seconds</strong>) so you see deposits faster.</p>
            </div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="card" style="display: flex; align-items: flex-start; gap: 16px; padding: 20px;">
            <i class="material-icons text-neon" style="font-size: 32px; flex-shrink: 0;">wifi</i>
            <div>
              <h3 style="font-size: 14px; margin-bottom: 4px;">Live Connection</h3>
              <p style="font-size: 12px; margin: 0; color: var(--color-text-dim);">The server keeps a live connection to the Bitcoin Cash network. It sends a signal every <strong class="text-neon">30 seconds</strong> to stay connected, and auto-reconnects within <strong class="text-neon">5 seconds</strong> if the connection drops.</p>
            </div>
          </div>
          <div class="card" style="display: flex; align-items: flex-start; gap: 16px; padding: 20px;">
            <i class="material-icons text-neon" style="font-size: 32px; flex-shrink: 0;">notifications</i>
            <div>
              <h3 style="font-size: 14px; margin-bottom: 4px;">Notifications &amp; Expiry</h3>
              <p style="font-size: 12px; margin: 0; color: var(--color-text-dim);">Email verification codes expire after <strong class="text-neon">10 minutes</strong> for security. Deposit watches (which listen for your incoming BCH) expire after <strong class="text-neon">1 hour</strong> to clean up old data.</p>
            </div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="card" style="display: flex; align-items: flex-start; gap: 16px; padding: 20px;">
            <i class="material-icons text-neon" style="font-size: 32px; flex-shrink: 0;">power_settings_new</i>
            <div>
              <h3 style="font-size: 14px; margin-bottom: 4px;">Auto-Disconnect</h3>
              <p style="font-size: 12px; margin: 0; color: var(--color-text-dim);">For your safety, your wallet disconnects after <strong class="text-neon">30 minutes</strong> of inactivity. The system also checks your wallet connection every <strong class="text-neon">60 seconds</strong> to make sure it's still active.</p>
            </div>
          </div>
          <div class="card" style="display: flex; align-items: flex-start; gap: 16px; padding: 20px;">
            <i class="material-icons text-neon" style="font-size: 32px; flex-shrink: 0;">timer</i>
            <div>
              <h3 style="font-size: 14px; margin-bottom: 4px;">Smart Deposit Polling</h3>
              <p style="font-size: 12px; margin: 0; color: var(--color-text-dim);">When creating a vault, the page checks for your deposit every <strong class="text-neon">5 seconds</strong>. If nothing arrives after <strong class="text-neon">2 minutes</strong>, it stops checking automatically to save resources.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card card--elevated" style="padding: 24px; border: 1px solid var(--color-neon-dim);">
        <p style="font-size: 14px; margin: 0;"><strong class="text-neon">Why all these timers?</strong> Every interval is a balance — faster checks mean quicker updates but use more server power. The 3-second auto-withdrawal check catches targets fast. The 60-second price refresh prevents hitting the price provider too often. The 30-minute auto-disconnect keeps your account safe. These values were chosen through real testing of what works best.</p>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section id="demo" class="about-section">
      <div class="presenter-checklist">
        <h2 style="font-size: 20px; color: var(--color-neon);"><i class="material-icons" style="font-size: 24px; color: var(--color-neon);">play_circle</i> Live Demo Walkthrough</h2>
        <div style="display: grid; gap: 12px; margin-top: 16px;">
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Show the homepage and explain what HodlVault does.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Connect your Paytaca wallet via QR code — see the wallet status update.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Set up your profile — generate a DiceBear avatar, enter a display name.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Create a vault — pick a preset multiplier or type a custom target price.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Fund the vault via QR code — watch the real-time deposit detection work.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>View your portfolio — see HODLing vs Ready states, check your balances.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Open the Leaderboard — see rankings with avatars and BCH totals.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>Set up email notifications — register, verify, and toggle settings.</span>
          </div>
          <div style="display: flex; gap: 12px; align-items: start;">
            <i class="material-icons" style="font-size: 18px; color: var(--color-neon);">check_box_outline_blank</i>
            <span>(Optional) Enable auto-withdrawal for a "set and forget" experience.</span>
          </div>
        </div>
      </div>
      <div class="back-to-top"><span class="about-back-link" @click="scrollTo('hero')">Back to top</span></div>
    </section>

    <section class="about-section" style="border-top: 1px solid var(--color-border); padding-top: 40px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
        <div>
          <h3 class="label-tiny">Project Goal</h3>
          <p style="font-size: 13px;">A secure, full-stack Web 3.0 demonstration of how Bitcoin Cash smart contracts can help people stick to their investment plans by removing emotion from the equation.</p>
        </div>
        <div>
          <h3 class="label-tiny">Project Info</h3>
          <p style="font-size: 13px;">
            Institution: Intern System Project<br>
            Version: v4.0.1 (Chipnet Release)<br>
            Author: Edo_Tensei
          </p>
        </div>
      </div>
      <div style="margin-top: 40px; text-align: center;">
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
    }
  },

  created() {
    this.mascotHero = new URL('../assets/images/HodlVault Mascot.webp', import.meta.url).href
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
        walletconnect: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/walletconnect.svg'),
        nodejs: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/nodedotjs.svg'),
        express: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/express.svg'),
        mongodb: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/mongodb.svg'),
        mongoose: s('https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/mongoose.svg'),
      }
    },
  },
})
</script>
