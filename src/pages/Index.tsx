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
  { id: "Reasoning", label: "Reasoning", description: "Skills that plan, decompose, and make sense of problems" },
  { id: "Action", label: "Action", description: "Skills that let an agent interact with tools and environments" },
  { id: "Memory", label: "Memory", description: "Skills that retain and retrieve state across sessions" },
  { id: "Evaluation", label: "Evaluation", description: "Skills that check, critique, and self-correct" },
  { id: "Safety", label: "Safety", description: "Skills that guard, veto, and constrain risky behavior" },
];

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    title: "Planning",
    hint: "Breaks goals into crisp steps",
    category: "Reasoning",
    icon: Brain,
  },
  {
    id: 2,
    title: "Tool Use",
    hint: "Chooses and chains the right tools",
    category: "Action",
    icon: Workflow,
  },
  {
    id: 3,
    title: "Self-Correction",
    hint: "Finds and fixes issues before they ship",
    category: "Evaluation",
    icon: RefreshCcw,
  },
  {
    id: 4,
    title: "Long-Context Memory",
    hint: "Maintains state across long sessions",
    category: "Memory",
    icon: Orbit,
  },
  {
    id: 5,
    title: "Safety Layer",
    hint: "Guards and vetoes risky actions",
    category: "Safety",
    icon: ShieldCheck,
  },
  {
    id: 6,
    title: "Insight Summaries",
    hint: "Distills signals into tight briefs",
    category: "Reasoning",
    icon: Sparkles,
  },
  {
    id: 7,
    title: "Orchestration",
    hint: "Coordinates agents, tools, and timing",
    category: "Action",
    icon: PanelsTopLeft,
  },
  {
    id: 8,
    title: "Scenario Mapping",
    hint: "Maps outcomes across branches",
    category: "Reasoning",
    icon: Map,
  },
  {
    id: 9,
    title: "Constraint Solver",
    hint: "Keeps constraints intact across steps",
    category: "Reasoning",
    icon: SlidersHorizontal,
  },
  {
    id: 10,
    title: "API Chaining",
    hint: "Routes outputs to the right tools",
    category: "Action",
    icon: Link2,
  },
  {
    id: 11,
    title: "Environment Control",
    hint: "Executes commands with safeguards",
    category: "Action",
    icon: Terminal,
  },
  {
    id: 12,
    title: "Session Recall",
    hint: "Recovers decisions and rationale",
    category: "Memory",
    icon: Clock,
  },
  {
    id: 13,
    title: "Workspace State",
    hint: "Tracks files, tasks, and notes",
    category: "Memory",
    icon: Archive,
  },
  {
    id: 14,
    title: "Test Generation",
    hint: "Creates checks before shipping",
    category: "Evaluation",
    icon: ClipboardCheck,
  },
  {
    id: 15,
    title: "Risk Scanning",
    hint: "Flags regressions and anomalies",
    category: "Evaluation",
    icon: ShieldAlert,
  },
  {
    id: 16,
    title: "Policy Guard",
    hint: "Enforces policies before execution",
    category: "Safety",
    icon: Shield,
  },
  {
    id: 17,
    title: "Approval Gate",
    hint: "Requests consent on sensitive acts",
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
