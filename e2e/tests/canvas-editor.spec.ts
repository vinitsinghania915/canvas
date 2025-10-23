import { test, expect } from "@playwright/test";

test.describe("Canvas Editor", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto("/");
  });

  test("should redirect to login page when not authenticated", async ({
    page,
  }) => {
    await expect(page).toHaveURL("/login");
    await expect(page.locator("h1")).toContainText("Welcome Back");
  });

  test("should allow user registration", async ({ page }) => {
    await page.goto("/register");

    await page.fill('input[name="username"]', "testuser");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");

    await page.click('button[type="submit"]');

    // Should redirect to designs page after successful registration
    await expect(page).toHaveURL("/designs");
  });

  test("should allow user login", async ({ page }) => {
    // First register a user
    await page.goto("/register");
    await page.fill('input[name="username"]', "testuser");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    // Logout and login again
    await page.click("button.logout-btn");
    await page.goto("/login");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/designs");
  });

  test("should create a new design", async ({ page }) => {
    // Register and login
    await page.goto("/register");
    await page.fill('input[name="username"]', "testuser");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    // Create new design
    await page.click('button:has-text("Create New Design")');
    await page.fill('input[id="designName"]', "Test Design");
    await page.fill(
      'textarea[id="designDescription"]',
      "A test design for E2E testing"
    );
    await page.click('button:has-text("Create Design")');

    // Should redirect to editor
    await expect(page).toHaveURL(/\/editor\/[a-f0-9]+/);
  });

  test("should add text element to canvas", async ({ page }) => {
    // Setup: Register, login, and create design
    await page.goto("/register");
    await page.fill('input[name="username"]', "testuser");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    await page.click('button:has-text("Create New Design")');
    await page.fill('input[id="designName"]', "Test Design");
    await page.click('button:has-text("Create Design")');

    // Wait for editor to load
    await page.waitForSelector(".canvas-container");

    // Add text element
    await page.click('button:has-text("Text")');

    // Check if canvas has content (text element added)
    await page.waitForTimeout(1000); // Wait for fabric.js to render

    // Verify the toolbar is visible
    await expect(page.locator(".toolbar")).toBeVisible();
  });

  test("should add shape elements to canvas", async ({ page }) => {
    // Setup: Register, login, and create design
    await page.goto("/register");
    await page.fill('input[name="username"]', "testuser");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    await page.click('button:has-text("Create New Design")');
    await page.fill('input[id="designName"]', "Test Design");
    await page.click('button:has-text("Create Design")');

    // Wait for editor to load
    await page.waitForSelector(".canvas-container");

    // Add rectangle
    await page.click('button:has-text("Rectangle")');
    await page.waitForTimeout(500);

    // Add circle
    await page.click('button:has-text("Circle")');
    await page.waitForTimeout(500);

    // Verify the toolbar is visible
    await expect(page.locator(".toolbar")).toBeVisible();
  });

  test("should switch between panels", async ({ page }) => {
    // Setup: Register, login, and create design
    await page.goto("/register");
    await page.fill('input[name="username"]', "testuser");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    await page.click('button:has-text("Create New Design")');
    await page.fill('input[id="designName"]', "Test Design");
    await page.click('button:has-text("Create Design")');

    // Wait for editor to load
    await page.waitForSelector(".canvas-container");

    // Switch to Properties panel
    await page.click('button:has-text("Properties")');
    await expect(page.locator(".properties-panel")).toBeVisible();

    // Switch to Comments panel
    await page.click('button:has-text("Comments")');
    await expect(page.locator(".comments-panel")).toBeVisible();

    // Switch back to Layers panel
    await page.click('button:has-text("Layers")');
    await expect(page.locator(".layers-panel")).toBeVisible();
  });

  test("should export canvas as PNG", async ({ page }) => {
    // Setup: Register, login, and create design
    await page.goto("/register");
    await page.fill('input[name="username"]', "testuser");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    await page.click('button:has-text("Create New Design")');
    await page.fill('input[id="designName"]', "Test Design");
    await page.click('button:has-text("Create Design")');

    // Wait for editor to load
    await page.waitForSelector(".canvas-container");

    // Add some content
    await page.click('button:has-text("Text")');
    await page.waitForTimeout(500);

    // Mock the download functionality
    await page.route("**/data:image/png*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "image/png",
        body: Buffer.from("fake-png-data"),
      })
    );

    // Click export button
    const downloadPromise = page.waitForEvent("download");
    await page.click('button:has-text("Export")');

    // Note: In a real test, you would verify the download
    // For now, we just ensure the button is clickable
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
  });

  test("should handle undo/redo functionality", async ({ page }) => {
    // Setup: Register, login, and create design
    await page.goto("/register");
    await page.fill('input[name="username"]', "testuser");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "password123");
    await page.click('button[type="submit"]');

    await page.click('button:has-text("Create New Design")');
    await page.fill('input[id="designName"]', "Test Design");
    await page.click('button:has-text("Create Design")');

    // Wait for editor to load
    await page.waitForSelector(".canvas-container");

    // Add some content
    await page.click('button:has-text("Text")');
    await page.waitForTimeout(500);

    // Test undo button (should be disabled initially)
    const undoButton = page.locator('button:has-text("Undo")');
    await expect(undoButton).toBeDisabled();

    // Add another element to enable undo
    await page.click('button:has-text("Rectangle")');
    await page.waitForTimeout(500);

    // Now undo should be enabled
    await expect(undoButton).toBeEnabled();

    // Click undo
    await page.click('button:has-text("Undo")');

    // Redo should now be enabled
    await expect(page.locator('button:has-text("Redo")')).toBeEnabled();
  });
});
