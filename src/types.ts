export type RiskLevel = "unacceptable" | "high" | "limited" | "minimal" | "unknown";

export type AICategory =
  | "llm-api"
  | "ml-framework"
  | "computer-vision"
  | "nlp"
  | "speech"
  | "embedding"
  | "inference-server"
  | "ai-saas"
  | "general-ai";

export interface AIDetection {
  name: string;
  provider: string;
  category: AICategory;
  filePath: string;
  lineNumber: number;
  evidence: string;
  confidence: "high" | "medium" | "low";
}

export interface RiskClassification {
  level: RiskLevel;
  reason: string;
  annexIIICategory?: string;
  requiresConformityAssessment: boolean;
  requiresNotifiedBody: boolean;
  deadlineDate: string;
}

export interface ComplianceGap {
  requirement: string;
  status: "missing" | "partial" | "present";
  priority: "critical" | "high" | "medium" | "low";
  description: string;
  article: string;
}

export interface AISystemInventoryEntry {
  systemName: string;
  provider: string;
  category: AICategory;
  detections: AIDetection[];
  riskClassification: RiskClassification;
  complianceGaps: ComplianceGap[];
}

export interface ScanResult {
  projectPath: string;
  scanTimestamp: string;
  totalFilesScanned: number;
  aiSystemsFound: number;
  detections: AIDetection[];
  inventory: AISystemInventoryEntry[];
  overallRiskLevel: RiskLevel;
  daysUntilDeadline: number;
  complianceScore: number;
  grade: string;
  summary: string;
}
