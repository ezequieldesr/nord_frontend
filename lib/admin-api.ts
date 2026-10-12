import type { Session, Order, ProductResponse, Category } from "./types";
export type AdminUser = { id: number; nome: string; email: string; role: "ADMIN" | "CLIENTE"; ativo: boolean };
export type UserPage = { content: AdminUser[]; totalElements: number; totalPages: number; number: number };
const KEY = "nord.admin.session";
export function adminSession(): Session | null {
  if(typeof window === "undefined") return null;
  try { return JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch { return null; }
}
export function setAdminSession(s: Session | null) {
  if(s) sessionStorage.setItem(KEY,JSON.stringify(s)); else sessionStorage.removeItem(KEY);
}
export async function adminRequest<T>(path: string, method = "GET", body?: unknown, token = adminSession()?.token): Promise<T> {
  const headers: Record<string,string> = {};
  if(token) headers.Authorization = `Bearer ${token}`;
  if(body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`/api${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" });
  if(response.status === 204) return undefined as T;
  const data = await response.json().catch(()=>null);
  if(!response.ok) {
    if(response.status === 401 || response.status === 403) { setAdminSession(null); window.dispatchEvent(new Event("nord:admin-expired")); }
    throw new Error(data?.erros ? Object.values(data.erros).join(" ") : data?.mensagem || "Não foi possível concluir a operação.");
  }
  return data as T;
}
export const adminApi = {
  async login(email: string, senha: string) {
    const s = await adminRequest<Session>("/auth/login","POST",{email,senha},"");
    if(s.role !== "ADMIN") throw new Error("Esta área exige uma conta administrativa.");
    setAdminSession(s); return s;
  },
  me: () => adminRequest<Omit<Session,"token">>("/usuarios/me"),
  users: (page: number) => adminRequest<UserPage>(`/admin/usuarios?page=${page}`),
  orders: () => adminRequest<Order[]>("/admin/pedidos"),
  products: () => adminRequest<ProductResponse[]>("/produtos"),
  categories: () => adminRequest<Category[]>("/categorias"),
};
