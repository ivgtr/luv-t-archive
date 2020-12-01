const config = {
  clearMocks: true,
  coverageProvider: 'v8',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts']
}

export default config
