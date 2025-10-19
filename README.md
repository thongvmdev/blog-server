# Business Blog Server

Modern, secure REST API for a blog platform with OAuth 2.0 authentication, refresh token rotation, and comprehensive session management.

---

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based with refresh token rotation
- 🚨 **Breach Detection** - Automatic detection of token theft
- 🎫 **Multi-Device Support** - Independent sessions per device
- 🔄 **Token Rotation** - New tokens on every refresh
- 🌐 **OAuth Integration** - Google sign-in support
- 📝 **Blog Management** - Articles, categories, tags, comments
- 🖼️ **Media Upload** - Image handling with Multer
- 👥 **User Management** - Profiles, roles, permissions
- 🧹 **Automatic Cleanup** - MongoDB TTL for inactive sessions

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- MongoDB 5.0+
- Docker (optional)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd business-blog-server

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Environment Variables

```bash
# Server
NODE_ENV=development
PORT=4000

# Database
MONGO_URL=mongodb://localhost:27017/blog

# JWT (use strong secrets!)
JWT_SECRET=your-secret-key-min-64-chars

# Password hashing
PWSECRET=your-password-secret

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
```

### Run Development Server

```bash
# Start MongoDB (if using Docker)
docker-compose -f docker.compose-mongo.yaml up -d

# Run server
pnpm dev

# Server runs on http://localhost:4000
```

### Build for Production

```bash
# Build TypeScript
pnpm build

# Run production server
pnpm start
```

---

## 📚 Documentation

### Authentication System

- **[Complete Authentication Guide](./docs/AUTHENTICATION.md)** - Full documentation on authentication, token rotation, and security
- **[Quick Reference](./docs/QUICK_REFERENCE.md)** - One-page cheat sheet
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[Logout Implementation](./LOGOUT_IMPLEMENTATION.md)** - Session management guide

### Key Features Documentation

| Feature | Description | Status |
|---------|-------------|--------|
| **Token Rotation** | Refresh tokens rotate on every use | ✅ Implemented |
| **Breach Detection** | Automatic detection of token reuse | ✅ Implemented |
| **Multi-Device Sessions** | Independent sessions per device | ✅ Implemented |
| **Automatic Cleanup** | TTL-based session expiration | ✅ Implemented |
| **OAuth Integration** | Google sign-in support | ✅ Implemented |
| **Logout Features** | Single & multi-device logout | ✅ Implemented |

---

## 🏗️ Project Structure

```
business-blog-server/
├── src/
│   ├── config/           # Configuration files
│   │   ├── corsOptions.ts
│   │   ├── dbConnect.ts
│   │   └── env.config.ts
│   ├── controllers/      # Route controllers
│   │   ├── authController.ts      # ⭐ Authentication
│   │   ├── userController.ts
│   │   ├── articleController.ts
│   │   └── ...
│   ├── models/           # Database models
│   │   ├── database/
│   │   │   ├── UserModel.ts
│   │   │   ├── GrantModel.ts      # ⭐ Session tracking
│   │   │   ├── ArticleModel.ts
│   │   │   └── ...
│   │   └── ResponseModel.ts
│   ├── routes/           # API routes
│   │   └── v1Routes/
│   │       ├── authRoutes.ts      # ⭐ Auth endpoints
│   │       └── ...
│   ├── middlewares/      # Express middlewares
│   │   ├── verifyTokenMiddleware.ts
│   │   ├── errorHandlerMiddleware.ts
│   │   └── ...
│   ├── utils/            # Utility functions
│   │   ├── jwt.ts                 # ⭐ Token utilities
│   │   └── ...
│   ├── enums/            # TypeScript enums
│   ├── interfaces/       # TypeScript interfaces
│   │   └── grant.d.ts             # ⭐ Grant interfaces
│   └── server.ts         # Entry point
├── docs/                 # Documentation
│   ├── AUTHENTICATION.md          # ⭐ Complete auth guide
│   ├── QUICK_REFERENCE.md
│   └── README.md
├── tests/                # Test files
├── logs/                 # Application logs
├── uploads/              # Uploaded media
├── Dockerfile
├── docker-compose.yaml
└── package.json
```

