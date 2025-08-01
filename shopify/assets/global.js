/**
 * Firelight Duel Academy - Global JavaScript for Shopify Theme
 * Yu-Gi-Oh! TCG Store functionality
 */

// Global store configuration
window.yugiohStore = {
  apiEndpoint: 'https://db.ygoprodeck.com/api/v7/',
  currency: 'CAD',
  initialized: false,
  settings: {
    enableYugiohApi: true,
    enableTcgplayerApi: false,
    showCardDetails: true,
    enableWishlist: true,
    enableCardSearch: true,
    pricingStrategy: 'dynamic',
    baseCardPrice: 1.99
  }
};

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeTheme();
});

/**
 * Initialize the theme
 */
function initializeTheme() {
  console.log('Initializing Firelight Duel Academy theme...');
  
  // Initialize core functionality
  initializeNavigation();
  initializeCart();
  initializeForms();
  initializeAccessibility();
  
  // Initialize Yu-Gi-Oh! specific features
  if (window.yugiohStore.settings.enableYugiohApi) {
    initializeYugiohFeatures();
  }
  
  // Initialize wishlist if enabled
  if (window.yugiohStore.settings.enableWishlist) {
    initializeWishlist();
  }
  
  // Initialize search if enabled
  if (window.yugiohStore.settings.enableCardSearch) {
    initializeSearch();
  }
  
  window.yugiohStore.initialized = true;
  console.log('Theme initialized successfully');
}

/**
 * Initialize navigation functionality
 */
function initializeNavigation() {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('[data-mobile-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', function() {
      const isOpen = mobileMenu.classList.contains('is-open');
      
      if (isOpen) {
        mobileMenu.classList.remove('is-open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      } else {
        mobileMenu.classList.add('is-open');
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
      }
    });
  }
  
  // Dropdown menus
  const dropdownToggles = document.querySelectorAll('[data-dropdown-toggle]');
  
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const dropdown = this.nextElementSibling;
      
      if (dropdown) {
        const isOpen = dropdown.classList.contains('is-open');
        
        // Close all other dropdowns
        document.querySelectorAll('[data-dropdown].is-open').forEach(openDropdown => {
          if (openDropdown !== dropdown) {
            openDropdown.classList.remove('is-open');
          }
        });
        
        // Toggle current dropdown
        if (isOpen) {
          dropdown.classList.remove('is-open');
          this.setAttribute('aria-expanded', 'false');
        } else {
          dropdown.classList.add('is-open');
          this.setAttribute('aria-expanded', 'true');
        }
      }
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('[data-dropdown-toggle]') && !e.target.closest('[data-dropdown]')) {
      document.querySelectorAll('[data-dropdown].is-open').forEach(dropdown => {
        dropdown.classList.remove('is-open');
      });
      
      document.querySelectorAll('[data-dropdown-toggle]').forEach(toggle => {
        toggle.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

/**
 * Initialize cart functionality
 */
function initializeCart() {
  // Cart drawer toggle
  const cartToggle = document.querySelector('[data-cart-toggle]');
  const cartDrawer = document.querySelector('[data-cart-drawer]');
  const cartClose = document.querySelector('[data-cart-close]');
  
  if (cartToggle && cartDrawer) {
    cartToggle.addEventListener('click', function(e) {
      e.preventDefault();
      openCartDrawer();
    });
  }
  
  if (cartClose && cartDrawer) {
    cartClose.addEventListener('click', function() {
      closeCartDrawer();
    });
  }
  
  // Close cart drawer when clicking overlay
  if (cartDrawer) {
    cartDrawer.addEventListener('click', function(e) {
      if (e.target === cartDrawer) {
        closeCartDrawer();
      }
    });
  }
  
  // Quantity selectors
  document.addEventListener('click', function(e) {
    if (e.target.matches('[data-quantity-minus]')) {
      const input = e.target.nextElementSibling;
      const currentValue = parseInt(input.value);
      if (currentValue > 1) {
        input.value = currentValue - 1;
        updateCartQuantity(input);
      }
    }
    
    if (e.target.matches('[data-quantity-plus]')) {
      const input = e.target.previousElementSibling;
      const currentValue = parseInt(input.value);
      input.value = currentValue + 1;
      updateCartQuantity(input);
    }
  });
  
  // Add to cart buttons
  document.addEventListener('click', function(e) {
    if (e.target.matches('[data-add-to-cart]') || e.target.closest('[data-add-to-cart]')) {
      e.preventDefault();
      const button = e.target.matches('[data-add-to-cart]') ? e.target : e.target.closest('[data-add-to-cart]');
      addToCart(button);
    }
  });
}

/**
 * Open cart drawer
 */
function openCartDrawer() {
  const cartDrawer = document.querySelector('[data-cart-drawer]');
  if (cartDrawer) {
    cartDrawer.classList.add('is-open');
    document.body.classList.add('cart-drawer-open');
    
    // Focus on close button for accessibility
    const closeButton = cartDrawer.querySelector('[data-cart-close]');
    if (closeButton) {
      closeButton.focus();
    }
  }
}

/**
 * Close cart drawer
 */
function closeCartDrawer() {
  const cartDrawer = document.querySelector('[data-cart-drawer]');
  if (cartDrawer) {
    cartDrawer.classList.remove('is-open');
    document.body.classList.remove('cart-drawer-open');
  }
}

/**
 * Add product to cart
 */
async function addToCart(button) {
  const form = button.closest('form');
  const formData = new FormData(form);
  
  // Show loading state
  const originalText = button.textContent;
  button.textContent = 'Adding...';
  button.disabled = true;
  
  try {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const item = await response.json();
      
      // Update cart count
      updateCartCount();
      
      // Show success state
      button.textContent = 'Added!';
      
      // Open cart drawer if it exists
      if (document.querySelector('[data-cart-drawer]')) {
        setTimeout(() => {
          openCartDrawer();
        }, 500);
      }
      
      // Reset button after delay
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 2000);
      
    } else {
      throw new Error('Failed to add to cart');
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    
    // Show error state
    button.textContent = 'Error';
    
    // Reset button after delay
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  }
}

/**
 * Update cart quantity
 */
async function updateCartQuantity(input) {
  const key = input.dataset.key;
  const quantity = parseInt(input.value);
  
  try {
    const response = await fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: key,
        quantity: quantity
      })
    });
    
    if (response.ok) {
      const cart = await response.json();
      updateCartDisplay(cart);
    }
  } catch (error) {
    console.error('Update cart error:', error);
  }
}

