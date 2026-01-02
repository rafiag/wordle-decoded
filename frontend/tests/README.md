# Playwright E2E Testing Guide

This guide explains how to run end-to-end tests for the Wordle Data Explorer using Playwright.

## Overview

Playwright is configured to test the application across multiple browsers (Chromium, Firefox, WebKit) and viewports (Desktop and Mobile). Tests verify core functionality, responsive design, and API integration.

## Running Tests Locally

### Prerequisites
- Node.js and npm installed
- Development server running on `http://localhost:3000`

### Commands

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests headless
npm run test:e2e

# Run with visible browser (watch tests execute)
npm run test:e2e:headed

# Run with Playwright UI (interactive debugging)
npm run test:e2e:ui

# Run in debug mode (step through tests)
npm run test:e2e:debug

# Generate tests interactively
npm run playwright:codegen
```

### Local Test Configuration
- Playwright automatically starts the Vite dev server before running tests
- Base URL: `http://localhost:3000`
- Tests run in parallel across 6 workers (default)
- All browser projects run by default

## Running Tests in Docker

### Prerequisites
- Docker and Docker Compose installed
- Main application services running (`docker compose up`)

### Setup Steps

1. **Ensure your application is running:**
   ```bash
   docker compose up
   ```
   This starts the database, backend, and frontend services.

2. **Run Playwright tests in Docker:**
   ```bash
   docker compose --profile test run --rm playwright
   ```

### How Docker Tests Work

**Service Configuration** (from `docker-compose.yml`):
```yaml
playwright:
  image: mcr.microsoft.com/playwright:v1.49.0-jammy
  container_name: wordle-playwright
  working_dir: /app
  volumes:
    - ./frontend:/app
  environment:
    - PLAYWRIGHT_BASE_URL=http://frontend:3000
    - CI=true
  depends_on:
    - frontend
  command: npx playwright test
  network_mode: "service:frontend"
  profiles:
    - test
```

**Key Configuration Details:**

- **Image**: Uses official Microsoft Playwright Docker image with pre-installed browsers
- **Base URL**: `http://frontend:3000` (internal Docker network)
- **Network Mode**: `service:frontend` - Shares network with frontend container for direct access
- **Profile**: `test` - Only runs when explicitly called with `--profile test`
- **CI Mode**: `CI=true` enables CI-specific settings (retry on failure, optimized reporters)

### First-Time Docker Setup

The first time you run tests in Docker, the Playwright image (~1.5GB) will be downloaded automatically. This can take several minutes depending on your internet connection.

### Docker vs Local Testing

| Aspect | Local | Docker |
|--------|-------|--------|
| **Speed** | Faster (no container overhead) | Slower (container startup) |
| **Setup** | Requires `npx playwright install` | No setup (browsers pre-installed) |
| **Environment** | Uses your system | Isolated Linux environment |
| **CI Alignment** | May differ from CI | Matches CI environment exactly |
| **Network** | localhost:3000 | Internal Docker network |
| **Best For** | Development/debugging | CI/CD validation |

## Test Structure

Tests are located in `frontend/tests/`:
- `example.spec.ts` - Sample tests for homepage and API integration

### Writing New Tests

Create new test files in the `tests/` directory with `.spec.ts` extension:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');

    // Your test logic here
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

## Configuration

Playwright configuration is defined in `playwright.config.ts`:

- **Test Directory**: `./tests`
- **Base URL**: `http://localhost:3000` (local) or `http://frontend:3000` (Docker)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 retries in CI mode, 0 locally
- **Screenshots**: Captured on failure
- **Traces**: Captured on first retry

## Viewing Test Results

### HTML Report
After tests complete, view the HTML report:
```bash
npx playwright show-report
```

### Screenshots and Videos
Failed test screenshots are saved to `test-results/` directory (ignored by git).

## Troubleshooting

### Tests fail with "page.goto: net::ERR_CONNECTION_REFUSED"
- Ensure the development server is running
- Check that the frontend is accessible at `http://localhost:3000`

### Docker tests timeout
- Increase timeout in `playwright.config.ts`
- Ensure frontend container is fully started before running tests
- Check Docker logs: `docker compose logs frontend`

### Browsers not installed (local)
Run:
```bash
npx playwright install
```

### Tests pass locally but fail in Docker
- Check environment variables in `docker-compose.yml`
- Verify `PLAYWRIGHT_BASE_URL` is set correctly
- Review network configuration between services

## CI/CD Integration

For continuous integration, use the Docker approach to ensure consistent environment:

```yaml
# Example GitHub Actions workflow
- name: Run E2E Tests
  run: docker compose --profile test run --rm playwright
```

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Writing Tests](https://playwright.dev/docs/writing-tests)
- [Debugging Tests](https://playwright.dev/docs/debug)
