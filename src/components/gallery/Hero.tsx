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
        <div className="mx-auto flex h-20 w-full max-w-[1200px] items-center justify-between px-6 md:px-10">
          <a
            href="#gallery"
            className="text-sm tracking-[0.32em] text-[#f5f5f5] transition hover:text-[#f5f5f5] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
            aria-label="Ir para a galeria"
          >
            VC
          </a>
          <nav className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.24em] text-[#9ca3af] md:flex">
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
            className="border border-white/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[#f5f5f5] transition hover:border-white/45 hover:text-[#f5f5f5] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
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

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="relative z-10 w-full px-6 md:px-10">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#9ca3af]">
              Vitor Carvalho
            </p>
            <h1 className="text-[clamp(48px,6vw,96px)] font-semibold uppercase leading-[0.9] tracking-[-0.03em] text-[#f5f5f5]">
              CINEMATIC
              <br />
              PORTRAIT
              <br />
              PHOTOGRAPHY
            </h1>
            <p className="text-sm tracking-[0.14em] text-[#9ca3af]">
              Editorial portraits - Characters - Atmosphere
            </p>
            <div className="flex items-center gap-6 pt-2">
              <a
                href="#chapters"
                className="border border-white/20 px-5 py-2.5 text-[11px] uppercase tracking-[0.22em] text-[#f5f5f5] transition hover:border-white/50 hover:bg-white/5 hover:text-[#f5f5f5] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Enter Gallery
              </a>
              <a
                href={PORTFOLIO_PDF_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-[0.2em] text-[#9ca3af] transition hover:text-[#f5f5f5] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Download PDF
              </a>
            </div>
          </div>
          <p className="text-right text-xs uppercase tracking-[0.28em] text-[#9ca3af]">
            {frameCount} frames
          </p>
        </div>
      </div>
    </section>
  );
}
