import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateStorefrontArtifact, resolveStorefrontTarget } from '../tooling/build_target.mjs';

const resolveTestTarget = (env) => resolveStorefrontTarget(env, { allowReservedTestHosts: true });

const staging = {
  YOMART_BUILD_ENV: 'staging',
  VITE_API_BASE_URL: 'https://api.stage.invalid.test',
  YOMART_EXPECTED_API_ORIGIN: 'https://api.stage.invalid.test/',
  VITE_EXPECTED_SITE_ORIGIN: 'https://shop.stage.invalid.test',
  YOMART_PRODUCTION_API_ORIGINS: 'https://api.live.invalid.test',
  YOMART_PRODUCTION_SITE_ORIGINS: 'https://shop.live.invalid.test',
};

test('staging target normalizes the API origin and keeps API/site denylists separate', () => {
  assert.deepEqual(resolveTestTarget(staging), {
    buildEnv: 'staging',
    apiOrigin: 'https://api.stage.invalid.test',
    siteOrigin: 'https://shop.stage.invalid.test',
    blockedApiOrigins: ['https://api.live.invalid.test'],
    blockedSiteOrigins: ['https://shop.live.invalid.test'],
  });
});

test('explicit staging with no confirmed production origins accepts empty or unset staging denylists', () => {
  const noProduction = {
    YOMART_BUILD_ENV: 'staging',
    VITE_API_BASE_URL: 'https://yomart-api.onrender.com',
    YOMART_EXPECTED_API_ORIGIN: 'https://yomart-api.onrender.com',
    VITE_EXPECTED_SITE_ORIGIN: 'https://yomart.onrender.com',
    YOMART_NO_PRODUCTION_API: 'true',
    YOMART_PRODUCTION_API_ORIGINS: '',
  };
  assert.equal(resolveStorefrontTarget(noProduction).apiOrigin, 'https://yomart-api.onrender.com');
  assert.equal(resolveStorefrontTarget({ ...noProduction, YOMART_PRODUCTION_API_ORIGINS: undefined }).siteOrigin, 'https://yomart.onrender.com');
  assert.equal(resolveStorefrontTarget({ ...noProduction, YOMART_PRODUCTION_SITE_ORIGINS: '' }).blockedSiteOrigins.length, 0);
});

test('an unset API denylist requires the explicit no-production-API staging assertion', () => {
  const { YOMART_NO_PRODUCTION_API, YOMART_PRODUCTION_API_ORIGINS, ...missing } = {
    ...staging,
    YOMART_PRODUCTION_API_ORIGINS: undefined,
  };
  assert.throws(() => resolveTestTarget(missing), /YOMART_PRODUCTION_API_ORIGINS/);
  assert.equal(resolveTestTarget({ ...missing, YOMART_NO_PRODUCTION_API: 'true' }).buildEnv, 'staging');
  assert.throws(() => resolveTestTarget({ ...staging, YOMART_NO_PRODUCTION_API: 'true' }), /cannot be combined/);
  assert.equal(resolveTestTarget({ ...missing, YOMART_PRODUCTION_API_ORIGINS: '' }).buildEnv, 'staging');
});

test('staging rejects configured production API or site overlap', () => {
  assert.throws(() => resolveTestTarget({ ...staging, YOMART_PRODUCTION_API_ORIGINS: 'https://api.stage.invalid.test' }), /production API/);
  assert.throws(() => resolveTestTarget({ ...staging, YOMART_PRODUCTION_SITE_ORIGINS: 'https://shop.stage.invalid.test' }), /production site/);
});

test('all supplied denylist origins are strictly validated', () => {
  for (const value of ['*', 'http://prod.invalid.test', 'https://prod.invalid.test/path', 'https://u:p@prod.invalid.test', 'https://prod.invalid.test?q=1', 'https://prod.invalid.test/#frag', 'https://*.invalid.test', 'https://prod.invalid.test,,https://other.invalid.test']) {
    assert.throws(() => resolveTestTarget({ ...staging, YOMART_PRODUCTION_API_ORIGINS: value }), /origin|HTTPS|wildcard/i);
    assert.throws(() => resolveTestTarget({ ...staging, YOMART_PRODUCTION_SITE_ORIGINS: value }), /origin|HTTPS|wildcard/i);
  }
});

