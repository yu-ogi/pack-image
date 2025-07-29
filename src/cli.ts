#!/usr/bin/env node

import { Command } from "commander";
import { MaxRectsPacker } from "maxrects-packer";
import { promises } from "fs";
import * as path from "path";
import { getImageFiles } from "./utils";
import { createLogger, logger } from "./log";
import { generatePNG, readPNG } from "./png";
import { ImageData } from "./ImageData";

const pkg = require("../package.json");
const program = new Command();

program
    .name("image-packer")
    .version(pkg.version)
    .description("A very simple packing images tool")
    .argument("<image_files...>", "list of image files to be packed")
    .option("-o, --output <name>", "output filename of packed image", "packed.png")
    .option("-W, --width <number>", "limit width of packed image", parseInt, 2048)
    .option("-H, --height <number>", "limit height of packed image", parseInt, 2048)
    .option("--padding <number>", "padding of each image", parseInt, 0)
    .option("--json <name>", "output filename of packed position data")
    .option(
        "--json-name-type <type>",
        "kind of json key to identify each image's position and size: 'basename', 'filename', 'relative', or 'absolute'",
        "basename"
    )
    .option("--verbose", "output log for details")
    .parse();

const options = program.opts();

if (program.processedArgs.length === 0) {
    program.help({ error: true });
}

main();

type JsonNameTypes = "basename" | "filename" | "relative" | "absolute";

async function main() {
    try {
        const maxWidth = parseInt(options.width, 10);
        const maxHeight = parseInt(options.height, 10);
        const output = options.output as string;
        const padding = parseInt(options.padding, 10);
        const json = options.json as string;
        const jsonNameType = options.jsonNameType as JsonNameTypes;
        const verbose = !!options.verbose;
        const imageFiles = await getImageFiles(program.processedArgs);
        const packer = new MaxRectsPacker<ImageData>(maxWidth, maxHeight, padding, { smart: true, pot: false });

        createLogger(verbose);
        logger.log("Input images:");

        const images: ImageData[] = [];

        for (let i = 0; i < imageFiles.length; i++) {
            const png = await readPNG(imageFiles[i]);
            const fileName = imageFiles[i];
            let name: string;
            if (jsonNameType === "relative") {
                name = path.relative(process.cwd(), fileName);
            } else if (jsonNameType === "absolute") {
                name = path.join(process.cwd(), fileName);
            } else if (jsonNameType === "filename") {
                name = path.basename(fileName);
            } else if (jsonNameType === "basename") {
                name = path.basename(fileName, path.extname(fileName));
            } else {
                throw new Error(`Invalid parameter detected: --json-name-type ${jsonNameType}`);
            }
            const image = new ImageData({
                width: png.width,
                height: png.height,
                data: png,
                name,
                path: fileName
            });
            images.push(image);
            logger.log(`  • ${image.name} → size: ${image.width}x${image.height}`);
        }

        packer.addArray(images);

        if (packer.bins.length <= 0 || 2 <= packer.bins.length) {
            throw new Error(`The specified output size is too small. Increase --width (-W) or --height (-H) to fit the images.`);
        }

        const bin = packer.bins[0];
        const sprites = await generatePNG(output, bin);

        if (json) {
            await promises.writeFile(json, JSON.stringify(sprites));
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
