import path from 'path';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import {
  clearCookies,
  ConcurrentTasks,
  getClosestNodeModulesPath,
} from './utils';

puppeteer.use(StealthPlugin());

interface Config {
  url: string;
  inputFileSelector: string;
  durationSelector: string;
  subtitleSelector: string;
  autoSubtitleSelector: string;
  startSelector: string;
  subtitlesSelector: string;
  exportSelector: string;
  downloadSelector: string;
}

export class Veed {
  private static config: Config = {
    url: 'https://www.veed.io/',
    inputFileSelector: '[data-testid="file-input-dropzone"]',
    durationSelector: '[data-testid="@editor/subtitle-row/styled-input-mask"]',
    subtitleSelector: '[href$="subtitles"]',
    autoSubtitleSelector: '[data-testid="@editor/subtitles-option/automatic"]',
    startSelector: '.sc-pIJJz',
    subtitlesSelector: '[data-testid="@editor/subtitle-row-0/textarea"]',
    exportSelector: 'button.sc-pRFjI',
    downloadSelector: 'a[href$=mp4]',
  };

  public static async autoAddSubtitle(
    videos: Array<string>,
    timeout: number = 1000 * 60 * 10,
  ) {
    const {
      config: {
        url,
        inputFileSelector,
        durationSelector,
        subtitleSelector,
        autoSubtitleSelector,
        startSelector,
        subtitlesSelector,
        exportSelector,
        downloadSelector,
      },
    } = this;

    // https://stackoverflow.com/questions/48013969/how-to-maximise-screen-use-in-pupeteer-non-headless
    return puppeteer
      .launch({
        headless: false,
        defaultViewport: null,
      })
      .then(async browser => {
        await new ConcurrentTasks(
          videos.map(video => async () => {
            const page = await browser.newPage();
            await clearCookies(page);
            await page.goto(url);

            // https://stackoverflow.com/questions/59273294/how-to-upload-file-with-js-puppeteer
            const uploadBtn = await page.$(inputFileSelector);
            await uploadBtn?.uploadFile(video);

            // 跳转编辑页面
            // https://stackoverflow.com/questions/58451066/puppeteer-wait-for-url
            await page.waitForNavigation({
              timeout,
              waitUntil: 'networkidle0',
            });
            await page.waitForSelector(durationSelector, { timeout });
            // 等待项目加载完毕
            await page.waitForFunction(
              `document.querySelector('${durationSelector}').value!==""`,
            );

            await page.waitForSelector(subtitleSelector);
            await page.click(subtitleSelector);
            await page.waitForSelector(autoSubtitleSelector, { timeout });
            await page.click(autoSubtitleSelector);
            await page.click(startSelector);
            await page.waitForSelector(subtitlesSelector, { timeout });
            await page.click(exportSelector);

            // 跳转到下载页面
            await page.waitForNavigation({
              timeout,
              waitUntil: 'networkidle0',
            });
            await page.waitForSelector(downloadSelector, {
              timeout,
            });

            const { dir } = path.parse(video);
            // @ts-ignore
            await page._client.send('Page.setDownloadBehavior', {
              behavior: 'allow',
              downloadPath: path.resolve(dir, 'parsed'),
            });
            await page.evaluate(selector => {
              return document.querySelector(selector).children[0].click();
            }, downloadSelector);
          }),
        ).run();

        await browser.close();
      });
  }
}

Veed.autoAddSubtitle([
  path.resolve(
    getClosestNodeModulesPath() as string,
    '.cache/videos/1_chunks_0.webm',
  ),
]);
