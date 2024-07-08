import { expect, Page } from "@playwright/test";
import { BaseTest, test } from "../base/baseTest";

let oneSecWait = 1000;
let threeSecWait = 3000;

async function addToShare(page: Page, baseTest: BaseTest, index: number) {
  await page.locator(baseTest.locators.albumCover).nth(index).hover();
  await page
    .locator(baseTest.locators.contextMenuOnAlbumButton)
    .nth(index)
    .click();
  await page.locator(baseTest.locators.shareMenuItem).nth(index).click();
  await baseTest.share(baseTest.testData.shareDescription3);
  await page.getByText(baseTest.locators.sharesSectionLink).click();
  await page.waitForLoadState("load");
}

test("Validate playing the share link by clicking on it's id", async ({
  page,
  baseTest,
}) => {
  await addToShare(page, baseTest, 0);
  const idLocator = page.locator(baseTest.locators.shareId).nth(0);
  const shareId = await idLocator.textContent();
  if (shareId === null) {
    throw new Error();
  }

  const [newPage] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByText(shareId).nth(0).click(),
  ]);

  await newPage.waitForLoadState("load");
  const newPageTitle = await newPage.title();
  expect(newPageTitle).not.toBe("");

  await newPage.locator(baseTest.locators.sharePagePlayButton).nth(0).click();
  const audioElement = await newPage.$("audio");
  if (audioElement === null) {
    throw new Error();
  }
  const initialTime = await audioElement.evaluate((node) => node.currentTime);
  await newPage.waitForTimeout(threeSecWait);
  const currentTime = await audioElement.evaluate((node) => node.currentTime);
  expect(currentTime).toBeGreaterThan(initialTime);
});

// After deletion, the notification reads 'Element deleted'. I would prefer 'Share link deleted'
test("Validate deleting a share link", async ({ page, baseTest }) => {
  await addToShare(page, baseTest, 0);

  const idLocator = page.locator(baseTest.locators.shareId).nth(0);
  const shareId = await idLocator.textContent();
  if (shareId === null) {
    throw new Error();
  }

  await page.locator(baseTest.locators.selectShareLink).nth(0).click();
  await page.waitForSelector(baseTest.locators.delete);
  await page.click(baseTest.locators.delete);
  await page.waitForTimeout(oneSecWait);
  expect(page.locator(baseTest.locators.successMessage)).toBeVisible();

  const shareIdLocator = page.locator(`text=${shareId}`);
  const isShareIdVisible = await shareIdLocator.isVisible();

  expect(isShareIdVisible).toBe(false);
});

//The download doesn't start - REPORT DEFECT!!!
test("Validate allowing downloads on a share and then try downloading the share content", async ({
  page,
  baseTest,
}) => {
  await addToShare(page, baseTest, 0);
  const downloadNotAllowedIcon = page
    .locator(baseTest.locators.downloadNotAllowedIcon)
    .nth(0);
  await page.locator(baseTest.locators.shareFromTable).nth(0).click();
  await page.waitForSelector(baseTest.locators.allowDownloadsButton);
  await page.click(baseTest.locators.allowDownloadsButton);
  await page.click(baseTest.locators.saveButton);
  await page.waitForTimeout(oneSecWait);

  expect(page.locator(baseTest.locators.successMessage)).toBeVisible();
  const downloadAllowedIcon = page
    .locator(baseTest.locators.downloadAllowedIcon)
    .nth(0);
  expect(downloadAllowedIcon).toBeVisible();
  expect(downloadAllowedIcon).not.toBe(downloadNotAllowedIcon);

  await page.waitForTimeout(threeSecWait);
  const idLocator = page.locator(baseTest.locators.shareId).nth(0);
  const shareId = await idLocator.textContent();
  if (shareId === null) {
    throw new Error();
  }

  const [newPage] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByText(shareId).nth(0).click(),
  ]);

  await newPage.click(baseTest.locators.downloadButtonInShare);
});

test("Validate changing the description on a share", async ({
  page,
  baseTest,
}) => {
  await addToShare(page, baseTest, 0);
  await page.locator(baseTest.locators.shareFromTable).nth(0).click();
  await page.waitForSelector(baseTest.locators.shareDescriptionField);
  await page.fill(
    baseTest.locators.shareDescriptionField,
    baseTest.testData.newShareDescription
  );
  await page.click(baseTest.locators.saveButton);
  await page.waitForTimeout(oneSecWait);

  expect(page.locator(baseTest.locators.successMessage)).toBeVisible();
  const descriptionColumn = page
    .locator(baseTest.locators.descriptionColumn)
    .nth(0);
  expect(descriptionColumn).toHaveText(baseTest.testData.newShareDescription);
});

test("Validate changing the expiration day of the share link", async ({
  page,
  baseTest,
}) => {
  await addToShare(page, baseTest, 0);
  await page.locator(baseTest.locators.shareFromTable).nth(0).click();
  const dateValue = baseTest.testData.dateValue;
  await page.fill(baseTest.locators.shareExpireField, dateValue);
  const inputValue = await page.inputValue(baseTest.locators.shareExpireField);
  expect(inputValue).toBe(dateValue);
  await page.click(baseTest.locators.saveButton);
  await page.waitForTimeout(oneSecWait);

  expect(page.locator(baseTest.locators.successMessage)).toBeVisible();
  const expiresColumn = page.locator(baseTest.locators.expiresColumn).nth(0);
  const actualDateTime = await expiresColumn.textContent();
  const datePart = actualDateTime?.split(", ")[0];
  expect(datePart).toBe(baseTest.testData.date);
});

test("Validate if the number in 'Visits' column changes after playing a share", async ({
  page,
  baseTest,
}) => {
  await addToShare(page, baseTest, 0);
  const idLocator = page.locator(baseTest.locators.shareId).nth(0);
  const shareId = await idLocator.textContent();
  if (shareId === null) {
    throw new Error();
  }

  const [newPage] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByText(shareId).nth(0).click(),
  ]);

  await newPage.waitForLoadState("load");
  await newPage.close();

  await page.reload();
  await page.waitForSelector(baseTest.locators.visitsColumn);
  expect(page.locator(baseTest.locators.visitsColumn).nth(0)).toHaveText("1");
});
