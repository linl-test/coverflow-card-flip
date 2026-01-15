import { useState, useCallback, useEffect, useMemo, useRef, type CSSProperties, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  Tag,
  CheckCircle2,
  Eye,
  Clock,
  BadgeCheck,
  Star,
  Gauge,
  BookmarkPlus,
  Heart,
  Github,
  type LucideIcon,
} from "lucide-react";
import JSZip from "jszip";

export interface CarouselItem {
  id: number;
  title: string;
  hint: string;
  category: SkillCategory;
  icon: LucideIcon;
  media?: string;
  level?: string;
  duration?: string;
  rating?: number;
  certificate?: string;
  instructor?: string;
  githubUrl?: string;
  tags?: string[];
  about?: string;
  author?: string;
  role?: string;
  categoryTag?: string;
  descriptionSection?: string;
  whenToUseSection?: string;
  successSignalsSection?: string;
}

interface CoverflowCarouselProps {
  items: CarouselItem[];
  isSearchMode?: boolean;
  variant?: CardVariant;
}

export type SkillCategory =
  | "Reasoning"
  | "Action"
  | "Memory"
  | "Evaluation"
  | "Safety";

export type CardVariant = "explore" | "content";

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

const categoryMedia: Record<SkillCategory, { src: string; alt: string }> = {
  Reasoning: {
    src: "https://images.unsplash.com/photo-1521737604893-ff0c1df1fd1c?auto=format&fit=crop&w=1200&q=80",
    alt: "Team collaborating with sticky notes",
  },
  Action: {
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    alt: "Hands on a laptop and notebook",
  },
  Memory: {
    src: "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=1200&q=80",
    alt: "Organized notes on a desk",
  },
  Evaluation: {
    src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    alt: "Design checklist and paper cards",
  },
  Safety: {
    src: "https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=1200&q=80",
    alt: "Secure lock on a dark background",
  },
};

const defaultMeta = {
  level: "Intermediate",
  duration: "12 min",
  rating: 4.8,
  certificate: "Skill badge",
  instructor: "Claude Coach",
};

const renderMarkdownBlock = (text?: string) => {
  if (!text) return null;
  const lines = text.split(/\r?\n/).filter(Boolean);
  const listItems = lines.filter((line) => /^[-*]\s+/.test(line.trim()));
  if (listItems.length > 0) {
    return (
      <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
        {listItems.map((line, idx) => (
          <li key={idx}>{line.replace(/^[-*]\s+/, "").trim()}</li>
        ))}
      </ul>
    );
  }
  return (
    <div className="space-y-2 text-sm text-slate-700">
      {text.split(/\n{2,}/).map((para, idx) => (
        <p key={idx} className="leading-relaxed">
          {para.trim()}
        </p>
      ))}
    </div>
  );
};

const BASE_CARD_WIDTH = 320;
const FOCUSED_CARD_WIDTH = BASE_CARD_WIDTH * 2;
const CONTENT_BASE_CARD_WIDTH = 360;
const CONTENT_FOCUSED_CARD_WIDTH = 680;
const LIKE_STORAGE_KEY = "coverflow-liked-skills";

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

