export interface ParsedSkill {
  title: string;
  description: string;
  tags: string[];
  slug?: string;
  displayTags?: string[];
  media?: string;
  category?: string;
  body?: string;
  source?: string;
  author?: string;
  about?: string;
  role?: string;
  githubUrl?: string;
  updated?: string;
  categoryTag?: string;
  descriptionSection?: string;
  whenToUseSection?: string;
  successSignalsSection?: string;
}

export const slugifySkill = (value: string) =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-+/g, "-");

const cleanText = (value: string) => value.trim().replace(/^\*\s*/, "").trim();

const TAG_KEYWORDS: { tag: string; keywords: string[] }[] = [
  {
    tag: "Programming & software development",
    keywords: ["code", "coding", "software", "develop", "application", "api", "react", "node", "typescript", "javascript", "deploy"],
  },
  {
    tag: "Data analysis & engineering",
    keywords: ["data", "sql", "dataset", "analytics", "analysis", "metrics", "pipeline", "etl", "insight", "statistics"],
  },
  {
    tag: "IT, cloud, cybersecurity",
    keywords: ["cloud", "security", "cyber", "infra", "infrastructure", "aws", "gcp", "azure", "kubernetes", "devops"],
  },
  {
    tag: "Engineering & system design",
    keywords: ["architecture", "system", "design", "scalable", "microservice", "schema", "workflow"],
  },
  {
    tag: "Critical thinking",
    keywords: ["evaluate", "analysis", "assess", "reason", "critique", "diagnose"],
  },
  {
    tag: "Problem solving",
    keywords: ["solve", "fix", "debug", "issue", "problem", "resolution"],
  },
  {
    tag: "Logical reasoning",
    keywords: ["logic", "reason", "step-by-step", "structured"],
  },
  {
    tag: "Decision making",
    keywords: ["decide", "choose", "select", "recommendation", "prioritize"],
  },
  {
    tag: "Written communication",
    keywords: ["write", "email", "document", "docs", "report", "copy", "content"],
  },
  {
    tag: "Verbal communication",
    keywords: ["speech", "talk", "call", "meeting", "present"],
  },
  {
    tag: "Presentation & storytelling",
    keywords: ["presentation", "story", "deck", "slide", "narrative"],
  },
  {
    tag: "Active listening",
    keywords: ["listening", "listen", "understand", "feedback"],
  },
  {
    tag: "Collaboration & teamwork",
    keywords: ["collaborate", "team", "together", "partner", "cowork"],
  },
  {
    tag: "Conflict resolution",
    keywords: ["conflict", "disagree", "escalation", "resolve"],
  },
  {
    tag: "Empathy & emotional intelligence",
    keywords: ["empathy", "emotional", "feelings", "tone"],
  },
  {
    tag: "Stakeholder management",
    keywords: ["stakeholder", "alignment", "exec", "leader", "approval"],
  },
  {
    tag: "People management",
    keywords: ["manage", "manager", "team lead", "leadership", "direct report"],
  },
  {
    tag: "Strategic thinking",
    keywords: ["strategy", "roadmap", "planning", "north star", "vision"],
  },
  {
    tag: "Coaching & mentoring",
    keywords: ["coach", "mentor", "guidance", "training"],
  },
  {
    tag: "Decision ownership",
    keywords: ["ownership", "accountable", "responsible"],
  },
  {
    tag: "Creative thinking",
    keywords: ["creative", "brainstorm", "ideate", "idea", "concept"],
  },
  {
    tag: "Ideation",
    keywords: ["idea", "brainstorm", "concept", "explore"],
  },
  {
    tag: "Design thinking",
    keywords: ["prototype", "design", "user", "research"],
  },
  {
    tag: "Experimentation",
    keywords: ["experiment", "hypothesis", "test", "a/b"],
  },
  {
    tag: "Time management",
    keywords: ["deadline", "schedule", "time", "calendar"],
  },
  {
    tag: "Prioritization",
    keywords: ["priority", "prioritize", "importance", "ranking"],
  },
  {
    tag: "Planning & coordination",
    keywords: ["plan", "coordination", "project", "timeline"],
  },
  {
    tag: "Attention to detail",
    keywords: ["detail", "accuracy", "review", "checklist"],
  },
  {
    tag: "Business strategy",
    keywords: ["business", "market", "strategy", "growth", "pricing"],
  },
  {
    tag: "Financial literacy",
    keywords: ["finance", "budget", "roi", "cost", "profit"],
  },
  {
    tag: "Marketing & sales",
    keywords: ["marketing", "campaign", "sales", "customer", "prospect"],
  },
  {
    tag: "Negotiation",
    keywords: ["negotiate", "deal", "contract", "terms"],
  },
  {
    tag: "Learning agility",
    keywords: ["learn", "learning", "study", "quickly", "upskill"],
  },
  {
    tag: "Adaptability",
    keywords: ["adapt", "flexible", "change", "shift"],
  },
  {
    tag: "Curiosity",
    keywords: ["curious", "explore", "question", "why"],
  },
  {
    tag: "Resilience",
    keywords: ["resilience", "resilient", "recover", "bounce"],
  },
  {
    tag: "Self-motivation",
    keywords: ["motivation", "drive", "initiative", "proactive"],
  },
  {
    tag: "Stress management",
    keywords: ["stress", "burnout", "balance", "wellbeing"],
  },
  {
    tag: "Accountability",
    keywords: ["accountable", "responsible", "ownership"],
  },
  {
    tag: "Work ethic",
    keywords: ["discipline", "habit", "consistency", "ethic"],
  },
];

