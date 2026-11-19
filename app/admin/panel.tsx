"use client";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {InvitationPage} from "../invitation-page";
import {templateName,templates,type Order} from "../model";

type AdminOrder=Order&{revision:string;updated:number;price:number};
type Listing={orders:AdminOrder[];nextCursor:string|null};
class AdminError extends Error{constructor(message:string,readonly status:number){super(message);}}
async function api<T>(path="",options?:RequestInit):Promise<T>{
 const response=await fetch("/api/admin"+path,{...options,credentials:"same-origin",cache:"no-store"});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new AdminError(data&&typeof data==="object"&&"error" in data&&typeof data.error==="string"?data.error:"Не удалось выполнить запрос.",response.status);
 return data as T;
}
const labels:Record<string,string>={pending:"На проверке",published:"Опубликованы",returned:"Возвращены",draft:"Ожидают оплаты",all:"Все заказы"};
export function AdminPanel(){
 const [authenticated,setAuthenticated]=useState(false),[checking,setChecking]=useState(true);
 const [password,setPassword]=useState(""),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(false);
 const [filter,setFilter]=useState("pending"),[items,setItems]=useState<AdminOrder[]>([]),[nextCursor,setNextCursor]=useState<string|null>(null);
 const [preview,setPreview]=useState<AdminOrder|null>(null),[returning,setReturning]=useState<string|null>(null),[note,setNote]=useState("");
 const requestId=useRef(0);
 function fail(value:unknown){
  if(value instanceof AdminError&&value.status===401){setAuthenticated(false);setItems([]);setPreview(null);}
  setError(value instanceof Error?value.message:"Не удалось выполнить операцию.");
 }
 useEffect(()=>{
  let active=true;
  api("/session").then(()=>{if(active)setAuthenticated(true);}).catch(e=>{if(active&&(!(e instanceof AdminError)||e.status!==401))fail(e);}).finally(()=>{if(active)setChecking(false);});
  return()=>{active=false;};
 },[]);
 async function load(cursor?:string){
  const run=++requestId.current;setLoading(true);setError("");
  try{
   const listing=await api<Listing>("?status="+filter+(cursor?"&cursor="+encodeURIComponent(cursor):""));
   if(run===requestId.current){setItems(current=>cursor?[...current,...listing.orders.filter(item=>!current.some(saved=>saved.id===item.id))]:listing.orders);setNextCursor(listing.nextCursor);}
  }catch(e){if(run===requestId.current)fail(e);}finally{if(run===requestId.current)setLoading(false);}
 }
 useEffect(()=>{if(authenticated){setItems([]);setNextCursor(null);void load();}return()=>{requestId.current++;};},[authenticated,filter]);
 async function login(event:FormEvent){
  event.preventDefault();if(busy)return;setBusy(true);setError("");
  try{await api("/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});setAuthenticated(true);setNotice("");}
  catch(e){fail(e);}finally{setPassword("");setBusy(false);}
 }
 async function logout(){
  if(busy)return;setBusy(true);setError("");
  try{await api("/logout",{method:"POST"});requestId.current++;setAuthenticated(false);setItems([]);setPreview(null);setNotice("");}
  catch(e){fail(e);}finally{setBusy(false);}
 }
 async function review(item:AdminOrder,decision:"publish"|"return"){
  if(busy)return;setBusy(true);setError("");setNotice("");
  try{
   const result=await api<{order:AdminOrder;guestPath:string|null}>("/review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:item.id,revision:item.revision,decision,note})});
   setReturning(null);setNote("");
   setNotice(result.guestPath?"Приглашение опубликовано. Ссылка для гостей: "+location.origin+result.guestPath:"Заказ возвращён клиенту с комментарием.");
   if(preview?.id===item.id)setPreview(result.order);
   await load();
  }catch(e){fail(e);}finally{setBusy(false);}
 }
 async function copyGuest(item:AdminOrder){
  const link=location.origin+"/i/"+item.data.slug;
  try{await navigator.clipboard.writeText(link);setNotice("Ссылка для гостей скопирована.");}catch{setNotice("Ссылка для гостей: "+link);}
 }
 if(checking)return <main className="admin-shell"><p role="status">Проверяем вход…</p></main>;
 if(!authenticated)return <main className="admin-shell"><section className="admin-login"><a href="/" className="admin-brand">KHUSHBAKHT</a><h1>Вход администратора</h1><p>Введите пароль, сохранённый в Cloudflare.</p>
  <form onSubmit={login}><label>Пароль<input type="password" autoComplete="current-password" name="password" required maxLength={512} value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="button" disabled={busy}>{busy?"Входим…":"Войти"}</button></form>
  {error&&<p className="alert" role="alert">{error}</p>}
 </section></main>;
 if(preview)return <main className="admin-preview"><div className="admin-preview-toolbar"><button className="button secondary" onClick={()=>setPreview(null)}>К списку заказов</button><strong>Предпросмотр заказа · {labels[preview.status]}</strong>{preview.receipt&&<a className="button secondary" href={`/api/admin/${preview.id}/receipt`} target="_blank" rel="noreferrer">Открыть чек</a>}</div><InvitationPage data={preview.data} photo={preview.photo?`/api/admin/${preview.id}/photo`:undefined}/></main>;
 return <main className="admin-shell"><div className="admin-header"><div><a className="admin-brand" href="/">KHUSHBAKHT</a><h1>Управление заказами</h1></div><button className="button secondary" disabled={busy} onClick={logout}>Выйти</button></div>
  <div className="admin-filters"><label>Статус<select value={filter} disabled={busy} onChange={e=>{setFilter(e.target.value);setReturning(null);setNotice("");}}>{Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><button className="button secondary" disabled={busy||loading} onClick={()=>load()}>Обновить</button></div>
  {notice&&<p className="notice admin-notice" role="status">{notice}</p>}{error&&<p className="alert" role="alert">{error}</p>}
  {!items.length&&<p role="status">{loading?"Загружаем заказы…":"Заказов с этим статусом пока нет."}</p>}
  <div className="admin-orders">{items.map(item=>{
   const template=templates.find(value=>value.id===item.data.template)??templates[0];
   return <article className="admin-order" key={item.id}><div className="admin-order-heading"><div><span className={`status ${item.status}`}>{labels[item.status]}</span><h2>{item.data.first} и {item.data.second}</h2><p>{templateName(template,"ru")} · {item.price} сомони</p><p>{item.data.eventType==="morning"?item.data.morningDate:item.data.date} · {item.data.eventType==="morning"?item.data.morningVenue:item.data.venue}</p></div><small>Обновлён {new Date(item.updated).toLocaleString("ru-RU",{timeZone:"Asia/Dushanbe"})}</small></div>
    {item.note&&<p className="notice">{item.note}</p>}
    <div className="admin-actions"><button className="button secondary" onClick={()=>setPreview(item)}>Посмотреть приглашение</button>{item.receipt&&<a className="button secondary" href={`/api/admin/${item.id}/receipt`} target="_blank" rel="noreferrer">Открыть чек</a>}
     {item.status==="pending"&&<><button className="button" disabled={busy||!item.receipt} onClick={()=>review(item,"publish")}>{busy?"Подождите…":"Опубликовать"}</button><button className="button secondary" disabled={busy} onClick={()=>{setReturning(item.id);setNote("");}}>Вернуть на исправление</button></>}
     {item.status==="published"&&<><a className="button" href={`/i/${item.data.slug}`} target="_blank" rel="noreferrer">Открыть сайт гостя</a><button className="button secondary" onClick={()=>copyGuest(item)}>Скопировать ссылку гостя</button></>}
    </div>
    {returning===item.id&&<form className="admin-return" onSubmit={event=>{event.preventDefault();void review(item,"return");}}><label>Что нужно исправить<textarea required maxLength={500} value={note} onChange={e=>setNote(e.target.value)}/></label><div className="admin-actions"><button className="button" disabled={busy||!note.trim()}>Отправить клиенту</button><button className="button secondary" type="button" disabled={busy} onClick={()=>setReturning(null)}>Отмена</button></div></form>}
   </article>;
  })}</div>
  {nextCursor&&<button className="button secondary" disabled={loading||busy} onClick={()=>load(nextCursor)}>{loading?"Загружаем…":"Показать ещё"}</button>}
 </main>;
}
