import { Fragment, useEffect, useMemo, useState } from "react";
import CoverflowCarousel, {
  type CarouselItem,
  type SkillCategory,
  categoryStyles,
} from "@/components/CoverflowCarousel";
import RotatingText from "@/components/RotatingText";
import FloatingSearchBar from "@/components/FloatingSearchBar";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  Workflow,
  RefreshCcw,
  Orbit,
  ShieldCheck,
  Sparkles,
  PanelsTopLeft,
  Map,
  SlidersHorizontal,
  Link2,
  Terminal,
  Clock,
  Archive,
  ClipboardCheck,
  ShieldAlert,
  Shield,
  BadgeCheck,
  Search,
  X,
} from "lucide-react";

const categories: { id: SkillCategory; label: string; description: string }[] = [
  { id: "Reasoning", label: "Reasoning", description: "Concepts and patterns for designing smooth, polished animations" },
  { id: "Action", label: "Action", description: "Hands-on tools and workflows to build and export GIFs" },
  { id: "Memory", label: "Memory", description: "Quick reference cards for Slack constraints and reusable recipes" },
  { id: "Evaluation", label: "Evaluation", description: "Validation and optimization checks to keep GIFs Slack-ready" },
  { id: "Safety", label: "Safety", description: "Hard guardrails: dimensions, FPS, duration, and color limits" },
];

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    title: "Slack GIF Creator",
    hint: "Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like 'make me a GIF of X doing Y for Slack.'",
    category: "Reasoning",
    icon: Brain,
  },
  {
    id: 2,
    title: "Core Workflow",
    hint: "Generate frames, add to GIFBuilder, then save with Slack-friendly defaults",
    category: "Action",
    icon: Workflow,
  },
  {
    id: 3,
    title: "Validators",
    hint: "Check if a GIF meets Slack requirements before you upload it",
    category: "Evaluation",
    icon: RefreshCcw,
  },
  {
    id: 4,
    title: "Slack Requirements",
    hint: "Constraints for emoji vs message GIFs: size, FPS, colors, and duration",
    category: "Memory",
    icon: Orbit,
  },
  {
    id: 5,
    title: "FPS & Duration",
    hint: "Use 10–30 FPS (lower is smaller) and keep emoji GIFs under ~3 seconds",
    category: "Safety",
    icon: ShieldCheck,
  },
  {
    id: 6,
    title: "Animation Concepts",
    hint: "Shake, pulse, bounce, spin, fade, slide, zoom, and particle bursts",
    category: "Reasoning",
    icon: Sparkles,
  },
  {
    id: 7,
    title: "Frame Helpers",
    hint: "Convenience utilities for blank frames, gradients, shapes, and text",
    category: "Action",
    icon: PanelsTopLeft,
  },
  {
    id: 8,
    title: "Easing Curves",
    hint: "Use interpolate() easing functions to avoid stiff, linear motion",
    category: "Reasoning",
    icon: Map,
  },
  {
    id: 9,
    title: "Make Graphics Pop",
    hint: "Thicker lines, depth, contrast, and gradients make GIFs feel polished",
    category: "Reasoning",
    icon: SlidersHorizontal,
  },
  {
    id: 10,
    title: "Draw with PIL",
    hint: "Build frames from scratch using ImageDraw primitives (shapes, lines, polygons)",
    category: "Action",
    icon: Link2,
  },
  {
    id: 11,
    title: "Use Uploaded Images",
    hint: "Animate user assets directly, or use them as inspiration for style and color",
    category: "Action",
    icon: Terminal,
  },
  {
    id: 12,
    title: "Dimensions Cheatsheet",
    hint: "Emoji GIFs: 128×128 (recommended) • Message GIFs: 480×480",
    category: "Memory",
    icon: Clock,
  },
  {
    id: 13,
    title: "Reusable Recipes",
    hint: "Grab a motion pattern (shake/pulse/fade) and remix it for new GIFs fast",
    category: "Memory",
    icon: Archive,
  },
  {
    id: 14,
    title: "Optimize File Size",
    hint: "Reduce FPS, colors, duration, or dimensions to hit Slack-friendly sizes",
    category: "Evaluation",
    icon: ClipboardCheck,
  },
  {
    id: 15,
    title: "Quality Checks",
    hint: "Catch banding, choppy motion, and duplicate frames before exporting",
    category: "Evaluation",
    icon: ShieldAlert,
  },
  {
    id: 16,
    title: "Color Limits",
    hint: "Target 48–128 colors; fewer colors usually means a smaller file",
    category: "Safety",
    icon: Shield,
  },
  {
    id: 17,
    title: "Slack-Ready Export",
    hint: "Save optimized output (e.g., 48 colors + remove duplicates) for Slack upload",
    category: "Safety",
    icon: BadgeCheck,
  },
];

