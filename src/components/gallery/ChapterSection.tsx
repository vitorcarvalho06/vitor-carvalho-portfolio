"use client";

import FadeIn from "@/components/ui/FadeIn";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ResolvedChapter } from "./types";

type ChapterSectionProps = {
  chapter: ResolvedChapter;
  prioritizeFeatured?: boolean;
  onOpenViewer: (slug: string, trigger?: HTMLElement | null) => void;
};

export default function ChapterSection({
  chapter,
  prioritizeFeatured = false,
  onOpenViewer,
}: ChapterSectionProps) {
  return (
    <section
      id={chapter.id}
      data-chapter-section
      className="relative mt-[180px] scroll-mt-32 border-t border-[rgba(243,239,231,0.10)] py-20 first:mt-[140px] md:mt-[220px] md:py-28 [content-visibility:auto] [contain-intrinsic-size:1px_1400px]"
    >
      <FadeIn>
        <div
          className={cn(
            "relative mx-auto mb-16 max-w-[1280px] px-6 md:mb-20 md:px-10",
            Number(chapter.number) % 2 === 0 ? "md:text-right" : "md:text-left",
          )}
        >
          <p className="pointer-events-none absolute -top-10 left-6 select-none text-[clamp(96px,18vw,220px)] font-semibold leading-none tracking-[-0.08em] text-white/[0.04] md:left-10">
            {chapter.number}
          </p>

          <div
            className={cn(
              "relative z-10 max-w-3xl",
              Number(chapter.number) % 2 === 0 && "md:ml-auto",
            )}
          >
            <p className="text-[10px] uppercase tracking-[0.38em] text-[#8ea4bf]">
              CHAPTER {chapter.number}
            </p>

            <h3 className="mt-4 max-w-[10ch] text-[clamp(42px,7vw,112px)] font-semibold leading-[0.86] tracking-[-0.045em] text-[#f3efe7]">
              {chapter.title}
            </h3>

            <p className="mt-6 max-w-[46ch] text-sm leading-relaxed tracking-[0.08em] text-[#a1a1aa]">
              {chapter.description}
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="mx-auto mb-10 w-full max-w-[1480px] px-6 md:mb-12 md:px-10">
          <button
            type="button"
            onClick={(event) =>
              onOpenViewer(chapter.featured.slug, event.currentTarget)
            }
            data-frame-key={chapter.featured.slug}
            className="group w-full text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
            aria-label={`Abrir frame ${chapter.featured.name}`}
          >
            <div className="noise-overlay relative aspect-[16/9] w-full overflow-hidden border border-[rgba(243,239,231,0.12)] bg-white/[0.02]">
              <Image
                src={chapter.featured.src}
                alt={chapter.featured.alt}
                fill
                priority={prioritizeFeatured}
                loading={prioritizeFeatured ? undefined : "lazy"}
                quality={80}
                placeholder="blur"
                blurDataURL={chapter.featured.blurDataURL}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 92vw, 1400px"
                className={cn(
                  "object-cover transition duration-700 ease-out group-hover:scale-[1.018] group-hover:brightness-110",
                  chapter.featured.slug === "mulher_vestido_preto_sofa" &&
                    "object-[50%_18%]",
                  chapter.featured.slug === "homem_soco_camera" &&
                    "object-[50%_30%]",
                  chapter.featured.slug === "modelo_led_azul" &&
                    "object-[50%_20%]",
                )}
              />
            </div>
          </button>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(243,239,231,0.08)] pt-4 text-[10px] uppercase tracking-[0.22em] text-[#a1a1aa]">
            <span className="text-[#8ea4bf]">Featured Frame</span>
            <span>{chapter.title}</span>
            <span>Click to expand</span>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mx-auto grid max-w-[1480px] grid-cols-12 gap-7 px-6 md:px-10">
          <div
            className={cn(
              "col-span-12 grid gap-7 lg:col-span-10",
              chapter.images.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1",
            )}
          >
            {chapter.images.map((image, index) => (
              <button
                key={image.key}
                type="button"
                onClick={(event) =>
                  onOpenViewer(image.slug, event.currentTarget)
                }
                data-frame-key={image.slug}
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
                    alt={image.alt}
                    fill
                    loading="lazy"
                    quality={80}
                    placeholder="blur"
                    blurDataURL={image.blurDataURL}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 42vw"
                    className={cn(
                      "object-cover transition duration-700 ease-out group-hover:scale-[1.02] group-hover:brightness-110",
                      image.slug === "retrato_ruiva_maquiagem_azul" &&
                        "object-[50%_58%]",
                      image.slug === "retrato_gotico_azul_flores" &&
                        "object-[50%_5%]",
                      image.slug === "mulher_camiseta_branca_low_light" &&
                        "object-[50%_10%]",
                    )}
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="hidden lg:col-span-2 lg:block" aria-hidden>
            <div className="editorial-line h-full pl-8">
              <div className="sticky top-24 space-y-4 pt-2">
                <p className="text-[10px] uppercase tracking-[0.32em] text-[#8ea4bf]">
                  Sequence
                </p>
                <p className="max-w-[12ch] text-[11px] uppercase tracking-[0.22em] text-[#a1a1aa]">
                  {chapter.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
