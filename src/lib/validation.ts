import type { Category } from "@/data/categories";

export interface ExpenseData {
  amount: number;
  category: Category | null;
  note: string;
  imageData: string | null;
}

export interface ValidationError {
  field: "amount" | "category";
  message: string;
}

export function validateExpense(data: ExpenseData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.amount || data.amount <= 0) {
    errors.push({
      field: "amount",
      message: "Vui lòng nhập số tiền hợp lệ",
    });
  }

  if (data.amount > 999_999_999) {
    errors.push({
      field: "amount",
      message: "Số tiền không được vượt quá 999,999,999₫",
    });
  }

  if (!data.category) {
    errors.push({
      field: "category",
      message: "Vui lòng chọn danh mục",
    });
  }

  return errors;
}
