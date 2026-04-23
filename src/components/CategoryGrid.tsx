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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <label className="font-headline text-[10px] font-extrabold uppercase tracking-[0.3em] text-surface-variant">
          Category
        </label>
        {suggestedId && !selected && (
          <span className="text-[10px] font-bold text-primary animate-fade-in tracking-widest uppercase">
            ✦ Suggested
          </span>
        )}
      </div>

      <div
        className={`
          grid grid-cols-4 gap-3 p-4 rounded-3xl transition-all duration-300
          ${hasError ? "bg-red-950/20 ring-1 ring-red-500/30" : "bg-surface-lowest"}
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
                relative flex flex-col items-center gap-2 py-3 px-2 rounded-2xl
                transition-all duration-300 active:scale-95
                ${
                  isSelected
                    ? "bg-primary text-primary-fg shadow-xl shadow-primary/20 scale-105"
                    : isSuggested
                    ? "bg-primary/10 ring-1 ring-primary/40"
                    : "bg-surface-low hover:bg-surface-highest/40"
                }
              `}
            >
              <span className={`text-2xl transition-transform ${isSelected ? "scale-110" : ""}`}>
                {cat.icon}
              </span>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider text-center line-clamp-1 ${
                  isSelected ? "text-primary-fg" : "text-surface-variant"
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
      {hasError && (
        <p className="text-[10px] text-red-400 px-1 font-medium tracking-wide uppercase">{error}</p>
      )}
    </div>

  );
}
