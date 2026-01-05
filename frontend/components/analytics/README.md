# Google Tag Manager Setup

This directory contains the Google Tag Manager (GTM) implementation for tracking and analytics.

## Setup Instructions

### 1. Get Your Google Tag Manager ID

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Create a new account or select an existing one
3. Create a new container for your website
4. Copy your Container ID (format: `GTM-XXXXXXX`)

### 2. Configure Environment Variables

Add your GTM ID to your `.env.local` file:

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

Replace `GTM-XXXXXXX` with your actual GTM Container ID.

### 3. Set Up Google Analytics in GTM

Once GTM is installed, you can add Google Analytics 4 (GA4) through the GTM interface:

1. In Google Tag Manager, click **Tags** → **New**
2. Click **Tag Configuration** → **Google Analytics: GA4 Configuration**
3. Enter your **Measurement ID** (format: `G-XXXXXXXXXX`)
4. Configure your triggers (e.g., All Pages)
5. Save and publish your container

## Components

### `GoogleTagManager.tsx`
- Client component that loads the GTM script
- Automatically placed in the `<head>` by Next.js
- Uses `afterInteractive` strategy for optimal performance

### `GoogleTagManagerNoScript.tsx`
- Fallback for users with JavaScript disabled
- Placed immediately after the opening `<body>` tag

## Features

- ✅ Automatic script loading with Next.js optimization
- ✅ Environment variable configuration
- ✅ Development mode warnings when GTM ID is missing
- ✅ NoScript fallback for accessibility
- ✅ TypeScript support

## Testing

1. After adding your GTM ID, build and run your application:
   ```bash
   npm run build
   npm start
   ```

2. Open your browser's developer tools and check the Network tab
3. Look for requests to `googletagmanager.com`
4. Use the [Google Tag Assistant](https://tagassistant.google.com/) Chrome extension to verify installation

## Additional Resources

- [Google Tag Manager Documentation](https://support.google.com/tagmanager)
- [Google Analytics 4 Setup Guide](https://support.google.com/analytics/answer/9304153)
- [Next.js Script Component](https://nextjs.org/docs/app/api-reference/components/script)

