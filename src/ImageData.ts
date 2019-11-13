import { PNG } from "pngjs";
import { IRectangle } from "maxrects-packer";

export interface ImageDataParameter {
    width: number;
    height: number;
    data: PNG;
    name: string;
    path: string;
}

export class ImageData implements IRectangle {
    x: number = 0; // will replace
    y: number = 0; // will replace
    width: number;
    height: number;
    data: PNG;
    name: string;
    path: string;

    constructor({width, height, data, name, path}: ImageDataParameter) {
        this.width = width;
        this.height = height;
        this.data = data;
        this.name = name;
        this.path = path;
    }
}
