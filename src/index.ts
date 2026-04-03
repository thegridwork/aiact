#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { scanDirectory } from "./scanners/detector.js";
import {
  classifyRisk,
  buildInventory,
  calculateComplianceScore,
  getDaysUntilDeadline,
  assessComplianceGaps,
} from "./scanners/classifier.js";
import type { ScanResult, AIDetection } from "./types.js";

const server = new McpServer({
  name: "@gridwork/aiact",
  version: "1.0.0",
});

// ── Tool: Full project scan ──
server.tool(
  "scan_project",
  "Scan a project directory for AI system usage and generate an EU AI Act compliance report. Detects LLM APIs (OpenAI, Anthropic, Google, Mistral, etc.), ML frameworks (PyTorch, TensorFlow, scikit-learn), computer vision, NLP, embeddings, and more. Classifies risk level and identifies compliance gaps against the August 2, 2026 deadline.",
  {
    path: z.string().describe("Absolute path to the project directory to scan"),
    format: z.enum(["markdown", "json"]).default("markdown").describe("Output format"),
  },
  async ({ path: projectPath, format }) => {
    try {
      const { detections, filesScanned } = scanDirectory(projectPath);
      const inventory = buildInventory(detections);
      const { score, grade } = calculateComplianceScore(inventory);
      const daysLeft = getDaysUntilDeadline();

      // Determine overall risk level
      const riskLevels = inventory.map(e => e.riskClassification.level);
      const overallRisk = riskLevels.includes("unacceptable") ? "unacceptable"
        : riskLevels.includes("high") ? "high"
        : riskLevels.includes("limited") ? "limited"
        : riskLevels.includes("minimal") ? "minimal"
        : "minimal";

      const result: ScanResult = {
        projectPath,
        scanTimestamp: new Date().toISOString(),
        totalFilesScanned: filesScanned,
        aiSystemsFound: inventory.length,
        detections,
        inventory,
        overallRiskLevel: overallRisk,
        daysUntilDeadline: daysLeft,
        complianceScore: score,
        grade,
        summary: generateSummary(inventory, score, grade, daysLeft, filesScanned),
      };

      if (format === "json") {
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      return { content: [{ type: "text", text: formatMarkdown(result) }] };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error scanning project: ${msg}` }], isError: true };
    }
  }
);

// ── Tool: Quick check ──
server.tool(
  "quick_check",
  "Quick scan to count AI systems in a project without full compliance analysis. Faster than scan_project.",
  {
    path: z.string().describe("Absolute path to the project directory"),
  },
  async ({ path: projectPath }) => {
    try {
      const { detections, filesScanned } = scanDirectory(projectPath);
      const uniqueSystems = new Set(detections.map(d => `${d.provider}:${d.name}`));
      const daysLeft = getDaysUntilDeadline();

      const lines = [
        `## AI Quick Check`,
        ``,
        `**Files scanned:** ${filesScanned}`,
        `**AI systems detected:** ${uniqueSystems.size}`,
        `**Total detections:** ${detections.length}`,
        `**Days until EU AI Act deadline:** ${daysLeft}`,
        ``,
      ];

      if (uniqueSystems.size === 0) {
        lines.push(`No AI systems detected in this project.`);
      } else {
        lines.push(`### Detected systems`);
        lines.push(``);
        const grouped = new Map<string, AIDetection[]>();
        for (const d of detections) {
          const key = `${d.provider}: ${d.name}`;
          if (!grouped.has(key)) grouped.set(key, []);
          grouped.get(key)!.push(d);
        }
        for (const [name, dets] of grouped) {
          lines.push(`- **${name}** — ${dets.length} reference${dets.length > 1 ? "s" : ""} (${dets[0].category})`);
        }
        lines.push(``);
        lines.push(`Run \`scan_project\` for full compliance analysis with risk classification and gap assessment.`);
      }

      return { content: [{ type: "text", text: lines.join("\n") }] };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
    }
  }
);

