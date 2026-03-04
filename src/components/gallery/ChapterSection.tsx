"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ResolvedChapter, ResolvedFrame } from "./types";

type ChapterSectionProps = {
  chapter: ResolvedChapter;
  prioritizeFeatured?: boolean;
  onOpenFrame: (frame: ResolvedFrame) => void;
};

export default function ChapterSection({
  chapter,
  prioritizeFeatured = false,
  onOpenFrame,
}: ChapterSectionProps) {
  return (
    <section
      id={chapter.id}
      data-chapter-section
      className="mt-[200px] scroll-mt-28 border-t border-white/10 py-20 md:py-28"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mx-auto mb-20 max-w-[1200px] px-6 md:px-10"
      >
        <p className="text-[11px] uppercase tracking-[0.26em] text-[#9ca3af]">
          CHAPTER {chapter.number}
        </p>
        <h3 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#f5f5f5] md:text-5xl">
          {chapter.title}
        </h3>
        <p className="mt-4 max-w-2xl text-sm tracking-[0.08em] text-[#9ca3af]">
          {chapter.description}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mx-auto mb-10 w-full max-w-[1400px] px-6 md:px-10"
      >
        <button
          type="button"
          onClick={() => onOpenFrame(chapter.featured)}
          data-frame-key={chapter.featured.key}
          className="group w-full text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
          aria-label={`Abrir frame ${chapter.featured.name}`}
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={chapter.featured.src}
              alt={`${chapter.title} - ${chapter.featured.name}`}
              fill
              priority={prioritizeFeatured}
              loading={prioritizeFeatured ? undefined : "lazy"}
              sizes="(max-width: 1024px) 100vw, 92vw"
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.02] group-hover:brightness-110"
            />
          </div>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mx-auto grid max-w-[1400px] grid-cols-12 gap-7 px-6 md:px-10"
      >
        <div
          className={cn(
            "col-span-12 grid gap-7 lg:col-span-9",
            chapter.images.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1",
          )}
        >
          {chapter.images.map((image, index) => (
            <button
              key={image.key}
              type="button"
              onClick={() => onOpenFrame(image)}
              data-frame-key={image.key}
              className="group text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
              aria-label={`Abrir frame ${image.name}`}
            >
              <div
                className={
                  index % 2 === 0
                    ? "relative aspect-[4/5] w-full overflow-hidden"
                    : "relative aspect-[16/10] w-full overflow-hidden"
                }
              >
                <Image
                  src={image.src}
                  alt={`${chapter.title} - ${image.name}`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 42vw"
                  className="object-cover transition duration-700 ease-out group-hover:scale-[1.02] group-hover:brightness-110"
                />
              </div>
            </button>
          ))}
        </div>

        <div
          className="hidden border-l border-white/10 lg:col-span-3 lg:block"
          aria-hidden
        />
      </motion.div>
    </section>
  );
}

