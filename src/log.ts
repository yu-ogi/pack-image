export class Logger {
    constructor(public verbose: boolean) {}

    info(...messages: any[]): void {
        if (this.verbose)
            console.info(...messages);
    }

    log(...messages: any[]): void {
        console.log(...messages);
    }

    warn(...messages: any[]): void {
        console.warn(...messages);
    }

    error(...messages: any[]): void {
        console.error(...messages);
    }
}

export let logger: Logger;

export function createLogger(verbose: boolean) {
    logger = new Logger(verbose);
}
