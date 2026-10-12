"use client";
import { useEffect, useRef, useState } from "react";
import { api, saveSession } from "@/lib/api";
import { money } from "@/lib/money";
import type { Address, AddressInput, CartItem, Navigate, Order, Session, SimplePageType } from "@/lib/types";

type Props = { type: SimplePageType; navigate: Navigate; session: Session | null; items: CartItem[]; total: number; onOrder: () => void };
const field = "mt-2 w-full border-b border-border bg-transparent py-3 text-sm outline-none focus:border-primary";
const button = "bg-primary px-5 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-40";
const statusLabel = { AGUARDANDO_PAGAMENTO: "Aguardando pagamento", ENVIADO: "Enviado", ENTREGUE: "Entregue" };

export function SimplePage({type,navigate,session,items,total,onOrder}:Props) {
  const [register,setRegister]=useState(false);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [addresses,setAddresses]=useState<Address[]>([]);
  const [addressId,setAddressId]=useState("");
  const [orders,setOrders]=useState<Order[]>([]);
  const [payment,setPayment]=useState("PIX");
  const [confirmed,setConfirmed]=useState<Order|null>(null);
  const locked=useRef(false);
  const sessionId=session?.id;
  useEffect(()=>{
    if (!sessionId || type==="login") return;
    let active=true;
    setLoading(true);setError("");
    Promise.all([api.addresses(),api.orders()])
      .then(([as,os])=>{if(active){setAddresses(as);setAddressId(as[0] ? String(as[0].id) : "");setOrders(os);}})
      .catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[sessionId,type]);
  const run=async(action:()=>Promise<void>)=>{
    if(locked.current)return;
    locked.current=true;setBusy(true);setError("");
    try{await action();}catch(e){setError((e as Error).message);}finally{locked.current=false;setBusy(false);}
  };
  const submitAuth=(data:FormData)=>run(async()=>{
    const email=String(data.get("email"));const password=String(data.get("senha"));
    if(new TextEncoder().encode(password).length>72)throw new Error("Senha deve ter até 72 bytes em UTF-8.");
    const result=register ? await api.register(String(data.get("nome")),email,password) : await api.login(email,password);
    saveSession(result);navigate("perfil");
  });
  const submitOrder=(data:FormData)=>run(async()=>{
    let id=Number(addressId);
    if(!id){
      const address:AddressInput={cep:String(data.get("cep")),estado:String(data.get("estado")),cidade:String(data.get("cidade")),bairro:String(data.get("bairro")),rua:String(data.get("rua")),numero:Number(data.get("numero")),complemento:String(data.get("complemento")||"")};
      const saved=await api.createAddress(address);id=saved.id;setAddresses(prev=>[saved,...prev]);setAddressId(String(id));
    }
    const result=await api.order(id,payment,payment==="CARTAO" ? Number(data.get("parcelas")) : 1);
    setConfirmed(result);onOrder();
  });
  return <main className="mx-auto max-w-2xl animate-page px-5 py-16 lg:py-24">
    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">NÓRD / {type==="checkout"?"Finalizar":"Conta"}</p>
    <h1 className="mt-4 text-4xl font-black uppercase tracking-[-0.07em]">{type==="login" ? register?"Crie sua conta.":"Bem-vindo de volta." : type==="checkout"?"Finalizar pedido.":`Olá, ${session?.nome || "visitante"}.`}</h1>
    {error && <p role="alert" className="mt-6 border border-red-300 p-4 text-sm">{error}</p>}
    {loading && <p role="status" className="mt-6">Carregando seus dados...</p>}
    {type==="login" ? <form className="mt-10 space-y-5" onSubmit={e=>{e.preventDefault();void submitAuth(new FormData(e.currentTarget));}}>
      {register && <label className="block text-xs font-bold uppercase tracking-widest">Nome completo<input name="nome" required maxLength={100} autoComplete="name" className={field}/></label>}
      <label className="block text-xs font-bold uppercase tracking-widest">E-mail<input name="email" required maxLength={150} type="email" autoComplete="email" className={field}/></label>
      <label className="block text-xs font-bold uppercase tracking-widest">Senha<input name="senha" required minLength={register?8:1} maxLength={72} type="password" autoComplete={register?"new-password":"current-password"} className={field}/></label>
      <button disabled={busy} className={`${button} w-full`}>{busy?"Aguarde...":register?"Criar conta":"Entrar"}</button>
      <button type="button" disabled={busy} onClick={()=>{setRegister(!register);setError("");}} className="text-sm underline">{register?"Já tenho conta":"Quero criar uma conta"}</button>
    </form> : !session ? <div className="mt-10"><p>Entre para acessar seus dados e finalizar pedidos.</p><button className={`${button} mt-5`} onClick={()=>navigate("login")}>Entrar</button></div>
    : type==="checkout" ? confirmed ? <div className="mt-10 space-y-4 border border-border p-6"><h2 className="font-bold">Pedido #{confirmed.id} registrado.</h2><p>{statusLabel[confirmed.status]} · {money(confirmed.valorTotal)}</p><p className="text-sm text-muted-foreground">Demonstração de portfólio: nenhum pagamento foi cobrado.</p><button className={button} onClick={()=>navigate("perfil")}>Ver meus pedidos</button></div>
    : !items.length ? <div className="mt-10"><p>Seu carrinho está vazio.</p><button className={`${button} mt-5`} onClick={()=>navigate("catalogo")}>Ver catálogo</button></div>
    : <form className="mt-10 space-y-5" onSubmit={e=>{e.preventDefault();void submitOrder(new FormData(e.currentTarget));}}>
      <div className="border border-border p-5">{items.map(i=><p key={i.id} className="mb-2 text-sm">{i.quantity} × {i.product.name} ({i.size}) — {money(i.subtotal)}</p>)}<p className="mt-4 font-bold">Total: {money(total)}</p></div>
      <label className="block text-xs font-bold uppercase tracking-widest">Endereço de entrega<select disabled={busy||loading} value={addressId} onChange={e=>setAddressId(e.target.value)} className={field}><option value="">Cadastrar novo endereço</option>{addresses.map(a=><option key={a.id} value={a.id}>{a.rua}, {a.numero} — {a.cidade}/{a.estado}</option>)}</select></label>
      {!addressId && <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2"><legend className="mb-4 text-sm font-bold">Novo endereço</legend>
        {([{name:"cep",label:"CEP",max:9,pattern:"[0-9]{5}-?[0-9]{3}"},{name:"estado",label:"UF",max:2,pattern:"[A-Za-z]{2}"},{name:"cidade",label:"Cidade",max:80},{name:"bairro",label:"Bairro",max:80},{name:"rua",label:"Rua",max:120},{name:"numero",label:"Número",type:"number"},{name:"complemento",label:"Complemento",max:100}] as const).map(f=><label key={f.name} className="block text-xs font-bold uppercase tracking-widest">{f.label}<input className={field} name={f.name} required={f.name!=="complemento"} type={"type" in f ? f.type:"text"} min={f.name==="numero"?1:undefined} maxLength={"max" in f ? f.max:undefined} pattern={"pattern" in f ? f.pattern:undefined}/></label>)}
      </fieldset>}
      <label className="block text-xs font-bold uppercase tracking-widest">Forma de pagamento<select value={payment} disabled={busy} onChange={e=>setPayment(e.target.value)} className={field}><option value="PIX">PIX</option><option value="CARTAO">Cartão</option><option value="BOLETO">Boleto</option></select></label>
      {payment==="CARTAO" && <label className="block text-xs font-bold uppercase tracking-widest">Parcelas<select name="parcelas" className={field}>{Array.from({length:12},(_,i)=><option key={i} value={i+1}>{i+1}x</option>)}</select></label>}
      <p className="text-sm text-muted-foreground">Demonstração: o pedido será salvo, sem cobrança ou coleta de dados de cartão.</p><button disabled={busy||loading} className={`${button} w-full`}>{busy?"Registrando...":"Confirmar pedido"}</button>
    </form>
    : <div className="mt-10 space-y-6"><p>{session.email}</p><h2 className="font-bold uppercase">Meus pedidos</h2>{!loading&&!orders.length&&<p className="text-sm text-muted-foreground">Você ainda não tem pedidos.</p>}
      {orders.map(o=><article key={o.id} className="space-y-2 border border-border p-5"><h3 className="font-bold">Pedido #{o.id} · {statusLabel[o.status]}</h3><p>{money(o.valorTotal)} · {new Date(o.dataPedido).toLocaleDateString("pt-BR")}</p><p className="text-sm text-muted-foreground">{o.enderecoEntrega}</p>{o.itens.map((i,index)=><p key={index} className="text-sm">{i.quantidade} × {i.nomeProduto} ({i.tamanho})</p>)}</article>)}
      <h2 className="font-bold uppercase">Meus endereços</h2>{addresses.map(a=><p key={a.id} className="border border-border p-4 text-sm">{a.rua}, {a.numero} — {a.bairro}, {a.cidade}/{a.estado}, {a.cep}</p>)}
      <div className="flex gap-4"><button className={button} onClick={()=>navigate("catalogo")}>Continuar comprando</button><button className="underline" onClick={()=>{saveSession(null);navigate("home");}}>Sair</button></div>
    </div>}
  </main>;
}