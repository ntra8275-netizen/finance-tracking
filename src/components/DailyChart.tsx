"use client";

import type { DailyStat } from "@/lib/analytics";

interface DailyChartProps {
  dailyStats: DailyStat[];
}

export default function DailyChart({ dailyStats }: DailyChartProps) {
  const today = new Date().toISOString().split("T")[0];
  const hasData = dailyStats.some((d) => d.total > 0);

  if (!hasData) {
    return (
      <div className="text-center py-6 text-muted text-sm">
        Chưa có dữ liệu chi tiêu theo ngày.
      </div>
    );
  }

  const visibleDays = dailyStats.filter(
    (d) => d.total > 0 || d.date <= today
  ).slice(0, 31);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end gap-[3px] h-28 px-1">
        {visibleDays.map((day) => {
          const isToday = day.date === today;
          const barHeight = Math.max(day.percentage, day.total > 0 ? 8 : 2);

          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center justify-end h-full group relative"
            >
              {/* Tooltip */}
              {day.total > 0 && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-foreground text-background text-[9px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap">
                    {day.total.toLocaleString("vi-VN")}₫
                  </div>
                </div>
              )}

              {/* Bar */}
              <div
                className={`
                  w-full rounded-t-sm transition-all duration-300
                  ${isToday ? "bg-primary" : day.total > 0 ? "bg-accent/60" : "bg-muted-bg"}
                `}
                style={{ height: `${barHeight}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Day labels - show only every 5th day */}
      <div className="flex gap-[3px] px-1">
        {visibleDays.map((day, i) => (
          <div key={day.date} className="flex-1 text-center">
            {i % 5 === 0 && (
              <span className="text-[8px] text-muted">{day.label.split(" ")[0]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
