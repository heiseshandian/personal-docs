import axios, { AxiosError } from 'axios';
import fs from 'fs';
import filenamify from 'filenamify';
import path from 'path';

// 下载文件到本地
export async function download(
  url: string,
  dest: string,
): Promise<void | AxiosError> {
  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
  });

  const { dir, base } = path.parse(dest);

  response.data.pipe(fs.createWriteStream(path.resolve(dir, filenamify(base))));

  return new Promise((resolve, reject) => {
    response.data.on('end', () => {
      resolve();
    });
    response.data.on('error', (err: AxiosError) => {
      reject(err);
    });
  });
}
