import assert from 'node:assert/strict';
import {randomBytes,createHash} from 'node:crypto';
import {Miniflare} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
const base='https://rsvp.test';
const mf=new Miniflare({modules:[{type:'ESModule',path:'dist/server/index.js'},...readdirSync('dist/server',{recursive:true}).filter(p=>p.endsWith('.js')&&p!=='index.js').map(p=>({type:'ESModule',path:'dist/server/'+p}))],modulesRoot:'dist/server',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET']});
const db=await mf.getD1Database('DB');
for(const file of readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort()){for(const statement of readFileSync('drizzle/'+file,'utf8').replaceAll('--> statement-breakpoint','').split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(statement).run();}
const fetch=(url,options)=>mf.dispatchFetch(url,options);
const token=()=>randomBytes(32).toString('hex');
const owner=token(),other=token(),guest=token(),second=token();
const slug='rsvp-test-'+randomBytes(5).toString('hex');const otherSlug=slug+'-other';
const data={template:'royal',first:'Санҷиш',second:'RSVP',date:'2027-06-12',time:'18:00',venue:'Санҷиш',address:'Исфара',message:'',locale:'ru',slug,eventType:'wedding',morningDate:'',morningTime:'',morningVenue:'',morningAddress:'',program:'',guests:'',palette:'royal'};
const hash=t=>'link:'+createHash('sha256').update(t).digest('hex');
async function sql(statement){return db.prepare(statement).run();}
async function draft(t,s){const id=randomBytes(10).toString('hex');await db.prepare("INSERT INTO invitation_orders (id,owner,slug,payload,status,demo,revision,updated) VALUES (?,?,?,?,'draft',0,?,?)").bind(id,hash(t),s,JSON.stringify({...data,slug:s}),id,Date.now()).run();return {id};}
async function get(t,s=slug,page=0){return fetch(base+`/api/rsvp/${s}?page=${page}`,{headers:t?{Authorization:'Bearer '+t}:{}});}
async function send(body,s=slug,headers={}){return fetch(base+'/api/rsvp/'+s,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});}
let a,b;
try{
 a=await draft(owner,slug);b=await draft(other,otherSlug);
 const answer={token:guest,name:'Меҳмони санҷишӣ',attending:true,guests:3};
 assert.equal((await send(answer)).status,404,'unpublished invitation refuses RSVP');
 await sql(`UPDATE invitation_orders SET status='published' WHERE id IN ('${a.id}','${b.id}')`);
 assert.equal((await get('')).status,401,'public list is private');
 assert.equal((await get(other)).status,404,'another owner cannot read answers');
 assert.equal((await send({...answer,guests:11})).status,400,'guest cap');
 assert.equal((await send({...answer,attending:false,guests:1})).status,400,'decline requires zero guests');
 assert.equal((await send({...answer,name:'\u0000bad'})).status,400,'control characters rejected');
 assert.equal((await send(answer,slug,{Origin:'https://example.invalid'})).status,403,'cross-origin rejected');
 assert.equal((await send(answer)).status,200);
 assert.equal((await send(answer)).status,200,'retry is idempotent');
 let results=await (await get(owner)).json();assert.equal(results.summary.responses,1);assert.equal(results.summary.guests,3);
 assert.equal(results.rows[0].tokenHash,undefined,'no capability hashes in results');
 assert.equal((await send({...answer,attending:false,guests:0})).status,200);
 results=await (await get(owner)).json();assert.deepEqual(results.summary,{responses:1,coming:0,declined:1,guests:0});
 assert.equal((await send({...answer,token:second,name:'Меҳмони дуюм',guests:2})).status,200);
 results=await (await get(owner)).json();assert.deepEqual(results.summary,{responses:2,coming:1,declined:1,guests:2});
 assert.equal((await (await get(other,otherSlug)).json()).summary.responses,0,'answers isolated by invitation');
 let throttled=false;for(let i=0;i<12;i++){const r=await send(answer);if(r.status===429){throttled=true;break;}assert.equal(r.status,200);}assert.ok(throttled,'rate limit enforced');
 console.log('RSVP PASS: publication, validation, private access, isolation, update, totals and throttling.');
}finally{await mf.dispose();}
