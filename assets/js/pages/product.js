/**
 * Production-ready JavaScript
 * Console.log statements removed for production deployment
 * Generated by fix-code-quality.js
 */

/**
 * Product Page Module
 * Handles individual card product pages within the SPA
 */

let currentCard = null;

export async function initPage(params = '') {
    
    await loadProduct(params);
}

async function loadProduct(params) {
    const urlParams = new URLSearchParams(params);
    const cardId = urlParams.get('id');
    
    if (!cardId) {
        showError();
        return;
    }

    try {
        // Ensure tcgStore is available
        if (!window.tcgStore) {
            console.error('TCG Store not available');
            showError();
            return;
        }

        let card = null;
        if (!isNaN(cardId)) {
            card = await window.tcgStore.getCardById(cardId);
        } else {
            const cardName = cardId.replace(/-/g, ' ');
            card = await window.tcgStore.getCardByName(cardName);
        }

        if (!card) {
            console.error('Card not found:', cardId);
            showError();
            return;
        }

        // Format card for display with error handling
        currentCard = await window.tcgStore.formatCardForDisplay(card);
        
        if (!currentCard) {
            console.error('Failed to format card for display');
            showError();
            return;
        }

        displayProduct(currentCard);
        await loadRelatedCards(currentCard);
        
    } catch (error) {
        console.error('Error loading product:', error);
        showError();
    }
}

function displayProduct(card) {
    document.getElementById('product-loading').style.display = 'none';
    document.getElementById('product-content').style.display = 'block';

    // Update page metadata
    const title = `${card.name} | Firelight Duel Academy`;
    document.getElementById('page-title').textContent = title;
    document.getElementById('breadcrumb-card-name').textContent = card.name;

    // Update product information
    document.getElementById('product-title').textContent = card.name;
    document.getElementById('product-type').textContent = card.type;
    document.getElementById('product-rarity').textContent = card.rarity;

    // Update images
    document.getElementById('main-card-image').src = card.image;
    document.getElementById('main-card-image').alt = card.name;
    document.getElementById('thumb-normal').src = card.image;
    document.getElementById('thumb-small').src = card.imageSmall;

    // Display card stats
    displayCardStats(card);

    // Display sets and rarities if available
    displaySetsAndRarities(card);

    // Update pricing
    document.getElementById('current-price').textContent = `$${card.price}`;
    const trendElement = document.getElementById('price-trend');
    const priceChange = card.priceChange || { direction: 'stable', amount: '0.00' };
    const symbol = priceChange.direction === 'up' ? '↗' : priceChange.direction === 'down' ? '↘' : '→';
    const changeText = priceChange.direction === 'stable' ? '$0.00' : 
                     (priceChange.direction === 'up' ? '+' : '-') + '$' + (priceChange.amount || '0.00');
    trendElement.textContent = `${symbol} ${changeText}`;
    trendElement.className = `price-trend ${priceChange.direction}`;

    // Update description
    document.getElementById('card-description-text').textContent = card.desc || 'No description available.';
}

