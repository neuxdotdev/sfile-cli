import fs from 'fs';
import readline from 'readline/promises';
import { stdin, stdout } from 'process';
import chalk from 'chalk';
import boxen from 'boxen';
import { META, Utils, DEFAULT_CONFIG, Logger } from './utils.js';
import type { CliOptions, DownloadResult, DownloadStats, AppConfig } from './types.js';

export class CLI {
  private config: AppConfig = { ...DEFAULT_CONFIG };
  private options: Omit<CliOptions, 'config'> = {
    browser: 'firefox',
    verbose: false,
    fullJson: false,
    links: [],
    downloadDir: './downloads',
  };

  parse(args: string[]) {
    const argv = args.slice(2);

    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];

      switch (arg) {
        case '-h':
        case '--help':
          this.showHelp();
          process.exit(0);

        case '-v':
        case '--version':
          console.log(`${META.name} v${META.version}`);
          process.exit(0);

        case '--browser': {
          const value = argv[++i];
          if (value !== 'firefox' && value !== 'chromium' && value !== 'webkit') {
            throw new Error('--browser must be one of: firefox | chromium | webkit');
          }
          this.options.browser = value;
          break;
        }

        case '--verbose':
          this.options.verbose = true;
          break;

        case '--json':
          this.options.fullJson = true;
          break;

        case '--output': {
          const value = argv[++i];
          if (!value) {
            throw new Error('--output requires a directory path');
          }
          this.options.downloadDir = value;
          break;
        }

        case '--file': {
          const value = argv[++i];
          if (!value) {
            throw new Error('--file requires a file path');
          }
          this.loadFile(value);
          break;
        }

        case '--concurrent': {
          const value = argv[++i];
          const num = Number(value);
          this.config.maxConcurrent = Number.isInteger(num) && num > 0 ? num : 1;
          break;
        }

        case '--retries': {
          const value = argv[++i];
          const num = Number(value);
          this.config.maxRetries = Number.isInteger(num) && num >= 0 ? num : 3;
          break;
        }

        default:
          if (arg && !arg.startsWith('-')) {
            this.options.links.push(arg);
          }
          break;
      }
    }

    return this;
  }

  async prompt() {
    if (this.options.links.length === 0) {
      const rl = readline.createInterface({ input: stdin, output: stdout });
      const answer = await rl.question(chalk.cyan('Enter SFile URL(s): '));
      rl.close();

      const links = Utils.parseLinks(answer);
      if (links.length === 0) {
        console.error(chalk.red('No URLs provided'));
        process.exit(1);
      }

      this.options.links = links.filter(Utils.validateUrl);
    }

    return this;
  }

  getOptions(): CliOptions {
    return {
      ...this.options,
      config: this.config,
    };
  }

  private loadFile(path: string) {
    try {
      const content = fs.readFileSync(path, 'utf-8');
      this.options.links.push(...Utils.parseLinks(content).filter(Utils.validateUrl));
    } catch (err) {
      console.error(chalk.red(`Cannot read file: ${path}`));
      process.exit(1);
    }
  }

  private showHelp() {
    console.log(
      boxen(
        chalk.bold(`${META.name} v${META.version}`) +
          '\n\n' +
          chalk.cyan('Usage:') +
          '\n  sfile-cli [options] <url...>\n' +
          '\n' +
          chalk.cyan('Options:') +
          '\n  -h, --help          Show help' +
          '\n  -v, --version       Show version' +
          '\n  --browser <name>    firefox|chromium|webkit' +
          '\n  --verbose           Verbose output' +
          '\n  --json              JSON output' +
          '\n  --file <path>       Load URLs from file' +
          '\n  --concurrent <n>    Concurrent downloads' +
          '\n  --retries <n>       Max retries (default: 3)' +
          '\n  --output <dir>      Output directory' +
          '\n\n' +
          chalk.cyan('Examples:') +
          '\n  sfile-cli https://sfile.mobi/xxx' +
          '\n  sfile-cli --concurrent 2 --browser chromium url1 url2' +
          '\n  sfile-cli --file links.txt --output ~/downloads',
        { padding: 1, borderStyle: 'round', borderColor: 'blue' }
      )
    );
  }
}

export class Output {
  constructor(private logger: Logger) {}

  showSummary(results: DownloadResult[], stats: DownloadStats, dir: string) {
    this.logger.info('summary');
    console.log('\n' + chalk.bold.cyan('╭─ Download Summary ─╮'));

    console.log(chalk.bold('\n📊 Statistics:'));
    console.log(`  Total:      ${stats.total}`);
    console.log(`  Successful: ${chalk.green(stats.success)}`);
    console.log(`  Failed:     ${stats.failed > 0 ? chalk.red(stats.failed) : '0'}`);
    console.log(`  Retries:    ${stats.retries}`);
    console.log(`  Rate:       ${chalk.bold(stats.successRate.toFixed(1))}%`);
    console.log(`  Time:       ${Utils.formatTime(stats.duration)}`);
    console.log(`  Downloaded: ${Utils.formatBytes(stats.bytesDownloaded)}`);
    console.log(`  Output:     ${chalk.underline(dir)}`);

    console.log(chalk.bold('\n📁 Files:'));
    results
      .filter((r) => r.success)
      .forEach((r) => {
        const size = r.size ? Utils.formatBytes(r.size) : '?';
        console.log(`  ${chalk.green('✓')} ${r.filename} ${chalk.gray(`(${size})`)}`);
      });

    if (stats.failed > 0) {
      console.log(chalk.bold.red('\n❌ Failures:'));
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`  ${chalk.red('✗')} ${r.url} ${chalk.gray(`(${r.error})`)}`);
        });
    }

    console.log(chalk.bold.cyan('\n╰─────────────────────╯\n'));
  }

  showJson(results: DownloadResult[], stats: DownloadStats, config: any) {
    console.log(
      JSON.stringify(
        {
          meta: META,
          config,
          stats,
          results,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      )
    );
  }

  calculateStats(results: DownloadResult[]): DownloadStats {
    const startTime = Math.min(...results.map((r) => r.duration || 0));
    const endTime = Date.now();
    const success = results.filter((r) => r.success).length;
    const bytes = results.reduce((sum, r) => sum + (r.size || 0), 0);

    return {
      total: results.length,
      success,
      failed: results.length - success,
      retries: results.reduce((sum, r) => sum + r.retries, 0),
      startTime,
      endTime,
      duration: endTime - startTime,
      successRate: (success / results.length) * 100,
      bytesDownloaded: bytes,
    };
  }
}
