const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');const fs=require('node:fs');const ts=require('typescript');
function setup(status=200,body={}){const storage=new Map([['nord.session',JSON.stringify({token:'shop'})]]),calls=[],events=[];
const ctx={exports:{},sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},window:{dispatchEvent:e=>events.push(e.type)},Event:class{constructor(type){this.type=type;}},fetch:async(...args)=>{calls.push(args);return {ok:status<400,status,json:async()=>body};}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/admin-api.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,ctx);return{api:ctx.exports,storage,calls,events};}
test('admin usa sessao independente da loja',async()=>{const {api,calls,storage}=setup();api.setAdminSession({token:'admin'});await api.adminApi.users(2);assert.equal(calls[0][0],'/api/admin/usuarios?page=2');assert.equal(calls[0][1].headers.Authorization,'Bearer admin');api.setAdminSession(null);assert.equal(JSON.parse(storage.get('nord.session')).token,'shop');});
test('cliente nao entra no painel',async()=>{const {api}=setup(200,{role:'CLIENTE',token:'customer'});await assert.rejects(api.adminApi.login('a@b.com','x'));assert.equal(api.adminSession(),null);});
test('revogacao encerra apenas sessao administrativa',async()=>{const {api,storage,events}=setup(401);api.setAdminSession({token:'expired'});await assert.rejects(api.adminApi.orders());assert.equal(api.adminSession(),null);assert.equal(JSON.parse(storage.get('nord.session')).token,'shop');assert.deepEqual(events,['nord:admin-expired']);});
