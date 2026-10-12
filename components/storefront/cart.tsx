"use client";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { money } from "@/lib/money";
import type { CartItem } from "@/lib/types";
type Props = { items: CartItem[]; total: number; busy: boolean; onQuantity: (id:number,q:number)=>void; onRemove: (id:number)=>void; close:()=>void; checkout:()=>void };
export function Cart({items,total,busy,onQuantity,onRemove,close,checkout}:Props) {
  return <div className="fixed inset-0 z-50 animate-fade bg-primary/30" onClick={close}>
    <aside role="dialog" aria-modal="true" aria-label="Seu carrinho" onClick={e=>e.stopPropagation()} className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slide-in flex-col bg-background p-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-border pb-5"><h2 className="text-xl font-black uppercase">Seu carrinho</h2><button aria-label="Fechar carrinho" onClick={close}><X size={20}/></button></div>
      <div className="flex-1 overflow-y-auto py-5">{!items.length ? <div className="py-16 text-center"><ShoppingBag className="mx-auto"/><p className="mt-4">Seu carrinho está vazio.</p></div> : items.map(item=><div key={item.id} className="flex gap-4 border-b border-border py-4">
        <img src={item.product.image} alt={item.product.name} className="h-24 w-20 object-cover"/>
        <div className="flex-1"><div className="flex justify-between gap-2"><h3 className="text-xs font-bold">{item.product.name}</h3><button disabled={busy} aria-label="Remover item" onClick={()=>onRemove(item.id)}><X size={14}/></button></div>
          <p className="mt-1 text-xs text-muted-foreground">Tamanho {item.size}</p><div className="mt-4 flex items-center justify-between"><div className="flex items-center border border-border">
            <button aria-label="Diminuir quantidade" disabled={busy || item.quantity<=1} className="p-2 disabled:opacity-40" onClick={()=>onQuantity(item.id,item.quantity-1)}><Minus size={12}/></button><span className="w-7 text-center text-xs">{item.quantity}</span>
            <button aria-label="Aumentar quantidade" disabled={busy || item.quantity>=20} className="p-2 disabled:opacity-40" onClick={()=>onQuantity(item.id,item.quantity+1)}><Plus size={12}/></button></div><span className="text-sm font-semibold">{money(item.subtotal)}</span></div></div>
      </div>)}</div><div className="border-t border-border pt-5"><div className="flex justify-between text-sm font-bold"><span>Total</span><span>{money(total)}</span></div><button disabled={busy || !items.length} onClick={checkout} className="mt-5 w-full bg-primary px-5 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-40">Finalizar compra</button></div>
    </aside>
  </div>;
}