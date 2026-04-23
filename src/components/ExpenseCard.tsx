"use client";

import { useState } from "react";
import type { Expense } from "@/lib/db";

interface ExpenseCardProps {
  expense: Expense;
  onDelete?: (id: string) => void;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export default function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="relative overflow-hidden p-3.5 bg-surface rounded-xl border border-surface-border hover:shadow-sm transition-shadow">
      <div className={`flex items-center gap-3 transition-transform duration-300 ${showConfirm ? "-translate-x-12" : "translate-x-0"}`}>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: expense.categoryColor + "18" }}
        >
          {expense.categoryIcon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {expense.categoryName}
          </p>
          {expense.note ? (
            <p className="text-xs text-muted truncate mt-0.5">{expense.note}</p>
          ) : (
            <p className="text-xs text-muted/50 mt-0.5">{formatTime(expense.createdAt)}</p>
          )}
        </div>

        <div className="text-right shrink-0 transition-opacity duration-300" style={{ opacity: showConfirm ? 0 : 1 }}>
          <p className="text-sm font-bold text-expense">
            -{expense.amount.toLocaleString("vi-VN")}₫
          </p>
          {expense.note && (
            <p className="text-[10px] text-muted mt-0.5">{formatTime(expense.createdAt)}</p>
          )}
        </div>

        {expense.imageData && (
          <div className={`w-8 h-8 rounded-md overflow-hidden shrink-0 border border-surface-border transition-opacity duration-300`} style={{ opacity: showConfirm ? 0 : 1 }}>
            <img src={expense.imageData} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Delete Trigger Button (only visible when not confirming) */}
        {!showConfirm && onDelete && (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-expense hover:bg-expense-bg rounded-lg transition-colors ml-1"
            title="Xóa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        )}
      </div>

      {/* Confirm Delete Overlay */}
      {showConfirm && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 bg-gradient-to-l from-surface via-surface to-transparent w-48 justify-end gap-2 z-10 animate-fade-in">
          <button
            onClick={() => setShowConfirm(false)}
            className="px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground bg-muted-bg rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => onDelete?.(expense.id)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-expense hover:bg-expense/90 rounded-lg transition-colors shadow-sm shadow-expense/25"
          >
            Xóa khoản này
          </button>
        </div>
      )}
    </div>
  );
}
