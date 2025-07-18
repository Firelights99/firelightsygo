// Advanced Functionality JavaScript - Banner carousel and interactive elements

// Banner Carousel Functionality
let currentBannerIndex = 0;
const bannerSlides = document.querySelectorAll('.banner-slide');
const totalBanners = bannerSlides.length;

// Auto-rotate banners every 5 seconds
let bannerInterval;

function initializeBannerCarousel() {
    if (totalBanners > 0) {
        startBannerAutoRotation();
        
        // Add touch/swipe support for mobile
        addBannerTouchSupport();
    }
}

function showBanner(index) {
    // Remove active class from all banners
    bannerSlides.forEach(slide => slide.classList.remove('active'));
    
    // Add active class to current banner
    if (bannerSlides[index]) {
        bannerSlides[index].classList.add('active');
    }
    
    currentBannerIndex = index;
}

function nextBanner() {
    const nextIndex = (currentBannerIndex + 1) % totalBanners;
    showBanner(nextIndex);
    resetBannerAutoRotation();
}

function previousBanner() {
    const prevIndex = (currentBannerIndex - 1 + totalBanners) % totalBanners;
    showBanner(prevIndex);
    resetBannerAutoRotation();
}

function startBannerAutoRotation() {
    bannerInterval = setInterval(() => {
        nextBanner();
    }, 5000);
}

function stopBannerAutoRotation() {
    if (bannerInterval) {
        clearInterval(bannerInterval);
    }
}

function resetBannerAutoRotation() {
    stopBannerAutoRotation();
    startBannerAutoRotation();
}

// Touch/Swipe support for mobile
function addBannerTouchSupport() {
    const bannerCarousel = document.querySelector('.banner-carousel');
    if (!bannerCarousel) return;
    
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    
    bannerCarousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    bannerCarousel.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // Only handle horizontal swipes
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                previousBanner();
            } else {
                nextBanner();
            }
        }
    }
}

// Search functionality
function performSearch() {
    const searchInput = document.getElementById('card-search');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        // Redirect to singles page with search parameter
        window.location.href = `pages/singles.html?search=${encodeURIComponent(searchTerm)}`;
    }
}

// Enhanced search with Enter key support
function initializeSearch() {
    const searchInput = document.getElementById('card-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Add search suggestions (placeholder for future implementation)
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            if (searchTerm.length > 2) {
                // Future: Show search suggestions dropdown
                console.log('Search suggestions for:', searchTerm);
            }
        });
    }
}

// Cart functionality
function openCart() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeCart() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

// Login functionality
function showLogin() {
    // Placeholder for login modal or redirect
    console.log('Login functionality would be implemented here');
    // For now, redirect to account page
    window.location.href = 'pages/account.html';
}

// Smooth scrolling for internal links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Intersection Observer for animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    document.querySelectorAll('.category-item, .feature-item, .location-card').forEach(el => {
        observer.observe(el);
    });
}

// Loading states for dynamic content
function showLoadingState(element) {
    if (element) {
        element.classList.add('loading');
        element.innerHTML = '<div class="loading-spinner">Loading...</div>';
    }
}

function hideLoadingState(element, content) {
    if (element) {
        element.classList.remove('loading');
        element.innerHTML = content;
    }
}

// Notification system
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Error handling for images
function initializeImageErrorHandling() {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            // Replace with placeholder image
            this.src = 'https://via.placeholder.com/300x200/1a1a2e/ffffff?text=Image+Not+Found';
            this.alt = 'Image not available';
        });
    });
}

// Lazy loading for images
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Analytics tracking (placeholder)
function trackEvent(category, action, label = '') {
    console.log('Analytics Event:', { category, action, label });
    // Future: Implement actual analytics tracking
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeBannerCarousel();
    initializeSearch();
    initializeSmoothScrolling();
    initializeScrollAnimations();
    initializeImageErrorHandling();
    initializeLazyLoading();
    
    // Track page load
    trackEvent('Page', 'Load', 'Homepage');
    
    console.log('🔥 Firelight Duel Academy - Advanced functionality loaded!');
});

// Handle page visibility changes (pause/resume banner rotation)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopBannerAutoRotation();
    } else {
        startBannerAutoRotation();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key closes modals
    if (e.key === 'Escape') {
        closeCart();
    }
    
    // Ctrl/Cmd + K for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('card-search');
        if (searchInput) {
            searchInput.focus();
        }
    }
});

// Export functions for global use
window.nextBanner = nextBanner;
window.previousBanner = previousBanner;
window.performSearch = performSearch;
window.openCart = openCart;
window.closeCart = closeCart;
window.showLogin = showLogin;
window.showNotification = showNotification;
window.trackEvent = trackEvent;
