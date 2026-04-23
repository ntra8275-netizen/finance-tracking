"use client";

import { useState, useCallback } from "react";

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: string | null;
}

const MAX_AMOUNT = 999_999_999;

function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN");
}

export default function AmountInput({ value, onChange, error }: AmountInputProps) {
  const [rawDigits, setRawDigits] = useState(value > 0 ? String(value) : "");

  const handleKeyPress = useCallback(
    (key: string) => {
      if (key === "backspace") {
        const next = rawDigits.slice(0, -1);
        setRawDigits(next);
        onChange(next ? parseInt(next, 10) : 0);
        return;
      }

      if (key === "000") {
        const next = rawDigits + "000";
        const num = parseInt(next, 10);
        if (num <= MAX_AMOUNT) {
          setRawDigits(next);
          onChange(num);
        }
        return;
      }

      const next = rawDigits + key;
      const num = parseInt(next, 10);
      if (num <= MAX_AMOUNT) {
        setRawDigits(next);
        onChange(num);
      }
    },
    [rawDigits, onChange]
  );

  const displayValue = rawDigits ? formatVND(parseInt(rawDigits, 10)) : "0";
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-3">
      {/* Amount Display */}
      <div
        className={`
          flex flex-col items-center justify-center py-6 px-4 rounded-xl
          transition-all duration-200
          ${hasError ? "bg-expense-bg ring-2 ring-expense" : "bg-muted-bg"}
        `}
      >
        <div className="flex items-baseline gap-1">
          <span
            className={`
              font-bold tracking-tight transition-all
              ${displayValue.length > 10 ? "text-2xl" : displayValue.length > 7 ? "text-3xl" : "text-4xl"}
              ${hasError ? "text-expense" : "text-foreground"}
            `}
          >
            {displayValue}
          </span>
          <span className="text-sm text-muted font-medium ml-1">₫</span>
        </div>
        {hasError && (
          <p className="text-xs text-expense mt-2 animate-fade-in">{error}</p>
        )}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "backspace"].map(
          (key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleKeyPress(key)}
              className={`
                flex items-center justify-center h-14 rounded-xl font-semibold text-lg
                transition-all duration-150 active:scale-95
                ${
                  key === "backspace"
                    ? "bg-expense-bg text-expense hover:bg-expense/20"
                    : key === "000"
                    ? "bg-primary/10 text-primary hover:bg-primary/20 text-sm"
                    : "bg-surface border border-surface-border text-foreground hover:bg-muted-bg"
                }
              `}
            >
              {key === "backspace" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
                  <path d="m12 9 6 6" />
                  <path d="m18 9-6 6" />
                </svg>
              ) : (
                key
              )}
            </button>
          )
        )}
      </div>
    </div>
  );
}
