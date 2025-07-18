// Yu-Gi-Oh! Image Service - Free Assets Integration
class YugiohImageService {
    constructor() {
        this.cardImageBase = 'https://images.ygoprodeck.com/images/cards/';
        this.cardImageCropped = 'https://images.ygoprodeck.com/images/cards_cropped/';
        this.cardImageSmall = 'https://images.ygoprodeck.com/images/cards_small/';
        this.setImages = this.initializeSetImages();
        this.archetypeImages = this.initializeArchetypeImages();
        this.genericImages = this.initializeGenericImages();
        this.attributeImages = this.initializeAttributeImages();
        this.typeImages = this.initializeTypeImages();
    }

    // Get card image URL with fallback options
    getCardImage(cardId, imageType = 'normal', fallbackEnabled = true) {
        let imageUrl;
        
        switch (imageType) {
            case 'small':
                imageUrl = `${this.cardImageSmall}${cardId}.jpg`;
                break;
            case 'cropped':
                imageUrl = `${this.cardImageCropped}${cardId}.jpg`;
                break;
            case 'normal':
            default:
                imageUrl = `${this.cardImageBase}${cardId}.jpg`;
                break;
        }

        // Return with error handling if fallback is enabled
        if (fallbackEnabled) {
            return this.createImageWithFallback(imageUrl, cardId, imageType);
        }
        
        return imageUrl;
    }

    // Create image element with fallback handling
    createImageWithFallback(primaryUrl, cardId, imageType = 'normal') {
        const img = document.createElement('img');
        img.src = primaryUrl;
        img.loading = 'lazy';
        
        // Set up fallback chain
        img.onerror = () => {
            if (imageType === 'normal') {
                // Try small version
                img.src = `${this.cardImageSmall}${cardId}.jpg`;
                img.onerror = () => {
                    // Final fallback to generic card back
                    img.src = this.getGenericImage('card_back');
                };
            } else if (imageType === 'small') {
                // Try normal version
                img.src = `${this.cardImageBase}${cardId}.jpg`;
                img.onerror = () => {
                    img.src = this.getGenericImage('card_back');
                };
            } else {
                // Direct fallback to generic
                img.src = this.getGenericImage('card_back');
            }
        };
        
        return img;
    }

    // Initialize set-specific images
    initializeSetImages() {
        return {
            // Classic sets
            'LOB': 'https://images.ygoprodeck.com/images/sets/LOB.jpg',
            'MRD': 'https://images.ygoprodeck.com/images/sets/MRD.jpg',
            'SRL': 'https://images.ygoprodeck.com/images/sets/SRL.jpg',
            'PSV': 'https://images.ygoprodeck.com/images/sets/PSV.jpg',
            'LON': 'https://images.ygoprodeck.com/images/sets/LON.jpg',
            'LOD': 'https://images.ygoprodeck.com/images/sets/LOD.jpg',
            
            // Modern sets
            'POTE': 'https://images.ygoprodeck.com/images/sets/POTE.jpg',
            'MAMA': 'https://images.ygoprodeck.com/images/sets/MAMA.jpg',
            'DABL': 'https://images.ygoprodeck.com/images/sets/DABL.jpg',
            'PHHY': 'https://images.ygoprodeck.com/images/sets/PHHY.jpg',
            'CYAC': 'https://images.ygoprodeck.com/images/sets/CYAC.jpg',
            
            // Structure decks
            'SDBE': 'https://images.ygoprodeck.com/images/sets/SDBE.jpg',
            'SDRR': 'https://images.ygoprodeck.com/images/sets/SDRR.jpg',
            'SDSA': 'https://images.ygoprodeck.com/images/sets/SDSA.jpg',
            
            // Legendary collections
            'LC5D': 'https://images.ygoprodeck.com/images/sets/LC5D.jpg',
            'LCKC': 'https://images.ygoprodeck.com/images/sets/LCKC.jpg',
            'LED7': 'https://images.ygoprodeck.com/images/sets/LED7.jpg'
        };
    }

