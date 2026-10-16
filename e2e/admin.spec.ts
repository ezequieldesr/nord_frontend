import { test, expect, type Page, type Locator } from '@playwright/test';
const demo=process.env.DEMO==='1';
async function click(page:Page,loc:Locator){await loc.scrollIntoViewIfNeeded();await loc.click();if(demo)await page.waitForTimeout(800);}
async function chapter(page:Page,title:string){if(!demo)return;await page.evaluate(title=>{let el=document.getElementById('demo-caption');if(!el){el=document.createElement('div');el.id='demo-caption';document.body.append(el);}el.textContent=title;el.style.cssText='position:fixed;bottom:18px;left:24px;z-index:9999;pointer-events:none;background:#0f172aee;color:white;border-left:4px solid #6ee7b7;padding:14px 22px;font:500 15px sans-serif;border-radius:8px';},title);await page.waitForTimeout(1500);}
test('Gestão administrativa: categorias, produtos e usuários',async({page,request})=>{
 const suffix=Date.now().toString().slice(-6);const categoryName=`Estúdio Demo ${suffix}`;const productName=`Camiseta Estúdio ${suffix}`;
 const signup=await request.post('/api/auth/registrar',{data:{nome:'Conta de demonstração',email:`gestao.${suffix}@example.com`,senha:'NordDemo2026!'}});expect(signup.status()).toBe(201);const account=await signup.json();
 await page.goto('/admin');await page.getByLabel('E-mail',{exact:true}).fill(process.env.E2E_ADMIN_EMAIL||'admin@loja.com');await page.getByLabel('Senha',{exact:true}).fill(process.env.E2E_ADMIN_PASSWORD||'admin12345');await click(page,page.getByRole('button',{name:'Entrar no painel'}));await expect(page.getByRole('button',{name:'Sair do painel'})).toBeVisible();
 await test.step('Criar e editar categoria',async()=>{
   await chapter(page,'GESTÃO / Categorias: organize o catálogo');
   await click(page,page.getByRole('button',{name:'Categorias',exact:true}));await click(page,page.getByRole('button',{name:'Nova categoria'}));
   const editor=page.getByRole('region',{name:'Editor'});await editor.getByLabel('Nome',{exact:true}).fill(categoryName);await click(page,editor.getByRole('button',{name:'Salvar alterações'}));await expect(editor).toBeHidden();
   const card=page.locator('article').filter({hasText:categoryName});await expect(card).toBeVisible();await click(page,card.getByRole('button',{name:'Editar'}));await editor.getByLabel('Nome',{exact:true}).fill(categoryName+' / edição');await click(page,editor.getByRole('button',{name:'Salvar alterações'}));await expect(editor).toBeHidden();await expect(card).toContainText('/ edição');
 });
 await test.step('Criar produto, editar estoque e conferir vitrine real',async()=>{
   await chapter(page,'GESTÃO / Produtos: preço, imagem, tamanhos e estoque');
   await click(page,page.getByRole('button',{name:'Produtos',exact:true}));await click(page,page.getByRole('button',{name:'Novo produto'}));const editor=page.getByRole('region',{name:'Editor'});
   await editor.getByLabel('Nome',{exact:true}).fill(productName);await editor.getByRole('combobox',{name:'Categoria',exact:true}).selectOption({label:categoryName+' / edição'});await editor.getByLabel('Preço',{exact:true}).fill('119.90');await editor.getByLabel('Estoque',{exact:true}).fill('8');await editor.getByLabel('Tamanhos (separados por vírgula)').fill('P,M,G');await editor.getByLabel('URL da imagem').fill('/api/catalogo/imagens/camiseta-algodao-basica.png');await editor.getByLabel('Descrição',{exact:true}).fill('Produto fictício criado e validado na demonstração automatizada.');await click(page,editor.getByRole('button',{name:'Salvar alterações'}));await expect(editor).toBeHidden();
   const card=page.locator('article').filter({hasText:productName});await expect(card).toContainText('8 em estoque');await click(page,card.getByRole('button',{name:'Editar'}));await editor.getByLabel('Estoque',{exact:true}).fill('12');await click(page,editor.getByRole('button',{name:'Salvar alterações'}));await expect(editor).toBeHidden();await expect(card).toContainText('12 em estoque');
   const product=(await (await request.get('/api/produtos')).json()).find((p:{nome:string})=>p.nome===productName);expect(product.quantidade).toBe(12);expect(product.preco).toBe(119.9);
 });
 await test.step('Editar, desativar e excluir conta sem pedidos',async()=>{
   await chapter(page,'GESTÃO / Usuários: edição, desativação e sessões revogadas');
   await click(page,page.getByRole('button',{name:'Usuários',exact:true}));
   // Busca da interface é local à página: avance até encontrar a conta criada.
   while(await page.getByRole('row').filter({hasText:account.email}).count()===0){const next=page.getByRole('button',{name:'Próxima',exact:true});await expect(next).toBeEnabled();const resp=page.waitForResponse(r=>r.url().includes('/api/admin/usuarios?'));await click(page,next);await resp;}
   const row=page.getByRole('row').filter({hasText:account.email});await click(page,row.getByRole('button',{name:'Editar'}));const editor=page.getByRole('region',{name:'Editor'});await editor.getByLabel('Nome',{exact:true}).fill('Conta demonstrativa editada');await editor.getByLabel('Conta ativa').uncheck();await click(page,editor.getByRole('button',{name:'Salvar alterações'}));await expect(editor).toBeHidden();await expect(row).toContainText('Desativado');expect((await request.get('/api/usuarios/me',{headers:{Authorization:`Bearer ${account.token}`}})).status()).toBe(401);
   page.once('dialog',dialog=>dialog.accept());await click(page,row.getByRole('button',{name:'Excluir'}));await expect(row).toHaveCount(0);
 });
 await test.step('Excluir somente os dados de catálogo criados neste teste',async()=>{
   await chapter(page,'GESTÃO / Exclusões confirmadas e catálogo atualizado');
   await click(page,page.getByRole('button',{name:'Produtos',exact:true}));const product=page.locator('article').filter({hasText:productName});page.once('dialog',dialog=>dialog.accept());await click(page,product.getByRole('button',{name:'Excluir'}));await expect(product).toHaveCount(0);
   await click(page,page.getByRole('button',{name:'Categorias',exact:true}));const cat=page.locator('article').filter({hasText:categoryName});page.once('dialog',dialog=>dialog.accept());await click(page,cat.getByRole('button',{name:'Excluir'}));await expect(cat).toHaveCount(0);
   await chapter(page,'NÓRD / Gestão integrada à API e ao PostgreSQL');
 });
});
