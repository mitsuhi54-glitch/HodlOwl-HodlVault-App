/**
 * ACTIVITY MODAL MODULE
 * Handles the advanced activity history modal with filters
 */
function initActivityModal() {
  const openBtns = document.querySelectorAll('.open-activity-btn');
  const modal = document.getElementById('activity-modal');
  const closeBtn = document.getElementById('close-activity-modal');
  const filterTime = document.getElementById('filter-time');
  const filterType = document.getElementById('filter-type');

  if (modal) {
    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Dummy filter logic
    if (filterTime) {
      filterTime.addEventListener('change', () => {
        console.log('Filtering by time:', filterTime.value);
      });
    }
    if (filterType) {
      filterType.addEventListener('change', () => {
        console.log('Filtering by type:', filterType.value);
      });
    }
  }
}

/**
 * BALANCE UNIT MODULE
 * Handles global unit selection (sats, mBCH, BCH) and formatting
 */
function initBalanceUnit() {
  const syncSelects = document.querySelectorAll('.balance-unit-sync');
  const storedUnit = localStorage.getItem('balanceUnit') || 'sats';

  function updateDisplay() {
    const unit = localStorage.getItem('balanceUnit') || 'sats';
    
    // Sync all dropdowns
    syncSelects.forEach(select => {
      select.value = unit;
    });

    // Update all elements with .val-sync-balance
    document.querySelectorAll('.val-sync-balance').forEach(el => {
      const sats = parseInt(el.dataset.sats);
      if (isNaN(sats)) return;
      
      el.textContent = formatBalance(sats, unit);
    });

    // Update any standalone unit labels
    document.querySelectorAll('.val-sync-unit').forEach(el => {
      el.textContent = unit;
    });

    // Update inputs to match unit scale
    document.querySelectorAll('.val-sync-input').forEach(input => {
      if (unit === 'sats') {
        input.step = '1';
        input.placeholder = '500,000,000'.replace(/,/g, '');
      } else if (unit === 'mBCH') {
        input.step = '0.00001';
        input.placeholder = '5000.00000';
      } else {
        input.step = '0.00000001';
        input.placeholder = '5.00000000';
      }
    });
  }

  function formatBalance(satoshis, unit) {
    if (unit === 'sats') {
      return satoshis.toLocaleString();
    } else if (unit === 'mBCH') {
      return (satoshis / 100000).toFixed(5);
    } else {
      return (satoshis / 100000000).toFixed(8);
    }
  }

  syncSelects.forEach(select => {
    select.addEventListener('change', (e) => {
      localStorage.setItem('balanceUnit', e.target.value);
      updateDisplay();
    });
  });

  // Initial call
  updateDisplay();
}

/**
 * PORTFOLIO UI MODULE
 * Handles the Activity History modal
 */
function initPortfolioUI() {
  const activityBtn = document.querySelector('.portfolio-summary__activity-btn');
  const modal = document.getElementById('activity-modal');
  const closeBtn = document.getElementById('close-activity-modal');
  const doneBtn = document.getElementById('close-activity-done');

  if (activityBtn && modal) {
    activityBtn.addEventListener('click', () => {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
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

/**
 * VAULT MANAGE MODAL MODULE
 * Handles the vault management modal
 */
function initVaultManageModal() {
  const modal = document.getElementById('vault-manage-modal');
  const closeBtn = document.getElementById('close-vault-manage-modal');
  const vaultCards = document.querySelectorAll('.vault-card');

  if (modal) {
    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };

    vaultCards.forEach(card => {
      // Remove any existing click redirection and add modal trigger
      card.removeAttribute('onclick'); 
      
      card.addEventListener('click', (e) => {
        // Don't open if clicked on toggle or its container
        if (e.target.closest('.toggle-switch')) return;

        // Populate modal with card data
        const name = card.querySelector('.vault-card__name').textContent.trim().replace('Auto', '');
        const balance = card.querySelector('.val-sync-balance').textContent;
        const target = card.querySelectorAll('.vault-card__metric-value')[1].textContent;
        const isReady = card.querySelectorAll('.status-chip--ready').length > 0;

        document.getElementById('manage-vault-name').innerHTML = name.includes('Vault') ? name : name + ' <span class="text-neon">ONE</span>';
        document.getElementById('manage-locked-balance').textContent = balance;
        document.getElementById('manage-target-price').textContent = target;
        
        const statusBadge = document.getElementById('manage-vault-status-badge');
        const withdrawBtn = document.getElementById('withdraw-btn');

        if (isReady) {
          statusBadge.textContent = 'STATUS: READY TO WITHDRAW';
          statusBadge.style.color = 'var(--color-neon)';
          statusBadge.style.background = 'var(--color-neon-dim)';
          withdrawBtn.disabled = false;
          withdrawBtn.textContent = 'Withdraw Funds (Unlocked)';
        } else {
          statusBadge.textContent = 'STATUS: HODLING';
          statusBadge.style.color = '#ffb300';
          statusBadge.style.background = 'rgba(255, 179, 0, 0.1)';
          withdrawBtn.disabled = true;
          withdrawBtn.textContent = 'Withdraw Funds (Locked)';
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    
    // QR Code Modal Logic
    const qrBtn = document.getElementById('qr-deposit-btn');
    const qrModal = document.getElementById('qr-modal');
    const closeQrBtn = document.getElementById('close-qr-modal');
    
    if (qrBtn && qrModal) {
      qrBtn.addEventListener('click', () => {
        qrModal.style.display = 'flex'; // show the modal
      });
      
      closeQrBtn.addEventListener('click', () => {
        qrModal.style.display = 'none';
      });
      
      qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) {
          qrModal.style.display = 'none';
        }
      });
    }
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const vaultsList = document.getElementById('vaults-list');
  const emptyState = document.querySelector('.empty-vaults-state');
  
  function updateVaultsListState() {
    if (!vaultsList) return;
    const vaultCards = vaultsList.querySelectorAll('.vault-card');
    
    if (vaultCards.length === 0) {
      if (emptyState) emptyState.style.display = 'flex';
      vaultsList.style.maxHeight = 'none'; // Don't limit height if empty
    } else {
      if (emptyState) emptyState.style.display = 'none';
      vaultsList.style.maxHeight = '500px'; 
    }
  }

  // Initial check
  updateVaultsListState();

  // Handle auto-withdraw toggle UI
  if (vaultsList) {
    vaultsList.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const span = e.target.closest('div').querySelector('.badge--auto');
        if (span) {
          if (e.target.checked) {
            span.style.opacity = '1';
            span.title = 'Auto-withdrawal enabled';
          } else {
            span.style.opacity = '0.5';
            span.title = 'Auto-withdrawal disabled';
          }
        }
      }
    });
  }

  // Expose it globally so other scripts (like creation) can trigger it
  window.updateVaultsListState = updateVaultsListState;
});