    // Initialize archetype-specific images
    initializeArchetypeImages() {
        return {
            'Blue-Eyes': 'https://images.ygoprodeck.com/images/cards/89631139.jpg', // Blue-Eyes White Dragon
            'Dark Magician': 'https://images.ygoprodeck.com/images/cards/46986414.jpg', // Dark Magician
            'Red-Eyes': 'https://images.ygoprodeck.com/images/cards/38033121.jpg', // Red-Eyes Black Dragon
            'Elemental HERO': 'https://images.ygoprodeck.com/images/cards/20721928.jpg', // Elemental HERO Sparkman
            'Cyber Dragon': 'https://images.ygoprodeck.com/images/cards/70095154.jpg', // Cyber Dragon
            'Blackwing': 'https://images.ygoprodeck.com/images/cards/84013237.jpg', // Blackwing - Gale the Whirlwind
            'Six Samurai': 'https://images.ygoprodeck.com/images/cards/29981921.jpg', // Great Shogun Shien
            'Lightsworn': 'https://images.ygoprodeck.com/images/cards/22624373.jpg', // Judgment Dragon
            'Burning Abyss': 'https://images.ygoprodeck.com/images/cards/73213494.jpg', // Dante, Traveler of the Burning Abyss
            'Shaddoll': 'https://images.ygoprodeck.com/images/cards/48424886.jpg', // El Shaddoll Construct
            'Sky Striker': 'https://images.ygoprodeck.com/images/cards/26077387.jpg', // Sky Striker Ace - Raye
            'Salamangreat': 'https://images.ygoprodeck.com/images/cards/26889158.jpg', // Salamangreat Almiraj
            'Thunder Dragon': 'https://images.ygoprodeck.com/images/cards/31786629.jpg', // Thunder Dragon
            'Eldlich': 'https://images.ygoprodeck.com/images/cards/95440946.jpg', // Eldlich the Golden Lord
            'Tri-Brigade': 'https://images.ygoprodeck.com/images/cards/32617464.jpg', // Tri-Brigade Shuraig
            'Virtual World': 'https://images.ygoprodeck.com/images/cards/81927732.jpg', // Virtual World Kyubi - Shenshen
            'Drytron': 'https://images.ygoprodeck.com/images/cards/58601383.jpg', // Drytron Alpha Thuban
            'Dogmatika': 'https://images.ygoprodeck.com/images/cards/95679145.jpg', // Dogmatika Ecclesia
        };
    }

