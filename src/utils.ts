import { glob } from "glob";

export async function getImageFiles(paths: string[]): Promise<string[]> {
    const ret: string[] = [];
    for (let i = 0; i < paths.length; i++) {
        const files = await glob(paths[i]);
        ret.push(...files);
    }
    return ret;
}
