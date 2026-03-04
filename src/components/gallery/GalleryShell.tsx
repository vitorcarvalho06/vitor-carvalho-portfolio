"use client";

import { useEffect, useMemo, useState } from "react";
import ChapterIndex from "./ChapterIndex";
import ChapterSection from "./ChapterSection";
import Hero from "./Hero";
import Lightbox from "./Lightbox";
import type {
  HeroImage,
  PreviewImage,
  ResolvedChapter,
  ResolvedFrame,
} from "./types";

type GalleryShellProps = {
  heroImage: HeroImage;
  previewStrip: PreviewImage[];
  chapters: ResolvedChapter[];
  allFrames: ResolvedFrame[];
};

function parseFrameLabel(value: string | null, total: number): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1 || parsed > total) {
    return null;
  }

  return parsed - 1;
}

function getFrameIndexFromLocation(total: number): number | null {
  const queryFrame = parseFrameLabel(
    new URL(window.location.href).searchParams.get("frame"),
    total,
  );

  if (queryFrame !== null) {
    return queryFrame;
  }

  const hashMatch = window.location.hash.match(/^#frame-(\d{1,2})$/i);

  if (!hashMatch) {
    return null;
  }

  return parseFrameLabel(hashMatch[1], total);
}

export default function GalleryShell({
  heroImage,
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

  useEffect(() => {
    const syncFromLocation = () => {
      const index = getFrameIndexFromLocation(allFrames.length);
      setLightboxIndex(index);
    };

    syncFromLocation();
    window.addEventListener("hashchange", syncFromLocation);
    window.addEventListener("popstate", syncFromLocation);

    return () => {
      window.removeEventListener("hashchange", syncFromLocation);
      window.removeEventListener("popstate", syncFromLocation);
    };
  }, [allFrames.length]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const frameHashPattern = /^#frame-\d{1,2}$/i;

    if (lightboxIndex === null) {
      url.searchParams.delete("frame");

      if (frameHashPattern.test(url.hash)) {
        url.hash = "";
      }
    } else {
      const label = String(lightboxIndex + 1).padStart(2, "0");
      url.searchParams.set("frame", label);
      url.hash = `frame-${label}`;
    }

    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [lightboxIndex]);

  const currentFrame = lightboxIndex !== null ? allFrames[lightboxIndex] : null;
  const previousFrameSrc =
    lightboxIndex !== null
      ? allFrames[(lightboxIndex - 1 + allFrames.length) % allFrames.length]?.src
      : null;
  const nextFrameSrc =
    lightboxIndex !== null
      ? allFrames[(lightboxIndex + 1) % allFrames.length]?.src
      : null;

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
      <Hero heroImage={heroImage} frameCount={allFrames.length} />

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
          <div className="mx-auto w-full max-w-[1200px] px-6 md:px-10">
            <div className="border border-white/10 bg-white/[0.02] px-6 py-8 md:px-10 md:py-10">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#9ca3af]">
                Contact
              </p>
              <h2 className="mt-4 text-[clamp(34px,4.2vw,64px)] font-semibold leading-[0.94] tracking-[-0.02em] text-[#f5f5f5]">
                Bookings
                <br />
                &amp; Collaborations
              </h2>
              <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[#9ca3af]">
                Sao Paulo - Available for commissioned work
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#"
                  className="border border-white/30 bg-[#f5f5f5] px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] text-[#0a0a0a] transition hover:border-white hover:bg-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Request booking
                </a>
                <a
                  href="#"
                  className="border border-white/20 px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] text-[#9ca3af] transition hover:border-white/45 hover:text-[#f5f5f5] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Lightbox
        isOpen={lightboxIndex !== null}
        frame={currentFrame}
        currentIndex={lightboxIndex ?? 0}
        total={allFrames.length}
        previousSrc={previousFrameSrc}
        nextSrc={nextFrameSrc}
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

