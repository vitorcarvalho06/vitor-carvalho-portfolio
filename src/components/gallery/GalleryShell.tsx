"use client";

import { useEffect, useMemo, useState } from "react";
import ChapterIndex from "./ChapterIndex";
import ChapterSection from "./ChapterSection";
import Hero from "./Hero";
import Lightbox from "./Lightbox";
import type { PreviewImage, ResolvedChapter, ResolvedFrame } from "./types";

type GalleryShellProps = {
  heroSrc: string;
  previewStrip: PreviewImage[];
  chapters: ResolvedChapter[];
  allFrames: ResolvedFrame[];
};

export default function GalleryShell({
  heroSrc,
  previewStrip,
  chapters,
  allFrames,
}: GalleryShellProps) {
  const [activeChapterId, setActiveChapterId] = useState(chapters[0]?.id ?? "");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [scrollFrameIndex, setScrollFrameIndex] = useState(0);

  const frameIndexMap = useMemo(
    () => new Map(allFrames.map((frame, index) => [frame.key, index])),
    [allFrames],
  );

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chapter-section]"),
    );

    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleEntries.length) {
          return;
        }

        const visibleId = visibleEntries[0].target.id;
        setActiveChapterId(visibleId);
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.15, 0.3, 0.45, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const frameNodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-frame-key]"),
    );

    if (!frameNodes.length) {
      return;
    }

    const visibleEntries = new Map<Element, IntersectionObserverEntry>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleEntries.set(entry.target, entry);
            return;
          }

          visibleEntries.delete(entry.target);
        });

        if (!visibleEntries.size) {
          return;
        }

        const viewportCenter = window.innerHeight / 2;
        const bestEntry = [...visibleEntries.values()].sort((a, b) => {
          const aCenter =
            a.boundingClientRect.top + a.boundingClientRect.height / 2;
          const bCenter =
            b.boundingClientRect.top + b.boundingClientRect.height / 2;

          return Math.abs(aCenter - viewportCenter) - Math.abs(bCenter - viewportCenter);
        })[0];

        const key = (bestEntry.target as HTMLElement).dataset.frameKey;

        if (!key) {
          return;
        }

        const index = frameIndexMap.get(key);

        if (index === undefined) {
          return;
        }

        setScrollFrameIndex(index);
      },
      {
        rootMargin: "-15% 0px -20% 0px",
        threshold: [0.2, 0.35, 0.5, 0.7, 0.9],
      },
    );

    frameNodes.forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
    };
  }, [frameIndexMap]);

  const currentFrame = lightboxIndex !== null ? allFrames[lightboxIndex] : null;

  const openLightbox = (frame: ResolvedFrame) => {
    const index = frameIndexMap.get(frame.key);

    if (index === undefined) {
      return;
    }

    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextFrame = () => {
    setLightboxIndex((previous) => {
      if (previous === null) {
        return 0;
      }

      return (previous + 1) % allFrames.length;
    });
  };

  const previousFrame = () => {
    setLightboxIndex((previous) => {
      if (previous === null) {
        return 0;
      }

      return (previous - 1 + allFrames.length) % allFrames.length;
    });
  };

  return (
    <div className="bg-[#0a0a0a] text-[#f5f5f5]">
      <Hero heroSrc={heroSrc} frameCount={allFrames.length} />

      <main id="gallery">
        <ChapterIndex
          chapters={chapters}
          previews={previewStrip}
          activeChapterId={activeChapterId}
        />

        {chapters.map((chapter, index) => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            prioritizeFeatured={index === 0}
            onOpenFrame={openLightbox}
          />
        ))}

        <section
          id="contact"
          className="scroll-mt-28 border-t border-white/10 py-20 md:py-28"
        >
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 md:px-10">
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-[#f5f5f5] md:text-5xl">
              Contact
            </h2>
            <p className="text-sm uppercase tracking-[0.16em] text-[#9ca3af]">
              Bookings &amp; collaborations
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#"
                className="border border-white/20 px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] text-[#f5f5f5] transition hover:border-white/50 hover:text-[#f5f5f5] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Email
              </a>
              <a
                href="#"
                className="border border-white/20 px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] text-[#f5f5f5] transition hover:border-white/50 hover:text-[#f5f5f5] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Instagram
              </a>
            </div>
          </div>
        </section>
      </main>

      <Lightbox
        isOpen={lightboxIndex !== null}
        frame={currentFrame}
        currentIndex={lightboxIndex ?? 0}
        total={allFrames.length}
        onClose={closeLightbox}
        onNext={nextFrame}
        onPrev={previousFrame}
      />

      <div
        className="pointer-events-none fixed bottom-10 right-10 z-30 text-[12px] uppercase tracking-[0.25em] text-[#9ca3af] opacity-50"
        aria-live="polite"
      >
        {`FRAME ${String(scrollFrameIndex + 1).padStart(2, "0")} / ${String(
          allFrames.length,
        ).padStart(2, "0")}`}
      </div>
    </div>
  );
}

