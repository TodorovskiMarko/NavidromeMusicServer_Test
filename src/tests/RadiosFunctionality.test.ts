import { expect, Page } from "@playwright/test";
import { BaseTest, test } from "../base/baseTest";

let threeSecWait = 3000;
let twoSecWait = 2000;
let oneSecWait = 1000;
let sixSecWait = 6000;

test.beforeEach(async ({ page, baseTest }) => {
  await page.getByText(baseTest.locators.radiosSectionLink).click();
  expect(page.locator(baseTest.locators.radiosTable)).toBeVisible();
});

async function playRadio(page: Page, baseTest: BaseTest) {
  await page.locator(baseTest.locators.radioFromTable).nth(0).click();
  await page.waitForTimeout(threeSecWait);
await baseTest.isSongPlaying()
}

test("Validate playing a radio", async ({ page, baseTest }) => {
  await playRadio(page, baseTest);
});

test("Validate stopping a radio after playing it", async ({
  page,
  baseTest,
}) => {
  await playRadio(page, baseTest);
  await page.click(baseTest.locators.pauseSongButton);
  expect(page.locator(baseTest.locators.playSongButton)).toBeVisible();
});

test("Validate muting a radio", async ({ page, baseTest }) => {
  await playRadio(page, baseTest);
  await page.click(baseTest.locators.volumeButton);
  await page.waitForTimeout(twoSecWait);
  await baseTest.isVolumeMuted(page, baseTest);
});

test("Validate muting a radio using the volume bar", async ({
  page,
  baseTest,
}) => {
  await playRadio(page, baseTest);
  await baseTest.muteThroughVolumeBar(page, baseTest);
  await baseTest.isVolumeMuted(page, baseTest);
});

test("Validate closing the radio panel after playing it", async ({
  page,
  baseTest,
}) => {
  await playRadio(page, baseTest);
  await page.click(baseTest.locators.closePanelButton);
  expect(page.locator(baseTest.locators.panel)).not.toBeVisible();
});

test("Validate searching for a radio", async ({ page, baseTest }) => {
  const radioNameLocator = page.locator(baseTest.locators.radioName);
  const radioName = await radioNameLocator.nth(2).textContent();
  if (radioName === null) {
    throw new Error();
  }
  await page.fill(baseTest.locators.searchBar, baseTest.testData.radioName);
  await page.waitForTimeout(oneSecWait);
  expect(radioNameLocator).toHaveText(radioName);
});

test("Validate navigating to the home page of the radio", async ({
  page,
  baseTest,
}) => {
  const [newPage] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(baseTest.locators.homePageUrlRadio).nth(0).click(),
  ]);

  await newPage.waitForURL(baseTest.texts.firstRadioUrl, {
    timeout: sixSecWait,
  });
  const currentURL = newPage.url();
  expect(currentURL).toBe(baseTest.texts.firstRadioUrl);
});

// There are 'Previous track' and 'Next track' buttons on the radio panel.
// The 'Previous track' button rewinds the song by 2 seconds, while the 'Next track' button stops the radio.
// I think they should be removed from the radio panel as they serve no real purpose.
