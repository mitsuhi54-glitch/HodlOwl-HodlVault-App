/**
 * THEME MODULE
 * Handles Light/Dark Mode toggling
 */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  
  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
}

/**
 * NAVIGATION MODULE
 * Handles Mobile Menu behavior
 */
function initMobileNav() {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      // Toggle logic would go here for mobile burger
      console.log('Mobile menu toggled');
    });
  }
}

/**
 * WALLET UI MODULE
 * Mock connection logic
 */
function initWalletUI() {
  const walletPill = document.querySelector('.wallet-pill');
  const dot = document.querySelector('.dot');
  const addr = document.querySelector('.wallet-addr');
  const portfolioDisconnected = document.querySelector('.portfolio-view-disconnected');
  const portfolioConnected = document.querySelector('.portfolio-view-connected');
  const connectTriggers = document.querySelectorAll('.connect-wallet-trigger');
  
  let connected = true;

  function updateViews() {
    const floatingWidget = document.getElementById('floating-wallet-status');
    const floatingIcon = floatingWidget?.querySelector('.status-icon');
    const floatingText = floatingWidget?.querySelector('.status-text');

    if (connected) {
      if (dot) dot.classList.add('connected');
      if (addr) addr.textContent = 'chipnet:qz4wqx8k...xqf8jrp';
      if (walletPill) {
        walletPill.style.background = 'rgba(0, 255, 136, 0.1)';
        walletPill.style.borderColor = 'rgba(0, 255, 136, 0.3)';
        const label = walletPill.querySelector('span:first-of-type');
        if (label) label.textContent = 'SECURE CONNECTION ACTIVE';
      }
      
      // Floating Widget
      if (floatingWidget) {
        floatingWidget.style.boxShadow = '0 0 20px var(--color-neon-dim)';
        floatingWidget.style.opacity = '1';
        if (floatingIcon) floatingIcon.textContent = 'sensors';
        if (floatingText) floatingText.textContent = 'SECURE CONNECTION ACTIVE';
      }

      // Portfolio Views
      if (portfolioDisconnected) portfolioDisconnected.style.display = 'none';
      if (portfolioConnected) portfolioConnected.style.display = 'block';
      
      // Active Vaults Views
      const vaultsDisconnected = document.querySelector('.active-vaults-view-disconnected');
      const vaultsConnected = document.querySelector('.active-vaults-view-connected');
      if (vaultsDisconnected) vaultsDisconnected.style.display = 'none';
      if (vaultsConnected) vaultsConnected.style.display = 'block';

    } else {
      if (dot) dot.classList.remove('connected');
      if (addr) addr.textContent = 'CONNECT WALLET';
      if (walletPill) {
        walletPill.style.background = 'rgba(255, 255, 255, 0.05)';
        walletPill.style.borderColor = 'var(--color-border)';
        const label = walletPill.querySelector('span:first-of-type');
        if (label) label.textContent = 'WALLET DISCONNECTED';
      }

      // Floating Widget
      if (floatingWidget) {
        floatingWidget.style.boxShadow = 'none';
        floatingWidget.style.opacity = '0.6';
        if (floatingIcon) floatingIcon.textContent = 'sensors_off';
        if (floatingText) floatingText.textContent = 'CONNECTION OFFLINE';
      }

      // Portfolio Views
      if (portfolioDisconnected) portfolioDisconnected.style.display = 'flex';
      if (portfolioConnected) portfolioConnected.style.display = 'none';

      // Active Vaults Views
      const vaultsDisconnected = document.querySelector('.active-vaults-view-disconnected');
      const vaultsConnected = document.querySelector('.active-vaults-view-connected');
      if (vaultsDisconnected) vaultsDisconnected.style.display = 'flex';
      if (vaultsConnected) vaultsConnected.style.display = 'none';
    }
  }

  if (walletPill) {
    walletPill.addEventListener('click', () => {
      connected = !connected;
      updateViews();
    });
  }

  connectTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      connected = true;
      updateViews();
    });
  });

  // Initial update
  updateViews();
}

/**
 * NOTIFICATIONS MODULE
 * Handles the notification setup modal
 */
function initNotifications() {
  const bellBtn = document.getElementById('notification-bell');
  const modal = document.getElementById('notification-modal');
  const closeBtn = document.getElementById('close-modal');
  const doneBtn = document.getElementById('done-modal');

  // Email verification toggle logic for vault.html
  const emailToggle = document.getElementById('email-notify-toggle');
  const emailUI = document.getElementById('email-verification-ui');

  if (emailToggle && emailUI) {
    emailToggle.addEventListener('change', (e) => {
      emailUI.style.display = e.target.checked ? 'flex' : 'none';
    });
  }

  // Email verification toggle logic for index.html
  const emailToggleHome = document.getElementById('email-notify-toggle-home');
  const emailUIHome = document.getElementById('email-verification-ui-home');

  if (emailToggleHome && emailUIHome) {
    emailToggleHome.addEventListener('change', (e) => {
      emailUIHome.style.display = e.target.checked ? 'flex' : 'none';
    });
  }

  if (bellBtn && modal) {
    bellBtn.addEventListener('click', () => {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    });

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (doneBtn) doneBtn.addEventListener('click', closeModal);

    // Close on click outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let slideIndex = 0;
  let slideTimeout;
  const slides = document.querySelectorAll('.slide');
  const slideshowContainer = document.querySelector('.slideshow-container');
  
  if (slides.length > 0) {
    function showSlides() {
      // Remove active from all
      slides.forEach(slide => {
        slide.classList.remove('active');
        // keep display block so opacity transition works
        slide.style.display = 'block'; 
      });
      
      slideIndex++;
      if (slideIndex > slides.length) {slideIndex = 1}
      
      slides[slideIndex-1].classList.add('active');
      
      clearTimeout(slideTimeout);
      slideTimeout = setTimeout(showSlides, 4000); // Change image every 4 seconds
    }
    
    // Initialize first slide immediately
    slides[0].classList.add('active');
    slideTimeout = setTimeout(showSlides, 4000);
    
    // Allow clicking to advance slides immediately
    if (slideshowContainer) {
      slideshowContainer.style.cursor = 'pointer';
      slideshowContainer.addEventListener('click', () => {
        clearTimeout(slideTimeout);
        showSlides();
      });
    }
  }
});

/**
 * MAIN ENTRY POINT
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('HODLVAULT System Initializing...');
  
  if (typeof initTheme === 'function') initTheme();
  if (typeof initMobileNav === 'function') initMobileNav();
  if (typeof initWalletUI === 'function') initWalletUI();
  if (typeof initNotifications === 'function') initNotifications();
  if (typeof initSlideshow === 'function') initSlideshow();
  if (typeof initPortfolioUI === 'function') initPortfolioUI();
  if (typeof initBalanceUnit === 'function') initBalanceUnit();
  if (typeof initActivityModal === 'function') initActivityModal();
  if (typeof initVaultManageModal === 'function') initVaultManageModal();
  
  // Chip selection logic
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const parent = e.target.parentElement;
      parent.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
});
