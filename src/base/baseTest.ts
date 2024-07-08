import { test as base, expect, Page } from "@playwright/test";
import { locators } from "../locators/locators";
import { texts } from "../data/texts";
import { testData } from "../data/testData";

export class BaseTest {
  page: Page;
  locators = locators;
  texts = texts;
  testData = testData;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoNavidrome() {
    await this.page.goto("");
    const title = await this.page.title();
    expect(title).toBe(texts.title);

    await this.page.fill(locators.loginUsername, testData.username);
    await this.page.fill(locators.loginPassword, testData.password);
    await this.page.click(locators.signInButton);
  }

  async isSongPlaying() {
    await this.page.waitForTimeout(threeSecWait);
    const audioElement = await this.page.$("audio");
    if (audioElement === null) {
      throw new Error();
    }
    const initialTime = await audioElement.evaluate((node) => node.currentTime);
    await this.page.waitForTimeout(threeSecWait);
    const currentTime = await audioElement.evaluate((node) => node.currentTime);
    expect(currentTime).toBeGreaterThan(initialTime);
  }

  async addPlaylist(playlistName: string) {
    await this.page.fill(locators.playlistNameField, playlistName);
    await this.page.press(locators.playlistNameField, "Enter");
    expect(this.page.locator(locators.addPlaylistWindow)).toBeVisible();
    await this.page.click(locators.addPlaylistWindow);
    await this.page.click(locators.addPlaylistButton);
    await this.page.waitForTimeout(oneSecWait);
    expect(this.page.locator(locators.songsAddedToPlaylistAlert)).toBeVisible();
  }

  async share(shareDescription: string) {
    await this.page.fill(locators.shareDescriptionField, shareDescription);
    const shareButton = this.page.locator(locators.optionsOnShareWindow).nth(1);
    await shareButton.click();
    await this.page.waitForTimeout(oneSecWait);
    expect(this.page.locator(locators.urlCopiedSuccessMessage)).toBeVisible();
  }

  async download(clickSecondButton: boolean = false) {
    const downloadPromise = this.page.waitForEvent("download");
    await this.page.locator(locators.downloadButton).click();
    if (clickSecondButton) {
      await this.page.locator(locators.downloadButton).nth(1).click();
    }
    await this.page.waitForTimeout(oneSecWait);
    const download = await downloadPromise;
    expect(download).not.toBeNull();
  }

  async isVolumeMuted(page: Page, baseTest: BaseTest) {
    const volumeBar = page.locator(baseTest.locators.volumeBar).nth(1);
    const width = await volumeBar.evaluate(
      (el) => window.getComputedStyle(el).width
    );
    expect(width).toBe("0px");
  }

  async muteThroughVolumeBar(page: Page, baseTest: BaseTest) {
    const volumeBar = page.locator(baseTest.locators.volumeBar).nth(1);

    const boundingBox = await volumeBar.boundingBox();
    if (!boundingBox) throw new Error("Volume slider bounding box not found");

    const x = boundingBox.x;
    const y = boundingBox.y + boundingBox.height / 2;

    await volumeBar.dispatchEvent("mousedown", {
      bubbles: true,
      clientX: boundingBox.x + boundingBox.width / 2,
      clientY: y,
    });
    await page.mouse.move(x, y);
    await page.mouse.up();
  }
}

export const test = base.extend<{ baseTest: BaseTest }>({
  baseTest: async ({ page }, use) => {
    const baseTest = new BaseTest(page);
    await use(baseTest);
  },
});

test.beforeEach(async ({ baseTest }) => {
  await baseTest.gotoNavidrome();
});
let threeSecWait = 3000;
let oneSecWait = 1000;
