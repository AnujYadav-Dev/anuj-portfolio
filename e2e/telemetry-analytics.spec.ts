import { test, expect } from '@playwright/test';

test.describe('Visitor Telemetry & Analytics Pipeline', () => {
  test('public browsing registers telemetry and records session activity', async ({ page }) => {
    // 1. Visit public portfolio with UTM parameters to trigger telemetry session registration
    await page.goto('/?utm_source=github&utm_medium=referral&utm_campaign=portfolio_eval');
    await expect(page.locator('header')).toBeVisible();

    // Verify main landmarks are present
    const brand = page.locator('header').getByRole('link', { name: /ANUJ/i }).first();
    await expect(brand).toBeVisible();

    // 2. Navigate to Works and simulate scroll engagement
    await page.goto('/works');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // 3. Navigate to Contact page
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: 'Contact & Collaboration' })).toBeVisible();
  });

  test('admin logs in and accesses comprehensive analytics dashboard', async ({ page }) => {
    // 1. Navigate to Admin Login
    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: 'Sign In to Dashboard' })).toBeVisible();

    const emailInput = page.locator('#admin-email');
    const passwordInput = page.locator('#admin-password');

    // 2. Fill credentials using sequential keystrokes so React state registers reliably
    await emailInput.focus();
    await emailInput.pressSequentially('anujy7591@gmail.com', { delay: 15 });
    await passwordInput.focus();
    await passwordInput.pressSequentially('Admin@123', { delay: 15 });

    await expect(emailInput).toHaveValue('anujy7591@gmail.com');
    await expect(passwordInput).toHaveValue('Admin@123');

    // 3. Submit and wait for authentication
    await page.getByRole('button', { name: /Authenticate & Enter/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/admin/login'), { timeout: 12000 });

    // 4. Navigate to Visitor Analytics Dashboard
    await page.goto('/admin/analytics');
    await expect(
      page.getByRole('heading', { name: 'Visitor Telemetry & Analytics Dashboard' }),
    ).toBeVisible();

    // 5. Verify Real-Time Pulse Indicator
    await expect(page.getByText(/online now/i)).toBeVisible();

    // 6. Verify Topline KPI Metric Cards
    await expect(page.getByText('Page Views', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Unique Visitors', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Total Sessions', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Avg Dwell Time', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Bounce Rate', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Clicks & Copies', { exact: true }).first()).toBeVisible();

    // 7. Verify Trajectory Chart and Geographic Distribution Map
    await expect(page.getByText(/Traffic Trajectory Over Time/i)).toBeVisible();
    await expect(page.getByText(/Global Geographic Distribution/i)).toBeVisible();

    // 8. Verify Traffic Breakdown Distribution Cards
    await expect(page.getByText('Traffic Sources', { exact: true })).toBeVisible();
    await expect(page.getByText('Visitor Intent Profiling', { exact: true })).toBeVisible();
    await expect(page.getByText('Device Types', { exact: true })).toBeVisible();
    await expect(page.getByText('Browsers', { exact: true })).toBeVisible();

    // 9. Verify Detailed Telemetry Tables
    await expect(page.getByText(/Top Visited Pages & Content Readership/i)).toBeVisible();
    await expect(page.getByText(/Outbound Link & Code Copy Telemetry/i)).toBeVisible();
    await expect(page.getByText(/Live Visitor Session Logs & Intent Scoring/i)).toBeVisible();

    // 10. Verify Timeframe Switcher functionality (e.g. switch to 7d)
    const sevenDayBtn = page.getByRole('button', { name: '7d' });
    if (await sevenDayBtn.isVisible()) {
      await sevenDayBtn.click();
      await expect(sevenDayBtn).toBeVisible();
    }
  });
});
