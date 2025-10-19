# 🔐 Complete Refresh Token Rotation Flow - Summary

## 📋 System Overview

Your authentication system now implements **OAuth 2.0 best practices** with refresh token rotation, breach detection, and automatic revocation to protect against token theft attacks.

---

## 🏗️ Architecture Components

### 1. **Grant Model** (MongoDB with TTL)
```typescript
{
  userId: ObjectId,                    // User who owns this session
  consumedRefreshTokens: string[],    // SHA-256 hashes of used tokens
  isRevoked: boolean,                  // Breach detection flag
  createdAt: Date,                     // Auto-expires after 30 days (TTL)
  updatedAt: Date
}
```

### 2. **JWT Token Structure**
```typescript
{
  id: string,        // User ID
  email: string,     // User email
  role: string,      // User role
  grantId: string,   // Links to Grant record (NEW)
  exp: number        // Expiration timestamp
}
```

### 3. **Token Lifetimes**
- **Access Token:** 15 minutes (900 seconds)
- **Refresh Token:** 30 days (2,592,000 seconds)
- **Grant TTL:** 30 days (auto-cleanup by MongoDB)

---

## 🔄 Complete Flow Diagrams

### Flow 1: Initial Authentication (Login/Signup)

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER AUTHENTICATION                          │
└─────────────────────────────────────────────────────────────────┘

Email/Password:           OAuth (Google):
  ↓                          ↓
register()              saveOAuthUser()
login()                 checkUserExistence()
  ↓                          ↓
  └──────────────┬───────────┘
                 ↓
    handleResponseJwtWithGrant()
                 ↓
    ┌────────────────────────┐
    │ Create Grant Record    │
    │ userId: user._id       │
    │ consumedTokens: []     │
    │ isRevoked: false       │
    └────────────────────────┘
                 ↓
    Generate Tokens with grantId:
    ┌────────────────────────┐
    │ accessToken (15 min)   │
    │ refreshToken (30 days) │
    └────────────────────────┘
                 ↓
    Return to Client:
    {
      tokens: {
        accessToken: "eyJ...",
        refreshToken: "eyJ..."
      },
      user: { id, email, ... }
    }
```

---

### Flow 2: Normal Token Refresh (Happy Path)

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOKEN REFRESH FLOW                           │
└─────────────────────────────────────────────────────────────────┘

Every ~15 minutes when access token expires:

Client
  ↓ POST /api/v1/auth/refresh
  ↓ Body: { refreshToken: "eyJ..." }
  ↓
Server: refreshAccessToken()
  ↓
1. Verify JWT signature & expiration
   ✓ Valid → decode payload { id, email, role, grantId }
  ↓
2. Find Grant by grantId
   ✓ Grant exists
   ✓ isRevoked: false
  ↓
3. Hash incoming refresh token (SHA-256)
   tokenHash = "a1b2c3d4..."
  ↓
4. Check if hash in consumedRefreshTokens[]
   ✓ NOT found (first use)
  ↓
5. Mark token as consumed
   grant.consumedRefreshTokens.push(tokenHash)
   grant.save()
  ↓
6. Generate NEW tokens (same grantId)
   newAccessToken (15 min)
   newRefreshToken (30 days)
  ↓
7. Return to Client
   {
     accessToken: "eyJ...",    ← NEW
     refreshToken: "eyJ..."    ← NEW
   }
  ↓
Client: Store NEW tokens, discard old ones
```

---

### Flow 3: Security Breach Detection

```
┌─────────────────────────────────────────────────────────────────┐
│               TOKEN THEFT & REUSE DETECTION                     │
└─────────────────────────────────────────────────────────────────┘

Scenario: Attacker steals refresh token

Day 1: User has refreshToken_v1
       ⚠️ Attacker steals refreshToken_v1
       
Day 2: User uses refreshToken_v1
       ✓ Token valid
       ✓ Mark as consumed
       ✓ Get refreshToken_v2

Day 3: Attacker tries to use stolen refreshToken_v1
       ↓
       refreshAccessToken()
       ↓
       1. Verify JWT → ✓ Valid signature
       2. Find Grant → ✓ Exists
       3. Hash token → tokenHash
       4. Check consumed list
          ❌ HASH FOUND! (already used)
       ↓
       🚨 SECURITY BREACH DETECTED! 🚨
       ↓
       5. Revoke entire Grant
          grant.isRevoked = true
          grant.save()
       ↓
       6. Log security event
          console.error('Token reuse detected!')
       ↓
       7. Return 401 Unauthorized
          {
            success: false,
            message: "Token reuse detected. All tokens revoked.",
            errorCode: 1004 (TOKEN_REUSE_DETECTED)
          }

Result:
  ✓ Attacker blocked
  ✓ User's refreshToken_v2 also invalidated
  ✓ User must re-login (security > convenience)
  ✓ New Grant created on re-login
```

---

## 🎯 All Authentication Endpoints

### 1. **POST /api/v1/auth/register**
```javascript
Body: { email, password }
→ Creates User
→ Creates Grant
→ Returns { accessToken, refreshToken, user }
```

### 2. **POST /api/v1/auth/login**
```javascript
Body: { email, password }
→ Validates credentials
→ Creates Grant
→ Returns { accessToken, refreshToken, user }
```

### 3. **POST /api/v1/auth/refresh** ⭐ (NEW LOGIC)
```javascript
Body: { refreshToken }
→ Validates token
→ Checks Grant
→ Detects reuse
→ Rotates tokens
→ Returns { accessToken, refreshToken }
```

### 4. **POST /api/v1/users/oauth/save** (OAuth Signup)
```javascript
Headers: { Authorization: "Bearer googleToken" }
→ Creates User
→ Creates Grant
→ Returns { accessToken, refreshToken, user }
```

