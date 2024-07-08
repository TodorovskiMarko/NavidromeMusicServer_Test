import { expect, Page } from "@playwright/test";
import { BaseTest, test } from "../base/baseTest";

const oneSecWait = 1000;
const halfSecWait = 500;

test.beforeEach(async ({ page, baseTest }) => {
  await page.locator(baseTest.locators.songsSectionLink).click();
  await page.waitForTimeout(halfSecWait);
  expect(page.locator(baseTest.locators.tableSongs)).toBeVisible();
});

async function validateNavigation(
  page: Page,
  _baseTest: BaseTest,
  itemLocator: string,
  headerLocator: string,
  nthIndex: number
) {
  const nameLocator = page.locator(itemLocator).nth(nthIndex);
  const name = await nameLocator.textContent();
  if (name === null) {
    throw new Error("Item name is null");
  }
  await page.getByText(name).nth(1).click();
  await page.waitForTimeout(oneSecWait);
  const nameOnPage = page.locator(headerLocator).filter({ hasText: name });
  expect(nameOnPage).toHaveCount(1);
}

async function firstSongContextMenu(page: Page, baseTest: BaseTest) {
  await page.locator(baseTest.locators.songNameFromTable).nth(0).hover();
  await page.click(baseTest.locators.firstSongContextMenuOptions);
}

test("Validate playing a song", async ({ page, baseTest }) => {
  await page.locator(baseTest.locators.songFromTable).nth(0).click();
  await baseTest.isSongPlaying();
});

test("Validate playing a song by clicking on the 'SHUFFLE ALL' button", async ({
  page,
  baseTest,
}) => {
  await page.locator(baseTest.locators.shuffleAllButton).click();
  await baseTest.isSongPlaying();
});

test("Validate if you are taken to the album page by clicking on the album name", async ({
  page,
  baseTest,
}) => {
  await validateNavigation(
    page,
    baseTest,
    baseTest.locators.albumNameFromSongs,
    baseTest.locators.header,
    2
  );
});

test("Validate if you are taken to the artist page by clicking on the artist name", async ({
  page,
  baseTest,
}) => {
  await validateNavigation(
    page,
    baseTest,
    baseTest.locators.artistNameFromSongs,
    baseTest.locators.header,
    2
  );
});

test("Validate searching for a song", async ({ page, baseTest }) => {
  await page.fill(
    baseTest.locators.searchBarInSongs,
    baseTest.testData.songName
  );
  await page.press(baseTest.locators.searchBarInSongs, "Enter");
  await page.waitForTimeout(oneSecWait);
  expect(page.locator(baseTest.locators.songNameFromTable)).toHaveText(
    baseTest.testData.songName
  );
});

test("Validate playing a song by clicking on 'Play Now', 'Play Next' or 'Play Later' context menu options", async ({
  page,
  baseTest,
}) => {
  await firstSongContextMenu(page, baseTest);
  await page.locator(baseTest.locators.playNowMenuItem).nth(0).click();
  await baseTest.isSongPlaying();
});

test("Validate adding a song to playlist through the context menu", async ({
  page,
  baseTest,
}) => {
  await firstSongContextMenu(page, baseTest);
  await page.locator(baseTest.locators.addToPlaylistMenuItem).click();
  await baseTest.addPlaylist(baseTest.testData.playlistName);
});

test("Validate sharing a song through the context menu", async ({
  page,
  baseTest,
}) => {
  await firstSongContextMenu(page, baseTest);
  await page.locator(baseTest.locators.shareMenuItem).click();
  await baseTest.share(baseTest.testData.shareDescription);
});

test("Validate downloading a song to through the context menu", async ({
  page,
  baseTest,
}) => {
  await firstSongContextMenu(page, baseTest);
  await page.locator(baseTest.locators.downloadMenuItem).click();
  await baseTest.download();
  await page.locator(baseTest.locators.infoMenuItem).nth(0).click();
  await expect(page.locator(baseTest.locators.infoDialog)).toBeVisible();
});

test("Validate getting info about a song to through the context menu", async ({
  page,
  baseTest,
}) => {
  await firstSongContextMenu(page, baseTest);
  await page.locator(baseTest.locators.infoMenuItem).nth(0).click();
  await expect(page.locator(baseTest.locators.infoDialog)).toBeVisible();
});

test("Validate rating a song", async ({ page, baseTest }) => {
  await page.locator(baseTest.locators.songFromTable).nth(0).hover();
  await page.click(baseTest.locators.fiveStarRatingSong);

  const filledStar = page.locator(baseTest.locators.fiveStarFilled);
  await filledStar.waitFor({ state: "visible" });
  expect(filledStar).toBeVisible();
});

test("Validate adding a song to favourites", async ({ page, baseTest }) => {
  await page.locator(baseTest.locators.songFromTable).nth(0).hover();
  await page.locator(baseTest.locators.favouritesButton).nth(0).click();
  const songNmeLocator = page
    .locator(baseTest.locators.songNameFromTable)
    .nth(0);
  const songName = await songNmeLocator.textContent();
  if (songName === null) {
    throw new Error("Song name is null");
  }
  await page.getByText(baseTest.locators.addFilterButton).click();
  await page.click(baseTest.locators.favouritesFilter);

  await page.waitForTimeout(halfSecWait);
  const songNameInFavourites = page
    .locator(baseTest.locators.songNameInFavourites)
    .filter({ hasText: songName });
  await expect(songNameInFavourites).toHaveCount(1);
});

test("Validate changing the number of songs shown on the page", async ({
  page,
  baseTest,
}) => {
  const songs = page.locator(baseTest.locators.songFromTable);
  const count = await songs.count();
  expect(count).toBe(baseTest.texts.fistSongCount);
  await page.locator(baseTest.locators.listItemsPerPageButton).click();
  await page.locator(baseTest.locators.option).nth(2).click();
  await page.waitForTimeout(oneSecWait);
  const count2 = await songs.count();
  expect(count2).toBe(baseTest.texts.secondSongCount);
});