const CoverflowCarousel = ({
  items,
  isSearchMode = false,
  variant = "explore",
}: CoverflowCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(Math.floor(items.length / 2));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [recentlyFocused, setRecentlyFocused] = useState(false);
  const [likedIds, setLikedIds] = useState<Record<number, boolean>>({});
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
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(LIKE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<number, boolean>;
        setLikedIds(parsed);
      }
    } catch {
      // ignore invalid storage
    }
  }, []);

  const toggleLike = useCallback((id: number) => {
    setLikedIds((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore write errors
        }
      }
      return next;
    });
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
    setActiveIndex((prev) => {
      if (variant === "content") {
        return prev === 0 ? prev : prev - 1;
      }
      return prev === 0 ? items.length - 1 : prev - 1;
    });
  }, [focusedIndex, items.length, variant]);

  const handleNext = useCallback(() => {
    if (focusedIndex !== null) return;
    setActiveIndex((prev) => {
      if (variant === "content") {
        return prev === items.length - 1 ? prev : prev + 1;
      }
      return prev === items.length - 1 ? 0 : prev + 1;
    });
  }, [focusedIndex, items.length, variant]);

  const isFocusMode = focusedIndex !== null;
  const focusIndex = focusedIndex ?? activeIndex;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFocusedIndex(null);
        setActiveIndex(lastActiveBeforeFocus.current);
      }
      if (variant === "content" && focusedIndex === null) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          handlePrev();
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, handleNext, handlePrev, variant]);

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

  const parseGithubInfo = (githubUrl?: string): { owner: string; repo: string; branch: string; subpath?: string } | null => {
    if (!githubUrl) return null;
    try {
      const url = new URL(githubUrl);
      if (url.hostname !== "github.com") return null;
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length < 2) return null;
      const [owner, repo, third, branchOrPath, ...rest] = parts;
      let branch = "main";
      let subpath: string | undefined;
      if (third === "tree" && branchOrPath) {
        branch = branchOrPath;
        subpath = rest.join("/");
      }
      return { owner, repo, branch, subpath };
    } catch (error) {
      console.error("Invalid GitHub URL", error);
      return null;
    }
  };

  const downloadSubfolderAsZip = async (info: { owner: string; repo: string; branch: string; subpath?: string }) => {
    if (!info.subpath) return null;
    const zip = new JSZip();
    const basePrefix = info.subpath.replace(/\/$/, "");
    const treeUrl = `https://api.github.com/repos/${info.owner}/${info.repo}/git/trees/${info.branch}?recursive=1`;
    const treeRes = await fetch(treeUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "skills-cards",
      },
    });
    if (!treeRes.ok) {
      throw new Error(`Failed to list repository tree: ${treeRes.status} ${treeRes.statusText}`);
    }
    const treeJson: { tree?: Array<{ path: string; type: string }> } = await treeRes.json();
    const entries = (treeJson.tree || []).filter(
      (node) => node.type === "blob" && node.path && (node.path === basePrefix || node.path.startsWith(`${basePrefix}/`))
    );
    if (entries.length === 0) {
      throw new Error("No files found in the requested subpath");
    }

    for (const node of entries) {
      const filePath = node.path;
      const rawUrl = `https://raw.githubusercontent.com/${info.owner}/${info.repo}/${info.branch}/${filePath}`;
      const fileRes = await fetch(rawUrl);
      if (!fileRes.ok) continue;
      const data = await fileRes.arrayBuffer();
      const relative = filePath.slice(basePrefix.length).replace(/^\//, "");
      zip.file(relative, data);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    const folderName = basePrefix.split("/").pop() || "skill";
    link.download = `${folderName}.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
    return true;
  };

  const handleDownloadSkill = useCallback(async (event: MouseEvent, item?: CarouselItem) => {
    event.stopPropagation();
    if (!item || !item.githubUrl) return;
    const info = parseGithubInfo(item.githubUrl);
    if (!info) {
      console.warn("No valid GitHub URL to download for item", item.title);
      return;
    }

    const filename = info.subpath
      ? `${info.subpath.split("/").pop() || info.repo}.zip`
      : `${info.repo}-${info.branch}.zip`;

    if (info.subpath) {
      try {
        const result = await downloadSubfolderAsZip(info);
        if (result) return;
      } catch (error) {
        console.error("Failed to download subfolder zip", error);
        return;
      }
    }

    const zipUrl = `https://codeload.github.com/${info.owner}/${info.repo}/zip/refs/heads/${info.branch}`;
    const link = document.createElement("a");
    link.href = zipUrl;
    link.download = filename;
    link.target = "_self";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

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
        duration: 0.6,
        ease: focusEase,
        opacity: { duration: 0.35, ease: "easeOut" },
      }
    : variant === "content"
      ? {
          duration: 0.32,
          ease: "easeInOut",
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
          height: isSearchMode
            ? variant === "content"
              ? "540px"
              : "520px"
            : variant === "content"
              ? "520px"
              : undefined,
          paddingTop: isSearchMode
            ? variant === "content"
              ? "80px"
              : "120px"
            : undefined,
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
            const baseCardWidth = variant === "content" ? CONTENT_BASE_CARD_WIDTH : BASE_CARD_WIDTH;
            const focusedCardWidth = variant === "content" ? CONTENT_FOCUSED_CARD_WIDTH : FOCUSED_CARD_WIDTH;
            const cardWidth = isFocused ? focusedCardWidth : baseCardWidth;
            const cardHeight = variant === "content"
              ? isFocused
                ? isSearchMode
                  ? 364 // 30% reduction from 520
                  : 378 // 30% reduction from 540
                : 460
              : isFocused
                ? isSearchMode
                  ? 252 // 30% reduction from 360
                  : 280 // 30% reduction from 400
                : 400;
            const accentColor = lightenColor(bg.from, 40);
            const accentSoft = lightenColor(bg.from, 65);
            const media = item.media ?? categoryMedia[item.category].src;
            const mediaAlt = item.media ? `${item.title} preview` : categoryMedia[item.category].alt;
            const isCoworkItem = (item.tags || []).some((tag) => tag.toLowerCase().includes("cowork"));
            const displayTags = item.categoryTag
              ? [item.categoryTag.split("→").slice(-1)[0]?.trim() || item.categoryTag]
              : [];
            const descriptionText = item.descriptionSection || item.about || item.hint;
            const meta = {
              level: item.level ?? defaultMeta.level,
              duration: item.duration ?? defaultMeta.duration,
              rating: item.rating ?? defaultMeta.rating,
              certificate: item.certificate ?? defaultMeta.certificate,
              instructor: item.instructor ?? item.author ?? defaultMeta.instructor,
            };
            const githubUrl = item.githubUrl ?? "https://github.com/anthropics/skills";
            const metaRow = (
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                  <Clock className="w-4 h-4 text-slate-500" />
                  {meta.duration}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                  <Eye className="w-4 h-4 text-slate-500" />
                  10
                </span>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 transition"
                  aria-label="View on GitHub"
                >
                  <Github className="w-4 h-4 text-slate-700" />
                  GitHub
                </a>
              </div>
            );
            const cardClassName = variant === "content"
              ? "content-card"
              : `coverflow-card ${isActive ? "coverflow-card-active" : ""}`;
            const cardShellStyle: CSSProperties = {
              position: "relative",
              zIndex: 10,
              width: cardWidth,
              height: cardHeight,
              marginTop: isSearchMode && isFocused ? 5 : 0,
              marginBottom: isSearchMode && isFocused ? 5 : 0,
              overflowY: isFocused ? "auto" : "hidden",
              overflowX: "hidden",
              pointerEvents: "auto",
            };

            if (variant === "content") {
              cardShellStyle.boxShadow = isFocused
                ? "0 20px 50px rgba(0,0,0,0.16)"
                : "0 12px 30px rgba(0,0,0,0.12)";
              cardShellStyle.background = "#ffffff";
              cardShellStyle.border = "1px solid rgba(15,23,42,0.06)";
              cardShellStyle.borderRadius = "22px";
            }

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
                  isFocusMode
                    ? {}
                    : variant === "content"
                      ? { scale: style.scale * 1.02, z: style.z + 30, y: -6 }
                      : { scale: style.scale * 1.05, z: style.z + 40 }
                }
              >
                <div
                  className={cardClassName}
                  data-coverflow-card
                  style={cardShellStyle}
                >
                  {variant === "content" ? (
                    <div
                      className="flex h-full flex-col bg-white"
                      style={{ backdropFilter: "none" }}
                      aria-label={`Result ${activeIndex + 1} of ${items.length}, ${item.title}`}
                    >
                      <div
                        className="relative w-full overflow-hidden"
                        style={{ height: isFocused ? 240 : 190 }}
                      >
                        <img
                          src={media}
                          alt={mediaAlt}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-transparent" />
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          <span className="px-3 py-1 text-[11px] uppercase tracking-[0.22em] font-semibold text-white bg-black/50 rounded-full shadow-sm">
                            {item.category}
                          </span>
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.accent }} />
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleLike(item.id);
                          }}
                          className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-white transition"
                          aria-label={likedIds[item.id] ? "Unlike" : "Like"}
                        >
                          <Heart
                            className={`w-4 h-4 ${likedIds[item.id] ? "fill-red-500 text-red-500" : ""}`}
                          />
                          {likedIds[item.id] ? "Liked" : "Like"}
                        </button>
                      </div>

                      <div className="flex-1 flex flex-col gap-4 px-6 py-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2 w-full">
                            {isCoworkItem && !isFocused ? (
                              <div className="flex-1 flex flex-col gap-3">
                                <h3 className="text-xl font-semibold text-slate-900 leading-tight">
                                  {item.title.replace(/-/g, " ").replace(/\s+/g, " ").trim()}
                                </h3>
                                <div className="space-y-1">
                                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
                                    {descriptionText}
                                  </p>
                                </div>
                                {displayTags.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {displayTags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                <h3 className="text-xl font-semibold text-slate-900 leading-tight">
                                  {item.title.replace(/-/g, " ").replace(/\s+/g, " ").trim()}
                                </h3>
                                <p className={`text-sm text-slate-600 ${isFocused ? "" : "line-clamp-3"}`}>
                                  {descriptionText}
                                </p>
                                {displayTags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {displayTags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                          {isFocused && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleLike(item.id);
                              }}
                              className="shrink-0 inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-white transition"
                              aria-label={likedIds[item.id] ? "Unlike" : "Like"}
                            >
                              <Heart
                                className={`w-4 h-4 ${likedIds[item.id] ? "fill-red-500 text-red-500" : ""}`}
                              />
                              {likedIds[item.id] ? "Liked" : "Like"}
                            </button>
                          )}
                        </div>

                        {!isFocused && !isCoworkItem && (
                          <>
                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                              <span>{meta.duration}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {["Motion basics", "Slack readiness"].map((label) => (
                                <span
                                  key={label}
                                  className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          </>
                        )}

                        {isFocused && (
                          <>
                            {metaRow}
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                    <Info className="w-4 h-4" style={{ color: colors.accent }} />
                                    <span>When to Use This Skill</span>
                                  </div>
                                  <div className="mt-3">
                                    {renderMarkdownBlock(item.whenToUseSection || item.about || descriptionText)}
                                  </div>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                    <CheckCircle2 className="w-4 h-4" style={{ color: colors.accent }} />
                                    <span>Success signals</span>
                                  </div>
                                  <div className="mt-3">
                                    {renderMarkdownBlock(item.successSignalsSection)}
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                  <Tag className="w-4 h-4" style={{ color: colors.accent }} />
                                  <span>Topics covered</span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {["Motion basics", "Slack readiness", "Quality checks", "Export settings"].map((label) => (
                                    <span
                                      key={label}
                                      className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700"
                                    >
                                      {label}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/60">
                        <div className="flex items-center gap-3 text-sm text-slate-700">
                          <div className="h-10 w-10 rounded-full bg-slate-200 text-slate-800 font-semibold flex items-center justify-center">
                            {item.title.slice(0, 1)}
                          </div>
                          <div className="leading-tight">
                            <p className="font-semibold text-slate-900">{meta.instructor}</p>
                          </div>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          {!isFocused && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
                              <Clock className="w-4 h-4 text-slate-500" />
                              {meta.duration}
                            </span>
                          )}
                          {isFocused && (
                            <>
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-semibold shadow-[0_12px_24px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(0,0,0,0.22)]"
                              >
                                <BadgeCheck className="w-4 h-4" />
                                Set up skill
                              </button>
                              <button
                                type="button"
                              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 shadow-sm transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                              data-coverflow-download
                              onClick={(e) => handleDownloadSkill(e, item)}
                              disabled={!item.githubUrl}
                            >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  ) : (
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
                    } as CSSProperties}
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
                          } as CSSProperties}
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
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full text-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                              data-coverflow-download
                              onClickCapture={(event) => {
                                if (!import.meta.env.DEV) return;
                                console.log("[Coverflow] Download button capture", {
                                  target: (event.target as HTMLElement)?.tagName,
                                  pointerEvents: getComputedStyle(event.currentTarget).pointerEvents,
                                });
                              }}
                              onClick={(event) => handleDownloadSkill(event, item)}
                              disabled={!item.githubUrl}
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
                  )}
                </div>

                {/* Reflection */}
                {variant === "explore" && (isActive || isFocused) && (
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

        {variant === "content" && (
          <div
            className={`pointer-events-none absolute inset-0 flex justify-between px-4 md:px-10 ${
              isSearchMode ? "items-end pb-8" : "items-center"
            }`}
          >
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFocusMode || activeIndex === 0}
              aria-label="Previous result"
              className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-slate-200 h-12 w-12 text-slate-700 transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.16)] disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isFocusMode || activeIndex === items.length - 1}
              aria-label="Next result"
              className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-slate-200 h-12 w-12 text-slate-700 transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.16)] disabled:opacity-40 disabled:translate-y-0 disabled:shadow-none"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
    </div>

      {variant === "content" && items.length > 0 && (
        <div className="mt-6 w-full max-w-3xl mx-auto text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Result {activeIndex + 1} of {items.length}
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-slate-900 transition-all duration-300"
              style={{ width: `${((activeIndex + 1) / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {variant !== "content" && (
        <>
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
        </>
      )}
    </div>
  );
};

export default CoverflowCarousel;
