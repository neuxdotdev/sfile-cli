import type { BrowserContext, Page, Download } from 'playwright';
import fs from 'fs';
import path from 'path';
import { Logger, Utils } from './utils.js';
import type { AppConfig, DownloadResult } from './types.js';

export class Downloader {
  constructor(private logger: Logger, private config: AppConfig) {}

  async download(url: string, context: BrowserContext, outputDir: string): Promise<DownloadResult> {
    const startTime = Date.now();
    let page: Page | null = null;
    let attempt = 0;

    while (attempt <= this.config.maxRetries) {
      attempt++;
      try {
        page = await context.newPage();
        const spinner = this.logger.spinner(`Attempt ${attempt}/${this.config.maxRetries + 1}`);
        spinner.start();

        // Navigate to download page
        spinner.update('Loading page...');
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.config.timeout });

        // Find download button
        spinner.update('Finding download link...');
        await page.waitForSelector('#download[href*="/download/"]', {
          timeout: this.config.waitForSelectorTimeout,
        });

        // Extract download URL
        const downloadUrl = await page.$eval('#download', (el) => {
          if (el instanceof HTMLAnchorElement) {
            return el.href;
          }
          throw new Error('Element is not an anchor');
        });

        await page.goto(downloadUrl, { waitUntil: 'domcontentloaded' });

        // Wait and extract final URL
        await Utils.sleep(2000);
        const finalUrl = await this.extractDownloadUrl(page);
        if (!finalUrl) throw new Error('Download URL not found');

        // Start download
        spinner.update('Starting download...');
        const download = await this.triggerDownload(page, finalUrl);

        // Save file
        const filename = Utils.sanitizeFilename(download.suggestedFilename());
        const filepath = path.join(outputDir, filename);
        await download.saveAs(filepath);

        if (!fs.existsSync(filepath)) throw new Error('File not saved');

        const stats = fs.statSync(filepath);
        const duration = Date.now() - startTime;

        spinner.success(`Downloaded: ${filename} (${Utils.formatBytes(stats.size)})`);

        return {
          url,
          success: true,
          filename,
          filepath,
          size: stats.size,
          downloadUrl: finalUrl,
          retries: attempt - 1,
          attempt,
          duration,
        };
      } catch (err) {
        if (page) await this.captureDebug(page, outputDir);
        if (attempt > this.config.maxRetries) {
          return {
            url,
            success: false,
            error: (err as Error).message,
            retries: attempt - 1,
            attempt,
            duration: Date.now() - startTime,
          };
        }
        await Utils.sleep(1000 * attempt); // Exponential backoff
      } finally {
        if (page && !page.isClosed()) await page.close();
      }
    }

    throw new Error('Max retries exceeded');
  }

  private async extractDownloadUrl(page: Page): Promise<string | null> {
    return page.evaluate(() => {
      // Check scripts for download URLs
      for (const script of Array.from(document.scripts)) {
        const content = script.textContent || '';
        const matches = content.match(/https:\\?\/\\?\/sfile\.mobi\\?\/download[^"']+k=[a-f0-9]+/g);
        if (matches) {
          return matches[0].replace(/\\\//g, '/');
        }
      }

      // Check iframes
      for (const iframe of Array.from(document.querySelectorAll('iframe'))) {
        if (iframe.src?.includes('download')) return iframe.src;
      }

      return null;
    });
  }

  private async triggerDownload(page: Page, url: string): Promise<Download> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        page.off('download', handler);
        reject(new Error('Download timeout'));
      }, this.config.downloadTimeout);

      const handler = (download: Download) => {
        clearTimeout(timeout);
        page.off('download', handler);
        resolve(download);
      };

      page.on('download', handler);
      page.evaluate((downloadUrl: string) => {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, url);
    });
  }

  private async captureDebug(page: Page, dir: string) {
    try {
      const debugFile = path.join(dir, `debug-${Date.now()}.png`);
      await page.screenshot({ path: debugFile, fullPage: false });
      this.logger.debug(`Debug saved: ${debugFile}`);
    } catch {
      // Silent fail for debug
    }
  }
}
