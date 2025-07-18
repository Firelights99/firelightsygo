// Main JavaScript for Firelights YGO TCG Website
class FirelightSygoSite {
    constructor() {
        this.cart = [];
        this.isCartOpen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollAnimations();
        this.loadSiteData();
    }

    setupEventListeners() {
        // Cart functionality
        const cartIcon = document.querySelector('.cart-icon');
        const cartModal = document.getElementById('cart-modal');
        const closeBtn = document.querySelector('.close');
        const continueShoppingBtn = document.querySelector('.continue-shopping-btn');

        if (cartIcon) {
            cartIcon.addEventListener('click', () => this.toggleCart());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleCart());
        }

        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => this.toggleCart());
        }

        // Close cart when clicking outside
        if (cartModal) {
            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    this.toggleCart();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isCartOpen) {
                this.toggleCart();
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Membership selection
        const selectBtns = document.querySelectorAll('.select-btn');
        selectBtns.forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', (e) => this.handleMembershipSelection(e));
            }
        });

        // Checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }
    }

    toggleCart() {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            this.isCartOpen = !this.isCartOpen;
            cartModal.classList.toggle('active', this.isCartOpen);
            
            // Prevent body scroll when cart is open
            document.body.style.overflow = this.isCartOpen ? 'hidden' : '';
        }
    }

    handleMembershipSelection(e) {
        const membershipCard = e.target.closest('.membership-card');
        const membershipName = membershipCard.querySelector('h4').textContent;
        const membershipPrice = membershipCard.querySelector('.price').textContent;
        
        this.showNotification(`${membershipName} membership selected for ${membershipPrice}!`);
        
        // Add to cart logic would go here
        this.addToCart({
            type: 'membership',
            name: membershipName,
            price: membershipPrice
        });
    }

    addToCart(item) {
        this.cart.push(item);
        this.updateCartDisplay();
        this.showNotification(`${item.name} added to cart!`);
    }

    updateCartDisplay() {
        const cartModal = document.getElementById('cart-modal');
        const cartContent = cartModal.querySelector('.cart-content');
        
        if (this.cart.length === 0) {
            cartContent.querySelector('p').textContent = "You don't have any items in your cart.";
        } else {
            // Update cart content with items
            let cartHTML = '<h3>Shopping Cart</h3>';
            this.cart.forEach(item => {
                cartHTML += `<div class="cart-item">
                    <span>${item.name}</span>
                    <span>${item.price}</span>
                </div>`;
            });
            cartHTML += `
                <div class="cart-buttons">
                    <button class="checkout-btn">Checkout</button>
                    <button class="continue-shopping-btn">Continue Shopping</button>
                </div>
                <div class="payment-methods">
                    <p>Accepted here</p>
                    <div class="payment-icons">
                        <span class="payment-icon">💳</span>
                        <span class="payment-icon">🍎</span>
                        <span class="payment-icon">📱</span>
                        <span class="payment-icon">💰</span>
                    </div>
                </div>
            `;
            cartContent.innerHTML = cartHTML;
            
            // Re-attach event listeners
            this.setupEventListeners();
        }
    }

    handleCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!');
            return;
        }
        
        this.showNotification('Redirecting to secure checkout...');
        // In a real implementation, this would redirect to Square checkout
        setTimeout(() => {
            this.showNotification('Checkout functionality coming soon!');
        }, 1500);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            background: type === 'error' ? '#e74c3c' : '#3498db',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '5px',
            zIndex: '3000',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    setupScrollAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe sections for animation
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
    }

    async loadSiteData() {
        try {
            // In a real application, this would load from the config and data files
            // For now, we'll use the data that's already in the HTML
            console.log('Site data loaded successfully');
        } catch (error) {
            console.error('Error loading site data:', error);
        }
    }

    // Utility functions
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    formatPrice(amount, currency = 'CAD') {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Analytics tracking (placeholder)
    trackEvent(eventName, eventData = {}) {
        console.log(`Analytics Event: ${eventName}`, eventData);
        // In a real implementation, this would send data to analytics service
    }
}

// Initialize the site when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.firelightSygo = new FirelightSygoSite();
});

// Legacy function support for existing HTML
function toggleCart() {
    if (window.firelightSygo) {
        window.firelightSygo.toggleCart();
    }
}

function showNotification(message, type = 'info') {
    if (window.firelightSygo) {
        window.firelightSygo.showNotification(message, type);
    }
}

function validateEmail(email) {
    if (window.firelightSygo) {
        return window.firelightSygo.validateEmail(email);
    }
    return false;
}
