"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { SeverityCount } from "@/types/metrics";

interface SeverityBarChartProps {
  data: SeverityCount[];
}

const severityColors: Record<string, string> = {
  INFO: "#3B82F6", // blue
  LOW: "#10B981", // green
  MEDIUM: "#F59E0B", // amber
  HIGH: "#EF4444", // red
  CRITICAL: "#991B1B", // dark red
};

const severityLabels: Record<string, string> = {
  INFO: "Info",
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

export function SeverityBarChart({ data }: SeverityBarChartProps) {
  const chartData = data.map((item) => ({
    severity: severityLabels[item.severity] || item.severity,
    count: item.count,
    fill: severityColors[item.severity] || "#6B7280",
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="severity" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

