# App Router Testing Suite

This directory contains comprehensive integration and unit tests for the Harrison Website's Single Page Application (SPA) router.

## Overview

The testing suite ensures that the app router functions correctly with:
- Dynamic page loading
- Navigation state management
- URL handling and browser history
- Template loading with fallbacks
- Error handling and edge cases
- Product page API integration
- User authentication flows

## Test Structure

```
tests/
├── integration/           # Integration tests
│   └── app-router.test.js # Full router functionality tests
├── unit/                  # Unit tests
│   └── router-utils.test.js # Individual method tests
├── jest.config.js         # Jest configuration
├── setup.js              # Test setup and mocks
├── package.json          # Test dependencies
└── README.md             # This file
```

## Key Improvements Made

### 1. Fixed App Router Issues
- **Removed unreachable code**: Eliminated thousands of lines of inline HTML
- **Improved separation of concerns**: HTML content now generated dynamically
- **Fixed dynamic page loading**: Proper template loading with fallbacks
- **Better error handling**: Graceful error states and fallbacks
- **Cleaner architecture**: More maintainable and modular code

### 2. Comprehensive Test Coverage
- **Router initialization** and URL parsing
- **Page loading** with template fallbacks
- **Navigation updates** and active states
- **Product page loading** with API integration
- **Error handling** and edge cases
- **Performance optimizations** and caching
- **End-to-end user flows**

## Running Tests

### Prerequisites
```bash
cd tests
npm install
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run only integration tests
npm run test:integration

# Run only unit tests
npm run test:unit

# Run tests for CI/CD
npm run test:ci
```

## Test Categories

### Integration Tests (`integration/app-router.test.js`)

Tests complete router functionality including:

- **Router Initialization**
  - Default home page loading
  - URL hash parsing
  - Invalid page handling

- **Page Loading**
  - All page types (home, singles, decks, account, product)
  - Template loading with fallbacks
  - Content caching

- **Product Page Loading**
  - Valid card ID handling
  - API error handling
  - Missing card ID scenarios

- **Navigation Updates**
  - Active link management
  - Metadata updates
  - URL state management

- **End-to-End Flows**
  - Complete user journeys
  - Account access flows
  - Browser back/forward handling

### Unit Tests (`unit/router-utils.test.js`)

Tests individual router methods:

- **URL Parsing**
  - Hash parameter extraction
  - Complex URL handling
  - Edge cases

- **DOM Manipulation**
  - Loading states
  - Error displays
  - Content rendering

- **Page Initialization**
  - Script execution
  - Dependency handling
  - Error recovery

- **Content Generation**
  - HTML template generation
  - Dynamic content creation
  - User state handling

## Test Utilities

The test suite includes comprehensive utilities in `setup.js`:

### Global Mocks
- `fetch` API for HTTP requests
- `localStorage` and `sessionStorage`
- Browser APIs (`history`, `location`)
- DOM APIs and observers

### Test Helpers
- `testUtils.createMockCard()` - Generate mock card data
- `testUtils.createMockDOM()` - Set up test DOM
- `testUtils.mockFetchResponse()` - Mock API responses
- `testUtils.waitFor()` - Handle async operations

### Example Usage

```javascript
describe('My Test', () => {
    beforeEach(() => {
        testUtils.createMockDOM();
        window.tcgStore = { currentUser: null };
    });

    test('should load product page', async () => {
        const mockCard = testUtils.createMockCard({
            name: 'Custom Card Name'
        });
        
        testUtils.mockFetchResponse({ data: [mockCard] });
        
        await appRouter.loadPage('product', true, '?id=123');
        
        expect(document.getElementById('main-content').innerHTML)
            .toContain('Custom Card Name');
    });
});
```

## Coverage Goals

The test suite aims for:
- **90%+ line coverage** of app-router.js
- **100% function coverage** of public methods
- **100% branch coverage** of error handling
- **Complete integration coverage** of user flows

## Continuous Integration

Tests are configured to run in CI/CD with:
- Automated test execution on pull requests
- Coverage reporting and thresholds
- Performance regression detection
- Cross-browser compatibility checks

## Performance Testing

The suite includes performance tests for:
- Page load times
- Memory usage during navigation
- Cache effectiveness
- API response handling

## Debugging Tests

### Common Issues

1. **DOM not found errors**
   ```javascript
   // Ensure DOM is set up
   beforeEach(() => {
       testUtils.createMockDOM();
   });
   ```

2. **Async timing issues**
   ```javascript
   // Wait for async operations
   await testUtils.waitFor(100);
   ```

3. **Mock not working**
   ```javascript
   // Clear mocks between tests
   afterEach(() => {
       jest.clearAllMocks();
   });
   ```

### Debug Mode

Run tests with debug output:
```bash
npm test -- --verbose --no-coverage
```

## Contributing

When adding new router functionality:

1. **Add corresponding tests** for new methods
2. **Update integration tests** for new user flows
3. **Maintain coverage thresholds** (90%+)
4. **Document test scenarios** in comments
5. **Use descriptive test names** that explain the scenario

### Test Naming Convention

```javascript
describe('FeatureName', () => {
    describe('specific functionality', () => {
        test('should do something when condition is met', () => {
            // Test implementation
        });
        
        test('should handle error when invalid input provided', () => {
            // Error handling test
        });
    });
});
```

## Future Enhancements

Planned testing improvements:
- Visual regression testing
- Accessibility testing
- Mobile responsiveness tests
- Load testing for high traffic
- Security testing for XSS prevention

## Troubleshooting

### Common Test Failures

1. **Template loading failures**
   - Check mock fetch responses
   - Verify template paths in routes config

2. **Navigation state issues**
   - Ensure DOM elements exist before testing
   - Check for proper cleanup between tests

3. **API integration problems**
   - Verify mock API responses match expected format
   - Check error handling for network failures

### Getting Help

- Check test output for specific error messages
- Review the test setup in `setup.js`
- Examine similar working tests for patterns
- Run tests individually to isolate issues

---

This testing suite ensures the app router is robust, maintainable, and functions correctly across all user scenarios.
