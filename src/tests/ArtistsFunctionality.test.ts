import { expect, Page } from "@playwright/test";
import { BaseTest, test } from "../base/baseTest";

const oneSecWait = 1000;

test.beforeEach(async ({ page, baseTest }) => {
  await page.getByText(baseTest.locators.artistsSectionLink).nth(0).click();
  await page.waitForTimeout(oneSecWait);
  expect(page.locator(baseTest.locators.tableWithArtists)).toBeVisible();
});

async function clickOnContextMenu(
  page: Page,
  baseTest: BaseTest,
  artist: number,
  menuItemLocator: string
) {
  await page.locator(baseTest.locators.artistFromTable).nth(artist).hover();
  await page.locator(baseTest.locators.artistContextMenu).nth(artist).click();
  await page.locator(menuItemLocator).nth(artist).click();
}

test("Validate playing a song from an artist's discography through the context menu", async ({
  page,
  baseTest,
}) => {
  await clickOnContextMenu(page, baseTest, 4, baseTest.locators.playMenuItem);
  await baseTest.isSongPlaying();
});

test("Validate playing a song from an artist discography by clicking on 'Play Next', 'Play Later' or 'Shuffle' context menu options", async ({
  page,
  baseTest,
}) => {
  await clickOnContextMenu(
    page,
    baseTest,
    0,
    baseTest.locators.shuffleMenuItem
  );
  await baseTest.isSongPlaying();
});

test("Validate adding an artist's discography to playlist through the context menu", async ({
  page,
  baseTest,
}) => {
  await clickOnContextMenu(
    page,
    baseTest,
    0,
    baseTest.locators.addToPlaylistMenuItem
  );
  await baseTest.addPlaylist(baseTest.testData.playlistName);
});

test("Validate sharing an artist's discography through the context menu", async ({
  page,
  baseTest,
}) => {
  await clickOnContextMenu(page, baseTest, 0, baseTest.locators.shareMenuItem);
  await baseTest.share(baseTest.testData.shareDescription);
});

test("Validate downloading an artist's discography through the context menu", async ({
  page,
  baseTest,
}) => {
  await clickOnContextMenu(
    page,
    baseTest,
    0,
    baseTest.locators.downloadMenuItem
  );
  await baseTest.download();
});

test("Validate if you are taken to the artist's page after clicking on the artist name", async ({
  page,
  baseTest,
}) => {
  const artistNameLocator = page.locator(baseTest.locators.artistName).nth(0);
  const artistName = await artistNameLocator.textContent();
  await artistNameLocator.click();
  const artistNameOnArtistPage = await page.locator("h5").textContent();
  expect(artistName).toBe(artistNameOnArtistPage);
});

test("Validate searching for an artist", async ({ page, baseTest }) => {
  await page.fill(baseTest.locators.searchBar, baseTest.testData.artistName);
  await page.waitForTimeout(oneSecWait);
  expect(page.locator(baseTest.locators.artistName).nth(0)).toHaveText(
    baseTest.testData.artistName
  );
});

test("Validate rating an artist", async ({ page, baseTest }) => {
  await page.locator(baseTest.locators.artistFromTable).nth(2).hover();
  await page.locator(baseTest.locators.threeStarRatingArtist).click();

  const filledStar = page.locator(baseTest.locators.threeStarFilled);
  await filledStar.waitFor({ state: "visible" });
  expect(filledStar).toBeVisible();
});

test("Validate adding an artist to favourites", async ({ page, baseTest }) => {
  await page.locator(baseTest.locators.artistFromTable).nth(0).hover();
  await page.locator(baseTest.locators.favouritesButton).nth(0).click();
  const artistNameLocator = page.locator(baseTest.locators.artistName).nth(0);
  const artistName = await artistNameLocator.textContent();
  if (artistName === null) {
    throw new Error("Artist name is null");
  }
  await page.getByText(baseTest.locators.addFilterButton).click();
  await page.click(baseTest.locators.favouritesFilter);

  await page.waitForTimeout(oneSecWait);
  const artistNameLocatorInFavourites = page
    .locator(baseTest.locators.artistNameInFavourites)
    .filter({ hasText: artistName });
  await expect(artistNameLocatorInFavourites).toHaveCount(1);
});

test("Validate changing the number of artists shown on the page", async ({
  page,
  baseTest,
}) => {
  const artists = page.locator(baseTest.locators.artistFromTable);
  const count = await artists.count();
  expect(count).toBe(baseTest.texts.fistArtistsCount);
  await page.locator(baseTest.locators.listItemsPerPageButton).click();
  await page.locator(baseTest.locators.option).nth(1).click();
  await page.waitForTimeout(oneSecWait);
  const count2 = await artists.count();
  expect(count2).toBe(baseTest.texts.secondArtistsCount);
});
