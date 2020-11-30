#!/usr/bin/env node

import yargs from 'yargs';
import fse, { readFile, writeFile } from 'fs-extra';
import path from 'path';
import { spawn, execSync } from 'child_process';
import os from 'os';

const argv = yargs
  .usage(`Usage: create-monorepository {project-name}`)
  .help('help')
  .alias('help', 'h').argv;

interface Arguments {
  [x: string]: unknown;
  _: string[];
  $0: string;
}

(async () => {
  const { _: names } = argv as Arguments;

  if (names.length === 0) {
    console.log('project name is required!');
    return;
  }

  const projectPath = path.resolve(process.cwd(), names[0]);
  await fse.copy(path.resolve(__dirname, '../templates/'), projectPath);
  await updatePlaceHolders(projectPath, names[0]);
  await installDeps(projectPath);
})();

async function updatePlaceHolders(projectPath: string, name: string) {
  const PROJECT_PLACE_HOLDER = 'project_place_holder';

  const content = await readFile(path.resolve(projectPath, 'package.json'), {
    encoding: 'utf-8',
  });
  await writeFile(
    path.resolve(projectPath, 'package.json'),
    content.replace(new RegExp(PROJECT_PLACE_HOLDER, 'g'), name),
  );
}

function installDeps(projectPath: string) {
  execSync(`cd ${projectPath}`);

  return new Promise(resolve => {
    const proc = spawn(`${isWindows() ? 'npm.cmd' : 'npm'}`, ['i']);

    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', function (data) {
      console.log(data);
    });

    proc.on('exit', code => {
      if (code || code === 0) {
        process.exitCode = code;
      }
    });
    proc.on('error', err => {
      handleError(err);
      resolve();
    });
    proc.on('close', () => resolve());
  });
}

function handleError(e: Error) {
  console.log(e);
}

function isWindows() {
  return os.platform() === 'win32';
}
