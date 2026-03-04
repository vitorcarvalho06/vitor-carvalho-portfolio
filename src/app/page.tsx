import GalleryShell from "@/components/gallery/GalleryShell";
import { Suspense } from "react";
import type {
  HeroImage,
  PreviewImage,
  ResolvedChapter,
  ResolvedFeaturedFrame,
  ResolvedFrame,
} from "@/components/gallery/types";
import { chapters } from "@/data/gallery";
import { getAssetData } from "@/lib/assets";
import {
  allFrames,
  chapterItems,
  featuredItems,
  formatTitleFromSlug,
} from "@/lib/gallery";

const chapterItemLookup = new Map(chapterItems.map((item) => [item.slug, item]));

function frameAlt(chapterTitle: string, slug: string): string {
  return `${chapterTitle} - ${formatTitleFromSlug(slug)}`;
}

async function resolveFrame(slug: string): Promise<ResolvedFrame> {
  const item = chapterItemLookup.get(slug);

  if (!item) {
    throw new Error(`Frame nao encontrado para slug ${slug}`);
  }

  const asset = await getAssetData(slug, "outras");
  const title = formatTitleFromSlug(slug);

  return {
    key: `${item.chapterId}:${slug}`,
    slug,
    name: slug,
    src: asset.src,
    blurDataURL: asset.blurDataURL,
    alt: frameAlt(item.chapterTitle, slug),
    title,
    chapterId: item.chapterId,
    chapterNumber: item.chapterNumber,
    chapterTitle: item.chapterTitle,
    chapterDescription: item.chapterDescription,
  };
}

async function resolveChapters(): Promise<ResolvedChapter[]> {
  return Promise.all(
    chapters.map(async (chapter) => {
      return {
        id: chapter.id,
        number: chapter.number,
        title: chapter.title,
        description: chapter.description,
        featured: await resolveFrame(chapter.featured),
        images: await Promise.all(chapter.images.map((slug) => resolveFrame(slug))),
      };
    }),
  );
}

async function resolveAllFrames(): Promise<ResolvedFrame[]> {
  return Promise.all(allFrames.map((item) => resolveFrame(item.slug)));
}

async function resolveFeaturedFrames(): Promise<ResolvedFeaturedFrame[]> {
  return Promise.all(
    featuredItems.map(async (item) => {
      const asset = await getAssetData(item.slug, "principais");
      const title = formatTitleFromSlug(item.slug);

      return {
        key: `featured:${item.slug}`,
        slug: item.slug,
        src: asset.src,
        blurDataURL: asset.blurDataURL,
        alt: `Featured Series - ${title}`,
        title,
      };
    }),
  );
}

async function resolvePreviewStrip(): Promise<PreviewImage[]> {
  const previewSlugs = [
    "retrato_vermelho_dramatico",
    "capacete_vermelho_hero",
    "retrato_conceitual_fatiado_face_slice",
  ];

  return Promise.all(
    previewSlugs.map(async (slug) => {
      const asset = await getAssetData(slug, "principais");

      return {
        slug,
        name: slug,
        src: asset.src,
        blurDataURL: asset.blurDataURL,
        alt: `Preview - ${formatTitleFromSlug(slug)}`,
      };
    }),
  );
}

async function resolveHeroImage(): Promise<HeroImage> {
  const heroSlug = "retrato_azul_cinematografico";
  const asset = await getAssetData(heroSlug, "principais");

  return {
    slug: heroSlug,
    src: asset.src,
    blurDataURL: asset.blurDataURL,
    alt: `Hero - ${formatTitleFromSlug(heroSlug)}`,
  };
}

export default async function Home() {
  const [heroImage, previewStrip, resolvedChapters, resolvedAllFrames, featuredFrames] =
    await Promise.all([
      resolveHeroImage(),
      resolvePreviewStrip(),
      resolveChapters(),
      resolveAllFrames(),
      resolveFeaturedFrames(),
    ]);

  return (
    <Suspense fallback={null}>
      <GalleryShell
        heroImage={heroImage}
        previewStrip={previewStrip}
        chapters={resolvedChapters}
        allFrames={resolvedAllFrames}
        featuredFrames={featuredFrames}
      />
    </Suspense>
  );
}
