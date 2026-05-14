const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envFiles = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
].filter((envPath) => fs.existsSync(envPath));

const initialEnvKeys = new Set(
  Object.keys(process.env).map((key) => key.toUpperCase())
);

const applyEnvFile = (envPath, override = false) => {
  const parsed = dotenv.parse(fs.readFileSync(envPath));

  Object.entries(parsed).forEach(([key, value]) => {
    if (initialEnvKeys.has(key.toUpperCase())) {
      return;
    }

    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
};

envFiles.forEach((envPath, index) => {
  applyEnvFile(envPath, index > 0);
});

module.exports = { envFiles };