const autoTagFromContent = (title: string, about?: string): string | undefined => {
  const haystack = `${title} ${about ?? ""}`.toLowerCase();
  let bestTag: string | undefined;
  let bestScore = 0;

  for (const entry of TAG_KEYWORDS) {
    const score = entry.keywords.reduce((acc, keyword) => {
      if (!keyword) return acc;
      return haystack.includes(keyword.toLowerCase()) ? acc + 1 : acc;
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestTag = entry.tag;
    }
  }

  if (bestScore === 0) return undefined;
  return bestTag;
};

const extractRoleFromContent = (content: string): string | undefined => {
  const lines = content.split(/\r?\n/);
  const roleHeadingIndex = lines.findIndex((line) => /^##\s+role/i.test(line.trim()));
  if (roleHeadingIndex === -1) return undefined;

  for (let i = roleHeadingIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (/^##\s+/.test(line) || /^#\s+/.test(line)) break;
    const cleaned = line.replace(/^[-*]\s*/, "").trim();
    if (cleaned) return cleaned;
  }
  return undefined;
};

const extractSection = (content: string, headingPattern: RegExp): string | undefined => {
  const lines = content.split(/\r?\n/);
  const idx = lines.findIndex((line) => headingPattern.test(line.trim()));
  if (idx === -1) return undefined;
  const collected: string[] = [];
  for (let i = idx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (/^##\s+/.test(line) || /^#\s+/.test(line)) break;
    collected.push(line);
  }
  return collected.join("\n").trim() || undefined;
};

export const parseSkillsMarkdown = (markdown: string): ParsedSkill[] => {
  if (!markdown.trim()) return [];

  const blocks = markdown.split(/^##\s+/m).slice(1);
  const skills: ParsedSkill[] = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    const title = cleanText(lines[0] ?? "");
    const contentLines = lines.slice(1).map((line) => line.trim());

    const tagsLine = contentLines.find((line) => /^tags?:/i.test(line));
    const categoryLine = contentLines.find((line) => /^category:/i.test(line));

    const tags = new Set<string>();
    if (tagsLine) {
      tagsLine
        .replace(/^tags?:/i, "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .forEach((tag) => tags.add(tag));
    }

    const category = categoryLine ? categoryLine.replace(/^category:/i, "").trim() : undefined;

    const description =
      contentLines.find(
        (line) =>
          line &&
          !/^tags?:/i.test(line) &&
          !/^category:/i.test(line) &&
          !/^#/.test(line) &&
          !/^author:/i.test(line)
      ) ?? "";
    const authorLine = contentLines.find((line) => /^author:/i.test(line));
    const author = authorLine ? authorLine.replace(/^author:/i, "").trim() : undefined;

    const body = contentLines.join("\n").trim();
    const autoTag = autoTagFromContent(title, body || description);
    const role = extractRoleFromContent(markdown);

    if (title) {
      // Always include coworker tag
      tags.add("coworker");
      if (autoTag) tags.add(autoTag);
      skills.push({
        title,
        description: cleanText(description),
        tags: Array.from(tags),
        slug: slugifySkill(title || source),
        category,
        body,
        author,
        role,
      });
    }
  }

  return skills;
};

export const parseSkillFile = (markdown: string, source = "skill.md"): ParsedSkill => {
  let content = markdown.trim();
  let frontmatter: Record<string, string> = {};

  const frontmatterMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
  if (frontmatterMatch) {
    const fm = frontmatterMatch[1];
    fm.split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const [key, ...rest] = line.split(":");
        if (key && rest.length) {
          frontmatter[key.trim()] = rest.join(":").trim();
        }
      });
    content = content.slice(frontmatterMatch[0].length).trim();
  }

  const lines = content.split("\n").map((l) => l.trim());
  const firstHeading = lines.find((line) => /^#\s+/.test(line));
  const title = frontmatter.name || (firstHeading ? firstHeading.replace(/^#\s+/, "") : source);
  const authorLine =
    frontmatter.author ||
    lines.find((line) => /^-?\s*author:/i.test(line))?.replace(/^-?\s*author:\s*/i, "");
  const updatedLine =
    frontmatter.updated ||
    lines.find((line) => /^-?\s*updated:/i.test(line))?.replace(/^-?\s*updated:\s*/i, "");
  const githubLine =
    frontmatter.github ||
    lines.find((line) => /^-?\s*github:/i.test(line))?.replace(/^-?\s*github:\s*/i, "");
  const displayTagLine =
    frontmatter.displayTag ||
    lines.find((line) => /^-?\s*display tag:/i.test(line))?.replace(/^-?\s*display tag:\s*/i, "");
  const displayTags = displayTagLine
    ? displayTagLine.split(/[,/]/).map((t) => t.trim()).filter(Boolean)
    : undefined;
  const roleTagLine =
    lines.find((line) => /^-?\s*role tag:/i.test(line))?.replace(/^-?\s*role tag:\s*/i, "");
  const categoryTagLine =
    lines.find((line) => /^-?\s*category tag:/i.test(line))?.replace(/^-?\s*category tag:\s*/i, "");

  const aboutSection = (() => {
    const rawLines = content.split(/\r?\n/);
    const aboutIndex = rawLines.findIndex((line) => /^##\s+about this skill/i.test(line.trim()));
    if (aboutIndex === -1) return undefined;
    const after = rawLines.slice(aboutIndex + 1);
    const collected: string[] = [];
    for (const line of after) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (/^##\s+/.test(trimmed) || /^#\s+/.test(trimmed)) break;
      collected.push(trimmed);
    }
    return collected.join(" ").trim() || undefined;
  })();

  const whenToUse = extractSection(content, /^##\s+when to use this skill/i);
  const descriptionSection = extractSection(content, /^##\s+description/i);
  const successSignalsSection = extractSection(content, /^##\s+success signals/i);

  const description =
    frontmatter.description ||
    whenToUse ||
    aboutSection ||
    cleanText(
      lines.find(
        (line) =>
          line &&
          !/^#/.test(line) &&
          !/^tags?:/i.test(line) &&
          !/^category:/i.test(line) &&
          !/^author:/i.test(line)
      ) ?? ""
    );

  const tags = new Set<string>();
  if (frontmatter.tags) {
    frontmatter.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => tags.add(t));
  }
  if (categoryTagLine) {
    categoryTagLine
      .split("→")
      .flatMap((part) => part.split(","))
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => tags.add(t));
  }
  if (roleTagLine) {
    tags.add(roleTagLine.trim());
  }
  const role = roleTagLine || extractRoleFromContent(markdown);
  const autoTag = autoTagFromContent(title, aboutSection || description || content);
  // Always add coworker tag
  tags.add("coworker");
  if (autoTag) tags.add(autoTag);

  const category = frontmatter.category || categoryTagLine?.split("→")[0]?.trim();
  const slug = slugifySkill(title || source);

  return {
    title,
    description,
    slug,
    displayTags,
    tags: Array.from(tags),
    category,
    body: content,
    source,
    author: authorLine,
    about: aboutSection || whenToUse || descriptionSection || description,
    role,
    githubUrl: githubLine,
    updated: updatedLine,
    categoryTag: categoryTagLine,
    descriptionSection,
    whenToUseSection: whenToUse,
    successSignalsSection,
  };
};
