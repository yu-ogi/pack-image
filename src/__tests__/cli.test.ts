import * as fs from "fs";
import * as path from "path";
import * as childProcess from "child_process";
import { SpriteInformationMap, SpriteInformation } from "../parameters";

describe("cli specs", () => {
  const tmpDir = path.join(__dirname, "tmp");

  beforeAll(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("should create packed image and json (basename)", async () => {
    const basename = `${Date.now()}`;

    childProcess.execSync(
      `node ../../lib/cli.js "./fixtures/**/*.png" --output ./tmp/${basename}.png --json ./tmp/${basename}.json`,
      { cwd: __dirname }
    );

    const imagePath = path.join(tmpDir, `${basename}.png`);
    const jsonPath = path.join(tmpDir, `${basename}.json`);

    expect(fs.existsSync(imagePath)).toBe(true);

    const json: SpriteInformationMap = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    assertValidSpriteData(json["fish"]);
    assertValidSpriteData(json["police_car"]);
    assertValidSpriteData(json["spanner"]);
    assertValidSpriteData(json["squirrel"]);
  });

  test("should create packed image and json (filename)", async () => {
    const basename = `${Date.now()}`;

    childProcess.execSync(
      `node ../../lib/cli.js "./fixtures/**/*.png" --output ./tmp/${basename}.png --json ./tmp/${basename}.json --json-name-type filename`,
      { cwd: __dirname }
    );

    const imagePath = path.join(tmpDir, `${basename}.png`);
    const jsonPath = path.join(tmpDir, `${basename}.json`);

    expect(fs.existsSync(imagePath)).toBe(true);

    const json: SpriteInformationMap = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    assertValidSpriteData(json["fish.png"]);
    assertValidSpriteData(json["police_car.png"]);
    assertValidSpriteData(json["spanner.png"]);
    assertValidSpriteData(json["squirrel.png"]);
  });

  function assertValidSpriteData(sprite: SpriteInformation) {
    expect(typeof sprite.x).toBe("number");
    expect(typeof sprite.y).toBe("number");
    expect(typeof sprite.width).toBe("number");
    expect(typeof sprite.height).toBe("number");
  }
});
