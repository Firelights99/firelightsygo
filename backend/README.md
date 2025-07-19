# Firelight Duel Academy - Production Backend

A production-ready Node.js/Express backend for the Firelight Duel Academy Yu-Gi-Oh! TCG store.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **MySQL** 8.0 or higher
- **Redis** (optional, for caching and sessions)
- **Git**

### Installation

1. **Clone and navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database:**
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE firelight_duel_academy;"

# Run migrations
mysql -u root -p firelight_duel_academy < ../data/database-schema.sql
```

5. **Start the server:**
```bash
# Development
npm run dev

# Production
npm start
```

## 📊 Database Setup

### MySQL Configuration

1. **Create database:**
```sql
CREATE DATABASE firelight_duel_academy;
CREATE USER 'firelight_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON firelight_duel_academy.* TO 'firelight_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Import schema:**
```bash
mysql -u firelight_user -p firelight_duel_academy < ../data/database-schema.sql
```

3. **Verify tables:**
```sql
USE firelight_duel_academy;
SHOW TABLES;
```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=firelight_duel_academy
DB_USER=firelight_user
DB_PASSWORD=your_secure_password

# Server
PORT=3001
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_here

# CORS
FRONTEND_URL=https://firelights99.github.io
ALLOWED_ORIGINS=https://firelights99.github.io,http://localhost:3000

# Square Payment
SQUARE_APPLICATION_ID=your_square_app_id
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_ENVIRONMENT=production
```

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `GET /api/v1/auth/verify` - Verify token
- `POST /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/orders` - Get user orders

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get single product

### Cart
- `GET /api/v1/cart` - Get cart contents
- `POST /api/v1/cart/add` - Add item to cart
- `PUT /api/v1/cart/update/:cartId` - Update cart item
- `DELETE /api/v1/cart/remove/:cartId` - Remove cart item
- `DELETE /api/v1/cart/clear` - Clear cart

### Health Check
- `GET /health` - Server health status

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs with configurable rounds
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **Helmet.js** for security headers
- **Input Validation** using express-validator
- **SQL Injection Protection** with parameterized queries

## 📝 Logging

- **Winston Logger** with file and console output
- **Request Logging** with Morgan
- **Error Tracking** with stack traces in development
- **Log Rotation** with configurable file sizes

## 🚀 Deployment Options

### Option 1: Traditional VPS/Server

1. **Server Requirements:**
   - Ubuntu 20.04+ or CentOS 8+
   - 2GB RAM minimum
   - Node.js 18+, MySQL 8+, Nginx

2. **Setup Process:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt update
sudo apt install mysql-server

# Install PM2 for process management
sudo npm install -g pm2

# Clone and setup
git clone <your-repo>
cd backend
npm install --production
cp .env.example .env
# Configure .env

# Start with PM2
pm2 start server.js --name "firelight-api"
pm2 startup
pm2 save
```

3. **Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.firelightduelacademy.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Docker Deployment

1. **Create Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

2. **Docker Compose:**
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: firelight_duel_academy
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

### Option 3: Cloud Platforms

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create firelight-api

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy

## 🔧 Frontend Integration

### Update Frontend Database Service

Replace the localStorage-based database service with API calls:

```javascript
// In assets/js/services/database-service.js
class DatabaseService {
    constructor() {
        this.apiBaseURL = 'https://your-api-domain.com/api/v1';
        this.token = localStorage.getItem('auth-token');
    }

    async authenticateUser(email, password) {
        const response = await fetch(`${this.apiBaseURL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (data.success) {
            this.token = data.data.token;
            localStorage.setItem('auth-token', this.token);
            return data.data.user;
        } else {
            throw new Error(data.error);
        }
    }

    async createUser(userData) {
        const response = await fetch(`${this.apiBaseURL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (data.success) {
            this.token = data.data.token;
            localStorage.setItem('auth-token', this.token);
            return data.data.user;
        } else {
            throw new Error(data.error);
        }
    }

    // Add other API methods...
}
```

## 📊 Monitoring & Maintenance

### Health Monitoring
```bash
# Check server status
curl https://your-api-domain.com/health

# Monitor logs
pm2 logs firelight-api

# Monitor performance
pm2 monit
```

### Database Maintenance
```sql
-- Optimize tables
OPTIMIZE TABLE users, products, orders;

-- Check database size
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'firelight_duel_academy';
```

### Backup Strategy
```bash
# Daily database backup
mysqldump -u firelight_user -p firelight_duel_academy > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u firelight_user -p firelight_duel_academy > $BACKUP_DIR/firelight_$DATE.sql
find $BACKUP_DIR -name "firelight_*.sql" -mtime +7 -delete
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL service: `sudo systemctl status mysql`
   - Verify credentials in .env file
   - Test connection: `mysql -u firelight_user -p`

2. **Port Already in Use**
   - Check running processes: `lsof -i :3001`
   - Kill process: `kill -9 <PID>`
   - Change PORT in .env file

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Clear browser localStorage

4. **CORS Errors**
   - Update ALLOWED_ORIGINS in .env
   - Check frontend URL configuration
   - Verify preflight requests

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development LOG_LEVEL=debug npm run dev

# Database query logging
DEBUG=mysql npm run dev
```

## 📞 Support

For technical support or questions:
- **Email:** dev@firelightduelacademy.com
- **Documentation:** Check the `/docs` folder
- **Issues:** Create GitHub issues for bugs

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
