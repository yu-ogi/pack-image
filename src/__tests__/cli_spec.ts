import * as fs from "fs";
import * as path from "path";
import * as childProcess from "child_process";

describe("cli specs", () => {
    test("should create packed image and json", done => {
        try {
            childProcess.execSync(
                "node ../../lib/cli.js './fixtures/**/*.png' --output ./tmp/packed.png --json ./tmp/packed.json",
                {
                    cwd: __dirname
                }
            );

            expect(fs.existsSync(path.join(__dirname, "tmp", "packed.png"))).toBe(true);

            const json = require(path.join(__dirname, "tmp", "packed.json")) as {[name: string]: {
                width: number;
                height: number;
                x: number;
                y: number;
            }};

            expect(json["fish"]).not.toBeUndefined()
            expect(typeof json["fish"].x).toBe("number");
            expect(typeof json["fish"].y).toBe("number");
            expect(typeof json["fish"].width).toBe("number");
            expect(typeof json["fish"].height).toBe("number");

            expect(json["police_car"]).not.toBeUndefined()
            expect(typeof json["police_car"].x).toBe("number");
            expect(typeof json["police_car"].y).toBe("number");
            expect(typeof json["police_car"].width).toBe("number");
            expect(typeof json["police_car"].height).toBe("number");

            expect(json["spanner"]).not.toBeUndefined()
            expect(typeof json["spanner"].x).toBe("number");
            expect(typeof json["spanner"].y).toBe("number");
            expect(typeof json["spanner"].width).toBe("number");
            expect(typeof json["spanner"].height).toBe("number");

            expect(json["squirrel"]).not.toBeUndefined()
            expect(typeof json["squirrel"].x).toBe("number");
            expect(typeof json["squirrel"].y).toBe("number");
            expect(typeof json["squirrel"].width).toBe("number");
            expect(typeof json["squirrel"].height).toBe("number");

            done();
        } catch (e) {
            done.fail(e);
        }
    });
});
