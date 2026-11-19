import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
const base=process.env.INVITE_TEST_URL||'http://127.0.0.1:4173';
const password=process.env.INVITE_ADMIN_TEST_PASSWORD;
assert.ok(password&&password.length>=16,'Provide INVITE_ADMIN_TEST_PASSWORD for a disposable local test environment.');
const suffix=randomBytes(5).toString('hex');
async function admin(path='',options={},cookie='',origin=true){
 const headers=new Headers(options.headers);
 if(origin&&options.method==='POST')headers.set('Origin',base);
 if(cookie)headers.set('Cookie',cookie);
 return fetch(base+'/api/admin'+path,{...options,headers});
}
function json(body){return {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)};}
async function login(candidate=password,ip='192.0.2.17'){
 const options=json({password:candidate});options.headers['cf-connecting-ip']=ip;
 return admin('/login',options);
}
const token=randomBytes(32).toString('hex');
const data={template:'rose',first:'Тест домод',second:'Тест арӯс',date:'2027-06-12',time:'18:00',venue:'Тарабхона',address:'Исфара',message:'Санҷиши нашр',locale:'tj',slug:'admin-'+suffix,eventType:'wedding',morningDate:'',morningTime:'',morningVenue:'',morningAddress:'',program:'',guests:''};
async function client(key=token,id,receipt=false,overrides={}){
 const form=new FormData();form.set('data',JSON.stringify({...data,...overrides}));if(id)form.set('id',id);
 if(receipt){form.set('submit','yes');form.set('receipt',new File(['%PDF-1.4\nSynthetic receipt'],'receipt.pdf',{type:'application/pdf'}));}
 return fetch(base+'/api/orders',{method:'POST',headers:{Authorization:'Bearer '+key},body:form});
}
assert.equal((await admin()).status,401);
assert.equal((await admin('/session')).status,401);
assert.equal((await admin('/session',{headers:{Authorization:'Bearer '+token}})).status,401);
assert.equal((await admin('/login',json({password}),'',false)).status,403);
assert.equal((await login('incorrect-password')).status,401);
let response=await login();assert.equal(response.status,200,await response.clone().text());
const setCookie=response.headers.get('set-cookie');assert.ok(setCookie.includes('HttpOnly'));assert.ok(setCookie.includes('SameSite=Strict'));assert.ok(setCookie.includes('Path=/api/admin'));
const cookie=setCookie.split(';')[0];
assert.equal((await admin('/session',{},cookie)).status,200);
assert.equal((await admin('/session',{},cookie+'broken')).status,401);
response=await client();assert.equal(response.status,200);let order=(await response.json()).order;
assert.equal((await admin('/review',json({id:order.id,revision:'wrong',decision:'publish'}),cookie)).status,409);
response=await client(token,order.id,true);assert.equal(response.status,200);order=(await response.json()).order;
response=await admin('?status=pending',{},cookie);assert.equal(response.status,200);let listing=await response.json();let pending=listing.orders.find(item=>item.id===order.id);assert.ok(pending);assert.equal(pending.price,100);
assert.equal((await admin('/'+order.id+'/receipt')).status,401);
response=await admin('/'+order.id+'/receipt',{},cookie);assert.equal(response.status,200);assert.ok((await response.text()).startsWith('%PDF-'));
assert.equal((await admin('/review',json({id:order.id,revision:pending.revision,decision:'publish'}))).status,401);
assert.equal((await admin('/review',json({id:order.id,revision:pending.revision,decision:'publish'}),cookie,false)).status,403);
assert.equal((await admin('/review',json({id:order.id,revision:pending.revision,decision:'return',note:''}),cookie)).status,400);
response=await admin('/review',json({id:order.id,revision:pending.revision,decision:'publish'}),cookie);assert.equal(response.status,200,await response.clone().text());const published=await response.json();assert.equal(published.order.status,'published');assert.equal(published.guestPath,'/i/'+data.slug);
response=await fetch(base+published.guestPath);assert.equal(response.status,200);const html=await response.text();assert.ok(html.includes(data.first));assert.ok(!html.includes(token));assert.ok(!html.includes(password));assert.ok(!html.includes('Ваша личная ссылка'));
assert.equal((await admin('/review',json({id:order.id,revision:pending.revision,decision:'publish'}),cookie)).status,409);
assert.equal((await client(token,order.id)).status,409);
const token2=randomBytes(32).toString('hex'),slug2='returned-'+suffix;
response=await client(token2,undefined,false,{slug:slug2});order=(await response.json()).order;
await client(token2,order.id,true,{slug:slug2});
response=await admin('/'+order.id,{},cookie);pending=(await response.json()).order;
response=await admin('/review',json({id:order.id,revision:pending.revision,decision:'return',note:'Прикрепите читаемый чек.'}),cookie);assert.equal(response.status,200);assert.equal((await response.json()).order.note,'Прикрепите читаемый чек.');
assert.equal((await fetch(base+'/i/'+slug2)).status,404);
response=await client(token2,order.id,false,{slug:slug2,message:'Исправлено'});assert.equal(response.status,200);assert.equal((await response.json()).order.status,'returned');
response=await client(token2,order.id,true,{slug:slug2,message:'Исправлено'});assert.equal(response.status,200);assert.equal((await response.json()).order.status,'pending');
response=await admin('/logout',{method:'POST'},cookie);assert.equal(response.status,200);assert.ok(response.headers.get('set-cookie').includes('Max-Age=0'));
assert.equal((await admin('/session',{},cookie)).status,401,'Logout must invalidate the server session, even if the old cookie is replayed.');
for(let index=0;index<5;index++)assert.equal((await login('incorrect-password','192.0.2.99')).status,401);
assert.equal((await login(password,'192.0.2.99')).status,429);
console.log('PASS: admin login, CSRF rejection, customer/admin isolation, receipt access, publication, stale revision, return/resubmit, revocable logout and login throttling.');
