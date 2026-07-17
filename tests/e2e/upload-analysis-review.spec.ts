import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test("upload, measure both sides, confirm, and export presentation results", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto("/opg-assistant");
  await page
    .getByRole("button", { name: "Complete measurement guide" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "How to measure third-molar angulation",
    }),
  ).toBeVisible();
  await expect(page.getByText("Step 4")).toBeVisible();
  await page.getByRole("button", { name: "I understand" }).click();
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );
  await page.locator('input[type="file"]').setInputFiles({
    name: "synthetic-opg.png",
    mimeType: "image/png",
    buffer: png,
  });
  await expect(
    page.getByAltText("Preview of selected panoramic image"),
  ).toBeVisible();
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Open measurement workspace" })
    .click();
  await expect(page).toHaveURL(/\/opg-assistant\/analysis\//, {
    timeout: 15_000,
  });
  await expect(page.getByText("OPG Angulation Measurement")).toBeVisible();
  await expect(
    page.getByText("Measurement scope: teeth 38 and 48."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Measure third and second molar axes" })
    .click();
  const stage = page.locator(".image-stage");
  await stage.click({ position: { x: 220, y: 330 } });
  await stage.click({ position: { x: 260, y: 150 } });
  await stage.click({ position: { x: 340, y: 330 } });
  await stage.click({ position: { x: 340, y: 150 } });
  await expect(
    page.getByText("Winter's classification — confirm"),
  ).toBeVisible();
  await expect(page.locator(".angle-readout")).toContainText("Winter result");
  await page
    .getByRole("button", { name: "Reset marking and start again" })
    .click();
  await expect(page.getByText("Point 1 of 4:")).toBeVisible();
  await stage.click({ position: { x: 220, y: 330 } });
  await stage.click({ position: { x: 260, y: 150 } });
  await stage.click({ position: { x: 340, y: 330 } });
  await stage.click({ position: { x: 340, y: 150 } });
  await page
    .getByRole("region", { name: "Tooth 48" })
    .locator(".finding-card")
    .click();
  await page
    .getByRole("button", { name: "Measure third and second molar axes" })
    .click();
  await stage.click({ position: { x: 540, y: 330 } });
  await stage.click({ position: { x: 500, y: 150 } });
  await stage.click({ position: { x: 420, y: 330 } });
  await stage.click({ position: { x: 420, y: 150 } });
  await page.getByRole("button", { name: "Show both measurements" }).click();
  await expect(page.locator(".measurement-overlay")).toHaveCount(2);
  await expect(page.locator(".angle-readout-left")).toBeVisible();
  await expect(page.locator(".angle-readout-right")).toBeVisible();
  await page.getByRole("button", { name: "Hide both measurements" }).click();
  await page.getByRole("button", { name: "Print preview" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Mandibular Third Molar Angulation Results",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close print preview" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF" }).click();
  const download = await downloadPromise;
  await mkdir("tmp/pdfs", { recursive: true });
  await download.saveAs("tmp/pdfs/opg-bilateral-report-sample.pdf");
  await page.getByRole("button", { name: "Confirm result" }).first().click();
  await page
    .getByRole("button", { name: "Generate observation summary" })
    .click();
  await expect(page.getByLabel("Observation summary")).toContainText(
    "THESIS PRESENTATION OBSERVATION SUMMARY",
  );
});
