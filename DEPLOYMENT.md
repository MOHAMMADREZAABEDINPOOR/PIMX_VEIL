# PIMXVEIL Deployment Guide

This guide explains how to deploy PIMXVEIL to Cloudflare Pages with the correct domain configuration.

## Domain Configuration

### Primary Domain
- **Domain**: `pimxveil.pages.dev`
- **Purpose**: Main application access
- **URL**: https://pimxveil.pages.dev

### Admin Panel Domain
- **Path**: `/pimxveiladmin`
- **Full URL**: https://pimxveil.pages.dev/pimxveiladmin
- **Security**: Admin credentials are configured in the application code. See the AdminPanel component for authentication details.

## Cloudflare Pages Deployment Steps

### 1. Connect GitHub Repository

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages**
3. Click **Connect to Git**
4. Select your GitHub account and authorize Cloudflare
5. Select the `PIMX_VEIL` repository

### 2. Configure Build Settings

When connecting the repository, configure the following:

- **Framework**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`

### 3. Set Environment Variables

In the Cloudflare Pages project settings:

1. Navigate to **Settings** → **Environment variables**
2. Add the following variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `GEMINI_API_KEY` | `your-api-key` | Required for AI features |
| `NODE_VERSION` | `18.17.0` | Or your preferred version |

### 4. Deploy

Once configured:
1. Cloudflare will automatically build and deploy on every push to main
2. Your site will be available at `https://pimxveil.pages.dev`

## Custom Domain Setup (Optional)

If you want to use a custom domain instead of `pimxveil.pages.dev`:

1. In Cloudflare Pages project settings, go to **Custom domains**
2. Add your custom domain
3. Follow the DNS configuration instructions

## Routing Configuration

The application is configured with client-side routing via React Router. The admin panel is accessed via:
- Route path: `/pimxveiladmin`
- This route is protected with in-session authentication

## Troubleshooting

### Build fails on Cloudflare
- Ensure Node.js version is 18+
- Check that `npm install` completes successfully
- Verify all environment variables are set

### Admin panel not loading
- Verify you're accessing `/pimxveiladmin` path
- Clear browser cache and local storage
- Check browser console for errors

### Encryption/Decryption issues
- Ensure you're using the latest browser version
- Check that JavaScript is enabled
- Verify sufficient RAM available (some large files require significant memory)

## Performance Optimization

Cloudflare Pages provides:
- Global CDN distribution
- Automatic HTTPS
- Caching optimization
- Security protections (DDoS, Bot Management)

## Security Considerations

### Client-Side Security
- All encryption happens locally in your browser
- No data is transmitted to servers
- Browser's localStorage used only for session tokens

### Server-Side Security (Cloudflare)
- All traffic is encrypted with TLS 1.2+
- DDoS protection enabled by default
- Web Application Firewall (WAF) available

### Admin Panel Security
- Session tokens stored in sessionStorage (cleared on browser close)
- Credentials validated client-side only
- Consider changing default credentials in production

## Monitoring & Analytics

The admin panel provides:
- Real-time visitor tracking
- Encryption/decryption usage statistics
- Device and geographic analytics
- Custom time-range filtering

Access at: https://pimxveil.pages.dev/pimxveiladmin

## Support

For deployment issues:
1. Check [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
2. Review GitHub repository issues
3. Check browser console for client-side errors
