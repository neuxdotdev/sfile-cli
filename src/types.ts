export interface MetaConfig {
  name: string;
  version: string;
  author: string;
  homepage: string;
  documentation: string;
}

export interface AppConfig {
  maxConcurrent: number;
  maxRetries: number;
  timeout: number;
  downloadTimeout: number;
  waitForSelectorTimeout: number;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
}

/**
 * Config yang boleh di-override lewat CLI
 * Subset dari AppConfig
 */
export type Config = Pick<
  AppConfig,
  'maxConcurrent' | 'maxRetries' | 'timeout' | 'downloadTimeout'
>;

export interface CliOptions {
  browser: 'firefox' | 'chromium' | 'webkit';
  verbose: boolean;
  fullJson: boolean;
  links: string[];
  downloadDir: string;
  /**
   * Config runtime HARUS lengkap
   */
  config: AppConfig;
}

export interface DownloadResult {
  url: string;
  success: boolean;
  filename?: string;
  filepath?: string;
  size?: number;
  downloadUrl?: string;
  retries: number;
  attempt: number;
  error?: string;
  duration?: number;
}

export interface DownloadStats {
  total: number;
  success: number;
  failed: number;
  retries: number;
  startTime: number;
  endTime: number;
  duration: number;
  successRate: number;
  bytesDownloaded: number;
}
