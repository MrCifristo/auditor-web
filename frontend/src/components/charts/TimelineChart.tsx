"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { TimelinePoint } from "@/types/metrics";

interface TimelineChartProps {
  data: TimelinePoint[];
}

export function TimelineChart({ data }: TimelineChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    date: new Date(point.date).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="jobs"
          stroke="#3B82F6"
          strokeWidth={2}
          name="Escaneos"
        />
        <Line
          type="monotone"
          dataKey="findings"
          stroke="#EF4444"
          strokeWidth={2}
          name="Hallazgos"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

