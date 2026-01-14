import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Settings,
  Info,
  Tag,
  CheckCircle2,
  Eye,
  Clock,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

export interface CarouselItem {
  id: number;
  title: string;
  hint: string;
  category: SkillCategory;
  icon: LucideIcon;
}

interface CoverflowCarouselProps {
  items: CarouselItem[];
  isSearchMode?: boolean;
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

const cardBackgroundPalette = [
  { from: "#e46f67", to: "#d96560" }, // coral
  { from: "#6b72c6", to: "#6269b8" }, // indigo
  { from: "#99b2ff", to: "#8ea7ff" }, // sky
  { from: "#b676f5", to: "#f3a0c2" }, // purple → pink
  { from: "#5ea7a9", to: "#569ea1" }, // teal
  { from: "#333333", to: "#2b2b2b" }, // graphite
] as const;

const PREVIEW_BG_LIGHTEN = 45;
const FOCUS_BG_LIGHTEN = 88;

const CoverflowCarousel = ({ items, isSearchMode = false }: CoverflowCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(Math.floor(items.length / 2));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [recentlyFocused, setRecentlyFocused] = useState(false);
  const lastActiveBeforeFocus = useRef(activeIndex);
  const focusEase = useMemo(() => [0.16, 1, 0.3, 1] as const, []);

  const lightenColor = (color: string, amount: number) => {
    const hex = color.replace("#", "").trim();
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return color;

    const mixAmount = Math.min(1, Math.max(0, amount / 100));
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);

    const mixedR = Math.round(r + (255 - r) * mixAmount);
    const mixedG = Math.round(g + (255 - g) * mixAmount);
    const mixedB = Math.round(b + (255 - b) * mixAmount);

    return `rgb(${mixedR}, ${mixedG}, ${mixedB})`;
  };

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
        opacity: 1,
        x: isFocused ? 0 : diff * 140,
        z: isFocused ? 500 : -400,
        rotateY: isFocused ? 0 : diff < 0 ? 30 : -30,
        scale: isFocused ? 1.15 : 0.8,
        zIndex: isFocused ? 50 : 5 - Math.abs(diff),
        pointerEvents: isFocused ? "auto" as const : "none" as const,
      };
    }

    if (isSearchMode) {
      const diff = index - activeIndex;
      const absDiff = Math.abs(diff);
      return {
        opacity: 1,
        x: diff * 140,
        z: -60 * absDiff,
        rotateY: 0,
        scale: 0.92 - absDiff * 0.02,
        zIndex: 10 - absDiff,
        pointerEvents: "auto" as const,
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
      opacity: 1,
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
            background: "radial-gradient(ellipse, rgba(0,0,0,0.035), transparent 70%)",
          }}
          animate={{
            scale: [1, 1.04, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Carousel container */}
      <div
        className="coverflow-container relative w-full h-[450px] flex items-center justify-center"
        style={{
          zIndex: isFocusMode ? 9999 : undefined,
          filter: isSearchMode ? "saturate(0.9)" : undefined,
          transform: isSearchMode ? "translateY(0px)" : undefined,
          height: isSearchMode ? "520px" : undefined,
          paddingTop: isSearchMode ? "120px" : undefined,
        }}
      >
        <AnimatePresence>
          {isFocusMode && (
            <motion.div
              className="absolute inset-0 bg-white/60 backdrop-blur-md"
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
            const bg = cardBackgroundPalette[(item.id - 1) % cardBackgroundPalette.length];
            const previewFrom = lightenColor(bg.from, PREVIEW_BG_LIGHTEN);
          const previewTo = lightenColor(bg.to, PREVIEW_BG_LIGHTEN);
          const focusFrom = lightenColor(bg.from, FOCUS_BG_LIGHTEN);
          const focusTo = lightenColor(bg.to, FOCUS_BG_LIGHTEN);
          const cardWidth = isFocused ? FOCUSED_CARD_WIDTH : BASE_CARD_WIDTH;
          const cardHeight = isFocused
            ? isSearchMode
              ? 360
              : 400
            : 400;
          const accentColor = lightenColor(bg.from, 40);
          const accentSoft = lightenColor(bg.from, 65);

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
                  className={`coverflow-card ${
                    isActive ? "coverflow-card-active" : ""
                  }`}
                  data-coverflow-card
                  style={{
                    position: "relative",
                    zIndex: 10,
                    width: cardWidth,
                    height: cardHeight,
                    marginTop: isSearchMode && isFocused ? 5 : 0,
                    marginBottom: isSearchMode && isFocused ? 5 : 0,
                    overflowY: isFocused ? "auto" : "hidden",
                    overflowX: "hidden",
                    pointerEvents: "auto",
                  }}
                >
                  <motion.div
                    className="coverflow-card-surface"
                    data-card-num={String(item.id).padStart(2, "0")}
                    animate={{
                      ["--coverflow-card-from" as any]: isFocused 
                        ? focusFrom
                        : previewFrom,
                      ["--coverflow-card-to" as any]: isFocused 
                        ? focusTo
                        : previewTo,
                    }}
                    transition={{
                      duration: 1.35,
                      ease: focusEase,
                    }}
                    style={{
                      pointerEvents: "auto",
                      ["--coverflow-card-from" as any]: previewFrom,
                      ["--coverflow-card-to" as any]: previewTo,
                    } as React.CSSProperties}
                  >
                    {/* Soft glow edge */}
                    <div
                      className="absolute inset-0 opacity-60 pointer-events-none"
                      style={{
                        boxShadow: `inset 0 0 60px rgba(255,255,255,0.05), 0 0 70px ${colors.glow}`,
                      }}
                    />

                    {/* Dashed divider */}
                    <div className="absolute left-8 right-8 top-[38%] border-t border-dashed border-white/40 opacity-60 pointer-events-none" />

                    {/* Corner squares */}
                    <div
                      className="absolute top-5 right-5 w-3 h-3 bg-white/20 rounded-sm opacity-80 pointer-events-none"
                      style={{ boxShadow: "-18px 0 0 rgba(255,255,255,0.2)" }}
                    />

                    {/* Content */}
                    {isFocused ? (
                      <motion.div
                        className="relative flex flex-col gap-10 p-6 pb-12"
                        animate={{
                          ["--text-color" as any]: "#0f172a",
                        }}
                        transition={{
                          duration: 0.7,
                          ease: focusEase,
                        }}
                        style={{ 
                          zIndex: 20, 
                          pointerEvents: "auto",
                          ["--text-color" as any]: "#0f172a",
                        } as React.CSSProperties}
                      >
                        {/* Top bar */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                              {item.category}
                            </p>
                            <h3 className="text-3xl font-semibold leading-tight text-slate-900">
                              {item.title}
                            </h3>
                            <p className="text-base leading-relaxed text-slate-600">
                              {item.hint}
                            </p>
                            <div className="pt-2 border-t border-slate-200">
                              <div className="flex items-center text-sm text-slate-500 gap-5">
                                <span className="inline-flex items-center gap-2">
                                  <Download className="w-4 h-4" style={{ color: accentSoft }} />
                                  <span>0</span>
                                </span>
                                <span className="inline-flex items-center gap-2">
                                  <Eye className="w-4 h-4" style={{ color: accentSoft }} />
                                  <span>5</span>
                                </span>
                                <span className="inline-flex items-center gap-2">
                                  <Clock className="w-4 h-4" style={{ color: accentSoft }} />
                                  <span>Nov 24, 2025</span>
                                </span>
                                <span className="inline-flex items-center gap-2 ml-auto text-slate-900">
                                  <BadgeCheck className="w-4 h-4" style={{ color: accentColor }} />
                                  <span>by iAmAttila</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setFocusedIndex(null);
                              setActiveIndex(lastActiveBeforeFocus.current);
                            }}
                            className="shrink-0 p-2 text-slate-500 hover:text-slate-700 transition"
                            aria-label="Close"
                          >
                            <item.icon className="w-5 h-5" style={{ color: accentColor }} strokeWidth={1.6} />
                          </button>
                        </div>

                        {/* About section */}
                        <section className="space-y-3 bg-white/70 border border-white/60 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 text-slate-800 font-semibold">
                            <Info className="w-5 h-5" style={{ color: accentColor }} />
                            <span>About this skill</span>
                          </div>
                          <div className="space-y-3 text-sm leading-relaxed text-slate-700">
                            <p>
                              Direct response skills help you craft messages that drive immediate action—whether that’s a click, a lead, or a sale. Each element is built to earn attention, build desire, and make the decision simple.
                            </p>
                            <p>
                              Use these cards as a quick refresher on proven frameworks, headline patterns, and persuasive structure so you can move fast without sacrificing clarity or conversion.
                            </p>
                          </div>
                        </section>

                        {/* Categories */}
                        <section className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-800 font-semibold">
                            <Tag className="w-5 h-5" style={{ color: accentColor }} />
                            <span>Categories</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {["Writing & Content", "Copywriting & Marketing", "Sales Strategy"].map((label) => (
                              <span
                                key={label}
                                className="px-3 py-1 rounded-full bg-white/70 border text-sm font-medium text-slate-700"
                                style={{ borderColor: accentSoft }}
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        </section>

                        {/* What you'll learn */}
                        <section className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-800 font-semibold">
                            <CheckCircle2 className="w-5 h-5" style={{ color: accentColor }} />
                            <span>What you’ll learn</span>
                          </div>
                          <ul className="space-y-2 text-sm text-slate-700">
                            {[
                              "Crafting headlines with stronger click-through rates.",
                              "Understanding psychology and decision-making biases.",
                              "Structuring persuasive flows that keep readers engaged.",
                            ].map((text, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span
                                  className="mt-1 h-2 w-2 rounded-full"
                                  style={{ backgroundColor: accentColor }}
                                />
                                <span>{text}</span>
                              </li>
                            ))}
                          </ul>
                        </section>

                        {/* Footer actions */}
                        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setFocusedIndex(null);
                              setActiveIndex(lastActiveBeforeFocus.current);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Back to browsing
                          </button>
                          <div className="ml-auto flex items-center gap-2">
                            <button
                              type="button"
                              className="px-4 py-2 rounded-full text-white text-sm font-semibold shadow-sm transition"
                              style={{
                                backgroundColor: accentColor,
                                boxShadow: `0 10px 30px ${accentColor}30`,
                              }}
                              onClick={(event) => event.stopPropagation()}
                            >
                              Set up Skill
                            </button>
                            <button
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full text-white shadow-sm transition"
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
                              style={{
                                backgroundColor: accentColor,
                                boxShadow: `0 10px 30px ${accentColor}30`,
                              }}
                            >
                              <Download className="w-4 h-4" strokeWidth={1.5} />
                              <span>Download Skill</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
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
                  </motion.div>
                </div>

                {/* Reflection */}
                {(isActive || isFocused) && (
                  <div
                    className="coverflow-reflection rounded-2xl"
                    style={{
                      width: cardWidth,
                      background: `linear-gradient(180deg, ${
                        isFocused ? focusFrom : previewFrom
                      }, ${isFocused ? focusTo : previewTo})`,
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
