const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

async function download(url, dest) {
  const response = await axios({
    method: "GET",
    url,
    responseType: "stream",
  });

  response.data.pipe(fs.createWriteStream(dest));

  return new Promise((resolve, reject) => {
    response.data.on("data", (buffer) => {
      console.log(buffer);
    });
    response.data.on("end", () => {
      resolve();
    });
    response.data.on("error", (err) => {
      reject(err);
    });
  });
}

const config = {
  url: "https://xbeibeix.com/api/bilibili/",
  inputSelector: "[aria-describedby]",
  submitBtnSelector: "#button-1",
  mp4UrlSelector: "#mp4-url2",
  videoUrlsToParse: new Array(52)
    .fill(0)
    .map((_, i) => `https://www.bilibili.com/video/BV1Mh411Z7LC?p=${i + 1}`),
  videoTitles: [
    "Introduction10:04",
    "Why Functional Programming10:00",
    "Functional Programming Journey09:43",
    "Code is Provable08:50",
    "Course Overview03:51",
    "Functions vs Procedures10:53",
    "Function Naming Semantics06:45",
    "Side Effects11:05",
    "Pure Functions & Constants11:41",
    "Reducing Surface Area03:20",
    "Same Input, Same Output03:43",
    "Level of Confidence01:35",
    "Extracting Impurity04:38",
    "Containing Impurity11:08",
    "Impurity Exercise - Wrappers & Adapters03:41",
    "Impurity Solution - Wrappers02:25",
    "Impurity Solution - Adapters03:23",
    "Function Arguments05:17",
    "Arguments Shape Adapters05:46",
    "Flip & Reverse Adapter05:46",
    "Spread Adapter03:01",
    "Equational Reasoning08:56",
    "Point Free Refactor07:12",
    "Point Free Exercise01:06",
    "Point Free Solution07:19",
    "Advanced Point Free09:53",
    "Closure05:31",
    "Closure Exercise01:48",
    "Closure Solution08:32",
    "Lazy vs Eager Execution06:09",
    "Memoization11:24",
    "Referential Transparency05:11",
    "Generalized to Specialized08:52",
    "Partial Application & Currying09:18",
    "Partial Application & Currying Comparison06:02",
    "Changing Function Shape with Curry03:46",
    "Composition Illustration11:41",
    "Declarative Data Flow07:07",
    "Piping vs Composition06:59",
    "Piping & Composition Exercise01:20",
    "Piping & Composition Solution02:41",
    "Associativity02:47",
    "Composition with Currying03:54",
    "Immutability07:39",
    "Rethinking const Immutability09:34",
    "Value Immutability05:29",
    "Object.freeze04:51",
    "Dont Mutate, Copy04:48",
    "Immutable Data Structures07:49",
    "Immutable.js Overview04:56",
    "Immutability Exercise02:18",
    "Immutability Solution07:40",
  ].map((title) => `${title.replace(":", "")}.mp4`),
};

puppeteer.launch({ headless: true }).then(async (browser) => {
  const page = await getPage(browser, config.url);
  const result = await getMp4Urls(page);
  await browser.close();
  downloadFiles(result);
});

function downloadFiles(urls) {
  urls.forEach((url, i) => {
    download(url, path.resolve(__dirname, `0${i}-${config.videoTitles[i]}`));
  });
}

async function getMp4Urls(page) {
  let result = [];
  for await (const url of config.videoUrlsToParse) {
    const mp4Url = await getMp4Url(page, url);
    result.push(mp4Url);
  }
  return result;
}

async function getMp4Url(page, url) {
  await page.type(config.inputSelector, url);
  await page.click(config.submitBtnSelector);
  await page.waitForSelector(config.mp4UrlSelector);
  await page.waitForFunction(`document.querySelector("${config.mp4UrlSelector}").value!==""`);
  const mp4Url = await page.evaluate((selector) => {
    return document.querySelector(selector).value;
  }, config.mp4UrlSelector);

  return mp4Url;
}

async function getPage(browser, url) {
  const page = await browser.newPage();
  await clearCookies(page);
  await page.goto(url);
  return page;
}

async function clearCookies(page) {
  await page._client.send("Network.clearBrowserCookies");
  await page._client.send("Network.clearBrowserCache");
}
