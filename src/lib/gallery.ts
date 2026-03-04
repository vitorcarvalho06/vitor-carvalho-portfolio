export type FeaturedItem = {
  slug: string;
};

export type ChapterItem = {
  slug: string;
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  chapterDescription: string;
};

export const featuredItems: FeaturedItem[] = [
  { slug: "retrato_azul_cinematografico" },
  { slug: "capacete_vermelho_hero" },
  { slug: "corpo_iluminado_em_verde" },
  { slug: "retrato_com_maquiagem_escura_e_olhar_intenso" },
  { slug: "retrato_preto_e_branco_lateral" },
  { slug: "retrato_ruiva_com_luz_dramatica" },
  { slug: "retrato_feminino_com_camiseta_branca" },
  { slug: "retrato_vermelho_dramatico" },
  { slug: "retrato_conceitual_fatiado_face_slice" },
];

export const chapterItems: ChapterItem[] = [
  {
    slug: "mulher_vestido_preto_sofa",
    chapterId: "presence",
    chapterNumber: "01",
    chapterTitle: "Presence",
    chapterDescription:
      "A still body carrying silence, weight, and undeniable authority.",
  },
  {
    slug: "retrato_vermelho_lateral",
    chapterId: "presence",
    chapterNumber: "01",
    chapterTitle: "Presence",
    chapterDescription:
      "A still body carrying silence, weight, and undeniable authority.",
  },
  {
    slug: "retrato_ruiva_maquiagem_azul",
    chapterId: "presence",
    chapterNumber: "01",
    chapterTitle: "Presence",
    chapterDescription:
      "A still body carrying silence, weight, and undeniable authority.",
  },
  {
    slug: "harley_quinn",
    chapterId: "characters",
    chapterNumber: "02",
    chapterTitle: "Characters",
    chapterDescription:
      "Constructed personas where makeup, wardrobe, and gaze define myth.",
  },
  {
    slug: "retrato_cyberpunk_rosa_azul",
    chapterId: "characters",
    chapterNumber: "02",
    chapterTitle: "Characters",
    chapterDescription:
      "Constructed personas where makeup, wardrobe, and gaze define myth.",
  },
  {
    slug: "retrato_gotico_azul_flores",
    chapterId: "characters",
    chapterNumber: "02",
    chapterTitle: "Characters",
    chapterDescription:
      "Constructed personas where makeup, wardrobe, and gaze define myth.",
  },
  {
    slug: "homem_soco_camera",
    chapterId: "identity",
    chapterNumber: "03",
    chapterTitle: "Identity",
    chapterDescription:
      "Faces fracture, confront, and rewrite themselves through performance.",
  },
  {
    slug: "homem_triangulos_neon",
    chapterId: "identity",
    chapterNumber: "03",
    chapterTitle: "Identity",
    chapterDescription:
      "Faces fracture, confront, and rewrite themselves through performance.",
  },
  {
    slug: "mulher_camiseta_branca_low_light",
    chapterId: "identity",
    chapterNumber: "03",
    chapterTitle: "Identity",
    chapterDescription:
      "Faces fracture, confront, and rewrite themselves through performance.",
  },
  {
    slug: "modelo_led_azul",
    chapterId: "atmosphere",
    chapterNumber: "04",
    chapterTitle: "Atmosphere",
    chapterDescription:
      "Light becomes narrative, shaping distance, mood, and emotional tone.",
  },
  {
    slug: "modelo_led_wide",
    chapterId: "atmosphere",
    chapterNumber: "04",
    chapterTitle: "Atmosphere",
    chapterDescription:
      "Light becomes narrative, shaping distance, mood, and emotional tone.",
  },
  {
    slug: "mascara_spikes",
    chapterId: "atmosphere",
    chapterNumber: "04",
    chapterTitle: "Atmosphere",
    chapterDescription:
      "Light becomes narrative, shaping distance, mood, and emotional tone.",
  },
  {
    slug: "vampiro_igreja",
    chapterId: "tension",
    chapterNumber: "05",
    chapterTitle: "Tension",
    chapterDescription:
      "Drama suspended between seduction, danger, and ritual gestures.",
  },
  {
    slug: "modelo_cadeira_vermelha",
    chapterId: "tension",
    chapterNumber: "05",
    chapterTitle: "Tension",
    chapterDescription:
      "Drama suspended between seduction, danger, and ritual gestures.",
  },
  {
    slug: "boca_infinita_vermelho",
    chapterId: "tension",
    chapterNumber: "05",
    chapterTitle: "Tension",
    chapterDescription:
      "Drama suspended between seduction, danger, and ritual gestures.",
  },
  {
    slug: "igreja_interior",
    chapterId: "architecture",
    chapterNumber: "06",
    chapterTitle: "Architecture",
    chapterDescription:
      "Sacred structures frame the subject and extend cinematic scale.",
  },
  {
    slug: "igreja_exterior",
    chapterId: "architecture",
    chapterNumber: "06",
    chapterTitle: "Architecture",
    chapterDescription:
      "Sacred structures frame the subject and extend cinematic scale.",
  },
];

export const allFrames = chapterItems;

export function getFrameIndexBySlug(slug: string): number {
  return allFrames.findIndex((item) => item.slug === slug);
}

export function getFeaturedIndexBySlug(slug: string): number {
  return featuredItems.findIndex((item) => item.slug === slug);
}

export function getPrevNext(length: number, index: number): {
  prevIndex: number;
  nextIndex: number;
} {
  return {
    prevIndex: (index - 1 + length) % length,
    nextIndex: (index + 1) % length,
  };
}

export function formatTitleFromSlug(slug: string): string {
  return slug
    .split("_")
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}
