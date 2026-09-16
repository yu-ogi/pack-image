import { writeFile } from 'node:fs/promises';

export interface LayoutEntry {
  file: string;
  width: number;
  height: number;
  x: number;
  y: number;
  angle: number;
}

/**
 * Writes the packing result layout info out as JSON.
 */
export async function writeLayout(path: string, entries: LayoutEntry[]) {
  return writeFile(path, JSON.stringify(entries));
}
