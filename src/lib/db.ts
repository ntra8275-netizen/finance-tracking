export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  note: string;
  imageData: string | null;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "spendly_expenses";

function generateId(): string {
  return `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getAll(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(expenses: Expense[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export const db = {
  getExpenses(): Expense[] {
    return getAll().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getExpensesByDate(dateStr: string): Expense[] {
    return this.getExpenses().filter((e) => e.createdAt.startsWith(dateStr));
  },

  getExpensesByMonth(yearMonth: string): Expense[] {
    return this.getExpenses().filter((e) => e.createdAt.startsWith(yearMonth));
  },

  insertExpense(data: {
    amount: number;
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    note: string;
    imageData: string | null;
  }): Expense {
    const now = new Date().toISOString();
    const expense: Expense = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const all = getAll();
    all.push(expense);
    saveAll(all);

    return expense;
  },

  updateExpense(id: string, updates: Partial<Omit<Expense, "id" | "createdAt">>): Expense | null {
    const all = getAll();
    const idx = all.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    saveAll(all);
    return all[idx];
  },

  deleteExpense(id: string): boolean {
    const all = getAll();
    const filtered = all.filter((e) => e.id !== id);
    if (filtered.length === all.length) return false;
    saveAll(filtered);
    return true;
  },

  getTodayTotal(): number {
    const today = new Date().toISOString().split("T")[0];
    return this.getExpensesByDate(today).reduce((sum, e) => sum + e.amount, 0);
  },

  getMonthTotal(yearMonth?: string): number {
    const ym = yearMonth || new Date().toISOString().slice(0, 7);
    return this.getExpensesByMonth(ym).reduce((sum, e) => sum + e.amount, 0);
  },
};
