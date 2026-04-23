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
    <div className="animate-slide-up w-full max-w-md mx-auto px-4 pt-4 pb-4 flex flex-col gap-4">
      <div className="bg-surface p-5 rounded-xl shadow-sm border border-surface-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Chi tiêu hôm nay</p>
            <p className="text-2xl font-bold text-foreground mt-1">{todayTotal.toLocaleString("vi-VN")}₫</p>
          </div>
          <div className="w-12 h-12 bg-expense-bg rounded-xl flex items-center justify-center">
            <span className="text-2xl">💸</span>
          </div>
        </div>
        <p className="text-xs text-muted mt-2">{todayExpenses.length} khoản chi</p>
      </div>
      <div className="flex flex-col gap-2">
        {todayExpenses.length === 0 ? (
          <div className="bg-surface p-8 rounded-xl border border-surface-border text-center">
            <span className="text-4xl mb-3 block">📝</span>
            <p className="text-sm text-muted">Chưa có chi tiêu nào hôm nay.</p>
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
    <div className="animate-slide-up w-full max-w-md mx-auto px-4 pt-4 pb-4 flex flex-col gap-4">
      {/* Month nav */}
      <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-surface-border">
        <button onClick={() => navigateMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted-bg text-muted hover:text-foreground transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <h2 className="text-lg font-bold text-foreground">{summary.monthLabel}</h2>
        <button onClick={() => navigateMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted-bg text-muted hover:text-foreground transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface p-3 rounded-xl border border-surface-border text-center">
          <p className="text-[10px] text-muted uppercase tracking-wide">Tổng</p>
          <p className="text-sm font-bold text-expense mt-1">
            {summary.totalAmount >= 1_000_000 ? `${(summary.totalAmount / 1_000_000).toFixed(1)}M` : `${(summary.totalAmount / 1_000).toFixed(0)}K`}
          </p>
        </div>
        <div className="bg-surface p-3 rounded-xl border border-surface-border text-center">
          <p className="text-[10px] text-muted uppercase tracking-wide">TB/Ngày</p>
          <p className="text-sm font-bold text-foreground mt-1">
            {summary.avgDaily >= 1_000_000 ? `${(summary.avgDaily / 1_000_000).toFixed(1)}M` : `${(summary.avgDaily / 1_000).toFixed(0)}K`}
          </p>
        </div>
        <div className="bg-surface p-3 rounded-xl border border-surface-border text-center">
          <p className="text-[10px] text-muted uppercase tracking-wide">Số lần</p>
          <p className="text-sm font-bold text-foreground mt-1">{summary.expenseCount}</p>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-surface p-4 rounded-xl border border-surface-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">💡 Phân tích thông minh</h3>
        <InsightCards insights={insights} />
      </div>

      {/* Daily chart */}
      <div className="bg-surface p-4 rounded-xl border border-surface-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">Chi tiêu theo ngày</h3>
        <DailyChart dailyStats={summary.dailyStats} />
      </div>

      {/* Category breakdown */}
      <div className="bg-surface p-4 rounded-xl border border-surface-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">Phân bổ danh mục</h3>
        <CategoryBreakdown categories={summary.categories} totalAmount={summary.totalAmount} />
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
    <div className="flex flex-col min-h-screen bg-background animate-fade-in">
      <ToastContainer />
      <div className="flex-1 flex flex-col items-center justify-start pt-4 pb-24 overflow-y-auto">
        {activeTab === "capture" && <CaptureScreen expenses={allExpenses} onSaved={refreshData} />}
        {activeTab === "daily" && <DailyScreen expenses={allExpenses} onDelete={handleDelete} />}
        {activeTab === "analytics" && <AnalyticsScreen expenses={allExpenses} />}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
