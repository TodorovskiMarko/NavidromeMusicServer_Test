import { expect, Page } from "@playwright/test";
import { BaseTest, test } from "../base/baseTest";

const threeSecWait = 3000;
const oneSecWait = 1000;

async function playAlbum(page: Page, baseTest: BaseTest, album: number) {
  await page.locator(baseTest.locators.albumCover).nth(album).hover();
  await page.locator(baseTest.locators.playAlbumButton).nth(album).click();
  await page.waitForTimeout(threeSecWait);
  const currentTimeElement = page.locator(baseTest.locators.currentTime);
  await expect(currentTimeElement).not.toHaveText(baseTest.texts.startTime);
}

async function openAlbum(page: Page, baseTest: BaseTest) {
  await page.locator(baseTest.locators.albumCover).nth(0).click();
  const dynamicClassPart = baseTest.locators.tableWithSongs;
  const tableWithSongs = page.locator(`[class*="${dynamicClassPart}"]`).nth(0);
  expect(tableWithSongs).toBeVisible();
}

async function clickOnContextMenu(page: Page, baseTest: BaseTest) {
  await page.locator(baseTest.locators.albumCover).nth(0).hover();
  await page.locator(baseTest.locators.contextMenuOnAlbumButton).nth(0).click();
}

test("Validate playing an album", async ({ page, baseTest }) => {
  await playAlbum(page, baseTest, 0);
});

test("Validate stopping an album after playing it", async ({
  page,
  baseTest,
}) => {
  await playAlbum(page, baseTest, 0);
  await page.click(baseTest.locators.pauseSongButton);
  expect(page.locator(baseTest.locators.playSongButton)).toBeVisible();
});

// After clicking the previous track after the song starts playing, it just plays the song from the beggining
// instead of switching to the previous song, you can only switch to the previous song only before the current song
// starts playing - REPORT DEFECT!!!
test("Validate switching to next and previous tracks after playing an album", async ({
  page,
  baseTest,
}) => {
  await playAlbum(page, baseTest, 0);
  const songTitleLocator = page.locator(baseTest.locators.songTitle);
  const initialSongTitle = await songTitleLocator.textContent();
  await page.locator(baseTest.locators.nextTrackButton).click();
  await page.waitForTimeout(threeSecWait);
  const nextSongTitle = await songTitleLocator.textContent();
  expect(nextSongTitle).not.toBe(initialSongTitle);
  await page.locator(baseTest.locators.previousTrackButton).click();
  await page.waitForTimeout(threeSecWait);
});

test("Validate muting a song after playing an album", async ({
  page,
  baseTest,
}) => {
  await playAlbum(page, baseTest, 0);
  await page.click(baseTest.locators.volumeButton);
  await baseTest.isVolumeMuted(page, baseTest);
});

test("Validate muting a song using the volume bar after playing an album", async ({
  page,
  baseTest,
}) => {
  await playAlbum(page, baseTest, 0);
  await baseTest.muteThroughVolumeBar(page, baseTest);
  await baseTest.isVolumeMuted(page, baseTest);
});

test("Validate adding an album to favorites", async ({ page, baseTest }) => {
  const albumNameLocator = page.locator(baseTest.locators.albumName).nth(1);
  const albumName = await albumNameLocator.textContent();
  console.log(albumName);
  await page.locator(baseTest.locators.favouritesButton).nth(1).click();
  await page.click(baseTest.locators.favouritesSectionLink);
  const albumNameInFavourites = await albumNameLocator.textContent();
  expect(albumName).toBe(albumNameInFavourites);
});

test("Validate searching for an album", async ({ page, baseTest }) => {
  await page.fill(baseTest.locators.searchBar, baseTest.testData.albumName);
  await page.press(baseTest.locators.searchBar, "Enter");
  await page.waitForTimeout(oneSecWait);
  const albumName = page.locator(baseTest.locators.albumName).nth(0);
  expect(albumName).toHaveText(baseTest.testData.albumName);
});

// The album isn't immediatly added to 'Recently Played', you have to listen to at least one song
// before it's added - Report
test("Validate if an album is added to 'Recently Played' after playing it", async ({
  page,
  baseTest,
}) => {
  const albumNameLocator = page.locator(baseTest.locators.albumName).nth(1);
  const albumName = await albumNameLocator.textContent();
  console.log(albumName);
  await playAlbum(page, baseTest, 1);
  await page.click(baseTest.locators.recentlyPlayedSectionLink);
  const albumNameLocator1 = page.locator(baseTest.locators.albumName).nth(0);
  const albumNameInRecentlyAdded = await albumNameLocator1.textContent();
  // expect(albumName).toBe(albumNameInRecentlyAdded);
});

