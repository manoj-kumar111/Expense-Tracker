const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:3000/api/v1";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  register: (fullname: string, email: string, password: string) =>
    request<{ message: string; success: boolean }>("/user/register", {
      method: "POST",
      body: JSON.stringify({ fullname, email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ message: string; user: { _id: string; fullname: string; email: string }; success: boolean }>(
      "/user/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    ),
  logout: () => request<{ message: string; success: boolean }>("/user/logout", { method: "GET" }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string; success: boolean }>("/user/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  getExpenses: (params?: { category?: string; done?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (typeof params?.done === "boolean") qs.set("done", String(params.done));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<{ expense: BackendExpense[]; success: boolean }>("/expense/getall" + suffix);
  },
  addExpense: (data: { description: string; amount: number; category: string; date: string; notes?: string }) =>
    request<{ expense: BackendExpense; success: boolean }>("/expense/add", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateExpense: (id: string, data: { description?: string; amount?: number; category?: string; date?: string; notes?: string }) =>
    request<{ success: boolean }>(`/expense/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  removeExpense: (id: string) => request<{ success: boolean }>(`/expense/remove/${id}`, { method: "DELETE" }),
  markAsDone: (id: string, done: boolean) =>
    request<{ success: boolean }>(`/expense/${id}/done`, {
      method: "PUT",
      body: JSON.stringify({ done }),
    }),
};

export type BackendExpense = {
  _id: string;
  description: string;
  amount: number;
  category: string;
  date?: string;
  notes?: string;
  done?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