    // Initialize generic Yu-Gi-Oh! themed images
    initializeGenericImages() {
        return {
            // Card backs and generic
            'card_back': 'https://images.ygoprodeck.com/images/cardback.jpg',
            'card_back_alt': 'https://images.ygoprodeck.com/images/misc/cardback_alt.jpg',
            
            // Classic Era (DM/GX)
            'duel_background': 'https://images.ygoprodeck.com/images/cards/89631139.jpg', // Blue-Eyes White Dragon
            'tournament': 'https://images.ygoprodeck.com/images/cards/46986414.jpg', // Dark Magician
            'collection': 'https://images.ygoprodeck.com/images/cards/55144522.jpg', // Pot of Greed
            'deck_building': 'https://images.ygoprodeck.com/images/cards/83764718.jpg', // Monster Reborn
            'trading': 'https://images.ygoprodeck.com/images/cards/38033121.jpg', // Red-Eyes Black Dragon
            'fusion_era': 'https://images.ygoprodeck.com/images/cards/20721928.jpg', // Elemental HERO Sparkman
            'polymerization': 'https://images.ygoprodeck.com/images/cards/24094653.jpg', // Polymerization
            
            // Synchro Era (5D's)
            'synchro_era': 'https://images.ygoprodeck.com/images/cards/44508094.jpg', // Stardust Dragon
            'synchro_summoning': 'https://images.ygoprodeck.com/images/cards/98012938.jpg', // Junk Synchron
            'tuner_monsters': 'https://images.ygoprodeck.com/images/cards/84013237.jpg', // Blackwing - Gale the Whirlwind
            'accel_synchro': 'https://images.ygoprodeck.com/images/cards/97204936.jpg', // Red Dragon Archfiend
            
            // Xyz Era (ZEXAL)
            'xyz_era': 'https://images.ygoprodeck.com/images/cards/56832966.jpg', // Number 39: Utopia
            'xyz_summoning': 'https://images.ygoprodeck.com/images/cards/84013237.jpg', // Gagaga Magician
            'rank_up': 'https://images.ygoprodeck.com/images/cards/95992081.jpg', // Rank-Up-Magic Numeron Force
            'overlay_network': 'https://images.ygoprodeck.com/images/cards/56832966.jpg', // Number 39: Utopia
            'numbers': 'https://images.ygoprodeck.com/images/cards/56832966.jpg', // Number 39: Utopia
            
            // Pendulum Era (ARC-V)
            'pendulum_era': 'https://images.ygoprodeck.com/images/cards/16178681.jpg', // Odd-Eyes Pendulum Dragon
            'pendulum_summoning': 'https://images.ygoprodeck.com/images/cards/16178681.jpg', // Odd-Eyes Pendulum Dragon
            'pendulum_scales': 'https://images.ygoprodeck.com/images/cards/82224646.jpg', // Timegazer Magician
            'arc_v_era': 'https://images.ygoprodeck.com/images/cards/16178681.jpg', // Odd-Eyes Pendulum Dragon
            
            // Link Era (VRAINS)
            'link_era': 'https://images.ygoprodeck.com/images/cards/1861629.jpg', // Decode Talker
            'link_summoning': 'https://images.ygoprodeck.com/images/cards/1861629.jpg', // Decode Talker
            'cyberse': 'https://images.ygoprodeck.com/images/cards/1861629.jpg', // Decode Talker
            'vrains_era': 'https://images.ygoprodeck.com/images/cards/26889158.jpg', // Salamangreat Almiraj
            'co_linking': 'https://images.ygoprodeck.com/images/cards/1861629.jpg', // Decode Talker
            
            // Modern Meta Archetypes
            'sky_striker': 'https://images.ygoprodeck.com/images/cards/26077387.jpg', // Sky Striker Ace - Raye
            'salamangreat': 'https://images.ygoprodeck.com/images/cards/26889158.jpg', // Salamangreat Almiraj
            'eldlich': 'https://images.ygoprodeck.com/images/cards/95440946.jpg', // Eldlich the Golden Lord
            'tri_brigade': 'https://images.ygoprodeck.com/images/cards/32617464.jpg', // Tri-Brigade Shuraig
            'virtual_world': 'https://images.ygoprodeck.com/images/cards/81927732.jpg', // Virtual World Kyubi - Shenshen
            'drytron': 'https://images.ygoprodeck.com/images/cards/58601383.jpg', // Drytron Alpha Thuban
            'dogmatika': 'https://images.ygoprodeck.com/images/cards/95679145.jpg', // Dogmatika Ecclesia
            'branded': 'https://images.ygoprodeck.com/images/cards/44362883.jpg', // Branded Fusion
            'despia': 'https://images.ygoprodeck.com/images/cards/87746184.jpg', // Aluber the Jester of Despia
            'swordsoul': 'https://images.ygoprodeck.com/images/cards/73542069.jpg', // Swordsoul of Mo Ye
            'floowandereeze': 'https://images.ygoprodeck.com/images/cards/90673288.jpg', // Floowandereeze & Eglen
            'adventure': 'https://images.ygoprodeck.com/images/cards/25343280.jpg', // Rite of Aramesir
            'spright': 'https://images.ygoprodeck.com/images/cards/30227494.jpg', // Spright Blue
            'tearlaments': 'https://images.ygoprodeck.com/images/cards/572850.jpg', // Tearlaments Scheiren
            'kashtira': 'https://images.ygoprodeck.com/images/cards/28776350.jpg', // Kashtira Fenrir
            'purrely': 'https://images.ygoprodeck.com/images/cards/95286165.jpg', // Purrely
            'rescue_ace': 'https://images.ygoprodeck.com/images/cards/79606837.jpg', // Rescue-ACE Hydrant
            'snake_eye': 'https://images.ygoprodeck.com/images/cards/76375976.jpg', // Snake-Eye Ash
            'fire_king': 'https://images.ygoprodeck.com/images/cards/69537999.jpg', // Fire King Avatar Arvata
            'centur_ion': 'https://images.ygoprodeck.com/images/cards/30741503.jpg', // Centur-Ion Primera
            'voiceless_voice': 'https://images.ygoprodeck.com/images/cards/32731036.jpg', // Saffira, Divine Dragon of the Voiceless Voice
            
            // Hand Traps & Staples
            'hand_traps': 'https://images.ygoprodeck.com/images/cards/23434538.jpg', // Maxx "C"
            'ash_blossom': 'https://images.ygoprodeck.com/images/cards/14558127.jpg', // Ash Blossom & Joyous Spring
            'effect_veiler': 'https://images.ygoprodeck.com/images/cards/97268402.jpg', // Effect Veiler
            'impermanence': 'https://images.ygoprodeck.com/images/cards/10045474.jpg', // Infinite Impermanence
            'nibiru': 'https://images.ygoprodeck.com/images/cards/27204311.jpg', // Nibiru, the Primal Being
            'droll_lock': 'https://images.ygoprodeck.com/images/cards/23002292.jpg', // Droll & Lock Bird
            'ghost_ogre': 'https://images.ygoprodeck.com/images/cards/59438930.jpg', // Ghost Ogre & Snow Rabbit
            
            // Extra Deck Staples
            'accesscode': 'https://images.ygoprodeck.com/images/cards/86066372.jpg', // Accesscode Talker
            'apollousa': 'https://images.ygoprodeck.com/images/cards/56405614.jpg', // Apollousa, Bow of the Goddess
            'borreload': 'https://images.ygoprodeck.com/images/cards/31833038.jpg', // Borreload Dragon
            'knightmare': 'https://images.ygoprodeck.com/images/cards/4280258.jpg', // Knightmare Phoenix
            'halqifibrax': 'https://images.ygoprodeck.com/images/cards/50588353.jpg', // Crystron Halqifibrax
            'verte_anaconda': 'https://images.ygoprodeck.com/images/cards/70369116.jpg', // Predaplant Verte Anaconda
            
            // Store sections
            'singles': 'https://images.ygoprodeck.com/images/cards/89631139.jpg', // Blue-Eyes White Dragon
            'booster_packs': 'https://images.ygoprodeck.com/images/cards/55144522.jpg', // Pot of Greed
            'structure_decks': 'https://images.ygoprodeck.com/images/cards/46986414.jpg', // Dark Magician
            'accessories': 'https://images.ygoprodeck.com/images/cards/83764718.jpg', // Monster Reborn
            'sealed_products': 'https://images.ygoprodeck.com/images/cards/44362883.jpg', // Branded Fusion
            'deck_cores': 'https://images.ygoprodeck.com/images/cards/26077387.jpg', // Sky Striker Ace - Raye
            'staples': 'https://images.ygoprodeck.com/images/cards/14558127.jpg', // Ash Blossom & Joyous Spring
            'meta_cards': 'https://images.ygoprodeck.com/images/cards/86066372.jpg', // Accesscode Talker
            
            // Promotional banners
            'new_arrivals': 'https://images.ygoprodeck.com/images/cards/76375976.jpg', // Snake-Eye Ash
            'featured_products': 'https://images.ygoprodeck.com/images/cards/28776350.jpg', // Kashtira Fenrir
            'sale_banner': 'https://images.ygoprodeck.com/images/cards/95286165.jpg', // Purrely
            'membership': 'https://images.ygoprodeck.com/images/cards/95440946.jpg', // Eldlich the Golden Lord
            'competitive': 'https://images.ygoprodeck.com/images/cards/26077387.jpg', // Sky Striker Ace - Raye
            'casual': 'https://images.ygoprodeck.com/images/cards/89631139.jpg', // Blue-Eyes White Dragon
            'budget': 'https://images.ygoprodeck.com/images/cards/83555666.jpg', // Skull Servant
            'premium': 'https://images.ygoprodeck.com/images/cards/10000000.jpg', // The Winged Dragon of Ra
            
            // Format & Tournament Types
            'tcg_format': 'https://images.ygoprodeck.com/images/cards/26077387.jpg', // Sky Striker Ace - Raye
            'ocg_format': 'https://images.ygoprodeck.com/images/cards/23434538.jpg', // Maxx "C"
            'goat_format': 'https://images.ygoprodeck.com/images/cards/55144522.jpg', // Pot of Greed
            'edison_format': 'https://images.ygoprodeck.com/images/cards/22624373.jpg', // Judgment Dragon
            'master_duel': 'https://images.ygoprodeck.com/images/cards/86066372.jpg', // Accesscode Talker
            'duel_links': 'https://images.ygoprodeck.com/images/cards/89631139.jpg', // Blue-Eyes White Dragon
            
            // Rarity & Collectibles
            'secret_rare': 'https://images.ygoprodeck.com/images/cards/89631139.jpg', // Blue-Eyes White Dragon
            'ultimate_rare': 'https://images.ygoprodeck.com/images/cards/46986414.jpg', // Dark Magician
            'ghost_rare': 'https://images.ygoprodeck.com/images/cards/44508094.jpg', // Stardust Dragon
            'starlight_rare': 'https://images.ygoprodeck.com/images/cards/86066372.jpg', // Accesscode Talker
            'collector_rare': 'https://images.ygoprodeck.com/images/cards/26077387.jpg', // Sky Striker Ace - Raye
            'quarter_century': 'https://images.ygoprodeck.com/images/cards/89631139.jpg', // Blue-Eyes White Dragon
            
            // Deck Types
            'combo_deck': 'https://images.ygoprodeck.com/images/cards/32617464.jpg', // Tri-Brigade Shuraig
            'control_deck': 'https://images.ygoprodeck.com/images/cards/95440946.jpg', // Eldlich the Golden Lord
            'midrange_deck': 'https://images.ygoprodeck.com/images/cards/26077387.jpg', // Sky Striker Ace - Raye
            'aggro_deck': 'https://images.ygoprodeck.com/images/cards/90673288.jpg', // Floowandereeze & Eglen
            'stun_deck': 'https://images.ygoprodeck.com/images/cards/27204311.jpg', // Nibiru, the Primal Being
            'otk_deck': 'https://images.ygoprodeck.com/images/cards/70095154.jpg', // Cyber Dragon
            
            // Special Mechanics
            'ritual_summoning': 'https://images.ygoprodeck.com/images/cards/32731036.jpg', // Saffira, Divine Dragon of the Voiceless Voice
            'contact_fusion': 'https://images.ygoprodeck.com/images/cards/70095154.jpg', // Cyber Dragon
            'special_summoning': 'https://images.ygoprodeck.com/images/cards/83764718.jpg', // Monster Reborn
            'banish_mechanics': 'https://images.ygoprodeck.com/images/cards/28776350.jpg', // Kashtira Fenrir
            'graveyard_effects': 'https://images.ygoprodeck.com/images/cards/572850.jpg', // Tearlaments Scheiren
            'mill_effects': 'https://images.ygoprodeck.com/images/cards/22624373.jpg', // Judgment Dragon
            
            // Side Deck & Tech Cards
            'side_deck': 'https://images.ygoprodeck.com/images/cards/23002292.jpg', // Droll & Lock Bird
            'tech_cards': 'https://images.ygoprodeck.com/images/cards/59438930.jpg', // Ghost Ogre & Snow Rabbit
            'floodgates': 'https://images.ygoprodeck.com/images/cards/27204311.jpg', // Nibiru, the Primal Being
            'board_breakers': 'https://images.ygoprodeck.com/images/cards/14558127.jpg', // Ash Blossom & Joyous Spring
        };
    }

