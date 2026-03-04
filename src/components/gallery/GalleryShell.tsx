"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LightboxViewer from "@/components/LightboxViewer";
import { getFeaturedIndexBySlug, getFrameIndexBySlug } from "@/lib/gallery";
import { BOOKING_MAILTO, INSTAGRAM_URL } from "@/lib/site";
import ChapterIndex from "./ChapterIndex";
import ChapterSection from "./ChapterSection";
import Hero from "./Hero";
import type {
  HeroImage,
  PreviewImage,
  ResolvedChapter,
  ResolvedFeaturedFrame,
  ResolvedFrame,
  ViewerState,
} from "./types";

type GalleryShellProps = {
  heroImage: HeroImage;
  previewStrip: PreviewImage[];
  chapters: ResolvedChapter[];
  allFrames: ResolvedFrame[];
  featuredFrames: ResolvedFeaturedFrame[];
};

export default function GalleryShell({
  heroImage,
  previewStrip,
  chapters,
  allFrames,
  featuredFrames,
}: GalleryShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeChapterId, setActiveChapterId] = useState(chapters[0]?.id ?? "");
  const [scrollFrameIndex, setScrollFrameIndex] = useState(0);

  const openerRef = useRef<HTMLElement | null>(null);
  const hadViewerOpen = useRef(false);

  const frameIndexMap = useMemo(
    () => new Map(allFrames.map((frame, index) => [frame.slug, index])),
    [allFrames],
  );

  const featuredIndexMap = useMemo(
    () => new Map(featuredFrames.map((frame, index) => [frame.slug, index])),
    [featuredFrames],
  );

  const viewerState = useMemo<ViewerState | null>(() => {
    const frameSlug = searchParams.get("frame");

    if (frameSlug) {
      const index = frameIndexMap.get(frameSlug) ?? getFrameIndexBySlug(frameSlug);

      if (index >= 0 && index < allFrames.length) {
        return { mode: "frame", index };
      }
    }

    const featuredSlug = searchParams.get("featured");

    if (featuredSlug) {
      const index =
        featuredIndexMap.get(featuredSlug) ?? getFeaturedIndexBySlug(featuredSlug);

      if (index >= 0 && index < featuredFrames.length) {
        return { mode: "featured", index };
      }
    }

    return null;
  }, [searchParams, frameIndexMap, featuredIndexMap, allFrames.length, featuredFrames.length]);

  const setViewerQuery = useCallback(
    (nextViewerState: ViewerState | null) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("frame");
      params.delete("featured");

      if (nextViewerState) {
        if (nextViewerState.mode === "frame") {
          params.set("frame", allFrames[nextViewerState.index].slug);
        } else {
          params.set("featured", featuredFrames[nextViewerState.index].slug);
        }
      }

      const nextQuery = params.toString();
      const currentQuery = searchParams.toString();

      if (nextQuery === currentQuery) {
        return;
      }

      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    },
    [searchParams, router, pathname, allFrames, featuredFrames],
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

        setActiveChapterId(visibleEntries[0].target.id);
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

          return (
            Math.abs(aCenter - viewportCenter) - Math.abs(bCenter - viewportCenter)
          );
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
    if (viewerState) {
      hadViewerOpen.current = true;
      return;
    }

    if (!hadViewerOpen.current) {
      return;
    }

    hadViewerOpen.current = false;
    const target = openerRef.current;
    openerRef.current = null;

    if (!target) {
      return;
    }

    window.requestAnimationFrame(() => {
      target.focus();
    });
  }, [viewerState]);

  const openViewer = useCallback(
    (slug: string, trigger?: HTMLElement | null) => {
      const frameIndex = frameIndexMap.get(slug);

      if (frameIndex !== undefined) {
        openerRef.current = trigger ?? (document.activeElement as HTMLElement | null);
        setViewerQuery({ mode: "frame", index: frameIndex });
        return;
      }

      const featuredIndex = featuredIndexMap.get(slug);

      if (featuredIndex !== undefined) {
        openerRef.current = trigger ?? (document.activeElement as HTMLElement | null);
        setViewerQuery({ mode: "featured", index: featuredIndex });
      }
    },
    [frameIndexMap, featuredIndexMap, setViewerQuery],
  );

  const closeViewer = useCallback(() => {
    setViewerQuery(null);
  }, [setViewerQuery]);

  const changeViewerIndex = useCallback(
    (nextIndex: number) => {
      if (!viewerState) {
        return;
      }

      const total =
        viewerState.mode === "frame" ? allFrames.length : featuredFrames.length;
      const normalizedIndex = ((nextIndex % total) + total) % total;
      setViewerQuery({ mode: viewerState.mode, index: normalizedIndex });
    },
    [viewerState, allFrames.length, featuredFrames.length, setViewerQuery],
  );

  return (
    <div className="bg-[#0a0a0a] text-[#f5f5f5]">
      <Hero
        heroImage={heroImage}
        frameCount={allFrames.length}
        onOpenViewer={openViewer}
      />

      <main id="gallery">
        <ChapterIndex
          chapters={chapters}
          previews={previewStrip}
          activeChapterId={activeChapterId}
          onOpenViewer={openViewer}
        />

        {chapters.map((chapter, index) => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            prioritizeFeatured={index === 0}
            onOpenViewer={openViewer}
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
                São Paulo · Available for commissioned work
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={BOOKING_MAILTO}
                  className="border border-white/30 bg-[#f5f5f5] px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] text-[#0a0a0a] transition hover:border-white hover:bg-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Request booking
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white/20 px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] text-[#9ca3af] transition hover:border-white/45 hover:text-[#f5f5f5] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LightboxViewer
        viewerState={viewerState}
        frameItems={allFrames}
        featuredItems={featuredFrames}
        onClose={closeViewer}
        onChangeIndex={changeViewerIndex}
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
