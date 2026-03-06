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
      const index =
        frameIndexMap.get(frameSlug) ?? getFrameIndexBySlug(frameSlug);

      if (index >= 0 && index < allFrames.length) {
        return { mode: "frame", index };
      }
    }

    const featuredSlug = searchParams.get("featured");

    if (featuredSlug) {
      const index =
        featuredIndexMap.get(featuredSlug) ??
        getFeaturedIndexBySlug(featuredSlug);

      if (index >= 0 && index < featuredFrames.length) {
        return { mode: "featured", index };
      }
    }

    return null;
  }, [
    searchParams,
    frameIndexMap,
    featuredIndexMap,
    allFrames.length,
    featuredFrames.length,
  ]);

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

    if (!sections.length) return;

    const updateActiveChapter = () => {
      const viewportOffset = 1;

      let closestSection: HTMLElement | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top - viewportOffset);

        if (rect.bottom > viewportOffset && distance < closestDistance) {
          closestDistance = distance;
          closestSection = section;
        }
      }

      if (closestSection?.id) {
        setActiveChapterId(closestSection.id);
      }
    };

    updateActiveChapter();

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveChapter();
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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
            Math.abs(aCenter - viewportCenter) -
            Math.abs(bCenter - viewportCenter)
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
        openerRef.current =
          trigger ?? (document.activeElement as HTMLElement | null);
        setViewerQuery({ mode: "frame", index: frameIndex });
        return;
      }

      const featuredIndex = featuredIndexMap.get(slug);

      if (featuredIndex !== undefined) {
        openerRef.current =
          trigger ?? (document.activeElement as HTMLElement | null);
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
    <div className="bg-[#050505] text-[#f3efe7]">
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
          className="scroll-mt-28 border-t border-[rgba(243,239,231,0.10)] py-24 md:py-32"
        >
          <div className="mx-auto w-full max-w-[1320px] px-6 md:px-10">
            <div className="noise-overlay relative overflow-hidden border border-[rgba(243,239,231,0.10)] bg-white/[0.03] px-6 py-10 md:px-10 md:py-14">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(142,164,191,0.14),transparent_24%)]" />

              <div className="relative z-10 grid gap-12 md:grid-cols-[minmax(0,1fr)_320px] md:items-end">
                <div className="max-w-[760px]">
                  <p className="text-[10px] uppercase tracking-[0.42em] text-[#8ea4bf]">
                    Contact
                  </p>

                  <h2 className="mt-5 max-w-[11ch] text-[clamp(38px,4.8vw,76px)] font-semibold leading-[0.88] tracking-[-0.05em] text-[#f3efe7]">
                    Available for selected commissions and visual
                    collaborations.
                  </h2>

                  <p className="mt-6 max-w-[50ch] text-[14px] leading-[1.85] tracking-[0.06em] text-[#a1a1aa]">
                    Based in Brazil. Open to editorial, campaigns, portrait
                    series and character-led visual work with strong atmosphere
                    and intentional direction.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="h-px w-full bg-[rgba(243,239,231,0.10)]" />
                  <p className="text-[10px] uppercase tracking-[0.38em] text-[#8ea4bf]">
                    São Paulo · Brazil
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#a1a1aa]">
                    Booking · Editorial · Campaigns
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href={BOOKING_MAILTO}
                      className="accent-glow border border-[rgba(243,239,231,0.18)] bg-[#f3efe7] px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] text-[#050505] transition hover:border-white hover:bg-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                      Request Booking
                    </a>

                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-[rgba(243,239,231,0.18)] bg-white/[0.04] px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] text-[#f3efe7] transition hover:border-[rgba(142,164,191,0.55)] hover:bg-[rgba(142,164,191,0.08)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
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
