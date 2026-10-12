// Smoke test com backend controlado: verifica o proxy HTTP, não persistência PostgreSQL.
const http=require('node:http');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const seen=[];
const backend=http.createServer(async(req,res)=>{
  let body='';for await(const chunk of req)body+=chunk;
  seen.push({url:req.url,method:req.method,authorization:req.headers.authorization,body});
  res.setHeader('Content-Type','application/json');
  if(req.url==='/api/usuarios/me'){res.statusCode=401;res.end(JSON.stringify({mensagem:'Não autenticado'}));}
  else if(req.method==='POST'){res.statusCode=201;res.end(JSON.stringify({id:12,status:'AGUARDANDO_PAGAMENTO'}));}
  else res.end(JSON.stringify([{id:7,nome:'Produto do backend',preco:89.9}]));
});
let next;
async function main(){
  await new Promise((resolve,reject)=>{backend.once('error',reject);backend.listen(8080,'127.0.0.1',resolve);});
  next=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3100','-H','127.0.0.1'],{stdio:'ignore',env:{...process.env,NORD_API_URL:'http://127.0.0.1:8080'}});
  let ready=false;
  for(let i=0;i<80;i++){
    try{const r=await fetch('http://127.0.0.1:3100');if(r.ok){assert.match(await r.text(),/NÓRD/);ready=true;break;}}catch{}
    await new Promise(r=>setTimeout(r,250));
  }
  assert.ok(ready,'Frontend não iniciou');
  const catalog=await fetch('http://127.0.0.1:3100/api/produtos?categoriaId=2');
  assert.equal(catalog.status,200);assert.equal((await catalog.json())[0].id,7);
  assert.equal(seen.at(-1).url,'/api/produtos?categoriaId=2');
  const denied=await fetch('http://127.0.0.1:3100/api/usuarios/me');assert.equal(denied.status,401);
  const payload={enderecoId:3,formaPagamento:'PIX',quantidadeParcelas:1};
  const order=await fetch('http://127.0.0.1:3100/api/pedidos',{method:'POST',headers:{Authorization:'Bearer smoke-test-token','Content-Type':'application/json'},body:JSON.stringify(payload)});
  assert.equal(order.status,201);assert.equal(seen.at(-1).authorization,'Bearer smoke-test-token');assert.deepEqual(JSON.parse(seen.at(-1).body),payload);
  console.log('PASS: página Next, catálogo/query, status 401, POST de pedido e header JWT pelo proxy.');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{if(next)next.kill();backend.close();});