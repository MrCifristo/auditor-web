export interface MetricsSummary {
  total_jobs: number;
  total_findings: number;
  findings_by_severity: {
    INFO: number;
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  findings_by_tool: Record<string, number>;
}

export interface SeverityCount {
  severity: string;
  count: number;
}

export interface MetricsBySeverityResponse {
  data: SeverityCount[];
}

export interface ToolCount {
  tool: string;
  count: number;
}

export interface MetricsByToolResponse {
  data: ToolCount[];
}

export interface TimelinePoint {
  date: string;
  jobs: number;
  findings: number;
}

export interface MetricsTimelineResponse {
  data: TimelinePoint[];
}

export interface TargetCount {
  target_id: string;
  target_url: string;
  count: number;
}

export interface MetricsTopTargetsResponse {
  data: TargetCount[];
}

