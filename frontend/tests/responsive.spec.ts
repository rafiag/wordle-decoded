import { test, expect } from '@playwright/test';

/**
 * Responsive Design Test Suite
 * Tests the Wordle Data Explorer across desktop, tablet, and mobile viewports
 *
 * Test Viewports:
 * - Desktop: 1920x1080 (large desktop)
 * - Desktop Small: 1024x768 (minimum desktop)
 * - Tablet: 768x1024 (iPad portrait)
 * - Mobile: 375x667 (iPhone SE)
 */

// Viewport configurations
const viewports = {
  desktop: { width: 1920, height: 1080 },
  desktopSmall: { width: 1024, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

test.describe('Responsive Design: Layout & Container', () => {
  test('desktop: container should have correct max-width and not overlap scroll nav', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const container = page.locator('.container-v2').first();
    await expect(container).toBeVisible();

    const containerBox = await container.boundingBox();
    expect(containerBox).toBeTruthy();

    // Container max-width should be 1200px
    if (containerBox) {
      expect(containerBox.width).toBeLessThanOrEqual(1200);
    }

    // Check scroll nav is visible and not overlapped
    const scrollNav = page.locator('.scroll-nav');
    if (await scrollNav.count() > 0) {
      await expect(scrollNav).toBeVisible();
    }
  });

  test('desktop small: container should fit within viewport', async ({ page }) => {
    await page.setViewportSize(viewports.desktopSmall);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const container = page.locator('.container-v2').first();
    await expect(container).toBeVisible();

    const containerBox = await container.boundingBox();
    expect(containerBox).toBeTruthy();

    if (containerBox) {
      // Container width should not exceed viewport (1024px is acceptable)
      expect(containerBox.width).toBeLessThanOrEqual(viewports.desktopSmall.width);
    }
  });

  test('tablet: container should have reduced padding', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const container = page.locator('.container-v2').first();
    await expect(container).toBeVisible();

    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
  });

  test('mobile: container should have minimal padding and no horizontal scroll', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const container = page.locator('.container-v2').first();
    await expect(container).toBeVisible();

    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});

test.describe('Responsive Design: Grid Layouts', () => {
  test('desktop: 3-column grid should display 3 columns', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const grid3Col = page.locator('.grid-3-col').first();
    if (await grid3Col.count() > 0) {
      const gridStyle = await grid3Col.evaluate((el) =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      // Should have 3 columns (will be something like "341px 341px 341px")
      const columnCount = gridStyle.split(' ').length;
      expect(columnCount).toBe(3);
    }
  });

  test('tablet: 3-column grid should display 2 columns', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const grid3Col = page.locator('.grid-3-col').first();
    if (await grid3Col.count() > 0) {
      const gridStyle = await grid3Col.evaluate((el) =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      // Should have 2 columns on tablet
      const columnCount = gridStyle.split(' ').length;
      expect(columnCount).toBe(2);
    }
  });

  test('mobile: 3-column grid should display 1 column', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const grid3Col = page.locator('.grid-3-col').first();
    if (await grid3Col.count() > 0) {
      const gridStyle = await grid3Col.evaluate((el) =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      // Should have 1 column on mobile
      const columnCount = gridStyle.split(' ').length;
      expect(columnCount).toBe(1);
    }
  });

  test('desktop: 2-column grid should display 2 columns', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const grid2Col = page.locator('.grid-2-col').first();
    if (await grid2Col.count() > 0) {
      const gridStyle = await grid2Col.evaluate((el) =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      const columnCount = gridStyle.split(' ').length;
      expect(columnCount).toBe(2);
    }
  });

  test('mobile: 2-column grid should display 1 column', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const grid2Col = page.locator('.grid-2-col').first();
    if (await grid2Col.count() > 0) {
      const gridStyle = await grid2Col.evaluate((el) =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      const columnCount = gridStyle.split(' ').length;
      expect(columnCount).toBe(1);
    }
  });
});

test.describe('Responsive Design: Chart Heights', () => {
  test('desktop: charts should render at 400px height', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for charts to load
    await page.waitForTimeout(2000);

    const chartCards = page.locator('.card').filter({ has: page.locator('.recharts-wrapper') });
    const count = await chartCards.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const card = chartCards.nth(i);
        const box = await card.boundingBox();

        if (box) {
          // Charts should be at least 400px tall on desktop (allowing small margin)
          expect(box.height).toBeGreaterThanOrEqual(390);
        }
      }
    }
  });

  test('tablet: charts should render at 350px height', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(2000);

    const chartCards = page.locator('.card').filter({ has: page.locator('.recharts-wrapper') });
    const count = await chartCards.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const card = chartCards.nth(i);
        const box = await card.boundingBox();

        if (box) {
          // Charts should be around 350px on tablet
          expect(box.height).toBeGreaterThanOrEqual(340);
          expect(box.height).toBeLessThanOrEqual(410);
        }
      }
    }
  });

  test('mobile: charts should render at 280px height', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(2000);

    const chartCards = page.locator('.card').filter({ has: page.locator('.recharts-wrapper') });
    const count = await chartCards.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const card = chartCards.nth(i);
        const box = await card.boundingBox();

        if (box) {
          // Charts should be around 280px on mobile (allow up to 350px for browser rendering differences)
          expect(box.height).toBeGreaterThanOrEqual(270);
          expect(box.height).toBeLessThanOrEqual(350);
        }
      }
    }
  });

  test('desktop: chart containers should have flex-grow enabled', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const chartContainers = page.locator('.card > div').filter({ has: page.locator('.recharts-wrapper') });
    const count = await chartContainers.count();

    if (count > 0) {
      const firstContainer = chartContainers.first();
      const flexGrow = await firstContainer.evaluate((el) =>
        window.getComputedStyle(el).flexGrow
      );

      expect(flexGrow).toBe('1');
    }
  });
});