// ── Tool: Generate inventory document ──
server.tool(
  "generate_inventory",
  "Generate a formal EU AI Act inventory document for a project. Produces a structured inventory suitable for compliance records, covering all detected AI systems with risk classifications and documentation requirements.",
  {
    path: z.string().describe("Absolute path to the project directory"),
    organization: z.string().default("").describe("Organization name for the inventory header"),
  },
  async ({ path: projectPath, organization }) => {
    try {
      const { detections, filesScanned } = scanDirectory(projectPath);
      const inventory = buildInventory(detections);
      const daysLeft = getDaysUntilDeadline();
      const orgName = organization || "Organization";

      const lines = [
        `# EU AI Act — AI System Inventory`,
        ``,
        `**Organization:** ${orgName}`,
        `**Date:** ${new Date().toISOString().split("T")[0]}`,
        `**Deadline:** August 2, 2026 (${daysLeft} days remaining)`,
        `**Scope:** ${projectPath}`,
        `**Files scanned:** ${filesScanned}`,
        `**AI systems identified:** ${inventory.length}`,
        ``,
        `---`,
        ``,
      ];

      if (inventory.length === 0) {
        lines.push(`No AI systems detected. This project appears to be outside EU AI Act scope.`);
      } else {
        for (let i = 0; i < inventory.length; i++) {
          const entry = inventory[i];
          const rc = entry.riskClassification;

          lines.push(`## System ${i + 1}: ${entry.systemName}`);
          lines.push(``);
          lines.push(`| Field | Value |`);
          lines.push(`|-------|-------|`);
          lines.push(`| Provider | ${entry.provider} |`);
          lines.push(`| Category | ${entry.category} |`);
          lines.push(`| Risk Level | **${rc.level.toUpperCase()}** |`);
          lines.push(`| Requires Conformity Assessment | ${rc.requiresConformityAssessment ? "Yes" : "No"} |`);
          lines.push(`| Requires Notified Body | ${rc.requiresNotifiedBody ? "Yes" : "No"} |`);
          lines.push(`| Files referencing | ${entry.detections.length} |`);
          lines.push(``);
          lines.push(`**Risk rationale:** ${rc.reason}`);
          lines.push(``);

          if (rc.annexIIICategory) {
            lines.push(`**Annex III assessment:** ${rc.annexIIICategory}`);
            lines.push(``);
          }

          lines.push(`### Detections`);
          lines.push(``);
          for (const d of entry.detections.slice(0, 10)) {
            lines.push(`- \`${d.filePath}:${d.lineNumber}\` — ${d.evidence.slice(0, 100)}`);
          }
          if (entry.detections.length > 10) {
            lines.push(`- ... and ${entry.detections.length - 10} more`);
          }
          lines.push(``);

          lines.push(`### Compliance gaps`);
          lines.push(``);
          for (const gap of entry.complianceGaps) {
            const icon = gap.priority === "critical" ? "[CRITICAL]"
              : gap.priority === "high" ? "[HIGH]"
              : gap.priority === "medium" ? "[MEDIUM]" : "[LOW]";
            lines.push(`- ${icon} **${gap.requirement}** (${gap.article})`);
            lines.push(`  ${gap.description}`);
          }
          lines.push(``);
          lines.push(`---`);
          lines.push(``);
        }
      }

      lines.push(`*Generated by Gridwork AI Act Scanner — thegridwork.space*`);

      return { content: [{ type: "text", text: lines.join("\n") }] };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
    }
  }
);

