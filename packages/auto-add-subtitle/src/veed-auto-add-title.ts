import path from 'path';
import puppeteer from 'puppeteer';
import fs from 'fs';
import { preventingPuppeteerDetectionOptions } from './puppeteer';
import {
  clearCookies,
  ConcurrentTasks,
  getClosestNodeModulesPath,
} from './utils';

interface Config {
  url: string;
  inputSelector: string;
  subtitleSelector: string;
  autoSubtitleSelector: string;
}

export class Veed {
  private static config: Config = {
    url: 'https://www.veed.io/',
    inputSelector: '[data-testid="file-input-dropzone"]',
    subtitleSelector: '[href="/edit/sample/subtitles"]',
    autoSubtitleSelector: '[data-testid="@editor/subtitles-option/automatic"]',
  };

  private static maxConcurrent = 4;

  public static async autoAddSubtitle(videos: Array<string>) {
    const {
      config: { url, inputSelector, subtitleSelector, autoSubtitleSelector },
      maxConcurrent,
    } = this;

    // https://stackoverflow.com/questions/48013969/how-to-maximise-screen-use-in-pupeteer-non-headless
    return puppeteer
      .launch({
        ...preventingPuppeteerDetectionOptions,
        headless: false,
        defaultViewport: null,
      })
      .then(async browser => {
        await new ConcurrentTasks(
          videos.map(video => async () => {
            const page = await browser.newPage();
            await page.evaluateOnNewDocument(
              fs.readFileSync(
                path.resolve(__dirname, './puppeteer/preload.js'),
                'utf-8',
              ),
            );
            await clearCookies(page);
            await page.goto(url);

            // https://stackoverflow.com/questions/59273294/how-to-upload-file-with-js-puppeteer
            const uploadBtn = await page.$(inputSelector);
            await uploadBtn?.uploadFile(video);
            await uploadBtn?.evaluate(upload =>
              upload.dispatchEvent(new Event('change', { bubbles: true })),
            );

            // 跳转编辑页面
            // https://stackoverflow.com/questions/58451066/puppeteer-wait-for-url
            await page.waitForNavigation({
              timeout: 1000 * 60 * 30,
            });
            await page.waitForSelector(subtitleSelector);
            await page.click(subtitleSelector);
            await page.waitForSelector(autoSubtitleSelector, {
              timeout: 1000 * 60 * 3,
            });
            await page.click(autoSubtitleSelector);
          }),
        ).run(maxConcurrent);

        // await browser.close();
      });
  }
}

Veed.autoAddSubtitle([
  path.resolve(
    getClosestNodeModulesPath() as string,
    '.cache/videos/00-Introduction1004_chunks_0_chunks_1_chunks_0.mp4',
  ),
]);
