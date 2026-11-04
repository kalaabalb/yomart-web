import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { STAGING_ROBOTS_TXT } from '../tooling/robots_policy.mjs';

test('staging robots policy lets crawlers read the noindex page directive', async () => {
  assert.equal(STAGING_ROBOTS_TXT, 'User-agent: *\nAllow: /\n');

  const buildScript = await readFile(new URL('../tooling/build.mjs', import.meta.url), 'utf8');
  assert.match(buildScript, /STAGING_ROBOTS_TXT/);
  assert.match(buildScript, /noindex,nofollow,noarchive/);
  assert.doesNotMatch(buildScript, /Disallow:\s*\//);
});
