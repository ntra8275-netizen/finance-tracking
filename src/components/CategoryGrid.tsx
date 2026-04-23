"use client";

import { DEFAULT_CATEGORIES, type Category } from "@/data/categories";

interface CategoryGridProps {
  selected: string | null;
  suggestedId?: string | null;
  onSelect: (category: Category) => void;
  error?: string | null;
}

export default function CategoryGrid({ selected, suggestedId, onSelect, error }: CategoryGridProps) {
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Danh mục</label>
        {suggestedId && !selected && (
          <span className="text-[10px] font-medium text-accent animate-fade-in">
            ✨ Gợi ý cho bạn
          </span>
        )}
        {hasError && (
          <span className="text-xs text-expense animate-fade-in">{error}</span>
        )}
      </div>

      <div
        className={`
          grid grid-cols-5 gap-2 p-3 rounded-xl transition-all duration-200
          ${hasError ? "ring-2 ring-expense bg-expense-bg/50" : "bg-muted-bg"}
        `}
      >
        {DEFAULT_CATEGORIES.map((cat) => {
          const isSelected = selected === cat.id;
          const isSuggested = suggestedId === cat.id && !selected;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat)}
              className={`
                relative flex flex-col items-center gap-1 py-2 px-1 rounded-lg
                transition-all duration-200 active:scale-95
                ${
                  isSelected
                    ? "bg-surface shadow-md ring-2 ring-primary scale-105"
                    : isSuggested
                    ? "bg-accent/10 ring-1 ring-accent/40 scale-105"
                    : "hover:bg-surface/60"
                }
              `}
            >
              {isSuggested && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-[6px] text-white font-bold">✦</span>
                </span>
              )}
              <span className="text-2xl">{cat.icon}</span>
              <span
                className={`text-[10px] font-medium leading-tight text-center line-clamp-1 ${
                  isSelected ? "text-primary" : isSuggested ? "text-accent" : "text-muted"
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
