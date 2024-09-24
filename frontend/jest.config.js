export default {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', '<rootDir>/coverage/', '<rootDir>/jest-report/' ],
    testResultsProcessor: 'jest-sonar-reporter',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
};
