import { Heart } from "lucide-react";
import { money } from "@/lib/money";
import type { Product } from "@/lib/types";

type ProductCardProps = {
  product: Product;
  onOpen: (product: Product) => void;
};

export function ProductCard({ product, onOpen }: ProductCardProps) {
  return (
    <article
      className="group cursor-pointer animate-rise"
      onClick={() => onOpen(product)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <button
          aria-label={`Favoritar ${product.name}`}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-4 top-4 rounded-full bg-background/80 p-2 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Heart size={16} strokeWidth={1.5} />
        </button>
        {product.tag && (
          <span className="absolute left-4 top-4 bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
            {product.tag}
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-4 pt-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight">{product.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{product.color}</p>
        </div>
        <p className="text-sm font-semibold">{money(product.price)}</p>
      </div>
    </article>
  );
}
