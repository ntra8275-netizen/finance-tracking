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
    <div className="flex flex-col gap-8">
      {/* Amount Display */}
      <div className="flex flex-col items-center justify-center py-4">
        <span className="block font-headline font-medium text-surface-variant text-[10px] uppercase tracking-[0.3em] mb-2 opacity-70">
          Current Entry
        </span>
        <div className={`
          font-headline font-extrabold text-primary tracking-tighter flex items-start justify-center amount-glow
          ${displayValue.length > 10 ? "text-4xl" : displayValue.length > 7 ? "text-5xl" : "text-6xl"}
          ${hasError ? "text-red-500" : ""}
        `}>
          <span className="text-2xl mt-2 mr-1 font-bold opacity-70">$</span>
          <span>{displayValue}</span>
        </div>
        {hasError && (
          <p className="text-xs text-red-400 mt-2 animate-fade-in font-medium">{error}</p>
        )}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-4 px-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"].map(
          (key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleKeyPress(key === "." ? "000" : key)}
              className={`
                flex items-center justify-center h-16 rounded-2xl font-headline text-xl font-medium
                transition-all duration-200 active:scale-95 glass
                ${key === "backspace" ? "text-primary/70" : "text-foreground/90"}
                border border-outline-variant hover:bg-surface-highest/20
              `}
            >
              {key === "backspace" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                  <line x1="12" y1="15" x2="18" y2="9" />
                </svg>
              ) : key === "." ? (
                <span className="text-sm tracking-widest text-primary/80">000</span>
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
