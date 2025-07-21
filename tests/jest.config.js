/**
 * Jest Configuration for App Router Tests
 */

module.exports = {
    // Test environment
    testEnvironment: 'jsdom',
    
    // Test file patterns
    testMatch: [
        '**/tests/**/*.test.js',
        '**/tests/**/*.spec.js'
    ],
    
    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    
    // Coverage configuration
    collectCoverage: true,
    collectCoverageFrom: [
        'assets/js/app-router.js',
        '!**/node_modules/**',
        '!**/tests/**'
    ],
    coverageDirectory: 'tests/coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    
    // Module paths
    moduleDirectories: ['node_modules', '<rootDir>'],
    
    // Transform files
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    
    // Mock modules
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    
    // Test timeout
    testTimeout: 10000,
    
    // Verbose output
    verbose: true,
    
    // Clear mocks between tests
    clearMocks: true,
    
    // Restore mocks after each test
    restoreMocks: true
};
