-- Firelight Duel Academy - Yu-Gi-Oh! Singles Store Database Schema
-- Focused on single card sales with TCGPlayer pricing integration

-- Users and Authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    profile_image VARCHAR(500),
    favorite_archetype VARCHAR(100),
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- User Addresses
CREATE TABLE user_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('shipping', 'billing') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'United States',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_type (user_id, type)
);

-- Store Credit System
CREATE TABLE store_credit (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    lifetime_earned DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    lifetime_spent DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
);

-- Store Credit Transactions
CREATE TABLE store_credit_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('earned', 'spent', 'adjustment', 'expired') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_type ENUM('buylist', 'purchase', 'return', 'bonus', 'admin_adjustment') NOT NULL,
    reference_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, created_at)
);

-- Yu-Gi-Oh! Card Database (from YGOPRODeck API)
CREATE TABLE yugioh_cards (
    id INT PRIMARY KEY, -- YGOPRODeck card ID
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    desc TEXT,
    atk INT,
    def INT,
    level INT,
    race VARCHAR(100),
    attribute VARCHAR(50),
    archetype VARCHAR(100),
    card_sets JSON, -- Array of sets this card appears in
    card_images JSON, -- Array of image URLs
    misc_info JSON, -- Additional card info
    tcg_exists BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_type (type),
    INDEX idx_archetype (archetype),
    INDEX idx_race (race),
    INDEX idx_attribute (attribute),
    FULLTEXT idx_search (name, desc)
);

-- Card Sets/Printings
CREATE TABLE card_sets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    set_name VARCHAR(255) NOT NULL,
    set_code VARCHAR(50) NOT NULL,
    tcg_date DATE,
    card_id INT NOT NULL,
    set_rarity VARCHAR(50),
    set_price VARCHAR(20), -- From YGOPRODeck API
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES yugioh_cards(id),
    INDEX idx_card (card_id),
    INDEX idx_set_code (set_code),
    INDEX idx_rarity (set_rarity)
);

-- TCGPlayer Pricing Data
CREATE TABLE tcgplayer_prices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    card_id INT NOT NULL,
    set_code VARCHAR(50),
    rarity VARCHAR(50),
    condition_grade ENUM('near_mint', 'lightly_played', 'moderately_played', 'heavily_played', 'damaged') NOT NULL,
    market_price DECIMAL(10,2),
    low_price DECIMAL(10,2),
    mid_price DECIMAL(10,2),
    high_price DECIMAL(10,2),
    direct_low DECIMAL(10,2), -- TCGPlayer Direct lowest
    subtype VARCHAR(50), -- 1st Edition, Unlimited, etc.
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES yugioh_cards(id),
    UNIQUE KEY unique_card_set_condition (card_id, set_code, rarity, condition_grade, subtype),
    INDEX idx_card_condition (card_id, condition_grade),
    INDEX idx_low_price (low_price),
    INDEX idx_updated (last_updated)
);

-- Store Inventory (Singles)
CREATE TABLE inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    card_id INT NOT NULL,
    set_code VARCHAR(50) NOT NULL,
    rarity VARCHAR(50) NOT NULL,
    condition_grade ENUM('near_mint', 'lightly_played', 'moderately_played', 'heavily_played', 'damaged') NOT NULL,
    subtype VARCHAR(50), -- 1st Edition, Unlimited, etc.
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT DEFAULT 0, -- Reserved for pending orders
    cost_per_unit DECIMAL(10,2), -- What we paid for it
    our_price DECIMAL(10,2) NOT NULL, -- Our selling price
    buylist_price DECIMAL(10,2), -- What we'll pay to buy it
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    location VARCHAR(100), -- Physical storage location
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES yugioh_cards(id),
    UNIQUE KEY unique_card_variant (card_id, set_code, rarity, condition_grade, subtype),
    INDEX idx_card (card_id),
    INDEX idx_active_quantity (is_active, quantity),
    INDEX idx_featured (is_featured),
    INDEX idx_price (our_price)
);

-- Shopping Cart
CREATE TABLE shopping_cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    session_id VARCHAR(255),
    inventory_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
    INDEX idx_user_session (user_id, session_id)
);

