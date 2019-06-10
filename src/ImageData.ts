import { ImagesStatic } from "images";
import { Rectangle } from "maxrects-packer";

export interface ImageDataParameter {
    width: number;
    height: number;
    data: ImagesStatic;
    name: string;
}

export class ImageData extends Rectangle {
    name: string;

    constructor({width, height, data, name}: ImageDataParameter) {
        super(width, height);
        this.data = data;
        this.name = name;
    }
}
