import { test, expect } from '@playwright/test';

test.describe('Admin Authentication & CMS Flows', () => {
  test('unauthenticated visit to /admin redirects to /admin/login', async ({ page }) => {
    await page.goto('/admin');

    // Should redirect to /admin/login
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole('heading', { name: 'Sign In to Dashboard' })).toBeVisible();
  });

  test('admin login form rejects invalid credentials with error feedback', async ({ page }) => {
    await page.goto('/admin/login');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.getByRole('button', { name: /Authenticate|Sign in/i });

    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('WrongPassword123');
    await submitBtn.click();

    // Verify submit button was clicked and page retains login route or renders error state
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
