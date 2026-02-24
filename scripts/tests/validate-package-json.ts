import assert from 'node:assert/strict';
import fs from 'node:fs';

function read(file: string) {
  return fs.readFileSync(file, 'utf8');
}

function ensureNoConflictMarkers(content: string, file: string) {
  const markers = ['<<<<<<<', '=======', '>>>>>>>'];
  for (const marker of markers) {
    assert.equal(content.includes(marker), false, `${file} contains unresolved merge marker: ${marker}`);
  }
}

function validateJsonFile(file: string) {
  const raw = read(file);
  ensureNoConflictMarkers(raw, file);
  JSON.parse(raw);
}

validateJsonFile('package.json');
validateJsonFile('package-lock.json');

console.log('package json validation checks passed');