/**
 * Update cart count display
 */
async function updateCartCount() {
  try {
    const response = await fetch('/cart.js');
    const cart = await response.json();
    
    const cartCountElements = document.querySelectorAll('[data-cart-count]');
    cartCountElements.forEach(element => {
      element.textContent = cart.item_count;
    });
  } catch (error) {
    console.error('Update cart count error:', error);
  }
}

/**
 * Update cart display
 */
function updateCartDisplay(cart) {
  // Update cart count
  const cartCountElements = document.querySelectorAll('[data-cart-count]');
  cartCountElements.forEach(element => {
    element.textContent = cart.item_count;
  });
  
  // Update cart total
  const cartTotalElements = document.querySelectorAll('[data-cart-total]');
  cartTotalElements.forEach(element => {
    element.textContent = formatMoney(cart.total_price);
  });
}

/**
 * Initialize form functionality
 */
function initializeForms() {
  // Form validation
  const forms = document.querySelectorAll('form[data-validate]');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!validateForm(form)) {
        e.preventDefault();
      }
    });
  });
  
  // Input focus effects
  const inputs = document.querySelectorAll('.field__input');
  
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.closest('.field').classList.add('field--focused');
    });
    
    input.addEventListener('blur', function() {
      this.closest('.field').classList.remove('field--focused');
      
      if (this.value) {
        this.closest('.field').classList.add('field--filled');
      } else {
        this.closest('.field').classList.remove('field--filled');
      }
    });
    
    // Check if input is pre-filled
    if (input.value) {
      input.closest('.field').classList.add('field--filled');
    }
  });
}

/**
 * Validate form
 */
function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('[required]');
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.classList.add('field--error');
      isValid = false;
    } else {
      field.classList.remove('field--error');
    }
  });
  
  return isValid;
}

/**
 * Initialize accessibility features
 */
function initializeAccessibility() {
  // Skip to content link
  const skipLink = document.querySelector('.skip-to-content-link');
  if (skipLink) {
    skipLink.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.focus();
        target.scrollIntoView();
      }
    });
  }
  
  // Keyboard navigation for dropdowns
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      // Close all open dropdowns and modals
      document.querySelectorAll('[data-dropdown].is-open').forEach(dropdown => {
        dropdown.classList.remove('is-open');
      });
      
      closeCartDrawer();
    }
  });
}

/**
 * Initialize Yu-Gi-Oh! specific features
 */
function initializeYugiohFeatures() {
  // Load card badges for products
  loadCardBadges();
  
  // Initialize card search functionality
  initializeCardSearch();
  
  // Initialize deck builder if present
  if (document.querySelector('[data-deck-builder]')) {
    initializeDeckBuilder();
  }
}

/**
 * Load Yu-Gi-Oh! card badges
 */
async function loadCardBadges() {
  const badgeContainers = document.querySelectorAll('.yugioh-card-badges[data-product-id]');
  
  for (const container of badgeContainers) {
    const productId = container.dataset.productId;
    const productTitle = container.closest('.card-wrapper, .product-card')?.querySelector('.card__heading a, .product-card-title')?.textContent?.trim();
    
    if (productTitle) {
      try {
        const cardData = await fetchCardData(productTitle);
        if (cardData) {
          displayCardBadges(container, cardData);
        }
      } catch (error) {
        console.warn('Failed to load card badges for:', productTitle, error);
      }
    }
  }
}

/**
 * Fetch card data from Yu-Gi-Oh! API
 */
