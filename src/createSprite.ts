import { MaxRectsPacker, IOption } from "maxrects-packer";
import images from "images";
import { promises } from "fs";
import path from "path";
import { ImageData } from "./ImageData";
import { checkInputImages } from "./checkInputImages";
import { FileData } from "./parameters";
import { logger } from "./log";

export interface CreateSpriteParameter {
    inputFiles: FileData[];
    outputImage: FileData;
    outputJson: FileData;
    width: number;
    height: number;
    padding: number;
    allowMultiple: boolean;
}

export async function createSprite({inputFiles, width, height, padding, outputImage, outputJson, allowMultiple}: CreateSpriteParameter): Promise<void> {
    const opts: IOption = {
        smart: true,
        pot: false,
        square: false
    };

    const imageDatas = checkInputImages({inputFiles: inputFiles});
    const packer = new MaxRectsPacker<ImageData>(width, height, padding, opts);

    packer.addArray(imageDatas);
    const bins = packer.save();

    if (!allowMultiple && 1 < bins.length) {
        throw new Error("Packed images will be output two or more. You should specify --allow-multiple to output them");
    }

    for (let i = 0; i < packer.bins.length; i++) {
        const bin = packer.bins[i];
        const spriteImage = images(bins[0].width, bins[0].height);
        const outputImageName = `${outputImage.baseName}${1 < packer.bins.length ? i : ""}.png`;
        const outputJsonName = `${outputJson.baseName}${1 < packer.bins.length ? i : ""}.json`;
        const json: {[name: string]: any} = {};

        logger.info(`try to pack images:`);
        bin.rects.forEach(rect => {
            const imageData = rect as ImageData;
            spriteImage.draw(imageData.data, rect.x, rect.y);
            if (json[imageData.name]) {
                throw new Error(`Cannot specify same image names. ("${imageData.name}")`);
            }
            json[imageData.name] = {
                width: imageData.width,
                height: imageData.height,
                x: imageData.x,
                y: imageData.y
            };
            logger.info(` - ${imageData.name} assigned to x: ${imageData.x}, y: ${imageData.y}`)
        });
        spriteImage.save(path.resolve(outputImage.dirName, outputImageName), "png");
        logger.log(`output packed image: ${outputImageName}`);
        await promises.writeFile(path.resolve(outputJson.dirName, outputJsonName), JSON.stringify(json));
        logger.log(`output packed position data: ${outputJsonName}`);
    }
}
