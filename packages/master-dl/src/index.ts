#!/usr/bin/env node

import inquirer from 'inquirer';

import fedApi from './fed-api';
import prompts from './prompts';
import { setDir, setTotal, download } from './downloader';
import { sanitize } from './utils';
import { extractPrograms } from './programs-extractor';
import { ConcurrentTasks } from 'zgq-shared';

(async function run() {
  if (!(await fedApi.tryExistingTokens())) {
    const { email, password } = await inquirer.prompt(prompts.login);
    const loginRes = await fedApi.login(email, password);

    if (loginRes.code) {
      console.log(`Login failed: ${loginRes.message}`);
      return;
    }
  }

  let searchCourseRes: MasterDl.Course[] = [];
  while (searchCourseRes.length < 1) {
    const searchCoursePromptRes = await inquirer.prompt(prompts.searchCourse);
    const { query } = searchCoursePromptRes;
    searchCourseRes = await fedApi.search(query);

    if (searchCourseRes.length < 1) {
      console.log('No results found, try again.');
    }
  }

  const list = searchCourseRes.map(course => {
    const { title, instructors, hasCC, durationSeconds } = course;
    return {
      name: `${title} - ${instructors[0].name} (${Math.floor(
        durationSeconds / 3600,
      )} hours, ${Math.floor((durationSeconds / 60) % 60)} minutes) ${
        hasCC ? '[CC]' : ''
      }`,
      value: course,
    };
  });

  const { course } = await inquirer.prompt(prompts.selectCourse(list));

  const downloadList = await fedApi.course(course.hash);

  const programs = await extractPrograms(downloadList);
  if (!programs) {
    return;
  }

  const { quality } = await inquirer.prompt(prompts.selectQuality(programs));

  setDir(`./${sanitize(course.title)}/`);
  setTotal(downloadList.length);

  await new ConcurrentTasks(
    downloadList.map(
      ({ streamingURL, transcriptURL, pos, title }) => async () => {
        if (transcriptURL) {
          await download(transcriptURL, pos, title, 'srt');
        }
        await download(streamingURL, pos, title, 'mp4', quality);
      },
    ),
  ).run();
})();
