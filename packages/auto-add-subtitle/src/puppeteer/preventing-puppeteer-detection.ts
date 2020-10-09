import puppeteer from 'puppeteer';

// https://gist.github.com/tegansnyder/c3aeae4d57768c58247ae6c4e5acd3d1#file-preventing-puppeteer-detection-md
const args = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-infobars',
  '--window-position=0,0',
  '--ignore-certifcate-errors',
  '--ignore-certifcate-errors-spki-list',
  '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
];

export const preventingPuppeteerDetectionOptions: puppeteer.LaunchOptions = {
  args,
  headless: true,
  ignoreHTTPSErrors: true,
};
