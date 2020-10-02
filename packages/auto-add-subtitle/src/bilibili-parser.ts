import puppeteer from 'puppeteer';
import { withCache } from './cache';

interface Config {
  url: string;
  inputSelector: string;
  submitBtnSelector: string;
  mp4UrlSelector: string;
}

// 负责将bilibili网站的blob格式视频转为普通mp4格式
export class BilibiliParser {
  private static config: Config = {
    url: 'https://xbeibeix.com/api/bilibili/',
    inputSelector: '[aria-describedby]',
    submitBtnSelector: '#button-1',
    mp4UrlSelector: '#mp4-url2',
  };

  private static async _parse(blobs: string | Array<string>) {
    if (typeof blobs === 'string') {
      blobs = [blobs];
    }
    const { config } = this;

    return puppeteer.launch({ headless: true }).then(async browser => {
      const result = await Promise.all(
        (blobs as Array<string>).map(async url => {
          const page = await browser.newPage();
          clearCookies(page);
          await page.goto(config.url);

          await page.type(config.inputSelector, url);
          await page.click(config.submitBtnSelector);
          await page.waitForSelector(config.mp4UrlSelector);
          await page.waitForFunction(
            `document.querySelector("${config.mp4UrlSelector}").value!==""`,
          );

          const mp4Url = await page.evaluate(selector => {
            return document.querySelector(selector).value;
          }, config.mp4UrlSelector);
          return mp4Url;
        }),
      );

      await browser.close();

      return result;
    });
  }

  public static async parse(
    blobs: string | Array<string>,
  ): Promise<Array<string>> {
    return withCache(this._parse.bind(this))(blobs);
  }
}

async function clearCookies(page: puppeteer.Page) {
  // @ts-ignore
  await page._client.send('Network.clearBrowserCookies');
  // @ts-ignore
  await page._client.send('Network.clearBrowserCache');
}
