import { test, expect } from '@playwright/test';
test.use({ video: 'off' });
test('API real: autorização, isolamento, estoque e revogação de sessões',async({request})=>{
  const suffix=Date.now();const senha='NordChecks2026!';
  const create=async(label:string)=>{
    const res=await request.post('/api/auth/registrar',{data:{nome:label,email:`${label}.${suffix}@example.com`,senha}});
    expect(res.status()).toBe(201);return res.json();
  };
  const a=await create('cliente-a'),b=await create('cliente-b');
  const ah={Authorization:`Bearer ${a.token}`},bh={Authorization:`Bearer ${b.token}`};
  const adminRes=await request.post('/api/auth/login',{data:{email:process.env.E2E_ADMIN_EMAIL||'admin@loja.com',senha:process.env.E2E_ADMIN_PASSWORD||'admin12345'}});
  expect(adminRes.status()).toBe(200);const admin=await adminRes.json();const headers={Authorization:`Bearer ${admin.token}`};
  for(const path of ['/api/admin/usuarios','/api/admin/pedidos']){
    expect((await request.get(path)).status()).toBe(401);
    expect((await request.get(path,{headers:ah})).status()).toBe(403);
  }
  expect((await request.post('/api/produtos',{headers:ah,data:{}})).status()).toBe(403);
  const address={cep:'01001-000',estado:'SP',cidade:'São Paulo',bairro:'Centro',rua:'Rua Fictícia',numero:100};
  const ar=await request.post('/api/enderecos',{headers:ah,data:address});expect(ar.status()).toBe(201);const addr=await ar.json();
  expect((await request.put(`/api/enderecos/${addr.id}`,{headers:bh,data:address})).status()).toBe(404);
  expect((await request.delete(`/api/enderecos/${addr.id}`,{headers:bh})).status()).toBe(404);
  const p=(await (await request.get('/api/produtos')).json()).find((p:{nome:string})=>p.nome==='Camiseta Dry Trail');
  const cart=await request.post('/api/carrinho/itens',{headers:ah,data:{produtoId:p.id,tamanho:'M',quantidade:1}});expect(cart.status()).toBe(200);
  const item=(await cart.json()).itens[0];
  expect((await request.put(`/api/carrinho/itens/${item.id}`,{headers:bh,data:{quantidade:2}})).status()).toBe(404);
  expect((await request.post('/api/pedidos',{headers:bh,data:{enderecoId:addr.id,formaPagamento:'PIX',quantidadeParcelas:1}})).ok()).toBeFalsy();
  expect((await request.put(`/api/carrinho/itens/${item.id}`,{headers:ah,data:{quantidade:21}})).status()).toBe(400);
  const or=await request.post('/api/pedidos',{headers:ah,data:{enderecoId:addr.id,formaPagamento:'PIX',quantidadeParcelas:1}});expect(or.status()).toBe(201);const order=await or.json();
  expect(order.valorTotal).toBe(p.preco);
  expect(await (await request.get('/api/pedidos/meus',{headers:bh})).json()).toEqual([]);
  expect((await request.delete(`/api/admin/usuarios/${a.id}`,{headers})).status()).toBe(400);
  expect((await request.patch(`/api/admin/pedidos/${order.id}/status`,{headers,data:{status:'ENVIADO'}})).status()).toBe(200);
  expect((await request.patch(`/api/admin/pedidos/${order.id}/status`,{headers,data:{status:'AGUARDANDO_PAGAMENTO'}})).status()).toBe(400);
  expect((await request.put(`/api/admin/usuarios/${a.id}`,{headers,data:{nome:'Conta desativada',email:a.email,role:'CLIENTE',ativo:false}})).status()).toBe(200);
  expect((await request.get('/api/usuarios/me',{headers:ah})).status()).toBe(401);
  expect((await request.post('/api/auth/login',{data:{email:a.email,senha}})).status()).toBe(401);
  expect((await request.delete(`/api/admin/usuarios/${admin.id}`,{headers})).status()).toBe(400);
  expect((await request.delete(`/api/admin/usuarios/${b.id}`,{headers})).status()).toBe(204);
});
