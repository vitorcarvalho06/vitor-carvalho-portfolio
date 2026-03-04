import GalleryShell from "@/components/gallery/GalleryShell";
import type {
  HeroImage,
  PreviewImage,
  ResolvedChapter,
  ResolvedFrame,
} from "@/components/gallery/types";
import { allFrames, chapters } from "@/data/gallery";
import { getAssetData } from "@/lib/assets";

const chapterLookup = new Map(chapters.map((chapter) => [chapter.id, chapter]));

function formatAssetName(name: string): string {
  return name.replaceAll("_", " ");
}

function formatFrameAlt(chapterTitle: string, name: string): string {
  return `${chapterTitle} - ${formatAssetName(name)}`;
}

async function createFrame(
  chapterId: string,
  chapterNumber: string,
  chapterTitle: string,
  name: string,
): Promise<ResolvedFrame> {
  const asset = await getAssetData(name, "outras");

  return {
    key: `${chapterId}:${name}`,
    name,
    src: asset.src,
    blurDataURL: asset.blurDataURL,
    alt: formatFrameAlt(chapterTitle, name),
    chapterId,
    chapterNumber,
    chapterTitle,
  };
}

async function resolveChapters(): Promise<ResolvedChapter[]> {
  return Promise.all(
    chapters.map(async (chapter) => ({
      id: chapter.id,
      number: chapter.number,
      title: chapter.title,
      description: chapter.description,
      featured: await createFrame(
        chapter.id,
        chapter.number,
        chapter.title,
        chapter.featured,
      ),
      images: await Promise.all(
        chapter.images.map((name) =>
          createFrame(chapter.id, chapter.number, chapter.title, name),
        ),
      ),
    })),
  );
}

async function resolveAllFrames(): Promise<ResolvedFrame[]> {
  return Promise.all(
    allFrames.map(async (frame) => {
      const chapter = chapterLookup.get(frame.chapterId);

      if (!chapter) {
        throw new Error(`Chapter nao encontrado para ${frame.chapterId}`);
      }

      return createFrame(chapter.id, chapter.number, chapter.title, frame.name);
    }),
  );
}

async function resolvePreviewStrip(): Promise<PreviewImage[]> {
  const names = [
    "retrato_vermelho_dramatico",
    "capacete_vermelho_hero",
    "retrato_conceitual_fatiado_face_slice",
  ];

  return Promise.all(
    names.map(async (name) => {
      const asset = await getAssetData(name, "principais");

      return {
        name,
        src: asset.src,
        blurDataURL: asset.blurDataURL,
        alt: `Preview - ${formatAssetName(name)}`,
      };
    }),
  );
}

async function resolveHeroImage(): Promise<HeroImage> {
  const heroName = "retrato_azul_cinematografico";
  const asset = await getAssetData(heroName, "principais");

  return {
    src: asset.src,
    blurDataURL: asset.blurDataURL,
    alt: `Hero - ${formatAssetName(heroName)}`,
  };
}

export default async function Home() {
  const [heroImage, previewStrip, resolvedChapters, resolvedAllFrames] =
    await Promise.all([
      resolveHeroImage(),
      resolvePreviewStrip(),
      resolveChapters(),
      resolveAllFrames(),
    ]);

  return (
    <GalleryShell
      heroImage={heroImage}
      previewStrip={previewStrip}
      chapters={resolvedChapters}
      allFrames={resolvedAllFrames}
    />
  );
}
