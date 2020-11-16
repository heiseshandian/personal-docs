import { exec } from 'child_process';

export async function lookIp(domain: string) {
  return new Promise(resolve => {
    exec(`ping ${domain}`, (err, stdout) => {
      if (err) {
        handleError(err);
        resolve();
      } else {
        resolve(parseIp(stdout));
      }
    });
  });
}

const looseIpReg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
function parseIp(stdout: string) {
  const [ip] = stdout.match(looseIpReg) || [];
  return ip;
}

function handleError(e: Error) {
  console.log(e);
}
