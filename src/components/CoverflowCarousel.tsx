import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Settings, type LucideIcon } from "lucide-react";

export interface CarouselItem {
  id: number;
  title: string;
  hint: string;
  category: SkillCategory;
  icon: LucideIcon;
}

interface CoverflowCarouselProps {
  items: CarouselItem[];
}

export type SkillCategory =
  | "Reasoning"
  | "Action"
  | "Memory"
  | "Evaluation"
  | "Safety";

export const categoryStyles: Record<
  SkillCategory,
  { from: string; to: string; glow: string; accent: string }
> = {
  Reasoning: {
    from: "hsl(220 80% 18%)",
    to: "hsl(230 70% 6%)",
    glow: "rgba(90, 160, 255, 0.4)",
    accent: "hsl(210 90% 72%)",
  },
  Action: {
    from: "hsl(165 70% 20%)",
    to: "hsl(170 65% 7%)",
    glow: "rgba(72, 200, 160, 0.4)",
    accent: "hsl(160 80% 70%)",
  },
  Memory: {
    from: "hsl(265 65% 20%)",
    to: "hsl(250 70% 8%)",
    glow: "rgba(150, 110, 255, 0.45)",
    accent: "hsl(260 80% 70%)",
  },
  Evaluation: {
    from: "hsl(25 85% 22%)",
    to: "hsl(18 80% 8%)",
    glow: "rgba(255, 150, 90, 0.4)",
    accent: "hsl(30 90% 68%)",
  },
  Safety: {
    from: "hsl(355 70% 22%)",
    to: "hsl(345 70% 8%)",
    glow: "rgba(255, 120, 120, 0.35)",
    accent: "hsl(350 80% 68%)",
  },
};

const BASE_CARD_WIDTH = 320;
const FOCUSED_CARD_WIDTH = BASE_CARD_WIDTH * 2;

