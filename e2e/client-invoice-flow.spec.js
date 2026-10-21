const { test, expect } = require("@playwright/test");

test.describe("Full Business Workflow: Client to Invoice Lifecycle (E2E)", () => {
  const timestamp = Date.now();
  const businessUser = {
    name: "Bruce Wayne",
    businessName: "Wayne Solutions",
    email: `wayne_${timestamp}@example.com`,
    password: "Password123!",
  };

  const clientData = {
    name: "Lucius Fox",
    company: "Applied Sciences",
    email: `lucius_${timestamp}@example.com`,
    password: "clientPassword123!",
  };

  test("creates a client, drafts an invoice with line items, and views invoice in list", async ({
    page,
  }) => {
    // 1. Register business account
    await page.goto("/register");
    await page.fill("#name", businessUser.name);
    await page.fill("#businessName", businessUser.businessName);
    await page.fill("#email", businessUser.email);
    await page.fill("#password", businessUser.password);
    await page.click('button:has-text("Create account")');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // 2. Navigate to Clients page
    await page.click('nav a:has-text("Clients")');
    await expect(page).toHaveURL(/.*\/clients/);

    // 3. Click Add client button
    await page.click('button:has-text("Add client")');
    await expect(page).toHaveURL(/.*\/clients\/new/);

    // 4. Fill client form
    await page.fill("#name", clientData.name);
    await page.fill("#company", clientData.company);
    await page.fill("#email", clientData.email);
    await page.fill("#password", clientData.password);
    await page.click('button:has-text("Add client")');

    // 5. Verify client appears in Clients table / list
    await expect(page).toHaveURL(/.*\/clients/, { timeout: 15000 });
    await expect(page.locator(`text=${clientData.name}`)).toBeVisible();

    // 6. Navigate to Invoices page
    await page.click('nav a:has-text("Invoices")');
    await expect(page).toHaveURL(/.*\/invoices/);

    // 7. Click New invoice button
    await page.click('button:has-text("New invoice")');
    await expect(page).toHaveURL(/.*\/invoices\/new/);

    // 8. Select client
    await page.selectOption("select#client", {
      label: `${clientData.name} (${clientData.company})`,
    });

    // 9. Fill line item
    const descInput = page.locator('div:has(> label:has-text("Description")) >> input');
    await descInput.first().fill("Security Architecture & Auditing");

    const priceInput = page.locator('div:has(> label:has-text("Price")) >> input');
    await priceInput.first().fill("7500");

    // 10. Save the invoice
    await page.click('button:has-text("Save invoice")');

    // 11. Verify redirected back to invoices and the invoice exists
    await expect(page).toHaveURL(/.*\/invoices/, { timeout: 15000 });
    await expect(page.locator("text=Draft").first()).toBeVisible();
    await expect(page.locator("text=₹7,500").first()).toBeVisible();
  });
});
