import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
const base=process.env.INVITE_TEST_URL||'http://127.0.0.1:4173';
const a=randomBytes(32).toString('hex'),b=randomBytes(32).toString('hex');
const slug='check-'+randomBytes(5).toString('hex');
const data={template:'rose',first:'Сатторҷон',second:'Мадинахон',date:'2027-06-12',time:'18:00',venue:'Тарабхона',address:'Исфара',message:'Матни санҷишӣ',locale:'tj',slug,eventType:'wedding',morningDate:'',morningTime:'',morningVenue:'',morningAddress:'',program:'18:00 — Пешвоз',guests:'',palette:'blue',hiddenSections:'story',textOverrides:JSON.stringify({welcomeTitle:'Меҳмонони гиромӣ!'})};
async function request(path='',token='',options={}){
 const headers=new Headers(options.headers);if(token)headers.set('Authorization','Bearer '+token);
 return fetch(base+'/api/orders'+path,{...options,headers});
}
function draft(id,extra={},photo=false,receipt=false){
 const form=new FormData();form.set('data',JSON.stringify({...data,...extra}));if(id)form.set('id',id);
 if(photo)form.set('photo',new File([Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jfGkAAAAASUVORK5CYII=','base64')],'photo.png',{type:'image/png'}));
 if(receipt){form.set('submit','yes');form.set('receipt',new File(['%PDF-1.4\nTest receipt'],'receipt.pdf',{type:'application/pdf'}));}
 return {method:'POST',body:form};
}
assert.equal((await request()).status,401);
assert.equal((await request('', '',draft())).status,401);
assert.equal((await request('', '',{headers:{'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'admin@example.com'}})).status,401);
assert.equal((await request('', 'invalid')).status,401);
let response=await request('',a,draft(undefined,{},true));
assert.equal(response.status,200,await response.clone().text());
const created=(await response.json()).order;assert.equal(created.status,'draft');assert.equal(created.photo,true);assert.equal(created.demo,false);
assert.equal(created.data.palette,'blue');assert.equal(created.data.hiddenSections,'story');assert.equal(JSON.parse(created.data.textOverrides).welcomeTitle,'Меҳмонони гиромӣ!');
const id=created.id;
response=await request('',a);let listing=await response.json();assert.equal(listing.orders.length,1);assert.equal(listing.orders[0].id,id);assert.equal(listing.orders[0].data.message,data.message);
assert.deepEqual((await (await request('',b)).json()).orders,[]);
assert.equal((await request('/'+id+'/photo',a)).status,200);
assert.equal((await request('/'+id+'/photo',b)).status,404);
assert.equal((await request('/'+id+'/photo')).status,401);
assert.equal((await request('',b,draft(id))).status,404);
assert.equal((await request('',b,draft())).status,409);
response=await request('',a,draft(undefined,{message:'Сохранено повторно'}));assert.equal(response.status,200);assert.equal((await response.json()).order.id,id);
assert.equal((await (await request('',a)).json()).orders.length,1);
assert.equal((await fetch(base+'/i/'+slug)).status,404);
assert.equal((await request('/guest-photo/'+slug)).status,404);
assert.equal((await request('/review',a)).status,403);
assert.equal((await request('/review',a,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,decision:'publish'})})).status,403);
response=await request('',a,draft(id,{},false,true));assert.equal(response.status,200,await response.clone().text());let submitted=(await response.json()).order;assert.equal(submitted.id,id);assert.equal(submitted.status,'pending');assert.equal(submitted.receipt,true);assert.equal(submitted.photo,true);
assert.equal((await request('/'+id+'/receipt',a)).status,200);
assert.equal((await request('/'+id+'/receipt',b)).status,404);
assert.equal((await request('',a,draft(id))).status,409);
assert.equal((await fetch(base+'/i/'+slug)).status,404);
assert.equal((await request('/guest-photo/'+slug)).status,404);
assert.equal((await request('',a,{...draft(id),headers:{'sec-fetch-site':'cross-site'}})).status,403);
console.log('PASS: server draft, photo recovery, secret isolation, idempotent retry, receipt on same order, no customer publication, guest protection.');
