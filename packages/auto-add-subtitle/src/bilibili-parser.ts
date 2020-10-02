import puppeteer from 'puppeteer';
import { withCache } from './cache';
import ProgressBar from 'progress';
import { MultiProgressBar } from './progress';

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

  private static maxConcurrent = 8;

  private static async _parse(blobs: string | Array<string>) {
    if (typeof blobs === 'string') {
      blobs = [blobs];
    }
    const { config, maxConcurrent } = this;

    const progressBar = MultiProgressBar.getProgressBar('parsing', {
      total: blobs.length,
    });

    return puppeteer.launch({ headless: true }).then(async browser => {
      const result: Array<string> = [];

      for (let i = 0; i < Math.ceil(blobs.length / this.maxConcurrent); i++) {
        const subResult = await Promise.all(
          (blobs.slice(i * maxConcurrent, (i + 1) * maxConcurrent) as Array<
            string
          >).map(
            withProgress(async url => {
              const page = await browser.newPage();
              clearCookies(page);
              await page.goto(config.url);

              await page.type(config.inputSelector, url);
              clearCookies(page);
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
            }, progressBar),
          ),
        );
        result.push(...subResult);
      }

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

function withProgress(fn: (...rest: any) => Promise<any>, bar: ProgressBar) {
  return async (...rest: any) => {
    const result = await fn(...rest);
    bar.tick();
    return result;
  };
}

async function clearCookies(page: puppeteer.Page) {
  // @ts-ignore
  await page._client.send('Network.clearBrowserCookies');
  // @ts-ignore
  await page._client.send('Network.clearBrowserCache');
}
