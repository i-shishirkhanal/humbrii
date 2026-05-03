import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const scriptPath = path.join(repoRoot, 'scripts/generate-sitemap.js');
const sitemapPath = path.join(repoRoot, 'public/sitemap.xml');

test('generates a static sitemap when Supabase environment variables are missing', () => {
  const cwd = mkdtempSync(path.join(tmpdir(), 'sitemap-no-env-'));
  const originalSitemap = readFileSync(sitemapPath, 'utf8');

  try {
    const result = spawnSync(process.execPath, [scriptPath], {
      cwd,
      env: { PATH: process.env.PATH },
      encoding: 'utf8',
    });

    assert.equal(result.status, 0, result.stderr || result.stdout);

    const sitemap = readFileSync(sitemapPath, 'utf8');
    assert.match(sitemap, /<loc>https:\/\/humbri\.com\/<\/loc>/);
    assert.match(sitemap, /<loc>https:\/\/humbri\.com\/properties<\/loc>/);
  } finally {
    writeFileSync(sitemapPath, originalSitemap);
    rmSync(cwd, { recursive: true, force: true });
  }
});
