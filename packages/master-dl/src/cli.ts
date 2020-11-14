#!/usr/bin/env node

import inquirer from 'inquirer';
import { ConcurrentTasks } from 'zgq-shared';
import { Course } from './global';
import {
  download,
  extractPrograms,
  fedApi,
  prompts,
  sanitize,
  setDir,
  setTotal,
} from './index';

(async function run() {
  if (!(await fedApi.tryExistingTokens())) {
    const { email, password } = await inquirer.prompt(prompts.login);
    const loginRes = await fedApi.login(email, password);

    if (loginRes.code) {
      console.log(`Login failed: ${loginRes.message}`);
      return;
    }
  }

  let searchCourseRes: Course[] = [];
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
      ({ streamingURL, transcriptURL, pos: id, title }) => async () => {
        await Promise.all([
          download({
            url: transcriptURL,
            id,
            title,
            ext: 'srt',
          }),
          download({
            url: streamingURL,
            id,
            title,
            ext: 'mp4',
            programId: quality,
          }),
        ]);
      },
    ),
  ).run();
})();
