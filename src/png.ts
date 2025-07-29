import { Bin } from "maxrects-packer";
import { createReadStream, writeFile } from "fs";
import { PNG } from "pngjs";
import { ImageData } from "./ImageData";
import { logger } from "./log";
import { SpriteInformationMap } from "./parameters";

export function readPNG(input: string): Promise<PNG> {
    return new Promise((resolve, reject) => {
        const stream = createReadStream(input).pipe(new PNG());
        stream.on("parsed", () => {
            resolve(stream);
        });
        stream.on("error", err => reject(err));
    });
}

export function generatePNG(output: string, bin: Bin<ImageData>): Promise<SpriteInformationMap> {
    return new Promise((resolve, reject) => {
        try {
            const dst = new PNG({
                width: bin.width,
                height: bin.height
            });
            const sprites: SpriteInformationMap = {};

            logger.info("Packing result:");

            for (let i = 0; i < bin.rects.length; i++) {
                const image = bin.rects[i];
                const src = image.data;

                if (sprites[image.name]) {
                    throw new Error(`Duplicate image name detected: "${image.name}". Each image must have a unique name.`);
                }
                src.bitblt(dst, 0, 0, src.width, src.height, image.x, image.y);
                sprites[image.name] = {
                    x: image.x,
                    y: image.y,
                    width: src.width,
                    height: src.height
                };

                logger.info(
                    `  • ${image.path}\n` +
                    `    → x: ${image.x}, y: ${image.y}, width: ${image.width}, height: ${image.height}`
                );
            }

            const buffer = PNG.sync.write(dst);
            writeFile(output, buffer, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(sprites);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}
