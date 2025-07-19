# 🚀 Complete Production Setup Guide
## Firelight Duel Academy - Frontend, Backend & Database Integration

This guide shows you exactly where your data will be stored and how to connect everything for production.

## 📊 Current State Analysis

### ❌ What's Currently Happening
- **Frontend**: Using `localStorage` (browser storage) - data disappears when browser is cleared
- **Backend**: Created but not connected
- **Database**: MySQL schema exists but no actual database is running
- **Integration**: Frontend and backend are not connected

### ✅ What We Need to Achieve
- **Frontend**: Connect to real backend API
- **Backend**: Running on server with MySQL database
- **Database**: Actual MySQL database storing all data
- **Integration**: Complete end-to-end data flow

## 🗄️ Where Your Data Will Actually Be Stored

### Production Database Location Options

#### Option 1: Self-Hosted MySQL Database
```
📍 Location: Your own server/VPS
💾 Storage: /var/lib/mysql/ (Linux) or custom directory
🔒 Access: Direct database connection
💰 Cost: Server costs only
```

#### Option 2: Cloud Database (Recommended)
```
📍 Location: Cloud provider (AWS RDS, Google Cloud SQL, etc.)
💾 Storage: Managed cloud storage with backups
🔒 Access: Secure connection strings
💰 Cost: Pay-per-use, includes backups and scaling
```

#### Option 3: Database-as-a-Service
```
📍 Location: PlanetScale, Railway, Heroku Postgres, etc.
💾 Storage: Fully managed with automatic backups
🔒 Access: Connection URLs provided
💰 Cost: Usually free tier available
```

## 🔧 Step-by-Step Production Setup

### Step 1: Choose Your Database Location

#### Option A: PlanetScale (Recommended for beginners)
```bash
# 1. Sign up at planetscale.com
# 2. Create new database: firelight-duel-academy
# 3. Get connection string like:
# mysql://username:password@host:3306/firelight_duel_academy
```

#### Option B: Railway (Full-stack deployment)
```bash
# 1. Sign up at railway.app
# 2. Deploy MySQL service
# 3. Deploy Node.js backend
# 4. Get database URL automatically
```

#### Option C: Traditional VPS
```bash
# 1. Get VPS (DigitalOcean, Linode, etc.)
# 2. Install MySQL
sudo apt update
sudo apt install mysql-server
mysql_secure_installation

# 3. Create database
mysql -u root -p
CREATE DATABASE firelight_duel_academy;
CREATE USER 'firelight_user'@'%' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON firelight_duel_academy.* TO 'firelight_user'@'%';
FLUSH PRIVILEGES;
```

### Step 2: Set Up the Database Schema

```bash
# Import the existing schema
mysql -u firelight_user -p firelight_duel_academy < data/database-schema.sql

# Verify tables were created
mysql -u firelight_user -p firelight_duel_academy -e "SHOW TABLES;"
```

**Expected Output:**
```
+--------------------------------+
| Tables_in_firelight_duel_academy |
+--------------------------------+
| analytics_events               |
| categories                     |
| coupons                        |
| inventory_transactions         |
| membership_plans               |
| order_items                    |
| orders                         |
| product_images                 |
| products                       |
| reviews                        |
| shopping_cart                  |
| site_settings                  |
| user_memberships               |
| users                          |
+--------------------------------+
```

### Step 3: Deploy the Backend

#### Option A: Railway Deployment
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and deploy
cd backend
railway login
railway init
railway up

# 3. Add environment variables in Railway dashboard
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=firelight_duel_academy
JWT_SECRET=your_super_secret_key
```

#### Option B: Heroku Deployment
```bash
# 1. Install Heroku CLI
npm install -g heroku

# 2. Create app and deploy
cd backend
heroku create firelight-api
heroku addons:create jawsdb:kitefin  # MySQL addon

# 3. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_super_secret_key

# 4. Deploy
git add .
git commit -m "Deploy backend"
git push heroku main
```

#### Option C: VPS Deployment
```bash
# 1. Copy backend to server
scp -r backend/ user@your-server:/var/www/firelight-api/

# 2. Install dependencies and start
cd /var/www/firelight-api
npm install --production

# 3. Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_USER=firelight_user
DB_PASSWORD=your_secure_password
DB_NAME=firelight_duel_academy
PORT=3001
NODE_ENV=production
JWT_SECRET=your_super_secret_key
FRONTEND_URL=https://firelights99.github.io
ALLOWED_ORIGINS=https://firelights99.github.io
EOF

# 4. Start with PM2
npm install -g pm2
pm2 start server.js --name firelight-api
pm2 startup
pm2 save
```

### Step 4: Update Frontend to Use Production Database

Replace the database service in your HTML:

```html
<!-- In app.html, replace the database service script -->
<!-- OLD: -->
<script src="assets/js/services/database-service.js"></script>

