import { test, expect } from "@playwright/test";

test("search, route trace and comparison", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Total books", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Book search" }).click();
  await page
    .getByPlaceholder("Search title, author, or category...")
    .fill("Hawking");
  await expect(
    page.getByRole("heading", { name: "A Brief History of Time" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Locate" }).click();
  await page.getByRole("button", { name: "Find route" }).click();
  await expect(page.getByText("Your route is ready")).toBeVisible();
  await page.getByLabel("DESTINATION").selectOption("SHELF_A1");
  await expect(page.getByText("Ready when you are")).toBeVisible();
  await page.getByRole("button", { name: "Find route" }).click();
  await page.getByRole("button", { name: "Inspect search steps" }).click();
  await page.getByRole("button", { name: "Compare algorithms" }).click();
  await expect(
    page.getByRole("cell", { name: "BFS", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "DFS", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "A*", exact: true }),
  ).toBeVisible();
});

test("changing a selected book clears a collection route", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Collection planner" }).click();
  await page.getByLabel("A Brief History of Time").check();
  await page.getByLabel("Sapiens").check();
  await page.getByRole("button", { name: "Plan collection route" }).click();
  await expect(page.getByText("Total movement cost")).toBeVisible();
  await page.getByLabel("The Great Gatsby").check();
  await expect(page.getByText("Total movement cost")).not.toBeVisible();
});

test("administration rejects an invalid token", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Administration" }).click();
  await page.getByLabel("ADMINISTRATOR TOKEN").fill("invalid-test-token");
  await page.getByRole("button", { name: "Load settings" }).click();
  await expect(
    page.getByText("Valid administrator token required."),
  ).toBeVisible();
});

test("administrator can save constraints on an isolated test database", async ({ page }) => {
  const token = process.env.SHELFWISE_TEST_ADMIN_TOKEN;
  test.skip(!token, "Requires the isolated administrator test server");
  await page.goto("/");
  await page.getByRole("button", { name: "Administration" }).click();
  await page.getByLabel("ADMINISTRATOR TOKEN").fill(token!);
  await page.getByRole("button", { name: "Load settings" }).click();
  await page.getByLabel("Science", { exact: true }).check();
  await page.getByRole("button", { name: "Save constraints" }).click();
  await expect(page.getByText("Constraints saved. Existing routes were cleared.")).toBeVisible();
  await page.getByRole("button", { name: "Library map" }).click();
  await expect(page.getByLabel("DESTINATION").locator("option", { hasText: "Science" })).toHaveCount(0);
});
