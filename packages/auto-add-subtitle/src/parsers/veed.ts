import path from 'path';
import { Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import {
  clearCookies,
  ConcurrentTasks,
  delay,
  DynamicTasks,
  handleError,
  move,
  readdir,
  setWebLifecycleState,
} from 'zgq-shared';
import { merge } from '../utils';

puppeteer.use(StealthPlugin());

interface VeedOptions {
  debug: boolean;
  timeout: number;
  [key: string]: any;
}

export class Veed {
  private options: VeedOptions = {
    debug: false,
    timeout: 1000 * 60 * 6,
  };

  private config = {
    url: 'https://www.veed.io/',

    uploadBtnXpath:
      '//*[@id="root"]/main/div[1]/div[1]/div[1]/div[2]/div/div[1]/div/div/div/div/button',
    inputFileSelector: '[data-testid="file-input-dropzone"]',
    subtitleSelector: '[href$="subtitles"]',
    autoSubtitleSelector: '[data-testid="@editor/subtitles-option/automatic"]',
    closeSelector: '[alt^="close"]',
    startXPath:
      '//*[@id="root"]/main/div[1]/div/div[1]/div[1]/div/div/div/button',
    subtitlesSelector: '[data-testid="@design-system/text-editor-0/textarea"]',
    translateXpath:
      '//*[@id="root"]/main/div[1]/div/div[1]/div[1]/div/div/div/div/nav/div[2]',
    downloadXpath:
      '//*[@id="root"]/main/div[1]/div/div[1]/div[1]/div/div/div/div/div[2]/div[2]/div/div/div/button[1]',
  };

  constructor(options: Partial<VeedOptions> = {}) {
    this.options = merge(this.options, options);
  }

  public async parseSubtitle(audios: Array<string>) {
    const {
      options: { debug },
    } = this;

    if (audios.length <= 0) {
      return;
    }

    const {
      config: { url },
    } = this;

    const dynamicTasks = new DynamicTasks('parsing subtitles');

    const [browser] = await Promise.all([
      puppeteer
        .launch({
          headless: debug ? false : true,
          defaultViewport: {
            width: 1920,
            height: 1024,
          },
          args: ['--start-maximized'],
        })
        .then(async browser => {
          await new ConcurrentTasks(
            audios.map((audio, i) => async () => {
              const { timeout } = this.options;
              const page = await browser.newPage();
              await clearCookies(page);
              try {
                await page.goto(url, { timeout });
                await setWebLifecycleState(page);
                await this.upload(page, audio);
              } catch (e) {
                handleError(e);
              } finally {
                dynamicTasks.add(async () => {
                  await this._parseSubtitle(page);
                  await this.download(page, audio);
                  // 下载完再关闭页面
                  await delay(1000 * 10);
                  await page.close();
                });

                if (i === audios.length - 1) {
                  dynamicTasks.end();
                }
              }
            }),
            'uploading files',
          ).run(1);

          return browser;
        })
        .catch(handleError),
      dynamicTasks.run(),
    ]);

    if (browser) {
      await browser.close();
    }

    await this.renameSubtitleFiles(audios[0]);
  }

  public static readonly subtitlePrefix = 'default_Project Name_';

  public static readonly subtitleExt = '.srt';

  // 上传文件
  private async upload(page: Page, audio: string) {
    const { uploadBtnXpath, inputFileSelector } = this.config;
    const { timeout } = this.options;

    // https://github.com/puppeteer/puppeteer/issues/2946
    await this.safeClickXPath(page, uploadBtnXpath);
    // https://stackoverflow.com/questions/59273294/how-to-upload-file-with-js-puppeteer
    const uploadBtn = await page.$(inputFileSelector);
    await uploadBtn?.uploadFile(audio);

    // 坐等上传完成
    await page.waitForFunction(
      () => {
        const match = location.pathname.match(/\w+\/(.*)/);
        if (!match) {
          return false;
        }
        const [, hash] = match;
        return hash.replace(/-/g, '').length === 32;
      },
      { timeout },
    );
  }

  // 解析字幕
  private async _parseSubtitle(page: Page) {
    const {
      subtitleSelector,
      autoSubtitleSelector,
      startXPath,
      subtitlesSelector,
      closeSelector,
    } = this.config;
    const { timeout } = this.options;

    await Promise.all([
      page.waitForSelector(closeSelector, { timeout }),
      page.waitForSelector(subtitleSelector, { timeout }),
    ]);

    await this.safeClick(page, closeSelector);
    await this.safeClick(page, subtitleSelector);
    await page.waitForSelector(autoSubtitleSelector, { timeout });
    await this.safeClick(page, autoSubtitleSelector);
    await this.safeClickXPath(page, startXPath);
    await page.waitForSelector(subtitlesSelector, { timeout });
  }

  private async download(page: Page, audio: string) {
    const { dir } = path.parse(audio);
    // https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-setDownloadBehavior
    // @ts-ignore
    await page._client.send('Browser.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: path.resolve(dir),
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

  private async renameSubtitleFiles(audio: string) {
    const { dir, ext } = path.parse(audio);
    const files = await readdir(dir);

    await Promise.all(
      files
        .filter(isSubtitleFile)
        .map(file => path.resolve(dir, file))
        .map(file =>
          move(file, file.replace(Veed.subtitlePrefix, '').replace(ext, '')),
        ),
    );
  }

  private async safeClick(page: Page, selector: string) {
    const { timeout } = this.options;

    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
  }

  private async safeClickXPath(page: Page, xpath: string) {
    const { timeout } = this.options;

    await page.waitForXPath(xpath, { timeout });
    const elements = await page.$x(xpath);
    await elements[0].click();
  }
}

const subtitleFileReg = new RegExp(`\\${Veed.subtitleExt}$`);
export function isSubtitleFile(file: string) {
  return subtitleFileReg.test(file);
}
