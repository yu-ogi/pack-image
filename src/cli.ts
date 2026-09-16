#!/usr/bin/env node

import { mkdir } from 'node:fs/promises';
import { dirname, extname } from 'node:path';

import { parseCli } from './args.js';
import { writeLayout } from './layout.js';
import { createLogger, logger } from './log.js';
import { buildLayoutEntries, loadInputImages, measureCanvas, packImages, renderCanvas } from './pack.js';
import { savePng } from './png.js';

main();

async function main() {
  try {
    await run(process.argv.slice(2));
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

function defaultLayoutPath(output: string) {
  const ext = extname(output);
  return `${output.slice(0, output.length - ext.length)}.json`;
}

async function ensureParentDir(path: string) {
  const dir = dirname(path);
  if (dir && dir !== '.') {
    await mkdir(dir, { recursive: true });
  }
}

async function run(argv: string[]) {
  const args = parseCli(argv);
  const outputLayout = args.outputLayout ?? defaultLayoutPath(args.output);

  createLogger(args.verbose);

  const { paths, images } = await loadInputImages(args.patterns);
  const placementsByIndex = packImages(images, args);
  const { width: canvasW, height: canvasH } = measureCanvas(images, placementsByIndex);

  logger.info(`canvas size: ${canvasW}x${canvasH}`);

  await ensureParentDir(args.output);
  await ensureParentDir(outputLayout);

  const canvas = renderCanvas(images, placementsByIndex, canvasW, canvasH);

  logger.info(`saving output image: ${args.output}`);
  await savePng(args.output, canvas);

  const entries = buildLayoutEntries(paths, images, placementsByIndex, args.fileNameType);

  logger.info(`writing layout: ${outputLayout}`);
  await writeLayout(outputLayout, entries);
}
