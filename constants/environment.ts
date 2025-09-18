import { Platform } from 'react-native';

// Environment Configuration
export const ENV = {
  // Development environment
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
    WEB_API_BASE_URL: 'http://localhost:3000/api',
    MOBILE_API_BASE_URL: 'http://10.0.2.2:3000/api', // Android emulator
    OFFLINE_MODE: true, // Enable offline mode for development
  },
  // Production environment
  production: {
    API_BASE_URL: 'https://your-production-api.com/api',
    WEB_API_BASE_URL: 'https://your-production-api.com/api',
    MOBILE_API_BASE_URL: 'https://your-production-api.com/api',
    OFFLINE_MODE: false,
  },
};

// Current environment (change this based on your needs)
export const CURRENT_ENV = 'development';

// Get current environment config
export const getEnvConfig = () => {
  return ENV[CURRENT_ENV as keyof typeof ENV];
};

// Platform-specific API URL
export const getApiBaseUrl = () => {
  const config = getEnvConfig();
  
  if (Platform.OS === 'web') {
    return config.WEB_API_BASE_URL;
  }
  
  return config.MOBILE_API_BASE_URL;
};

// Check if offline mode is enabled
export const isOfflineMode = () => {
  return getEnvConfig().OFFLINE_MODE;
};