import type { Expense } from "@/lib/db";

export interface CategoryStat {
  id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  count: number;
  percentage: number;
}

export interface DailyStat {
  date: string;
  label: string;
  total: number;
  percentage: number;
}

export interface MonthSummary {
  yearMonth: string;
  monthLabel: string;
  totalAmount: number;
  expenseCount: number;
  avgDaily: number;
  categories: CategoryStat[];
  dailyStats: DailyStat[];
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

const DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function buildMonthSummary(expenses: Expense[], yearMonth: string): MonthSummary {
  const [year, month] = yearMonth.split("-").map(Number);
  const daysInMonth = getDaysInMonth(year, month - 1);

  const monthLabel = `Tháng ${month}/${year}`;
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  // Category breakdown
  const catMap = new Map<string, CategoryStat>();
  for (const exp of expenses) {
    const existing = catMap.get(exp.categoryId);
    if (existing) {
      existing.total += exp.amount;
      existing.count += 1;
    } else {
      catMap.set(exp.categoryId, {
        id: exp.categoryId,
        name: exp.categoryName,
        icon: exp.categoryIcon,
        color: exp.categoryColor,
        total: exp.amount,
        count: 1,
        percentage: 0,
      });
    }
  }

  const categories = Array.from(catMap.values())
    .map((c) => ({ ...c, percentage: totalAmount > 0 ? (c.total / totalAmount) * 100 : 0 }))
    .sort((a, b) => b.total - a.total);

  // Daily breakdown
  const dailyMap = new Map<string, number>();
  for (const exp of expenses) {
    const day = exp.createdAt.split("T")[0];
    dailyMap.set(day, (dailyMap.get(day) || 0) + exp.amount);
  }

  const maxDaily = Math.max(...Array.from(dailyMap.values()), 1);

  const dailyStats: DailyStat[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${yearMonth}-${String(d).padStart(2, "0")}`;
    const total = dailyMap.get(dateStr) || 0;
    const dayOfWeek = new Date(year, month - 1, d).getDay();
    dailyStats.push({
      date: dateStr,
      label: `${d} ${DAY_NAMES[dayOfWeek]}`,
      total,
      percentage: maxDaily > 0 ? (total / maxDaily) * 100 : 0,
    });
  }

  const daysWithSpending = dailyStats.filter((d) => d.total > 0).length;
  const avgDaily = daysWithSpending > 0 ? totalAmount / daysWithSpending : 0;

  return {
    yearMonth,
    monthLabel,
    totalAmount,
    expenseCount: expenses.length,
    avgDaily,
    categories,
    dailyStats,
  };
}
