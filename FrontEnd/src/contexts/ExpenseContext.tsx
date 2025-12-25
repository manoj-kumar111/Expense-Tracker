import { createContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, type BackendExpense } from '@/lib/api';
import { useAuth } from './useAuth';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  categories: Category[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

const palette = [
  'hsl(173, 80%, 45%)',
  'hsl(280, 65%, 60%)',
  'hsl(38, 92%, 50%)',
  'hsl(340, 75%, 55%)',
  'hsl(200, 75%, 50%)',
  'hsl(160, 84%, 39%)',
  'hsl(25, 95%, 53%)',
  'hsl(262, 83%, 58%)',
];

// Fallback USD to INR conversion rate (prefer using useCurrencyRate hook for live rates)
export const USD_TO_INR_FALLBACK = 83.5;


export const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

function mapBackendExpense(e: BackendExpense): Expense {
  return {
    id: e._id,
    title: e.description,
    amount: e.amount,
    category: e.category,
    date: (e.createdAt ?? new Date().toISOString()).split('T')[0],
    description: e.description,
  };
}

export function createExpenseProvider() {
  return function ExpenseProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const categoriesStorageKey = useMemo(() => user ? `expense_tracker_categories_${user.id}` : null, [user]);

    useEffect(() => {
      if (!user) {
        setExpenses([]);
        setCategories([]);
        return;
      }
      api.getExpenses().then(res => {
        const mapped = res.expense.map(mapBackendExpense);
        setExpenses(mapped);
        const uniqueNames = Array.from(new Set(mapped.map(e => e.category)));
        const derived = uniqueNames.map((name, idx) => ({
          id: name,
          name,
          color: palette[idx % palette.length],
          icon: 'tag',
        }));
        if (categoriesStorageKey) {
          const stored = localStorage.getItem(categoriesStorageKey);
          const userCategories = stored ? (JSON.parse(stored) as Category[]) : [];
          const merged = mergeCategories(derived, userCategories);
          setCategories(merged);
        } else {
          setCategories(derived);
        }
      }).catch(() => {
        setExpenses([]);
        setCategories(prev => prev);
      });
    }, [user, categoriesStorageKey]);

    const addExpense = (expense: Omit<Expense, 'id'>) => {
      api.addExpense({
        description: expense.title,
        amount: expense.amount,
        category: expense.category,
      }).then(res => {
        const mapped = mapBackendExpense(res.expense);
        setExpenses(prev => [mapped, ...prev]);
        ensureCategoryExists(expense.category);
      });
    };

    const updateExpense = (id: string, updatedFields: Partial<Expense>) => {
      api.updateExpense(id, {
        description: updatedFields.title,
        amount: updatedFields.amount,
        category: updatedFields.category,
      }).then(() => {
        setExpenses(prev =>
          prev.map(expense =>
            expense.id === id ? { ...expense, ...updatedFields } : expense
          )
        );
        if (updatedFields.category) {
          ensureCategoryExists(updatedFields.category);
        }
      });
    };

    const deleteExpense = (id: string) => {
      api.removeExpense(id).then(() => {
        setExpenses(prev => prev.filter(expense => expense.id !== id));
      });
    };

    const addCategory = (category: Omit<Category, 'id'>) => {
      const newCategory: Category = { ...category, id: Date.now().toString() };
      setCategories(prev => {
        const next = [...prev, newCategory];
        persistCategories(next);
        return next;
      });
    };

    const updateCategory = (id: string, updatedFields: Partial<Category>) => {
      setCategories(prev => {
        const next = prev.map(category => (category.id === id ? { ...category, ...updatedFields } : category));
        persistCategories(next);
        return next;
      });
    };

    const deleteCategory = (id: string) => {
      setCategories(prev => {
        const next = prev.filter(category => category.id !== id);
        persistCategories(next);
        return next;
      });
    };

    function ensureCategoryExists(name: string) {
      setCategories(prev => {
        if (prev.some(c => c.name === name)) return prev;
        const next = [...prev, {
          id: name,
          name,
          color: palette[prev.length % palette.length],
          icon: 'tag',
        }];
        persistCategories(next);
        return next;
      });
    }

    function persistCategories(next: Category[]) {
      if (categoriesStorageKey) {
        const customOnly = next.filter(c => c.id !== c.name || c.icon !== 'tag');
        localStorage.setItem(categoriesStorageKey, JSON.stringify(customOnly));
      }
    }

    function mergeCategories(derived: Category[], stored: Category[]) {
      const byName = new Map<string, Category>();
      for (const c of derived) byName.set(c.name, c);
      for (const c of stored) byName.set(c.name, c);
      return Array.from(byName.values());
    }

    return (
      <ExpenseContext.Provider value={{
        expenses,
        categories,
        addExpense,
        updateExpense,
        deleteExpense,
        addCategory,
        updateCategory,
        deleteCategory,
      }}>
        {children}
      </ExpenseContext.Provider>
    );
  };
}
