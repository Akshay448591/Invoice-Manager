const { test, expect } = require("@playwright/test");

test.describe("Authentication & Route Protection Flow (E2E)", () => {
  const timestamp = Date.now();
  const testUser = {
    name: "John Enterprise",
    businessName: "Nexus Dynamics",
    email: `nexus_${timestamp}@example.com`,
    password: "Password123!",
  };

  test("unauthenticated user is redirected to /login when visiting protected pages", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*\/login/);

    await page.goto("/invoices");
    await expect(page).toHaveURL(/.*\/login/);

    await page.goto("/clients");
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("user can register, log out, and log back in successfully", async ({
    page,
  }) => {
    // 1. Navigate to Register
    await page.goto("/register");
    await expect(page).toHaveTitle(/Invoice Manager/i);

    // 2. Fill registration form
    await page.fill("#name", testUser.name);
    await page.fill("#businessName", testUser.businessName);
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);

    // 3. Submit form
    await page.click('button:has-text("Create account")');

    // 4. Should redirect to dashboard upon successful registration
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator("text=Nexus Dynamics")).toBeVisible();

    // 5. Log out
    await page.click('button:has-text("Log out")');
    await expect(page).toHaveURL(/.*\/login/, { timeout: 15000 });

    // 6. Log back in with registered credentials
    await page.fill("#email", testUser.email);
    await page.fill("#password", testUser.password);
    await page.click('button:has-text("Log in")');

    // 7. Land on dashboard again
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator("text=Nexus Dynamics")).toBeVisible();
  });
});
