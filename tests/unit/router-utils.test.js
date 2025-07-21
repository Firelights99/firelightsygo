/**
 * Unit Tests for Router Utility Functions
 * Tests individual router methods and edge cases
 */

describe('Router Utility Functions', () => {
    let appRouter;

    beforeEach(() => {
        // Setup minimal DOM
        document.body.innerHTML = `
            <div id="main-content"></div>
            <title id="page-title">Test</title>
            <meta id="page-description" content="Test">
            <meta id="og-title" content="Test">
            <meta id="og-description" content="Test">
        `;

        // Mock dependencies
        window.tcgStore = { currentUser: null, loadInitialData: jest.fn() };
        window.deckBuilder = { getSavedDecks: jest.fn(() => ({})) };
        global.fetch = jest.fn();

        appRouter = new AppRouter();
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete window.tcgStore;
        delete window.deckBuilder;
    });

    describe('getPageFromURL', () => {
        test('should return null for empty hash', () => {
            window.location.hash = '';
            expect(appRouter.getPageFromURL()).toBeNull();
        });

        test('should parse page parameter from hash', () => {
            window.location.hash = '#page=singles';
            expect(appRouter.getPageFromURL()).toBe('singles');
        });

        test('should return hash directly if no page parameter', () => {
            window.location.hash = '#home';
            expect(appRouter.getPageFromURL()).toBe('home');
        });

        test('should handle complex hash with multiple parameters', () => {
            window.location.hash = '#page=product&id=123&category=monster';
            expect(appRouter.getPageFromURL()).toBe('product');
        });
    });

    describe('updateMetadata', () => {
        test('should update all metadata elements', () => {
            appRouter.updateMetadata('singles');

            expect(document.getElementById('page-title').textContent).toContain('Singles | Firelight Duel Academy');
            expect(document.getElementById('page-description').getAttribute('content')).toContain('Browse our extensive collection');
            expect(document.getElementById('og-title').getAttribute('content')).toContain('Singles | Firelight Duel Academy');
            expect(document.getElementById('og-description').getAttribute('content')).toContain('Browse our extensive collection');
        });

        test('should handle missing metadata elements gracefully', () => {
            document.getElementById('page-title').remove();
            
            expect(() => {
                appRouter.updateMetadata('singles');
            }).not.toThrow();
        });

        test('should handle invalid page names', () => {
            expect(() => {
                appRouter.updateMetadata('invalid-page');
            }).not.toThrow();
        });
    });

    describe('updateNavigation', () => {
        beforeEach(() => {
            document.body.innerHTML += `
                <nav>
                    <a id="nav-home" class="nav-link active">Home</a>
                    <a id="nav-singles" class="nav-link">Singles</a>
                    <a id="nav-decks" class="nav-link">Decks</a>
                </nav>
            `;
        });

        test('should update active navigation state', () => {
            appRouter.updateNavigation('singles');

            expect(document.getElementById('nav-home').classList.contains('active')).toBe(false);
            expect(document.getElementById('nav-singles').classList.contains('active')).toBe(true);
            expect(document.getElementById('nav-decks').classList.contains('active')).toBe(false);
        });

        test('should handle missing navigation elements', () => {
            expect(() => {
                appRouter.updateNavigation('nonexistent-page');
            }).not.toThrow();
        });
    });

    describe('showLoading', () => {
        test('should display loading spinner', () => {
            appRouter.showLoading();

            const mainContent = document.getElementById('main-content');
            expect(mainContent.innerHTML).toContain('loading-spinner');
            expect(mainContent.innerHTML).toContain('Loading...');
        });

        test('should handle missing main content element', () => {
            document.getElementById('main-content').remove();
            
            expect(() => {
                appRouter.showLoading();
            }).not.toThrow();
        });
    });

    describe('showError', () => {
        test('should display error message', () => {
            const errorMessage = 'Test error message';
            appRouter.showError(errorMessage);

            const mainContent = document.getElementById('main-content');
            expect(mainContent.innerHTML).toContain(errorMessage);
            expect(mainContent.innerHTML).toContain('var(--error-color)');
        });

        test('should handle missing main content element', () => {
            document.getElementById('main-content').remove();
            
            expect(() => {
                appRouter.showError('Test error');
            }).not.toThrow();
        });
    });

    describe('renderPage', () => {
        test('should render content to main element', () => {
            const testContent = '<div>Test Content</div>';
            appRouter.renderPage(testContent);

            expect(document.getElementById('main-content').innerHTML).toBe(testContent);
        });

        test('should handle missing main content element', () => {
            document.getElementById('main-content').remove();
            
            expect(() => {
                appRouter.renderPage('<div>Test</div>');
            }).not.toThrow();
        });
    });

    describe('executePageScript', () => {
        test('should call tcgStore.loadInitialData for home page', () => {
            appRouter.executePageScript('home');
            expect(window.tcgStore.loadInitialData).toHaveBeenCalled();
        });

        test('should call tcgStore.loadInitialData for singles page', () => {
            appRouter.executePageScript('singles');
            expect(window.tcgStore.loadInitialData).toHaveBeenCalled();
        });

        test('should initialize decks page', () => {
            const initSpy = jest.spyOn(appRouter, 'initializeDecksPage');
            appRouter.executePageScript('decks');
            expect(initSpy).toHaveBeenCalled();
        });

        test('should initialize product page with params', () => {
            const initSpy = jest.spyOn(appRouter, 'initializeProductPage');
            appRouter.executePageScript('product', '?id=123');
            expect(initSpy).toHaveBeenCalledWith('?id=123');
        });

        test('should handle missing tcgStore gracefully', () => {
            delete window.tcgStore;
            
            expect(() => {
                appRouter.executePageScript('home');
            }).not.toThrow();
        });
    });

    describe('initializeDecksPage', () => {
        test('should load user decks when deckBuilder is available', (done) => {
            const loadSpy = jest.spyOn(appRouter, 'loadUserDecks');
            
            appRouter.initializeDecksPage();
            
            setTimeout(() => {
                expect(loadSpy).toHaveBeenCalled();
                done();
            }, 150);
        });

        test('should handle missing deckBuilder gracefully', () => {
            delete window.deckBuilder;
            
            expect(() => {
                appRouter.initializeDecksPage();
            }).not.toThrow();
        });
    });

    describe('loadUserDecks', () => {
        beforeEach(() => {
            document.body.innerHTML += `<div id="user-decks-grid"></div>`;
        });

        test('should show empty state when no decks exist', () => {
            window.deckBuilder.getSavedDecks.mockReturnValue({});
            
            appRouter.loadUserDecks();
            
            const container = document.getElementById('user-decks-grid');
            expect(container.innerHTML).toContain('No Decks Yet');
            expect(container.innerHTML).toContain('Create New Deck');
        });

        test('should show deck list when decks exist', () => {
            window.deckBuilder.getSavedDecks.mockReturnValue({
                'deck1': { name: 'Test Deck' }
            });
            
            appRouter.loadUserDecks();
            
            const container = document.getElementById('user-decks-grid');
            expect(container.innerHTML).toContain('Your saved decks will appear here');
        });

        test('should handle missing container element', () => {
            document.getElementById('user-decks-grid').remove();
            
            expect(() => {
                appRouter.loadUserDecks();
            }).not.toThrow();
        });

        test('should handle missing deckBuilder', () => {
            delete window.deckBuilder;
            
            expect(() => {
                appRouter.loadUserDecks();
            }).not.toThrow();
        });
    });

    describe('initializeProductPage', () => {
        test('should log card ID when tcgStore is available', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            await appRouter.initializeProductPage('?id=123');
            
            expect(consoleSpy).toHaveBeenCalledWith('Initializing product page for card:', '123');
            
            consoleSpy.mockRestore();
        });

        test('should handle missing tcgStore gracefully', async () => {
            delete window.tcgStore;
            
            await expect(appRouter.initializeProductPage('?id=123')).resolves.not.toThrow();
        });

        test('should handle missing card ID', async () => {
            await expect(appRouter.initializeProductPage('')).resolves.not.toThrow();
        });

        test('should handle errors gracefully', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            
            // Mock tcgStore to throw error
            window.tcgStore = {
                getCardById: jest.fn().mockRejectedValue(new Error('API Error'))
            };
            
            await appRouter.initializeProductPage('?id=123');
            
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error initializing product page:', expect.any(Error));
            
            consoleErrorSpy.mockRestore();
        });
    });
});

