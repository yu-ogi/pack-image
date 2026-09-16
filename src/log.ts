export class Logger {
  constructor(public verbose: boolean) {}

  info(...messages: unknown[]): void {
    if (this.verbose) console.info(...messages);
  }

  log(...messages: unknown[]): void {
    console.log(...messages);
  }

  warn(...messages: unknown[]): void {
    console.warn(...messages);
  }

  error(...messages: unknown[]): void {
    console.error(...messages);
  }
}

export let logger: Logger;

export function createLogger(verbose: boolean) {
  logger = new Logger(verbose);
}
