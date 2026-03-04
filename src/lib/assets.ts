import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export type AssetGroup = "principais" | "outras";
export type AssetData = {
  src: string;
  blurDataURL: string;
};

const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;
const ASSET_ROOT = path.join(process.cwd(), "public", "assets");
const FALLBACK_BLUR_DATA_URL =
  "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";
const assetDataCache = new Map<string, Promise<AssetData>>();

function resolveAssetFile(name: string, group: AssetGroup): {
  absolutePath: string;
  publicPath: string;
} {
  for (const extension of EXTENSIONS) {
    const absolutePath = path.join(ASSET_ROOT, group, `${name}${extension}`);

    if (fs.existsSync(absolutePath)) {
      return {
        absolutePath,
        publicPath: `/assets/${group}/${name}${extension}`,
      };
    }
  }

  return {
    absolutePath: path.join(ASSET_ROOT, group, `${name}.jpg`),
    publicPath: `/assets/${group}/${name}.jpg`,
  };
}

export function getAssetPath(name: string, group: AssetGroup): string {
  return resolveAssetFile(name, group).publicPath;
}

export async function getAssetData(
  name: string,
  group: AssetGroup,
): Promise<AssetData> {
  const key = `${group}/${name}`;

  if (!assetDataCache.has(key)) {
    const assetDataPromise = (async () => {
      const { absolutePath, publicPath } = resolveAssetFile(name, group);

      try {
        const buffer = await sharp(absolutePath)
          .resize(24)
          .jpeg({ quality: 55, mozjpeg: true })
          .toBuffer();

        return {
          src: publicPath,
          blurDataURL: `data:image/jpeg;base64,${buffer.toString("base64")}`,
        };
      } catch {
        return {
          src: publicPath,
          blurDataURL: FALLBACK_BLUR_DATA_URL,
        };
      }
    })();

    assetDataCache.set(key, assetDataPromise);
  }

  return assetDataCache.get(key)!;
}
