import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import CoverflowCarousel, {
  type CarouselItem,
  type SkillCategory,
  categoryStyles,
} from "@/components/CoverflowCarousel";
import RotatingText from "@/components/RotatingText";
import FloatingSearchBar from "@/components/FloatingSearchBar";
import { parseSkillFile, slugifySkill, type ParsedSkill } from "@/lib/skillsParser";
import skillsManifest from "@/generated/skillsManifest.json";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  Workflow,
  RefreshCcw,
  Orbit,
  ShieldCheck,
  Sparkles,
  PanelsTopLeft,
  Map as MapIcon,
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
  BookOpen,
  LifeBuoy,
  Sparkle,
} from "lucide-react";

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
    icon: MapIcon,
    media: "/easing-curves.png",
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
    icon: MapIcon,
  },
];

type CollectionType = "Cowork" | "Trending";
const defaultRole = "Software Engineer";
const normalizeTag = (value?: string) =>
  (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [activeCollection, setActiveCollection] = useState<CollectionType>("Trending");
  const [hideSearchBar, setHideSearchBar] = useState(false);
  const [activeRole, setActiveRole] = useState<string>(defaultRole);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [parsedSkills, setParsedSkills] = useState<ParsedSkill[]>(
    Array.isArray(skillsManifest) ? (skillsManifest as ParsedSkill[]) : []
  );
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const searchActive = showSearchOverlay;
  const searchBarActive = isSearchFocused || showSearchOverlay;
  const manifestMediaBySlug = useMemo(() => {
    const map = new Map<string, string>();
    const manifestArray = Array.isArray(skillsManifest) ? (skillsManifest as ParsedSkill[]) : [];
    manifestArray.forEach((skill) => {
      const slug = skill.slug || slugifySkill(skill.title || skill.source || "");
      if (skill.media) {
        map.set(slug, skill.media);
      }
    });
    return map;
  }, []);
  const hasDisplayTag = useCallback((skill: ParsedSkill, keyword: string) => {
    const normalized = normalizeTag(keyword);
    return (skill.displayTags || []).some((tag) => normalizeTag(tag).includes(normalized));
  }, []);
  const mapCategory = useCallback((value?: string): SkillCategory => {
    const normalized = (value || "").toLowerCase();
    if (normalized.includes("action")) return "Action";
    if (normalized.includes("memory") || normalized.includes("reference")) return "Memory";
    if (normalized.includes("eval")) return "Evaluation";
    if (normalized.includes("safety") || normalized.includes("security")) return "Safety";
    return "Reasoning";
  }, []);

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
  
  const mapSkillToCard = useCallback(
    (skill: ParsedSkill, idx: number): CarouselItem => {
      const slug = skill.slug || slugifySkill(skill.title || skill.source || `skill-${idx}`);
      const media = skill.media || manifestMediaBySlug.get(slug);
      return {
        id: 1000 + idx,
        title: skill.title,
        hint: skill.about || skill.description || "No description provided.",
        category: mapCategory(skill.category),
        icon: BookOpen,
        tags: Array.from(new Set([...(skill.tags || []), "coworker"])),
        about: skill.about,
        author: skill.author,
        instructor: skill.author,
        role: skill.role || defaultRole,
        githubUrl: skill.githubUrl,
        categoryTag: skill.categoryTag,
        descriptionSection: skill.descriptionSection,
        whenToUseSection: skill.whenToUseSection,
        successSignalsSection: skill.successSignalsSection,
        media,
      };
    },
    [defaultRole, manifestMediaBySlug, mapCategory]
  );

  const coworkerCards: CarouselItem[] = useMemo(() => {
    const filtered = parsedSkills.filter((skill) => hasDisplayTag(skill, "cowork"));
    return filtered.map(mapSkillToCard);
  }, [hasDisplayTag, mapSkillToCard, parsedSkills]);

  const trendingCards: CarouselItem[] = useMemo(() => {
    const filtered = parsedSkills.filter((skill) => hasDisplayTag(skill, "trending"));
    return filtered.map(mapSkillToCard);
  }, [hasDisplayTag, mapSkillToCard, parsedSkills]);

  const baseCarouselItems = useMemo(() => coworkerCards, [coworkerCards]);

  const coworkTabItems = baseCarouselItems;

  const hasCoworkTab = baseCarouselItems.length > 0;

  const collectionTabs = useMemo(() => {
    const tabs: { key: CollectionType; label: string }[] = [
      { key: "Trending", label: "Trending Skills" },
    ];
    if (hasCoworkTab) {
      tabs.push({ key: "Cowork", label: "Cowork Skills" });
    }
    return tabs;
  }, [hasCoworkTab]);

  const roleTabs = useMemo(() => {
    const unique = new Set<string>();
    baseCarouselItems.forEach((item) => unique.add(item.role || defaultRole));
    return Array.from(unique);
  }, [baseCarouselItems]);

  const collectionDescription = useMemo(() => {
    if (activeCollection === "Trending") return "Most popular skills this week";
    if (activeCollection === "Cowork" && hasCoworkTab) {
      return "Cowork-tagged skills from your library";
    }
    return "Most popular skills this week";
  }, [activeCollection, hasCoworkTab]);

  const collectionItems = useMemo(() => {
    if (activeCollection === "Cowork") return coworkTabItems;
    return trendingCards;
  }, [activeCollection, coworkTabItems, trendingCards]);
  
  const filteredItems = useMemo(() => baseCarouselItems, [baseCarouselItems]);
  const searchableItems = useMemo(() => {
    const map = new globalThis.Map<number, CarouselItem>();
    [...baseCarouselItems, ...trendingCards].forEach((item) => {
      map.set(item.id, item);
    });
    return Array.from(map.values());
  }, [baseCarouselItems, trendingCards]);

  const searchResults = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return [];

    return searchableItems.filter((item) => {
      const haystack = `${item.title} ${item.hint} ${item.category}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [searchQuery, searchableItems]);

  const roleFilteredItems = useMemo(
    () =>
      filteredItems.filter(
        (item) => (item.role || defaultRole) === activeRole
      ),
    [activeRole, filteredItems]
  );
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

  useEffect(() => {
    const footerEl = footerRef.current;
    if (!footerEl || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setHideSearchBar(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(footerEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Already loaded from generated manifest; no dynamic imports from /public.
    setSkillsError(null);
  }, []);

  useEffect(() => {
    if (!hasCoworkTab && activeCollection === "Cowork") {
      setActiveCollection("Trending");
    }
  }, [activeCollection, hasCoworkTab]);

  useEffect(() => {
    if (roleTabs.length && !roleTabs.includes(activeRole)) {
      setActiveRole(roleTabs[0]);
    }
  }, [activeRole, roleTabs]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight text-black flex flex-wrap items-center justify-center gap-2 text-center leading-tight">
          <span>Level Up Your</span>
          <span className="inline-flex -rotate-1 drop-shadow-sm">
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
          </span>
          <span className="w-full text-center">Workflow with Claude skills</span>
        </h1>
        <p className="text-muted-foreground text-xl md:text-2xl">
          Discover powerful skills and understand what they do—fast.
        </p>
      </header>

      {/* First Carousel - Trending/Cowork */}
      <div className={`w-full mb-16 transition-all duration-300 ${searchActive ? "scale-[0.99] opacity-95" : ""}`}>
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex items-center gap-2 bg-white/5 border border-black/10 rounded-full px-2 py-2 backdrop-blur-sm">
            {collectionTabs.map((tab) => {
              const isActive = activeCollection === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveCollection(tab.key)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                  style={{
                    color: isActive ? "#000000" : "rgba(0,0,0,0.6)",
                    background: isActive ? "rgba(0,0,0,0.08)" : "transparent",
                    boxShadow: isActive
                      ? "0 0 0 1px #DF784E, 0 0 25px rgba(223, 120, 78, 0.3)"
                      : "0 0 0 1px rgba(0,0,0,0.1)",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground/80">
            {collectionDescription}
          </p>
        </div>

        <CoverflowCarousel
          items={collectionItems}
          isSearchMode={searchActive}
          variant="content"
        />
        {collectionItems.length === 0 && (
          <p className="text-sm text-muted-foreground/70 text-center mt-4">
            No cards available. Add markdown files in <code>public/skills</code>.
          </p>
        )}

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

      {/* Second Deck - By Role */}
      <div className="w-full">
        <h2 className="text-2xl font-bold text-black text-center mb-6">Browse by Role</h2>
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-full px-2 py-2 backdrop-blur-sm">
            {roleTabs.map((role) => {
              const isActive = role === activeRole;
              return (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                  style={{
                    color: isActive ? "#000000" : "rgba(0,0,0,0.6)",
                    background: isActive ? "rgba(0,0,0,0.08)" : "transparent",
                    boxShadow: isActive
                      ? "0 0 0 1px #DF784E, 0 0 25px rgba(223, 120, 78, 0.3)"
                      : "0 0 0 1px rgba(0,0,0,0.1)",
                  }}
                >
                  {role}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground/80">
            Role-specific skills grouped for quick scanning.
          </p>
        </div>

        <CoverflowCarousel
          items={roleFilteredItems}
          isSearchMode={searchActive}
          variant="content"
        />
        {roleFilteredItems.length === 0 && (
          <p className="text-sm text-muted-foreground/70 text-center mt-4">
            No cards available. Add markdown files in <code>public/skills</code>.
          </p>
        )}
      </div>

      {/* Keyboard hint */}
      <p className="mt-8 text-muted-foreground/50 text-xs tracking-widest uppercase">
        Click cards to inspect skills
      </p>

      {!hideSearchBar && (
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
      )}

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
                  <CoverflowCarousel items={searchResults} isSearchMode variant="content" />
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

      {skillsError && (
        <div className="w-full max-w-4xl mx-auto mt-12 px-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm">
            {skillsError}
          </div>
        </div>
      )}

      {/* Editorial footer */}
      <footer
        ref={footerRef}
        className="w-full mt-16 border-t border-black/5"
        style={{ backgroundColor: "#FBFBF9" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Brand / Value */}
            <div className="space-y-3">
            <div className="inline-flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                <Sparkle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 leading-tight">Claude Skills</p>
                <p className="text-xs text-slate-500">Content-first guidance</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 max-w-md">
              Discover, understand, and deploy the right skill faster. This space keeps you oriented with calm, helpful guidance.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full sm:w-auto flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
              <button className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm hover:-translate-y-0.5 transition">
                Subscribe
              </button>
            </div>
          </div>

          {/* Resources */}
          <div className="rounded-xl border border-black/5 bg-white p-6 shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(0,0,0,0.1)] hover:border-black/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-[#E2E8F0] text-black flex items-center justify-center">
                <BookOpen className="w-5 h-5" strokeWidth={1.6} />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">Resources</p>
                <p className="text-xs text-slate-500 leading-relaxed">Learn and build with confidence</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-700 leading-relaxed">
              <li>• Official Skills Documentation</li>
              <li>• Skill Marketplace</li>
              <li>• How to Create a Skill</li>
            </ul>
            <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:underline">
              View all resources →
            </button>
          </div>

          {/* FAQ */}
          <div className="rounded-xl border border-black/5 bg-white p-6 shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(0,0,0,0.1)] hover:border-black/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-[#E2E8F0] text-black flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" strokeWidth={1.6} />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">Frequently Asked Questions</p>
                <p className="text-xs text-slate-500 leading-relaxed">Answers without the noise</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-700 leading-relaxed">
              <li>• What are skills?</li>
              <li>• Where I can use Skills?</li>
              <li>• Should I create my own Skills?</li>
            </ul>
            {/* <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline">
              Visit Help Center →
            </button> */}
          </div>
        </div>
      </footer>
      <div className="w-full border-t border-black/5" style={{ backgroundColor: "#FBFBF9" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-slate-600">
          <span className="text-sm">© 2026 Automata. All rights reserved.</span>
          <div className="flex items-center gap-3">
            {[{ icon: "twitter" }, { icon: "github" }, { icon: "linkedin" }].map(({ icon }, idx) => (
              <span
                key={idx}
                className="h-10 w-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500"
              >
                {icon === "twitter" && "𝕏"}
                {icon === "github" && ""}
                {icon === "linkedin" && "in"}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-5 text-sm">
            <a className="hover:underline" href="#">
              Privacy Policy
            </a>
            <a className="hover:underline" href="#">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Index;
