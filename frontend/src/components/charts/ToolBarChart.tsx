"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ToolCount } from "@/types/metrics";

interface ToolBarChartProps {
  data: ToolCount[];
}

export function ToolBarChart({ data }: ToolBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="tool" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#8B5CF6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

