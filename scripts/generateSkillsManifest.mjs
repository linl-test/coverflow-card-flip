#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const skillsDir = path.join(root, "src", "skills");
const headDir = path.join(root, "public", "skills", "head");
const outPath = path.join(root, "src", "generated", "skillsManifest.json");

const cleanText = (value = "") => value.trim().replace(/^\*\s*/, "").trim();
const slugify = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-+/g, "-");

const extractSection = (content, headingPattern) => {
  const lines = content.split(/\r?\n/);
  const idx = lines.findIndex((line) => headingPattern.test(line.trim()));
  if (idx === -1) return undefined;
  const collected = [];
  for (let i = idx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (/^##\s+/.test(line) || /^#\s+/.test(line)) break;
    collected.push(line);
  }
  return collected.join("\n").trim() || undefined;
};

const parseSkillFile = (markdown, source = "skill.md") => {
  let content = markdown.trim();
  const frontmatter = {};

  const fmMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
  if (fmMatch) {
    fmMatch[1]
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const [key, ...rest] = line.split(":");
        if (key && rest.length) {
          frontmatter[key.trim()] = rest.join(":").trim();
        }
      });
    content = content.slice(fmMatch[0].length).trim();
  }

  const lines = content.split("\n").map((l) => l.trim());
  const firstHeading = lines.find((line) => /^#\s+/.test(line));
  const title = frontmatter.name || (firstHeading ? firstHeading.replace(/^#\s+/, "") : source);
  const author =
    frontmatter.author ||
    lines.find((line) => /^-?\s*author:/i.test(line))?.replace(/^-?\s*author:\s*/i, "");
  const updated =
    frontmatter.updated ||
    lines.find((line) => /^-?\s*updated:/i.test(line))?.replace(/^-?\s*updated:\s*/i, "");
  const githubUrl =
    frontmatter.github ||
    lines.find((line) => /^-?\s*github:/i.test(line))?.replace(/^-?\s*github:\s*/i, "");
  const displayTagLine =
    frontmatter.displayTag ||
    lines.find((line) => /^-?\s*display tag:/i.test(line))?.replace(/^-?\s*display tag:\s*/i, "");
  const displayTags = displayTagLine
    ? displayTagLine.split(/[,/]/).map((t) => t.trim()).filter(Boolean)
    : undefined;
  const roleTag =
    lines.find((line) => /^-?\s*role tag:/i.test(line))?.replace(/^-?\s*role tag:\s*/i, "");
  const categoryTag =
    lines.find((line) => /^-?\s*category tag:/i.test(line))?.replace(/^-?\s*category tag:\s*/i, "");

  const descriptionSection = extractSection(content, /^##\s+description/i);
  const whenToUseSection = extractSection(content, /^##\s+when to use this skill/i);
  const successSignalsSection = extractSection(content, /^##\s+success signals/i);
  const aboutSection = extractSection(content, /^##\s+about this skill/i);

  const description =
    frontmatter.description ||
    whenToUseSection ||
    aboutSection ||
    descriptionSection ||
    cleanText(
      lines.find(
        (line) =>
          line &&
          !/^#/.test(line) &&
          !/^tags?:/i.test(line) &&
          !/^category:/i.test(line) &&
          !/^author:/i.test(line)
      ) || ""
    );

  const tags = new Set();
  if (frontmatter.tags) {
    frontmatter.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => tags.add(t));
  }
  if (categoryTag) {
    categoryTag
      .split("→")
      .flatMap((part) => part.split(","))
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => tags.add(t));
  }
  if (roleTag) tags.add(roleTag.trim());
  tags.add("coworker");

  const category = frontmatter.category || categoryTag?.split("→")[0]?.trim();

  return {
    title,
    description,
    slug: slugify(title || source),
    displayTags,
    tags: Array.from(tags),
    category,
    body: content,
    source,
    author,
    about: aboutSection || whenToUseSection || descriptionSection || description,
    role: roleTag,
    githubUrl,
    updated,
    categoryTag,
    descriptionSection,
    whenToUseSection,
    successSignalsSection,
  };
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const main = () => {
  if (!fs.existsSync(skillsDir)) {
    console.error("Skills directory not found:", skillsDir);
    process.exit(1);
  }

  const headImages = fs.existsSync(headDir)
    ? fs
        .readdirSync(headDir)
        .filter((file) => /\.(png|jpe?g|webp|gif)$/i.test(file))
        .sort()
    : [];
  const headSlugMap = new Map(
    headImages.map((file) => [slugify(path.parse(file).name), file])
  );

  const files = globSync(path.join(skillsDir, "*.md"));
  const parsed = files.map((file) =>
    parseSkillFile(fs.readFileSync(file, "utf8"), path.basename(file))
  );
  const parsedWithMedia = parsed.map((skill, idx) => {
    const slug = skill.slug || slugify(skill.title || skill.source || `skill-${idx}`);
    const matched =
      headSlugMap.get(slug) ||
      headImages.find((name) => slugify(name).includes(slug)) ||
      (headImages.length > 0 ? headImages[idx % headImages.length] : undefined);
    const media = matched ? `/skills/head/${matched}` : undefined;
    return { ...skill, slug, media };
  });
  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, JSON.stringify(parsedWithMedia, null, 2), "utf8");
  console.log(`Generated manifest with ${parsedWithMedia.length} skills -> ${path.relative(root, outPath)}`);
};

main();
