"use client";

import type { Insight } from "@/lib/insights";

interface InsightCardsProps {
  insights: Insight[];
}

const typeStyles = {
  warning: "border-l-expense bg-expense-bg/30",
  positive: "border-l-income bg-income-bg/30",
  info: "border-l-accent bg-accent/5",
};

export default function InsightCards({ insights }: InsightCardsProps) {
  if (insights.length === 0) {
    return (
      <div className="text-center py-6 text-muted text-sm">
        Cần thêm dữ liệu để phân tích. Hãy tiếp tục ghi chép!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {insights.map((insight) => (
        <div
          key={insight.id}
          className={`
            flex items-start gap-3 p-3.5 rounded-xl border-l-4
            transition-all duration-200 hover:shadow-sm
            ${typeStyles[insight.type]}
          `}
        >
          <span className="text-xl mt-0.5 shrink-0">{insight.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{insight.title}</p>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">{insight.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
