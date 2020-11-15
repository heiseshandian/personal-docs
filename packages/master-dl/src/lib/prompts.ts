import { CourseChoice, QualityChoice } from '../global';

const login = [
  {
    type: 'input',
    name: 'email',
    message: 'Email address:',
  },
  {
    type: 'password',
    name: 'password',
    mask: '*',
    message: 'Password:',
  },
];

const searchCourse = [
  {
    type: 'input',
    name: 'query',
    message: 'Search for course by keyword:',
  },
];

const selectCourse = (list: CourseChoice[]) => [
  {
    type: 'list',
    name: 'course',
    message: 'Select a course from search results:',
    choices: list,
  },
];

const selectQuality = (list: QualityChoice[]) => [
  {
    type: 'list',
    name: 'quality',
    message: 'Select download quality:',
    choices: list,
  },
];

// 放在一个对象上导出可提供上下文信息
export const prompts = {
  login,
  searchCourse,
  selectCourse,
  selectQuality,
};
