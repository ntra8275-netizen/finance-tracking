export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "food", name: "Ăn uống", icon: "🍜", color: "#f97316" },
  { id: "transport", name: "Di chuyển", icon: "🚗", color: "#3b82f6" },
  { id: "shopping", name: "Mua sắm", icon: "🛍️", color: "#ec4899" },
  { id: "entertainment", name: "Giải trí", icon: "🎬", color: "#8b5cf6" },
  { id: "health", name: "Sức khỏe", icon: "💊", color: "#10b981" },
  { id: "education", name: "Học tập", icon: "📚", color: "#06b6d4" },
  { id: "bills", name: "Hóa đơn", icon: "📄", color: "#ef4444" },
  { id: "coffee", name: "Cà phê", icon: "☕", color: "#92400e" },
  { id: "gift", name: "Quà tặng", icon: "🎁", color: "#e11d48" },
  { id: "other", name: "Khác", icon: "📦", color: "#64748b" },
];
