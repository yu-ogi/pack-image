/// <reference types="node" />

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, extname, join, basename as pathBasename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface LayoutEntry {
  file: string;
  width: number;
  height: number;
  x: number;
  y: number;
  angle: number;
}

describe('cli specs', () => {
  const tmpDir = join(__dirname, 'tmp');
  const cliPath = join(__dirname, '..', 'lib', 'cli.js');

  beforeAll(() => {
    mkdirSync(tmpDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  test('should create packed image and layout json', async () => {
    const basename = `${Date.now()}`;
    const imagePath = join(tmpDir, `${basename}.png`);
    const layoutPath = join(tmpDir, `${basename}.json`);

    execFileSync('node', [cliPath, './fixtures/**/*.png', '--output', imagePath, '--output-layout', layoutPath, '--padding', '2'], {
      cwd: __dirname,
    });

    expect(existsSync(imagePath)).toBe(true);

    const entries: LayoutEntry[] = JSON.parse(readFileSync(layoutPath, 'utf-8'));
    expect(entries).toHaveLength(4);

    const byBasename = new Map(entries.map((e) => [pathBasename(e.file, extname(e.file)), e]));
    for (const name of ['fish', 'police_car', 'spanner', 'squirrel']) {
      const entry = byBasename.get(name);
      expect(entry).toBeDefined();
      assertValidLayoutEntry(entry as LayoutEntry);
    }
  });

  test('should not overlap and should not rotate without --allow-rotate', async () => {
    const basename = `${Date.now()}`;
    const imagePath = join(tmpDir, `${basename}.png`);
    const layoutPath = join(tmpDir, `${basename}.json`);

    execFileSync('node', [cliPath, './fixtures/**/*.png', '--output', imagePath, '--output-layout', layoutPath], {
      cwd: __dirname,
    });

    const entries: LayoutEntry[] = JSON.parse(readFileSync(layoutPath, 'utf-8'));
    for (const entry of entries) {
      expect(entry.angle).toBe(0);
    }

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        expect(rectsIntersect(entries[i], entries[j])).toBe(false);
      }
    }
  });

  function assertValidLayoutEntry(entry: LayoutEntry) {
    expect(typeof entry.x).toBe('number');
    expect(typeof entry.y).toBe('number');
    expect(typeof entry.width).toBe('number');
    expect(typeof entry.height).toBe('number');
    expect(typeof entry.angle).toBe('number');
  }

  function rectsIntersect(a: LayoutEntry, b: LayoutEntry): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }
});
