module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],

    rootDir: '.',

    testRegex: '.*\\.(spec|test)\\.(js|ts)$',

    transform: {
        '^.+\\.(t|j)s$': ['ts-jest', {
            useESM: false,
            tsconfig: 'tsconfig.json',
        }],
    },

    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },

    collectCoverageFrom: [
        'src/**/*.(t|j)s',
        '!src/main.ts',
    ],

    testEnvironment: 'node',
};