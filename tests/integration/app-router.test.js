/**
 * Integration Tests for App Router
 * Tests dynamic page loading, navigation, and core functionality
 */

describe('AppRouter Integration Tests', () => {
    let appRouter;
    let mockMainContent;

    beforeEach(() => {
        // Setup DOM
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

        mockMainContent = document.getElementById('main-content');
        
        // Mock fetch for template loading
        global.fetch = jest.fn();
        
        // Mock window.tcgStore
        window.tcgStore = {
            currentUser: null,
            loadInitialData: jest.fn(),
            applyFilters: jest.fn()
        };

        // Mock window.deckBuilder
        window.deckBuilder = {
            getSavedDecks: jest.fn(() => ({})),
            newDeck: jest.fn()
        };

        // Clear location hash
        window.location.hash = '';
        
        // Initialize router
        appRouter = new AppRouter();
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete window.tcgStore;
        delete window.deckBuilder;
    });

    describe('Router Initialization', () => {
        test('should initialize with default home page', () => {
            expect(appRouter.currentPage).toBe('home');
            expect(mockMainContent.innerHTML).toContain('Premium Yu-Gi-Oh! Singles');
        });

        test('should load page from URL hash', () => {
            window.location.hash = '#page=singles';
            const newRouter = new AppRouter();
            expect(newRouter.currentPage).toBe('singles');
        });

        test('should handle invalid page names gracefully', () => {
            window.location.hash = '#page=invalid-page';
            const newRouter = new AppRouter();
            expect(newRouter.currentPage).toBe('home');
        });
    });

    describe('Page Loading', () => {
        test('should load home page content', async () => {
            await appRouter.loadPage('home');
            
            expect(mockMainContent.innerHTML).toContain('Premium Yu-Gi-Oh! Singles');
            expect(mockMainContent.innerHTML).toContain('Meta Cards & Live Pricing');
            expect(document.getElementById('page-title').textContent).toContain('Firelight Duel Academy');
        });

        test('should load singles page content', async () => {
            await appRouter.loadPage('singles');
            
            expect(mockMainContent.innerHTML).toContain('Yu-Gi-Oh! Single Cards');
            expect(mockMainContent.innerHTML).toContain('filters-container');
            expect(mockMainContent.innerHTML).toContain('cards-grid');
        });

        test('should load decks page content', async () => {
            await appRouter.loadPage('decks');
            
            expect(mockMainContent.innerHTML).toContain('Deck Editor');
            expect(mockMainContent.innerHTML).toContain('my-decks-btn');
            expect(mockMainContent.innerHTML).toContain('builder-btn');
        });

        test('should load account page for non-logged-in user', async () => {
            window.tcgStore.currentUser = null;
            await appRouter.loadPage('account');
            
            expect(mockMainContent.innerHTML).toContain('Sign In Required');
            expect(mockMainContent.innerHTML).toContain('tcgStore.openLoginModal()');
        });

        test('should load account page for logged-in user', async () => {
            window.tcgStore.currentUser = {
                firstName: 'John',
                createdAt: '2024-01-01T00:00:00Z'
            };
            await appRouter.loadPage('account');
            
            expect(mockMainContent.innerHTML).toContain('Welcome back, John!');
            expect(mockMainContent.innerHTML).toContain('Member since');
        });
    });

    describe('Template Loading', () => {
        test('should attempt to load from template file first', async () => {
            const mockTemplate = '<div>Template Content</div>';
            fetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(mockTemplate)
            });

            await appRouter.loadPage('home');
            
            expect(fetch).toHaveBeenCalledWith('templates/home.html');
            expect(mockMainContent.innerHTML).toBe(mockTemplate);
        });

        test('should fallback to generated content when template fails', async () => {
            fetch.mockRejectedValueOnce(new Error('Template not found'));

            await appRouter.loadPage('home');
            
            expect(fetch).toHaveBeenCalledWith('templates/home.html');
            expect(mockMainContent.innerHTML).toContain('Premium Yu-Gi-Oh! Singles');
        });

        test('should cache static content', async () => {
            const mockTemplate = '<div>Cached Template</div>';
            fetch.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(mockTemplate)
            });

            // First load
            await appRouter.loadPage('home');
            expect(fetch).toHaveBeenCalledTimes(1);

            // Second load should use cache
            await appRouter.loadPage('home');
            expect(fetch).toHaveBeenCalledTimes(1); // Still only called once
            expect(mockMainContent.innerHTML).toBe(mockTemplate);
        });
    });

    describe('Product Page Loading', () => {
        test('should load product page with valid card ID', async () => {
            const mockCard = {
                id: 89631139,
                name: 'Snake-Eye Ash',
                type: 'Effect Monster',
                desc: 'A powerful monster card',
                card_images: [{
                    image_url: 'https://example.com/card.jpg'
                }]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: [mockCard] })
            });

            await appRouter.loadPage('product', true, '?id=89631139');
            
            expect(fetch).toHaveBeenCalledWith('https://db.ygoprodeck.com/api/v7/cardinfo.php?id=89631139');
            expect(mockMainContent.innerHTML).toContain('Snake-Eye Ash');
            expect(mockMainContent.innerHTML).toContain('Effect Monster');
        });

        test('should handle card not found', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: null })
            });

            await appRouter.loadPage('product', true, '?id=999999');
            
            expect(mockMainContent.innerHTML).toContain('Card not found in database');
            expect(mockMainContent.innerHTML).toContain('Browse All Cards');
        });

        test('should handle missing card ID', async () => {
            await appRouter.loadPage('product', true, '');
            
            expect(mockMainContent.innerHTML).toContain('Card ID not provided');
            expect(mockMainContent.innerHTML).toContain('Browse All Cards');
        });

        test('should handle API errors gracefully', async () => {
            fetch.mockRejectedValueOnce(new Error('API Error'));

            await appRouter.loadPage('product', true, '?id=89631139');
            
            expect(mockMainContent.innerHTML).toContain('Error loading card');
        });
    });

    describe('Navigation Updates', () => {
        test('should update active navigation link', async () => {
            await appRouter.loadPage('singles');
            
            const homeLink = document.getElementById('nav-home');
            const singlesLink = document.getElementById('nav-singles');
            
            expect(homeLink.classList.contains('active')).toBe(false);
            expect(singlesLink.classList.contains('active')).toBe(true);
        });

        test('should update page metadata', async () => {
            await appRouter.loadPage('singles');
            
            const title = document.getElementById('page-title');
            const description = document.getElementById('page-description');
            
            expect(title.textContent).toContain('Singles | Firelight Duel Academy');
            expect(description.getAttribute('content')).toContain('Browse our extensive collection');
        });
    });

    describe('URL Management', () => {
        test('should update URL on page navigation', async () => {
            const pushStateSpy = jest.spyOn(history, 'pushState');
            
            await appRouter.loadPage('singles', true);
            
            expect(pushStateSpy).toHaveBeenCalledWith(
                { page: 'singles', params: '' },
                '',
                '#page=singles'
            );
        });

        test('should not update URL when pushState is false', async () => {
            const pushStateSpy = jest.spyOn(history, 'pushState');
            
            await appRouter.loadPage('singles', false);
            
            expect(pushStateSpy).not.toHaveBeenCalled();
        });

        test('should handle browser back/forward buttons', () => {
            const loadPageSpy = jest.spyOn(appRouter, 'loadPage');
            
            // Simulate popstate event
            const popstateEvent = new PopStateEvent('popstate', {
                state: { page: 'decks' }
            });
            window.dispatchEvent(popstateEvent);
            
            expect(loadPageSpy).toHaveBeenCalledWith('decks', false);
        });
    });

    describe('Page-Specific Functionality', () => {
        test('should initialize tcgStore on home page', async () => {
            await appRouter.loadPage('home');
            
            expect(window.tcgStore.loadInitialData).toHaveBeenCalled();
        });

        test('should initialize tcgStore on singles page', async () => {
            await appRouter.loadPage('singles');
            
            expect(window.tcgStore.loadInitialData).toHaveBeenCalled();
        });

        test('should initialize deck functionality on decks page', async () => {
            await appRouter.loadPage('decks');
            
            // Should attempt to load user decks
            expect(window.deckBuilder.getSavedDecks).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        test('should show loading state during page load', async () => {
            const loadPromise = appRouter.loadPage('home');
            
            // Check loading state is shown immediately
            expect(mockMainContent.innerHTML).toContain('loading-spinner');
            expect(mockMainContent.innerHTML).toContain('Loading...');
            
            await loadPromise;
        });

        test('should show error state on load failure', async () => {
            // Mock a failure in content generation
            jest.spyOn(appRouter, 'fetchPageContent').mockRejectedValueOnce(new Error('Load failed'));
            
            await appRouter.loadPage('home');
            
            expect(mockMainContent.innerHTML).toContain('Failed to load page');
        });

        test('should handle missing DOM elements gracefully', () => {
            // Remove main content element
            document.getElementById('main-content').remove();
            
            // Should not throw error
            expect(() => {
                appRouter.showLoading();
                appRouter.showError('Test error');
                appRouter.renderPage('<div>Test</div>');
            }).not.toThrow();
        });
    });

    describe('Global Functions', () => {
        test('navigateTo should call router loadPage', () => {
            window.appRouter = appRouter;
            const loadPageSpy = jest.spyOn(appRouter, 'loadPage');
            
            navigateTo('singles', '?test=1');
            
            expect(loadPageSpy).toHaveBeenCalledWith('singles', true, '?test=1');
        });

        test('deck functions should manipulate DOM correctly', () => {
            // Setup deck page DOM
            document.body.innerHTML += `
                <section id="my-decks-section" style="display: block;"></section>
                <section id="deck-builder-section" style="display: none;"></section>
                <section id="popular-decks-section" style="display: none;"></section>
                <button id="my-decks-btn" class="active"></button>
                <button id="builder-btn"></button>
                <button id="popular-btn"></button>
            `;

            showDeckBuilder();

            expect(document.getElementById('my-decks-section').style.display).toBe('none');
            expect(document.getElementById('deck-builder-section').style.display).toBe('block');
            expect(document.getElementById('popular-decks-section').style.display).toBe('none');
            
            expect(document.getElementById('my-decks-btn').classList.contains('active')).toBe(false);
            expect(document.getElementById('builder-btn').classList.contains('active')).toBe(true);
            expect(document.getElementById('popular-btn').classList.contains('active')).toBe(false);
        });

        test('createNewDeck should call deckBuilder methods', () => {
            window.deckBuilder = {
                newDeck: jest.fn()
            };

            createNewDeck();

            expect(window.deckBuilder.newDeck).toHaveBeenCalled();
        });
    });

    describe('Performance', () => {
        test('should not reload cached content unnecessarily', async () => {
            const generateContentSpy = jest.spyOn(appRouter, 'generatePageContent');
            
            // First load
            await appRouter.loadPage('home');
            const firstCallCount = generateContentSpy.mock.calls.length;
            
            // Second load of same page
            await appRouter.loadPage('home');
            const secondCallCount = generateContentSpy.mock.calls.length;
            
            // Should use cached content for static pages
            expect(secondCallCount).toBe(firstCallCount);
        });

        test('should always regenerate product pages', async () => {
            const generateProductSpy = jest.spyOn(appRouter, 'generateProductContent');
            
            fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ 
                    data: [{ 
                        id: 1, 
                        name: 'Test Card', 
                        type: 'Monster',
                        card_images: [{ image_url: 'test.jpg' }]
                    }] 
                })
            });

            // First load
            await appRouter.loadPage('product', true, '?id=1');
            expect(generateProductSpy).toHaveBeenCalledTimes(1);
            
            // Second load should regenerate
            await appRouter.loadPage('product', true, '?id=1');
            expect(generateProductSpy).toHaveBeenCalledTimes(2);
        });
    });
});