    // Initialize attribute-specific images
    initializeAttributeImages() {
        return {
            'DARK': 'https://images.ygoprodeck.com/images/cards/46986414.jpg', // Dark Magician
            'LIGHT': 'https://images.ygoprodeck.com/images/cards/89631139.jpg', // Blue-Eyes White Dragon
            'FIRE': 'https://images.ygoprodeck.com/images/cards/38033121.jpg', // Red-Eyes Black Dragon
            'WATER': 'https://images.ygoprodeck.com/images/cards/22702055.jpg', // Levia-Dragon - Daedalus
            'EARTH': 'https://images.ygoprodeck.com/images/cards/70781052.jpg', // Elemental HERO Clayman
            'WIND': 'https://images.ygoprodeck.com/images/cards/21844576.jpg', // Elemental HERO Avian
            'DIVINE': 'https://images.ygoprodeck.com/images/cards/10000000.jpg' // The Winged Dragon of Ra
        };
    }

    // Initialize type-specific images
    initializeTypeImages() {
        return {
            'Dragon': 'https://images.ygoprodeck.com/images/cards/89631139.jpg', // Blue-Eyes White Dragon
            'Spellcaster': 'https://images.ygoprodeck.com/images/cards/46986414.jpg', // Dark Magician
            'Warrior': 'https://images.ygoprodeck.com/images/cards/05863092.jpg', // Elemental HERO Sparkman
            'Machine': 'https://images.ygoprodeck.com/images/cards/70095154.jpg', // Cyber Dragon
            'Fiend': 'https://images.ygoprodeck.com/images/cards/33396948.jpg', // Exodia the Forbidden One
            'Beast': 'https://images.ygoprodeck.com/images/cards/69247929.jpg', // Gazelle the King of Mythical Beasts
            'Zombie': 'https://images.ygoprodeck.com/images/cards/83555666.jpg', // Skull Servant
            'Winged Beast': 'https://images.ygoprodeck.com/images/cards/21844576.jpg', // Elemental HERO Avian
            'Spell': 'https://images.ygoprodeck.com/images/cards/55144522.jpg', // Pot of Greed
            'Trap': 'https://images.ygoprodeck.com/images/cards/44095762.jpg' // Mirror Force
        };
    }

