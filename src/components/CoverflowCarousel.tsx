import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";

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
    if (focusedIndex === index) {
      setFocusedIndex(null);
      setActiveIndex(lastActiveBeforeFocus.current);
      return;
    }

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
      <div className="absolute inset-0 overflow-hidden">
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
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
                  cursor: isFocused ? "zoom-out" : "zoom-in",
                }}
                onClick={() => handleCardClick(index)}
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
                  style={{ width: cardWidth }}
                >
                  <div
                    className="relative w-full h-full overflow-hidden"
                    style={{
                      background: `linear-gradient(145deg, ${colors.from}, ${colors.to})`,
                    }}
                  >
                    {/* Soft glow edge */}
                    <div
                      className="absolute inset-0 opacity-60"
                      style={{
                        boxShadow: `inset 0 0 60px rgba(255,255,255,0.05), 0 0 70px ${colors.glow}`,
                      }}
                    />

                    {/* Subtle grid */}
                    <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_1px_1px,_#fff_1px,_transparent_0)] [background-size:24px_24px]" />

                    {/* Top chrome */}
                    <div className="absolute inset-x-0 top-0 h-24 bg-white/5 blur-3xl" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-between p-6">
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

                    {/* Focused content reveal */}
                    <AnimatePresence>
                      {isFocused && (
                        <motion.div
                          className="absolute inset-x-0 top-0 p-6 flex flex-col gap-3"
                          initial={{ opacity: 0, y: -12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{
                            duration: 0.35,
                            ease: focusEase,
                            delay: 0.12,
                          }}
                        >
                          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
                            Skill Spotlight
                          </div>
                          <p className="text-sm text-white/80 leading-relaxed max-w-[260px]">
                            {item.hint}. Designed to stay legible in motion and invite deeper inspection before run time.
                          </p>
                          <div className="flex items-center gap-2">
                            <button className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold shadow-lg shadow-black/30 hover:scale-105 transition-transform">
                              Inspect skill
                            </button>
                            <button className="px-4 py-2 rounded-full border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                              Add to palette
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

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
