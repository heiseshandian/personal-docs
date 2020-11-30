import { existsSync, mkdirSync, readdir, copy, readFile, writeFile } from 'fs-extra';
import path from 'path';

const PROJECT_PLACE_HOLDER = 'project_place_holder';

(async () => {
  const { name } = parseArgv();
  if (!name) {
    console.log('name is required!!');
    return;
  }

  const project = createEmptyProject(name);
  await copyTemplates(project);
  await updatePlaceHolders(project, name);
})();

function createEmptyProject(name: string) {
  const project = ensurePathExists(path.resolve(__dirname, `../packages/${name}`));

  ['__tests__', 'src'].forEach(dir => ensurePathExists(path.resolve(project, dir)));

  return project;
}

async function copyTemplates(destDir: string) {
  await copyFiles(destDir, path.resolve(__dirname, './templates/'));
}

async function copyFiles(destDir: string, srcDir: string) {
  const files = await readdir(srcDir);

  await Promise.all(
    files.filter(isFile).map(file => copy(path.resolve(srcDir, file), path.resolve(destDir, file))),
  );
}

function isFile(file: string) {
  return /\w+$/.test(file);
}

async function updatePlaceHolders(project: string, name: string) {
  const content = await readFile(path.resolve(project, 'package.json'), {
    encoding: 'utf-8',
  });
  await writeFile(
    path.resolve(project, 'package.json'),
    content.replace(new RegExp(PROJECT_PLACE_HOLDER, 'g'), name),
  );
}

interface Argv {
  name: string;
}

function parseArgv() {
  return process.argv.slice(2).reduce((acc, cur) => {
    const [, name, value] = cur.match(/^-{0,2}(\w+)\s*=\s*([-\w]+)/) || [];
    acc[name] = value;
    return acc;
  }, {} as Record<string, any>) as Argv;
}

function ensurePathExists(filePath: string) {
  if (!existsSync(filePath)) {
    mkdirSync(filePath, { recursive: true });
  }

  return filePath;
}