    // Get set image
    getSetImage(setCode) {
        return this.setImages[setCode] || this.getGenericImage('card_back');
    }

    // Get archetype image
    getArchetypeImage(archetype) {
        return this.archetypeImages[archetype] || this.getGenericImage('duel_background');
    }

    // Get generic themed image
    getGenericImage(imageType) {
        return this.genericImages[imageType] || this.genericImages['card_back'];
    }

    // Get attribute image
    getAttributeImage(attribute) {
        return this.attributeImages[attribute] || this.getGenericImage('card_back');
    }

    // Get type image
    getTypeImage(type) {
        // Extract main type (remove "Monster", "Card", etc.)
        const mainType = type.split(' ')[0];
        return this.typeImages[mainType] || this.getGenericImage('card_back');
    }

    // Create background image CSS for sections
    createBackgroundImageCSS(imageUrl, opacity = 0.1) {
        return `
            background-image: linear-gradient(rgba(0,0,0,${1-opacity}), rgba(0,0,0,${1-opacity})), url('${imageUrl}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        `;
    }

    // Get random card image for decorative purposes
    getRandomCardImage() {
        const randomCards = [
            89631139, // Blue-Eyes White Dragon
            46986414, // Dark Magician
            38033121, // Red-Eyes Black Dragon
            55144522, // Pot of Greed
            83764718, // Monster Reborn
            44095762, // Mirror Force
            70095154, // Cyber Dragon
            22624373, // Judgment Dragon
            84013237, // Blackwing - Gale
            26077387  // Sky Striker Ace - Raye
        ];
        
        const randomId = randomCards[Math.floor(Math.random() * randomCards.length)];
        return this.getCardImage(randomId, 'normal', false);
    }

