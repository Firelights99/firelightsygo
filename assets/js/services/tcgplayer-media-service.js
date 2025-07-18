// TCGPlayer Media Library Integration Service
class TCGPlayerMediaService {
    constructor() {
        this.baseUrl = 'https://8946057.fs1.hubspotusercontent-na1.net/hubfs/8946057/tcgplayer-website-2024/hubdb/';
        this.mediaCache = new Map();
        this.yugiohAssets = this.initializeYugiohAssets();
        this.genericTCGAssets = this.initializeGenericAssets();
    }

    // Initialize Yu-Gi-Oh! specific assets from TCGPlayer media library
    initializeYugiohAssets() {
        return {
            // Professional banners for Yu-Gi-Oh! sets (these would be actual TCGPlayer assets)
            banners: {
                'POTE': {
                    name: 'Power of the Elements',
                    banner: `${this.baseUrl}2024%20Pro%20Banner%20Uploads/YGO/Yu-Gi-Oh%20-%20Power%20of%20the%20Elements/yugioh_power-of-the-elements_banner.jpg`,
                    thumbnail: `${this.baseUrl}2024%20Pro%20Banner%20Uploads/YGO/Yu-Gi-Oh%20-%20Power%20of%20the%20Elements/yugioh_power-of-the-elements_thumb.jpg`
                },
                'MAMA': {
                    name: 'Magnificent Mavens',
                    banner: `${this.baseUrl}2024%20Pro%20Banner%20Uploads/YGO/Yu-Gi-Oh%20-%20Magnificent%20Mavens/yugioh_magnificent-mavens_banner.jpg`,
                    thumbnail: `${this.baseUrl}2024%20Pro%20Banner%20Uploads/YGO/Yu-Gi-Oh%20-%20Magnificent%20Mavens/yugioh_magnificent-mavens_thumb.jpg`
                },
                'DABL': {
                    name: 'Darkwing Blast',
                    banner: `${this.baseUrl}2024%20Pro%20Banner%20Uploads/YGO/Yu-Gi-Oh%20-%20Darkwing%20Blast/yugioh_darkwing-blast_banner.jpg`,
                    thumbnail: `${this.baseUrl}2024%20Pro%20Banner%20Uploads/YGO/Yu-Gi-Oh%20-%20Darkwing%20Blast/yugioh_darkwing-blast_thumb.jpg`
                },
                'PHHY': {
                    name: 'Photon Hypernova',
                    banner: `${this.baseUrl}2024%20Pro%20Banner%20Uploads/YGO/Yu-Gi-Oh%20-%20Photon%20Hypernova/yugioh_photon-hypernova_banner.jpg`,
                    thumbnail: `${this.baseUrl}2024%20Pro%20Banner%20Uploads/YGO/Yu-Gi-Oh%20-%20Photon%20Hypernova/yugioh_photon-hypernova_thumb.jpg`
                },
                'CYAC': {
                    name: 'Cyberstorm Access',
                    banner: `${this.baseUrl}2024%20Pro%20Banner%20Uploads/YGO/Yu-Gi-Oh%20-%20Cyberstorm%20Access/yugioh_cyberstorm-access_banner.jpg`,
                    thumbnail: `${this.baseUrl}2024%20Pro%20Banner%20Uploads/YGO/Yu-Gi-Oh%20-%20Cyberstorm%20Access/yugioh_cyberstorm-access_thumb.jpg`
                }
            },
            
            // Professional promotional assets
            promotional: {
                'new_arrivals': {
                    name: 'New Arrivals',
                    banner: `${this.baseUrl}promotional/yugioh_new-arrivals_banner.jpg`,
                    description: 'Latest Yu-Gi-Oh! releases and restocks'
                },
                'meta_cards': {
                    name: 'Meta Cards',
                    banner: `${this.baseUrl}promotional/yugioh_meta-cards_banner.jpg`,
                    description: 'Competitive tournament staples'
                },
                'sale_event': {
                    name: 'Sale Event',
                    banner: `${this.baseUrl}promotional/yugioh_sale-event_banner.jpg`,
                    description: 'Special pricing on popular cards'
                },
                'tournament_ready': {
                    name: 'Tournament Ready',
                    banner: `${this.baseUrl}promotional/yugioh_tournament-ready_banner.jpg`,
                    description: 'Complete deck cores and staples'
                }
            },

            // Category banners
            categories: {
                'singles': {
                    name: 'Singles',
                    banner: `${this.baseUrl}categories/yugioh_singles_banner.jpg`,
                    icon: `${this.baseUrl}categories/yugioh_singles_icon.png`
                },
                'sealed': {
                    name: 'Sealed Products',
                    banner: `${this.baseUrl}categories/yugioh_sealed_banner.jpg`,
                    icon: `${this.baseUrl}categories/yugioh_sealed_icon.png`
                },
                'accessories': {
                    name: 'Accessories',
                    banner: `${this.baseUrl}categories/yugioh_accessories_banner.jpg`,
                    icon: `${this.baseUrl}categories/yugioh_accessories_icon.png`
                }
            }
        };
    }

