import { spawnSync } from 'node:child_process';
import { readdirSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const result=spawnSync(process.execPath,['node_modules/@playwright/test/cli.js','test'],{stdio:'inherit',env:{...process.env,DEMO:'1'}});
if(result.status!==0)process.exit(result.status||1);
for(const [prefix,name] of [['journey-','nord-demo'],['admin-','nord-admin']]) {
  const folder=readdirSync('test-results',{withFileTypes:true}).find(d=>d.isDirectory()&&d.name.startsWith(prefix));
  if(!folder)throw Error(`Gravação ${prefix} não encontrada.`);
  const source=resolve('test-results',folder.name,'video.webm');
  mkdirSync('docs/demo',{recursive:true});copyFileSync(source,`docs/demo/${name}.webm`);
  console.log(`Vídeo final: docs/demo/${name}.webm`);
}
const results=JSON.parse(readFileSync('test-results/results.json','utf8'));
const tests=[];
function walk(suite){for(const spec of suite.specs||[])tests.push({name:spec.title,passed:spec.ok});for(const child of suite.suites||[])walk(child);}
for(const suite of results.suites)walk(suite);
writeFileSync('docs/demo/verification.json',JSON.stringify({recordedAt:new Date().toISOString(),browser:'Chromium',viewport:'1440x900 (desktop), 390x844 (mobile)',tests},null,2)+'\n');