    // Create card preview with enhanced styling
    createCardPreview(card, options = {}) {
        const {
            size = 'medium',
            showPrice = true,
            showDetails = true,
            clickable = true,
            className = ''
        } = options;

        const cardElement = document.createElement('div');
        cardElement.className = `card-preview ${size} ${className}`;
        
        if (clickable) {
            cardElement.style.cursor = 'pointer';
            cardElement.onclick = () => {
                if (window.yugiohStore) {
                    window.yugiohStore.showCardDetails(card.id);
                }
            };
        }

        const imageElement = this.createImageWithFallback(
            this.getCardImage(card.id, size === 'small' ? 'small' : 'normal', false),
            card.id,
            size === 'small' ? 'small' : 'normal'
        );
        imageElement.className = 'card-preview-image';
        imageElement.alt = card.name;

        cardElement.appendChild(imageElement);

        if (showDetails) {
            const detailsElement = document.createElement('div');
            detailsElement.className = 'card-preview-details';
            
            const nameElement = document.createElement('h3');
            nameElement.className = 'card-preview-name';
            nameElement.textContent = card.name;
            detailsElement.appendChild(nameElement);

            const typeElement = document.createElement('p');
            typeElement.className = 'card-preview-type';
            typeElement.textContent = card.type;
            detailsElement.appendChild(typeElement);

            if (showPrice && window.yugiohStore) {
                const priceElement = document.createElement('div');
                priceElement.className = 'card-preview-price';
                
                // Get price asynchronously
                window.yugiohStore.getCardPrice(card).then(price => {
                    priceElement.textContent = `$${price.toFixed(2)}`;
                }).catch(() => {
                    priceElement.textContent = '$1.00';
                });
                
                detailsElement.appendChild(priceElement);
            }

            cardElement.appendChild(detailsElement);
        }

        return cardElement;
    }

