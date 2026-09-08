/**
 * PIMXVEIL Configuration
 * Central configuration file for domain, paths, and application settings
 */

export const PIMXVEIL_CONFIG = {
  // Application Identity
  appName: 'PIMXVEIL',
  appVersion: '1.0.0',
  appDescription: 'Military-Grade File Steganography & Encryption Suite',

  // Domain Configuration
  primaryDomain: 'pimxveil.pages.dev',
  primaryUrl: 'https://pimxveil.pages.dev',
  
  // Admin Panel Configuration
  adminPath: '/pimxveiladmin',
  adminFullUrl: 'https://pimxveil.pages.dev/pimxveiladmin',
  adminUsername: 'pimxveil',
  adminSessionKey: 'pimx_admin_session',

  // Security Configuration
  encryptionStandard: 'AES-256-GCM',
  hashAlgorithm: 'SHA-256',

  // Feature Flags
  features: {
    analyticsEnabled: true,
    adminPanelEnabled: true,
    darkModeEnabled: true,
    multiLanguageEnabled: true
  },

  // Supported Languages
  languages: ['en', 'fa', 'ar', 'de', 'fr', 'it', 'zh', 'ru', 'el', 'la'],
  defaultLanguage: 'en',
  rtlLanguages: ['fa', 'ar'],

  // API Configuration (for future use)
  api: {
    timeout: 30000, // 30 seconds
    retries: 3
  },

  // Analytics
  analytics: {
    enableTracking: true,
    maxStorageSize: 5000000, // 5MB in localStorage
    eventRetentionDays: 7300 // ~20 years
  }
};

// Helper function to get the full admin panel URL
export const getAdminPanelUrl = (): string => {
  return PIMXVEIL_CONFIG.adminFullUrl;
};

// Helper function to get relative admin panel path
export const getAdminPanelPath = (): string => {
  return PIMXVEIL_CONFIG.adminPath;
};

// Helper function to check if current path is admin panel
export const isAdminPanelPath = (pathname: string): boolean => {
  return pathname.includes(PIMXVEIL_CONFIG.adminPath);
};
