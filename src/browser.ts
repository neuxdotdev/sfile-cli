import { chromium, firefox, webkit } from 'playwright';
import type { Browser, BrowserContext } from 'playwright';
import { Logger } from './utils.js';
import type { AppConfig } from './types.js';

export class BrowserManager {
  private browser: Browser | null = null;
  private contexts: Set<BrowserContext> = new Set();

  constructor(private logger: Logger, private config: AppConfig) {}

  async launch(browserType: 'firefox' | 'chromium' | 'webkit' = 'firefox') {
    const launchers = { firefox, chromium, webkit };
    const launcher = launchers[browserType];

    if (!launcher) throw new Error(`Browser ${browserType} not supported`);

    this.logger.info(`Launching ${browserType}...`);
    this.browser = await launcher.launch({ headless: true });
    return this.browser;
  }

  async newContext(): Promise<BrowserContext> {
    if (!this.browser) throw new Error('Browser not launched');

    const context = await this.browser.newContext({
      acceptDownloads: true,
      userAgent: this.config.userAgent,
      viewport: this.config.viewport,
    });

    this.contexts.add(context);
    return context;
  }

  async closeContext(context: BrowserContext) {
    try {
      if (this.contexts.has(context)) {
        await context.close();
        this.contexts.delete(context);
      }
    } catch (err) {
      this.logger.debug(`Failed to close context: ${err}`);
    }
  }

  async shutdown() {
    for (const ctx of this.contexts) await this.closeContext(ctx);
    if (this.browser) await this.browser.close();
    this.logger.debug('Browser closed');
  }
}
