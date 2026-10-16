import { test, expect, type Page, type Locator } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const demo = process.env.DEMO === '1';
const artifacts = 'docs/demo';
const adminEmail = process.env.E2E_ADMIN_EMAIL || 'admin@loja.com';
const adminPassword = process.env.E2E_ADMIN_PASSWORD || 'admin12345';
const password = 'NordDemo2026!';
async function pause(page: Page, ms = 1000) { if (demo) await page.waitForTimeout(ms); }
async function click(page: Page, locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (demo && box) { await page.mouse.move(box.x+box.width/2, box.y+box.height/2, { steps: 15 }); await pause(page,180); }
  await locator.click(); await pause(page,350);
}
async function type(page: Page, locator: Locator, value: string) {
  await locator.fill('');
  if (demo) await locator.pressSequentially(value, { delay: 28 }); else await locator.fill(value);
}
async function chapter(page: Page, title: string) {
  if (!demo) return;
  await page.evaluate(title => {
    let el = document.getElementById('demo-caption');
    if(!el) {el=document.createElement('div');el.id='demo-caption';document.body.append(el);}
    el.textContent=title;
    el.style.cssText='position:fixed;bottom:18px;left:24px;z-index:9999;pointer-events:none;background:#0f172aee;color:white;border-left:4px solid #6ee7b7;padding:14px 22px;font:500 15px sans-serif;border-radius:8px;box-shadow:0 8px 30px #0003;max-width:75vw';
    if(!document.getElementById('demo-cursor')) {
      const cursor=document.createElement('div');cursor.id='demo-cursor';cursor.style.cssText='position:fixed;width:22px;height:22px;border:2px solid #10b981;background:#6ee7b744;border-radius:50%;pointer-events:none;z-index:10000;transform:translate(-50%,-50%)';document.body.append(cursor);
      document.addEventListener('mousemove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';});
    }
  }, title);
  await pause(page,1300);
}
async function shot(page: Page, name: string) {
  if(!demo)return;
  mkdirSync(artifacts,{recursive:true});
  await page.screenshot({ path: `${artifacts}/${name}.png`, animations: 'disabled', style: '#demo-caption,#demo-cursor{visibility:hidden!important}' });
}
async function adminLogin(page: Page) {
  await page.goto('/admin');
  await page.getByRole('heading',{name:'Acesso administrativo'}).waitFor();
  await page.getByLabel('E-mail',{exact:true}).fill(adminEmail);
  await page.getByLabel('Senha',{exact:true}).fill(adminPassword);
  await click(page,page.getByRole('button',{name:'Entrar no painel'}));
  await expect(page.getByRole('button',{name:'Sair do painel'})).toBeVisible();
  await expect(page.getByText('Carregando dados…',{exact:true})).toBeHidden();
}

