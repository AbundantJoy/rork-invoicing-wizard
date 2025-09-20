// AdMob Configuration
export const AD_CONFIG = {
  // Your provided AdMob IDs
  APP_ID: 'ca-app-pub-9462332053069406~4035377453',
  BANNER_AD_ID: 'ca-app-pub-9462332053069406/5180954079',
  
  // Test IDs for development (replace with your actual IDs in production)
  TEST_BANNER_ID: 'ca-app-pub-3940256099942544/6300978111',
  TEST_NATIVE_ID: 'ca-app-pub-3940256099942544/3986624511',
  
  // Ad placement settings
  SHOW_ADS_ON_HOME: false,
  SHOW_ADS_ON_INVOICE_LIST: false,
  SHOW_ADS_ON_CLIENT_LIST: false,
  SHOW_NATIVE_ADS: false,
  
  // Ad frequency settings
  BANNER_REFRESH_INTERVAL: 30000, // 30 seconds
  NATIVE_AD_FREQUENCY: 3, // Show native ad every 3 items in lists
};

// Helper function to get the appropriate ad ID based on environment
export const getAdId = (adType: 'banner' | 'native') => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  switch (adType) {
    case 'banner':
      return isProduction ? AD_CONFIG.BANNER_AD_ID : AD_CONFIG.TEST_BANNER_ID;
    case 'native':
      return isProduction ? AD_CONFIG.BANNER_AD_ID : AD_CONFIG.TEST_NATIVE_ID;
    default:
      return AD_CONFIG.TEST_BANNER_ID;
  }
};