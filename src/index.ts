#!/usr/bin/env node
import { CLI, Output } from './cli.js';
import { Logger, Utils } from './utils.js';
import { BrowserManager } from './browser.js';
import { Downloader } from './downloader.js';
import type { DownloadResult } from './types.js';
import chalk from 'chalk';

class SFileApp {
  private logger!: Logger;
  private browser!: BrowserManager;
  private downloader!: Downloader;
  private output!: Output;

  async run() {
    const cli = new CLI();
    cli.parse(process.argv);
    await cli.prompt();

    const options = cli.getOptions();
    this.logger = new Logger(options.verbose);
    this.browser = new BrowserManager(this.logger, options.config);
    this.downloader = new Downloader(this.logger, options.config);
    this.output = new Output(this.logger);

    if (!options.fullJson) this.logger.banner();

    const outputDir = Utils.ensureDir(options.downloadDir);
    this.logger.info(`Output: ${outputDir}`);
    this.logger.info(`Processing ${options.links.length} link(s)...`);

    await this.browser.launch(options.browser);

    try {
      const results = await this.processLinks(
        options.links,
        outputDir,
        options.config.maxConcurrent
      );
      const stats = this.output.calculateStats(results);

      if (options.fullJson) {
        this.output.showJson(results, stats, options.config);
      } else {
        this.output.showSummary(results, stats, outputDir);
      }

      if (stats.failed === 0) {
        this.logger.success('All downloads completed!');
      } else if (stats.success === 0) {
        this.logger.error('All downloads failed');
        process.exit(1);
      } else {
        this.logger.warning(`${stats.failed} download(s) failed`);
      }
    } finally {
      await this.browser.shutdown();
      this.logger.info('Done.');
    }
  }

  private async processLinks(
    links: string[],
    outputDir: string,
    concurrency: number
  ): Promise<DownloadResult[]> {
    const results: DownloadResult[] = [];

    if (concurrency <= 1 || links.length <= 1) {
      // Sequential
      for (const [i, url] of links.entries()) {
        const ctx = await this.browser.newContext();
        const result = await this.downloader.download(url, ctx, outputDir);
        results.push(result);
        await this.browser.closeContext(ctx);
        if (i < links.length - 1) await Utils.sleep(1000);
      }
    } else {
      // Concurrent with chunks
      for (let i = 0; i < links.length; i += concurrency) {
        const chunk = links.slice(i, i + concurrency);

        const tasks = await Promise.all(
          chunk.map(async (url) => {
            const ctx = await this.browser.newContext();
            try {
              return await this.downloader.download(url, ctx, outputDir);
            } finally {
              await this.browser.closeContext(ctx);
            }
          })
        );

        results.push(...tasks);

        if (i + concurrency < links.length) {
          await Utils.sleep(2000);
        }
      }
    }

    return results;
  }
}

// Dependency check
async function checkDeps() {
  const deps = ['nanospinner', 'chalk', 'boxen'];
  const missing = [];

  for (const dep of deps) {
    try {
      await import(dep);
    } catch {
      missing.push(dep);
    }
  }

  if (missing.length > 0) {
    console.error('Missing dependencies:', missing.join(', '));
    console.error('Run: npm install', missing.join(' '));
    process.exit(1);
  }
}

// Bootstrap
(async () => {
  try {
    await checkDeps();
    const app = new SFileApp();
    await app.run();
  } catch (err) {
    console.error(chalk.red('Fatal error:'), (err as Error).message);
    process.exit(1);
  }
})();
