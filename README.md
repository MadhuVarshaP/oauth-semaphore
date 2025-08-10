# Semaphore + OAuth Demo

A Next.js application demonstrating zero-knowledge proof authentication using Semaphore protocol with Auth0 Google OAuth integration.

## 🚀 Features

- **Auth0 Google OAuth**: Secure authentication with Google accounts
- **Semaphore Protocol**: Zero-knowledge proof generation and verification
- **Group Management**: Dynamic group membership with cryptographic commitments
- **Real-time Logging**: Detailed activity tracking throughout the flow
- **Modern UI**: Clean, responsive interface with step-by-step guidance

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Auth0 account
- Google OAuth credentials

## 🛠️ Setup Instructions

### 1. Auth0 Configuration

#### Create Auth0 Application
1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application or use existing one
3. Set application type to "Regular Web Application"
4. Configure the following settings:

**Allowed Callback URLs:**
```
http://localhost:3000/api/auth/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000
```

**Allowed Web Origins:**
```
http://localhost:3000
```

#### Configure Google Social Connection
1. In Auth0 Dashboard, go to "Authentication" → "Social"
2. Enable Google connection
3. Configure Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add `https://your-tenant.auth0.com/login/callback` to authorized redirect URIs
4. Copy Client ID and Client Secret to Auth0 Google connection settings

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Auth0 Configuration
AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-auth0-client-id'
AUTH0_CLIENT_SECRET='your-auth0-client-secret'
```

**Generate AUTH0_SECRET:**
```bash
openssl rand -hex 32
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

## 🧪 Testing Instructions

### 1. Test Authentication Flow
1. Open `http://localhost:3000`
2. Click "Login with Google"
3. Complete Google OAuth flow
4. Verify you're redirected back to the application

### 2. Test Semaphore Flow
After successful authentication, you'll see a step-by-step interface:

1. **Step 1: Initialize Identity**
   - Creates a server-side identity using your Google email
   - Generates cryptographic commitment

2. **Step 2: Join Group**
   - Adds your identity commitment to the Semaphore group
   - Establishes group membership

3. **Step 3: View Group Details**
   - Fetches and displays current group information
   - Shows member count, tree depth, and root

4. **Step 4: Generate Proof**
   - Creates zero-knowledge proof of membership
   - Verifies proof without revealing identity

5. **Step 5: Complete**
   - Flow completed successfully

### 3. Test API Endpoints

#### Initialize Identity
```http
POST http://localhost:3000/api/zk/identity/init
Authorization: Bearer <auth0-token>
```

#### Join Group
```http
POST http://localhost:3000/api/zk/group/members
Content-Type: application/json
Authorization: Bearer <auth0-token>

{
  "commitment": "1234567890123456789012345678901234567890123456789012345678901234"
}
```

#### Get Group Details
```http
GET http://localhost:3000/api/zk/group/full
```

#### Generate Proof
```http
POST http://localhost:3000/api/zk/proof
Content-Type: application/json
Authorization: Bearer <auth0-token>

{
  "signal": "my-test-signal"
}
```

#### Verify Proof
```http
POST http://localhost:3000/api/zk/verify
Content-Type: application/json

{
  "fullProof": {
    "proof": [...],
    "publicSignals": [...]
  }
}
```

## 🔧 Key Features

### Frontend Integration
- **Auth0 Google OAuth**: Seamless authentication flow
- **Identity Management**: Automatic identity creation and storage
- **Group Management**: Manual group joining (no auto-join)
- **Proof Generation**: Client-side proof generation with Semaphore
- **Real-time Logs**: Detailed logging of all operations

### Backend APIs
- **Authentication**: Auth0 session validation
- **Identity Creation**: Server-side identity generation
- **Group Operations**: Member management and group state
- **Proof Generation**: ZK proof creation and verification

## 🚨 Security Notes

- **Demo Purpose**: This is a demonstration application
- **Email as Seed**: Using email as identity seed is not secure for production
- **Environment Variables**: Never commit `.env.local` to version control
- **Auth0 Configuration**: Ensure proper callback URLs and CORS settings

## 📁 Project Structure

```
semaphore-zk-oauth/
├── pages/
│   ├── api/
│   │   ├── auth/[...auth0].js    # Auth0 API routes
│   │   └── zk/                   # Semaphore API endpoints
│   ├── _app.js                   # Auth0 UserProvider
│   └── index.js                  # Main application
├── lib/
│   └── semaphore/                # Semaphore utilities
├── public/
│   └── semaphore/                # Circuit files
└── styles/                       # CSS styles
```

## 🐛 Troubleshooting

### Common Issues

1. **Auth0 Callback Error**
   - Verify callback URLs in Auth0 dashboard
   - Check AUTH0_BASE_URL matches your local URL

2. **Google OAuth Error**
   - Ensure Google+ API is enabled
   - Verify redirect URIs in Google Cloud Console

3. **Environment Variables**
   - Check all required Auth0 variables are set
   - Verify AUTH0_SECRET is properly generated

4. **CORS Issues**
   - Ensure AUTH0_BASE_URL is correct
   - Check allowed origins in Auth0 dashboard

## 📚 Resources

- [Auth0 Next.js SDK](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Semaphore Protocol](https://semaphore.appliedzkp.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2)
