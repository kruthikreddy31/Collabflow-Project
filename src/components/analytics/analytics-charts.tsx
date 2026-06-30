"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#94a3b8",
  MEDIUM: "#3b82f6",
  HIGH: "#f59e0b",
  URGENT: "#ef4444",
};

const STATUS_COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  byPriority: { priority: string; count: number }[];
  byStatus: { status: string; count: number }[];
  completedOverTime: { date: string; completed: number }[];
}

export function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Total tasks</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{data.totalTasks}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{data.completedTasks}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Completion rate</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {data.totalTasks ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0}%
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Tasks completed (last 14 days)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data.completedOverTime}>
            <defs>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#completedGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Tasks by priority</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.byPriority}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="priority" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.byPriority.map((entry) => (
                  <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Tasks by status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.byStatus}
                dataKey="count"
                nameKey="status"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {data.byStatus.map((entry, i) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
