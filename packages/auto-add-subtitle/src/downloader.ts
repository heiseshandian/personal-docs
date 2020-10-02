import axios, { AxiosError, AxiosResponse } from 'axios';
import fs from 'fs';
import filenamify from 'filenamify';
import path from 'path';
import { MultiProgressBar } from './progress';

// 下载文件到本地
export async function download(url: string, dest: string) {
  if (!url || !dest || !filenamify(dest)) {
    return Promise.resolve(false);
  }

  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
  });

  showProgressBar(response);
  writeStreamToFile(response.data, dest);

  return new Promise<boolean | AxiosError>((resolve, reject) => {
    response.data.on('end', () => {
      resolve(true);
    });
    response.data.on('error', (err: AxiosError) => {
      reject(err);
    });
  });
}

// 去掉文件名中的非法字符
export function toValidFilePath(filePath: string) {
  const { dir, base } = path.parse(filePath);
  return path.resolve(dir, filenamify(base));
}

function writeStreamToFile(stream: any, filePath: string) {
  stream.pipe(fs.createWriteStream(toValidFilePath(filePath)));
}

// 展示下载进度条
function showProgressBar(response: AxiosResponse) {
  const total = parseInt(response.headers['content-length'], 10);
  if (isNaN(total)) {
    return;
  }

  const bar = MultiProgressBar.getProgressBar('downloading', { total });

  response.data.on('data', (chunk: any) => {
    bar.tick(chunk.length);
  });
}
