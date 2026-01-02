import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Wordle Data Explorer
 * Supports both Docker and local development environments
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Use 6 workers on CI, default on local */
  workers: process.env.CI ? 6 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['./tests/custom-reporter.ts'], // Custom progress reporter with detailed logging
    ['html'], // Generate HTML report at the end
    ['json', { outputFile: 'test-results/results.json' }], // JSON results for CI/analysis
    ['junit', { outputFile: 'test-results/junit.xml' }], // JUnit XML for CI integration
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against tablet viewports. */
    {
      name: 'iPad (gen 7)',
      use: { ...devices['iPad (gen 7)'] },
    },
    {
      name: 'iPad Pro 11',
      use: { ...devices['iPad Pro 11'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
