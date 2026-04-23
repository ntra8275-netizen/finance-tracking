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
    <div className="relative overflow-hidden p-5 bg-surface-low rounded-2xl transition-all hover:bg-surface-highest/20 group">
      <div className={`flex items-center gap-4 transition-transform duration-300 ${showConfirm ? "-translate-x-12" : "translate-x-0"}`}>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-surface-lowest"
        >
          {expense.categoryIcon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-headline font-extrabold uppercase tracking-widest text-surface-variant opacity-70 mb-0.5">
            {expense.categoryName}
          </p>
          <p className="text-sm font-medium text-foreground truncate">
            {expense.note || "No description"}
          </p>
        </div>

        <div className="text-right shrink-0 transition-opacity duration-300" style={{ opacity: showConfirm ? 0 : 1 }}>
          <p className="font-headline text-lg font-extrabold text-primary tracking-tight">
            ${expense.amount.toLocaleString("vi-VN")}
          </p>
          <p className="text-[10px] font-bold text-surface-variant uppercase tracking-widest mt-1">
            {formatTime(expense.createdAt)}
          </p>
        </div>

        {expense.imageData && (
          <div className={`w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-surface-lowest border border-outline-variant transition-opacity duration-300`} style={{ opacity: showConfirm ? 0 : 1 }}>
            <img src={expense.imageData} alt="" className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all" />
          </div>
        )}

        {/* Delete Trigger Button */}
        {!showConfirm && onDelete && (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-8 h-8 flex items-center justify-center text-surface-variant hover:text-red-400 rounded-full transition-colors ml-1 opacity-0 group-hover:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        )}
      </div>

      {/* Confirm Delete Overlay */}
      {showConfirm && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-5 bg-gradient-to-l from-surface-low via-surface-low to-transparent w-48 justify-end gap-3 z-10 animate-fade-in">
          <button
            onClick={() => setShowConfirm(false)}
            className="text-[10px] font-bold uppercase tracking-widest text-surface-variant hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete?.(expense.id)}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary-fg bg-primary rounded-full transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