-- Wishlists
CREATE TABLE wishlists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    preferred_set VARCHAR(50),
    preferred_rarity VARCHAR(50),
    max_condition ENUM('near_mint', 'lightly_played', 'moderately_played', 'heavily_played', 'damaged') DEFAULT 'lightly_played',
    target_price DECIMAL(10,2),
    notify_when_available BOOLEAN DEFAULT TRUE,
    notify_when_price_drops BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES yugioh_cards(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_card (user_id, card_id),
    INDEX idx_user (user_id),
    INDEX idx_card (card_id)
);

-- Orders
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    store_credit_used DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    shipping_address JSON,
    billing_address JSON,
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_order_number (order_number)
);

-- Order Items
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    inventory_id INT NOT NULL,
    card_name VARCHAR(255) NOT NULL,
    set_code VARCHAR(50) NOT NULL,
    rarity VARCHAR(50) NOT NULL,
    condition_grade VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id),
    INDEX idx_order (order_id)
);

-- Buylist System
CREATE TABLE buylist_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    submission_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('pending', 'reviewing', 'approved', 'rejected', 'paid', 'cancelled') DEFAULT 'pending',
    total_estimated_value DECIMAL(10,2) DEFAULT 0,
    total_approved_value DECIMAL(10,2) DEFAULT 0,
    payment_method ENUM('store_credit', 'paypal', 'check') DEFAULT 'store_credit',
    store_credit_bonus DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    admin_notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
);

-- Buylist Items
CREATE TABLE buylist_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    card_id INT NOT NULL,
    set_code VARCHAR(50) NOT NULL,
    rarity VARCHAR(50) NOT NULL,
    condition_grade ENUM('near_mint', 'lightly_played', 'moderately_played', 'heavily_played', 'damaged') NOT NULL,
    quantity INT NOT NULL,
    estimated_price DECIMAL(10,2) NOT NULL,
    approved_price DECIMAL(10,2),
    approved_quantity INT,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES buylist_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (card_id) REFERENCES yugioh_cards(id),
    INDEX idx_submission (submission_id),
    INDEX idx_card (card_id)
);

-- Inventory Transactions
CREATE TABLE inventory_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inventory_id INT NOT NULL,
    type ENUM('in', 'out', 'adjustment', 'reserved', 'unreserved') NOT NULL,
    quantity INT NOT NULL,
    reference_type ENUM('purchase', 'sale', 'buylist', 'adjustment', 'return', 'damage') NOT NULL,
    reference_id INT,
    cost_per_unit DECIMAL(10,2),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_inventory_date (inventory_id, created_at)
);

-- Price History Tracking
CREATE TABLE price_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inventory_id INT NOT NULL,
    price_type ENUM('our_price', 'buylist_price', 'tcg_low', 'tcg_market') NOT NULL,
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2) NOT NULL,
    change_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,
    INDEX idx_inventory_date (inventory_id, created_at)
);

-- Site Settings
CREATE TABLE site_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description VARCHAR(255),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Analytics
CREATE TABLE analytics_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_type VARCHAR(50) NOT NULL,
    event_data JSON,
    user_id INT,
    session_id VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_event_type_date (event_type, created_at)
);

-- Insert Default Settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name', 'Firelight Duel Academy', 'string', 'Site name', true),
('currency', 'USD', 'string', 'Default currency', true),
('tax_rate', '0.08', 'number', 'Sales tax rate', false),
('free_shipping_threshold', '50.00', 'number', 'Free shipping threshold', true),
('store_credit_bonus', '0.10', 'number', 'Store credit bonus (10%)', true),
('buylist_enabled', 'true', 'boolean', 'Enable buylist system', true),
('tcgplayer_api_key', '', 'string', 'TCGPlayer API key', false),
('price_update_frequency', '24', 'number', 'Hours between price updates', false),
('default_markup', '0.15', 'number', 'Default markup over TCG low (15%)', false);

-- Create performance indexes
CREATE INDEX idx_inventory_search ON inventory(card_id, is_active, quantity);
CREATE INDEX idx_tcg_prices_lookup ON tcgplayer_prices(card_id, condition_grade, low_price);
CREATE INDEX idx_cards_search ON yugioh_cards(name, type, archetype);
CREATE INDEX idx_orders_recent ON orders(created_at DESC);
CREATE INDEX idx_buylist_recent ON buylist_submissions(submitted_at DESC);
