/*eslint-env node*/

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Optionally specify paths to your test files, for example:
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  // Transform settings if you need to transform files other than ts/tsx
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  transformIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/assets/",
    "<rootDir>/coverage/"
  ],
  // If you're using module paths in your project
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1"
  },
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{js,ts}"]
};
