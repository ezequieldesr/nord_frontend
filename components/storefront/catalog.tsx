"use client";

import { useMemo, useState } from "react";

import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

type CatalogProps = {
  onOpen: (product: Product) => void;
  initialFilter?: string;
  query: string;
  products: Product[]; categories: string[];
};

export function Catalog({ onOpen, initialFilter, query, products, categories }: CatalogProps) {
  const [filter, setFilter] = useState(initialFilter || "Todos");
  const [sort, setSort] = useState("Destaques");
  const filtered = useMemo(() => {
    const base =
      filter === "Todos"
        ? products
        : products.filter((p) => p.category === filter);
    const searched = query
      ? base.filter((p) =>
          `${p.name} ${p.color} ${p.category}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
      : base;
    return [...searched].sort((a, b) =>
      sort === "Menor preço"
        ? a.price - b.price
        : sort === "Maior preço"
          ? b.price - a.price
          : 0,
    );
  }, [filter, sort, query, products]);
  return (
    <main className="mx-auto max-w-7xl animate-page px-5 py-12 lg:px-8">
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
            O catálogo
          </p>
          <h1 className="text-5xl font-black uppercase tracking-[-0.08em]">
            {query ? `Busca: ${query}` : "Produtos"}
          </h1>
        </div>
        <p className="max-w-xs text-sm leading-6 text-muted-foreground">
          Uma curadoria de peças funcionais para todos os dias.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 py-6">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`whitespace-nowrap px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${filter === c ? "bg-primary text-primary-foreground" : "border border-border hover:border-primary"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
          Ordenar{" "}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent text-xs outline-none"
          >
            <option>Destaques</option>
            <option>Menor preço</option>
            <option>Maior preço</option>
          </select>
        </label>
      </div>
      {filtered.length ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={onOpen} />
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-sm text-muted-foreground">
          Nenhum produto encontrado.
        </p>
      )}
    </main>
  );
}
