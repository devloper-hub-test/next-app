const { resolve } = require("node:path");

// Resolve tsconfig from this package, not from wherever ESLint was launched
const project = resolve(__dirname, "tsconfig.json");

module.exports = {
  extends: ["@repo/eslint-config/react.js"],
  parserOptions: {
    project,
    tsconfigRootDir: __dirname,
  },
  settings: {
    "import/resolver": {
      typescript: { project },
    },
  },
};
