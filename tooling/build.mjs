import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadEnv } from 'vite';
import { resolveStorefrontTarget, validateStorefrontArtifact } from './build_target.mjs';
import { STAGING_ROBOTS_TXT } from './robots_policy.mjs';

const root = process.cwd();
const requestedOutput = process.env.YOMART_BUILD_OUTPUT_DIR || path.join(root, 'dist');
const output = path.resolve(requestedOutput);

// Remove stale bundles before validating inputs. If preflight or Vite fails,
// there will be no artifact from an older environment left to publish.
await fs.rm(output, { recursive: true, force: true });

try {
  const buildEnv = process.env.YOMART_BUILD_ENV;
  const viteMode = buildEnv === 'local' ? 'development' : buildEnv || 'production';
  const fileEnv = loadEnv(viteMode, root, '');
  const env = { ...fileEnv, ...process.env };
  const target = resolveStorefrontTarget(env);
  const vite = path.join(root, 'node_modules/vite/bin/vite.js');
  const result = spawnSync(process.execPath, [vite, 'build', '--mode', viteMode, '--outDir', output, '--emptyOutDir'], {
    cwd: root,
    env,
    stdio: 'inherit',
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Storefront build failed with exit code ${result.status ?? 'unknown'}.`);
  }

  const indexPath = path.join(output, 'index.html');
  let indexHtml = await fs.readFile(indexPath, 'utf8');
  if (!/<\/head\s*>/i.test(indexHtml)) throw new Error('Build artifact is missing a closing head tag.');
  if (target.buildEnv !== 'production') {
    indexHtml = indexHtml.replace(/<meta\b(?=[^>]*\bname\s*=\s*['"]robots['"])[^>]*>/gi, '');
    indexHtml = indexHtml.replace(/<\/head\s*>/i, '<meta name="robots" content="noindex,nofollow,noarchive">\n</head>');
    await fs.writeFile(path.join(output, 'robots.txt'), STAGING_ROBOTS_TXT, 'utf8');
  } else {
    await fs.writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nAllow: /\n', 'utf8');
  }
  await fs.writeFile(indexPath, indexHtml, 'utf8');

  const report = await validateStorefrontArtifact(output, target);
  console.log(`Storefront ${target.buildEnv} build validated (${report.files} text artifacts).`);
} catch (error) {
  await fs.rm(output, { recursive: true, force: true });
  console.error(`YoMart storefront build failed: ${error.message}`);
  process.exitCode = 1;
}
