"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  type PointerEvent,
  type WheelEvent,
} from "react";
import { getPrevNext } from "@/lib/gallery";
import type {
  ResolvedFeaturedFrame,
  ResolvedFrame,
  ViewerState,
} from "@/components/gallery/types";

type LightboxViewerProps = {
  viewerState: ViewerState | null;
  frameItems: ResolvedFrame[];
  featuredItems: ResolvedFeaturedFrame[];
  onClose: () => void;
  onChangeIndex: (index: number) => void;
};

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled"));
}

export default function LightboxViewer({
  viewerState,
  frameItems,
  featuredItems,
  onClose,
  onChangeIndex,
}: LightboxViewerProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);
  const lastWheelAt = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  const isOpen = viewerState !== null;
  const currentItems =
    viewerState?.mode === "featured" ? featuredItems : frameItems;
  const currentIndex = viewerState?.index ?? 0;
  const currentItem = currentItems[currentIndex];

  const { prevIndex, nextIndex } = useMemo(
    () => getPrevNext(currentItems.length || 1, currentIndex),
    [currentItems.length, currentIndex],
  );

  const prevItem = currentItems[prevIndex];
  const nextItem = currentItems[nextIndex];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !prevItem || !nextItem) {
      return;
    }

    [prevItem.src, nextItem.src].forEach((src) => {
      const preload = new window.Image();
      preload.src = src;
    });
  }, [isOpen, prevItem, nextItem, currentIndex]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onChangeIndex(nextIndex);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onChangeIndex(prevIndex);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      if (!dialogRef.current) {
        return;
      }

      const focusableElements = getFocusableElements(dialogRef.current);

      if (!focusableElements.length) {
        event.preventDefault();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose, onChangeIndex, nextIndex, prevIndex]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipeStartX.current = event.clientX;
    swipeStartY.current = event.clientY;
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (swipeStartX.current === null || swipeStartY.current === null) {
      return;
    }

    const deltaX = event.clientX - swipeStartX.current;
    const deltaY = event.clientY - swipeStartY.current;

    swipeStartX.current = null;
    swipeStartY.current = null;

    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      onChangeIndex(nextIndex);
      return;
    }

    onChangeIndex(prevIndex);
  };

  const onWheelNavigate = (event: WheelEvent<HTMLDivElement>) => {
    if (!isOpen) {
      return;
    }
    if (event.shiftKey) {
      return;
    }
    if (Math.abs(event.deltaY) < 30) {
      return;
    }

    const now = Date.now();

    if (now - lastWheelAt.current < 220) {
      return;
    }

    event.preventDefault();
    lastWheelAt.current = now;

    if (event.deltaY > 0) {
      onChangeIndex(nextIndex);
      return;
    }

    if (event.deltaY < 0) {
      onChangeIndex(prevIndex);
    }
  };

  if (!currentItem || !viewerState) {
    return null;
  }

  const frameLabel =
    viewerState.mode === "featured"
      ? "FEATURED"
      : `FRAME ${String(currentIndex + 1).padStart(2, "0")} / ${String(
          frameItems.length,
        ).padStart(2, "0")}`;

  const isFeaturedMode = viewerState.mode === "featured";
  let sectionLabel = "Featured Series";
  let description = "Curated portraits from the featured cinematic sequence.";

  if (!isFeaturedMode) {
    const frameItem = currentItem as ResolvedFrame;
    sectionLabel = `CHAPTER ${frameItem.chapterNumber} - ${frameItem.chapterTitle}`;
    description = frameItem.chapterDescription;
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 bg-[#050505]/[0.96] backdrop-blur-[6px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0.1 }
              : { duration: 0.28, ease: "easeOut" }
          }
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Lightbox viewer"
            className="mx-auto flex h-full w-full max-w-[1920px] flex-col md:flex-row"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.985 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.1 }
                : { duration: 0.34, ease: "easeOut" }
            }
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="relative flex min-h-[58vh] flex-1 touch-none items-center justify-center px-4 py-16 md:min-h-0 md:px-10 lg:px-14"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onWheel={onWheelNavigate}
              onPointerCancel={() => {
                swipeStartX.current = null;
                swipeStartY.current = null;
              }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_42%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(142,164,191,0.10),transparent_24%)]" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${viewerState.mode}:${currentItem.slug}`}
                  className="relative h-[68vh] w-full max-w-[1380px] border border-[rgba(243,239,231,0.10)] bg-white/[0.02] md:h-[84vh]"
                  initial={{
                    opacity: 0,
                    x: shouldReduceMotion ? 0 : 12,
                    scale: shouldReduceMotion ? 1 : 0.992,
                  }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    x: shouldReduceMotion ? 0 : -12,
                    scale: shouldReduceMotion ? 1 : 0.992,
                  }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0.1 }
                      : { duration: 0.34, ease: "easeOut" }
                  }
                >
                  <Image
                    src={currentItem.src}
                    alt={currentItem.alt}
                    fill
                    priority={currentIndex === 0}
                    quality={80}
                    placeholder="blur"
                    blurDataURL={currentItem.blurDataURL}
                    sizes="(max-width: 768px) 100vw, 78vw"
                    className="object-contain p-3 md:p-4"
                  />
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                onClick={() => onChangeIndex(prevIndex)}
                className="absolute left-3 top-1/2 -translate-y-1/2 border border-[rgba(243,239,231,0.10)] bg-[#050505]/60 px-4 py-3 text-xl leading-none text-[#f3efe7] backdrop-blur-md transition hover:border-[rgba(142,164,191,0.45)] hover:bg-[rgba(142,164,191,0.08)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white md:left-6"
                aria-label="Frame anterior"
              >
                ←
              </button>

              <button
                type="button"
                onClick={() => onChangeIndex(nextIndex)}
                className="absolute right-3 top-1/2 -translate-y-1/2 border border-[rgba(243,239,231,0.10)] bg-[#050505]/60 px-4 py-3 text-xl leading-none text-[#f3efe7] backdrop-blur-md transition hover:border-[rgba(142,164,191,0.45)] hover:bg-[rgba(142,164,191,0.08)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white md:right-6"
                aria-label="Próximo frame"
              >
                →
              </button>
              <div className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 border border-[rgba(243,239,231,0.10)] bg-[#050505]/55 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-[#a1a1aa] backdrop-blur-md md:block">
                Swipe or scroll to navigate
              </div>
            </div>

            <aside className="w-full border-t border-[rgba(243,239,231,0.10)] bg-white/[0.02] px-6 py-6 md:w-[400px] md:border-l md:border-t-0 md:px-8 md:py-8 lg:w-[420px]">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="ml-auto block border border-[rgba(243,239,231,0.14)] bg-white/[0.03] px-3.5 py-1.5 text-[10px] uppercase tracking-[0.28em] text-[#f3efe7] transition hover:border-[rgba(142,164,191,0.45)] hover:bg-[rgba(142,164,191,0.08)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Fechar viewer"
              >
                Close
              </button>

              <div className="mt-8 space-y-6">
                <div className="space-y-3">
                  <p className="text-[9px] uppercase tracking-[0.42em] text-[#8ea4bf]">
                    {frameLabel}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-[rgba(243,239,231,0.10)]" />
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[#6f7480]">
                      Viewer
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[#a1a1aa]">
                    {sectionLabel}
                  </p>

                  <h3 className="max-w-[11ch] text-[clamp(28px,2.8vw,40px)] font-semibold leading-[0.9] tracking-[-0.045em] text-[#f3efe7]">
                    {currentItem.title}
                  </h3>

                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#6f7480]">
                    {currentItem.slug}
                  </p>

                  <p className="max-w-[32ch] text-[14px] leading-[1.8] tracking-[0.06em] text-[#a1a1aa]">
                    {description}
                  </p>
                </div>
              </div>
              <div className="mt-8 space-y-5 border-t border-[rgba(243,239,231,0.10)] pt-6">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-[#a1a1aa]">
                  <span>Navigate</span>
                  <span className="text-[#6f7480]">← → keys</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onChangeIndex(prevIndex)}
                    className="border border-[rgba(243,239,231,0.12)] bg-white/[0.03] px-4 py-3 text-left text-[10px] uppercase tracking-[0.24em] text-[#f3efe7] transition hover:border-[rgba(142,164,191,0.45)] hover:bg-[rgba(142,164,191,0.08)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeIndex(nextIndex)}
                    className="border border-[rgba(243,239,231,0.12)] bg-white/[0.03] px-4 py-3 text-left text-[10px] uppercase tracking-[0.24em] text-[#f3efe7] transition hover:border-[rgba(142,164,191,0.45)] hover:bg-[rgba(142,164,191,0.08)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="mt-8 space-y-4 border-t border-[rgba(243,239,231,0.10)] pt-6">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-[#a1a1aa]">
                  <span>Sequence</span>
                  <span className="text-[#6f7480]">
                    {String(currentIndex + 1).padStart(2, "0")} /{" "}
                    {String(currentItems.length).padStart(2, "0")}
                  </span>
                </div>

                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {currentItems.map((item, index) => {
                    const isActive = index === currentIndex;

                    return (
                      <button
                        key={item.slug}
                        type="button"
                        onClick={() => onChangeIndex(index)}
                        aria-label={`Abrir ${item.title}`}
                        className={`relative h-16 w-12 shrink-0 overflow-hidden border transition ${
                          isActive
                            ? "border-[rgba(142,164,191,0.55)]"
                            : "border-[rgba(243,239,231,0.10)] hover:border-[rgba(243,239,231,0.26)]"
                        }`}
                      >
                        <Image
                          src={item.src}
                          alt={item.alt}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                        <span
                          className={`absolute inset-0 ${
                            isActive
                              ? "bg-[rgba(142,164,191,0.10)]"
                              : "bg-black/20"
                          }`}
                          aria-hidden
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
