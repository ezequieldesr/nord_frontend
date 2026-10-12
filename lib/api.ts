import type { Address, AddressInput, CartItem, CartResponse, Category, Order, Product, ProductResponse, Session } from "./types";

const KEY = "nord.session";
export const SESSION_EVENT = "nord:session";
export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch { return null; }
}
export function saveSession(session: Session | null) {
  if (session) sessionStorage.setItem(KEY, JSON.stringify(session));
  else sessionStorage.removeItem(KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function request<T>(path: string, method = "GET", body?: unknown, authenticated = true): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = authenticated ? readSession()?.token : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  let response: Response;
  try {
    response = await fetch(`/api${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" });
  } catch { throw new ApiError(0, "Não foi possível conectar à loja. Tente novamente."); }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && authenticated) saveSession(null);
    const fields = data?.erros ? Object.values(data.erros).join(" ") : "";
    throw new ApiError(response.status, fields || data?.mensagem || (response.status === 401 ? "Entre na sua conta para continuar." : response.status === 403 ? "Você não tem permissão para esta operação." : "Não foi possível concluir a operação. Tente novamente."));
  }
  return data as T;
}
export function imageUrl(value: string | null) {
  return value && (/^https?:\/\//i.test(value) || /^\/api\/catalogo\/imagens\/[a-z0-9-]+\.png$/.test(value)) ? value : "/placeholder.svg";
}
export function toProduct(p: ProductResponse): Product {
  const image = imageUrl(p.imagem);
  return { id: p.id, name: p.nome, category: p.categoriaNome, categoryId: p.categoriaId, price: p.preco,
    color: p.categoriaNome, image, gallery: [image], sizes: p.tamanho?.split(",").map(s => s.trim()).filter(Boolean) || [],
    stock: p.quantidade, description: p.descricao || "", tag: p.quantidade === 0 ? "Esgotado" : undefined };
}
export function toCartItems(cart: CartResponse, products: Product[]): CartItem[] {
  return cart.itens.map(i => ({ id: i.id, size: i.tamanho, quantity: i.quantidade, subtotal: i.subtotal,
    product: { ...(products.find(p => p.id === i.produtoId) || { id: i.produtoId, category: "", categoryId: 0, color: "", gallery: [imageUrl(i.imagemProduto)], sizes: [], stock: 20, description: "" }),
      name: i.nomeProduto, image: imageUrl(i.imagemProduto), price: i.preco } }));
}
export const api = {
  products: () => request<ProductResponse[]>("/produtos", "GET", undefined, false).then(ps => ps.map(toProduct)),
  categories: () => request<Category[]>("/categorias", "GET", undefined, false),
  login: (email: string, senha: string) => request<Session>("/auth/login", "POST", { email, senha }, false),
  register: (nome: string, email: string, senha: string) => request<Session>("/auth/registrar", "POST", { nome, email, senha }, false),
  me: () => request<Omit<Session, "token">>("/usuarios/me"),
  cart: () => request<CartResponse>("/carrinho"),
  add: (produtoId: number, tamanho: string) => request<CartResponse>("/carrinho/itens", "POST", { produtoId, tamanho, quantidade: 1 }),
  quantity: (id: number, quantidade: number) => request<CartResponse>(`/carrinho/itens/${id}`, "PUT", { quantidade }),
  remove: (id: number) => request<CartResponse>(`/carrinho/itens/${id}`, "DELETE"),
  addresses: () => request<Address[]>("/enderecos"),
  createAddress: (body: AddressInput) => request<Address>("/enderecos", "POST", body),
  order: (enderecoId: number, formaPagamento: string, quantidadeParcelas: number) => request<Order>("/pedidos", "POST", { enderecoId, formaPagamento, quantidadeParcelas }),
  orders: () => request<Order[]>("/pedidos/meus"),
  adminOrders: () => request<Order[]>("/admin/pedidos"),
  status: (id: number, status: Order["status"]) => request<Order>(`/admin/pedidos/${id}/status`, "PATCH", { status }),
};