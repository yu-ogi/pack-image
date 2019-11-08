import * as fs from "fs";
import * as path from "path";
import * as childProcess from "child_process";
import { SpriteInformationMap, SpriteInformation } from "../parameters";

describe("cli specs", () => {
    beforeAll(() => {
        fs.mkdirSync(path.join(__dirname, "tmp"), {recursive: true});
    });

    afterAll(() => {
        fs.rmdirSync(path.join(__dirname, "tmp"), {recursive: true});
    });

    test("should create packed image and json (basename)", done => {
        try {
            const basename = `${Date.now()}`;

            childProcess.execSync(
                `node ../../lib/cli.js "./fixtures/**/*.png" --output ./tmp/${basename}.png --json ./tmp/${basename}.json`,
                {
                    cwd: __dirname
                }
            );

            expect(fs.existsSync(path.join(__dirname, "tmp", `${basename}.png`))).toBe(true);
            const json = require(path.join(__dirname, "tmp", `${basename}.json`)) as SpriteInformationMap;

            assertValidSpriteData(json["fish"]);
            assertValidSpriteData(json["police_car"]);
            assertValidSpriteData(json["spanner"]);
            assertValidSpriteData(json["squirrel"]);
            done();
        } catch (e) {
            done.fail(e);
        }
    });

    test("should create packed image and json (filename)", done => {
        try {
            const basename = `${Date.now()}`;

            childProcess.execSync(
                `node ../../lib/cli.js "./fixtures/**/*.png" --output "./tmp/${basename}.png" --json "./tmp/${basename}.json" --json-name-type filename`,
                {
                    cwd: __dirname
                }
            );

            expect(fs.existsSync(path.join(__dirname, "tmp", `${basename}.png`))).toBe(true);
            const json = require(path.join(__dirname, "tmp", `${basename}.json`)) as SpriteInformationMap;

            assertValidSpriteData(json["fish.png"]);
            assertValidSpriteData(json["police_car.png"]);
            assertValidSpriteData(json["spanner.png"]);
            assertValidSpriteData(json["squirrel.png"]);
            done();
        } catch (e) {
            done.fail(e);
        }
    });

    function assertValidSpriteData(sprite: SpriteInformation) {
        expect(typeof sprite.x).toBe("number");
        expect(typeof sprite.y).toBe("number");
        expect(typeof sprite.width).toBe("number");
        expect(typeof sprite.height).toBe("number");
    }
});