test('production requires non-empty staging API and site denylists and rejects overlap', () => {
  const production = {
    YOMART_BUILD_ENV: 'production',
    VITE_API_BASE_URL: 'https://api.live.invalid.test',
    YOMART_EXPECTED_API_ORIGIN: 'https://api.live.invalid.test',
    VITE_EXPECTED_SITE_ORIGIN: 'https://shop.live.invalid.test',
    YOMART_STAGING_API_ORIGINS: 'https://api.stage.invalid.test',
    YOMART_STAGING_SITE_ORIGINS: 'https://shop.stage.invalid.test',
  };
  assert.throws(() => resolveTestTarget({ ...production, YOMART_STAGING_API_ORIGINS: '' }), /YOMART_STAGING_API_ORIGINS/);
  assert.throws(() => resolveTestTarget({ ...production, YOMART_STAGING_SITE_ORIGINS: undefined }), /YOMART_STAGING_SITE_ORIGINS/);
  assert.throws(() => resolveTestTarget({ ...production, VITE_API_BASE_URL: 'https://api.stage.invalid.test', YOMART_EXPECTED_API_ORIGIN: 'https://api.stage.invalid.test' }), /staging API/);
  assert.throws(() => resolveTestTarget({ ...production, VITE_EXPECTED_SITE_ORIGIN: 'https://shop.stage.invalid.test' }), /staging site/);
});

test('release origins reject credentials, paths, queries, fragments, loopback, wildcards, and placeholders', () => {
  for (const api of ['https://name:pass@api.invalid.test', 'https://api.invalid.test/v1', 'https://api.invalid.test?x=1', 'https://api.invalid.test/#x', 'http://localhost:3000', 'https://replace-with-api.example', 'https://*.invalid.test']) {
    assert.throws(() => resolveTestTarget({ ...staging, VITE_API_BASE_URL: api, YOMART_EXPECTED_API_ORIGIN: api }), /origin|HTTPS|loopback|placeholder|wildcard/i);
  }
});

test('local target permits loopback only with explicit local override', () => {
  const local = { YOMART_BUILD_ENV: 'local', VITE_API_BASE_URL: 'http://localhost:3000', YOMART_EXPECTED_API_ORIGIN: 'http://localhost:3000', VITE_EXPECTED_SITE_ORIGIN: 'http://localhost:5173', VITE_ALLOW_LOCAL_API: 'true' };
  assert.equal(resolveStorefrontTarget(local).apiOrigin, 'http://localhost:3000');
  assert.throws(() => resolveStorefrontTarget({ ...local, VITE_ALLOW_LOCAL_API: 'false' }), /HTTPS|loopback/i);
});

test('built staging artifact rejects configured opposite-environment origins', async (t) => {
  const target = resolveTestTarget(staging);
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'yomart-web-artifact-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.writeFile(path.join(directory, 'index.html'), '<html><head><meta name="robots" content="noindex,nofollow,noarchive"></head></html>');
  await fs.writeFile(path.join(directory, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  await fs.writeFile(path.join(directory, 'app.js'), `${target.apiOrigin} ${target.siteOrigin} https://api.live.invalid.test`);
  await assert.rejects(validateStorefrontArtifact(directory, target), /opposite environment/);
});

test('artifact validator permits only React Router’s isolated inert localhost sentinel', async (t) => {
  const target = resolveTestTarget(staging);
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'yomart-web-router-artifact-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.mkdir(path.join(directory, 'assets'));
  await fs.writeFile(path.join(directory, 'index.html'), '<html><head><meta name="robots" content="noindex,nofollow,noarchive"></head></html>');
  await fs.writeFile(path.join(directory, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  await fs.writeFile(path.join(directory, 'assets', 'app.js'), `${target.apiOrigin} ${target.siteOrigin}`);
  await fs.writeFile(path.join(directory, 'assets', 'router-vendor-Abc123.js'), 'const base="http://localhost";');
  assert.deepEqual(await validateStorefrontArtifact(directory, target), { files: 4 });
  await fs.writeFile(path.join(directory, 'assets', 'app.js'), `${target.apiOrigin} ${target.siteOrigin} fetch("http://localhost:3000")`);
  await assert.rejects(validateStorefrontArtifact(directory, target), /localhost or placeholder endpoint/);
});

test('failed staging preflight removes stale output instead of leaving a publishable bundle', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'yomart-web-stale-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.writeFile(path.join(directory, 'old-release.txt'), 'stale bundle');
  const buildScript = new URL('../tooling/build.mjs', import.meta.url);
  const result = spawnSync(process.execPath, [buildScript.pathname], {
    cwd: path.resolve(new URL('..', import.meta.url).pathname),
    env: {
      ...process.env,
      YOMART_BUILD_OUTPUT_DIR: directory,
      YOMART_BUILD_ENV: 'staging',
      VITE_API_BASE_URL: 'https://api.stage.invalid.test',
      YOMART_EXPECTED_API_ORIGIN: 'https://api.stage.invalid.test',
      VITE_EXPECTED_SITE_ORIGIN: 'https://shop.stage.invalid.test',
    },
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  await assert.rejects(fs.access(directory));
});