// ── Tool: Classify a specific AI system ──
server.tool(
  "classify_system",
  "Classify the EU AI Act risk level for a specific AI system based on its type and use case. Helps determine which obligations apply.",
  {
    system_name: z.string().describe("Name of the AI system (e.g., 'OpenAI GPT-4', 'Custom PyTorch model')"),
    use_case: z.string().describe("Description of how the system is used"),
    processes_personal_data: z.boolean().default(false).describe("Whether the system processes personal data"),
    makes_decisions_about_people: z.boolean().default(false).describe("Whether outputs affect decisions about individuals"),
    use_domain: z.enum([
      "biometrics", "critical-infrastructure", "education",
      "employment", "essential-services", "law-enforcement",
      "migration", "justice", "content-generation", "analytics",
      "internal-tools", "customer-facing", "other"
    ]).default("other").describe("The domain where the AI system is deployed"),
  },
  async ({ system_name, use_case, processes_personal_data, makes_decisions_about_people, use_domain }) => {
    const highRiskDomains = new Set([
      "biometrics", "critical-infrastructure", "education",
      "employment", "essential-services", "law-enforcement",
      "migration", "justice",
    ]);

    let level: "unacceptable" | "high" | "limited" | "minimal";
    let reason: string;
    let annexCategory: string | undefined;

    if (highRiskDomains.has(use_domain)) {
      level = "high";
      reason = `Used in ${use_domain} — this is an Annex III high-risk category. Full compliance obligations apply.`;
      const categoryMap: Record<string, string> = {
        biometrics: "Category 1: Biometrics & Emotion Recognition",
        "critical-infrastructure": "Category 2: Critical Infrastructure",
        education: "Category 3: Education & Vocational Training",
        employment: "Category 4: Employment & Worker Management",
        "essential-services": "Category 5: Essential Private & Public Services",
        "law-enforcement": "Category 6: Law Enforcement",
        migration: "Category 7: Migration, Asylum & Border Control",
        justice: "Category 8: Administration of Justice",
      };
      annexCategory = categoryMap[use_domain];
    } else if (makes_decisions_about_people && processes_personal_data) {
      level = "high";
      reason = "System profiles individuals (processes personal data + makes decisions about people). This triggers high-risk classification regardless of de-risking conditions per Article 6(2).";
    } else if (use_domain === "content-generation") {
      level = "limited";
      reason = "Content generation system. Must comply with transparency obligations: label AI-generated content, inform users of AI interaction.";
    } else if (makes_decisions_about_people) {
      level = "limited";
      reason = "Affects decisions about individuals. Review carefully — may be high-risk depending on impact severity.";
    } else {
      level = "minimal";
      reason = "Based on provided information, this appears to be minimal risk. No specific EU AI Act obligations, but voluntary adoption of best practices is encouraged.";
    }

    const gaps = assessComplianceGaps({
      level,
      reason,
      annexIIICategory: annexCategory,
      requiresConformityAssessment: level === "high",
      requiresNotifiedBody: false,
      deadlineDate: "2026-08-02",
    });

    const daysLeft = getDaysUntilDeadline();

    const lines = [
      `## Risk Classification: ${system_name}`,
      ``,
      `**Risk Level:** ${level.toUpperCase()}`,
      `**Use case:** ${use_case}`,
      `**Domain:** ${use_domain}`,
      `**Days until deadline:** ${daysLeft}`,
      ``,
      `**Assessment:** ${reason}`,
      ``,
    ];

    if (annexCategory) {
      lines.push(`**Annex III Category:** ${annexCategory}`);
      lines.push(``);
    }

    if (gaps.length > 0) {
      lines.push(`### Required actions`);
      lines.push(``);
      for (const gap of gaps) {
        lines.push(`- **${gap.requirement}** (${gap.article}) [${gap.priority.toUpperCase()}]`);
        lines.push(`  ${gap.description}`);
      }
    }

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// ── Formatting helpers ──

function generateSummary(
  inventory: ScanResult["inventory"],
  score: number,
  grade: string,
  daysLeft: number,
  filesScanned: number,
): string {
  if (inventory.length === 0) {
    return `No AI systems detected in ${filesScanned} files. This project appears to be outside EU AI Act scope.`;
  }

  const highRisk = inventory.filter(e => e.riskClassification.level === "high").length;
  const limited = inventory.filter(e => e.riskClassification.level === "limited").length;
  const minimal = inventory.filter(e => e.riskClassification.level === "minimal").length;

  return `Found ${inventory.length} AI system${inventory.length > 1 ? "s" : ""} across ${filesScanned} files. ` +
    `Risk breakdown: ${highRisk} high, ${limited} limited, ${minimal} minimal. ` +
    `Compliance score: ${score}/100 (${grade}). ` +
    `${daysLeft} days until EU AI Act deadline (August 2, 2026).`;
}

function formatMarkdown(result: ScanResult): string {
  const lines = [
    `## EU AI Act Compliance Scan`,
    ``,
    `**Project:** ${result.projectPath}`,
    `**Scanned:** ${result.scanTimestamp.split("T")[0]}`,
    `**Files scanned:** ${result.totalFilesScanned}`,
    `**AI systems found:** ${result.aiSystemsFound}`,
    `**Overall risk:** ${result.overallRiskLevel.toUpperCase()}`,
    `**Compliance score:** ${result.complianceScore}/100 (${result.grade})`,
    `**Days until deadline:** ${result.daysUntilDeadline}`,
    ``,
    `---`,
    ``,
    result.summary,
    ``,
  ];

  if (result.inventory.length === 0) return lines.join("\n");

  for (const entry of result.inventory) {
    const rc = entry.riskClassification;
    lines.push(`### ${entry.systemName} (${entry.provider})`);
    lines.push(``);
    lines.push(`- **Category:** ${entry.category}`);
    lines.push(`- **Risk:** ${rc.level.toUpperCase()}`);
    lines.push(`- **Detections:** ${entry.detections.length} references`);
    lines.push(`- **Reason:** ${rc.reason}`);
    lines.push(``);

    // Top detections
    lines.push(`**Found in:**`);
    for (const d of entry.detections.slice(0, 5)) {
      lines.push(`- \`${d.filePath}:${d.lineNumber}\` — \`${d.evidence.slice(0, 80)}\``);
    }
    if (entry.detections.length > 5) {
      lines.push(`- ... and ${entry.detections.length - 5} more`);
    }
    lines.push(``);

    // Compliance gaps
    const critical = entry.complianceGaps.filter(g => g.priority === "critical");
    if (critical.length > 0) {
      lines.push(`**Critical compliance gaps:**`);
      for (const gap of critical) {
        lines.push(`- ${gap.requirement} (${gap.article})`);
      }
      lines.push(``);
    }
  }

  lines.push(`---`);
  lines.push(`*Gridwork AI Act Scanner — thegridwork.space*`);
  lines.push(``);
  lines.push(`*Note: This scan detects direct AI library imports and API references. Indirect usage (internal APIs proxying to AI providers, runtime-loaded models, or vendor SaaS with embedded AI) requires manual review.*`);

  return lines.join("\n");
}

// ── Start server ──
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});
