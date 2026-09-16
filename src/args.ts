import { parseArgs } from 'node:util';

import { FILE_NAME_TYPES, type FileNameType } from './pack.js';

/**
 * CLI argument definition for packing multiple input images into a single rectangle-packed
 * image and outputting the placement info as JSON.
 */
export interface Cli {
  /** Glob patterns for input images (multiple allowed) */
  patterns: string[];
  /** Path to the output image */
  output: string;
  /** Path to the output layout (JSON). Defaults to the same location as --output with a .json extension if unspecified */
  outputLayout: string | undefined;
  /** Padding between images (px) */
  padding: number;
  /** Maximum width of the output image (px). Grows automatically if unspecified */
  width: number | undefined;
  /** Maximum height of the output image (px). Grows automatically if unspecified */
  height: number | undefined;
  /** Allow rotating images by 90 degrees when packing */
  allowRotate: boolean;
  /** Format of the file field in the layout JSON. Defaults to the glob-matched path as-is if unspecified */
  fileNameType: FileNameType | undefined;
  /** Print detailed input image listing and processing info to stderr */
  verbose: boolean;
}

function parsePositiveInt(name: string, value: string) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 0 || String(n) !== value.trim()) {
    throw new Error(`invalid value for --${name}: ${value}`);
  }
  return n;
}

function parseFileNameType(value: string): FileNameType {
  if (!FILE_NAME_TYPES.includes(value as FileNameType)) {
    throw new Error(`invalid value for --file-name-type: ${value} (expected one of ${FILE_NAME_TYPES.join(', ')})`);
  }
  return value as FileNameType;
}

export function parseCli(argv: string[]): Cli {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      output: { type: 'string', short: 'o', default: 'packed.png' },
      'output-layout': { type: 'string' },
      padding: { type: 'string', default: '0' },
      width: { type: 'string', short: 'w' },
      height: { type: 'string', short: 'h' },
      'allow-rotate': { type: 'boolean', default: false },
      'file-name-type': { type: 'string' },
      verbose: { type: 'boolean', default: false },
    },
  });

  if (positionals.length === 0) {
    throw new Error('no input patterns given');
  }

  return {
    patterns: positionals,
    output: values.output as string,
    outputLayout: values['output-layout'] as string | undefined,
    padding: parsePositiveInt('padding', values.padding as string),
    width: values.width === undefined ? undefined : parsePositiveInt('width', values.width as string),
    height: values.height === undefined ? undefined : parsePositiveInt('height', values.height as string),
    allowRotate: values['allow-rotate'] as boolean,
    fileNameType: values['file-name-type'] === undefined ? undefined : parseFileNameType(values['file-name-type'] as string),
    verbose: values.verbose as boolean,
  };
}
