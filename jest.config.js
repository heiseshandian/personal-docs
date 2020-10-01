module.exports = {
  transform: {
    '.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['<rootDir>/packages/**/__tests__/**/*spec.[jt]s?(x)'],
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  globals: {
    'ts-jest': {
      diagnostics: true,
      isolatedModules: true,
    },
  },
  setupFilesAfterEnv: ['./scripts/jest-env.ts'],
  testEnvironment: 'node',
};
