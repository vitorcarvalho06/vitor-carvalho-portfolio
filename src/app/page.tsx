import GalleryShell from "@/components/gallery/GalleryShell";
import type { PreviewImage, ResolvedChapter, ResolvedFrame } from "@/components/gallery/types";
import { allFrames, chapters } from "@/data/gallery";
import { getAssetPath } from "@/lib/assets";

const chapterLookup = new Map(chapters.map((chapter) => [chapter.id, chapter]));

function createFrame(
  chapterId: string,
  chapterNumber: string,
  chapterTitle: string,
  name: string,
): ResolvedFrame {
  return {
    key: `${chapterId}:${name}`,
    name,
    src: getAssetPath(name, "outras"),
    chapterId,
    chapterNumber,
    chapterTitle,
  };
}

function resolveChapters(): ResolvedChapter[] {
  return chapters.map((chapter) => ({
    id: chapter.id,
    number: chapter.number,
    title: chapter.title,
    description: chapter.description,
    featured: createFrame(
      chapter.id,
      chapter.number,
      chapter.title,
      chapter.featured,
    ),
    images: chapter.images.map((name) =>
      createFrame(chapter.id, chapter.number, chapter.title, name),
    ),
  }));
}

function resolveAllFrames(): ResolvedFrame[] {
  return allFrames.map((frame) => {
    const chapter = chapterLookup.get(frame.chapterId);

    if (!chapter) {
      throw new Error(`Chapter não encontrado para ${frame.chapterId}`);
    }

    return createFrame(chapter.id, chapter.number, chapter.title, frame.name);
  });
}

function resolvePreviewStrip(): PreviewImage[] {
  const names = [
    "retrato_vermelho_dramatico",
    "capacete_vermelho_hero",
    "retrato_conceitual_fatiado_face_slice",
  ];

  return names.map((name) => ({
    name,
    src: getAssetPath(name, "principais"),
  }));
}

export default function Home() {
  return (
    <GalleryShell
      heroSrc={getAssetPath("retrato_azul_cinematografico", "principais")}
      previewStrip={resolvePreviewStrip()}
      chapters={resolveChapters()}
      allFrames={resolveAllFrames()}
    />
  );
}