<!-- NEW: -->
<script src="assets/js/services/database-service-production.js"></script>
```

### Step 5: Configure API URL

Update the API URL in the production database service:

```javascript
// In assets/js/services/database-service-production.js
getApiBaseURL() {
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:3001/api/v1';
    } else {
        // UPDATE THIS with your actual backend URL
        return 'https://your-backend-url.com/api/v1';
        // Examples:
        // return 'https://firelight-api.railway.app/api/v1';
        // return 'https://firelight-api.herokuapp.com/api/v1';
        // return 'https://api.firelightduelacademy.com/api/v1';
    }
}
```

## 🔄 Data Flow in Production

### Before (localStorage):
```
User Action → Frontend → localStorage (browser) → Lost when browser cleared
```

### After (Production):
```
User Action → Frontend → Backend API → MySQL Database → Persistent storage
```

### Example User Registration Flow:
```
1. User fills registration form
2. Frontend sends POST to /api/v1/auth/register
3. Backend validates data
4. Backend hashes password with bcrypt
5. Backend saves to MySQL users table
6. Backend returns JWT token
7. Frontend stores token for future requests
8. User data is permanently stored in database
```

## 📍 Exact Database Storage Locations

### User Data
```sql
-- Stored in: users table
SELECT * FROM users WHERE email = 'user@example.com';
-- Contains: id, email, password_hash, first_name, last_name, phone, created_at, etc.
```

### Orders
```sql
-- Stored in: orders and order_items tables
SELECT o.*, oi.* FROM orders o 
JOIN order_items oi ON o.id = oi.order_id 
WHERE o.user_id = 123;
-- Contains: order details, items, pricing, shipping info
```

### Shopping Cart
```sql
-- Stored in: shopping_cart table
SELECT sc.*, p.name, p.price FROM shopping_cart sc
JOIN products p ON sc.product_id = p.id
WHERE sc.user_id = 123;
-- Contains: cart items, quantities, user/session association
```

### Products/Inventory
```sql
-- Stored in: products, product_images, inventory_transactions tables
SELECT * FROM products WHERE is_active = 1;
-- Contains: product details, pricing, stock levels, images
```

## 🧪 Testing the Integration

### 1. Test Backend Health
```bash
curl https://your-backend-url.com/health
# Should return: {"status":"healthy","timestamp":"..."}
```

### 2. Test Database Connection
```bash
curl -X POST https://your-backend-url.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
# Should return: {"success":true,"data":{"user":{...},"token":"..."}}
```

### 3. Test Frontend Integration
```javascript
// Open browser console on your site
window.dbService.healthCheck().then(console.log);
// Should show backend connection status
```

## 🔧 Troubleshooting Common Issues

### Issue: "Backend connection failed"
```bash
# Check if backend is running
curl https://your-backend-url.com/health

# Check CORS settings in backend/.env
ALLOWED_ORIGINS=https://firelights99.github.io

# Check frontend API URL
console.log(window.dbService.apiBaseURL);
```

### Issue: "Database connection failed"
```bash
# Test database connection
mysql -h your_host -u your_user -p your_database

# Check backend logs
pm2 logs firelight-api  # If using PM2
heroku logs --tail      # If using Heroku
```

### Issue: "Authentication not working"
```bash
# Check JWT secret is set
echo $JWT_SECRET

# Check token in browser
localStorage.getItem('auth-token')

# Test token verification
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-backend-url.com/api/v1/auth/verify
```

## 📊 Monitoring Your Production Database

### Database Size Monitoring
```sql
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'firelight_duel_academy';
```

### User Activity Monitoring
```sql
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_orders FROM orders;
SELECT COUNT(*) as active_carts FROM shopping_cart WHERE updated_at > DATE_SUB(NOW(), INTERVAL 1 DAY);
```

### Performance Monitoring
```sql
SHOW PROCESSLIST;  -- See active connections
SHOW STATUS LIKE 'Threads_connected';  -- Connection count
```

## 🔄 Migration from localStorage to Database

### Automatic Migration (when users first visit)
The production database service will:
1. Check if user has localStorage data
2. Prompt to migrate existing cart/wishlist
3. Transfer data to backend via API
4. Clear localStorage after successful migration

### Manual Migration (for testing)
```javascript
// Export localStorage data
const oldData = {
    users: localStorage.getItem('tcg-users'),
    orders: localStorage.getItem('tcg-orders'),
    cart: localStorage.getItem('tcg-cart')
};

// Import to new system (would need custom migration endpoint)
console.log('Data to migrate:', oldData);
```

## 🎯 Final Checklist

- [ ] Database created and schema imported
- [ ] Backend deployed and running
- [ ] Environment variables configured
- [ ] Frontend updated to use production service
- [ ] API URL configured correctly
- [ ] CORS settings allow frontend domain
- [ ] SSL certificates configured (HTTPS)
- [ ] Database backups configured
- [ ] Monitoring and logging set up

## 📞 Support

If you need help with any step:
1. Check the backend logs for error messages
2. Test each component individually (database → backend → frontend)
3. Use browser developer tools to check network requests
4. Verify all environment variables are set correctly

Your data will be stored in a real MySQL database, accessible via the backend API, with proper authentication and security measures in place!
