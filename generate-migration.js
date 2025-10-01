#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Get migration name from command line arguments
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration name:');
  console.error('Example: npm run migration:generate:custom CreateUserTable');
  process.exit(1);
}

// Build the command
const command = `typeorm-ts-node-commonjs migration:generate ./src/migrations/${migrationName} -d ./src/data-source.ts`;

console.log(`Generating migration: ${migrationName}`);
console.log(`Running: ${command}`);

try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}