import type { Expense } from "@/lib/db";

const TRACKER_KEY = "spendly_usage_tracker";

interface UsageRecord {
  categoryId: string;
  hour: number;
  count: number;
  lastUsed: string;
}

function getTracker(): UsageRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TRACKER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTracker(records: UsageRecord[]): void {
  localStorage.setItem(TRACKER_KEY, JSON.stringify(records));
}

export function trackUsage(categoryId: string): void {
  const hour = new Date().getHours();
  const records = getTracker();
  const existing = records.find((r) => r.categoryId === categoryId && r.hour === hour);

  if (existing) {
    existing.count += 1;
    existing.lastUsed = new Date().toISOString();
  } else {
    records.push({
      categoryId,
      hour,
      count: 1,
      lastUsed: new Date().toISOString(),
    });
  }

  saveTracker(records);
}

export function suggestCategory(expenses: Expense[]): string | null {
  if (expenses.length < 3) return null;

  const currentHour = new Date().getHours();
  const records = getTracker();

  // Filter records within ±2 hours of current time
  const nearby = records.filter(
    (r) => Math.abs(r.hour - currentHour) <= 2 || Math.abs(r.hour - currentHour) >= 22
  );

  if (nearby.length === 0) {
    // Fallback: most used category overall
    const catCount = new Map<string, number>();
    for (const exp of expenses) {
      catCount.set(exp.categoryId, (catCount.get(exp.categoryId) || 0) + 1);
    }
    let maxId: string | null = null;
    let maxCount = 0;
    for (const [id, count] of catCount) {
      if (count > maxCount) {
        maxId = id;
        maxCount = count;
      }
    }
    return maxId;
  }

  // Score: frequency (60%) + recency (40%)
  const now = Date.now();
  const scored = nearby.map((r) => {
    const recencyMs = now - new Date(r.lastUsed).getTime();
    const recencyScore = Math.max(0, 1 - recencyMs / (7 * 24 * 60 * 60 * 1000)); // decay over 7 days
    const freqScore = Math.min(r.count / 10, 1); // normalize
    return {
      categoryId: r.categoryId,
      score: freqScore * 0.6 + recencyScore * 0.4,
    };
  });

  // Aggregate scores per category
  const catScores = new Map<string, number>();
  for (const s of scored) {
    catScores.set(s.categoryId, (catScores.get(s.categoryId) || 0) + s.score);
  }

  let bestId: string | null = null;
  let bestScore = 0;
  for (const [id, score] of catScores) {
    if (score > bestScore) {
      bestId = id;
      bestScore = score;
    }
  }

  return bestId;
}
