import { ArrowRight } from "lucide-react";

import type { Navigate, Product } from "@/lib/types";
import { ProductCard } from "./product-card";

export function Home({ navigate, products, onOpen }: { navigate: Navigate; products: Product[]; onOpen: (product: Product) => void }) {
  return (
    <main className="animate-page">
      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-16 pt-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:pt-10">
        <div className="relative min-h-[530px] overflow-hidden bg-muted lg:min-h-[650px]">
          <img
            src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1500&q=85"
            alt="Editorial NÓRD com jaqueta urbana"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-7 text-primary-foreground lg:p-10">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em]">
              Coleção inverno 2026
            </p>
            <h1 className="max-w-lg text-5xl font-black uppercase leading-[0.9] tracking-[-0.07em] md:text-7xl">
              Feito para
              <br />
              ir além.
            </h1>
            <button
              onClick={() => navigate("catalogo")}
              className="mt-7 inline-flex items-center gap-3 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:bg-accent hover:text-accent-foreground"
            >
              Explorar coleção <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="flex min-h-[530px] flex-col justify-between bg-accent p-7 lg:min-h-0 lg:p-10">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
              NÓRD / 002
            </p>
            <span className="text-4xl font-black tracking-[-0.1em]">N</span>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em]">
              O essencial, elevado
            </p>
            <h2 className="max-w-sm text-4xl font-black uppercase leading-[0.95] tracking-[-0.06em]">
              Design que acompanha seu ritmo.
            </h2>
            <p className="mt-5 max-w-xs text-sm leading-6 opacity-70">
              Peças honestas, materiais resistentes e uma nova forma de olhar
              para o cotidiano.
            </p>
            <button
              onClick={() => navigate("catalogo")}
              className="mt-8 border-b border-primary pb-2 text-xs font-bold uppercase tracking-widest"
            >
              Ver tudo <ArrowRight size={15} className="ml-2 inline" />
            </button>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest">
            São Paulo · Brasil
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between border-b border-border pb-5">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
              Seleção NÓRD
            </p>
            <h2 className="text-3xl font-black uppercase tracking-[-0.06em]">
              Mais procurados
            </h2>
          </div>
          <button
            onClick={() => navigate("catalogo")}
            className="text-xs font-bold uppercase tracking-widest underline underline-offset-4"
          >
            Ver catálogo
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {products.slice(0, 4).map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpen={onOpen}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
