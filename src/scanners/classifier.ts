import type { AIDetection, RiskClassification, RiskLevel, ComplianceGap, AISystemInventoryEntry } from "../types.js";

const DEADLINE = new Date("2026-08-02T00:00:00Z");

export function getDaysUntilDeadline(): number {
  const now = new Date();
  return Math.ceil((DEADLINE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Classify risk based on what we CAN detect from code.
 * Without knowing the use case (HR, healthcare, law enforcement, etc.),
 * we classify based on the AI system type and flag what needs human review.
 */
export function classifyRisk(detections: AIDetection[]): RiskClassification {
  const hasLLM = detections.some(d => d.category === "llm-api");
  const hasCV = detections.some(d => d.category === "computer-vision");
  const hasSpeech = detections.some(d => d.category === "speech");
  const hasML = detections.some(d => d.category === "ml-framework");
  const hasEmbedding = detections.some(d => d.category === "embedding");

  // LLMs from major providers are GPAI models — likely high or limited risk
  if (hasLLM) {
    return {
      level: "high",
      reason: "Uses general-purpose AI models (GPAI) from major providers. GPAI models with >10^23 FLOPs are subject to EU AI Act obligations. Risk level depends on use case — review against Annex III categories.",
      annexIIICategory: "Requires human review — check if used for: biometrics, critical infrastructure, education, employment, essential services, law enforcement, migration, or justice",
      requiresConformityAssessment: true,
      requiresNotifiedBody: false,
      deadlineDate: "2026-08-02",
    };
  }

  // Computer vision + speech can be high-risk (biometrics, surveillance)
  if (hasCV || hasSpeech) {
    return {
      level: "high",
      reason: "Computer vision or speech processing detected. These systems may fall under high-risk if used for biometric identification, emotion recognition, or surveillance. Requires human review of use case.",
      annexIIICategory: "Potential: Biometrics & Emotion Recognition (Annex III, Category 1)",
      requiresConformityAssessment: true,
      requiresNotifiedBody: false,
      deadlineDate: "2026-08-02",
    };
  }

  // ML frameworks with embeddings suggest decision-making systems
  if (hasML && hasEmbedding) {
    return {
      level: "limited",
      reason: "ML framework with vector embeddings detected. May be used for classification, recommendation, or decision support. Risk depends on whether outputs affect individuals.",
      requiresConformityAssessment: false,
      requiresNotifiedBody: false,
      deadlineDate: "2026-08-02",
    };
  }

  // Pure ML frameworks
  if (hasML) {
    return {
      level: "limited",
      reason: "ML framework detected. Risk level depends on use case. Minimal risk if used for internal analytics; higher if used for decisions affecting individuals.",
      requiresConformityAssessment: false,
      requiresNotifiedBody: false,
      deadlineDate: "2026-08-02",
    };
  }

  return {
    level: "minimal",
    reason: "AI usage detected but likely minimal risk. Review use case to confirm classification.",
    requiresConformityAssessment: false,
    requiresNotifiedBody: false,
    deadlineDate: "2026-08-02",
  };
}

export function assessComplianceGaps(classification: RiskClassification): ComplianceGap[] {
  const gaps: ComplianceGap[] = [];

  // All AI systems need basic transparency
  gaps.push({
    requirement: "AI System Inventory",
    status: "missing",
    priority: "critical",
    description: "Maintain a register of all AI systems in use, including risk classification, purpose, and responsible parties.",
    article: "Article 49 — Registration",
  });

  gaps.push({
    requirement: "Transparency Declaration",
    status: "missing",
    priority: "high",
    description: "Users must be informed when they are interacting with an AI system.",
    article: "Article 50 — Transparency obligations",
  });

  if (classification.level === "high" || classification.level === "unacceptable") {
    gaps.push({
      requirement: "Technical Documentation",
      status: "missing",
      priority: "critical",
      description: "Prepare detailed technical documentation per Annex IV: system description, design, data governance, testing, performance metrics. Must be retained for 10 years.",
      article: "Article 11 — Technical documentation",
    });

    gaps.push({
      requirement: "Risk Management System",
      status: "missing",
      priority: "critical",
      description: "Establish a continuous risk management process: identify risks, estimate likelihood/severity, implement mitigation, test effectiveness.",
      article: "Article 9 — Risk management system",
    });

    gaps.push({
      requirement: "Data Governance",
      status: "missing",
      priority: "critical",
      description: "Document training data quality, relevance, representativeness. Address biases. Ensure data minimization.",
      article: "Article 10 — Data and data governance",
    });

    gaps.push({
      requirement: "Human Oversight",
      status: "missing",
      priority: "critical",
      description: "Design system for effective human oversight. Document how humans can interpret outputs, override decisions, and intervene.",
      article: "Article 14 — Human oversight",
    });

    gaps.push({
      requirement: "Accuracy & Robustness Testing",
      status: "missing",
      priority: "high",
      description: "Test for accuracy, robustness against errors, and resilience against adversarial manipulation. Document results.",
      article: "Article 15 — Accuracy, robustness and cybersecurity",
    });

    gaps.push({
      requirement: "Quality Management System",
      status: "missing",
      priority: "high",
      description: "Implement QMS covering: design procedures, testing protocols, version control, change management, incident handling.",
      article: "Article 17 — Quality management system",
    });

    gaps.push({
      requirement: "Conformity Assessment",
      status: "missing",
      priority: "critical",
      description: "Complete conformity assessment before placing system on the market. Self-assessment or notified body assessment depending on category.",
      article: "Article 43 — Conformity assessment",
    });

    gaps.push({
      requirement: "Post-Market Monitoring",
      status: "missing",
      priority: "high",
      description: "Establish system for monitoring performance after deployment. Report serious incidents to authorities.",
      article: "Article 72 — Post-market monitoring",
    });

    gaps.push({
      requirement: "EU Declaration of Conformity",
      status: "missing",
      priority: "high",
      description: "Draft and maintain EU declaration of conformity for each high-risk AI system.",
      article: "Article 47 — EU declaration of conformity",
    });
  }

  if (classification.level === "limited") {
    gaps.push({
      requirement: "Content Labeling",
      status: "missing",
      priority: "medium",
      description: "If system generates synthetic content (text, images, audio, video), outputs must be machine-detectable as AI-generated.",
      article: "Article 50(2) — Synthetic content",
    });
  }

  return gaps;
}

export function buildInventory(detections: AIDetection[]): AISystemInventoryEntry[] {
  // Group detections by AI system (provider + name)
  const groups = new Map<string, AIDetection[]>();
  for (const d of detections) {
    const key = `${d.provider}:${d.name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(d);
  }

  const inventory: AISystemInventoryEntry[] = [];
  for (const [, dets] of groups) {
    const classification = classifyRisk(dets);
    const gaps = assessComplianceGaps(classification);
    inventory.push({
      systemName: dets[0].name,
      provider: dets[0].provider,
      category: dets[0].category,
      detections: dets,
      riskClassification: classification,
      complianceGaps: gaps,
    });
  }

  // Sort: highest risk first
  const riskOrder: Record<RiskLevel, number> = { unacceptable: 0, high: 1, limited: 2, minimal: 3, unknown: 4 };
  inventory.sort((a, b) => riskOrder[a.riskClassification.level] - riskOrder[b.riskClassification.level]);

  return inventory;
}

export function calculateComplianceScore(inventory: AISystemInventoryEntry[]): { score: number; grade: string } {
  if (inventory.length === 0) return { score: 100, grade: "A" };

  // Score based on how many gaps exist relative to what's required
  const totalGaps = inventory.reduce((sum, entry) => sum + entry.complianceGaps.length, 0);
  const criticalGaps = inventory.reduce(
    (sum, entry) => sum + entry.complianceGaps.filter(g => g.priority === "critical").length,
    0
  );
  const highGaps = inventory.reduce(
    (sum, entry) => sum + entry.complianceGaps.filter(g => g.priority === "high").length,
    0
  );

  // Deductions
  const deductions = criticalGaps * 12 + highGaps * 6;
  const score = Math.max(0, Math.min(100, 100 - deductions));

  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 50 ? "D" : "F";
  return { score, grade };
}
