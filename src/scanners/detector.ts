import * as fs from "fs";
import * as path from "path";
import type { AIDetection } from "../types.js";
import { AI_PATTERNS, type DetectionPattern } from "./patterns.js";

const IGNORE_DIRS = new Set([
  "node_modules", ".git", ".next", ".nuxt", "dist", "build", "out",
  "__pycache__", ".venv", "venv", "env", ".env", ".tox", ".mypy_cache",
  ".pytest_cache", "coverage", ".coverage", ".turbo", ".vercel",
  "vendor", "target", "bin", "obj",
]);

const MAX_FILE_SIZE = 512 * 1024; // 512KB
const MAX_FILES = 5000;

function shouldScanFile(filePath: string, pattern: DetectionPattern): boolean {
  const ext = path.extname(filePath);
  const base = path.basename(filePath);
  return pattern.fileGlobs.some((glob) => {
    if (glob.startsWith("*.")) return ext === glob.slice(1);
    return base === glob || base.match(new RegExp("^" + glob.replace("*", ".*") + "$"));
  });
}

function walkDir(dir: string, files: string[] = [], depth = 0): string[] {
  if (depth > 15 || files.length >= MAX_FILES) return files;

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    if (files.length >= MAX_FILES) break;
    if (entry.name.startsWith(".") && entry.name !== ".env" && entry.name !== ".env.local" && entry.name !== ".env.example") continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        walkDir(fullPath, files, depth + 1);
      }
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

export function scanDirectory(projectPath: string): { detections: AIDetection[]; filesScanned: number } {
  const resolvedPath = path.resolve(projectPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Directory not found: ${resolvedPath}`);
  }

  const allFiles = walkDir(resolvedPath);
  const detections: AIDetection[] = [];
  const seen = new Set<string>();

  for (const filePath of allFiles) {
    let stats: fs.Stats;
    try {
      stats = fs.statSync(filePath);
    } catch {
      continue;
    }

    if (stats.size > MAX_FILE_SIZE) continue;

    let content: string;
    try {
      content = fs.readFileSync(filePath, "utf-8");
    } catch {
      continue;
    }

    const lines = content.split("\n");
    const relativePath = path.relative(resolvedPath, filePath);

    for (const pattern of AI_PATTERNS) {
      if (!shouldScanFile(filePath, pattern)) continue;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const regex of pattern.patterns) {
          if (regex.test(line)) {
            const key = `${pattern.name}:${relativePath}:${i + 1}`;
            if (!seen.has(key)) {
              seen.add(key);
              detections.push({
                name: pattern.name,
                provider: pattern.provider,
                category: pattern.category,
                filePath: relativePath,
                lineNumber: i + 1,
                evidence: line.trim().slice(0, 200),
                confidence: pattern.confidence,
              });
            }
            break; // One match per pattern per line
          }
        }
      }
    }
  }

  return { detections, filesScanned: allFiles.length };
}