function displayCardStats(card) {
    const statsContainer = document.getElementById('card-stats');
    let statsHTML = '';

    // Ensure card.type exists and is a string before using includes
    const cardType = card.type || '';
    
    if (cardType.includes && cardType.includes('Monster')) {
        if (card.atk !== undefined && card.atk !== null) {
            statsHTML += `<div style="display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--gray-200);"><span style="font-weight: 600; color: var(--gray-700);">ATK:</span><span style="color: var(--gray-900);">${card.atk}</span></div>`;
        }
        if (card.def !== undefined && card.def !== null) {
            statsHTML += `<div style="display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--gray-200);"><span style="font-weight: 600; color: var(--gray-700);">DEF:</span><span style="color: var(--gray-900);">${card.def}</span></div>`;
        }
        if (card.level !== undefined && card.level !== null) {
            statsHTML += `<div style="display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--gray-200);"><span style="font-weight: 600; color: var(--gray-700);">Level:</span><span style="color: var(--gray-900);">${card.level}</span></div>`;
        }
        if (card.attribute) {
            statsHTML += `<div style="display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--gray-200);"><span style="font-weight: 600; color: var(--gray-700);">Attribute:</span><span style="color: var(--gray-900);">${card.attribute}</span></div>`;
        }
        if (card.race) {
            statsHTML += `<div style="display: flex; justify-content: space-between; padding: var(--space-2) 0;"><span style="font-weight: 600; color: var(--gray-700);">Type:</span><span style="color: var(--gray-900);">${card.race}</span></div>`;
        }
    }

    if (card.archetype) {
        statsHTML += `<div style="display: flex; justify-content: space-between; padding: var(--space-2) 0;"><span style="font-weight: 600; color: var(--gray-700);">Archetype:</span><span style="color: var(--gray-900);">${card.archetype}</span></div>`;
    }

    if (statsContainer) {
        statsContainer.innerHTML = statsHTML;
    }
}

function displaySetsAndRarities(card) {
    const setsSection = document.getElementById('sets-rarities-section');
    const setSelect = document.getElementById('set-rarity-select');
    
    console.log('Card data for sets/rarities:', card);
    console.log('Card sets:', card.sets);
    
    if (!card.sets || !Array.isArray(card.sets) || card.sets.length === 0) {
        console.log('No sets data available, hiding section');
        setsSection.style.display = 'none';
        return;
    }

    // Show the sets section
    setsSection.style.display = 'block';
    
    // Clear existing options
    setSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `Default - ${card.rarity} ($${card.price})`;
    defaultOption.selected = true;
    setSelect.appendChild(defaultOption);
    
    // Add options for each set
    card.sets.forEach((set, index) => {
        const option = document.createElement('option');
        option.value = index;
        
        // Generate different prices for different sets/rarities
        const setPrice = generateSetPrice(card.price, set);
        
        const setName = set.set_name || 'Unknown Set';
        const setCode = set.set_code || '';
        const setRarity = set.set_rarity || 'Common';
        
        option.textContent = `${setName} (${setCode}) - ${setRarity} ($${setPrice})`;
        option.dataset.price = setPrice;
        option.dataset.rarity = setRarity;
        option.dataset.setName = setName;
        option.dataset.setCode = setCode;
        
        setSelect.appendChild(option);
    });
}

function generateSetPrice(basePrice, set) {
    const base = parseFloat(basePrice) || 1.00;
    const setRarity = set.set_rarity || 'Common';
    
    // Price multipliers based on rarity
    const rarityMultipliers = {
        'Common': 0.8,
        'Rare': 1.0,
        'Super Rare': 1.5,
        'Ultra Rare': 2.0,
        'Secret Rare': 3.0,
        'Ultimate Rare': 4.0,
        'Ghost Rare': 5.0,
        'Starlight Rare': 10.0
    };
    
    const multiplier = rarityMultipliers[setRarity] || 1.0;
    const price = (base * multiplier).toFixed(2);
    
    return price;
}

async function loadRelatedCards(card) {
    const relatedContainer = document.getElementById('related-cards-grid');
    
    try {
        let relatedCards = [];
        
        if (card.archetype) {
            relatedCards = await window.tcgStore.getCardsByArchetype(card.archetype);
            relatedCards = relatedCards.filter(c => c.id !== card.id).slice(0, 4);
        }
        
        if (relatedCards.length < 4) {
            const metaCards = await window.tcgStore.getMetaCards();
            const additionalCards = metaCards.filter(c => c.id !== card.id).slice(0, 4 - relatedCards.length);
            relatedCards = [...relatedCards, ...additionalCards];
        }

        if (relatedCards.length === 0) {
            relatedContainer.innerHTML = '<p style="text-align: center; color: var(--gray-600);">No related cards found.</p>';
            return;
        }

        relatedContainer.innerHTML = '';
        relatedCards.forEach(relatedCard => {
            const formatted = window.tcgStore.formatCardForDisplay(relatedCard);
            const cardElement = window.tcgStore.createModernCardElement(formatted);
            relatedContainer.appendChild(cardElement);
        });
        
    } catch (error) {
        console.error('Error loading related cards:', error);
        relatedContainer.innerHTML = '<p style="text-align: center; color: var(--gray-600);">Unable to load related cards.</p>';
    }
}

