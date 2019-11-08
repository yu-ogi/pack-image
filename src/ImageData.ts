import { PNG } from "pngjs";

export interface ImageDataParameter {
    width: number;
    height: number;
    data: PNG;
    name: string;
    path: string;
}

export class ImageData {
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
