import { useState, useEffect } from 'react';
import { AD_CONFIG, getAdId } from '@/constants/ads';

interface AdState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAdManager() {
  const [bannerAdState, setBannerAdState] = useState<AdState>({
    isLoaded: false,
    isLoading: false,
    error: null,
  });

  const [nativeAdState, setNativeAdState] = useState<AdState>({
    isLoaded: false,
    isLoading: false,
    error: null,
  });

  // Simulate ad loading (replace with actual AdMob integration)
  useEffect(() => {
    const loadAds = async () => {
      setBannerAdState(prev => ({ ...prev, isLoading: true }));
      setNativeAdState(prev => ({ ...prev, isLoading: true }));

      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setBannerAdState({
          isLoaded: true,
          isLoading: false,
          error: null,
        });

        setNativeAdState({
          isLoaded: true,
          isLoading: false,
          error: null,
        });

        console.log('Ads loaded successfully');
        console.log('Banner Ad ID:', getAdId('banner'));
        console.log('Native Ad ID:', getAdId('native'));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load ads';
        
        setBannerAdState({
          isLoaded: false,
          isLoading: false,
          error: errorMessage,
        });

        setNativeAdState({
          isLoaded: false,
          isLoading: false,
          error: errorMessage,
        });

        console.error('Ad loading error:', errorMessage);
      }
    };

    loadAds();
  }, []);

  const refreshAds = () => {
    setBannerAdState({ isLoaded: false, isLoading: false, error: null });
    setNativeAdState({ isLoaded: false, isLoading: false, error: null });
    
    // Trigger reload
    setTimeout(() => {
      setBannerAdState({ isLoaded: true, isLoading: false, error: null });
      setNativeAdState({ isLoaded: true, isLoading: false, error: null });
    }, 1000);
  };

  return {
    bannerAdState,
    nativeAdState,
    refreshAds,
    config: AD_CONFIG,
  };
}