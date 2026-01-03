import fs from 'fs';
import chalk from 'chalk';
import boxen from 'boxen';
import { createSpinner } from 'nanospinner';
import type { AppConfig } from './types.js';

export const META = {
  name: 'sfile-cli',
  version: '1.0.0',
  author: 'neuxdev',
  homepage: 'https://github.com/neuxdotdev/sfile-cli',
} as const;

export const DEFAULT_CONFIG: AppConfig = {
  maxConcurrent: 1,
  maxRetries: 3,
  timeout: 30000,
  downloadTimeout: 180000,
  waitForSelectorTimeout: 60000,
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
  viewport: {
    width: 1920,
    height: 1080,
  },
};

export class Logger {
  private colors = {
    info: chalk.cyan,
    success: chalk.green,
    error: chalk.red,
    warning: chalk.yellow,
    debug: chalk.magenta,
    download: chalk.blue,
  };

  constructor(private verbose: boolean = false) {}

  private timestamp() {
    return chalk.gray(`[${new Date().toLocaleTimeString()}]`);
  }

  info(msg: string) {
    console.log(this.timestamp(), this.colors.info('[INFO]'), msg);
  }

  success(msg: string) {
    console.log(this.timestamp(), this.colors.success('[OK]'), msg);
  }

  error(msg: string) {
    console.error(this.timestamp(), this.colors.error('[ERR]'), msg);
  }

  warning(msg: string) {
    console.log(this.timestamp(), this.colors.warning('[WARN]'), msg);
  }

  debug(msg: string) {
    if (this.verbose) {
      console.log(this.timestamp(), this.colors.debug('[DBG]'), msg);
    }
  }

  download(msg: string) {
    console.log(this.timestamp(), this.colors.download('↓'), msg);
  }

  banner() {
    console.clear();
    console.log(
      boxen(
        chalk.bold.cyan(`${META.name} v${META.version}`) +
          '\n' +
          chalk.gray('Fast SFile Downloader'),
        {
          padding: 1,
          borderStyle: 'round',
          borderColor: 'cyan',
        }
      )
    );
  }

  spinner(text: string) {
    const spinner = createSpinner(chalk.yellow(text));
    return {
      start: () => spinner.start(),
      success: (msg: string) => spinner.success({ text: chalk.green(msg) }),
      error: (msg: string) => spinner.error({ text: chalk.red(msg) }),
      update: (msg: string) => spinner.update({ text: chalk.yellow(msg) }),
    };
  }
}

export class Utils {
  static sanitizeFilename(name: string): string {
    return name ? name.replace(/[<>:"/\\|?*]/g, '_').slice(0, 200) : `file-${Date.now()}`;
  }

  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static parseLinks(input: string): string[] {
    return input
      .split(/[\n,;]/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'));
  }

  static ensureDir(dir: string): string {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
  }

  static formatTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  static validateUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return u.hostname.includes('sfile.mobi') && u.pathname.startsWith('/');
    } catch {
      return false;
    }
  }
}
