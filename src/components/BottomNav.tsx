"use client";

import { useState } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    id: "capture",
    label: "Capture",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    ),
  },
  {
    id: "daily",
    label: "Ledger",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
        <rect width="18" height="14" x="3" y="7" rx="2" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "Stats",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];


interface BottomNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
      <div className="h-16 glass rounded-full border border-outline-variant ambient-shadow flex justify-between items-center px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isCapture = item.id === "capture";
          
          if (isCapture) {
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex-1 flex flex-col items-center justify-center gap-1 group transition-all"
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? "bg-primary text-primary-fg scale-110 shadow-lg shadow-primary/20" 
                    : "bg-surface-highest/50 text-primary hover:bg-surface-highest"}
                `}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-widest ${isActive ? "text-primary" : "text-surface-variant"}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 transition-all
                ${isActive ? "text-primary" : "text-surface-variant hover:text-foreground"}
              `}
            >
              <div className={`transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"}`}>
                {item.icon}
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
