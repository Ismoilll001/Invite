import assert from 'node:assert/strict';
import {randomBytes,createHash} from 'node:crypto';
import {Miniflare} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
const mf=new Miniflare({modules:[{type:'ESModule',path:'dist/server/index.js'},...readdirSync('dist/server',{recursive:true}).filter(p=>p.endsWith('.js')&&p!=='index.js').map(p=>({type:'ESModule',path:'dist/server/'+p}))],modulesRoot:'dist/server',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET']});
const db=await mf.getD1Database('DB');
for(const file of readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())for(const stmt of readFileSync('drizzle/'+file,'utf8').replaceAll('--> statement-breakpoint','').split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(stmt).run();
const base='https://invitations.test',token=()=>randomBytes(32).toString('hex'),ownerHash=t=>'link:'+createHash('sha256').update(t).digest('hex');
const payload={first:'Фарҳод',second:'Зарина',date:'2027-06-12',time:'18:00',venue:'Test venue',address:'Исфара',message:'Test welcome',locale:'ru',eventType:'wedding',morningDate:'',morningTime:'',morningVenue:'',morningAddress:'',program:'18:00 — Test program',guests:'',giftDetails:JSON.stringify({groom:{name:'Фарҳод',bank:'Test bank',account:'TEST-ACCOUNT',url:'https://bank.example/'}})};
const fetch=(url,options={})=>mf.dispatchFetch(base+url,options);
const get=(path,t)=>fetch(path,{headers:t?{Authorization:'Bearer '+t}:{}});
const post=(path,body,t,headers={})=>fetch(path,{method:'POST',headers:{'Content-Type':'application/json',...(t?{Authorization:'Bearer '+t}:{}),...headers},body:JSON.stringify(body)});
async function create(template){const id=token(),owner=token(),slug='test-'+template;const data={...payload,template,slug};await db.prepare("INSERT INTO invitation_orders (id,owner,slug,payload,status,demo,revision,updated) VALUES (?,?,?,?,'published',0,?,?)").bind(id,ownerHash(owner),slug,JSON.stringify(data),token(),Date.now()).run();return {id,owner,slug,data};}
try{
 const records=[];
 for(const template of ['rose','raabta','royal']){
  const r=await create(template);records.push(r);const root=`/api/invitations/${r.slug}`;
  assert.equal((await get(root+'/guests')).status,401);
  assert.equal((await post(root+'/guests',{names:['Зиёда']})).status,401);
  assert.equal((await post(root+'/guests',{names:['Зиёда']},r.owner,{Origin:'https://evil.test'})).status,403);
  assert.equal((await post(root+'/guests',{names:['Зиёда','Муҳаммад']},r.owner)).status,200);
  let g=await (await get(root+'/guests',r.owner)).json();assert.equal(g.rows.length,2);const guest=g.rows[0];r.guest=guest;
  assert.equal((await post(root+'/guests',{names:['Зиёда','Муҳаммад']},r.owner)).status,200);
  assert.deepEqual((await (await get(root+'/guests',r.owner)).json()).rows,g.rows,'imports are idempotent');
  const html=await (await get(`/i/${r.slug}?g=${guest.id}`)).text();assert.ok(html.includes('personal-greeting'),'personal greeting '+template);assert.ok(html.includes('invitation-wishes'),'wishes '+template);assert.ok(html.includes('invitation-gifts'),'gifts '+template);assert.ok(html.includes('TEST-ACCOUNT'),'gift details '+template);assert.ok(html.includes('id="rsvp"'),'RSVP '+template);
  assert.equal((await get(`/i/${r.slug}?g=${token()}`)).status,404);
  const wish={token:token(),name:'forged name',message:'Тӯй муборак!',guestId:guest.id};
  assert.equal((await post(root+'/wishes',wish)).status,200);
  assert.equal((await post(root+'/wishes',{...wish,token:token(),message:'Updated wish'})).status,200);
  const w=await (await get(root+'/wishes',r.owner)).json();assert.equal(w.rows.length,1);assert.equal(w.rows[0].name,guest.name,'server determines guest identity');assert.equal(w.rows[0].message,'Updated wish');assert.equal(w.rows[0].tokenHash,undefined);
  assert.equal((await get(root+'/wishes')).status,401);
  assert.equal((await post('/api/rsvp/'+r.slug,{token:token(),name:'forged name',attending:true,guests:2,guestId:guest.id})).status,200);
  const responses=await (await get('/api/rsvp/'+r.slug,r.owner)).json();assert.equal(responses.rows[0].name,guest.name);assert.equal(responses.summary.guests,2);
  // Visibility is enforced by both page rendering and the write endpoints.
  const hidden={...r.data,hiddenSections:'rsvp,wishes,gifts,music,photo,story,program,details,closing,countdown,welcome'};
  await db.prepare('UPDATE invitation_orders SET payload=? WHERE id=?').bind(JSON.stringify(hidden),r.id).run();
  const stripped=await (await get('/i/'+r.slug)).text();assert.ok(!stripped.includes('id="rsvp"'));assert.ok(!stripped.includes('class="invitation-rsvp invitation-wishes"'));assert.ok(!stripped.includes('class="invitation-rsvp invitation-gifts"'));assert.ok(!stripped.includes('class="invitation-music"'));
  assert.equal((await post(root+'/wishes',wish)).status,404);assert.equal((await post('/api/rsvp/'+r.slug,{token:token(),name:'Test guest',attending:true,guests:1})).status,404);
  await db.prepare('UPDATE invitation_orders SET payload=? WHERE id=?').bind(JSON.stringify(r.data),r.id).run();
 }
 const [a,b]=records;
 assert.equal((await get(`/api/invitations/${a.slug}/guests`,b.owner)).status,401);
 assert.equal((await post(`/api/invitations/${a.slug}/wishes`,{token:token(),name:'Test',message:'A long wish',guestId:b.guest.id})).status,404);
 assert.equal((await get(`/i/${a.slug}?g=${b.guest.id}`)).status,404);
 const many=Array.from({length:298},(_,i)=>'Меҳмон '+i);
 assert.equal((await post(`/api/invitations/${a.slug}/guests`,{names:many},a.owner)).status,200,'300 guests fit D1 parameter limits');
 assert.equal((await (await get(`/api/invitations/${a.slug}/guests`,a.owner)).json()).rows.length,300);
 assert.equal((await post(`/api/invitations/${a.slug}/guests`,{names:['Too many']},a.owner)).status,400);
 assert.equal((await post(`/api/invitations/${a.slug}/guests`,{remove:a.guest.id},a.owner)).status,200);assert.equal((await get(`/i/${a.slug}?g=${a.guest.id}`)).status,404,'removed links revoked');
 // Draft save roundtrips all added settings and rejects unsafe payment links.
 const draftOwner=token(),draft={...payload,template:'rose',slug:'roundtrip-test',hiddenSections:'wishes,gifts,music,story'};
 async function save(data){const form=new FormData();form.set('data',JSON.stringify(data));const req=new Request(base+'/api/orders',{method:'POST',body:form});return fetch('/api/orders',{method:'POST',headers:{Authorization:'Bearer '+draftOwner,'Content-Type':req.headers.get('Content-Type')},body:await req.arrayBuffer()});}
 let result=await save(draft);assert.equal(result.status,200,await result.clone().text());const saved=await result.json();assert.deepEqual(new Set(saved.order.data.hiddenSections.split(',')),new Set(draft.hiddenSections.split(',')));assert.equal(saved.order.data.giftDetails,draft.giftDetails.replace('}}','},"bride":{"name":"","bank":"","account":"","url":""}}'));
 for(const url of ['javascript:alert(1)','http://bank.test/','https://user:pass@bank.test/'])assert.equal((await save({...draft,giftDetails:JSON.stringify({groom:{url}})})).status,400);
 assert.equal((await post(`/api/invitations/${b.slug}/wishes`,{token:token(),name:'Test',message:'x'})).status,400);
 let throttled=false;for(let i=0;i<7;i++){const r=await post(`/api/invitations/${b.slug}/wishes`,{token:token(),name:'Test guest',message:'Тӯй муборак!'});if(r.status===429){throttled=true;break;}}assert.ok(throttled);
 console.log('PASS: all 3 designs, personalised links, RSVP identity, private wishes, deduplication, 300-guest import, revocation, section switches, gift validation and throttling.');
}finally{await mf.dispose();}
