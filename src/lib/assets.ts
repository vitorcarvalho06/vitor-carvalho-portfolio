import fs from "node:fs";
import path from "node:path";

export type AssetGroup = "principais" | "outras";

const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;
const ASSET_ROOT = path.join(process.cwd(), "public", "assets");

export function getAssetPath(name: string, group: AssetGroup): string {
  for (const extension of EXTENSIONS) {
    const absolutePath = path.join(ASSET_ROOT, group, `${name}${extension}`);

    if (fs.existsSync(absolutePath)) {
      return `/assets/${group}/${name}${extension}`;
    }
  }

  return `/assets/${group}/${name}.jpg`;
}
