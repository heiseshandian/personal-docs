import { Page } from 'puppeteer';

// https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-clearBrowserCookies
export async function clearCookies(page: Page) {
  // @ts-ignore
  await page._client.send('Network.clearBrowserCookies');
}

export async function clearBrowserCache(page: Page) {
  // @ts-ignore
  await page._client.send('Network.clearBrowserCache');
}

export async function clearCookiesAndCache(page: Page) {
  await clearCookies(page);
  await clearBrowserCache(page);
}

// https://github.com/puppeteer/puppeteer/issues/3339
// https://github.com/WICG/page-lifecycle
export async function setWebLifecycleState(page: Page, state = 'active') {
  const session = await page.target().createCDPSession();
  await session.send('Page.enable');
  await session.send('Page.setWebLifecycleState', { state });
}

export * from './base';
export * from './cache';
export * from './concurrent-tasks';
export * from './downloader';
export * from './fs';
export * from './path';
export * from './progress';
export * from './shell';
export * from './dynamic-tasks';
export * from './logger';
export * from './array';
export * from './cmd';