---

## 🔌 API Endpoints

### Authentication

```http
POST   /api/v1/auth/register      # Create account
POST   /api/v1/auth/login         # Login
POST   /api/v1/auth/token/refresh # Refresh tokens
POST   /api/v1/auth/logout        # Logout (requires auth)
POST   /api/v1/auth/logout-all    # Logout all devices (requires auth)
```

### Users

```http
GET    /api/v1/users/me           # Get profile (requires auth)
PUT    /api/v1/users/me           # Update profile (requires auth)
PUT    /api/v1/users/password     # Change password (requires auth)
POST   /api/v1/users/avatar       # Upload avatar (requires auth)
```

### Articles

```http
GET    /api/v1/articles           # List articles
GET    /api/v1/articles/:id       # Get article
POST   /api/v1/articles           # Create article (requires auth)
PUT    /api/v1/articles/:id       # Update article (requires auth)
DELETE /api/v1/articles/:id       # Delete article (requires auth)
```

### Categories & Tags

```http
GET    /api/v1/categories         # List categories
POST   /api/v1/categories         # Create category (admin)
GET    /api/v1/tags               # List tags
POST   /api/v1/tags               # Create tag (admin)
```

Full API documentation: See [AUTHENTICATION.md](./docs/AUTHENTICATION.md#api-endpoints)

---

## 🔐 Security Features

### 1. Refresh Token Rotation

Every token refresh invalidates the old token and issues a new one.

**Before (vulnerable):**
```
refreshToken = "abc123"  // Same for 30 days
```

**After (secure):**
```
Day 0: refreshToken = "v1"
Day 1: refreshToken = "v2"  // v1 invalid
Day 2: refreshToken = "v3"  // v2 invalid
```

### 2. Breach Detection

Detects when consumed tokens are reused (indicates theft).

```
User uses token_v1 → marked as consumed
Attacker reuses token_v1 → BREACH DETECTED!
→ Revoke all tokens → Force re-login
```

### 3. Token Hashing

Store SHA-256 hashes, not raw tokens in database.

```typescript
// Stored: "3a5f8c9d..." (64 char hash)
// NOT:    "eyJhbGci..." (200+ char JWT)
```

### 4. Session Management

- Multi-device support (independent sessions)
- Logout from single device or all devices
- Automatic cleanup of inactive sessions (30 days)

Read more: [AUTHENTICATION.md → Security Features](./docs/AUTHENTICATION.md#security-features)

---

## 🧪 Testing

### Manual API Testing

```bash
# 1. Register user
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# 2. Get tokens from response
# 3. Make authenticated requests
curl http://localhost:4000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Automated Tests

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage
```

### Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run tests/load-test.js
```

---

## 🐳 Docker Deployment

### Build and Run

```bash
# Build image
docker build -t blog-server .

# Run with Docker Compose
IMAGE_TAG=$(date +%Y%m%d%H%M) docker-compose up --build

# Or run MongoDB only
docker-compose -f docker.compose-mongo.yaml up -d
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '4000:4000'
    environment:
      - NODE_ENV=production
      - MONGO_URL=mongodb://mongo:27017/blog
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo

  mongo:
    image: mongo:5.0
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

---

## 🔧 Configuration

### Token Expiration

```typescript
// src/enums/EJwtToken.ts
export enum EJwtToken {
  ACCESS_TOKEN_EXPIRATION = 900, // 15 minutes
  REFRESH_TOKEN_EXPIRATION = 2592000, // 30 days
}
```

Adjust based on your needs:
- **Banking:** 5 min / 7 days
- **Standard:** 15 min / 30 days (current)
- **Enterprise:** 1 hour / 90 days

### Database Indexes

```javascript
// Automatically created by models
Users: { email: unique, username: unique }
Grants: { userId, updatedAt (TTL), userId+isRevoked }
Articles: { slug: unique, author, status }
```

---

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:4000/health/auth
```

### Important Logs

```bash
# Watch logs
tail -f logs/request.log
tail -f logs/error.log

# Key events to monitor
🔐 Grant created for login       # New session
🔄 Token rotated successfully    # Normal refresh
🚨 SECURITY BREACH detected      # Token reuse!
👋 User logged out               # Normal logout
```

### Metrics

Monitor these in your observability platform:
- `auth_login_total` - Login attempts
- `auth_token_refresh_total` - Token refreshes
- `auth_breach_detected_total` - Security breaches
- `auth_grant_revocation_total` - Session terminations

---

## 🐛 Troubleshooting

### Token Reuse Detected (Error 1004)

**Cause:** Consumed token was reused (theft or multiple tabs)

**Solution:** User must re-login. Investigate logs for suspicious activity.

### Grant Revoked (Error 1005)

**Cause:** User logged out or session revoked

**Solution:** User must re-login. Expected behavior.

### Access Token Still Valid After Logout

**Cause:** Access tokens are stateless (can't be server-side invalidated)

**Solution:** Expected. Tokens expire in max 15 minutes.

Full troubleshooting guide: [AUTHENTICATION.md → Troubleshooting](./docs/AUTHENTICATION.md#troubleshooting)

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Enable HTTPS/TLS
- [ ] Configure MongoDB replica set
- [ ] Set up proper CORS
- [ ] Enable rate limiting
- [ ] Configure monitoring/alerts
- [ ] Set up log rotation
- [ ] Test disaster recovery
- [ ] Document key rotation procedure

### Environment Variables (Production)

```bash
NODE_ENV=production
PORT=4000
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/blog
JWT_SECRET=<64+ char random string>
PWSECRET=<password hashing secret>
GOOGLE_CLIENT_ID=<your-google-oauth-id>
```

---

## 📈 Performance

### Benchmarks

Average response times (standard hardware):

| Operation | Time | Notes |
|-----------|------|-------|
| Login | 150-250ms | Includes password hashing |
| Register | 200-300ms | Includes password hashing |
| Token Refresh | 50-100ms | Grant lookup + generation |
| Logout | 30-50ms | Grant revocation |
| Get Articles | 50-150ms | With pagination |

### Optimization Tips

1. Use MongoDB connection pooling
2. Enable database read replicas
3. Implement caching (Redis)
4. Use CDN for uploaded media
5. Enable gzip compression

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit a pull request

### Development Workflow

```bash
# 1. Create branch
git checkout -b feature/my-feature

# 2. Make changes
# ... code ...

# 3. Run tests
pnpm test

# 4. Build
pnpm build

# 5. Commit and push
git commit -m "Add my feature"
git push origin feature/my-feature
```

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- [Logto](https://blog.logto.io/understanding-refresh-token-rotation) - Token rotation inspiration
- [Auth0](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation) - Security best practices
- [OWASP](https://owasp.org/) - Security guidelines

---

## 📞 Support

- 📧 Email: support@yourdomain.com
- 💬 Discord: [Join our community]
- 🐛 Issues: [GitHub Issues]
- 📖 Documentation: [docs/](./docs/)

---

## 🗺️ Roadmap

- [ ] WebSocket support for real-time notifications
- [ ] Email verification
- [ ] 2FA (Two-factor authentication)
- [ ] Social login (Facebook, Twitter)
- [ ] Rate limiting per user
- [ ] API versioning (v2)
- [ ] GraphQL API
- [ ] Admin dashboard

---

**Built with ❤️ using TypeScript, Express, and MongoDB**

**Last Updated:** January 2025 | **Version:** 1.0.0 | **Status:** ✅ Production Ready
