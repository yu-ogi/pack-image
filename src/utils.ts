import { statSync } from 'node:fs';
import { glob } from 'glob';

/**
 * Expands all glob patterns and returns only files, deduplicated and sorted lexicographically.
 */
export async function collectInputPaths(patterns: string[]): Promise<string[]> {
  const set = new Set<string>();
  for (const pattern of patterns) {
    const matches = await glob(pattern);
    for (const match of matches) {
      if (isFile(match)) {
        set.add(match);
      }
    }
  }
  return Array.from(set).sort();
}

function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}
