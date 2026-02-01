# Cloudflare Security Setup

This app uses Cloudflare as a proxy in front of Fly.io to prevent direct access to the Fly.io deployment.

## Security Approach

Three-layer defense:
1. **Hostname check** - Blocks direct `*.fly.dev` access
2. **CF-Ray header** - Verifies request went through Cloudflare
3. **Shared secret** - Verifies request is from YOUR Cloudflare account

## Setup Instructions

### 1. Generate a Secret Key

Generate a strong random secret:

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Set Environment Variable on Fly.io

Add the secret to your Fly.io app:

```bash
fly secrets set CLOUDFLARE_SECRET="your-generated-secret-here"
```

### 3. Configure Cloudflare Transform Rules

In your Cloudflare dashboard:

1. Go to **Rules** → **Transform Rules** → **Modify Request Header**
2. Click **Create rule**
3. Configure:
   - **Rule name**: `Add Cloudflare Secret`
   - **When incoming requests match**: `All incoming requests`
   - **Then**:
     - **Operation**: `Set static`
     - **Header name**: `X-Cloudflare-Secret`
     - **Value**: `your-generated-secret-here` (same as Fly.io)
4. Click **Deploy**

### 4. Update Local .env (Development)

For local development, add to your `.env` file:

```bash
CLOUDFLARE_SECRET="your-generated-secret-here"
```

Or disable the check entirely in development:

```bash
DISABLE_CLOUDFLARE_CHECK="true"
```

## Testing

### Test Direct Access is Blocked

Try accessing your Fly.io URL directly (should get 403):

```bash
curl https://your-app.fly.dev
# Expected: 403 Forbidden
```

### Test Cloudflare Access Works

Access through your Cloudflare domain (should work):

```bash
curl https://your-domain.com
# Expected: 200 OK with your app
```

## Troubleshooting

### Getting 500 errors after deployment

The `CLOUDFLARE_SECRET` environment variable is not set on Fly.io.

```bash
fly secrets list  # Check if it's set
fly secrets set CLOUDFLARE_SECRET="your-secret"
```

### Getting 403 errors on Cloudflare domain

1. Check the Transform Rule is deployed and active
2. Verify the secret matches in both places (case-sensitive)
3. Check Cloudflare DNS is properly configured

### Want to temporarily disable the check

Set this environment variable:

```bash
fly secrets set DISABLE_CLOUDFLARE_CHECK="true"
```

## Security Notes

- **Keep the secret private** - Don't commit it to version control
- **Rotate periodically** - Change the secret every few months
- **Use strong secrets** - At least 32 bytes of randomness
- The check is automatically disabled in `NODE_ENV=development`
