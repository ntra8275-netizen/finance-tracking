import type { Expense } from "@/lib/db";

export interface Insight {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: "warning" | "info" | "positive";
}

export function generateInsights(expenses: Expense[], prevMonthExpenses: Expense[]): Insight[] {
  const insights: Insight[] = [];
  if (expenses.length === 0) return insights;

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
  const prevTotal = prevMonthExpenses.reduce((s, e) => s + e.amount, 0);

  // 1. Month-over-month comparison
  if (prevTotal > 0) {
    const change = ((totalAmount - prevTotal) / prevTotal) * 100;
    if (change > 20) {
      insights.push({
        id: "mom-increase",
        icon: "📈",
        title: "Chi tiêu tăng mạnh",
        description: `Tháng này bạn chi nhiều hơn ${change.toFixed(0)}% so với tháng trước. Hãy cân nhắc cắt giảm!`,
        type: "warning",
      });
    } else if (change < -10) {
      insights.push({
        id: "mom-decrease",
        icon: "🎉",
        title: "Tiết kiệm tốt!",
        description: `Bạn đã giảm ${Math.abs(change).toFixed(0)}% chi tiêu so với tháng trước. Tuyệt vời!`,
        type: "positive",
      });
    }
  }

  // 2. Top category dominance
  const catTotals = new Map<string, { name: string; icon: string; total: number }>();
  for (const exp of expenses) {
    const existing = catTotals.get(exp.categoryId);
    if (existing) {
      existing.total += exp.amount;
    } else {
      catTotals.set(exp.categoryId, { name: exp.categoryName, icon: exp.categoryIcon, total: exp.amount });
    }
  }

  const sorted = Array.from(catTotals.values()).sort((a, b) => b.total - a.total);
  if (sorted.length > 0) {
    const topPct = (sorted[0].total / totalAmount) * 100;
    if (topPct > 50) {
      insights.push({
        id: "top-category",
        icon: sorted[0].icon,
        title: `${sorted[0].name} chiếm ${topPct.toFixed(0)}%`,
        description: `Hơn nửa chi tiêu của bạn là cho ${sorted[0].name}. Bạn có muốn đặt ngân sách?`,
        type: "warning",
      });
    }
  }

  // 3. Spending frequency
  const daysWithSpending = new Set(expenses.map((e) => e.createdAt.split("T")[0])).size;
  if (daysWithSpending > 0) {
    const avgPerDay = totalAmount / daysWithSpending;
    insights.push({
      id: "avg-daily",
      icon: "📊",
      title: "Trung bình mỗi ngày",
      description: `Bạn chi trung bình ${avgPerDay.toLocaleString("vi-VN")}₫ mỗi ngày có giao dịch.`,
      type: "info",
    });
  }

  // 4. Large transaction detection
  const avgAmount = totalAmount / expenses.length;
  const largeExpenses = expenses.filter((e) => e.amount > avgAmount * 3);
  if (largeExpenses.length > 0) {
    insights.push({
      id: "large-tx",
      icon: "⚠️",
      title: `${largeExpenses.length} giao dịch lớn bất thường`,
      description: `Có ${largeExpenses.length} khoản chi lớn hơn 3x trung bình. Kiểm tra lại nhé!`,
      type: "warning",
    });
  }

  // 5. Most active time
  const hourCounts = new Map<number, number>();
  for (const exp of expenses) {
    const hour = new Date(exp.createdAt).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  }
  let peakHour = 12;
  let peakCount = 0;
  for (const [hour, count] of hourCounts) {
    if (count > peakCount) {
      peakHour = hour;
      peakCount = count;
    }
  }
  insights.push({
    id: "peak-hour",
    icon: "🕐",
    title: "Giờ chi tiêu nhiều nhất",
    description: `Bạn thường chi tiêu nhất vào khoảng ${peakHour}:00. Đây có phải giờ nghỉ trưa?`,
    type: "info",
  });

  return insights;
}
