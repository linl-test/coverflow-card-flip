import { useMemo, useState } from "react";
import CoverflowCarousel, {
  type CarouselItem,
  type SkillCategory,
  categoryStyles,
} from "@/components/CoverflowCarousel";
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

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<SkillCategory>("Reasoning");
  const filteredItems = useMemo(
    () => carouselItems.filter((item) => item.category === activeCategory),
    [activeCategory]
  );
  const categoryDescription =
    categories.find((category) => category.id === activeCategory)?.description ??
    "Explore core agent capabilities.";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
          Agent Skills Explorer
        </h1>
        <p className="text-muted-foreground text-lg">
          Preview capabilities at a glance before diving deeper
        </p>
      </header>

      {/* Category selector */}
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
                  color: isActive ? "white" : "rgba(255,255,255,0.7)",
                  background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                  boxShadow: isActive
                    ? `0 0 0 1px ${colors.accent}, 0 0 25px ${colors.glow}`
                    : "0 0 0 1px rgba(255,255,255,0.1)",
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
      <CoverflowCarousel items={filteredItems} />

      {/* Keyboard hint */}
      <p className="mt-8 text-muted-foreground/50 text-xs tracking-widest uppercase">
        Click cards to inspect skills
      </p>
    </main>
  );
};

export default Index;
