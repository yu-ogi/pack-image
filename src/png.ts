import { PackResult } from "bin-pack";
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

export function generatePNG(output: string, data: PackResult<ImageData>, padding: number = 0): Promise<SpriteInformationMap> {
    return new Promise((resolve, reject) => {
        try {
            const dst = new PNG({
                width: data.width - padding,
                height: data.height - padding
            });
            const sprites: SpriteInformationMap = {};
            logger.info(`try to pack images:`);

            for (let i = 0; i < data.items.length; i++) {
                const item = data.items[i];
                const image = item.item;
                const src = item.item.data;

                if (sprites[image.name]) {
                    throw new Error(`Cannot specify same image names. (${image.name})`);
                }
                src.bitblt(dst, 0, 0, src.width, src.height, item.x, item.y);
                sprites[image.name] = {
                    x: item.x,
                    y: item.y,
                    width: src.width,
                    height: src.height
                };

                logger.info(` - ${image.path} assigned to x: ${item.x}, y: ${item.y}`);
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
