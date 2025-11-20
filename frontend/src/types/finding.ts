export type FindingSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Finding {
  id: string;
  job_id: string;
  severity: FindingSeverity;
  title: string;
  description: string | null;
  evidence: string | null;
  recommendation: string | null;
  tool: string;
  created_at: string;
}

