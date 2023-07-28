module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
  coveragePathIgnorePatterns: ['<rootDir>/test/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // 解决axios升v1版本后jest报错esm问题
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
  },
  // 输出日志
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './logs',
        filename: 'midway-test.html',
        expand: true,
      },
    ],
  ],
};
