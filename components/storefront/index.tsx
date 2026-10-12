"use client";
import { useEffect, useRef, useState } from "react";
import type { CartItem, CartResponse, Product, Session } from "@/lib/types";
import { api, readSession, SESSION_EVENT, toCartItems } from "@/lib/api";
import { Cart } from "./cart";
import { Catalog } from "./catalog";
import { Footer } from "./footer";
import { Header } from "./header";
import { Home } from "./home";
import { ProductView } from "./product-view";
import { SimplePage } from "./simple-page";

export default function Storefront() {
  const [route, setRoute] = useState("home");
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const catalogRef = useRef<Product[]>([]);
  const navigate = (r: string, c?: string) => {
    setRoute(r === "login" && readSession() ? "perfil" : r);
    setCategory(c || "Todos"); setSelected(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const applyCart = (cart: CartResponse) => { setItems(toCartItems(cart, catalogRef.current)); setTotal(cart.total); };
  const loadCatalog = async () => {
    setLoading(true); setError("");
    try {
      const [ps, cs] = await Promise.all([api.products(), api.categories()]);
      catalogRef.current = ps; setProducts(ps); setCategories(["Todos", ...cs.map(c => c.nome)]);
    } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  };
  useEffect(() => {
    void loadCatalog();
    let generation = 0;
    const sync = async () => {
      const current = ++generation;
      const s = readSession(); setSession(s); setItems([]); setTotal(0); setCartOpen(false);
      if (!s) return;
      try {
        const me = await api.me();
        if (current !== generation) return;
        setSession({ ...s, ...me });
        const cart = await api.cart();
        if (current === generation) applyCart(cart);
      } catch (e) { if (current === generation) setError((e as Error).message); }
    };
    void sync(); window.addEventListener(SESSION_EVENT, sync);
    return () => { generation++; window.removeEventListener(SESSION_EVENT, sync); };
  }, []);
  const mutate = async (operation: () => Promise<CartResponse>, open = false) => {
    if (!readSession()) { navigate("login"); return; }
    if (locked.current) return;
    const token = readSession()?.token;
    locked.current = true; setBusy(true); setError("");
    try { const cart = await operation(); if (readSession()?.token === token) { applyCart(cart); if (open) setCartOpen(true); } }
    catch (e) { setError((e as Error).message); }
    finally { locked.current = false; setBusy(false); }
  };
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const navCategories = categories.filter(c => c !== "Todos");
  return <div className="min-h-screen bg-background">
    <Header onCart={() => session ? setCartOpen(true) : navigate("login")} count={count} navigate={navigate} query={query} setQuery={setQuery} categories={navCategories} />
    {error && <div role="alert" className="relative z-[55] mx-auto max-w-7xl border border-red-300 bg-background p-4 text-sm">{error} <button className="ml-4 underline" onClick={() => setError("")}>Fechar</button></div>}
    {loading && <p role="status" className="p-6 text-center">Carregando catálogo...</p>}
    {!loading && !products.length && <div className="p-6 text-center"><p>Nenhum produto disponível no momento.</p><button className="mt-3 underline" onClick={() => void loadCatalog()}>Atualizar catálogo</button></div>}
    {selected ? <ProductView key={selected.id} product={selected} busy={busy} add={(p,s) => void mutate(() => api.add(p.id,s), true)} navigate={navigate} />
      : route === "home" ? <Home navigate={navigate} products={products} onOpen={setSelected} />
      : route === "catalogo" ? <Catalog key={category} initialFilter={category} query={query} products={products} categories={categories} onOpen={setSelected} />
      : <SimplePage key={route} type={route === "checkout" ? "checkout" : route === "perfil" ? "perfil" : "login"} navigate={navigate} session={session} items={items} total={total} onOrder={() => { setItems([]); setTotal(0); void loadCatalog(); }} />}
    <Footer navigate={navigate} />
    {cartOpen && <Cart items={items} total={total} busy={busy} onQuantity={(id,q) => void mutate(() => api.quantity(id,q))} onRemove={id => void mutate(() => api.remove(id))} close={() => setCartOpen(false)} checkout={() => { setCartOpen(false); navigate("checkout"); }} />}
  </div>;
}