async function fetchCardData(cardName) {
  try {
    const response = await fetch(`${window.yugiohStore.apiEndpoint}cardinfo.php?name=${encodeURIComponent(cardName)}`);
    const data = await response.json();
    
    if (data.data && data.data[0]) {
      return data.data[0];
    }
  } catch (error) {
    console.error('Error fetching card data:', error);
  }
  
  return null;
}

/**
 * Display card badges
 */
function displayCardBadges(container, cardData) {
  let badgesHTML = '';
  
  if (cardData.type) {
    badgesHTML += `<span class="card-badge type-badge">${cardData.type}</span>`;
  }
  
  if (cardData.race) {
    badgesHTML += `<span class="card-badge race-badge">${cardData.race}</span>`;
  }
  
  if (cardData.attribute) {
    badgesHTML += `<span class="card-badge attribute-badge">${cardData.attribute}</span>`;
  }
  
  container.innerHTML = badgesHTML;
}

/**
 * Initialize card search
 */
function initializeCardSearch() {
  const searchInputs = document.querySelectorAll('[data-card-search]');
  
  searchInputs.forEach(input => {
    let searchTimeout;
    
    input.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      
      searchTimeout = setTimeout(() => {
        performCardSearch(this.value);
      }, 300);
    });
  });
}

/**
 * Perform card search
 */
async function performCardSearch(query) {
  if (!query || query.length < 2) return;
  
  try {
    const response = await fetch(`${window.yugiohStore.apiEndpoint}cardinfo.php?fname=${encodeURIComponent(query)}&num=10`);
    const data = await response.json();
    
    if (data.data) {
      displaySearchResults(data.data);
    }
  } catch (error) {
    console.error('Search error:', error);
  }
}

/**
 * Display search results
 */
function displaySearchResults(results) {
  const resultsContainer = document.querySelector('[data-search-results]');
  if (!resultsContainer) return;
  
  let resultsHTML = '';
  
  results.forEach(card => {
    const price = generateCardPrice(card.type, card.race);
    
    resultsHTML += `
      <div class="search-result">
        <img src="${card.card_images[0].image_url_small}" alt="${card.name}" loading="lazy">
        <div class="search-result-info">
          <h4>${card.name}</h4>
          <p>${card.type}${card.race ? ' - ' + card.race : ''}</p>
          <span class="price">$${price} CAD</span>
        </div>
      </div>
    `;
  });
  
  resultsContainer.innerHTML = resultsHTML;
}

/**
 * Initialize wishlist functionality
 */
function initializeWishlist() {
  document.addEventListener('click', function(e) {
    if (e.target.matches('[data-wishlist-toggle]') || e.target.closest('[data-wishlist-toggle]')) {
      e.preventDefault();
      const button = e.target.matches('[data-wishlist-toggle]') ? e.target : e.target.closest('[data-wishlist-toggle]');
      toggleWishlist(button);
    }
  });
}

/**
 * Toggle wishlist item
 */
function toggleWishlist(button) {
  const productId = button.dataset.productId;
  const isInWishlist = button.classList.contains('in-wishlist');
  
  if (isInWishlist) {
    removeFromWishlist(productId);
    button.classList.remove('in-wishlist');
    button.innerHTML = '♡';
  } else {
    addToWishlist(productId);
    button.classList.add('in-wishlist');
    button.innerHTML = '♥';
  }
}

/**
 * Add to wishlist
 */
function addToWishlist(productId) {
  let wishlist = getWishlist();
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    localStorage.setItem('yugioh_wishlist', JSON.stringify(wishlist));
  }
}

/**
 * Remove from wishlist
 */
function removeFromWishlist(productId) {
  let wishlist = getWishlist();
  wishlist = wishlist.filter(id => id !== productId);
  localStorage.setItem('yugioh_wishlist', JSON.stringify(wishlist));
}

/**
 * Get wishlist from localStorage
 */
function getWishlist() {
  const wishlist = localStorage.getItem('yugioh_wishlist');
  return wishlist ? JSON.parse(wishlist) : [];
}

/**
 * Initialize deck builder
 */
function initializeDeckBuilder() {
  console.log('Initializing deck builder...');
  // Deck builder functionality would go here
}

/**
 * Generate card price based on type and race
 */
function generateCardPrice(type, race) {
  let basePrice = window.yugiohStore.settings.baseCardPrice;
  
  if (type.includes('XYZ') || type.includes('Synchro') || type.includes('Fusion')) {
    basePrice = 4.99;
  } else if (type.includes('Link')) {
    basePrice = 6.99;
  } else if (race && race.includes('Dragon')) {
    basePrice = 3.99;
  }
  
  // Add some randomization
  const variation = (Math.random() * 2 - 1) * 0.5; // ±$0.50
  return Math.max(0.99, (basePrice + variation)).toFixed(2);
}

/**
 * Format money
 */
function formatMoney(cents) {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: window.yugiohStore.currency
  }).format(dollars);
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Export functions for use in other scripts
window.FirelightTheme = {
  addToCart,
  updateCartCount,
  openCartDrawer,
  closeCartDrawer,
  fetchCardData,
  generateCardPrice,
  formatMoney,
  addToWishlist,
  removeFromWishlist,
  getWishlist
};
