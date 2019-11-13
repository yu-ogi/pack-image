#!/usr/bin/env node

import program from "commander";
import { MaxRectsPacker } from "maxrects-packer";
import { promises } from "fs";
import * as path from "path";
import { getImageFiles } from "./utils";
import { createLogger, logger } from "./log";
import { generatePNG, readPNG } from "./png";
import { ImageData } from "./ImageData";
const pkg = require("../package.json");

program
    .version(pkg.version)
    .description("A very simple packing images tool")
    .arguments("<image_files>")
    .option("-o, --output <name>", "output filename of packed image", "packed.png")
    .option("-W, --width <number>", "limit width of packed image", 2048)
    .option("-H, --height <number>", "limit height of packed image", 2048)
    .option("--padding <number>", "padding of each images", 0)
    .option("--json <name>", "output filename of packed position data")
    .option(
        "--json-name-type <type>",
        "kind of json key to identify each images' position and size. 'basename', 'filename', 'relative' or 'absolute'",
        "basename"
    )
    .option("--verbose", "output log for details")
    .parse(process.argv);

if (!program.args.length) {
    program.help();
    process.exit(0);
}

doAction();

type JsonNameTypes = "basename" | "filename" | "relative" | "absolute";

async function doAction() {
    try {
        const maxWidth = parseInt(program.width, 10);
        const maxHeight = parseInt(program.height, 10);
        const output = program.output as string;
        const padding = parseInt(program.padding, 10);
        const json = program.json as string;
        const jsonNameType = program.jsonNameType as JsonNameTypes;
        const verbose = !!program.verbose;
        const args = program.args;
        const imageFiles = await getImageFiles(args);
        const packer = new MaxRectsPacker<ImageData>(maxWidth, maxHeight, padding, { smart: true, pot: false });

        createLogger(verbose);
        logger.log("input images:");

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
            logger.log(` - ${fileName} (${png.width}, ${png.height})`);
        }

        packer.addArray(images);

        if (packer.bins.length <= 0 || 2 <= packer.bins.length) {
            throw new Error(
                `Please specify the limit size of output image larger than the given size (--width, -W or --height, -H).`
            );
        }

        const bin = packer.bins[0];
        const sprites = await generatePNG(output, bin);

        if (json) {
            await promises.writeFile(json, JSON.stringify(sprites));
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
