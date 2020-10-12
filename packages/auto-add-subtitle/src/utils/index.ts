import puppeteer from 'puppeteer';

export async function clearCookies(page: puppeteer.Page) {
  // @ts-ignore
  await page._client.send('Network.clearBrowserCookies');
  // @ts-ignore
  await page._client.send('Network.clearBrowserCache');
}

export * from './base';
export * from './cache';
export * from './concurrent-tasks';
export * from './downloader';
export * from './fs';
export * from './path';
export * from './progress';
export * from './videos';
export * from './shell';
