"use client";

import { useState } from "react";

interface NoteInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX_LENGTH = 200;

export default function NoteInput({ value, onChange }: NoteInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground" htmlFor="note-input">
          Ghi chú
        </label>
        <span
          className={`text-[10px] font-medium transition-opacity ${
            isFocused ? "opacity-100" : "opacity-0"
          } ${value.length > MAX_LENGTH * 0.9 ? "text-expense" : "text-muted"}`}
        >
          {value.length}/{MAX_LENGTH}
        </span>
      </div>

      <textarea
        id="note-input"
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= MAX_LENGTH) {
            onChange(e.target.value);
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="VD: Phở bò, Grab đi làm..."
        rows={2}
        className={`
          w-full px-4 py-3 rounded-xl text-sm text-foreground bg-muted-bg
          placeholder:text-muted/60 resize-none outline-none
          transition-all duration-200
          ${isFocused ? "ring-2 ring-primary bg-surface" : "hover:bg-muted-bg/80"}
        `}
      />
    </div>
  );
}
