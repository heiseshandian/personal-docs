import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { clearCookies } from 'zgq-shared';

puppeteer.use(StealthPlugin());

export class BilibiliParser {
  private static readonly config = {
    seriesSelector: '#multi_page a',
    timeout: 1000 * 60 * 5,
  };

  public static async parseSeries(url: string) {
    if (!url) {
      return;
    }
    const { timeout, seriesSelector } = this.config;

    return await puppeteer.launch({ headless: true }).then(async browser => {
      const page = await browser.newPage();
      await page.goto(url);
      await clearCookies(page);

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

  public static async parsePageTitle(url: string) {
    if (!url) {
      return;
    }

    return await puppeteer.launch({ headless: true }).then(async browser => {
      const page = await browser.newPage();
      await page.goto(url);
      await clearCookies(page);

      const title = await page.title();
      await browser.close();

      return title;
    });
  }
}
