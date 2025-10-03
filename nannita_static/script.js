// ============================================
// NANNITA STATIC SITE - MAIN JAVASCRIPT
// ============================================

// Mobile Menu Toggle
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
  }
}

// Form Validation
function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;
  
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      showFieldError(field, 'Это поле обязательно');
    } else {
      clearFieldError(field);
      
      // Additional validation
      if (field.type === 'email' && !validateEmail(field.value)) {
        isValid = false;
        showFieldError(field, 'Введите корректный email');
      }
      
      if (field.type === 'tel' && !validatePhone(field.value)) {
        isValid = false;
        showFieldError(field, 'Введите корректный телефон');
      }
    }
  });
  
  return isValid;
}

function showFieldError(field, message) {
  const errorEl = field.parentElement.querySelector('.form-error');
  if (errorEl) {
    errorEl.textContent = message;
  } else {
    const error = document.createElement('div');
    error.className = 'form-error';
    error.textContent = message;
    field.parentElement.appendChild(error);
  }
  field.style.borderColor = 'var(--color-error)';
}

function clearFieldError(field) {
  const errorEl = field.parentElement.querySelector('.form-error');
  if (errorEl) {
    errorEl.remove();
  }
  field.style.borderColor = '';
}

// Toast Notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Phone Input Formatting
function formatPhoneInput(input) {
  input.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
      if (value[0] === '8') value = '7' + value.substring(1);
      if (value[0] !== '7') value = '7' + value;
    }
    
    let formatted = '';
    if (value.length > 0) {
      formatted += '+7';
      if (value.length > 1) formatted += ' (' + value.substring(1, 4);
      if (value.length >= 4) formatted += ') ' + value.substring(4, 7);
      if (value.length >= 7) formatted += '-' + value.substring(7, 9);
      if (value.length >= 9) formatted += '-' + value.substring(9, 11);
    }
    
    e.target.value = formatted;
  });
}

// Initialize phone formatting for all phone inputs
function initPhoneFormatting() {
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    formatPhoneInput(input);
  });
}

// Search Filter
function initSearchFilter() {
  const searchInput = document.getElementById('search-input');
  const cards = document.querySelectorAll('.nanny-card');
  
  if (searchInput && cards.length > 0) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      
      cards.forEach(card => {
        const name = card.querySelector('.nanny-card-title')?.textContent.toLowerCase() || '';
        const location = card.querySelector('.nanny-card-location')?.textContent.toLowerCase() || '';
        const service = card.querySelector('.nanny-card-service')?.textContent.toLowerCase() || '';
        
        if (name.includes(searchTerm) || location.includes(searchTerm) || service.includes(searchTerm)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
}

// Form Step Navigation
function initFormSteps() {
  let currentStep = 1;
  const totalSteps = document.querySelectorAll('[data-step]').length;
  
  function showStep(step) {
    document.querySelectorAll('[data-step]').forEach(el => {
      el.style.display = 'none';
    });
    
    const stepEl = document.querySelector(`[data-step="${step}"]`);
    if (stepEl) {
      stepEl.style.display = 'block';
    }
    
    currentStep = step;
    updateProgress();
  }
  
  function updateProgress() {
    const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.style.width = progress + '%';
    }
  }
  
  // Next button handlers
  document.querySelectorAll('[data-next-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep < totalSteps) {
        showStep(currentStep + 1);
      }
    });
  });
  
  // Previous button handlers
  document.querySelectorAll('[data-prev-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    });
  });
  
  // Initialize first step
  if (totalSteps > 0) {
    showStep(1);
  }
}

// Add Child Form
function initAddChild() {
  const addBtn = document.getElementById('add-child-btn');
  const childrenList = document.getElementById('children-list');
  let childCount = 0;
  
  if (addBtn && childrenList) {
    addBtn.addEventListener('click', () => {
      childCount++;
      const childItem = document.createElement('div');
      childItem.className = 'card mb-2';
      childItem.innerHTML = `
        <div class="card-body">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-semibold">Ребёнок ${childCount}</h4>
            <button type="button" class="text-error remove-child-btn">×</button>
          </div>
          <div class="grid grid-cols-1 gap-2">
            <div class="form-group">
              <label class="form-label">Пол</label>
              <select class="form-select" required>
                <option value="">Выберите</option>
                <option value="M">Мальчик</option>
                <option value="F">Девочка</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Возраст (лет)</label>
              <input type="number" class="form-input" min="0" max="17" required>
            </div>
          </div>
        </div>
      `;
      
      childrenList.appendChild(childItem);
      
      // Remove child handler
      childItem.querySelector('.remove-child-btn').addEventListener('click', () => {
        childrenList.removeChild(childItem);
      });
    });
  }
}

// SMS Code Timer
function initSMSTimer() {
  const timerEl = document.getElementById('sms-timer');
  const resendBtn = document.getElementById('resend-btn');
  
  if (timerEl && resendBtn) {
    let timeLeft = 60;
    resendBtn.disabled = true;
    
    const timer = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `Повторить через ${timeLeft}с`;
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        timerEl.textContent = '';
        resendBtn.disabled = false;
      }
    }, 1000);
  }
}

// Favorite Toggle
function initFavorites() {
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      btn.classList.toggle('active');
      
      if (btn.classList.contains('active')) {
        showToast('Добавлено в избранное', 'success');
      } else {
        showToast('Удалено из избранного', 'success');
      }
    });
  });
}

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  const pwaPrompt = document.querySelector('.pwa-prompt');
  if (pwaPrompt) {
    pwaPrompt.classList.add('active');
  }
});

function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installed');
      }
      deferredPrompt = null;
      
      const pwaPrompt = document.querySelector('.pwa-prompt');
      if (pwaPrompt) {
        pwaPrompt.classList.remove('active');
      }
    });
  }
}

function dismissPWAPrompt() {
  const pwaPrompt = document.querySelector('.pwa-prompt');
  if (pwaPrompt) {
    pwaPrompt.classList.remove('active');
  }
}

// Initialize all features when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initPhoneFormatting();
  initSearchFilter();
  initFormSteps();
  initAddChild();
  initSMSTimer();
  initFavorites();
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed'));
  });
}