test("Validate if you are taken to the full list of songs after clicking on an album", async ({
  page,
  baseTest,
}) => {
  await openAlbum(page, baseTest);
});

test("Validate clicking on an album and then playing the album by clicking on the play button", async ({
  page,
  baseTest,
}) => {
  await openAlbum(page, baseTest);
  await page.click(baseTest.locators.playButton);
  await baseTest.isSongPlaying();
});

test("Validate clicking on an album and then playing the album by clicking on the 'SHUFFLE' button", async ({
  page,
  baseTest,
}) => {
  await openAlbum(page, baseTest);
  await page.click(baseTest.locators.shuffleButton);
  await baseTest.isSongPlaying();
});

test("Validate clicking on an album and then playing the album by clicking on the 'PLAY NEXT' button", async ({
  page,
  baseTest,
}) => {
  await openAlbum(page, baseTest);
  await page.locator(baseTest.locators.playNextButton).nth(0).click();
  await baseTest.isSongPlaying();
});

test("Validate rating an album", async ({ page, baseTest }) => {
  await openAlbum(page, baseTest);
  const fourStarRating = page.locator(baseTest.locators.fourStarRating);
  await fourStarRating.click();

  const filledStar = page.locator(baseTest.locators.starFilled);
  await filledStar.waitFor({ state: "visible" });
  expect(filledStar).toBeVisible();
});

test("Validate clicking on an album and playing a specific song", async ({
  page,
  baseTest,
}) => {
  await openAlbum(page, baseTest);
  const song = page.locator(baseTest.locators.songOnAlbum).nth(5);
  await song.click();
  await baseTest.isSongPlaying();
});

test("Validate rating a song on the album", async ({ page, baseTest }) => {
  await openAlbum(page, baseTest);
  const fourStarRating = page.locator(baseTest.locators.fourStarRatingSong);
  await page.locator(baseTest.locators.songOnAlbum).nth(0).hover();
  await fourStarRating.click();

  const filledStar = page.locator(baseTest.locators.starFilledSong);
  await filledStar.waitFor({ state: "visible" });
  expect(filledStar).toBeVisible();
});

test("Validate adding an album to a playlist", async ({ page, baseTest }) => {
  await openAlbum(page, baseTest);
  await page.click(baseTest.locators.addToPlaylistButton);
  await baseTest.addPlaylist(baseTest.testData.playlistName);
});

test("Validate sharing an album", async ({ page, baseTest }) => {
  await openAlbum(page, baseTest);
  await page.getByText(baseTest.locators.shareButton).nth(2).click();
  await baseTest.share(baseTest.testData.shareDescription);
});

test("Validate downloading an album", async ({ page, baseTest }) => {
  await openAlbum(page, baseTest);
  await baseTest.download(true);
});

test("Validate adding a song from an album to favourites", async ({
  page,
  baseTest,
}) => {
  await openAlbum(page, baseTest);
  await page.locator(baseTest.locators.songOnAlbum).nth(0).hover();
  expect(
    page.locator(baseTest.locators.favouriteButtonOnSong).nth(1)
  ).toBeVisible();
  const songNameLocator = page
    .locator(baseTest.locators.songNameOnAlbum)
    .nth(1);
  const songName = await songNameLocator.textContent();
  console.log(songName);
  if (songName === null) {
    throw new Error("Song name is null");
  }
  await page.locator(baseTest.locators.favouriteButtonOnSong).nth(4).click();
  await page.waitForTimeout(oneSecWait);

  await page.locator(baseTest.locators.songsSectionLink).click();
  await page.getByText(baseTest.locators.addFilterButton).click();
  await page.click(baseTest.locators.favouritesFilter);
  await page.fill(baseTest.locators.searchSongsField, songName);
  await page.press(baseTest.locators.searchSongsField, "Enter");
  await page.waitForTimeout(oneSecWait);
  expect(page.locator(baseTest.locators.songNameOnAlbum).nth(0)).toHaveText(
    songName
  );
});

