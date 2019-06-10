import images from "images";
import { ImageData } from "./ImageData";
import { FileData } from "./parameters";
import { logger } from "./log";

export interface CheckInputImagesParameter {
    inputFiles: FileData[];
}

export function checkInputImages({inputFiles}: CheckInputImagesParameter): ImageData[] {
    logger.log("input images:");
    return inputFiles.map(p => {
        const img = images(p.absolutePath);
        const width = img.width();
        const height = img.height();
        logger.log(` - ${p.fileName} (${width}, ${height})`);
        return new ImageData({
            width,
            height,
            data: img,
            name: p.baseName
        });
    });
}
