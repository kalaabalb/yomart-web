import fs from 'node:fs/promises';
import path from 'node:path';
import { isIP } from 'node:net';
import { STAGING_ROBOTS_TXT } from './robots_policy.mjs';

const PLACEHOLDERS = new Set(['example.com', 'example.org', 'example.net', 'example.invalid']);

function parseOrigin(value, name, { allowLocal = false, allowReservedTestHosts = false } = {}) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} is required.`);
  let parsed;
  try { parsed = new URL(value.trim()); } catch { throw new Error(`${name} must be an absolute HTTP(S) origin.`); }
  const host = parsed.hostname.toLowerCase();
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash || !['', '/'].includes(parsed.pathname)) {
    throw new Error(`${name} must be an origin without credentials, path, query, or fragment.`);
  }
  const ipHost = host.replace(/^\[|\]$/g, '');
  const local = host === 'localhost' || host.endsWith('.localhost') || host === '::1' ||
    (isIP(ipHost) === 4 && Number(ipHost.split('.')[0]) === 127);
  const reservedTestHost = host.endsWith('.test') || host.endsWith('.invalid') || host.endsWith('.localhost') || host.endsWith('.local');
  if (host.includes('*') || host.includes('replace-with') || host.includes('placeholder') || host.includes('your-api-domain') || PLACEHOLDERS.has(host) || host.endsWith('.example') || (reservedTestHost && !allowReservedTestHosts)) {
    throw new Error(`${name} cannot use a wildcard or placeholder hostname.`);
  }
  if (parsed.protocol !== 'https:' && !(allowLocal && local)) throw new Error(`${name} must use HTTPS outside local development.`);
  if (!allowLocal && (local || isIP(ipHost))) throw new Error(`${name} cannot use a loopback or IP address for a release build.`);
  return { origin: parsed.origin, hostname: host, local };
}

function parseOrigins(value, name, { allowEmpty = false, allowUnset = false, allowReservedTestHosts = false } = {}) {
  if (value === undefined && allowUnset) return new Set();
  if (typeof value !== 'string') throw new Error(`${name} is required for environment separation.`);
  if (!value.trim()) {
    if (allowEmpty) return new Set();
    throw new Error(`${name} is required for environment separation.`);
  }
  const entries = value.split(',').map((item) => item.trim());
  if (entries.some((item) => !item)) throw new Error(`${name} must contain only valid comma-separated origins.`);
  return new Set(entries.map((item) => parseOrigin(item, name, { allowReservedTestHosts }).origin));
}

export function resolveStorefrontTarget(env, { allowReservedTestHosts = false } = {}) {
  const buildEnv = env.YOMART_BUILD_ENV;
  if (!['local', 'staging', 'production'].includes(buildEnv)) {
    throw new Error('YOMART_BUILD_ENV must be local, staging, or production.');
  }
  const allowLocal = buildEnv === 'local' && env.VITE_ALLOW_LOCAL_API === 'true';
  const originOptions = { allowLocal, allowReservedTestHosts };
  const api = parseOrigin(env.VITE_API_BASE_URL, 'VITE_API_BASE_URL', originOptions);
  const expectedApi = parseOrigin(env.YOMART_EXPECTED_API_ORIGIN, 'YOMART_EXPECTED_API_ORIGIN', originOptions);
  const site = parseOrigin(env.VITE_EXPECTED_SITE_ORIGIN, 'VITE_EXPECTED_SITE_ORIGIN', originOptions);
  if (api.origin !== expectedApi.origin) throw new Error('VITE_API_BASE_URL must match YOMART_EXPECTED_API_ORIGIN.');
  if (buildEnv === 'local') {
    if (!api.local || !site.local || !allowLocal) throw new Error('Local builds require explicit loopback origins and VITE_ALLOW_LOCAL_API=true.');
  } else if (api.local || site.local) {
    throw new Error(`${buildEnv} builds cannot target loopback origins.`);
  }

  let deniedApis = new Set();
  let deniedSites = new Set();
  if (buildEnv === 'staging') {
    const noProductionApi = env.YOMART_NO_PRODUCTION_API;
    if (noProductionApi !== undefined && !['true', 'false'].includes(noProductionApi)) {
      throw new Error('YOMART_NO_PRODUCTION_API must be true or false when set.');
    }
    const productionApiList = env.YOMART_PRODUCTION_API_ORIGINS;
    const apiListExplicitlyEmpty = typeof productionApiList === 'string' && !productionApiList.trim();
    if (noProductionApi === 'true' && typeof productionApiList === 'string' && productionApiList.trim()) {
      throw new Error('YOMART_NO_PRODUCTION_API=true cannot be combined with production API origins.');
    }
    deniedApis = parseOrigins(productionApiList, 'YOMART_PRODUCTION_API_ORIGINS', {
      allowEmpty: noProductionApi === 'true' || apiListExplicitlyEmpty,
      allowUnset: noProductionApi === 'true',
      allowReservedTestHosts,
    });
    deniedSites = parseOrigins(env.YOMART_PRODUCTION_SITE_ORIGINS, 'YOMART_PRODUCTION_SITE_ORIGINS', {
      allowEmpty: true,
      allowUnset: true,
      allowReservedTestHosts,
    });
    if (deniedApis.has(api.origin)) throw new Error('A production API origin cannot be used for a staging build.');
    if (deniedSites.has(site.origin)) throw new Error('A production site origin cannot be used for a staging build.');
  }
  if (buildEnv === 'production') {
    const stagingApis = parseOrigins(env.YOMART_STAGING_API_ORIGINS, 'YOMART_STAGING_API_ORIGINS', { allowReservedTestHosts });
    const stagingSites = parseOrigins(env.YOMART_STAGING_SITE_ORIGINS, 'YOMART_STAGING_SITE_ORIGINS', { allowReservedTestHosts });
    if (stagingApis.has(api.origin)) throw new Error('A staging API origin cannot be used for a production build.');
    if (stagingSites.has(site.origin)) throw new Error('A staging site origin cannot be used for a production build.');
    deniedApis = stagingApis;
    deniedSites = stagingSites;
  }

  // Keep opposite-environment origins available to the artifact validator,
  // but vite.config serializes only the three runtime values into browser code.
  return Object.freeze({
    buildEnv,
    apiOrigin: api.origin,
    siteOrigin: site.origin,
    blockedApiOrigins: Object.freeze([...deniedApis]),
    blockedSiteOrigins: Object.freeze([...deniedSites]),
  });
}

export async function validateStorefrontArtifact(outputDirectory, target) {
  const files = [];
  async function visit(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(file);
      else if (entry.isFile() && /\.(?:js|html|css|json|txt)$/i.test(entry.name)) files.push(file);
    }
  }
  await visit(outputDirectory);
  const sources = await Promise.all(files.map((file) => fs.readFile(file, 'utf8')));
  if (!sources.some((source) => source.includes(target.apiOrigin)) || !sources.some((source) => source.includes(target.siteOrigin))) {
    throw new Error('Built storefront artifact is missing its validated API or site origin.');
  }

  const indexPath = path.join(outputDirectory, 'index.html');
  const indexHtml = await fs.readFile(indexPath, 'utf8');
  if (target.buildEnv !== 'production') {
    const directives = [...indexHtml.matchAll(/<meta\b(?=[^>]*\bname\s*=\s*['"]robots['"])[^>]*>/gi)];
    if (directives.length !== 1 || !/\bcontent\s*=\s*['"]noindex\s*,\s*nofollow\s*,\s*noarchive['"]/i.test(directives[0][0])) {
      throw new Error('Non-production artifact must contain one noindex robots directive in index.html.');
    }
    if (await fs.readFile(path.join(outputDirectory, 'robots.txt'), 'utf8') !== STAGING_ROBOTS_TXT) {
      throw new Error('Non-production robots.txt must allow crawlers to read the noindex page directive.');
    }
  }

  const forbidden = /https?:\/\/(?:localhost|[^/\s"'\\]*\.localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?|REPLACE-WITH-YOUR-API-DOMAIN|https?:\/\/(?:your-api-domain|placeholder(?:\.[^/\s"']+)?|[^/\s"']*\.example(?:[:/]|$)|example\.(?:com|org|net|invalid))/i;
  if (target.buildEnv !== 'local') {
    for (let index = 0; index < sources.length; index += 1) {
      let source = sources[index];
      const relativeFile = path.relative(outputDirectory, files[index]).replaceAll(path.sep, '/');
      // React Router uses an inert localhost base URL internally when deriving
      // relative URLs without a browser location. Keep it isolated in its own
      // vendor chunk and permit only that exact library sentinel; application
      // chunks still reject all loopback endpoints.
      if (/^assets\/router-vendor-[A-Za-z0-9_-]+\.js$/.test(relativeFile)) {
        source = source.replace(/(["'])http:\/\/localhost\1/g, '""');
      }
      if (forbidden.test(source)) throw new Error(`Built storefront artifact contains a localhost or placeholder endpoint: ${relativeFile}.`);
    }
  }
  for (const origin of [...(target.blockedApiOrigins || []), ...(target.blockedSiteOrigins || [])]) {
    if (sources.some((source) => source.includes(origin))) throw new Error('Built storefront artifact contains an origin reserved for the opposite environment.');
  }
  return { files: files.length };
}
