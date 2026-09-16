import { basename, extname, relative, resolve } from 'node:path';
import type { PNG } from 'pngjs';

import type { LayoutEntry } from './layout.js';
import { logger } from './log.js';
import { type Placement, packWithGrowth } from './maxrects.js';
import { compositeInto, createCanvas, readPng, rotatePng90 } from './png.js';
import { collectInputPaths } from './utils.js';

export interface PackOptions {
  padding: number;
  width: number | undefined;
  height: number | undefined;
  allowRotate: boolean;
}

export type FileNameType = 'basename' | 'filename' | 'relative' | 'absolute';

export const FILE_NAME_TYPES: readonly FileNameType[] = ['basename', 'filename', 'relative', 'absolute'];

/**
 * Converts the string written to the layout JSON's "file" field into the specified format.
 */
function formatFileName(path: string, type: FileNameType) {
  switch (type) {
    case 'basename':
      return basename(path, extname(path));
    case 'filename':
      return basename(path);
    case 'relative':
      return relative(process.cwd(), path);
    case 'absolute':
      return resolve(path);
  }
}

export async function loadInputImages(patterns: string[]): Promise<{ paths: string[]; images: PNG[] }> {
  const paths = await collectInputPaths(patterns);
  if (paths.length === 0) {
    throw new Error('no images matched the given patterns');
  }

  logger.info(`input images (${paths.length}):`);
  for (const path of paths) {
    logger.info(`  ${path}`);
  }

  const images = await Promise.all(paths.map((path) => readPng(path)));
  return { paths, images };
}

/**
 * Packs each image's rectangle (with padding added) in descending order of area (a stable
 * sort that preserves input order for equal areas), then returns the placements reordered
 * back to the original input order.
 */
export function packImages(images: PNG[], options: PackOptions): Placement[] {
  logger.info(`packing ${images.length} images (MaxRects, allowRotate=${options.allowRotate})`);

  const paddedSizes: Array<[number, number]> = images.map((img) => [img.width + options.padding, img.height + options.padding]);
  const order = images.map((_, i) => i);
  order.sort((a, b) => {
    const areaA = paddedSizes[a][0] * paddedSizes[a][1];
    const areaB = paddedSizes[b][0] * paddedSizes[b][1];
    return areaB - areaA;
  });

  const sortedSizes = order.map((i) => paddedSizes[i]);
  const { placements } = packWithGrowth(sortedSizes, options.width, options.height, options.allowRotate);

  const placementsByIndex: Placement[] = new Array(images.length);
  for (let sortedPos = 0; sortedPos < order.length; sortedPos++) {
    placementsByIndex[order[sortedPos]] = placements[sortedPos];
  }
  return placementsByIndex;
}

/**
 * Computes the final canvas size in actual (padding-excluded) dimensions — the maximum of
 * x+width / y+height — from each placement's actual occupied size after placement
 * (width/height swapped if rotated).
 */
export function measureCanvas(images: PNG[], placementsByIndex: Placement[]) {
  let width = 0;
  let height = 0;
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const { x, y, rotated } = placementsByIndex[i];
    const [dw, dh] = rotated ? [img.height, img.width] : [img.width, img.height];
    width = Math.max(width, x + dw);
    height = Math.max(height, y + dh);
  }
  return { width, height };
}

export function renderCanvas(images: PNG[], placementsByIndex: Placement[], width: number, height: number): PNG {
  const canvas = createCanvas(width, height);
  for (let i = 0; i < images.length; i++) {
    const { x, y, rotated } = placementsByIndex[i];
    const drawn = rotated ? rotatePng90(images[i]) : images[i];
    compositeInto(canvas, drawn, x, y);
  }
  return canvas;
}

export function buildLayoutEntries(
  paths: string[],
  images: PNG[],
  placementsByIndex: Placement[],
  fileNameType: FileNameType | undefined,
): LayoutEntry[] {
  return images.map((img, i) => {
    const { x, y, rotated } = placementsByIndex[i];
    return {
      file: fileNameType === undefined ? paths[i] : formatFileName(paths[i], fileNameType),
      width: img.width,
      height: img.height,
      x,
      y,
      angle: rotated ? 90 : 0,
    };
  });
}
