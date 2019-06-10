import program from "commander";
import * as path from "path";
import { createSprite } from "./createSprite";
import { getImageFiles } from "./utils";
import { createLogger } from "./log";
const pkg = require("../package.json");

program
    .version(pkg.version)
    .description("A very simple packing images tool")
    .arguments("<image_files>")
    .option("-H, --height <number>", "limit height of packed image", 2048)
    .option("-W, --width <number>", "limit width of packed image", 2048)
    .option("-o, --output <file_name>", "output file name of packed image", "sprites.png")
    .option("--padding <number>", "padding of each images", 2)
    .option("--json <json_name>", "output file name of packed sprite data", "sprites.json")
    .option("--verbose", "output log for details")
    .parse(process.argv);

if (!program.args.length) {
    program.help();
    process.exit(0);
}

doAction();

async function doAction() {
    try {
        const width = parseInt(program.width, 10);
        const height = parseInt(program.height, 10);
        const output = program.output as string;
        const padding = parseInt(program.padding, 10);
        const json = program.json as string;
        const verbose = !!program.verbose;
        const args = program.args;
        const images = await getImageFiles(args);

        createLogger(verbose);

        await createSprite({
            width,
            height,
            padding,
            outputImage: {
                absolutePath: path.resolve(process.cwd(), output),
                dirName: path.dirname(path.resolve(process.cwd(), output)),
                baseName: path.basename(output, path.extname(output)),
                fileName: output
            },
            outputJson: {
                absolutePath: path.resolve(process.cwd(), json),
                dirName: path.dirname(path.resolve(process.cwd(), json)),
                baseName: path.basename(json, path.extname(json)),
                fileName: json
            },
            inputFiles: images.map(fileName => ({
                absolutePath: path.resolve(process.cwd(), fileName),
                dirName: path.dirname(path.resolve(process.cwd(), fileName)),
                baseName: path.basename(fileName, path.extname(fileName)),
                fileName
            }))
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