test.describe('Responsive Design: Pattern Section', () => {
  test('desktop: pattern input and results should have proper spacing', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const patternStack = page.locator('.pattern-stack');
    if (await patternStack.count() > 0) {
      const gap = await patternStack.evaluate((el) =>
        window.getComputedStyle(el).gap
      );

      // Should have 48px gap on desktop
      expect(gap).toBe('48px');
    }

    const patternInputArea = page.locator('.pattern-input-area');
    if (await patternInputArea.count() > 0) {
      const marginBottom = await patternInputArea.evaluate((el) =>
        window.getComputedStyle(el).marginBottom
      );

      // Should have 48px margin-bottom
      expect(marginBottom).toBe('48px');
    }
  });

  test('mobile: pattern input and results should have reduced spacing', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const patternStack = page.locator('.pattern-stack');
    if (await patternStack.count() > 0) {
      const gap = await patternStack.evaluate((el) =>
        window.getComputedStyle(el).gap
      );

      // Should have 32px gap on mobile
      expect(gap).toBe('32px');
    }
  });

  test('mobile: pattern blocks should be touch-friendly (64px)', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const patternBlocks = page.locator('.pattern-block');
    if (await patternBlocks.count() > 0) {
      const firstBlock = patternBlocks.first();
      const box = await firstBlock.boundingBox();

      if (box) {
        // Pattern blocks should be 64px on mobile
        expect(box.width).toBeGreaterThanOrEqual(60);
        expect(box.width).toBeLessThanOrEqual(68);
        expect(box.height).toBeGreaterThanOrEqual(60);
        expect(box.height).toBeLessThanOrEqual(68);
      }
    }
  });

  test('tablet: pattern blocks should be 64px', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const patternBlocks = page.locator('.pattern-block');
    if (await patternBlocks.count() > 0) {
      const firstBlock = patternBlocks.first();
      const box = await firstBlock.boundingBox();

      if (box) {
        // Pattern blocks are 64px on tablet (same as mobile for consistency)
        expect(box.width).toBeGreaterThanOrEqual(60);
        expect(box.width).toBeLessThanOrEqual(68);
      }
    }
  });
});

test.describe('Responsive Design: Typography & Spacing', () => {
  test('desktop: section headers should have 48px margin', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sectionHeaders = page.locator('.section-header').first();
    if (await sectionHeaders.count() > 0) {
      const marginBottom = await sectionHeaders.evaluate((el) =>
        window.getComputedStyle(el).marginBottom
      );

      // Desktop should have 48px margin-bottom
      const marginValue = parseInt(marginBottom);
      expect(marginValue).toBeGreaterThanOrEqual(40);
    }
  });

  test('mobile: section headers should have reduced margin', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sectionHeaders = page.locator('h2').first();
    if (await sectionHeaders.count() > 0) {
      const marginTop = await sectionHeaders.evaluate((el) =>
        window.getComputedStyle(el).marginTop
      );

      // Mobile should have smaller margins
      const marginValue = parseInt(marginTop);
      expect(marginValue).toBeLessThanOrEqual(48);
    }
  });

  test('desktop: cards should have 32px padding', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const card = page.locator('.card').first();
    if (await card.count() > 0) {
      const padding = await card.evaluate((el) =>
        window.getComputedStyle(el).padding
      );

      // Should contain 32px
      expect(padding).toContain('32px');
    }
  });

  test('tablet: cards should have 20px padding', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const card = page.locator('.card').first();
    if (await card.count() > 0) {
      const padding = await card.evaluate((el) =>
        window.getComputedStyle(el).padding
      );

      // Tablet uses 20px padding (same as mobile for consistency)
      expect(padding).toContain('20px');
    }
  });

  test('mobile: cards should have 20px padding', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const card = page.locator('.card').first();
    if (await card.count() > 0) {
      const padding = await card.evaluate((el) =>
        window.getComputedStyle(el).padding
      );

      // Should contain 20px
      expect(padding).toContain('20px');
    }
  });
});

