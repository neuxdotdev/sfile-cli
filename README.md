# SFile CLI - Professional SFile Downloader

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-GPL--3.0--only-green" alt="License">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node Version">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey" alt="Platform">
</p>

## Overview

SFile CLI is a high-performance command-line tool for downloading files from sfile.mobi with advanced features including parallel downloads, automatic retries, and comprehensive logging. Built with TypeScript and Playwright, it provides a reliable and efficient downloading experience.

## Features

- **Parallel Downloads**: Download multiple files simultaneously
- **Automatic Retry System**: Smart retry mechanism with exponential backoff
- **Multi-Browser Support**: Firefox, Chromium, and WebKit engines
- **Detailed Logging**: Colored output with animated spinners
- **URL Validation**: Automatic sfile.mobi link verification
- **Flexible Output**: Human-readable summary or full JSON export
- **File Name Sanitization**: Safe for all filesystems
- **Debug Tools**: Automatic screenshot capture on errors
- **High Performance**: Optimized for speed and reliability

## Installation

### Method 1: Binary Installation (Recommended)

Download the appropriate binary for your system:

#### Linux

```bash
# AMD64 (x86_64)
curl -L https://github.com/neuxdev/sfile-cli/releases/download/v1.0.0/sfile-cli-1.0.0-linux-x64-70dcb80d -o sfile-cli
chmod +x sfile-cli
sudo mv sfile-cli /usr/local/bin/
```

```bash
# ARM64
curl -L https://github.com/neuxdev/sfile-cli/releases/download/v1.0.0/sfile-cli-1.0.0-linux-arm64-c0e3f974 -o sfile-cli
chmod +x sfile-cli
sudo mv sfile-cli /usr/local/bin/
```

#### macOS

```bash
# Intel
curl -L https://github.com/neuxdev/sfile-cli/releases/download/v1.0.0/sfile-cli-1.0.0-darwin-x64-b1993694 -o sfile-cli
chmod +x sfile-cli
sudo mv sfile-cli /usr/local/bin/
```

```bash
# Apple Silicon (M1/M2/M3)
curl -L https://github.com/neuxdev/sfile-cli/releases/download/v1.0.0/sfile-cli-1.0.0-darwin-arm64-21180a83 -o sfile-cli
chmod +x sfile-cli
sudo mv sfile-cli /usr/local/bin/
```

#### Windows

```powershell
# Using PowerShell
Invoke-WebRequest -Uri "https://github.com/neuxdev/sfile-cli/releases/download/v1.0.0/sfile-cli-1.0.0-windows-x64-5f4e4552.exe" -OutFile "sfile-cli.exe"
# Move to a directory in your PATH
```

### Method 2: NPM Installation

```bash
# Global installation
npm install -g sfile-cli
```

```bash
# Or using npx (no installation required)
npx sfile-cli [options] <urls>
```

### Method 3: Build from Source

```bash
# Clone the repository
git clone https://github.com/neuxdev/sfile-cli.git
cd sfile-cli

# Install dependencies
npm install

# Build the project
npm run build

# Install globally (optional)
npm link
```

### Verification

```bash
sfile-cli --version
# Should output: sfile-cli v1.0.0
```

## Quick Start

```bash
# Single download
sfile-cli https://sfile.mobi/example-file-id
```

```bash
# Multiple files
sfile-cli https://sfile.mobi/file1 https://sfile.mobi/file2
```

```bash
# From text file (one URL per line)
sfile-cli --file urls.txt
```

```bash
# Parallel downloads (3 at once)
sfile-cli --concurrent 3 --file urls.txt
```

```bash
# Specify output directory
sfile-cli --output ~/Downloads https://sfile.mobi/file
```

## Usage

### Basic Syntax

```bash
sfile-cli [options] <urls...>
```

### Command Line Options

| Option                    | Description                                     | Default       |
| ------------------------- | ----------------------------------------------- | ------------- |
| `-h, --help`              | Display help information                        | -             |
| `-v, --version`           | Display version information                     | -             |
| `--browser <name>`        | Browser engine: `firefox`, `chromium`, `webkit` | `firefox`     |
| `--verbose`               | Enable verbose/debug logging                    | `false`       |
| `--json`                  | Output full JSON data (for scripting)           | `false`       |
| `--file <path>`           | Load URLs from text file (one per line)         | -             |
| `--concurrent <n>`        | Maximum concurrent downloads                    | `1`           |
| `--retries <n>`           | Maximum retry attempts per URL                  | `3`           |
| `--timeout <ms>`          | Page load timeout in milliseconds               | `30000`       |
| `--download-timeout <ms>` | Download timeout in milliseconds                | `180000`      |
| `--output <dir>`          | Output directory for downloads                  | `./downloads` |
| `--wait <ms>`             | Wait time between downloads                     | `1000`        |

### Examples

```bash
# Download with Chromium browser
sfile-cli --browser chromium https://sfile.mobi/file123
```

```bash
# Parallel downloads with retries
sfile-cli --concurrent 3 --retries 5 url1 url2 url3
```

```bash
# Verbose output for debugging
sfile-cli --verbose --concurrent 1 url
```

```bash
# JSON output for automation
sfile-cli --json --file urls.txt > results.json
```

```bash
# Custom configuration
sfile-cli --timeout 60000 --download-timeout 300000 --output ~/myfiles url
```

## ️ Configuration

### Default Settings

