import { createReadStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { PNG } from 'pngjs';

export function readPng(path: string): Promise<PNG> {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(path).pipe(new PNG());
    stream.on('parsed', () => resolve(stream));
    stream.on('error', (err) => reject(err));
  });
}

/**
 * Returns a new PNG with the image rotated 90 degrees clockwise. The original PNG is not modified.
 */
export function rotatePng90(src: PNG): PNG {
  const dst = new PNG({ width: src.height, height: src.width });
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const dstX = src.height - 1 - y;
      const dstY = x;
      const srcIdx = (src.width * y + x) << 2;
      const dstIdx = (dst.width * dstY + dstX) << 2;
      dst.data[dstIdx] = src.data[srcIdx];
      dst.data[dstIdx + 1] = src.data[srcIdx + 1];
      dst.data[dstIdx + 2] = src.data[srcIdx + 2];
      dst.data[dstIdx + 3] = src.data[srcIdx + 3];
    }
  }
  return dst;
}

export function createCanvas(width: number, height: number): PNG {
  return new PNG({ width, height });
}

export function compositeInto(canvas: PNG, src: PNG, x: number, y: number) {
  src.bitblt(canvas, 0, 0, src.width, src.height, x, y);
}

export function savePng(path: string, png: PNG): Promise<void> {
  return writeFile(path, PNG.sync.write(png));
}
