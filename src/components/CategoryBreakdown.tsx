"use client";

import type { CategoryStat } from "@/lib/analytics";

interface CategoryBreakdownProps {
  categories: CategoryStat[];
  totalAmount: number;
}

export default function CategoryBreakdown({ categories, totalAmount }: CategoryBreakdownProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-6 text-muted text-sm">
        Chưa có dữ liệu danh mục.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Donut-style ring */}
      <div className="flex items-center justify-center py-2">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {(() => {
              let offset = 0;
              return categories.map((cat) => {
                const circumference = 2 * Math.PI * 40;
                const dash = (cat.percentage / 100) * circumference;
                const gap = circumference - dash;
                const currentOffset = offset;
                offset += dash;

                return (
                  <circle
                    key={cat.id}
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke={cat.color}
                    strokeWidth="12"
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={-currentOffset}
                    className="transition-all duration-500"
                  />
                );
              });
            })()}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted">Tổng</span>
            <span className="text-sm font-bold text-foreground">
              {totalAmount >= 1_000_000
                ? `${(totalAmount / 1_000_000).toFixed(1)}M`
                : `${(totalAmount / 1_000).toFixed(0)}K`}
            </span>
          </div>
        </div>
      </div>

      {/* Category list */}
      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3">
            <span className="text-lg">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{cat.name}</span>
                <span className="text-xs font-bold text-foreground">
                  {cat.total.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="w-full h-2 bg-muted-bg rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
            <span className="text-[10px] font-medium text-muted w-9 text-right">
              {cat.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
