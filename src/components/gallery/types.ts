export type ResolvedFrame = {
  key: string;
  name: string;
  src: string;
  blurDataURL: string;
  alt: string;
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
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
  name: string;
  src: string;
  blurDataURL: string;
  alt: string;
};

export type HeroImage = {
  src: string;
  blurDataURL: string;
  alt: string;
};
