import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public", "assets");
const VALID_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const OUTPUTS = [
  { ext: "avif", options: { quality: 55 } },
  { ext: "webp", options: { quality: 72 } },
];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return walk(fullPath);
      }

      return fullPath;
    }),
  );

  return files.flat();
}

function getTargetWidth(filePath, metadata) {
  const isFeatured = filePath.includes(`${path.sep}principais${path.sep}`);
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const isPortrait = height > width;

  if (isFeatured) {
    return isPortrait ? 2000 : 2400;
  }

  return isPortrait ? 1400 : 1800;
}

async function optimizeFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (!VALID_EXTENSIONS.has(extension)) {
    return;
  }

  const image = sharp(filePath);
  const metadata = await image.metadata();
  const targetWidth = getTargetWidth(filePath, metadata);
  const baseName = filePath.slice(0, -extension.length);

  for (const output of OUTPUTS) {
    const outputPath = `${baseName}.${output.ext}`;

    await sharp(filePath)
      .rotate()
      .resize({
        width: targetWidth,
        withoutEnlargement: true,
      })
      [output.ext](output.options)
      .toFile(outputPath);

    console.log(`created: ${path.relative(process.cwd(), outputPath)}`);
  }
}

async function main() {
  const files = await walk(ROOT);

  for (const file of files) {
    await optimizeFile(file);
  }

  console.log("done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
