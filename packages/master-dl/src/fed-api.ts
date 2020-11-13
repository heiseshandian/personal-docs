import fetch from 'node-fetch';
import os from 'os';
import fs from 'fs';

import fedHasher from './fed-hasher';
import constants from './constants';

export default {
  login,
  course,
  search,
  tryExistingTokens,
};

const tokensPath = `${os.homedir}/.frontendmasters-downloader`;

async function generateTimestamp() {
  timestamp = Math.floor(Date.now() / 1000);
  hash = await fedHasher(timestamp);
}

function rndHex(len: number) {
  const hex = '0123456789abcdef';
  let output = '';
  for (let i = 0; i < len; ++i) {
    output += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return output;
}

function generateClientDeviceID() {
  return `${rndHex(8)}-${rndHex(4)}-${rndHex(4)}-${rndHex(4)}-${rndHex(12)}`;
}

let timestamp: number | undefined;
let hash: string | undefined;
let token: string | undefined;

const cliendDeviceID = generateClientDeviceID();

const baseHeaders = {
  Host: 'api.frontendmasters.com',
  'content-type': 'application/json; charset=utf-8',
  accept: 'application/json',
  'x-request-signature': '',
  'x-client-device': cliendDeviceID,
  'x-client-platform': 'android',
};

async function login(username: string, password: string) {
  await generateTimestamp();
  const json = await sendRequest('login/', { password, username });
  token = json.token;

  if (!json.code) {
    saveTokens();
  }

  return json;
}

function saveTokens() {
  fs.writeFileSync(tokensPath, JSON.stringify({ timestamp, hash, token }));
}

async function testTokens(items: MasterDl.TokenRecord) {
  timestamp = items.timestamp;
  hash = items.hash;
  token = items.token;

  const session = await sendRequest('session/');
  return !!session.user;
}

async function search(query: string) {
  const lower = query.toLowerCase();
  const courses: MasterDl.Course[] = await sendRequest('courses/?limit=9999');
  return courses.filter(course => course.title.toLowerCase().includes(lower));
}

async function course(hash: string) {
  const json = await sendRequest(`courses/${hash}`);
  const list: MasterDl.Course[] = json.lessonGroups.reduce(
    (acc: any, cur: any) => [...acc, ...cur.lessons],
    [],
  );
  return list.map(course => {
    const { title, pos, streamingURL, transcriptURL } = course;
    return { title, pos, streamingURL, transcriptURL };
  });
}

interface Options {
  method: 'POST' | 'GET';
  headers: Record<string, string>;
  body?: any;
}

async function sendRequest(target: string, body: any = null) {
  const options: Options = {
    method: body ? 'POST' : 'GET',
    headers: baseHeaders,
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  if (!token) {
    options.headers[
      'x-request-signature'
    ] = `timestamp=${timestamp}&hash=${hash}`;
  } else {
    options.headers.authorization = `Bearer ${token}`;
  }
  const url = `${constants.baseUrl}${target}`;
  return fetch(url, options)
    .then(res => res.text())
    .then(x => JSON.parse(x));
}

async function tryExistingTokens() {
  if (!fs.existsSync(tokensPath)) {
    return false;
  }
  console.log('Existing login found.');
  const tokens = JSON.parse(fs.readFileSync(tokensPath, { encoding: 'utf-8' }));
  const tokenWorks = await testTokens(tokens);
  if (!tokenWorks) {
    console.log('Existing login expired/not working.');
    return false;
  }
  return true;
}