    // Initialize Yu-Gi-Oh! specific assets only
    initializeGenericAssets() {
        return {
            // Use Yu-Gi-Oh! specific professional assets
            professional: {
                'card_game_banner': 'https://images.ygoprodeck.com/images/cards/89631139.jpg', // Blue-Eyes White Dragon
                'trading_cards': 'https://images.ygoprodeck.com/images/cards/46986414.jpg' // Dark Magician
            },
            
            // Fallback to Yu-Gi-Oh! specific assets only
            fallback: {
                'store_banner': 'https://images.ygoprodeck.com/images/cards/89631139.jpg', // Blue-Eyes White Dragon
                'card_collection': 'https://images.ygoprodeck.com/images/cards/46986414.jpg', // Dark Magician
                'tournament': 'https://images.ygoprodeck.com/images/cards/26077387.jpg' // Sky Striker Ace - Raye
            }
        };
    }

    // Get banner for specific Yu-Gi-Oh! set
    getSetBanner(setCode, size = 'banner') {
        const asset = this.yugiohAssets.banners[setCode];
        if (asset) {
            return size === 'thumbnail' ? asset.thumbnail : asset.banner;
        }
        
        // Fallback to generic banner with error handling
        return this.createFallbackBanner(setCode, size);
    }

    // Get promotional banner
    getPromotionalBanner(type) {
        const asset = this.yugiohAssets.promotional[type];
        if (asset) {
            return {
                url: asset.banner,
                name: asset.name,
                description: asset.description
            };
        }
        
        return this.createFallbackPromotional(type);
    }

    // Get category assets
    getCategoryAssets(category) {
        const asset = this.yugiohAssets.categories[category];
        if (asset) {
            return {
                banner: asset.banner,
                icon: asset.icon,
                name: asset.name
            };
        }
        
        return this.createFallbackCategory(category);
    }

    // Create professional banner element
    createBannerElement(bannerData, options = {}) {
        const {
            className = 'tcgplayer-banner',
            clickable = false,
            overlay = false,
            overlayText = ''
        } = options;

        const bannerElement = document.createElement('div');
        bannerElement.className = `${className} professional-banner`;
        
        const img = document.createElement('img');
        img.src = bannerData.url || bannerData;
        img.alt = bannerData.name || 'Yu-Gi-Oh! Banner';
        img.className = 'banner-image';
        img.loading = 'lazy';
        
        // Add error handling
        img.onerror = () => {
            img.src = this.genericTCGAssets.fallback.store_banner;
        };

        bannerElement.appendChild(img);

        // Add overlay if requested
        if (overlay && overlayText) {
            const overlayDiv = document.createElement('div');
            overlayDiv.className = 'banner-overlay';
            overlayDiv.innerHTML = `<h3>${overlayText}</h3>`;
            bannerElement.appendChild(overlayDiv);
        }

        // Make clickable if requested
        if (clickable) {
            bannerElement.style.cursor = 'pointer';
            bannerElement.addEventListener('click', () => {
                if (bannerData.onClick) {
                    bannerData.onClick();
                }
            });
        }

        return bannerElement;
    }

