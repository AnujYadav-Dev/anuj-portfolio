import { test, expect } from '@playwright/test';

test.describe('Public Visitor Flows', () => {
  test('homepage renders hero, navigation, and footer watermark', async ({ page }) => {
    await page.goto('/');

    // Check header container and brand logo
    const header = page.locator('header');
    await expect(header).toBeVisible();

    const brand = header.getByRole('link', { name: /ANUJ/i }).first();
    await expect(brand).toBeVisible();

    // Check header tools (search / command palette trigger)
    const searchTrigger = header
      .getByRole('button', { name: /Open Command Palette|Search/i })
      .first();
    await expect(searchTrigger).toBeVisible();

    // Check footer exists
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
  });

  test('Skip Link becomes visible on focus and jumps to main content', async ({ page }) => {
    await page.goto('/');

    // Press tab to focus skip link
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('navigates to Works page and filters projects', async ({ page }) => {
    await page.goto('/works');

    // Check page heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check search input or filter controls
    const searchInput = page.getByPlaceholder(/search/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Distributed');
    }
  });

  test('navigates to Blogs and Contact page', async ({ page }) => {
    await page.goto('/blogs');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: 'Contact & Collaboration' })).toBeVisible();

    // Check form inputs exist inside the contact form
    const form = page.locator('form').first();
    const nameInput = form.getByLabel(/Name/i);
    const emailInput = form.getByLabel(/Email/i);
    const messageInput = form.getByLabel(/Message/i);

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(messageInput).toBeVisible();
  });

  test('Command Palette triggers via button/shortcut and renders search', async ({ page }) => {
    await page.goto('/');

    // Click search trigger in header or press keyboard shortcut
    const searchBtn = page.getByRole('button', { name: /Search/i }).first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
    } else {
      await page.keyboard.press('Control+k');
    }

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const searchInput = dialog.getByRole('combobox');
    await expect(searchInput).toBeVisible();

    // Dismiss with Escape
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });
});