```javascript
{
  maxConcurrent: 1,      // Maximum parallel downloads
  maxRetries: 3,         // Maximum retry attempts
  timeout: 30000,        // Page load timeout (30 seconds)
  downloadTimeout: 180000, // Download timeout (3 minutes)
  waitForSelectorTimeout: 60000, // Element wait timeout
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
  viewport: {
    width: 1920,
    height: 1080
  }
}
```

### Environment Variables

```bash
# Set custom download directory
export SFILE_DOWNLOAD_DIR="$HOME/Downloads/sfile"

# Set browser preference
export SFILE_BROWSER="chromium"
```

## Output Formats

### Standard Output

```
 Download Summary

 Statistics:
  Total:      5
  Successful: 4
  Failed:     1
  Retries:    3
  Rate:       80.0%
  Time:       2.5m
  Downloaded: 450.25 MB
  Output:     ./downloads

 Files:
   file1.zip (120.50 MB)
   file2.pdf (89.75 MB)
   file3.exe (210.00 MB)
   file4.rar (30.00 MB)

 Failures:
   https://sfile.mobi/xxx (Download timeout)


```

### JSON Output (`--json` flag)

```json
{
  "meta": {
    "name": "sfile-cli",
    "version": "1.0.0",
    "author": "neuxdev",
    "homepage": "https://github.com/neuxdev/sfile-cli"
  },
  "config": { ... },
  "stats": {
    "total": 5,
    "success": 4,
    "failed": 1,
    "retries": 3,
    "startTime": 1735923456789,
    "endTime": 1735923556789,
    "duration": 100000,
    "successRate": 80.0,
    "bytesDownloaded": 471859200
  },
  "results": [
    {
      "url": "https://sfile.mobi/xxx",
      "success": true,
      "filename": "file1.zip",
      "filepath": "/path/to/file1.zip",
      "size": 126353408,
      "downloadUrl": "https://sfile.mobi/download/xxx",
      "retries": 0,
      "attempt": 1,
      "duration": 25000
    }
  ],
  "timestamp": "2026-01-03T18:30:00.000Z"
}
```

## ️ Project Structure

```
sfile-cli/
 src/
    index.ts          # Application entry point
    cli.ts           # Command-line interface
    downloader.ts    # Core download engine
    browser.ts       # Browser management
    utils.ts         # Utilities and logger
    types.ts         # TypeScript definitions
 dist/                # Compiled JavaScript
 downloads/           # Default download directory
 .github/workflows/   # CI/CD configurations
 package.json         # Project metadata
 tsconfig.json       # TypeScript configuration
 README.md           # This file
```

## Development

### Prerequisites

- Node.js 18.0.0 or higher
- npm or pnpm

### Setup

```bash
# Clone repository
git clone https://github.com/neuxdev/sfile-cli.git
cd sfile-cli

# Install dependencies
npm install

# Build project
npm run build

# Run in development mode
npm run dev
```

### Building Binaries

```bash
# Build for current platform
npm run build

# The build script creates executables for multiple platforms
# See .github/workflows/build.yml for cross-compilation details
```

### Available Scripts

```json
{
  "clean": "rm -rf dist .tsbuildinfo",
  "typecheck": "tsc --noEmit",
  "build": "tsc --build tsconfig.json --verbose",
  "dev": "tsx src/index.ts",
  "start": "node dist/index.js",
  "prepublishOnly": "npm run clean && npm run build"
}
```

## Troubleshooting

### Common Issues

1. **Browser Launch Failed**

   ```bash
   # Install Playwright browsers
   npx playwright install
   ```

2. **Download Timeout**

   ```bash
   # Increase timeout values
   sfile-cli --timeout 60000 --download-timeout 300000 url
   ```

3. **Permission Denied**

   ```bash
   # Make binary executable
   chmod +x sfile-cli

   # Or install with sudo
   sudo npm install -g sfile-cli
   ```

4. **Invalid URL Error**
   - Ensure URLs are from sfile.mobi
   - Format: `https://sfile.mobi/xxxxx`
   - Check URL with `--verbose` flag

### Debug Mode

```bash
# Enable full debug logging
sfile-cli --verbose --concurrent 1 https://sfile.mobi/example

# This will show:
# - Detailed process information
# - Automatic screenshots on errors (saved in downloads/)
# - Network requests and responses
```

## License

This project is licensed under the GPL-3.0-only License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **GitHub Issues**: [Report Bugs](https://github.com/neuxdev/sfile-cli/issues)
- **Author**: neuxdev
- **Repository**: [https://github.com/neuxdev/sfile-cli](https://github.com/neuxdev/sfile-cli)

## Acknowledgments

- Built with [Playwright](https://playwright.dev/) for browser automation
- Powered by [TypeScript](https://www.typescriptlang.org/) for type safety
- Enhanced with [chalk](https://github.com/chalk/chalk) and [boxen](https://github.com/sindresorhus/boxen) for beautiful CLI output

> [!NOTE]
> This tool is not affiliated with sfile.mobi. Use wisely and respect copyright.

---

<div align="center">
  <p>Made with ️ by <a href="https://github.com/neuxdev">neuxdev</a></p>
  <p>
    <a href="https://github.com/neuxdev/sfile-cli/stargazers">⭐ Star on GitHub</a>
    <a href="https://github.com/neuxdev/sfile-cli/issues">Report Bug</a>
    <a href="https://github.com/neuxdev/sfile-cli/pulls">Request Feature</a>
  </p>
</div>
