## pack-image

**pack-image** is a very simple packing images tool.

## Installation

```sh
npm install pack-image -g
```

## Usage

```sh
pack-image "**/image*.png" --output packed.png --json packed.json --verbose
```

### example

| Filename | Image |
----|----|
| fish.png       | ![fish.png](https://raw.githubusercontent.com/yu-ogi/pack-image/master/images/fish.png) |
| police_car.png | ![police_car.png](https://raw.githubusercontent.com/yu-ogi/pack-image/master/images/police_car.png) |
| spanner.png    | ![spanner.png](https://raw.githubusercontent.com/yu-ogi/pack-image/master/images/spanner.png) |
| squirrel.png   | ![squirrel.png](https://raw.githubusercontent.com/yu-ogi/pack-image/master/images/squirrel.png) |

```sh
pack-image "**/images/**.png" --output packed.png --json packed.json
```

packed.png:

![packed.png](https://raw.githubusercontent.com/yu-ogi/pack-image/master/images/packed.png)

packed.json:

```json
{
    "squirrel": {
        "width": 64,
        "height": 64,
        "x": 0,
        "y": 0
    },
    "police_car": {
        "width": 48,
        "height": 48,
        "x": 66,
        "y": 0
    },
    "fish": {
        "width": 32,
        "height": 32,
        "x": 66,
        "y": 50
    },
    "spanner": {
        "width": 16,
        "height": 16,
        "x": 0,
        "y": 66
    }
}
```
