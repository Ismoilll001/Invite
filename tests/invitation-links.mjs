import assert from 'node:assert/strict';
import {randomBytes,createHash} from 'node:crypto';
import {Miniflare} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
const base='https://links.test',token=()=>randomBytes(32).toString('hex'),ownerHash=t=>'link:'+createHash('sha256').update(t).digest('hex');
const mf=new Miniflare({modules:[{type:'ESModule',path:'dist/server/index.js'},...readdirSync('dist/server',{recursive:true}).filter(p=>p.endsWith('.js')&&p!=='index.js').map(p=>({type:'ESModule',path:'dist/server/'+p}))],modulesRoot:'dist/server',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET']});
const db=await mf.getD1Database('DB');
for(const file of readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())for(const stmt of readFileSync('drizzle/'+file,'utf8').replaceAll('--> statement-breakpoint','').split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(stmt).run();
const data={template:'rose',first:'Сатторҷон',second:'Мадинахон',date:'2027-06-12',time:'18:00',venue:'Test venue',address:'Исфара',message:'',locale:'tj',eventType:'wedding',morningDate:'',morningTime:'',morningVenue:'',morningAddress:'',program:'',guests:''};
const fetch=(path,init={})=>mf.dispatchFetch(base+path,init);
const get=(path,owner)=>fetch(path,{headers:owner?{Authorization:'Bearer '+owner}:{}});
async function seed(slug,status,owner){const id=token();await db.prepare('INSERT INTO invitation_orders (id,owner,slug,payload,status,demo,revision,updated) VALUES (?,?,?,?,?,0,?,?)').bind(id,ownerHash(owner),slug,JSON.stringify({...data,slug}),status,token(),Date.now()).run();return id;}
async function save(slug,owner){const form=new FormData();form.set('data',JSON.stringify({...data,slug}));const request=new Request(base+'/api/orders',{method:'POST',body:form});return fetch('/api/orders',{method:'POST',headers:{Authorization:'Bearer '+owner,'Content-Type':request.headers.get('Content-Type')},body:await request.arrayBuffer()});}
try{
 const owner=token(),other=token();
 const occupied=['sattorjon-madinakhon','madinakhon-sattorjon','sattorjon-madinakhon-2027'];
 let ownId;for(let i=0;i<occupied.length;i++) {const id=await seed(occupied[i],['draft','pending','published'][i],i?other:owner);if(!i)ownId=id;}
 const query='/api/orders/suggestions?base=sattorjon-madinakhon&reverse=madinakhon-sattorjon&year=2027';
 assert.equal((await get(query)).status,401);
 assert.equal((await get('/api/orders/suggestions?base=../bad',owner)).status,400);
 const a=await (await get(query,token())).json();assert.equal(a.suggestions.length,3);assert.equal(new Set(a.suggestions).size,3);assert.ok(a.suggestions.every(s=>!occupied.includes(s)&&s.length<=50&&/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)));
 const own=await (await get(query+'&id='+ownId,owner)).json();assert.equal(own.suggestions[0],occupied[0],'owner can keep existing address');
 const stolen=await (await get(query+'&id='+ownId,other)).json();assert.ok(!stolen.suggestions.includes(occupied[0]),'order ID alone does not bypass ownership');
 const fresh=await (await get(query+'&fresh=yes&id='+ownId,owner)).json();assert.ok(fresh.suggestions.every(s=>!occupied.includes(s)));
 const long=await (await get('/api/orders/suggestions?base='+('x'.repeat(50)),owner)).json();assert.ok(long.suggestions.every(s=>s.length<=50));
 assert.equal((await (await get('/api/orders/availability?slug='+occupied[0]+'&id='+ownId,owner)).json()).available,true);
 assert.equal((await (await get('/api/orders/availability?slug='+occupied[0]+'&id='+ownId,other)).json()).available,false);
 assert.equal((await (await get('/api/orders/availability?slug='+a.suggestions[0],owner)).json()).available,true);
 // Two clients can see the same free address; the unique index still gives it to only one.
 const candidate=a.suggestions[0],p=token(),q=token();
 const results=await Promise.all([save(candidate,p),save(candidate,q)]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
 const conflict=await results.find(r=>r.status===409).json();assert.equal(conflict.code,'slug_taken');
 const unavailable=await (await get('/api/orders/availability?slug='+candidate,token())).json();assert.equal(unavailable.available,false);
 const alternatives=await (await get(query+'&fresh=yes',token())).json();assert.ok(!alternatives.suggestions.includes(candidate));
 const retry=await save(alternatives.suggestions[0],results[0].status===409?p:q);assert.equal(retry.status,200);
 console.log('PASS: free suggestions, occupied drafts/pending/published, regeneration, owner reuse, ownership checks, length limits, concurrent claims and conflict recovery.');
}finally{await mf.dispose();}