    // Add themed background to page sections
    addThemedBackground(element, theme = 'duel_background', opacity = 0.05) {
        const imageUrl = this.getGenericImage(theme);
        element.style.cssText += this.createBackgroundImageCSS(imageUrl, opacity);
    }

    // Create image gallery for sets/archetypes
    createImageGallery(items, type = 'archetype') {
        const gallery = document.createElement('div');
        gallery.className = 'yugioh-image-gallery';

        items.forEach(item => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';

            let imageUrl;
            switch (type) {
                case 'archetype':
                    imageUrl = this.getArchetypeImage(item.name);
                    break;
                case 'set':
                    imageUrl = this.getSetImage(item.code);
                    break;
                case 'attribute':
                    imageUrl = this.getAttributeImage(item.name);
                    break;
                default:
                    imageUrl = this.getGenericImage('card_back');
            }

            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = item.name;
            img.className = 'gallery-image';
            img.loading = 'lazy';

            const label = document.createElement('div');
            label.className = 'gallery-label';
            label.textContent = item.name;

            galleryItem.appendChild(img);
            galleryItem.appendChild(label);

            if (item.onClick) {
                galleryItem.style.cursor = 'pointer';
                galleryItem.onclick = item.onClick;
            }

            gallery.appendChild(galleryItem);
        });

        return gallery;
    }

    // Preload important images
    preloadImages() {
        const importantImages = [
            this.getGenericImage('card_back'),
            this.getGenericImage('duel_background'),
            this.getArchetypeImage('Blue-Eyes'),
            this.getArchetypeImage('Dark Magician'),
            this.getArchetypeImage('Red-Eyes')
        ];

        importantImages.forEach(imageUrl => {
            const img = new Image();
            img.src = imageUrl;
        });
    }

    // Get cache stats
    getCacheStats() {
        return {
            setImages: Object.keys(this.setImages).length,
            archetypeImages: Object.keys(this.archetypeImages).length,
            genericImages: Object.keys(this.genericImages).length,
            attributeImages: Object.keys(this.attributeImages).length,
            typeImages: Object.keys(this.typeImages).length
        };
    }
}

// Export for use in other modules
window.YugiohImageService = YugiohImageService;

// Initialize service when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.yugiohImageService = new YugiohImageService();
    window.yugiohImageService.preloadImages();
});