const CoverflowCarousel = ({ items }: CoverflowCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(Math.floor(items.length / 2));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [recentlyFocused, setRecentlyFocused] = useState(false);
  const lastActiveBeforeFocus = useRef(activeIndex);
  const focusEase = useMemo(() => [0.16, 1, 0.3, 1] as const, []);

  useEffect(() => {
    if (!items.length) return;
    const mid = Math.floor(items.length / 2);
    setActiveIndex(mid);
    setFocusedIndex(null);
    lastActiveBeforeFocus.current = mid;
  }, [items]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFocusedIndex(null);
        setActiveIndex(lastActiveBeforeFocus.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (focusedIndex !== null) {
      setRecentlyFocused(true);
      return;
    }

    if (recentlyFocused) {
      const timeout = setTimeout(() => setRecentlyFocused(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [focusedIndex, recentlyFocused]);

  const handlePrev = useCallback(() => {
    if (focusedIndex !== null) return;
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  }, [focusedIndex, items.length]);

  const handleNext = useCallback(() => {
    if (focusedIndex !== null) return;
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  }, [focusedIndex, items.length]);

  const isFocusMode = focusedIndex !== null;
  const focusIndex = focusedIndex ?? activeIndex;

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const handleClickCapture = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const card = target.closest("[data-coverflow-card]");
      if (!card) return;

      const targetPointer = getComputedStyle(target).pointerEvents;
      const cardPointer = getComputedStyle(card as HTMLElement).pointerEvents;
      const path = event.composedPath().slice(0, 8).map((node) => {
        if (!(node instanceof HTMLElement)) return node.constructor.name;
        return `${node.tagName}.${(node.className || "").toString()}`;
      });

      console.log("[Coverflow] Click captured", {
        tag: target.tagName,
        classes: target.className,
        targetPointer,
        cardPointer,
        isFocusMode,
        focusIndex,
        activeIndex,
        path,
      });
    };

    document.addEventListener("click", handleClickCapture, true);
    return () => document.removeEventListener("click", handleClickCapture, true);
  }, [activeIndex, focusIndex, isFocusMode]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const downloadBtn = document.querySelector("[data-coverflow-download]") as HTMLElement | null;
    const setupBtn = document.querySelector("[data-coverflow-setup]") as HTMLElement | null;

    [downloadBtn, setupBtn].forEach((el) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const topEl = document.elementFromPoint(centerX, centerY) as HTMLElement | null;
      const topPath = topEl
        ? topEl.closest("[data-coverflow-card]")
        : null;

      console.log("[Coverflow] Button state", {
        name: el.dataset.coverflowDownload ? "download" : "setup",
        pointerEvents: getComputedStyle(el).pointerEvents,
        rect,
        isFocusMode,
        focusIndex,
        activeIndex,
        topTarget: topEl ? { tag: topEl.tagName, classes: topEl.className } : null,
        topIsCard: Boolean(topPath),
      });
    });
  }, [activeIndex, focusIndex, isFocusMode]);

  const handleDownloadSkill = useCallback(async (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log("[Coverflow] Download button clicked", {
      focusedIndex,
      activeIndex,
      isFocusMode,
    });
    try {
      const downloadUrl = "https://codeload.github.com/anthropics/skills/zip/refs/heads/main";
      console.log("[Coverflow] Fetching skill zip", { downloadUrl });
      const response = await fetch(downloadUrl);
      console.log("[Coverflow] Fetch response", {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      });
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = "slack-gif-creator.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(href);
      console.log("[Coverflow] Download triggered successfully");
    } catch (error) {
      console.error("Failed to download skill zip", error);
    }
  }, [activeIndex, focusedIndex, isFocusMode]);

  const getItemStyle = (index: number) => {
    if (isFocusMode) {
      const diff = index - focusIndex;
      const isFocused = diff === 0;

      return {
        opacity: isFocused ? 1 : 0.3,
        x: isFocused ? 0 : diff * 140,
        z: isFocused ? 500 : -400,
        rotateY: isFocused ? 0 : diff < 0 ? 30 : -30,
        scale: isFocused ? 1.15 : 0.8,
        zIndex: isFocused ? 50 : 5 - Math.abs(diff),
        pointerEvents: isFocused ? "auto" as const : "none" as const,
      };
    }

    const diff = index - activeIndex;
    const absDiff = Math.abs(diff);
    
    // Only show 5 items (2 on each side + center)
    if (absDiff > 2) {
      return {
        opacity: 0,
        x: diff > 0 ? 500 : -500,
        z: -500,
        rotateY: 0,
        scale: 0.5,
        zIndex: 0,
        pointerEvents: "auto" as const,
      };
    }

    const isCenter = diff === 0;
    const isLeft = diff < 0;

    return {
      opacity: isCenter ? 1 : 0.7 - absDiff * 0.15,
      x: diff * 220,
      z: isCenter ? 0 : -180 * absDiff,
      rotateY: isCenter ? 0 : isLeft ? 45 : -45,
      scale: isCenter ? 1 : 0.75 - absDiff * 0.05,
      zIndex: 10 - absDiff,
      pointerEvents: "auto" as const,
    };
  };

  const handleCardClick = (index: number) => {
    if (focusedIndex !== null) return;
    lastActiveBeforeFocus.current = activeIndex;
    setActiveIndex(index);
    setFocusedIndex(index);
  };

  const baseTransition = isFocusMode || recentlyFocused
    ? {
        duration: 0.7,
        ease: focusEase,
        opacity: { duration: 0.4, ease: "easeOut" },
      }
    : {
        type: "spring",
        stiffness: 300,
        damping: 30,
      };

  return (
    <div className="relative w-full h-[600px] flex flex-col items-center justify-center">
      {/* Ambient glow background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 w-[600px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-20"
          style={{
            background: `radial-gradient(ellipse, hsl(var(--primary)), transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Carousel container */}
      <div className="coverflow-container relative w-full h-[450px] flex items-center justify-center">
        <AnimatePresence>
          {isFocusMode && (
            <motion.div
              className="absolute inset-0 bg-black/65 backdrop-blur-md"
              style={{ zIndex: 5, pointerEvents: "auto" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                if (import.meta.env.DEV) {
                  console.log("[Coverflow] Backdrop click");
                }
                setFocusedIndex(null);
                setActiveIndex(lastActiveBeforeFocus.current);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {items.map((item, index) => {
            const style = getItemStyle(index);
            const isActive = index === activeIndex;
            const isFocused = index === focusedIndex;
            const colors = categoryStyles[item.category];
            const cardWidth = isFocused ? FOCUSED_CARD_WIDTH : BASE_CARD_WIDTH;

            return (
              <motion.div
                key={item.id}
                className="coverflow-item absolute cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: style.opacity,
                  x: style.x,
                  z: style.z,
                  rotateY: style.rotateY,
                  scale: style.scale,
                  zIndex: style.zIndex,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={baseTransition}
                style={{
                  pointerEvents: style.pointerEvents,
                  cursor: isFocused ? "default" : "zoom-in",
                }}
                onClick={
                  isFocusMode
                    ? undefined
                    : () => handleCardClick(index)
                }
                whileHover={
                  !isActive || isFocusMode
                    ? { scale: style.scale * 1.05, z: style.z + 40 }
                    : {}
                }
              >
                <div
                  className={`coverflow-card h-[400px] ${
                    isActive ? "coverflow-card-active" : ""
                  }`}
                  data-coverflow-card
                  style={{
                    position: "relative",
                    zIndex: 10,
                    width: cardWidth,
                    overflowY: isFocused ? "auto" : "hidden",
                    overflowX: "hidden",
                    pointerEvents: "auto",
                  }}
                >
                  <div
                    className="relative w-full min-h-full"
                    style={{
                      background: `linear-gradient(145deg, ${colors.from}, ${colors.to})`,
                      pointerEvents: "auto",
                    }}
                  >
                    {/* Soft glow edge */}
                    <div
                      className="absolute inset-0 opacity-60 pointer-events-none"
                      style={{
                        boxShadow: `inset 0 0 60px rgba(255,255,255,0.05), 0 0 70px ${colors.glow}`,
                      }}
                    />

                    {/* Subtle grid */}
                    <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_1px_1px,_#fff_1px,_transparent_0)] [background-size:24px_24px] pointer-events-none" />

                    {/* Top chrome */}
                    <div className="absolute inset-x-0 top-0 h-24 bg-white/5 blur-3xl pointer-events-none" />

                    {/* Content */}
                    {isFocused ? (
                      <div
                        className="relative flex flex-col gap-10 p-6 pb-12"
                        style={{ zIndex: 20, pointerEvents: "auto" }}
                      >
                        {/* Sticky header */}
                        <div className="sticky top-0 -mx-6 px-6 pt-2 pb-3 z-20 bg-gradient-to-b from-black/70 via-black/40 to-transparent backdrop-blur-md">
                          <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.2em] font-semibold text-white/80 border border-white/20 bg-white/10">
                              {item.category}
                            </div>
                            <div className="text-xs text-white/60 flex items-center gap-2">
                              <item.icon className="w-4 h-4" strokeWidth={1.5} />
                              <span>{item.title}</span>
                            </div>
                          </div>
                        </div>

                        {/* Section 1 — Overview */}
                        <section className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.2em] font-semibold text-white/80 border border-white/15 bg-white/10">
                              Skill Spotlight
                            </div>
                            <div className="px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.2em] font-semibold text-white/70 border border-white/15 bg-white/5">
                              {item.category}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-3xl font-semibold text-white leading-tight">
                              {item.title}
                            </h3>
                            <p className="text-base text-white/80 leading-relaxed max-w-[560px]">
                              {item.hint}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold shadow-lg shadow-black/30 hover:scale-105 transition-transform">
                              Inspect skill
                            </button>
                          </div>
                        </section>

                        {/* Section 2 — GitHub / Implementation */}
                        <section className="space-y-4">
                          <div className="text-xs uppercase tracking-[0.25em] text-white/60">
                            GitHub Snapshot
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-inner shadow-black/30">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="text-sm text-white/60">Repository</div>
                                  <div className="text-lg font-semibold text-white">
                                    slack-gif-creator
                                  </div>
                                  <div className="text-xs text-white/50">
                                    Language: Python • Path: slack-gif-creator/
                                  </div>
                                </div>
                                <a
                                  href="https://github.com/anthropics/skills/tree/main/slack-gif-creator"
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(event) => event.stopPropagation()}
                                  className="px-3 py-2 text-xs font-semibold rounded-full border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
                                >
                                  View on GitHub
                                </a>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/60">
                                <span>🐍 Python</span>
                                <span>📦 pillow • imageio • numpy</span>
                                <span>📄 License: LICENSE.txt</span>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2">
                              <div className="text-sm font-semibold text-white">
                                Implementation Notes
                              </div>
                              <ul className="text-sm text-white/70 space-y-1 list-disc list-inside">
                                <li>Draw frames with PIL (Image + ImageDraw primitives)</li>
                                <li>Assemble + optimize with GIFBuilder (palette, duplicates)</li>
                                <li>Validate Slack readiness (dimensions, FPS, duration)</li>
                              </ul>
                            </div>
                          </div>
                        </section>

                        {/* Section 3 — File Explorer + Markdown */}
                        <section className="space-y-4">
                          <div className="text-xs uppercase tracking-[0.25em] text-white/60">
                            Files & Resources
                          </div>
                          <div
                            className="flex flex-wrap gap-3 relative z-40 pointer-events-auto"
                            onClickCapture={(event) => {
                              if (!import.meta.env.DEV) return;
                              const target = event.target as HTMLElement | null;
                              console.log("[Coverflow] Button row click capture", {
                                tag: target?.tagName,
                                classes: target?.className,
                                targetPointer: target ? getComputedStyle(target).pointerEvents : null,
                              });
                            }}
                          >
                            <button
                              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-full border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
                              data-coverflow-download
                              onClickCapture={(event) => {
                                if (!import.meta.env.DEV) return;
                                console.log("[Coverflow] Download button capture", {
                                  target: (event.target as HTMLElement)?.tagName,
                                  pointerEvents: getComputedStyle(event.currentTarget).pointerEvents,
                                });
                              }}
                              onClick={handleDownloadSkill}
                              type="button"
                            >
                              <Download className="w-4 h-4" strokeWidth={1.5} />
                              <span>Download skill</span>
                            </button>
                            <button
                              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-full bg-white text-black shadow-lg shadow-black/30 hover:scale-105 transition-transform"
                              data-coverflow-setup
                              onClickCapture={(event) => {
                                if (!import.meta.env.DEV) return;
                                console.log("[Coverflow] Set up button capture", {
                                  target: (event.target as HTMLElement)?.tagName,
                                  pointerEvents: getComputedStyle(event.currentTarget).pointerEvents,
                                });
                              }}
                              onClick={(event) => {
                                event.stopPropagation();
                                if (import.meta.env.DEV) {
                                  console.log("[Coverflow] Set up skill click", {
                                    focusedIndex,
                                    activeIndex,
                                    isFocusMode,
                                  });
                                }
                                window.open(
                                  "https://support.claude.com/en/articles/12512180-using-skills-in-claude#h_ed1d052296",
                                  "_blank",
                                  "noreferrer"
                                );
                              }}
                              type="button"
                            >
                              <Settings className="w-4 h-4" strokeWidth={1.5} />
                              <span>Set up skill</span>
                            </button>
                          </div>
                          <div className="grid gap-4 md:grid-cols-[260px,1fr]">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                              <div className="text-sm font-semibold text-white">File Explorer</div>
                              <div className="space-y-2 text-sm text-white/70">
                                <div className="flex items-center gap-2">
                                  <span className="text-white/60">📁</span>
                                  <span>slack-gif-creator/</span>
                                </div>
                                <div className="ml-4 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-white/60">📄</span>
                                    <span>SKILL.md</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white/60">📄</span>
                                    <span>requirements.txt</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white/60">📄</span>
                                    <span>LICENSE.txt</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white/60">📁</span>
                                  <span>core/</span>
                                </div>
                                <div className="ml-4 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-white/60">📄</span>
                                    <span>gif_builder.py</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white/60">📄</span>
                                    <span>validators.py</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white/60">📄</span>
                                    <span>easing.py</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white/60">📄</span>
                                    <span>frame_composer.py</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                                    Markdown Preview
                                  </div>
                                  <div className="text-sm font-semibold text-white">
                                    slack-gif-creator/SKILL.md
                                  </div>
                                </div>
                                <button className="px-3 py-2 text-xs rounded-full border border-white/20 text-white/80 hover:bg-white/10 transition-colors">
                                  Copy
                                </button>
                              </div>
                              <div className="space-y-2 text-sm text-white/75 leading-relaxed">
                                <p>
                                  Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like "make me a GIF of X doing Y for Slack."
                                </p>
                                <p>
                                  Quick constraints: emoji GIFs are best at 128×128; message GIFs up to ~480×480; target 10–30 FPS;
                                  keep colors ~48–128; and keep emoji GIFs under ~3 seconds.
                                </p>
                                <pre className="bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono text-white/80 overflow-x-auto">
{`from core.gif_builder import GIFBuilder
from PIL import Image, ImageDraw

builder = GIFBuilder(width=128, height=128, fps=10)
# ... generate frames and add them ...
builder.save("output.gif", num_colors=48, optimize_for_emoji=True)`}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>
                    ) : (
                      <div className="relative h-full flex flex-col justify-between p-6">
                        <div className="flex items-center justify-between gap-3">
                          <div className="px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.2em] font-semibold text-white/80 border border-white/20 bg-white/5 backdrop-blur-sm">
                            {item.category}
                          </div>
                          <motion.div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 border border-white/15 shadow-inner shadow-black/40"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <item.icon className="w-6 h-6 text-white/90" strokeWidth={1.5} />
                          </motion.div>
                        </div>

                        <div className="space-y-3">
                          <motion.h3
                            className="text-3xl font-semibold text-white leading-tight"
                            animate={{
                              opacity: isActive ? 1 : 0.75,
                              y: isActive ? 0 : 8,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            {item.title}
                          </motion.h3>
                          <motion.p
                            className="text-base text-white/70"
                            animate={{
                              opacity: isActive ? 0.95 : 0.55,
                              y: isActive ? 0 : 6,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            {item.hint}
                          </motion.p>
                          <motion.div
                            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50"
                            animate={{ opacity: isActive ? 0.8 : 0.4 }}
                          >
                            <span className="h-px w-8 bg-white/30" />
                            Tap to explore
                          </motion.div>
                        </div>
                      </div>
                    )}

                    {/* Active glow border */}
                    {(isActive || isFocused) && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Reflection */}
                {(isActive || isFocused) && (
                  <div
                    className="coverflow-reflection rounded-2xl"
                    style={{
                      width: cardWidth,
                      background: `linear-gradient(145deg, ${colors.from}, ${colors.to})`,
                      boxShadow: `0 0 50px ${colors.glow}`,
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-8 mt-8">
        <button
          onClick={handlePrev}
          className="nav-button disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          aria-label="Previous item"
          disabled={isFocusMode}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Indicators */}
        <div className="flex items-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`indicator-dot ${
                index === activeIndex ? "indicator-dot-active" : ""
              }`}
              aria-label={`Go to item ${index + 1}`}
              disabled={isFocusMode}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="nav-button disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          aria-label="Next item"
          disabled={isFocusMode}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Item counter */}
      <motion.div
        className="mt-6 text-muted-foreground text-sm font-medium tracking-wider"
        key={activeIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
      </motion.div>
    </div>
  );
};

export default CoverflowCarousel;