    // Create hero section with TCGPlayer assets
    createHeroSection(heroData) {
        const heroSection = document.createElement('section');
        heroSection.className = 'tcgplayer-hero-section';
        
        const banner = this.createBannerElement(heroData.banner, {
            className: 'hero-banner',
            overlay: true,
            overlayText: heroData.title
        });
        
        const content = document.createElement('div');
        content.className = 'hero-content';
        content.innerHTML = `
            <h1>${heroData.title}</h1>
            <p>${heroData.description}</p>
            <div class="hero-actions">
                ${heroData.actions.map(action => 
                    `<button class="cta-button ${action.type}" onclick="${action.onClick}">${action.text}</button>`
                ).join('')}
            </div>
        `;
        
        heroSection.appendChild(banner);
        heroSection.appendChild(content);
        
        return heroSection;
    }

    // Create product showcase with professional assets
    createProductShowcase(products) {
        const showcase = document.createElement('div');
        showcase.className = 'tcgplayer-product-showcase';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card professional';
            
            const banner = this.getSetBanner(product.setCode, 'thumbnail');
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${banner}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-type">${product.type}</p>
                    <div class="product-price">$${product.price}</div>
                    <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">Add to Cart</button>
                </div>
            `;
            
            showcase.appendChild(productCard);
        });
        
        return showcase;
    }

    // Create fallback banner with professional styling
    createFallbackBanner(identifier, size) {
        const fallbackUrl = size === 'thumbnail' 
            ? this.genericTCGAssets.fallback.card_collection
            : this.genericTCGAssets.fallback.store_banner;
            
        return fallbackUrl;
    }

    // Create fallback promotional asset
    createFallbackPromotional(type) {
        return {
            url: this.genericTCGAssets.fallback.store_banner,
            name: type.replace('_', ' ').toUpperCase(),
            description: `Professional ${type.replace('_', ' ')} promotion`
        };
    }

    // Create fallback category asset
    createFallbackCategory(category) {
        return {
            banner: this.genericTCGAssets.fallback.store_banner,
            icon: this.genericTCGAssets.fallback.card_collection,
            name: category.charAt(0).toUpperCase() + category.slice(1)
        };
    }

    // Add professional styling to existing elements
    enhanceWithTCGPlayerStyling(element) {
        element.classList.add('tcgplayer-enhanced');
        
        // Add professional hover effects
        element.style.transition = 'all 0.3s ease';
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'translateY(-4px)';
            element.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0)';
            element.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        });
        
        return element;
    }

    // Get all available assets for a specific game
    getGameAssets(game = 'yugioh') {
        if (game === 'yugioh') {
            return this.yugiohAssets;
        }
        
        return this.genericTCGAssets;
    }

    // Cache management
    cacheAsset(key, asset) {
        this.mediaCache.set(key, {
            asset: asset,
            timestamp: Date.now()
        });
    }

    getCachedAsset(key, maxAge = 3600000) { // 1 hour default
        const cached = this.mediaCache.get(key);
        if (cached && (Date.now() - cached.timestamp) < maxAge) {
            return cached.asset;
        }
        return null;
    }

    // Preload important assets
    preloadAssets() {
        const importantAssets = [
            this.yugiohAssets.promotional.new_arrivals.banner,
            this.yugiohAssets.promotional.meta_cards.banner,
            this.yugiohAssets.categories.singles.banner
        ];

        importantAssets.forEach(assetUrl => {
            const img = new Image();
            img.src = assetUrl;
        });
    }

    // Get asset statistics
    getAssetStats() {
        return {
            totalBanners: Object.keys(this.yugiohAssets.banners).length,
            totalPromotional: Object.keys(this.yugiohAssets.promotional).length,
            totalCategories: Object.keys(this.yugiohAssets.categories).length,
            cacheSize: this.mediaCache.size,
            baseUrl: this.baseUrl
        };
    }
}

// Export for use in other modules
window.TCGPlayerMediaService = TCGPlayerMediaService;

// Initialize service when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tcgPlayerMediaService = new TCGPlayerMediaService();
    window.tcgPlayerMediaService.preloadAssets();
});