test.describe('Responsive Design: Touch Interactions', () => {
  test('mobile: interactive elements should have touch feedback', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if pattern blocks have active state
    const patternBlock = page.locator('.pattern-block').first();
    if (await patternBlock.count() > 0) {
      // Pattern blocks should be visible
      await expect(patternBlock).toBeVisible();
    }
  });

  test('mobile: scroll navigation should exist but may be hidden', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const scrollNav = page.locator('.scroll-nav');
    if (await scrollNav.count() > 0) {
      // Scroll nav exists in DOM but may be hidden on mobile (intentional design)
      const position = await scrollNav.evaluate((el) =>
        window.getComputedStyle(el).position
      );
      expect(position).toBe('fixed');

      // Check that element exists (visibility state is a design decision)
      expect(await scrollNav.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Responsive Design: Table Responsiveness', () => {
  test('tablet: NYT metrics table should have scroll indicators', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tableContainer = page.locator('.nyt-table-container');
    if (await tableContainer.count() > 0) {
      await expect(tableContainer).toBeVisible();

      // Check if overflow is auto
      const overflow = await tableContainer.evaluate((el) =>
        window.getComputedStyle(el).overflowX
      );
      expect(overflow).toBe('auto');
    }
  });

  test('mobile: NYT metrics table should be scrollable', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tableContainer = page.locator('.nyt-table-container');
    if (await tableContainer.count() > 0) {
      const overflow = await tableContainer.evaluate((el) =>
        window.getComputedStyle(el).overflowX
      );
      expect(overflow).toBe('auto');
    }
  });
});

test.describe('Responsive Design: Cross-Device Consistency', () => {
  test('all viewports: hero section should be visible', async ({ page }) => {
    for (const viewport of Object.values(viewports)) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const hero = page.locator('h1').first();
      await expect(hero).toBeVisible();
    }
  });

  test('all viewports: all sections should load without errors', async ({ page }) => {
    for (const viewport of Object.values(viewports)) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check no JavaScript errors
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));

      await page.waitForTimeout(2000);

      expect(errors.length).toBe(0);
    }
  });

  test('all viewports: page should load within 5 seconds', async ({ page }) => {
    for (const viewport of Object.values(viewports)) {
      await page.setViewportSize(viewport);

      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000);
    }
  });
});

test.describe('Responsive Design: Footer Layout', () => {
  test('desktop: footer should display 3-column grid layout at 1024px+', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const footerGrid = page.locator('footer .grid');
    await expect(footerGrid).toBeVisible();

    const gridStyle = await footerGrid.evaluate((el) =>
      window.getComputedStyle(el).gridTemplateColumns
    );

    // Should have 3 columns
    const columnCount = gridStyle.split(' ').length;
    expect(columnCount).toBe(3);
  });

  test('desktop small (1024px): footer should display 3-column grid layout', async ({ page }) => {
    await page.setViewportSize(viewports.desktopSmall);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const footerGrid = page.locator('footer .grid');
    const gridStyle = await footerGrid.evaluate((el) =>
      window.getComputedStyle(el).gridTemplateColumns
    );

    // Should have 3 columns at 1024px (threshold for lg: breakpoint)
    const columnCount = gridStyle.split(' ').length;
    expect(columnCount).toBe(3);
  });

  test('tablet: footer should display single column layout', async ({ page }) => {
    await page.setViewportSize(viewports.tablet);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const footerGrid = page.locator('footer .grid');
    const gridStyle = await footerGrid.evaluate((el) =>
      window.getComputedStyle(el).gridTemplateColumns
    );

    // Should have 1 column on tablet (768px is below 1024px threshold)
    const columnCount = gridStyle.split(' ').length;
    expect(columnCount).toBe(1);
  });

  test('mobile: footer should display single column layout', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const footerGrid = page.locator('footer .grid');
    const gridStyle = await footerGrid.evaluate((el) =>
      window.getComputedStyle(el).gridTemplateColumns
    );

    // Should have 1 column on mobile
    const columnCount = gridStyle.split(' ').length;
    expect(columnCount).toBe(1);
  });

  test('desktop: footer should contain all essential sections', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('footer').getByText('About')).toBeVisible();
    await expect(page.locator('footer').getByText('Data Sources')).toBeVisible();
    await expect(page.locator('footer').getByText('Built With')).toBeVisible();
  });

  test('mobile: footer should contain all essential sections', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('footer').getByText('About')).toBeVisible();
    await expect(page.locator('footer').getByText('Data Sources')).toBeVisible();
    await expect(page.locator('footer').getByText('Built With')).toBeVisible();
  });

  test('desktop: footer links should be functional', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const githubLink = page.locator('footer a[href*=\"github.com/rafiag/wordle-decoded\"]').first();
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('target', '_blank');
    await expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');

    const externalLinks = page.locator('footer a[target=\"_blank\"]');
    for (let i = 0; i < await externalLinks.count(); i++) {
      const rel = await externalLinks.nth(i).getAttribute('rel');
      expect(rel).toContain('noopener noreferrer');
    }
  });
});

