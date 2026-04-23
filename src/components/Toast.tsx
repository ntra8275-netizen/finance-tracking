"use client";

import { useState, useEffect, useCallback } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

let toastListener: ((toast: Toast) => void) | null = null;

export function showToast(message: string, type: "success" | "error" = "success") {
  const toast: Toast = {
    id: `toast_${Date.now()}`,
    message,
    type,
  };
  toastListener?.(toast);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListener = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 2500);
    };
    return () => {
      toastListener = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
            animate-slide-down backdrop-blur-xl
            ${
              toast.type === "success"
                ? "bg-income/90 text-white"
                : "bg-expense/90 text-white"
            }
          `}
        >
          <span className="text-lg">
            {toast.type === "success" ? "✅" : "❌"}
          </span>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
