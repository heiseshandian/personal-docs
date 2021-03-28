import path from 'path';
import { Page, Response } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import {
  clearCookies,
  ConcurrentTasks,
  delay,
  DynamicTasks,
  formatTime,
  handleError,
  setWebLifecycleState,
  writeFile,
} from 'zgq-shared';
import { merge } from '../utils';

puppeteer.use(StealthPlugin());

interface VeedOptions {
  debug: boolean;
  timeout: number;
  [key: string]: any;
}

interface Subtitle {
  from: number;
  to: number;
  value: string;
}

interface Project {
  data: {
    edit: {
      subtitles: {
        tracks: {
          [key: string]: {
            items: {
              [key: string]: Subtitle;
            };
          };
        };
      };
    };
  };
}

export class Veed {
  private options: VeedOptions = {
    debug: false,
    timeout: 1000 * 60 * 6,
  };

  private config = {
    url: 'https://www.veed.io/',

    gotoEditPageBtnXpath: '/html/body/div[1]/div/a[1]',

    uploadBtnXpath: '/html/body/div[2]/div/div/div/div/div/div/div[1]/div',
    inputFileSelector: '[data-testid="file-input-dropzone"]',
    closeSelector: '[alt^="close"]',

    subtitleSelector: '[href$="subtitles"]',
    autoSubtitleSelector: '[data-testid="@editor/subtitles-option/automatic"]',
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
              // @ts-expect-error
              const page: Page = await browser.newPage();
              page.setDefaultNavigationTimeout(timeout);
              await clearCookies(page);
              try {
                await page.goto(url, { timeout });
                await setWebLifecycleState(page);
                await this.beforeUpload(page);
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
  }

  public static readonly subtitleExt = '.srt';

  private async beforeUpload(page: Page) {
    const { gotoEditPageBtnXpath } = this.config;
    const { timeout } = this.options;

    await this.safeClickXPath(page, gotoEditPageBtnXpath);
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

  // 上传文件
  private async upload(page: Page, audio: string) {
    const { uploadBtnXpath, inputFileSelector } = this.config;

    // https://github.com/puppeteer/puppeteer/issues/2946
    await this.safeClickXPath(page, uploadBtnXpath);
    // https://stackoverflow.com/questions/59273294/how-to-upload-file-with-js-puppeteer
    const uploadBtn = await page.$(inputFileSelector);
    await uploadBtn?.uploadFile(audio);

    // 坐等项目创建完成
    await this.waitUntilProjectCreated(page);
  }

  private async waitUntilProjectCreated(page: Page) {
    return new Promise(resolve => {
      const listener = (response: Response) => {
        const url = response.url();
        const request = response.request();
        if (/projects\/[\d\w-]*/.test(url) && request.method() === 'PUT') {
          resolve(undefined);
        }
      };

      page.off('response', listener);
      page.on('response', listener);
    });
  }

  // 解析字幕
  private async _parseSubtitle(page: Page) {
    const {
      subtitleSelector,
      autoSubtitleSelector,
      closeSelector,
    } = this.config;

    await this.safeClick(page, closeSelector);

    await this.safeClick(page, subtitleSelector);
    // !视频上传过程中 autoSubtitleSelector 按钮不可点击，这里等待按钮可点击后再开始转化
    await this.waitUntilCanClick(page, autoSubtitleSelector);
    await this.safeClick(page, autoSubtitleSelector);

    await this.clickStartBtn(page);
  }

  private async waitUntilCanClick(page: Page, selector: string) {
    const { timeout } = this.options;

    await page.waitForFunction(
      selector => {
        const btn: HTMLButtonElement | null = document.querySelector(selector);
        if (!btn) {
          return false;
        }
        return !btn.disabled;
      },
      { timeout },
      selector,
    );
  }

  private async clickStartBtn(page: Page) {
    await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      btns.forEach(btn => {
        if (/start/i.test(btn.innerText)) {
          btn.click();
        }
      });
    });
  }

  private async download(page: Page, audio: string) {
    const { dir, name } = path.parse(audio);

    return new Promise(resolve => {
      const listener = (response: Response) => {
        const url = response.url();
        const request = response.request();
        if (!/projects\/[\d\w-]*/.test(url) || request.method() === 'OPTIONS') {
          return;
        }

        response
          .json()
          .then(data => {
            const subtitles = parseSubtitles(data as Project);
            if (!subtitles) {
              return;
            }
            const srt = subtitles2Srt(subtitles);

            writeFile(path.resolve(dir, `${name}${Veed.subtitleExt}`), srt)
              .then(resolve)
              .catch(handleError);
          })
          .catch(handleError);
      };

      page.off('response', listener);
      page.on('response', listener);
    });
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

function parseSubtitles(data: Project) {
  try {
    return Object.values(
      Object.values((data as Project).data.edit.subtitles.tracks)[0].items,
    ).sort((a, b) => a.from - b.from);
  } catch (e) {
    return undefined;
  }
}

function subtitles2Srt(subtitles: Subtitle[]) {
  return subtitles
    .map(({ from, to, value }, i) => {
      const sequence = i + 1;
      const timeline = `${formatTime(from)} --> ${formatTime(to)}`;

      return [sequence, timeline, value].join('\n') + '\n';
    })
    .join('\n');
}
