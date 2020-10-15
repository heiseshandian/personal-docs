import path from 'path';
import { Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import {
  clearCookies,
  ConcurrentTasks,
  delay,
  handleError,
  setWebLifecycleState,
} from './utils';

puppeteer.use(StealthPlugin());

export class Veed {
  private static config = {
    url: 'https://www.veed.io/',

    inputFileSelector: '[data-testid="file-input-dropzone"]',
    subtitleSelector: '[href$="subtitles"]',
    autoSubtitleSelector: '[data-testid="@editor/subtitles-option/automatic"]',
    startXPath: '//*[@id="root"]/main/div[1]/div[1]/div[1]/div/div/div/button',
    subtitlesSelector: '[data-testid="@editor/subtitle-row-0/textarea"]',
    closeSelector: '[alt^="close"]',
    translateXpath:
      '//*[@id="root"]/main/div[1]/div[1]/div[1]/div/div/div/nav/div[2]',
    downloadXpath:
      '//*[@id="root"]/main/div[1]/div[1]/div[1]/div/div/div/div/div[2]/div/div[1]/div[2]/div/span',

    timeout: 1000 * 60 * 10,
  };

  private static async safeClick(page: Page, selector: string) {
    const { timeout } = this.config;

    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
  }

  private static async safeClickXPath(page: Page, xpath: string) {
    const { timeout } = this.config;

    await page.waitForXPath(xpath, { timeout });
    const elements = await page.$x(xpath);
    await elements[0].click();
  }

  // 上传文件
  private static async upload(page: Page, audio: string) {
    const { inputFileSelector, timeout } = this.config;

    // https://stackoverflow.com/questions/59273294/how-to-upload-file-with-js-puppeteer
    const uploadBtn = await page.$(inputFileSelector);
    await uploadBtn?.uploadFile(audio);

    // 跳转编辑页面
    // https://stackoverflow.com/questions/58451066/puppeteer-wait-for-url
    await page.waitForNavigation({
      timeout,
      waitUntil: 'networkidle0',
    });
  }

  // 解析字幕
  private static async _parseSubtitle(page: Page) {
    const {
      subtitleSelector,
      autoSubtitleSelector,
      startXPath,
      subtitlesSelector,
      closeSelector,
      timeout,
    } = this.config;

    await Promise.all([
      page.waitForSelector(closeSelector),
      page.waitForSelector(subtitleSelector),
    ]);

    await this.safeClick(page, closeSelector);
    await this.safeClick(page, subtitleSelector);
    await page.waitForSelector(autoSubtitleSelector, { timeout });
    await this.safeClick(page, autoSubtitleSelector);
    await this.safeClickXPath(page, startXPath);
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

    const { translateXpath, downloadXpath } = this.config;
    await this.safeClickXPath(page, translateXpath);

    // 某些版本的浏览器以此方式点击元素不会触发下载（换成下面的执行js脚本写法）~
    // await this.safeClickXPath(page, downloadXpath);
    await page.evaluate(xpath => {
      const downloadBtn = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      ).singleNodeValue;
      (downloadBtn as HTMLElement)?.click();
    }, downloadXpath);
  }

  public static async parseSubtitle(audios: Array<string>) {
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
            const { timeout } = this.config;
            const page = await browser.newPage();
            await clearCookies(page);
            await page.goto(url, { timeout });
            await setWebLifecycleState(page);

            await this.upload(page, audio);
            await this._parseSubtitle(page);
            await this.download(page, audio);

            // 下载完再关闭页面
            setTimeout(() => {
              page.close();
            }, 1000 * 10);
          }),
          'parsing subtitle',
        ).run(1);

        // 等待文件下载完再关闭浏览器
        await delay(1000 * 10);
        await browser.close();
      })
      .catch(handleError);
  }
}
