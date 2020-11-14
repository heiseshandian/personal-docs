import axios, { AxiosError, AxiosResponse } from 'axios';
import filenamify from 'filenamify';
import fs from 'fs';
import { handleError, MultiProgressBar, toValidFilePath } from './utils';

// 下载文件到本地
export async function download(url: string, dest: string) {
  if (!url || !dest || !filenamify(dest)) {
    return false;
  }

  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
  });

  showProgressBar(response);
  writeStreamToFile(response.data, dest);

  return await new Promise<boolean | AxiosError>(resolve => {
    response.data.on('end', () => {
      resolve(true);
    });
    response.data.on('error', (err: AxiosError) => {
      handleError(err);
      resolve(false);
    });
  });
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

  const bar = MultiProgressBar.createProgressBar(
    `downloading ${MultiProgressBar.defaultFormat}`,
    { total },
  );

  response.data.on('data', (chunk: any) => {
    bar.tick(chunk.length);
  });
}
