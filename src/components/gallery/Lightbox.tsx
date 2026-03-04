"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import type { ResolvedFrame } from "./types";

type LightboxProps = {
  isOpen: boolean;
  frame: ResolvedFrame | null;
  currentIndex: number;
  total: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};

export default function Lightbox({
  isOpen,
  frame,
  currentIndex,
  total,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
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
        onClose();
      }

      if (event.key === "ArrowRight") {
        onNext();
      }

      if (event.key === "ArrowLeft") {
        onPrev();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose, onNext, onPrev]);

  const positionLabel = `${String(currentIndex + 1).padStart(2, "0")} / ${String(
    total,
  ).padStart(2, "0")}`;

  return (
    <AnimatePresence>
      {isOpen && frame ? (
        <motion.div
          className="fixed inset-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          onClick={onClose}
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-center px-4 py-12 md:px-12"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-[82vh] w-full max-w-[1500px]">
              <Image
                src={frame.src}
                alt={`${frame.chapterTitle} - ${frame.name}`}
                fill
                priority
                sizes="92vw"
                className="object-contain"
              />
            </div>
          </motion.div>

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
              onClose();
            }}
            className="absolute right-4 top-4 border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.22em] text-[#f5f5f5] transition hover:border-white/50 hover:bg-white/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white md:right-8 md:top-8"
            aria-label="Fechar visualizador"
          >
            Close
          </button>

          <div className="pointer-events-none absolute bottom-4 left-4 space-y-2 text-xs uppercase tracking-[0.2em] text-[#9ca3af] md:bottom-8 md:left-8">
            <p>{`CHAPTER ${frame.chapterNumber} - ${frame.chapterTitle}`}</p>
            <p>{`Frame ${positionLabel}`}</p>
            <p className="text-[#9ca3af]">{frame.name}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
