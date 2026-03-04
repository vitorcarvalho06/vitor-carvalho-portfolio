export type Chapter = {
  id: string;
  number: string;
  title: string;
  description: string;
  featured: string;
  images: string[];
};

export type FrameOrderItem = {
  chapterId: string;
  name: string;
};

export const chapters: Chapter[] = [
  {
    id: "presence",
    number: "01",
    title: "Presence",
    description: "A still body carrying silence, weight, and undeniable authority.",
    featured: "mulher_vestido_preto_sofa",
    images: ["retrato_vermelho_lateral", "retrato_ruiva_maquiagem_azul"],
  },
  {
    id: "characters",
    number: "02",
    title: "Characters",
    description: "Constructed personas where makeup, wardrobe, and gaze define myth.",
    featured: "harley_quinn",
    images: ["retrato_cyberpunk_rosa_azul", "retrato_gotico_azul_flores"],
  },
  {
    id: "identity",
    number: "03",
    title: "Identity",
    description: "Faces fracture, confront, and rewrite themselves through performance.",
    featured: "homem_soco_camera",
    images: ["homem_triangulos_neon", "mulher_camiseta_branca_low_light"],
  },
  {
    id: "atmosphere",
    number: "04",
    title: "Atmosphere",
    description: "Light becomes narrative, shaping distance, mood, and emotional tone.",
    featured: "modelo_led_azul",
    images: ["modelo_led_wide", "mascara_spikes"],
  },
  {
    id: "tension",
    number: "05",
    title: "Tension",
    description: "Drama suspended between seduction, danger, and ritual gestures.",
    featured: "vampiro_igreja",
    images: ["boca_infinita_vermelho", "modelo_cadeira_vermelha"],
  },
  {
    id: "architecture",
    number: "06",
    title: "Architecture",
    description: "Sacred structures frame the subject and extend cinematic scale.",
    featured: "igreja_interior",
    images: ["igreja_exterior"],
  },
];

export const allFrames: FrameOrderItem[] = chapters.flatMap((chapter) => [
  { chapterId: chapter.id, name: chapter.featured },
  ...chapter.images.map((name) => ({ chapterId: chapter.id, name })),
]);
