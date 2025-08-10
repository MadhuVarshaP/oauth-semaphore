# Auth0 Setup Guide for Google OAuth

This guide will help you set up Auth0 with Google OAuth for the Semaphore demo application.

## Step 1: Create Auth0 Account

1. Go to [Auth0](https://auth0.com/) and sign up for a free account
2. Choose your tenant name (e.g., `your-company.auth0.com`)

## Step 2: Create Application

1. In Auth0 Dashboard, go to "Applications" → "Applications"
2. Click "Create Application"
3. Name: `Semaphore Demo`
4. Type: **Regular Web Application**
5. Click "Create"

## Step 3: Configure Application Settings

In your application settings, configure:

### Allowed Callback URLs
```
http://localhost:3000/api/auth/callback
```

### Allowed Logout URLs
```
http://localhost:3000
```

### Allowed Web Origins
```
http://localhost:3000
```

### Allowed Origins (CORS)
```
http://localhost:3000
```

## Step 4: Configure Google Social Connection

### In Auth0 Dashboard:
1. Go to "Authentication" → "Social"
2. Click on "Google"
3. Toggle "Enabled" to ON
4. Click "Save"

### In Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Auth0 Google Connection"
   - Authorized redirect URIs: `https://your-tenant.auth0.com/login/callback`
   - Click "Create"

5. Copy the Client ID and Client Secret

### Back to Auth0:
1. In the Google connection settings, paste:
   - Client ID: Your Google OAuth Client ID
   - Client Secret: Your Google OAuth Client Secret
2. Click "Save"

## Step 5: Environment Variables

Create a `.env.local` file in your project root:

```env
# Auth0 Configuration
AUTH0_SECRET='your-generated-secret-here'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-auth0-client-id'
AUTH0_CLIENT_SECRET='your-auth0-client-secret'
```

### Generate AUTH0_SECRET:
```bash
openssl rand -hex 32
```

### Get Auth0 Client Credentials:
1. In Auth0 Dashboard, go to your application
2. Copy the "Client ID" and "Client Secret" from the application settings

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000`

3. Click "Login with Google"

4. You should be redirected to Google OAuth, then back to your application

## Troubleshooting

### Common Issues:

1. **"Invalid redirect_uri"**
   - Check that your callback URL exactly matches: `http://localhost:3000/api/auth/callback`
   - Ensure no trailing slashes or extra characters

2. **"Google OAuth Error"**
   - Verify Google+ API is enabled in Google Cloud Console
   - Check that redirect URI in Google OAuth matches: `https://your-tenant.auth0.com/login/callback`

3. **"CORS Error"**
   - Add `http://localhost:3000` to Allowed Web Origins in Auth0
   - Check AUTH0_BASE_URL matches your local URL

4. **"Session Error"**
   - Verify AUTH0_SECRET is properly generated and set
   - Check all environment variables are correctly set

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test Auth0 connection in Auth0 Dashboard
4. Check Google OAuth credentials are valid

## Production Deployment

For production, update the URLs:

```env
AUTH0_BASE_URL='https://your-domain.com'
```

And update Auth0 application settings:
- Allowed Callback URLs: `https://your-domain.com/api/auth/callback`
- Allowed Logout URLs: `https://your-domain.com`
- Allowed Web Origins: `https://your-domain.com`