/**
 * Content Generation Tests
 * Tests the HTML content generation methods
 */
describe('Content Generation', () => {
    let appRouter;

    beforeEach(() => {
        document.body.innerHTML = `<div id="main-content"></div>`;
        window.tcgStore = { currentUser: null };
        appRouter = new AppRouter();
    });

    describe('getHomeContent', () => {
        test('should generate home page HTML', () => {
            const content = appRouter.getHomeContent();
            
            expect(content).toContain('Premium Yu-Gi-Oh! Singles');
            expect(content).toContain('Meta Cards & Live Pricing');
            expect(content).toContain('meta-cards-grid');
            expect(content).toContain('navigateTo(\'singles\')');
        });
    });

    describe('getSinglesContent', () => {
        test('should generate singles page HTML', () => {
            const content = appRouter.getSinglesContent();
            
            expect(content).toContain('Yu-Gi-Oh! Single Cards');
            expect(content).toContain('filters-container');
            expect(content).toContain('cards-grid');
            expect(content).toContain('tcgStore.applyFilters()');
        });
    });

    describe('getDecksContent', () => {
        test('should generate decks page HTML', () => {
            const content = appRouter.getDecksContent();
            
            expect(content).toContain('Deck Editor');
            expect(content).toContain('showMyDecks()');
            expect(content).toContain('showDeckBuilder()');
            expect(content).toContain('showPopularDecks()');
            expect(content).toContain('user-decks-grid');
        });
    });

    describe('getEventsContent', () => {
        test('should generate events page HTML', () => {
            const content = appRouter.getEventsContent();
            
            expect(content).toContain('Yu-Gi-Oh! Events & Tournaments');
            expect(content).toContain('competitive community');
        });
    });

    describe('getAccountContent', () => {
        test('should generate login prompt for non-logged-in user', () => {
            window.tcgStore.currentUser = null;
            const content = appRouter.getAccountContent();
            
            expect(content).toContain('Sign In Required');
            expect(content).toContain('tcgStore.openLoginModal()');
            expect(content).toContain('tcgStore.openRegisterModal()');
        });

        test('should generate welcome message for logged-in user', () => {
            window.tcgStore.currentUser = {
                firstName: 'John',
                createdAt: '2024-01-01T00:00:00Z'
            };
            const content = appRouter.getAccountContent();
            
            expect(content).toContain('Welcome back, John!');
            expect(content).toContain('Member since');
        });
    });

    describe('generateProductHTML', () => {
        test('should generate product page HTML', () => {
            const mockCard = {
                id: 123,
                name: 'Test Card',
                type: 'Effect Monster',
                desc: 'Test description',
                card_images: [{
                    image_url: 'https://example.com/card.jpg'
                }]
            };

            const content = appRouter.generateProductHTML(mockCard);
            
            expect(content).toContain('Test Card');
            expect(content).toContain('Effect Monster');
            expect(content).toContain('Test description');
            expect(content).toContain('https://example.com/card.jpg');
            expect(content).toContain('addProductToCart');
            expect(content).toContain('navigateTo(\'home\')');
            expect(content).toContain('navigateTo(\'singles\')');
        });

        test('should handle missing card images', () => {
            const mockCard = {
                id: 123,
                name: 'Test Card',
                type: 'Effect Monster',
                desc: 'Test description',
                card_images: null
            };

            const content = appRouter.generateProductHTML(mockCard);
            
            expect(content).toContain('https://images.ygoprodeck.com/images/cards/back.jpg');
        });

        test('should handle empty card images array', () => {
            const mockCard = {
                id: 123,
                name: 'Test Card',
                type: 'Effect Monster',
                desc: 'Test description',
                card_images: []
            };

            const content = appRouter.generateProductHTML(mockCard);
            
            expect(content).toContain('https://images.ygoprodeck.com/images/cards/back.jpg');
        });
    });

    describe('Policy Pages Content', () => {
        test('should generate shipping policy content', () => {
            const content = appRouter.getShippingPolicyContent();
            
            expect(content).toContain('Shipping Policy');
            expect(content).toContain('Fast, reliable shipping');
        });

        test('should generate return policy content', () => {
            const content = appRouter.getReturnPolicyContent();
            
            expect(content).toContain('Return Policy');
            expect(content).toContain('Your satisfaction is our priority');
        });

        test('should generate FAQ content', () => {
            const content = appRouter.getFAQContent();
            
            expect(content).toContain('Frequently Asked Questions');
            expect(content).toContain('Find answers to common questions');
        });
    });
});
