import { test, expect } from '@playwright/test';

/**
 * Diagnostic test to debug element visibility issues
 */
test.describe('Diagnostic Tests', () => {
  test('check page loads and log HTML structure', async ({ page }, testInfo) => {
    const baseUrl = testInfo.project.use.baseURL || 'unknown';

    // Attach diagnostic info to test report
    await testInfo.attach('diagnostic-start', {
      body: `Starting diagnostic test...\nBase URL: ${baseUrl}`,
      contentType: 'text/plain',
    });

    const diagnosticReport: string[] = [];

    // Navigate to homepage
    await page.goto('/');
    diagnosticReport.push('✅ Page navigation complete');

    // Wait for different load states
    await page.waitForLoadState('domcontentloaded');
    diagnosticReport.push('✅ DOM content loaded');

    await page.waitForLoadState('load');
    diagnosticReport.push('✅ Page load complete');

    await page.waitForLoadState('networkidle');
    diagnosticReport.push('✅ Network idle');

    // Get page title
    const title = await page.title();
    diagnosticReport.push(`📄 Page title: ${title}`);

    // Get page URL
    const url = page.url();
    diagnosticReport.push(`🌐 Current URL: ${url}`);

    // Check for JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', error => {
      diagnosticReport.push(`❌ JavaScript error: ${error.message}`);
      errors.push(error.message);
    });

    // Wait a bit to catch any errors
    await page.waitForTimeout(2000);

    // Get body HTML (first 1000 chars)
    const bodyHTML = await page.locator('body').innerHTML();
    diagnosticReport.push(`\n📝 Body HTML (first 1000 chars):\n${bodyHTML.substring(0, 1000)}`);

    // Check if specific elements exist
    const containerExists = await page.locator('.container-v2').count();
    diagnosticReport.push(`\n🔍 .container-v2 elements found: ${containerExists}`);

    const h1Exists = await page.locator('h1').count();
    diagnosticReport.push(`🔍 h1 elements found: ${h1Exists}`);

    const divCount = await page.locator('div').count();
    diagnosticReport.push(`🔍 Total div elements: ${divCount}`);

    // Check for React root
    const reactRoot = await page.locator('#root').count();
    diagnosticReport.push(`🔍 #root elements found: ${reactRoot}`);

    // Get all class names in the body
    const classNames = await page.evaluate(() => {
      const elements = document.body.querySelectorAll('[class]');
      const classes = new Set<string>();
      elements.forEach(el => {
        const className = el.getAttribute('class');
        if (className && typeof className === 'string') {
          className.split(' ').forEach(cls => {
            if (cls.trim()) classes.add(cls.trim());
          });
        }
      });
      return Array.from(classes).sort().slice(0, 30);
    });
    diagnosticReport.push(`\n🏷️  First 30 class names found:\n${classNames.join(', ')}`);

    // Check network requests
    const requests: string[] = [];
    page.on('request', request => requests.push(request.url()));

    // Reload to capture requests
    await page.reload();
    await page.waitForLoadState('networkidle');

    diagnosticReport.push(`\n📡 Network requests made (${requests.length} total):`);
    requests.slice(0, 15).forEach(url => diagnosticReport.push(`   - ${url}`));

    // Check if API is accessible
    let apiStatus = 'Not tested';
    try {
      const apiResponse = await page.request.get('http://backend:8000/api/overview');
      apiStatus = `${apiResponse.status()} - ${apiResponse.statusText()}`;
      diagnosticReport.push(`\n🔌 Backend API status: ${apiStatus}`);
    } catch (error) {
      apiStatus = `Error: ${error}`;
      diagnosticReport.push(`\n❌ Backend API error: ${error}`);
    }

    // Attach full diagnostic report
    await testInfo.attach('diagnostic-report', {
      body: diagnosticReport.join('\n'),
      contentType: 'text/plain',
    });

    // Take a screenshot
    await testInfo.attach('screenshot', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });

    // Final assertions
    expect(containerExists, '.container-v2 should be present').toBeGreaterThan(0);
    expect(h1Exists, 'h1 should be present').toBeGreaterThan(0);
    expect(errors.length, 'No JavaScript errors').toBe(0);
  });
});
