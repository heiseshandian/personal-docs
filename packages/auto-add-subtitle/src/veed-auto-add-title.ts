import path from 'path';
import { Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { clearCookies, ConcurrentTasks, setWebLifecycleState } from './utils';

puppeteer.use(StealthPlugin());

interface Config {
  url: string;
  inputFileSelector: string;
  durationSelector: string;
  subtitleSelector: string;
  autoSubtitleSelector: string;
  startSelector: string;
  subtitlesSelector: string;
  closeSelector: string;
  translateSelector: string;
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
    closeSelector: '[alt^="close"]',
    translateSelector: '.sc-pCPhY.cSMpki',
    downloadSelector: '.sc-fznWqX.bPVNyf',
  };

  // 上传文件
  private static async upload(page: Page, audio: string, timeout: number) {
    const { inputFileSelector, durationSelector } = this.config;

    // https://stackoverflow.com/questions/59273294/how-to-upload-file-with-js-puppeteer
    const uploadBtn = await page.$(inputFileSelector);
    await uploadBtn?.uploadFile(audio);

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
  }

  // 解析字幕
  private static async _parseSubtitle(page: Page, timeout: number) {
    const {
      subtitleSelector,
      autoSubtitleSelector,
      startSelector,
      subtitlesSelector,
      closeSelector,
    } = this.config;

    await Promise.all([
      page.waitForSelector(closeSelector),
      page.waitForSelector(subtitleSelector),
    ]);

    await page.click(closeSelector);
    await page.click(subtitleSelector);
    await page.waitForSelector(autoSubtitleSelector, { timeout });
    await page.click(autoSubtitleSelector);
    await page.click(startSelector);
    await page.waitForSelector(subtitlesSelector, { timeout });
  }

  private static async download(page: Page, audio: string) {
    const { dir } = path.parse(audio);
    // https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-setDownloadBehavior
    // @ts-ignore
    await page._client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: path.resolve(dir, 'parsed'),
    });

    const { translateSelector, downloadSelector } = this.config;
    await page.click(translateSelector);
    await page.click(downloadSelector);
  }

  public static async parseSubtitle(
    audios: Array<string>,
    timeout: number = 1000 * 60 * 10,
  ) {
    const {
      config: { url },
    } = this;

    // https://stackoverflow.com/questions/48013969/how-to-maximise-screen-use-in-pupeteer-non-headless
    return puppeteer
      .launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized'],
      })
      .then(async browser => {
        await new ConcurrentTasks(
          audios.map(audio => async () => {
            const page = await browser.newPage();
            await clearCookies(page);
            await page.goto(url);
            await setWebLifecycleState(page);

            await this.upload(page, audio, timeout);
            await this._parseSubtitle(page, timeout);
            await this.download(page, audio);

            await page.close();
          }),
          'parsing subtitle',
        ).run(1);

        await browser.close();
      });
  }
}
