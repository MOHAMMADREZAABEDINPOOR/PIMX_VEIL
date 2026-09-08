/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppLanguage = 'en' | 'fa' | 'ar' | 'de' | 'fr' | 'it' | 'zh' | 'ru' | 'el' | 'la';

export type AppTab = 'home' | 'encrypt' | 'decrypt';

export type AppTheme = 'dark' | 'light';

export interface CryptoLog {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  statusText: string;
  logs: CryptoLog[];
}