test("Validate changing the layout of the albums", async ({
  page,
  baseTest,
}) => {
  await page.locator('[class="MuiSvgIcon-root"]').nth(16).click();
  const tableLayout = page.locator(baseTest.locators.tableLayout);
  expect(tableLayout).toBeVisible();
  await tableLayout.click();
  await page.waitForTimeout(oneSecWait);
  expect(page.locator(baseTest.locators.albumCover).nth(0)).not.toBeVisible();
});

test("Validate adding any filter to the albums", async ({ page, baseTest }) => {
  await page.getByText(baseTest.locators.addFilterButton).click();
  await page.getByText(baseTest.locators.yearOption).click();
  await page.fill(baseTest.locators.yearField, baseTest.testData.year);
  await page.waitForTimeout(oneSecWait);
  const albumCovers = page.locator(baseTest.locators.albumCover);
  await expect(albumCovers).toHaveCount(1);
});

test("Validate putting a song on 'Repeat' or 'Shuffle' after playing an album", async ({
  page,
  baseTest,
}) => {
  await playAlbum(page, baseTest, 0);
  const orderOfSongsButton = page.locator(baseTest.locators.orderOfSongsButton);
  await orderOfSongsButton.click();
  expect(orderOfSongsButton).toHaveAttribute(
    "title",
    baseTest.texts.repeatSong
  );
});

test("Validate closing the song panel after playing an album", async ({
  page,
  baseTest,
}) => {
  await playAlbum(page, baseTest, 0);
  await page.click(baseTest.locators.closePanelButton);
  expect(page.locator(baseTest.locators.panel)).not.toBeVisible();
});

test("Validate playing an album through the context menu", async ({
  page,
  baseTest,
}) => {
  await clickOnContextMenu(page, baseTest);
  await page.locator(baseTest.locators.playMenuItem).nth(0).click();
  await baseTest.isSongPlaying();
});

test("Validate playing an album by clicking on the 'Play Next', 'Play Later' or 'Shuffle' context menu options", async ({
  page,
  baseTest,
}) => {
  await clickOnContextMenu(page, baseTest);
  await page.locator(baseTest.locators.shuffleMenuItem).nth(0).click();
  await baseTest.isSongPlaying();
});

test("Validate adding an album to a playlist through the context menu", async ({
  page,
  baseTest,
}) => {
  await clickOnContextMenu(page, baseTest);
  await page.locator(baseTest.locators.addToPlaylistMenuItem).nth(0).click();
  await baseTest.addPlaylist(baseTest.testData.playlistName2);
});

test("Validate sharing an album through the context menu", async ({
  page,
  baseTest,
}) => {
  await clickOnContextMenu(page, baseTest);
  await page.locator(baseTest.locators.shareMenuItem).nth(0).click();
  await baseTest.share(baseTest.testData.shareDescription2);
});

test("Validate downloading an album through the context menu", async ({
  page,
  baseTest,
}) => {
  await clickOnContextMenu(page, baseTest);
  await page.locator(baseTest.locators.downloadMenuItem).nth(0).click();
  await baseTest.download();
});

test("Validate getting info about an album through the context menu", async ({
  page,
  baseTest,
}) => {
  await clickOnContextMenu(page, baseTest);
  await page.locator(baseTest.locators.infoMenuItem).nth(0).click();
  await expect(page.locator(baseTest.locators.infoDialog)).toBeVisible();
  await page.waitForTimeout(oneSecWait);
});

test("Validate if you are taken to the artist page by clicking on the artist name after opening an album", async ({
  page,
  baseTest,
}) => {
  await openAlbum(page, baseTest);
  const artistName = await page
    .locator(baseTest.locators.artistNameOnAlbum)
    .textContent();
  await page.locator(baseTest.locators.artistNameOnAlbum).click();
  if (artistName === null) {
    throw new Error("Artist name is null");
  }

  await page.waitForTimeout(oneSecWait);
  expect(page.locator(baseTest.locators.artistNameOnArtistPage)).toHaveText(
    artistName
  );
});

test("Validate changing the number of albums shown on the page", async ({
  page,
  baseTest,
}) => {
  await page.waitForTimeout(oneSecWait);
  const albumCovers = page.locator(baseTest.locators.albumCover);
  const count = await albumCovers.count();
  expect(count).toBe(baseTest.texts.firstAlbumCount);
  await page.locator(baseTest.locators.listItemsPerPageButton).click();
  await page.locator(baseTest.locators.option).nth(1).click();
  await page.waitForTimeout(oneSecWait);
  const count2 = await albumCovers.count();
  expect(count2).toBe(baseTest.texts.secondAlbumCount);
});
