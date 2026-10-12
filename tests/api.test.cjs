const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const ts=require('typescript');
function setup(response={status:200,body:{}}){
  const storage=new Map();const calls=[];const events=[];
  const context={exports:{},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},window:{dispatchEvent:e=>events.push(e.type)},Event:class{constructor(type){this.type=type;}},fetch:async(...args)=>{calls.push(args);return {ok:response.status<400,status:response.status,json:async()=>response.body};}};
  const code=ts.transpileModule(fs.readFileSync('lib/api.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code,context);
  return {api:context.exports,calls,events};
}
test('catálogo usa proxy sem enviar token',async()=>{
  const {api,calls}=setup({status:200,body:[]});api.saveSession({token:'test-token'});await api.api.products();
  assert.equal(calls[0][0],'/api/produtos');assert.equal(calls[0][1].headers.Authorization,undefined);
});
test('carrinho envia JWT e contrato Nord, sem preço do navegador',async()=>{
  const {api,calls}=setup();api.saveSession({token:'test-token'});await api.api.add(7,'G');
  assert.equal(calls[0][1].headers.Authorization,'Bearer test-token');
  assert.deepEqual(JSON.parse(calls[0][1].body),{produtoId:7,tamanho:'G',quantidade:1});
});
test('checkout envia somente endereço, forma e parcelas',async()=>{
  const {api,calls}=setup();await api.api.order(9,'PIX',1);
  assert.deepEqual(JSON.parse(calls[0][1].body),{enderecoId:9,formaPagamento:'PIX',quantidadeParcelas:1});
});
test('401 protegido limpa sessão e notifica interface',async()=>{
  const {api,events}=setup({status:401,body:null});api.saveSession({token:'test-token'});
  await assert.rejects(api.api.cart(),e=>e.status===401);assert.equal(api.readSession(),null);assert.equal(events.length,2);
});
test('falha no login não elimina sessão de outra requisição',async()=>{
  const {api}=setup({status:401,body:null});api.saveSession({token:'test-token'});
  await assert.rejects(api.api.login('a@example.com','wrong'));assert.equal(api.readSession().token,'test-token');
});
test('mapeia tamanhos reais e bloqueia URL de imagem executável',()=>{
  const {api}=setup();const p=api.toProduct({id:1,nome:'Tênis',categoriaNome:'Tênis',categoriaId:2,preco:100,quantidade:3,tamanho:'38, 39,40',imagem:'javascript:alert(1)',descricao:'Descrição'});
  assert.equal(p.sizes.join(','),'38,39,40');assert.equal(p.stock,3);assert.equal(p.image,'/placeholder.svg');
});
test('valor do carrinho vem da resposta do servidor',()=>{
  const {api}=setup();const [item]=api.toCartItems({total:120,itens:[{id:5,produtoId:1,nomeProduto:'Camiseta',preco:60,quantidade:2,subtotal:120,tamanho:'M',imagemProduto:null}]},[]);
  assert.equal(item.id,5);assert.equal(item.subtotal,120);assert.equal(item.product.price,60);
});
test('erros de validação são apresentados ao usuário',async()=>{
  const {api}=setup({status:400,body:{mensagem:'Confira os campos',erros:{senha:'Senha inválida'}}});
  await assert.rejects(api.api.register('Nome','a@example.com','x'),e=>e.message==='Senha inválida');
});
test('aceita somente imagens locais da rota publica do catalogo',()=>{
  const {api}=setup();
  assert.equal(api.imageUrl('/api/catalogo/imagens/camisa-polo-nord.png'),'/api/catalogo/imagens/camisa-polo-nord.png');
  assert.equal(api.imageUrl('/api/usuarios/me'),'/placeholder.svg');
  assert.equal(api.imageUrl('/api/catalogo/imagens/../../application.properties'),'/placeholder.svg');
});