function showError() {
    document.getElementById('product-loading').style.display = 'none';
    document.getElementById('product-error').style.display = 'block';
}

// Global functions for the product page
window.changeQuantity = function(delta) {
    const quantityInput = document.getElementById('quantity');
    const currentValue = parseInt(quantityInput.value) || 1;
    const newValue = Math.max(1, Math.min(99, currentValue + delta));
    quantityInput.value = newValue;
};

window.updatePriceForSet = function() {
    const setSelect = document.getElementById('set-rarity-select');
    const priceElement = document.getElementById('current-price');
    const rarityElement = document.getElementById('product-rarity');
    
    const selectedOption = setSelect.options[setSelect.selectedIndex];
    
    if (selectedOption && selectedOption.value !== '') {
        // Update price
        const newPrice = selectedOption.dataset.price;
        priceElement.textContent = `$${newPrice}`;
        
        // Update rarity display
        const newRarity = selectedOption.dataset.rarity;
        rarityElement.textContent = newRarity;
        
        // Update current card data for cart
        if (currentCard) {
            currentCard.price = newPrice;
            currentCard.rarity = newRarity;
            currentCard.selectedSet = {
                name: selectedOption.dataset.setName,
                code: selectedOption.dataset.setCode,
                rarity: newRarity
            };
        }
    } else {
        // Reset to default values
        if (currentCard) {
            const originalPrice = currentCard.originalPrice || currentCard.price;
            const originalRarity = currentCard.originalRarity || currentCard.rarity;
            
            priceElement.textContent = `$${originalPrice}`;
            rarityElement.textContent = originalRarity;
            
            currentCard.price = originalPrice;
            currentCard.rarity = originalRarity;
            currentCard.selectedSet = null;
        }
    }
};

window.switchImage = function(type) {
    if (!currentCard) return;
    
    const mainImage = document.getElementById('main-card-image');
    const thumbNormal = document.getElementById('thumb-normal');
    const thumbSmall = document.getElementById('thumb-small');
    
    thumbNormal.style.borderColor = '#d1d5db';
    thumbSmall.style.borderColor = '#d1d5db';
    
    if (type === 'normal') {
        mainImage.src = currentCard.image;
        thumbNormal.style.borderColor = 'var(--primary-color)';
    } else if (type === 'small') {
        mainImage.src = currentCard.imageSmall;
        thumbSmall.style.borderColor = 'var(--primary-color)';
    }
};

window.openImageZoom = function() {
    if (!currentCard) return;
    
    const modal = document.getElementById('image-zoom-modal');
    const zoomedImage = document.getElementById('zoomed-image');
    
    zoomedImage.src = currentCard.image;
    zoomedImage.alt = currentCard.name;
    modal.style.display = 'flex';
};

window.closeImageZoom = function() {
    document.getElementById('image-zoom-modal').style.display = 'none';
};

window.addCurrentCardToCart = function() {
    if (!currentCard) return;
    
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const condition = document.getElementById('condition').value;
    
    let price = parseFloat(currentCard.price);
    const conditionMultipliers = {
        'near_mint': 1.0,
        'lightly_played': 0.9,
        'moderately_played': 0.8,
        'heavily_played': 0.65,
        'damaged': 0.5
    };
    
    price *= conditionMultipliers[condition] || 1.0;
    
    for (let i = 0; i < quantity; i++) {
        window.tcgStore.addToCart(currentCard.name, price.toFixed(2), currentCard.image);
    }
};

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('image-zoom-modal');
    if (event.target === modal) {
        window.closeImageZoom();
    }
});
