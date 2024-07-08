import { expect, Page } from "@playwright/test";
import { BaseTest, test } from "../base/baseTest";

let oneSecWait = 1000;

async function navigateToCreatePlaylist(page: Page, baseTest: BaseTest) {
  const playlistSettings = page.locator(baseTest.locators.settings).nth(1);
  await playlistSettings.click();
  await page.waitForLoadState("load");
  await page.click(baseTest.locators.createPlaylistButton);
}

async function isPlaylistCreated(page: Page, baseTest: BaseTest) {
  await page.click(baseTest.locators.saveButton);
  await page.waitForSelector(baseTest.locators.playlistCreatedAlert);
  expect(page.locator(baseTest.locators.playlistCreatedAlert)).toBeVisible();
}

async function fillField(page: Page, baseTest: BaseTest, namePlaylist: string) {
  await page.fill(baseTest.locators.namePlaylistField, namePlaylist);
}

test("Validate creating an empty playlist by only filling the required(*) fields", async ({
  page,
  baseTest,
}) => {
  await navigateToCreatePlaylist(page, baseTest);
  await fillField(page, baseTest, baseTest.testData.namePlaylist);
  await isPlaylistCreated(page, baseTest);
});

test("Validate creating an empty playlist by filling all the fields", async ({
  page,
  baseTest,
}) => {
  await navigateToCreatePlaylist(page, baseTest);
  await fillField(page, baseTest, baseTest.testData.namePlaylist);
  await page.fill(
    baseTest.locators.commentField,
    baseTest.testData.playlistComment
  );
  await isPlaylistCreated(page, baseTest);
});

test("Validate editing a playlist", async ({ page, baseTest }) => {
  await navigateToCreatePlaylist(page, baseTest);
  await fillField(page, baseTest, baseTest.testData.namePlaylist);
  await isPlaylistCreated(page, baseTest);
  await page.click(baseTest.locators.editPlaylistButton);
  await page.fill(
    baseTest.locators.commentField,
    baseTest.testData.playlistComment
  );
  await page.click(baseTest.locators.publicButton);
  await isPlaylistCreated(page, baseTest);
});

test("Validate deleting a playlist", async ({ page, baseTest }) => {
  await navigateToCreatePlaylist(page, baseTest);
  await fillField(page, baseTest, baseTest.testData.namePlaylist2);
  await isPlaylistCreated(page, baseTest);
  const playlistRow = page
    .locator(baseTest.locators.playlistTable)
    .filter({ hasText: baseTest.testData.namePlaylist2 })
    .nth(0);

  const selectPlaylistButton = playlistRow.locator(
    baseTest.locators.selectPlaylistButton
  );

  await selectPlaylistButton.waitFor({ state: "visible" });
  await selectPlaylistButton.click();
  await page.click(baseTest.locators.delete);
  await page.waitForTimeout(1000);
  expect(playlistRow).not.toBeVisible();
});

test("Validate searching for a playlist", async ({ page, baseTest }) => {
  await navigateToCreatePlaylist(page, baseTest);
  await fillField(page, baseTest, baseTest.testData.namePlaylist3);
  await isPlaylistCreated(page, baseTest);
  await page.fill(
    baseTest.locators.playlistSearchBar,
    baseTest.testData.namePlaylist3
  );
  await page.waitForTimeout(oneSecWait);
  expect(page.locator(baseTest.locators.playlistNameColumn).nth(0)).toHaveText(
    baseTest.testData.namePlaylist3
  );
});

test("Valdiate adding songs to an empty playlist", async ({
  page,
  baseTest,
}) => {
  await navigateToCreatePlaylist(page, baseTest);
  await fillField(page, baseTest, baseTest.testData.namePlaylist4);
  await isPlaylistCreated(page, baseTest);
  await page.getByText(baseTest.locators.recentlyAddedSectionLink).click();
  await page.waitForLoadState("load");

  await page.locator(baseTest.locators.albumCover).nth(0).hover();
  await page.locator(baseTest.locators.contextMenuOnAlbumButton).nth(0).click();
  await page.locator(baseTest.locators.addToPlaylistMenuItem).nth(0).click();
  await page.waitForTimeout(oneSecWait);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(oneSecWait);
  await page.keyboard.press("Enter");
  await page.click(baseTest.locators.addPlaylistWindow);
  await page.click(baseTest.locators.addPlaylistButton);

  await page.locator(baseTest.locators.settings).nth(1).click();
  await page.waitForLoadState("load");
  await expect(
    page.locator(baseTest.locators.playlistSongsColumn).nth(0)
  ).toHaveText(/.+/);
});
