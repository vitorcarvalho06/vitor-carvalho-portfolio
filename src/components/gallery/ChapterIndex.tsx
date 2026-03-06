import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { PreviewImage, ResolvedChapter } from "./types";

type ChapterIndexProps = {
  chapters: ResolvedChapter[];
  previews: PreviewImage[];
  activeChapterId: string;
  onOpenViewer: (slug: string, trigger?: HTMLElement | null) => void;
};

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled"));
}

export default function ChapterIndex({
  chapters,
  previews,
  activeChapterId,
  onOpenViewer,
}: ChapterIndexProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLElement | null>(null);
  const drawerTriggerRef = useRef<HTMLElement | null>(null);

  const closeDrawer = useCallback((restoreFocus = true) => {
    setIsDrawerOpen(false);

    if (!restoreFocus) {
      return;
    }

    window.requestAnimationFrame(() => {
      drawerTriggerRef.current?.focus();
    });
  }, []);

  const openDrawer = useCallback((trigger: HTMLElement) => {
    drawerTriggerRef.current = trigger;
    setIsDrawerOpen(true);
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    const closeDrawerOnDesktop = () => {
      if (window.innerWidth >= 768) {
        closeDrawer(false);
      }
    };

    closeDrawerOnDesktop();
    window.addEventListener("resize", closeDrawerOnDesktop);

    return () => {
      window.removeEventListener("resize", closeDrawerOnDesktop);
    };
  }, [closeDrawer]);

  useEffect(() => {
    if (!isDrawerOpen || !drawerRef.current) {
      return;
    }

    const drawer = drawerRef.current;
    const firstLink = drawer.querySelector<HTMLElement>("a[href]");
    firstLink?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(drawer);

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
  }, [isDrawerOpen, closeDrawer]);

  return (
    <>
      <section
        id="chapters"
        className="border-t border-white/10 py-20 md:py-24"
      >
        <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-6 md:grid-cols-[minmax(0,1fr)_220px] md:px-10">
          <div className="space-y-6">
            <h2 className="text-sm uppercase tracking-[0.3em] text-[#9ca3af]">
              Chapters
            </h2>
            <p className="max-w-[52ch] text-sm leading-relaxed tracking-[0.06em] text-[#9ca3af]">
              Navigate through six cinematic scenes. The active chapter updates
              while you scroll.
            </p>
            <div className="md:hidden">
              <button
                type="button"
                onClick={(event) => openDrawer(event.currentTarget)}
                className="border border-white/20 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#f5f5f5] transition hover:border-white/50 hover:bg-white/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
                aria-label="Abrir lista de chapters"
                aria-expanded={isDrawerOpen}
                aria-controls="chapters-drawer"
              >
                Chapters
              </button>
            </div>
          </div>

          <div className="hidden items-end gap-3 md:flex md:flex-col">
            {previews.map((preview) => (
              <button
                type="button"
                key={preview.name}
                onClick={(event) =>
                  onOpenViewer(preview.slug, event.currentTarget)
                }
                className="relative h-28 w-44 overflow-hidden border border-white/10"
                aria-label={`Abrir imagem ${preview.alt}`}
              >
                <Image
                  src={preview.src}
                  alt={preview.alt}
                  fill
                  quality={80}
                  placeholder="blur"
                  blurDataURL={preview.blurDataURL}
                  sizes="176px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      <nav
        aria-label="Chapter index"
        className="pointer-events-none fixed right-7 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
      >
        <ol className="pointer-events-auto space-y-2 border border-white/10 bg-[#0a0a0a]/70 px-4 py-4 backdrop-blur-md">
          {chapters.map((chapter) => {
            const active = activeChapterId === chapter.id;

            return (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  className={cn(
                    "group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-[#9ca3af] transition focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white",
                    active && "text-[#f5f5f5]",
                  )}
                  aria-label={`Ir para chapter ${chapter.number} ${chapter.title}`}
                >
                  <span>{chapter.number}</span>
                  <span>{chapter.title}</span>
                  <span
                    className={cn(
                      "h-px w-5 bg-white/0 transition group-hover:bg-white/30",
                      active && "bg-white/55",
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="fixed bottom-10 left-6 z-30 md:hidden">
        <button
          type="button"
          onClick={(event) => openDrawer(event.currentTarget)}
          className="border border-white/20 bg-[#0a0a0a]/80 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#f5f5f5] backdrop-blur-sm transition hover:border-white/50 hover:bg-[#0a0a0a] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
          aria-label="Abrir chapters"
          aria-expanded={isDrawerOpen}
          aria-controls="chapters-drawer"
        >
          Chapters
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          isDrawerOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/70 transition-opacity duration-300",
            isDrawerOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => closeDrawer()}
          aria-hidden
        />

        <aside
          ref={drawerRef}
          id="chapters-drawer"
          className={cn(
            "absolute inset-y-0 right-0 w-[82%] max-w-sm border-l border-white/10 bg-[#0a0a0a] p-6 transition-transform duration-300",
            isDrawerOpen ? "translate-x-0" : "translate-x-full",
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Lista de chapters"
        >
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[#9ca3af]">
              Chapters
            </p>
            <button
              type="button"
              onClick={() => closeDrawer()}
              className="border border-white/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[#f5f5f5] transition hover:border-white/50 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white"
              aria-label="Fechar chapters"
            >
              Close
            </button>
          </div>

          <ol className="space-y-4">
            {chapters.map((chapter) => {
              const active = activeChapterId === chapter.id;

              return (
                <li key={chapter.id}>
                  <a
                    href={`#${chapter.id}`}
                    onClick={() => closeDrawer(true)}
                    className={cn(
                      "inline-flex items-center gap-3 text-[13px] uppercase tracking-[0.2em] text-[#9ca3af] transition focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white",
                      active && "text-[#f5f5f5]",
                    )}
                    aria-label={`Ir para chapter ${chapter.number} ${chapter.title}`}
                  >
                    <span>{chapter.number}</span>
                    <span>{chapter.title}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </>
  );
}
