import { test, expect } from '@playwright/test';

test.describe('Analytics & Visitor Tracking Flows', () => {
  test('public browsing registers telemetry and appears in admin analytics dashboard', async ({ page }) => {
    // 1. Visit public portfolio with UTM parameters
    await page.goto('/?utm_source=linkedin&utm_medium=social&utm_campaign=portfolio_eval');
    await page.waitForTimeout(1000);

    // Verify hero and title
    await expect(page.locator('header')).toBeVisible();

    // 2. Navigate to Works and scroll
    await page.goto('/works');
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // 3. Navigate to Contact page
    await page.goto('/contact');
    await page.waitForTimeout(500);

    // 4. Log into Admin Dashboard
    await page.goto('/admin/login');
    await page.getByLabel(/Email/i).fill('anujy7591@gmail.com');
    await page.getByLabel(/Password/i).fill('Admin@123');
    await page.getByRole('button', { name: /Sign In|Login/i }).click();

    // 5. Navigate to Visitor Analytics
    await page.goto('/admin/analytics');
    await expect(page.getByRole('heading', { name: /Visitor Telemetry & Analytics Dashboard/i })).toBeVisible();

    // 6. Verify Topline KPI cards and Trajectory Chart render
    await expect(page.getByText(/Page Views/i).first()).toBeVisible();
    await expect(page.getByText(/Unique Visitors/i).first()).toBeVisible();
    await expect(page.getByText(/online now/i)).toBeVisible();
    await expect(page.getByText(/Global Visitor Distribution/i)).toBeVisible();

    // 7. Verify Top Visited Pages & Logs exist
    await expect(page.getByText(/Top Visited Pages & Content Readership/i)).toBeVisible();
    await expect(page.getByText(/Live Visitor Session Logs/i)).toBeVisible();
  });
});