test('Jornada completa: descoberta, compra e operação administrativa', async ({ page, request }) => {
  const email=`marina.demo.${Date.now()}@example.com`;
  const runtimeErrors: string[]=[];
  page.on('pageerror',e=>runtimeErrors.push(e.message));
  let orderId=0;
  let initialStock=0;
  let productId=0;
  await test.step('01 · Vitrine, categorias, ordenação e busca', async()=>{
    await page.goto('/');
    await expect(page.getByRole('heading',{name:/Feito para/})).toBeVisible();
    await expect(page.getByText('Carregando catálogo...',{exact:true})).toBeHidden();
    await chapter(page,'01 / NÓRD — moda, catálogo e uma experiência de compra completa');
    await shot(page,'01-home'); await pause(page,1800);
    await click(page,page.getByRole('button',{name:'Explorar coleção'}));
    await expect(page.getByRole('heading',{name:'Produtos',exact:true})).toBeVisible();
    await click(page,page.locator('main').getByRole('button',{name:'Camisas',exact:true}));
    await expect(page.locator('main article')).toHaveCount(3);
    await page.getByLabel('Ordenar').selectOption('Menor preço');
    await expect(page.locator('main article').first()).toContainText('Camiseta Algodão Básica');
    await chapter(page,'02 / Encontre sua peça: categorias, preços e busca');
    await shot(page,'02-catalogo');
    await click(page,page.getByRole('button',{name:'Buscar',exact:true}));
    await type(page,page.getByRole('textbox',{name:'Buscar produto'}),'Dry Trail');
    await page.getByRole('textbox',{name:'Buscar produto'}).press('Enter');
    await expect(page.locator('main article')).toHaveCount(1);
    await click(page,page.getByRole('heading',{name:'Camiseta Dry Trail',exact:true}));
    await expect(page.getByRole('heading',{level:1,name:'Camiseta Dry Trail'})).toBeVisible();
    await click(page,page.getByRole('button',{name:'Ampliar imagem'}));
    await expect(page.getByRole('dialog',{name:'Imagem ampliada'})).toBeVisible();
    await pause(page,1200);
    await click(page,page.getByRole('button',{name:'Fechar imagem ampliada'}));
    const img=page.locator('main img[alt="Camiseta Dry Trail"]');
    await expect(img).toBeVisible();
    expect(await img.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBeTruthy();
    await shot(page,'03-produto');
  });
  await test.step('02 · Cadastro e login com sessão real',async()=>{
    await chapter(page,'03 / Sua conta: cadastro e autenticação conectados à API');
    await click(page,page.getByRole('button',{name:'Minha conta'}));
    await click(page,page.getByRole('button',{name:'Quero criar uma conta'}));
    await type(page,page.getByLabel('Nome completo'),'Marina Demo');
    await type(page,page.getByLabel('E-mail',{exact:true}),email);
    await page.getByLabel('Senha',{exact:true}).fill(password);
    await click(page,page.getByRole('button',{name:'Criar conta',exact:true}));
    await expect(page.getByRole('heading',{name:'Olá, Marina Demo.'})).toBeVisible();
    await click(page,page.getByRole('button',{name:'Sair',exact:true}));
    await click(page,page.getByRole('button',{name:'Minha conta'}));
    await page.getByLabel('E-mail',{exact:true}).fill(email);
    await page.getByLabel('Senha',{exact:true}).fill(password);
    await click(page,page.getByRole('button',{name:'Entrar',exact:true}));
    await expect(page.getByRole('heading',{name:'Olá, Marina Demo.'})).toBeVisible();
  });
  await test.step('03 · Carrinho: tamanho, quantidade e remoção',async()=>{
    await page.getByRole('textbox',{name:'Buscar produto'}).fill('');
    await click(page,page.getByRole('button',{name:'Continuar comprando'}));
    const products=await (await request.get('/api/produtos')).json();
    const p=products.find((p:{nome:string})=>p.nome==='Camiseta Dry Trail');
    initialStock=p.quantidade;productId=p.id;expect(initialStock).toBeGreaterThan(1);
    await click(page,page.getByRole('heading',{name:'Camiseta Dry Trail',exact:true}));
    await click(page,page.getByRole('button',{name:'M',exact:true}));
    await chapter(page,'04 / Carrinho: escolha seu tamanho e ajuste a quantidade');
    await click(page,page.getByRole('button',{name:'Adicionar ao carrinho'}));
    const cart=page.getByRole('dialog',{name:'Seu carrinho'});
    await expect(cart).toContainText('Tamanho M');
    await click(page,cart.getByRole('button',{name:'Aumentar quantidade'}));
    await expect(cart).toContainText('179,80');
    await click(page,cart.getByRole('button',{name:'Diminuir quantidade'}));
    await expect(cart).toContainText('89,90');
    await click(page,cart.getByRole('button',{name:'Remover item'}));
    await expect(cart).toContainText('Seu carrinho está vazio.');
    await click(page,cart.getByRole('button',{name:'Fechar carrinho'}));
    await click(page,page.getByRole('button',{name:'Adicionar ao carrinho'}));
    await expect(cart).toContainText('Camiseta Dry Trail');
    await shot(page,'04-carrinho');
    await click(page,cart.getByRole('button',{name:'Finalizar compra'}));
  });
  await test.step('04 · Endereço, pedido e baixa real de estoque',async()=>{
    await chapter(page,'05 / Checkout demonstrativo — endereço e pedido, sem cobrança');
    await expect(page.getByRole('heading',{name:'Finalizar pedido.'})).toBeVisible();
    for(const [label,value] of [['CEP','01001-000'],['UF','SP'],['Cidade','São Paulo'],['Bairro','Centro'],['Rua','Rua Demonstração'],['Número','100'],['Complemento','Dados fictícios para portfólio']])await type(page,page.getByLabel(label,{exact:true}),value);
    await page.getByLabel('Forma de pagamento').selectOption('PIX');
    await shot(page,'05-checkout');
    const orderResponse=page.waitForResponse(r=>r.url().endsWith('/api/pedidos')&&r.request().method()==='POST');
    await click(page,page.getByRole('button',{name:'Confirmar pedido'}));
    const response=await orderResponse;expect(response.status()).toBe(201);
    const order=await response.json();orderId=order.id;
    await expect(page.getByRole('heading',{name:`Pedido #${orderId} registrado.`})).toBeVisible();
    await expect(page.getByText('Demonstração de portfólio: nenhum pagamento foi cobrado.')).toBeVisible();
    const current=await (await request.get(`/api/produtos/${productId}`)).json();
    expect(current.quantidade).toBe(initialStock-1);
    await pause(page,1500);await shot(page,'06-pedido');
    await click(page,page.getByRole('button',{name:'Ver meus pedidos'}));
    await expect(page.locator('article').filter({hasText:`Pedido #${orderId} ·`})).toContainText('Aguardando pagamento');
    await page.reload();await click(page,page.getByRole('button',{name:'Minha conta'}));
    await expect(page.locator('article').filter({hasText:`Pedido #${orderId} ·`})).toContainText('Camiseta Dry Trail');
  });
  await test.step('05 · Administração e acompanhamento do pedido',async()=>{
    await adminLogin(page);
    await chapter(page,'06 / Backoffice: uma área própria para operar a loja');
    const order=page.locator('article').filter({hasText:`Pedido #${orderId} `});
    await expect(order).toContainText(email);
    await shot(page,'07-admin');
    await order.getByLabel('Etapa do pedido').selectOption('ENVIADO');
    await expect(page.getByRole('status')).toHaveText('Status atualizado.');
    await expect(order.getByLabel('Etapa do pedido')).toHaveValue('ENVIADO');
    await pause(page,1300);
    await click(page,page.getByRole('button',{name:'Produtos',exact:true}));
    await expect(page.getByRole('heading',{level:1,name:'Produtos'})).toBeVisible();
    await chapter(page,'07 / Produtos, estoque, categorias e controle de usuários');
    await shot(page,'08-admin-produtos');
    await click(page,page.getByRole('button',{name:'Categorias',exact:true}));await pause(page,1200);
    await click(page,page.getByRole('button',{name:'Usuários',exact:true}));
    while(await page.getByRole('row').filter({hasText:email}).count()===0){
      const next=page.getByRole('button',{name:'Próxima',exact:true});await expect(next).toBeEnabled();
      const resp=page.waitForResponse(r=>r.url().includes('/api/admin/usuarios?'));await click(page,next);await resp;
    }
    await expect(page.getByRole('row').filter({hasText:email})).toBeVisible();
    await shot(page,'09-admin-usuarios');
    await click(page,page.getByRole('button',{name:'Sair do painel'}));
    await page.goto('/');await click(page,page.getByRole('button',{name:'Minha conta'}));
    await expect(page.locator('article').filter({hasText:`Pedido #${orderId} ·`})).toContainText('Enviado');
    await chapter(page,'08 / Do catálogo à entrega: o cliente acompanha a atualização');
    await shot(page,'10-historico');await pause(page,2400);
    expect(runtimeErrors).toEqual([]);
  });
});
