"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { INSTAGRAM_URL, PORTFOLIO_PDF_PATH } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { HeroImage } from "./types";

type HeroProps = {
  heroImage: HeroImage;
  frameCount: number;
  onOpenViewer: (slug: string, trigger?: HTMLElement | null) => void;
};

export default function Hero({
  heroImage,
  frameCount,
  onOpenViewer,
}: HeroProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateHeader = () => {
      setIsScrolled(window.scrollY > 40);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    updateHeader();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section className="relative flex min-h-[100svh] items-end pb-[96px] md:pb-[120px]">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 will-change-[background-color,backdrop-filter] transition-all duration-300",
          isScrolled ? "bg-black/60 backdrop-blur-[12px]" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-20 w-full max-w-[1320px] items-center justify-between px-6 md:px-10">
          <a
            href="#gallery"
            className="text-[11px] uppercase tracking-[0.34em] text-[#f3efe7] transition hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
            aria-label="Ir para a galeria"
          >
            <span className="hidden md:inline">Vitor Carvalho</span>
            <span className="md:hidden">VC</span>
          </a>
          <nav className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.28em] text-[#a1a1aa] md:flex">
            <a
              href="#gallery"
              className="transition hover:text-[#f5f5f5] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Gallery
            </a>
            <a
              href="#chapters"
              className="transition hover:text-[#f5f5f5] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Chapters
            </a>
            <a
              href="#contact"
              className="transition hover:text-[#f5f5f5] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Contact
            </a>
          </nav>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/15 bg-white/[0.03] px-3.5 py-1.5 text-[10px] uppercase tracking-[0.24em] text-[#f3efe7] transition hover:border-[rgba(142,164,191,0.45)] hover:bg-[rgba(142,164,191,0.08)] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
            aria-label="Abrir Instagram"
          >
            Instagram
          </a>
        </div>
      </header>

      <Image
        src={heroImage.src}
        alt={heroImage.alt}
        fill
        priority
        quality={80}
        placeholder="blur"
        blurDataURL={heroImage.blurDataURL}
        sizes="100vw"
        className="object-cover"
      />
      <button
        type="button"
        onClick={(event) => onOpenViewer(heroImage.slug, event.currentTarget)}
        aria-label={`Abrir imagem ${heroImage.alt}`}
        className="absolute inset-0 z-[1] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_72%,rgba(142,164,191,0.18),transparent_28%)]" />

      <div className="relative z-10 w-full px-6 md:px-10">
        <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-14 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
          <div className="relative max-w-3xl">
            <p className="pointer-events-none absolute -top-10 left-0 hidden select-none text-[clamp(92px,16vw,240px)] font-semibold uppercase leading-none tracking-[-0.06em] text-white/[0.045] md:block">
              ATMOSPHERE
            </p>

            <div className="relative z-10 max-w-2xl space-y-6">
              <p className="text-[11px] uppercase tracking-[0.34em] text-[#8ea4bf]">
                Vitor Carvalho
              </p>

              <h1 className="max-w-[12ch] text-[clamp(42px,5.6vw,88px)] font-semibold leading-[0.9] tracking-[-0.045em] text-[#f3efe7]">
                Portraits with tension, silence and atmosphere.
              </h1>

              <p className="max-w-[56ch] text-sm leading-relaxed tracking-[0.08em] text-[#a1a1aa] md:text-[15px]">
                Editorial portraiture shaped by character, restraint, texture
                and cinematic light.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <a
                  href="#chapters"
                  className="accent-glow border border-[rgba(243,239,231,0.18)] bg-white/[0.04] px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] text-[#f3efe7] transition hover:border-[rgba(142,164,191,0.55)] hover:bg-[rgba(142,164,191,0.10)] hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Enter Gallery
                </a>
                <a
                  href={PORTFOLIO_PDF_PATH}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] uppercase tracking-[0.24em] text-[#a1a1aa] transition hover:text-[#f3efe7] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Download Portfolio
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:justify-self-end md:text-right">
            <div className="h-px w-20 bg-[rgba(243,239,231,0.2)] md:ml-auto" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#8ea4bf]">
              Selected Frames
            </p>
            <p className="text-sm uppercase tracking-[0.22em] text-[#f3efe7]">
              {frameCount} images
            </p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#a1a1aa]">
              São Paulo · Brazil
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
