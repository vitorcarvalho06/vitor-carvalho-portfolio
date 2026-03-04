"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from "react";
import type { ResolvedFrame } from "./types";

type LightboxProps = {
  isOpen: boolean;
  frame: ResolvedFrame | null;
  currentIndex: number;
  total: number;
  previousSrc: string | null;
  nextSrc: string | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};

export default function Lightbox({
  isOpen,
  frame,
  currentIndex,
  total,
  previousSrc,
  nextSrc,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);
  const lastWheelAt = useRef(0);

  const closeViewer = useCallback(() => {
    setIsAutoPlay(false);
    onClose();
  }, [onClose]);

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
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeViewer();
      }

      if (event.key === "ArrowRight") {
        onNext();
      }

      if (event.key === "ArrowLeft") {
        onPrev();
      }

      if (event.key.toLowerCase() === "p") {
        event.preventDefault();
        setIsAutoPlay((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeViewer, onNext, onPrev]);

  useEffect(() => {
    if (!isOpen || !isAutoPlay) {
      return;
    }

    const intervalId = window.setInterval(() => {
      onNext();
    }, 6000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAutoPlay, isOpen, onNext]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    [previousSrc, nextSrc].forEach((src) => {
      if (!src) {
        return;
      }

      const preloadImage = new window.Image();
      preloadImage.src = src;
    });
  }, [isOpen, previousSrc, nextSrc, currentIndex]);

  const onWheelNavigate = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    const now = Date.now();

    if (now - lastWheelAt.current < 320) {
      return;
    }

    lastWheelAt.current = now;

    if (event.deltaY > 0) {
      onNext();
      return;
    }

    if (event.deltaY < 0) {
      onPrev();
    }
  };

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
      onNext();
      return;
    }

    onPrev();
  };

  const positionLabel = `${String(currentIndex + 1).padStart(2, "0")} / ${String(
    total,
  ).padStart(2, "0")}`;

  return (
    <AnimatePresence>
      {isOpen && frame ? (
        <motion.div
          className="fixed inset-0 z-50 bg-[#070707]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={closeViewer}
          onWheel={onWheelNavigate}
        >
          <div
            className="absolute inset-0 flex items-center justify-center px-4 py-12 md:px-12"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="relative h-[82vh] w-full max-w-[1500px] touch-none"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => {
                swipeStartX.current = null;
                swipeStartY.current = null;
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={frame.key}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  <Image
                    src={frame.src}
                    alt={frame.alt}
                    fill
                    priority
                    quality={80}
                    placeholder="blur"
                    blurDataURL={frame.blurDataURL}
                    sizes="92vw"
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPrev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[#f5f5f5] transition hover:border-white/50 hover:bg-white/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white md:left-8"
            aria-label="Frame anterior"
          >
            Prev
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.24em] text-[#f5f5f5] transition hover:border-white/50 hover:bg-white/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white md:right-8"
            aria-label="Proximo frame"
          >
            Next
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              closeViewer();
            }}
            className="absolute right-4 top-4 border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.22em] text-[#f5f5f5] transition hover:border-white/50 hover:bg-white/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white md:right-8 md:top-8"
            aria-label="Fechar visualizador"
          >
            Close
          </button>

          <div className="pointer-events-none absolute bottom-4 left-4 space-y-2 uppercase md:bottom-8 md:left-8">
            <p className="text-[11px] tracking-[0.2em] text-[#9ca3af]">{`CHAPTER ${frame.chapterNumber} - ${frame.chapterTitle}`}</p>
            <p className="text-[12px] tracking-[0.25em] text-[#9ca3af]">{`FRAME ${positionLabel}`}</p>
            <p className="text-[10px] tracking-[0.18em] text-[#9ca3af]/85">{frame.name}</p>
            <p className="text-[10px] tracking-[0.18em] text-[#9ca3af]/65">
              {isAutoPlay ? "AUTO PLAY ON (P)" : "AUTO PLAY OFF (P)"}
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
