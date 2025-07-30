/**
 * Test Setup File
 * Global test configuration and mocks
 */

// Import the AppRouter class and global functions
require('../assets/js/app-router.js');

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Mock window.location
delete window.location;
window.location = {
    hash: '',
    href: 'http://localhost',
    origin: 'http://localhost',
    pathname: '/',
    search: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn()
};

// Mock history API
global.history = {
    pushState: jest.fn(),
    replaceState: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    go: jest.fn()
};

// Mock fetch globally
global.fetch = jest.fn();

// Mock DOM methods
global.document.createRange = () => ({
    setStart: jest.fn(),
    setEnd: jest.fn(),
    commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document
    }
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
};

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock CSS custom properties
Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
        getPropertyValue: (prop) => {
            const cssVars = {
                '--space-1': '4px',
                '--space-2': '8px',
                '--space-3': '12px',
                '--space-4': '16px',
                '--space-6': '24px',
                '--space-8': '32px',
                '--space-12': '48px',
                '--space-16': '64px',
                '--space-20': '80px',
                '--primary-color': '#3b82f6',
                '--secondary-color': '#f59e0b',
                '--error-color': '#ef4444',
                '--success-color': '#10b981',
                '--gray-900': '#111827',
                '--gray-600': '#4b5563'
            };
            return cssVars[prop] || '';
        }
    })
});

// Mock URL constructor
global.URL = class URL {
    constructor(url, base) {
        this.href = url;
        this.origin = base || 'http://localhost';
        this.pathname = url.split('?')[0];
        this.search = url.includes('?') ? '?' + url.split('?')[1] : '';
    }
};

// Mock URLSearchParams
global.URLSearchParams = class URLSearchParams {
    constructor(search) {
        this.params = new Map();
        if (search) {
            const pairs = search.replace('?', '').split('&');
            pairs.forEach(pair => {
                const [key, value] = pair.split('=');
                if (key) {
                    this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
                }
            });
        }
    }
    
    get(key) {
        return this.params.get(key);
    }
    
    set(key, value) {
        this.params.set(key, value);
    }
    
    has(key) {
        return this.params.has(key);
    }
    
    delete(key) {
        this.params.delete(key);
    }
    
    toString() {
        const pairs = [];
        for (const [key, value] of this.params) {
            pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
        return pairs.join('&');
    }
};

// Mock PopStateEvent
global.PopStateEvent = class PopStateEvent extends Event {
    constructor(type, eventInitDict = {}) {
        super(type, eventInitDict);
        this.state = eventInitDict.state || null;
    }
};

// Setup DOM cleanup after each test
afterEach(() => {
    // Clean up DOM
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    
    // Reset location
    window.location.hash = '';
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset localStorage and sessionStorage
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    
    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
    sessionStorageMock.clear.mockClear();
    
    // Clean up global variables
    delete window.appRouter;
    delete window.tcgStore;
    delete window.deckBuilder;
});

// Global test utilities
global.testUtils = {
    // Create a mock card object
    createMockCard: (overrides = {}) => ({
        id: 89631139,
        name: 'Snake-Eye Ash',
        type: 'Effect Monster',
        desc: 'A powerful monster card for testing',
        race: 'Pyro',
        attribute: 'FIRE',
        level: 4,
        atk: 1200,
        def: 800,
        card_images: [{
            image_url: 'https://example.com/card.jpg',
            image_url_small: 'https://example.com/card_small.jpg'
        }],
        card_sets: [{
            set_name: 'Test Set',
            set_code: 'TEST-001',
            set_rarity: 'Ultra Rare',
            set_price: '25.99'
        }],
        ...overrides
    }),
    
    // Create mock DOM elements
    createMockDOM: () => {
        document.body.innerHTML = `
            <div id="main-content"></div>
            <title id="page-title">Test Title</title>
            <meta id="page-description" content="Test Description">
            <meta id="og-title" content="Test OG Title">
            <meta id="og-description" content="Test OG Description">
            <nav>
                <a id="nav-home" class="nav-link">Home</a>
                <a id="nav-singles" class="nav-link">Singles</a>
                <a id="nav-decks" class="nav-link">Decks</a>
                <a id="nav-account" class="nav-link">Account</a>
            </nav>
        `;
    },
    
    // Wait for async operations
    waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),
    
    // Mock fetch response
    mockFetchResponse: (data, ok = true) => {
        global.fetch.mockResolvedValueOnce({
            ok,
            json: () => Promise.resolve(data),
            text: () => Promise.resolve(typeof data === 'string' ? data : JSON.stringify(data))
        });
    },
    
    // Mock fetch error
    mockFetchError: (error = new Error('Fetch failed')) => {
        global.fetch.mockRejectedValueOnce(error);
    }
};

// Suppress specific console warnings in tests
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Warning: ReactDOM.render is deprecated') ||
             args[0].includes('Warning: componentWillMount has been renamed'))
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
