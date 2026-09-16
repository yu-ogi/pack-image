## pack-image

**pack-image** is a very simple tool for packing images.

## Installation

```sh
pnpm add -g pack-image
```

## Usage

> [!IMPORTANT]
> Only PNG is supported.

```sh
pack-image "./path/to/*.png" --output packed.png
```

### example

| Filename | Image |
|----|----|
| fish.png       | ![fish.png](https://raw.githubusercontent.com/yu-ogi/pack-image/main/images/fish.png) |
| police_car.png | ![police_car.png](https://raw.githubusercontent.com/yu-ogi/pack-image/main/images/police_car.png) |
| spanner.png    | ![spanner.png](https://raw.githubusercontent.com/yu-ogi/pack-image/main/images/spanner.png) |
| squirrel.png   | ![squirrel.png](https://raw.githubusercontent.com/yu-ogi/pack-image/main/images/squirrel.png) |

```sh
pack-image "**/images/**.png" --output packed.png --output-layout packed.json --padding 2
```

packed.png:

![packed.png](https://raw.githubusercontent.com/yu-ogi/pack-image/main/images/packed.png)

packed.json:

```json
[
    { "file": "images/squirrel.png", "width": 64, "height": 64, "x": 0, "y": 0, "angle": 0 },
    { "file": "images/police_car.png", "width": 48, "height": 48, "x": 66, "y": 0, "angle": 0 },
    { "file": "images/fish.png", "width": 32, "height": 32, "x": 66, "y": 50, "angle": 0 },
    { "file": "images/spanner.png", "width": 16, "height": 16, "x": 0, "y": 66, "angle": 0 }
]
```

> [!NOTE]
> When `angle` is `90`, the space occupied in the output image is `(height, width)`.
> `width`/`height` always represent the size of the original image.

### Options

- `--output`, `-o`: Path of the output image (default: `packed.png`)
- `--output-layout`: Path of the output layout (JSON). If omitted, it is placed in the same directory as `--output` with the same filename but a `.json` extension
- `--padding`: Padding between images in px (default: `0`)
- `--width`, `-w` / `--height`, `-h`: Maximum size of the output image in px. If not specified, it grows automatically
- `--allow-rotate`: Allow rotating images by 90 degrees when packing (default: `false`)
- `--file-name-type`: Format of the `file` field in the layout JSON: `basename`, `filename`, `relative`, or `absolute`. If omitted, the path matched by the glob pattern is used as-is
- `--verbose`: Print the list of input images and detailed progress to stderr (default: `false`)
