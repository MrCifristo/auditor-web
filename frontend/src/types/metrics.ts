export interface MetricsSummary {
  total_jobs: number
  total_findings: number
  findings_by_severity: Record<string, number>
  findings_by_tool: Record<string, number>
}

export interface SeverityCount {
  severity: string
  count: number
}

export interface ToolCount {
  tool: string
  count: number
}

export interface TimelinePoint {
  date: string
  jobs: number
  findings: number
}

export interface TargetCount {
  target_id: string
  target_url: string
  count: number
}
