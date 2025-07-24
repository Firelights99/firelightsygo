/**
 * Console Cleanup Script
 * Removes excessive console logging and fixes common console issues
 */

const fs = require('fs');
const path = require('path');

// Files to clean up
const filesToClean = [
    'assets/js/modern-tcg-store.js',
    'assets/js/app-router.js',
    'assets/js/database-init.js',
    'assets/js/services/database-service.js',
    'assets/js/services/database-service-production.js',
    'assets/js/pages/product.js',
    'assets/js/pages/singles.js',
    'assets/js/pages/home.js'
];

// Console statements to remove (keep errors and important warnings)
const consoleStatementsToRemove = [
    /console\.log\(['"`]🔧.*?\);?\s*$/gm,
    /console\.log\(['"`]✅.*?\);?\s*$/gm,
    /console\.log\(['"`]🔄.*?\);?\s*$/gm,
    /console\.log\(['"`]📊.*?\);?\s*$/gm,
    /console\.log\(['"`]📝.*?\);?\s*$/gm,
    /console\.log\(['"`]🎯.*?\);?\s*$/gm,
    /console\.log\(['"`]🧪.*?\);?\s*$/gm,
    /console\.log\(['"`]Navigating to product from search.*?\);?\s*$/gm,
    /console\.log\(['"`]Performing navigation to.*?\);?\s*$/gm,
    /console\.log\(['"`]Using global navigateTo function.*?\);?\s*$/gm,
    /console\.log\(['"`]Using window\.navigateTo function.*?\);?\s*$/gm,
    /console\.log\(['"`]Using window\.appRouter\.loadPage.*?\);?\s*$/gm,
    /console\.log\(['"`]AppRouter available on retry.*?\);?\s*$/gm,
    /console\.log\(['"`]Global navigateTo available on retry.*?\);?\s*$/gm,
    /console\.log\(['"`]Navigation methods not immediately available.*?\);?\s*$/gm,
    /console\.log\(['"`]Found elements.*?\);?\s*$/gm,
    /console\.log\(['"`]Updating price from.*?\);?\s*$/gm,
    /console\.log\(['"`]Current rarity badge.*?\);?\s*$/gm,
    /console\.log\(['"`]Updating rarity badge from.*?\);?\s*$/gm,
    /console\.log\(['"`]Setting rarity color to.*?\);?\s*$/gm,
    /console\.log\(['"`]Updated add to cart button.*?\);?\s*$/gm,
    /console\.log\(['"`]✅ Rarity badge updated.*?\);?\s*$/gm,
    /console\.log\(['"`]Added to cart.*?\);?\s*$/gm,
    /console\.log\(['"`]Cart data cleared for fresh start.*?\);?\s*$/gm
];

// Console statements to keep (errors, important warnings)
const keepStatements = [
    /console\.error/,
    /console\.warn.*?(?:Error|Failed|Cannot|Invalid|Missing)/
];

function cleanFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let originalLength = content.length;
        let removedCount = 0;

        // Remove excessive console.log statements
        consoleStatementsToRemove.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                removedCount += matches.length;
                content = content.replace(pattern, '');
            }
        });

        // Clean up empty lines left by removed console statements
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

        // Write back if changes were made
        if (content.length !== originalLength) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Cleaned ${filePath}: Removed ${removedCount} console statements`);
        } else {
            console.log(`✓ ${filePath}: No changes needed`);
        }

    } catch (error) {
        console.error(`Error cleaning ${filePath}:`, error.message);
    }
}

function main() {
    console.log('🧹 Starting console cleanup...\n');

    filesToClean.forEach(file => {
        cleanFile(file);
    });

    console.log('\n✅ Console cleanup completed!');
    console.log('\nRemaining console statements should be:');
    console.log('- console.error() for actual errors');
    console.log('- console.warn() for important warnings');
    console.log('- Essential debugging information');
}

if (require.main === module) {
    main();
}

module.exports = { cleanFile, main };
