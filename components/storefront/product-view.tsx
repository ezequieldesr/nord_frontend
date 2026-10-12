"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

import { money } from "@/lib/money";
import type { Navigate, Product } from "@/lib/types";

type ProductViewProps = {
  product: Product;
  add: (product: Product, size: string) => void;
  navigate: Navigate; busy: boolean;
};

export function ProductView({ product, add, navigate, busy }: ProductViewProps) {
  const sizes = product.sizes.length ? product.sizes : ["Único"];
  const [size, setSize] = useState(sizes[0]);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    const close = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const image = product.gallery[active];
  return (
    <main className="mx-auto max-w-7xl animate-page px-5 py-8 lg:px-8">
      <button
        onClick={() => navigate("catalogo")}
        className="mb-8 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
      >
        ← Voltar ao catálogo
      </button>
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid grid-cols-[72px_1fr] gap-3">
          <div className="flex flex-col gap-2">
            {product.gallery.map((src, i) => (
              <button
                key={src}
                onClick={() => setActive(i)}
                className={`aspect-square overflow-hidden border-2 ${active === i ? "border-primary" : "border-transparent"}`}
              >
                <img
                  src={src}
                  alt={`Visualização ${i + 1} de ${product.name}`}
                  className="h-full w-full object-contain"
                />
              </button>
            ))}
          </div>
          <div className="group relative aspect-[4/5] overflow-hidden bg-muted">
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
            />
            <button
              aria-label="Ampliar imagem"
              onClick={() => setZoom(true)}
              className="absolute bottom-4 right-4 flex items-center gap-2 bg-background/90 px-3 py-2 text-[10px] font-bold uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ZoomIn size={15} /> Ampliar
            </button>
            <div className="absolute inset-x-4 top-4 flex justify-between">
              <button
                aria-label="Imagem anterior"
                onClick={() =>
                  setActive(
                    (active - 1 + product.gallery.length) %
                      product.gallery.length,
                  )
                }
                className="rounded-full bg-background/85 p-2"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                aria-label="Próxima imagem"
                onClick={() => setActive((active + 1) % product.gallery.length)}
                className="rounded-full bg-background/85 p-2"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center lg:pl-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
            NÓRD / {product.category}
          </p>
          <h1 className="mt-4 text-4xl font-black uppercase leading-none tracking-[-0.06em] md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 text-2xl font-semibold">{money(product.price)}</p>
          <p className="mt-7 max-w-md text-sm leading-7 text-muted-foreground">
            {product.description}
          </p>
          <div className="mt-9 border-t border-border pt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest">
              Tamanho
            </p>
            <div className="flex gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`h-11 w-12 border text-xs font-bold transition-colors ${size === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button
            disabled={busy || product.stock === 0}
            onClick={() => add(product, size)}
            className="mt-8 bg-primary px-5 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {busy ? "Adicionando..." : product.stock === 0 ? "Esgotado" : "Adicionar ao carrinho"}
          </button>
        </div>
      </div>
      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Imagem ampliada"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-primary/80 p-5"
          onClick={() => setZoom(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl animate-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={image}
              alt={`${product.name} ampliado`}
              className="max-h-[85vh] max-w-full object-contain"
            />
            <button
              aria-label="Fechar imagem ampliada"
              onClick={() => setZoom(false)}
              className="absolute right-3 top-3 rounded-full bg-background p-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