/**
 * End-to-End Navigation Tests
 * Tests complete user navigation flows
 */
describe('Navigation Flow Tests', () => {
    let appRouter;

    beforeEach(() => {
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

        window.tcgStore = {
            currentUser: null,
            loadInitialData: jest.fn()
        };

        window.deckBuilder = {
            getSavedDecks: jest.fn(() => ({}))
        };

        global.fetch = jest.fn();
        appRouter = new AppRouter();
        window.appRouter = appRouter;
    });

    test('should handle complete user journey: Home -> Singles -> Product -> Back', async () => {
        // Start at home
        expect(appRouter.currentPage).toBe('home');
        expect(document.getElementById('main-content').innerHTML).toContain('Premium Yu-Gi-Oh! Singles');

        // Navigate to singles
        await navigateTo('singles');
        expect(appRouter.currentPage).toBe('singles');
        expect(document.getElementById('main-content').innerHTML).toContain('Yu-Gi-Oh! Single Cards');

        // Navigate to product
        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ 
                data: [{ 
                    id: 89631139, 
                    name: 'Snake-Eye Ash', 
                    type: 'Effect Monster',
                    desc: 'Test description',
                    card_images: [{ image_url: 'test.jpg' }]
                }] 
            })
        });

        await navigateTo('product', '?id=89631139');
        expect(appRouter.currentPage).toBe('product');
        expect(document.getElementById('main-content').innerHTML).toContain('Snake-Eye Ash');

        // Simulate browser back
        const popstateEvent = new PopStateEvent('popstate', {
            state: { page: 'singles' }
        });
        window.dispatchEvent(popstateEvent);
        
        expect(appRouter.currentPage).toBe('singles');
    });

    test('should handle account access flow', async () => {
        // Try to access account without login
        await navigateTo('account');
        expect(document.getElementById('main-content').innerHTML).toContain('Sign In Required');

        // Simulate login
        window.tcgStore.currentUser = {
            firstName: 'John',
            createdAt: '2024-01-01T00:00:00Z'
        };

        // Access account after login
        await navigateTo('account');
        expect(document.getElementById('main-content').innerHTML).toContain('Welcome back, John!');
    });

    test('should handle deck management flow', async () => {
        // Navigate to decks page
        await navigateTo('decks');
        expect(document.getElementById('main-content').innerHTML).toContain('Deck Editor');

        // Should show empty state initially
        expect(document.getElementById('main-content').innerHTML).toContain('No Decks Yet');
    });
});
