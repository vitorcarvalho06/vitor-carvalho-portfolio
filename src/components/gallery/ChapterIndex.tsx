"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { PreviewImage, ResolvedChapter } from "./types";

type ChapterIndexProps = {
  chapters: ResolvedChapter[];
  previews: PreviewImage[];
  activeChapterId: string;
};

export default function ChapterIndex({
  chapters,
  previews,
  activeChapterId,
}: ChapterIndexProps) {
  return (
    <section id="chapters" className="border-t border-white/10 py-20 md:py-24">
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-6 md:grid-cols-[minmax(0,1fr)_220px] md:px-10">
        <div className="space-y-8">
          <h2 className="text-sm uppercase tracking-[0.3em] text-[#9ca3af]">
            Chapters
          </h2>
          <ol className="space-y-4">
            {chapters.map((chapter) => {
              const active = activeChapterId === chapter.id;

              return (
                <li key={chapter.id}>
                  <a
                    href={`#${chapter.id}`}
                    className={cn(
                      "group inline-flex items-center gap-4 text-base tracking-[0.12em] text-[#9ca3af] transition focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white",
                      active && "text-[#f5f5f5]",
                    )}
                    aria-label={`Ir para chapter ${chapter.number} ${chapter.title}`}
                  >
                    <span className="text-xs tracking-[0.26em] text-[#9ca3af]">
                      {chapter.number}
                    </span>
                    <span>{chapter.title}</span>
                    <span
                      className={cn(
                        "h-px w-12 bg-white/0 transition duration-300 group-hover:bg-white/30",
                        active && "bg-white/60",
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="hidden items-end gap-3 md:flex md:flex-col" aria-hidden>
          {previews.map((preview) => (
            <div
              key={preview.name}
              className="relative h-28 w-44 overflow-hidden border border-white/10"
            >
              <Image
                src={preview.src}
                alt=""
                fill
                sizes="176px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

