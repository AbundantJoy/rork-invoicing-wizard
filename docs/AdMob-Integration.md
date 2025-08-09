# AdMob Integration Guide

This document explains how to integrate Google AdMob ads into your invoicing app when building a standalone version.

## Current Implementation

The app currently includes placeholder ad components that display mock advertisements. These are designed to be easily replaced with real AdMob ads when you build a standalone app.

## Your AdMob Configuration

- **App ID**: `ca-app-pub-9462332053069406~4035377453`
- **Banner Ad Unit ID**: `ca-app-pub-9462332053069406/5180954079`

## Ad Placements

### Current Ad Locations:
1. **Home Screen**: Banner ad after status tabs, native ads every 3 invoice items
2. **Clients Screen**: Banner ad after search bar, native ads every 3 client items  
3. **Settings Screen**: Medium banner ad before security section
4. **Empty States**: Medium banner ads when no data is available

## Files Structure

```
components/
├── AdBanner.tsx          # Banner ad component (placeholder)
├── NativeAd.tsx          # Native ad component (placeholder)

constants/
├── ads.ts                # Ad configuration and settings

hooks/
├── useAdManager.ts       # Ad management hook (placeholder)
```

## Integration Steps for Standalone App

### 1. Install AdMob SDK
```bash
npx expo install react-native-google-mobile-ads
```

### 2. Configure app.json
Add to your `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-9462332053069406~4035377453",
          "iosAppId": "ca-app-pub-9462332053069406~4035377453"
        }
      ]
    ]
  }
}
```

### 3. Initialize AdMob
Add to your root `_layout.tsx`:
```typescript
import mobileAds from 'react-native-google-mobile-ads';

// Initialize AdMob
mobileAds().initialize();
```

### 4. Replace Placeholder Components

#### Update AdBanner.tsx:
```typescript
import React from 'react';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { getAdId } from '@/constants/ads';

export default function AdBanner({ size = 'banner' }) {
  const adUnitId = getAdId('banner');
  
  const getBannerSize = () => {
    switch (size) {
      case 'large': return BannerAdSize.LARGE_BANNER;
      case 'medium': return BannerAdSize.MEDIUM_RECTANGLE;
      default: return BannerAdSize.BANNER;
    }
  };

  return (
    <BannerAd
      unitId={adUnitId}
      size={getBannerSize()}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
    />
  );
}
```

#### Update NativeAd.tsx:
```typescript
import React from 'react';
import { NativeAd, NativeAdView } from 'react-native-google-mobile-ads';
import { getAdId } from '@/constants/ads';

export default function NativeAd() {
  const adUnitId = getAdId('native');

  return (
    <NativeAdView
      adUnitId={adUnitId}
      adTypes={['native']}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
    >
      {/* Your native ad layout */}
    </NativeAdView>
  );
}
```

### 5. Update useAdManager.ts
Replace the placeholder implementation with real AdMob integration:
```typescript
import { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';

export function useAdManager() {
  // Real AdMob integration logic
  // Handle ad loading, error states, etc.
}
```

## Ad Configuration

The `constants/ads.ts` file contains all ad-related configuration:

- **AD_CONFIG.APP_ID**: Your AdMob app ID
- **AD_CONFIG.BANNER_AD_ID**: Your banner ad unit ID  
- **AD_CONFIG.SHOW_ADS_ON_HOME**: Toggle home screen ads
- **AD_CONFIG.SHOW_ADS_ON_CLIENT_LIST**: Toggle client list ads
- **AD_CONFIG.NATIVE_AD_FREQUENCY**: How often to show native ads in lists

## Testing

- Use test ad unit IDs during development
- Switch to production IDs before app store submission
- Test on both iOS and Android devices

## Privacy & Compliance

- Ensure GDPR/CCPA compliance
- Add privacy policy mentioning ad usage
- Consider implementing consent management

## Performance Considerations

- Ads are loaded asynchronously to avoid blocking UI
- Error handling prevents app crashes if ads fail to load
- Configurable ad frequency to balance UX and revenue

## Next Steps

1. Build standalone app with EAS Build
2. Replace placeholder components with real AdMob components
3. Test thoroughly on physical devices
4. Submit to app stores with proper ad disclosures