/**
 * Switch to Production Database Script
 * Run this to switch from localStorage to production database
 */

// Configuration
const PRODUCTION_API_URL = 'https://your-backend-url.com/api/v1'; // UPDATE THIS!

function switchToProduction() {
    console.log('🔄 Switching to Production Database Mode...');
    
    // 1. Update app.html to use production database service
    updateAppHtml();
    
    // 2. Update API URL in production service
    updateApiUrl();
    
    // 3. Test connection
    testConnection();
    
    console.log('✅ Production mode activated!');
    console.log('📝 Next steps:');
    console.log('1. Deploy your backend to a server');
    console.log('2. Update PRODUCTION_API_URL in this script');
    console.log('3. Run this script again');
    console.log('4. Test your website');
}

function updateAppHtml() {
    console.log('📝 Instructions to update app.html:');
    console.log('Replace this line:');
    console.log('  <script src="assets/js/services/database-service.js"></script>');
    console.log('With this line:');
    console.log('  <script src="assets/js/services/database-service-production.js"></script>');
}

function updateApiUrl() {
    console.log('📝 Instructions to update API URL:');
    console.log('1. Open assets/js/services/database-service-production.js');
    console.log('2. Find the getApiBaseURL() method');
    console.log('3. Replace "https://your-api-domain.com/api/v1" with your actual backend URL');
    console.log(`   Example: "${PRODUCTION_API_URL}"`);
}

async function testConnection() {
    try {
        console.log('🧪 Testing connection to:', PRODUCTION_API_URL);
        const healthUrl = PRODUCTION_API_URL.replace('/api/v1', '/health');
        const response = await fetch(healthUrl);
        
        if (response.ok) {
            const health = await response.json();
            console.log('✅ Backend is running:', health);
        } else {
            console.log('❌ Backend not responding. Status:', response.status);
        }
    } catch (error) {
        console.log('❌ Cannot connect to backend:', error.message);
        console.log('💡 Make sure your backend is deployed and running');
    }
}

// Run the switch
switchToProduction();