const trendingItems: CarouselItem[] = [
  {
    id: 101,
    title: "Slack GIF Creator",
    hint: "Most popular this week! Create animated GIFs optimized for Slack with validation tools and animation concepts.",
    category: "Reasoning",
    icon: Brain,
  },
  {
    id: 102,
    title: "Core Workflow",
    hint: "Trending workflow: Generate frames, add to GIFBuilder, then save with Slack-friendly defaults",
    category: "Action",
    icon: Workflow,
  },
  {
    id: 103,
    title: "Animation Concepts",
    hint: "Hot right now! Shake, pulse, bounce, spin, fade, slide, zoom, and particle bursts",
    category: "Reasoning",
    icon: Sparkles,
  },
  {
    id: 104,
    title: "Easing Curves",
    hint: "Popular technique: Use interpolate() easing functions to avoid stiff, linear motion",
    category: "Reasoning",
    icon: Map,
  },
];

const featuredItems: CarouselItem[] = [
  {
    id: 201,
    title: "Slack GIF Creator",
    hint: "Featured skill: Knowledge and utilities for creating animated GIFs optimized for Slack",
    category: "Reasoning",
    icon: Brain,
  },
  {
    id: 202,
    title: "Validators",
    hint: "Editor's pick: Check if a GIF meets Slack requirements before you upload it",
    category: "Evaluation",
    icon: RefreshCcw,
  },
  {
    id: 203,
    title: "Make Graphics Pop",
    hint: "Featured technique: Thicker lines, depth, contrast, and gradients make GIFs feel polished",
    category: "Reasoning",
    icon: SlidersHorizontal,
  },
  {
    id: 204,
    title: "Optimize File Size",
    hint: "Essential skill: Reduce FPS, colors, duration, or dimensions to hit Slack-friendly sizes",
    category: "Evaluation",
    icon: ClipboardCheck,
  },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SkillCategory>("Reasoning");
  const [activeCollection, setActiveCollection] = useState<"Trending" | "Featured">("Trending");
  const searchActive = showSearchOverlay;
  const searchBarActive = isSearchFocused || showSearchOverlay;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchQuery("");
        setIsSearchFocused(false);
        setShowSearchOverlay(false);
        setSubmittedQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const escapeRegExp = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const pattern = new RegExp(`(${escapeRegExp(query)})`, "ig");
    const parts = text.split(pattern);
    return parts.map((part, idx) =>
      {
        const isMatch = pattern.test(part);
        pattern.lastIndex = 0;
        return isMatch ? (
          <mark key={idx} className="bg-yellow-200/60 text-black px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <Fragment key={idx}>{part}</Fragment>
        );
      }
    );
  };
  
  const collectionItems = useMemo(
    () => activeCollection === "Trending" ? trendingItems : featuredItems,
    [activeCollection]
  );
  
  const filteredItems = useMemo(
    () => carouselItems.filter((item) => item.category === activeCategory),
    [activeCategory]
  );
  const searchableItems = useMemo(() => {
    const map = new globalThis.Map<number, CarouselItem>();
    [...carouselItems, ...trendingItems, ...featuredItems].forEach((item) => {
      map.set(item.id, item);
    });
    return Array.from(map.values());
  }, []);

  const searchResults = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return [];

    return searchableItems.filter((item) => {
      const haystack = `${item.title} ${item.hint} ${item.category}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [searchQuery, searchableItems]);
  const categoryDescription =
    categories.find((category) => category.id === activeCategory)?.description ??
    "Explore core agent capabilities.";

  const handleSearchSubmit = (value: string) => {
    setSearchQuery(value);
    setSubmittedQuery(value);
    const hasQuery = Boolean(value.trim());
    setShowSearchOverlay(hasQuery);
    if (!isSearchFocused) setIsSearchFocused(true);
  };

  const handleQueryChange = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setShowSearchOverlay(false);
      setSubmittedQuery("");
    }
    if (!isSearchFocused) setIsSearchFocused(true);
  };

  useEffect(() => {
    if (!showSearchOverlay) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSearchOverlay(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showSearchOverlay]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-black flex flex-wrap items-center justify-center gap-2">
          <span>Level Up Your</span>
          <RotatingText
            texts={['AI', 'Productivity', 'Writing', 'Business', 'Debugging', 'Design', 'Marketing']}
            mainClassName="px-3 text-white overflow-hidden py-2 rounded-lg inline-flex"
            style={{ backgroundColor: '#DF784E' }}
            staggerFrom="last"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2000}
          />
          <span>Workflow with Claude Skills</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Preview capabilities at a glance before diving deeper
        </p>
      </header>

      {/* First Carousel - Trending/Featured */}
      <div className={`w-full mb-16 transition-all duration-300 ${searchActive ? "scale-[0.99] opacity-95" : ""}`}>
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex items-center gap-2 bg-white/5 border border-black/10 rounded-full px-2 py-2 backdrop-blur-sm">
            <button
              onClick={() => setActiveCollection("Trending")}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                color: activeCollection === "Trending" ? "#000000" : "rgba(0,0,0,0.6)",
                background: activeCollection === "Trending" ? "rgba(0,0,0,0.08)" : "transparent",
                boxShadow: activeCollection === "Trending"
                  ? "0 0 0 1px #DF784E, 0 0 25px rgba(223, 120, 78, 0.3)"
                  : "0 0 0 1px rgba(0,0,0,0.1)",
              }}
            >
              Trending Skills
            </button>
            <button
              onClick={() => setActiveCollection("Featured")}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                color: activeCollection === "Featured" ? "#000000" : "rgba(0,0,0,0.6)",
                background: activeCollection === "Featured" ? "rgba(0,0,0,0.08)" : "transparent",
                boxShadow: activeCollection === "Featured"
                  ? "0 0 0 1px #DF784E, 0 0 25px rgba(223, 120, 78, 0.3)"
                  : "0 0 0 1px rgba(0,0,0,0.1)",
              }}
            >
              Featured Skills
            </button>
          </div>
          <p className="text-sm text-muted-foreground/80">
            {activeCollection === "Trending" ? "Most popular skills this week" : "Editor's picks and essential skills"}
          </p>
        </div>

        <CoverflowCarousel items={collectionItems} isSearchMode={searchActive} />

        {searchActive && !showSearchOverlay && (
          <div className="mt-8 w-full max-w-5xl mx-auto space-y-3">
            {searchQuery.trim().length === 0 ? (
              <div className="space-y-2">
                {[0, 1, 2].map((key) => (
                  <div
                    key={key}
                    className="h-20 rounded-2xl border border-slate-200 bg-white/70 animate-pulse"
                    style={{ animationDelay: `${key * 60}ms` }}
                  />
                ))}
                <p className="text-sm text-slate-500">Searching skills…</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
                No skills match “{searchQuery}”. Try another term or category.
              </div>
            ) : (
              searchResults.map((item) => {
                const colors = categoryStyles[item.category];
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border bg-white/90 p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow"
                    style={{ borderColor: "color-mix(in srgb, " + colors.accent + " 20%, transparent)" }}
                  >
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-inner"
                      style={{
                        background: `linear-gradient(135deg, ${colors.accent}, color-mix(in srgb, ${colors.accent} 45%, white))`,
                        boxShadow: `0 10px 30px color-mix(in srgb, ${colors.accent} 25%, transparent)`,
                      }}
                    >
                      <item.icon className="w-5 h-5" strokeWidth={1.6} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{item.category}</span>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.accent }} />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900 leading-tight">
                        {highlightMatch(item.title, searchQuery)}
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                        {highlightMatch(item.hint, searchQuery)}
                      </p>
                    </div>
                    <button
                      className="text-sm font-semibold px-3 py-2 rounded-lg"
                      style={{
                        color: colors.accent,
                        background: "color-mix(in srgb, " + colors.accent + " 12%, white)",
                      }}
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    >
                      Inspect
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Second Carousel - By Category */}
      <div className="w-full">
        <h2 className="text-2xl font-bold text-black text-center mb-6">Browse by Category</h2>
        
        <div className="flex flex-col items-center gap-3 mb-8">
        <div className="flex flex-wrap items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-full px-2 py-2 backdrop-blur-sm">
          {categories.map((category) => {
            const isActive = category.id === activeCategory;
            const colors = categoryStyles[category.id];
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive ? "#000000" : "rgba(0,0,0,0.6)",
                  background: isActive ? "rgba(0,0,0,0.08)" : "transparent",
                  boxShadow: isActive
                    ? `0 0 0 1px ${colors.accent}, 0 0 25px ${colors.glow}`
                    : "0 0 0 1px rgba(0,0,0,0.1)",
                }}
              >
                {category.label}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground/80">{categoryDescription}</p>
      </div>

      {/* Carousel */}
      <CoverflowCarousel items={filteredItems} isSearchMode={searchActive} />
      </div>

      {/* Keyboard hint */}
      <p className="mt-8 text-muted-foreground/50 text-xs tracking-widest uppercase">
        Click cards to inspect skills
      </p>

      <FloatingSearchBar
        query={searchQuery}
        onQueryChange={(value) => {
          handleQueryChange(value);
        }}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => {
          if (!searchQuery.trim()) setIsSearchFocused(false);
        }}
        onSubmit={handleSearchSubmit}
        isActive={searchBarActive}
        placeholder="Search skills by title, category, or hint…"
      />

      <AnimatePresence>
        {showSearchOverlay && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-10 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="relative w-[90vw] max-w-[1600px] h-[90vh] rounded-3xl bg-white shadow-2xl border border-black/10 overflow-hidden flex flex-col"
              initial={{ scale: 0.97, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.97, y: 16, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-start gap-3 px-6 pt-6 pb-4">
                <div className="p-2 rounded-2xl bg-black/5 border border-black/10">
                  <Search className="w-5 h-5 text-black/70" />
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.28em] text-black/50 mb-1">
                    Search results
                  </p>
                  <h3 className="text-2xl font-semibold text-black leading-tight">
                    {submittedQuery.trim() ? (
                      <>
                        Found {searchResults.length} skill{searchResults.length === 1 ? "" : "s"} for “{submittedQuery.trim()}”
                      </>
                    ) : (
                      "Search the skill library"
                    )}
                  </h3>
                  <p className="text-sm text-black/60">
                    Cards use the same coverflow styling so you can swipe through matches horizontally.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSearchOverlay(false)}
                  className="rounded-full p-2 text-black/60 hover:text-black hover:bg-black/5 transition"
                  aria-label="Close search results"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="border-t border-black/5 bg-slate-50/80 px-2 pb-10 pt-14 flex-1 overflow-hidden flex items-start justify-center">
                {searchResults.length > 0 ? (
                  <CoverflowCarousel items={searchResults} isSearchMode />
                ) : (
                  <div className="w-full max-w-3xl mx-auto py-12 text-center text-black/60">
                    <p className="text-lg font-semibold mb-2">No skills found</p>
                    <p className="text-sm">Try another keyword or category.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Index;
