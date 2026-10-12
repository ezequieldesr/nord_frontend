"use client";

import { useState } from "react";
import { Search, ShoppingBag, UserRound } from "lucide-react";
import type { Navigate } from "@/lib/types";

type HeaderProps = {
  onCart: () => void;
  count: number;
  navigate: Navigate;
  query: string;
  categories: string[];
  setQuery: (value: string) => void;
};

export function Header({
  onCart,
  count,
  navigate,
  query,
  setQuery, categories,
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <>
      <div className="bg-primary px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-foreground">
        Frete grátis nas compras acima de R$ 499
      </div>
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 lg:px-8">
          <button
            className="text-2xl font-black tracking-[-0.08em]"
            onClick={() => navigate("home")}
          >
            NÓRD
          </button>
          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.16em] md:flex">
            <button onClick={() => navigate("catalogo")} className="transition-colors hover:text-accent">Todos</button>
            {categories.slice(0, 4).map(c => <button key={c} onClick={() => navigate("catalogo", c)} className="transition-colors hover:text-accent">{c}</button>)}          </nav>
          <div className="flex items-center gap-4">
            {searchOpen && (
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && navigate("catalogo")}
                placeholder="Buscar produto"
                aria-label="Buscar produto"
                className="w-32 border-b border-primary bg-transparent py-1 text-xs outline-none sm:w-44"
              />
            )}
            <button
              aria-label="Buscar"
              onClick={() => setSearchOpen((value) => !value)}
              className="transition-transform hover:scale-110"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>
            <button
              aria-label="Minha conta"
              onClick={() => navigate("login")}
              className="transition-transform hover:scale-110"
            >
              <UserRound size={19} strokeWidth={1.5} />
            </button>
            <button
              aria-label="Abrir carrinho"
              onClick={onCart}
              className="relative transition-transform hover:scale-110"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
