const MAX_GROWTH_ITERATIONS = 64;

export type PackErrorKind = 'does-not-fit' | 'growth-limit-exceeded';

export class PackError extends Error {
  constructor(public readonly kind: PackErrorKind) {
    super(kind === 'does-not-fit' ? 'images do not fit in the specified width/height' : 'failed to find a bin size that fits all images');
    this.name = 'PackError';
  }
}

export interface Placement {
  x: number;
  y: number;
  rotated: boolean;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function right(r: Rect): number {
  return r.x + r.w;
}

function bottom(r: Rect): number {
  return r.y + r.h;
}

function area(r: Rect): number {
  return r.w * r.h;
}

/**
 * Whether self fully contains other.
 */
function contains(self: Rect, other: Rect): boolean {
  return other.x >= self.x && other.y >= self.y && right(other) <= right(self) && bottom(other) <= bottom(self);
}

function intersects(a: Rect, b: Rect): boolean {
  return a.x < right(b) && right(a) > b.x && a.y < bottom(b) && bottom(a) > b.y;
}

function nextPowerOfTwo(n: number): number {
  if (n <= 1) return 1;
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * MaxRects Best Area Fit packer for a single bin.
 */
class MaxRectsBin {
  private freeRects: Rect[];

  constructor(
    private readonly binW: number,
    private readonly binH: number,
  ) {
    this.freeRects = [{ x: 0, y: 0, w: binW, h: binH }];
  }

  /**
   * Inserts a (w, h) rectangle using Best Area Fit, and returns the placed top-left
   * coordinates along with whether it was rotated.
   * If `allowRotate` is true, the 90-degree-rotated (h, w) variant is also considered
   * as a candidate and the better one is chosen.
   */
  insert(w: number, h: number, allowRotate: boolean): Placement | null {
    const candidates: Array<{ cw: number; ch: number; rotated: boolean }> = [{ cw: w, ch: h, rotated: false }];
    if (allowRotate && w !== h) {
      candidates.push({ cw: h, ch: w, rotated: true });
    }

    let best: { rect: Rect; rotated: boolean } | null = null;
    let bestAreaFit = Infinity;
    let bestShortSide = Infinity;

    for (const free of this.freeRects) {
      for (const { cw, ch, rotated } of candidates) {
        if (cw === 0 || ch === 0 || cw > this.binW || ch > this.binH) continue;
        if (free.w >= cw && free.h >= ch) {
          const leftoverArea = area(free) - cw * ch;
          const shortSide = Math.min(free.w - cw, free.h - ch);
          if (leftoverArea < bestAreaFit || (leftoverArea === bestAreaFit && shortSide < bestShortSide)) {
            bestAreaFit = leftoverArea;
            bestShortSide = shortSide;
            best = {
              rect: { x: free.x, y: free.y, w: cw, h: ch },
              rotated,
            };
          }
        }
      }
    }

    if (best === null) return null;
    this.placeRect(best.rect);
    return { x: best.rect.x, y: best.rect.y, rotated: best.rotated };
  }

  private placeRect(node: Rect) {
    let i = 0;
    while (i < this.freeRects.length) {
      if (intersects(this.freeRects[i], node)) {
        const free = this.freeRects[i];
        this.freeRects.splice(i, 1);
        this.splitFreeNode(free, node);
        continue;
      }
      i += 1;
    }
    this.pruneFreeList();
  }

  private splitFreeNode(free: Rect, used: Rect) {
    if (used.x > free.x) {
      this.freeRects.push({ x: free.x, y: free.y, w: used.x - free.x, h: free.h });
    }
    if (right(used) < right(free)) {
      this.freeRects.push({
        x: right(used),
        y: free.y,
        w: right(free) - right(used),
        h: free.h,
      });
    }
    if (used.y > free.y) {
      this.freeRects.push({ x: free.x, y: free.y, w: free.w, h: used.y - free.y });
    }
    if (bottom(used) < bottom(free)) {
      this.freeRects.push({
        x: free.x,
        y: bottom(used),
        w: free.w,
        h: bottom(free) - bottom(used),
      });
    }
  }

  private pruneFreeList() {
    let i = 0;
    while (i < this.freeRects.length) {
      let removedI = false;
      let j = i + 1;
      while (j < this.freeRects.length) {
        if (contains(this.freeRects[j], this.freeRects[i])) {
          this.freeRects.splice(i, 1);
          removedI = true;
          break;
        }
        if (contains(this.freeRects[i], this.freeRects[j])) {
          this.freeRects.splice(j, 1);
          continue;
        }
        j += 1;
      }
      if (!removedI) i += 1;
    }
  }
}

/**
 * Packs a list of rectangles, sorted by descending area, once against a fixed bin size.
 * Returns `null` if any rectangle does not fit.
 */
function tryPack(sizes: ReadonlyArray<readonly [number, number]>, binW: number, binH: number, allowRotate: boolean): Placement[] | null {
  const bin = new MaxRectsBin(binW, binH);
  const result: Placement[] = [];
  for (const [w, h] of sizes) {
    const placed = bin.insert(w, h, allowRotate);
    if (placed === null) return null;
    result.push(placed);
  }
  return result;
}

export interface PackResult {
  placements: Placement[];
  binWidth: number;
  binHeight: number;
}

/**
 * Packs a list of rectangles sorted by descending area.
 *
 * An axis with `fixedWidth` / `fixedHeight` specified is treated as a fixed bin size,
 * and throws `PackError` ("does-not-fit") if it does not fit.
 * An unspecified axis starts at a power of two at least as large as the largest rectangle
 * dimension, and doubles and retries each time it fails.
 * If `allowRotate` is true, rectangles may be rotated 90 degrees when that allows them to fit.
 *
 * Returns placement info in the same order as `sizes`, along with the actually used bin size.
 */
export function packWithGrowth(
  sizes: ReadonlyArray<readonly [number, number]>,
  fixedWidth: number | undefined,
  fixedHeight: number | undefined,
  allowRotate: boolean,
): PackResult {
  if (sizes.length === 0) {
    return {
      placements: [],
      binWidth: fixedWidth ?? 0,
      binHeight: fixedHeight ?? 0,
    };
  }

  const maxW = Math.max(...sizes.map(([w]) => w));
  const maxH = Math.max(...sizes.map(([, h]) => h));

  let binW = fixedWidth ?? nextPowerOfTwo(maxW);
  let binH = fixedHeight ?? nextPowerOfTwo(maxH);

  for (let i = 0; i < MAX_GROWTH_ITERATIONS; i++) {
    const placements = tryPack(sizes, binW, binH, allowRotate);
    if (placements !== null) {
      return { placements, binWidth: binW, binHeight: binH };
    }

    if (fixedWidth !== undefined && fixedHeight !== undefined) {
      throw new PackError('does-not-fit');
    }
    if (fixedWidth === undefined) binW *= 2;
    if (fixedHeight === undefined) binH *= 2;
  }

  throw new PackError('growth-limit-exceeded');
}
