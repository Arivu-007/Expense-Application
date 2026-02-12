#!/usr/bin/env node
/**
 * Simple validation script for CI.
 * Checks that required project files exist and package.json is valid.
 */
const fs = require('fs');
const path = require('path');

const requiredFiles = ['package.json', 'index.html', 'app.js', 'styles.css'];
let failed = false;

console.log('Validating project structure...\n');

// Check package.json exists and is valid
const pkgPath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(pkgPath)) {
  console.error('FAIL: package.json not found');
  process.exit(1);
}
try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (!pkg.name || !pkg.version) {
    console.error('FAIL: package.json must have name and version');
    process.exit(1);
  }
  console.log('  package.json: valid');
} catch (e) {
  console.error('FAIL: package.json is not valid JSON:', e.message);
  process.exit(1);
}

// Check required files exist
const root = path.join(__dirname, '..');
for (const file of requiredFiles) {
  const filePath = path.join(root, file);
  if (fs.existsSync(filePath)) {
    console.log('  ' + file + ': found');
  } else {
    console.error('  ' + file + ': MISSING');
    failed = true;
  }
}

if (failed) {
  console.error('\nValidation failed.');
  process.exit(1);
}

console.log('\nValidation passed.');
process.exit(0);
