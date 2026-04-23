"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import BottomNav from "@/components/BottomNav";
import AmountInput from "@/components/AmountInput";
import CategoryGrid from "@/components/CategoryGrid";
import NoteInput from "@/components/NoteInput";
import CameraCapture from "@/components/CameraCapture";
import ToastContainer, { showToast } from "@/components/Toast";
import ExpenseCard from "@/components/ExpenseCard";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import DailyChart from "@/components/DailyChart";
import InsightCards from "@/components/InsightCards";
import { validateExpense, type ValidationError } from "@/lib/validation";
import { db, type Expense } from "@/lib/db";
import { buildMonthSummary } from "@/lib/analytics";
import { suggestCategory, trackUsage } from "@/lib/suggest";
import { generateInsights } from "@/lib/insights";
import type { Category } from "@/data/categories";

/* ─── Capture Screen ─── */
function CaptureScreen({ expenses, onSaved }: { expenses: Expense[]; onSaved: () => void }) {
  const [amount, setAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [note, setNote] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const suggestedId = useMemo(() => suggestCategory(expenses), [expenses]);

  const amountError = errors.find((e) => e.field === "amount")?.message ?? null;
  const categoryError = errors.find((e) => e.field === "category")?.message ?? null;

  const resetForm = useCallback(() => {
    setAmount(0);
    setSelectedCategory(null);
    setNote("");
    setImageData(null);
    setErrors([]);
  }, []);

  const handleSave = useCallback(async () => {
    const validationErrors = validateExpense({ amount, category: selectedCategory, note, imageData });
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      showToast(validationErrors[0].message, "error");
      return;
    }
    setErrors([]);
    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      db.insertExpense({
        amount,
        categoryId: selectedCategory!.id,
        categoryName: selectedCategory!.name,
        categoryIcon: selectedCategory!.icon,
        categoryColor: selectedCategory!.color,
        note,
        imageData,
      });
      trackUsage(selectedCategory!.id);
      showToast("Đã lưu chi tiêu thành công! 🎉", "success");
      resetForm();
      onSaved();
    } catch {
      showToast("Không thể lưu. Vui lòng thử lại.", "error");
    } finally {
      setIsSaving(false);
    }
  }, [amount, selectedCategory, note, imageData, resetForm, onSaved]);

  return (
    <div className="animate-slide-up w-full max-w-md mx-auto px-4 pt-4 pb-4">
      <div className="bg-surface p-5 rounded-xl shadow-sm border border-surface-border flex flex-col gap-5">
        <header className="text-center">
          <h1 className="text-xl font-bold text-foreground">Thêm chi tiêu</h1>
        </header>
        <AmountInput value={amount} onChange={(v) => { setAmount(v); setErrors((e) => e.filter((er) => er.field !== "amount")); }} error={amountError} />
        <CategoryGrid
          selected={selectedCategory?.id ?? null}
          suggestedId={suggestedId}
          onSelect={(cat) => { setSelectedCategory(cat); setErrors((e) => e.filter((er) => er.field !== "category")); }}
          error={categoryError}
        />
        <NoteInput value={note} onChange={setNote} />
        <CameraCapture imageData={imageData} onCapture={setImageData} onRemove={() => setImageData(null)} />
        <button type="button" disabled={isSaving} onClick={handleSave}
          className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200 active:scale-[0.98] ${isSaving ? "opacity-60 cursor-wait" : ""} ${amount > 0 && selectedCategory ? "bg-primary text-primary-fg hover:opacity-90 shadow-lg shadow-primary/25" : "bg-muted-bg text-muted"}`}>
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-fg/30 border-t-primary-fg rounded-full animate-spin" />
              Đang lưu...
            </span>
          ) : "Lưu chi tiêu"}
        </button>
      </div>
    </div>
  );
}

/* ─── Daily Screen ─── */
function DailyScreen({ expenses, onDelete }: { expenses: Expense[]; onDelete: (id: string) => void }) {
  const today = new Date().toISOString().split("T")[0];
  const todayExpenses = expenses.filter((e) => e.createdAt.startsWith(today));
  const todayTotal = todayExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="animate-slide-up w-full max-w-md mx-auto px-6 flex flex-col gap-6">
      <div className="bg-surface-low p-6 rounded-3xl ambient-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-headline text-[10px] font-extrabold uppercase tracking-[0.3em] text-surface-variant mb-2">Today's Ledger</p>
            <p className="font-headline text-3xl font-extrabold text-primary amount-glow">${todayTotal.toLocaleString("vi-VN")}</p>
          </div>
          <div className="w-14 h-14 bg-surface-lowest rounded-2xl flex items-center justify-center text-2xl">
            💸
          </div>
        </div>
        <p className="text-[10px] font-bold text-surface-variant uppercase tracking-widest mt-4 opacity-60">{todayExpenses.length} TRANSACTIONS</p>
      </div>
      <div className="flex flex-col gap-4">
        {todayExpenses.length === 0 ? (
          <div className="bg-surface-low p-10 rounded-3xl text-center">
            <span className="text-4xl mb-4 block opacity-40">📝</span>
            <p className="text-[10px] font-bold text-surface-variant uppercase tracking-widest">No entries recorded yet.</p>
          </div>
        ) : (
          todayExpenses.map((exp) => <ExpenseCard key={exp.id} expense={exp} onDelete={onDelete} />)
        )}
      </div>
    </div>
  );
}

/* ─── Analytics Screen ─── */
function AnalyticsScreen({ expenses }: { expenses: Expense[] }) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const monthExpenses = expenses.filter((e) => e.createdAt.startsWith(currentMonth));
  const summary = buildMonthSummary(monthExpenses, currentMonth);

  // Previous month for insights comparison
  const [y, m] = currentMonth.split("-").map(Number);
  const prevDate = new Date(y, m - 2, 1);
  const prevYM = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const prevMonthExpenses = expenses.filter((e) => e.createdAt.startsWith(prevYM));
  const insights = generateInsights(monthExpenses, prevMonthExpenses);

  const navigateMonth = (dir: -1 | 1) => {
    const d = new Date(y, m - 1 + dir, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  return (
    <div className="animate-slide-up w-full max-w-md mx-auto px-6 flex flex-col gap-6">
      {/* Month nav */}
      <div className="flex items-center justify-between bg-surface-low p-4 rounded-2xl">
        <button onClick={() => navigateMonth(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-lowest text-primary hover:bg-primary/10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <h2 className="font-headline text-xs font-extrabold uppercase tracking-[0.3em] text-primary">{summary.monthLabel}</h2>
        <button onClick={() => navigateMonth(1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-lowest text-primary hover:bg-primary/10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-low p-4 rounded-2xl text-center">
          <p className="text-[8px] font-bold text-surface-variant uppercase tracking-widest mb-1.5">Total</p>
          <p className="font-headline text-sm font-extrabold text-primary">
            ${summary.totalAmount >= 1_000_000 ? `${(summary.totalAmount / 1_000_000).toFixed(1)}M` : `${(summary.totalAmount / 1_000).toFixed(0)}K`}
          </p>
        </div>
        <div className="bg-surface-low p-4 rounded-2xl text-center">
          <p className="text-[8px] font-bold text-surface-variant uppercase tracking-widest mb-1.5">Daily Avg</p>
          <p className="font-headline text-sm font-extrabold text-foreground">
            ${summary.avgDaily >= 1_000_000 ? `${(summary.avgDaily / 1_000_000).toFixed(1)}M` : `${(summary.avgDaily / 1_000).toFixed(0)}K`}
          </p>
        </div>
        <div className="bg-surface-low p-4 rounded-2xl text-center">
          <p className="text-[8px] font-bold text-surface-variant uppercase tracking-widest mb-1.5">Count</p>
          <p className="font-headline text-sm font-extrabold text-foreground">{summary.expenseCount}</p>
        </div>
      </div>

      {/* Daily chart */}
      <div className="bg-surface-low p-6 rounded-3xl">
        <h3 className="font-headline text-[10px] font-extrabold uppercase tracking-[0.25em] text-surface-variant mb-6">Daily Flow</h3>
        <DailyChart dailyStats={summary.dailyStats} />
      </div>

      {/* Category breakdown */}
      <div className="bg-surface-low p-6 rounded-3xl">
        <h3 className="font-headline text-[10px] font-extrabold uppercase tracking-[0.25em] text-surface-variant mb-6">Portfolio Distribution</h3>
        <CategoryBreakdown categories={summary.categories} totalAmount={summary.totalAmount} />
      </div>

      {/* Insights */}
      <div className="bg-surface-low p-6 rounded-3xl mb-4">
        <h3 className="font-headline text-[10px] font-extrabold uppercase tracking-[0.25em] text-surface-variant mb-4">Market Insights</h3>
        <InsightCards insights={insights} />
      </div>
    </div>
  );
}


/* ─── Home ─── */
export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("capture");
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);

  const refreshData = useCallback(() => {
    setAllExpenses(db.getExpenses());
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (db.deleteExpense(id)) {
      showToast("Đã xóa khoản chi", "success");
      refreshData();
    } else {
      showToast("Không thể xóa", "error");
    }
  }, [refreshData]);

  useEffect(() => {
    const timer = setTimeout(() => { refreshData(); setIsLoading(false); }, 1500);
    return () => clearTimeout(timer);
  }, [refreshData]);

  useEffect(() => {
    if (!isLoading) refreshData();
  }, [activeTab, isLoading, refreshData]);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="flex flex-col min-h-screen bg-background animate-fade-in font-body">
      <header className="fixed top-0 w-full z-50 glass flex justify-between items-center px-6 h-16 border-b border-outline-variant">
        <button className="text-primary hover:opacity-80 transition-opacity active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
        <h1 className="font-headline text-[10px] font-extrabold uppercase tracking-[0.4em] text-primary">THE OBSIDIAN LEDGER</h1>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 p-0.5">
          <div className="w-full h-full rounded-full bg-surface-highest" />
        </div>
      </header>

      <ToastContainer />
      <div className="flex-1 flex flex-col items-center justify-start pt-20 pb-32 overflow-y-auto w-full">

        {activeTab === "capture" && <CaptureScreen expenses={allExpenses} onSaved={refreshData} />}
        {activeTab === "daily" && <DailyScreen expenses={allExpenses} onDelete={handleDelete} />}
        {activeTab === "analytics" && <AnalyticsScreen expenses={allExpenses} />}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
