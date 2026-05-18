<template>
  <main class="container" style="padding-top: 80px; padding-bottom: 40px;">
    <div style="display: grid; grid-template-columns: 5fr 7fr; gap: 48px; align-items: start;">
      
      <!-- SECTION: Hero Left -->
      <div class="hero-left">
        <h1 style="font-size: clamp(2rem, 4vw, 3rem); line-height: 1.1; margin-bottom: 0;">FORCE-HODL YOUR</h1>
        <h1 class="text-neon" style="font-size: clamp(2.5rem, 5vw, 4rem); line-height: 1.1; margin-bottom: 24px;">BITCOIN CASH</h1>
        
        <p class="text-muted" style="max-width: 480px; font-size: 16px; margin-bottom: 32px;">
          Lock your BCH in non-custodial smart contracts that only trigger withdrawals when your minimum price target is reached. Avoid emotional selling and secure your future moonbag.
        </p>

        <div class="cta-row" style="display: flex; gap: 16px;">
          <router-link to="/dashboard" class="btn btn--primary">Get Started</router-link>
          <router-link to="/about" class="btn btn--outline">Know more</router-link>
        </div>

        <div class="stats-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 48px;">
          <div class="card card--elevated" style="min-height: 90px; padding: 16px 20px;">
            <span class="label-tiny">Total Locked</span>
            <div class="text-neon" style="font-size: 20px; font-weight: 700;"><span class="counter" ref="counter1" data-target="1240.42">0.00</span> <span style="font-size: 12px;">BCH</span></div>
          </div>
          <div class="card card--elevated" style="min-height: 90px; padding: 16px 20px;">
            <span class="label-tiny">Active Vaults</span>
            <div class="counter" ref="counter2" data-target="856" style="font-size: 20px; font-weight: 700;">0</div>
          </div>
          <div class="card card--elevated" style="min-height: 90px; padding: 16px 20px;">
            <span class="label-tiny">Total Target Price Reached</span>
            <div class="counter" ref="counter3" data-target="14204" style="font-size: 20px; font-weight: 700;">0</div>
          </div>
        </div>
      </div>

      <!-- SECTION: Create Vault Form (Replaced with Slideshow in this exact HTML) -->
      <div class="hero-right">
        <div class="oracle-strip" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 11px;">
          <div style="display: flex; align-items: center; gap: 4px; color: var(--color-neon);">
            <i class="material-icons" style="font-size: 14px;">check_circle</i>
            <span class="text-mono">Oracle Status: Stable</span>
          </div>
          <div class="text-muted text-mono">
            Latest Price: ₱24,500.00
          </div>
          <a href="#" class="text-neon text-mono" style="text-decoration: none;">REFRESH</a>
        </div>

        <div class="slideshow-container" style="cursor: pointer;" @click="advanceSlide">
          <!-- Slide 1 -->
          <div class="slide" :class="{ active: slideIndex === 0 }" style="display: block;">
            <img src="https://plus.unsplash.com/premium_photo-1681487769650-a0c3fbaed81a?q=80&w=1000&auto=format&fit=crop" alt="System Interface">
            <div class="slide-overlay">
              <div class="slide-title">Non-Custodial Security</div>
              <div class="slide-description">Your assets remain under your control via mathematical smart contracts.</div>
            </div>
          </div>
          <!-- Slide 2 -->
          <div class="slide" :class="{ active: slideIndex === 1 }" style="display: block;">
            <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop" alt="Network Nodes">
            <div class="slide-overlay">
              <div class="slide-title">Global Oracle Network</div>
              <div class="slide-description">Fail-safe price monitoring across multiple Tier-1 data providers.</div>
            </div>
          </div>
          <!-- Slide 3 -->
          <div class="slide" :class="{ active: slideIndex === 2 }" style="display: block;">
            <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop" alt="Digital Future">
            <div class="slide-overlay">
              <div class="slide-title">Automated Execution</div>
              <div class="slide-description">Set your targets once and let the protocol handle the rest.</div>
            </div>
          </div>

          <!-- DOTS NAVIGATION -->
          <div class="slideshow-dots" @click.stop>
            <button class="dot-btn" :class="{ active: slideIndex === 0 }" @click="goToSlide(0)"></button>
            <button class="dot-btn" :class="{ active: slideIndex === 1 }" @click="goToSlide(1)"></button>
            <button class="dot-btn" :class="{ active: slideIndex === 2 }" @click="goToSlide(2)"></button>
          </div>
        </div>
      </div>

    </div>
  </main>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndexPage',
  data() {
    return {
      slideIndex: 0,
      slideTimeout: null
    }
  },
  mounted() {
    this.startSlideshow();
    this.initCounters();
  },
  beforeUnmount() {
    if (this.slideTimeout) {
      clearTimeout(this.slideTimeout)
      this.slideTimeout = null
    }
  },
  methods: {
    showSlides() {
      this.slideIndex++;
      if (this.slideIndex > 2) this.slideIndex = 0;
      this.slideTimeout = setTimeout(this.showSlides, 4000);
    },
    startSlideshow() {
      this.slideTimeout = setTimeout(this.showSlides, 4000);
    },
    advanceSlide() {
      if (this.slideTimeout) clearTimeout(this.slideTimeout);
      this.showSlides();
    },
    goToSlide(index) {
      if (this.slideTimeout) clearTimeout(this.slideTimeout);
      this.slideIndex = index;
      this.slideTimeout = setTimeout(this.showSlides, 4000);
    },
    initCounters() {
      const counters = [this.$refs.counter1, this.$refs.counter2, this.$refs.counter3];
      counters.forEach(counter => {
        if(!counter) return;
        const targetVal = counter.getAttribute('data-target');
        const finalTarget = +targetVal;
        const isFloat = targetVal.includes('.');
        
        const duration = 1500;
        const frameRate = 30;
        const characters = '0123456789';
        
        let startTime = null;
        let originalText = isFloat ? finalTarget.toFixed(2) : finalTarget.toString();
        
        const addCommas = (str) => {
          let parts = str.split('.');
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          return parts.join('.');
        };
        
        const numLen = originalText.length;
        
        const animate = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = timestamp - startTime;
          const progressRatio = Math.min(progress / duration, 1);
          
          const numRevealed = Math.floor(progressRatio * numLen);
          
          let currentStr = '';
          for (let i = 0; i < numLen; i++) {
            if (originalText[i] === '.') {
              currentStr += '.';
              continue;
            }
            if (i < numRevealed) {
              currentStr += originalText[i];
            } else {
              currentStr += characters[Math.floor(Math.random() * characters.length)];
            }
          }
          
          counter.innerText = addCommas(currentStr);
          
          if (progress < duration) {
            setTimeout(() => requestAnimationFrame(animate), frameRate);
          } else {
            counter.innerText = addCommas(originalText);
          }
        };
        requestAnimationFrame(animate);
      });
    }
  }
})
</script>