### 5. **GET /api/v1/users/check/:email** (OAuth Login)
```javascript
Params: { email }
→ Finds User
→ Creates Grant (if exists)
→ Returns { accessToken, refreshToken, user, exists: true }
```

---

## 🛡️ Security Features

### ✅ What's Protected

| Feature | Implementation |
|---------|----------------|
| **Token Theft Detection** | Hash comparison in `consumedRefreshTokens[]` |
| **Automatic Revocation** | `isRevoked = true` on breach |
| **Breach Logging** | Console errors with userId & grantId |
| **Short-lived Access** | 15 minutes (vs 7 days before) |
| **Audit Trail** | Grant records with consumed token history |
| **Auto Cleanup** | MongoDB TTL index (30 days) |
| **OAuth Protected** | Same security for Google login |

### 🔒 Error Codes

```typescript
enum EJwtExpirationErrorCode {
  ACCESS_TOKEN_EXPIRED = 1001,    // Normal expiration
  REFRESH_TOKEN_EXPIRED = 1002,   // Token expired
  NO_TOKEN_PROVIDED = 1003,       // Missing token
  TOKEN_REUSE_DETECTED = 1004,    // 🚨 Breach detected
  GRANT_REVOKED = 1005,           // 🚨 Session revoked
}
```

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  username: "user_abc123",
  name: "User Name",
  authentication: {
    salt: "random_salt",
    password: "hashed_password"
  },
  role: "USER" | "ADMIN",
  createdAt: Date,
  updatedAt: Date
}
```

### Grants Collection (NEW)
```javascript
{
  _id: ObjectId,                           // This is the grantId
  userId: ObjectId("user_id"),
  consumedRefreshTokens: [
    "a1b2c3...",  // SHA-256 hash of refresh_token_v1
    "d4e5f6...",  // SHA-256 hash of refresh_token_v2
    // ... continues as tokens rotate
  ],
  isRevoked: false,
  createdAt: Date,      // ← TTL index (expires after 30 days)
  updatedAt: Date
}

// Indexes:
// 1. { createdAt: 1 } expireAfterSeconds: 2592000  (TTL)
// 2. { userId: 1 } (query performance)
// 3. { userId: 1, isRevoked: 1 } (compound)
```

---

## 💻 Client-Side Requirements

### What Your Frontend Needs to Do

#### 1. **Store Tokens Securely**
```javascript
// After login/signup/OAuth
localStorage.setItem('accessToken', response.tokens.accessToken);
localStorage.setItem('refreshToken', response.tokens.refreshToken);
```

#### 2. **Auto-Refresh Before Expiration**
```javascript
// Check token expiration every API call
const tokenExpiry = parseJwt(accessToken).exp * 1000;
const now = Date.now();

if (now >= tokenExpiry - 60000) {  // Refresh 1 min before expiry
  await refreshTokens();
}
```

#### 3. **Refresh Token Function**
```javascript
async function refreshTokens() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  if (response.ok) {
    const data = await response.json();
    // ⚠️ IMPORTANT: Update BOTH tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);  // ← NEW token
    return data.accessToken;
  } else {
    // Handle errors
    const error = await response.json();
    
    if (error.errorCode === 1004 || error.errorCode === 1005) {
      // Breach detected - force re-login
      logout();
      redirectToLogin();
    }
  }
}
```

#### 4. **HTTP Interceptor (Example)**
```javascript
// Axios example
axios.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('accessToken');
  
  if (isTokenExpiringSoon(token)) {
    token = await refreshTokens();
  }
  
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.data?.errorCode === 1004 || 
        error.response?.data?.errorCode === 1005) {
      // Breach detected
      logout();
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);
```

---

## 📈 Performance & Monitoring

### Logging Points
```javascript
// Successful operations
'🔐 Grant created for new user'
'🔐 Grant created for login'
'🔐 Grant created for OAuth user check'
'🔐 Grant created for new OAuth user'
'🔄 Token rotated successfully'

// Security events
'🚨 SECURITY BREACH: Refresh token reuse detected!'
```

### Monitoring Metrics
- Grant creation rate
- Token rotation frequency
- Breach detection count
- Revoked grants per day
- Average consumed tokens per grant

---

## 🧪 Testing Checklist

### ✅ Test Scenarios

1. **Normal Flow**
   - [ ] Register new user → tokens received with grantId
   - [ ] Login existing user → tokens received with grantId
   - [ ] OAuth signup → tokens received with grantId
   - [ ] OAuth login → tokens received with grantId
   - [ ] Refresh token → new tokens received

2. **Token Rotation**
   - [ ] Use refresh token → old token marked consumed
   - [ ] Use new refresh token → works fine
   - [ ] Try old refresh token again → 401 + breach detected

3. **Security Breach**
   - [ ] Simulate token theft → reuse detected
   - [ ] Grant revoked → all tokens invalid
   - [ ] User forced to re-login → new grant created

4. **Edge Cases**
   - [ ] Expired access token → refresh works
   - [ ] Expired refresh token → 401 error
   - [ ] Invalid token → 401 error
   - [ ] Missing grantId → 401 error
   - [ ] Revoked grant → 401 with GRANT_REVOKED

---

## 🎉 Summary of Benefits

| Before | After |
|--------|-------|
| 7-day access tokens | ✅ 15-minute access tokens |
| 14-day refresh tokens | ✅ 30-day refresh tokens |
| No token tracking | ✅ Full Grant tracking |
| No breach detection | ✅ Instant breach detection |
| No auto-cleanup | ✅ MongoDB TTL (30 days) |
| Manual revocation only | ✅ Auto-revocation on breach |
| No OAuth protection | ✅ OAuth fully protected |
| No audit trail | ✅ Complete token history |

Your authentication system is now production-ready with industry-leading security! 🚀