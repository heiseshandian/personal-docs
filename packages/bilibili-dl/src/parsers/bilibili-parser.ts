import { Browser, devices, Page, Response } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import {
  clearCookies,
  formatTime,
  handleError,
  log,
  logWrapper,
} from 'zgq-shared';

puppeteer.use(StealthPlugin());

export class BilibiliParser {
  private static readonly config = {
    seriesSelector: '#multi_page a',
    timeout: 1000 * 60 * 5,
  };

  @logWrapper(log('parsing series'))
  public static async parseSeries(url: string) {
    if (!url) {
      return;
    }
    const { timeout, seriesSelector } = this.config;

    return await puppeteer.launch({ headless: true }).then(async browser => {
      const page = await this.initPage(browser, url);

      await page.waitForSelector(seriesSelector, { timeout });
      const result = await page.$$eval(seriesSelector, elements =>
        elements.map(ele => {
          const link = ele as HTMLAnchorElement;

          return {
            href: link.href,
            title: link.title,
          };
        }),
      );
      await browser.close();

      return result;
    });
  }

  @logWrapper(log('parsing page title'))
  public static async parsePageTitle(url: string) {
    if (!url) {
      return;
    }

    return await puppeteer.launch({ headless: true }).then(async browser => {
      const page = await this.initPage(browser, url);

      const title = await page.title();
      await browser.close();

      return title;
    });
  }

  public static async parseSrt(url: string) {
    if (!url) {
      return;
    }

    return await puppeteer.launch({ headless: true }).then(async browser => {
      const page = await this.initPage(browser, url);

      // 这里使用移动模式是因为bilibili在pc端需要flash才能播放
      await page.emulate(devices['iPhone X']);
      const json = await this.parseSrtFromResponse(page);
      await browser.close();

      return json2Srt(json as SubtitleJson);
    });
  }

  private static parseSrtFromResponse(page: Page) {
    return new Promise(resolve => {
      const listener = (response: Response) => {
        const url = response.url();
        if (!/subtitle\/.*\.json/.test(url)) {
          return;
        }
        page.off('response', listener);
        response
          .json()
          .then(data => resolve(data))
          .catch(handleError);
      };

      page.off('response', listener);
      page.on('response', listener);
    });
  }

  private static async initPage(browser: Browser, url: string) {
    const page = await browser.newPage();
    await page.goto(url);
    await clearCookies(page);

    return page;
  }
}

interface SubtitleJson {
  body: Array<{
    from: number;
    to: number;
    content: string;
  }>;
}

function json2Srt(json: SubtitleJson) {
  return json.body
    .map(({ from, to, content }, i) => {
      const sequence = i + 1;
      const timeline = `${formatTime(from)} --> ${formatTime(to)}`;

      return [sequence, timeline, content].join('\n') + '\n';
    })
    .join('\n');
}
