import fs from "fs";
import path from "path";
import { languageMap } from "./languageMap.js";

const defaultIgnoredDirs = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  "coverage",
];

// Complexity estimation
export function estimateComplexity(content) {
  const keywords = [
    "if",
    "for",
    "while",
    "switch",
    "case",
    "function",
    "class",
    "try",
    "catch",
  ];
  let score = 0;
  for (const kw of keywords) {
    const matches = content.match(new RegExp(`\\b${kw}\\b`, "g"));
    if (matches) score += matches.length;
  }
  return score;
}

// Detect comment lines
export function isCommentLine(line, ext) {
  const trimmed = line.trim();
  switch (ext) {
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "java":
    case "cpp":
    case "c":
    case "cs":
    case "go":
    case "swift":
    case "kt":
    case "rs":
      return (
        trimmed.startsWith("//") ||
        trimmed.startsWith("/*") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith("*/")
      );
    case "py":
    case "sh":
    case "rb":
    case "env":
    case "ini":
    case "toml":
    case "yml":
    case "yaml":
      return trimmed.startsWith("#");
    case "html":
    case "xml":
      return trimmed.startsWith("<!--");
    default:
      return false;
  }
}

// Count functions/methods
export function countFunctions(content, ext) {
  switch (ext) {
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
      return (
        (content.match(/function\s+\w+/g) || []).length +
        (content.match(/=>/g) || []).length
      );
    case "py":
      return (content.match(/def\s+\w+/g) || []).length;
    case "java":
    case "cpp":
    case "c":
    case "cs":
      return (
        content.match(
          /(?:public|private|protected)?\s*(?:static)?\s*(?:\w+)\s+\w+\(.*\)/g
        ) || []
      ).length;
    default:
      return 0;
  }
}

// Analyze a single file
export function analyzeFile(filePath, options) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const baseName = path.basename(filePath).toLowerCase();
  let lang = languageMap[ext] || languageMap[baseName] || "Unknown";

  if (
    options.language.length &&
    !options.language.includes(ext) &&
    !options.language.includes(baseName)
  )
    return null;

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const total = lines.length;
  const blanks = lines.filter((l) => !l.trim()).length;
  const comments = options.countComments
    ? lines.filter((l) => isCommentLine(l, ext)).length
    : 0;
  const codeLines = total - blanks - comments;
  const complexity = estimateComplexity(content);

  let functions = options.functionCount
    ? countFunctions(content, ext)
    : undefined;
  let avgFuncLength = undefined;
  if (functions && functions > 0 && options.avgFuncLength) {
    avgFuncLength = Math.round(codeLines / functions);
  }

  return {
    file: filePath,
    lang,
    lines: total,
    blanks,
    comments,
    codeLines,
    density: ((codeLines / total) * 100).toFixed(1),
    complexity,
    functions,
    avgFuncLength,
  };
}

// Recursively analyze directories
export function analyzeDirectory(dirPath, options) {
  const ignored = new Set([...defaultIgnoredDirs, ...(options.ignore || [])]);
  let results = [];

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!ignored.has(file))
        results = results.concat(analyzeDirectory(fullPath, options));
    } else {
      // Only config/code file filtering
      const ext = path.extname(fullPath).slice(1).toLowerCase();
      if (
        options.onlyCode &&
        ![
          "js",
          "ts",
          "jsx",
          "tsx",
          "py",
          "java",
          "cpp",
          "c",
          "cs",
          "go",
          "swift",
          "kt",
          "rs",
        ].includes(ext)
      )
        continue;
      if (
        options.onlyConfig &&
        ![
          "env",
          "ini",
          "toml",
          "yml",
          "yaml",
          "json",
          "xml",
          "plist",
          "gradle",
          "makefile",
        ].includes(ext)
      )
        continue;

      const stats = analyzeFile(fullPath, options);
      if (stats) results.push(stats);
    }
  }

  return results;
}
