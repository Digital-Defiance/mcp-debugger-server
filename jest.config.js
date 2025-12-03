/* eslint-disable */
const { readFileSync } = require("fs");

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(
  readFileSync(`${__dirname}/.spec.swcrc`, "utf-8")
);

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

module.exports = {
  displayName: "@ai-capabilities-suite/mcp-server",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest", swcJestConfig],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  coverageDirectory: "test-output/jest/coverage",
  // Explicitly disable babel
  transformIgnorePatterns: [],
  // Increase timeout for E2E tests that spawn real debug sessions
  testTimeout: 60000,
};
