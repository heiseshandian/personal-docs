import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import {
  clearCookies,
  ConcurrentTasks,
  withCache,
  log,
  logWrapper,
} from 'zgq-shared';

puppeteer.use(StealthPlugin());

// 负责将bilibili网站的blob格式视频转为普通mp4格式
export class XbeibeixParser {
  private static config = {
    url: 'https://xbeibeix.com/api/bilibili/',
    inputSelector: '[aria-describedby]',
    submitBtnSelector: '#button-1',
    mp4UrlSelector: '#mp4-url2',
  };

  // 并发访问会导致 xbeibeix 将访问识别为恶意访问，从而使得服务不可用，所以这里将并发数设置的尽可能小
  private static maxConcurrent = 1;

  private static async _parse(blobs: string | Array<string>) {
    if (typeof blobs === 'string') {
      blobs = [blobs];
    }
    const { config, maxConcurrent } = this;

    return puppeteer.launch({ headless: true }).then(async browser => {
      const result: Array<string> = await new ConcurrentTasks<string>(
        (blobs as string[]).map(url => async () => {
          const page = await browser.newPage();
          await clearCookies(page);
          await page.goto(config.url);

          await page.type(config.inputSelector, url);
          await clearCookies(page);
          await page.click(config.submitBtnSelector);
          await page.waitForSelector(config.mp4UrlSelector);
          await page.waitForFunction(
            `document.querySelector("${config.mp4UrlSelector}").value!==""`,
          );

          const mp4Url = await page.evaluate(selector => {
            return document.querySelector(selector).value;
          }, config.mp4UrlSelector);

          await page.close();
          return mp4Url;
        }),
        'parsing',
      ).run(maxConcurrent);

      await browser.close();

      return result;
    });
  }

  @logWrapper(log('parsing related mp4 urls'))
  public static async parse(
    blobs: string | Array<string>,
  ): Promise<Array<string>> {
    return withCache(this._parse.bind(this), 1000 * 60 * 30)(blobs);
  }
}
