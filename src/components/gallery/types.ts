export type ResolvedFrame = {
  key: string;
  slug: string;
  name: string;
  src: string;
  blurDataURL: string;
  alt: string;
  title: string;
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  chapterDescription: string;
};

export type ResolvedChapter = {
  id: string;
  number: string;
  title: string;
  description: string;
  featured: ResolvedFrame;
  images: ResolvedFrame[];
};

export type PreviewImage = {
  slug: string;
  name: string;
  src: string;
  blurDataURL: string;
  alt: string;
};

export type HeroImage = {
  slug: string;
  src: string;
  blurDataURL: string;
  alt: string;
};

export type ResolvedFeaturedFrame = {
  key: string;
  slug: string;
  src: string;
  blurDataURL: string;
  alt: string;
  title: string;
};

export type ViewerState = {
  mode: "frame" | "featured";
  index: number;
};
