"use client";

import {useEffect,useRef,useState,type FormEvent} from "react";
import {createEditToken} from "./link-access";
import {TemplateCatalog} from "./template-catalog";
import {VisualEditor} from "./visual-editor";
import {empty,paletteFor,palettesFor,templateName,templates,validSlug,type Invite,type Order,type SiteLanguage} from "./model";

type Tab="home"|"catalog"|"edit"|"orders";
type Listing={orders:Order[];live:boolean;price:number;instructions:string;admin:boolean};
const endpoint="/api/orders";
const draftKey="khushbakhtDraft";
const accessKey="khushbakhtLinks";
type SavedAccess={token:string;order:Order};
function readAccesses():SavedAccess[]{
 try {const value=JSON.parse(localStorage.getItem(accessKey)||"[]");return Array.isArray(value)?value.filter(item=>/^[a-f0-9]{64}$/.test(item.token)&&item.order?.id).slice(0,30):[];}catch{return [];}
}
function editLink(token:string){return location.origin+"/?tab=edit#edit="+token;}


const words={
 tj:{templates:"Қолабҳо",my:"Даъватномаҳои ман",review:"Санҷиши фармоишҳо",create:"Сохтани даъватнома",tag:"ДАЪВАТНОМАҲОИ ОНЛАЙН",hero:"Ҷашни Шумо аз ҳамин ҷо оғоз мешавад",heroText:"Даъватномаи зебои онлайн созед, маълумоти ҷашнро ворид намоед ва пайвандро ба меҳмонон фиристед.",benefits:"Зебо, зуд ва барои меҳмонон қулай",benefitText:"Қолабҳои премиалӣ, таҳрири осон, харита, барнома ва ҷавоби меҳмонон — ҳама дар як пайванд.",design:"Тарҳи зебо",designText:"Ҳар қолаб барои телефон ва ҳарфҳои тоҷикӣ бодиққат омода шудааст.",fast:"Сарфаи вақт",fastText:"Маълумотро пур кунед, расидро фиристед ва пас аз санҷиш пайвандро гиред.",how:"Чӣ тавр кор мекунад",steps:["Қолабро интихоб кунед","Маълумотро пур кунед","Пардохт ва санҷиш","Пайвандро ба меҳмонон фиристед"],faq:"Саволҳои маъмул",final:"Даъватномаи худро имрӯз созед",choose:"Интихоби қолаб",footer:"Лоиҳа аз ҷониби WOW PRINT",editor:"Сохтани даъватнома",preview:"Пешнамоиш",back:"Қафо",next:"Давом додан",skip:"Гузаронидан",send:"Фиристодан барои санҷиш",saveLocal:"Пешнавис дар ин дастгоҳ худкор нигоҳ дошта мешавад.",signin:"Барои фиристодан ворид шавед",currency:"сомонӣ"},
 ru:{templates:"Шаблоны",my:"Мои приглашения",review:"Проверка заказов",create:"Создать приглашение",tag:"ОНЛАЙН-ПРИГЛАШЕНИЯ",hero:"Ваш праздник начинается здесь",heroText:"Создайте красивое онлайн-приглашение, добавьте информацию о торжестве и отправьте ссылку гостям.",benefits:"Красиво, быстро и удобно для гостей",benefitText:"Премиальные шаблоны, простой редактор, карта, программа и ответы гостей — всё по одной ссылке.",design:"Красивый дизайн",designText:"Каждый шаблон тщательно подготовлен для телефона и правильного отображения текста.",fast:"Экономия времени",fastText:"Заполните данные, отправьте квитанцию и получите ссылку после проверки.",how:"Как это работает",steps:["Выберите шаблон","Заполните информацию","Оплата и проверка","Отправьте ссылку гостям"],faq:"Частые вопросы",final:"Создайте своё приглашение сегодня",choose:"Выбрать шаблон",footer:"Проект студии WOW PRINT",editor:"Создание приглашения",preview:"Предпросмотр",back:"Назад",next:"Продолжить",skip:"Пропустить",send:"Отправить на проверку",saveLocal:"Черновик автоматически сохраняется на этом устройстве.",signin:"Войти для отправки",currency:"сомони"},
};

const faq={
 tj:[["Нарх чанд аст?","Нарх дар корти ҳар қолаб нишон дода мешавад."],["Кай омода мешавад?","Фармоиш дар давоми рӯз санҷида ва нашр мешавад."],["Пардохт чӣ гуна аст?","Пардохтро анҷом дода, акси расидро замима мекунед."],["Маълумотро иваз кардан мумкин аст?","Пас аз нашр як тағйир ройгон аст."],["Пайванд то кай кор мекунад?","То се моҳ пас аз рӯзи ҷашн."],["Ҷавоби меҳмононро аз куҷо мебинам?","Дар кабинети шахсӣ ва огоҳиномаҳои Telegram."]],
 ru:[["Сколько стоит приглашение?","Цена указана на карточке каждого шаблона."],["Когда оно будет готово?","Заказ проверяется и публикуется в течение дня."],["Как производится оплата?","После оплаты прикрепите фотографию или PDF квитанции."],["Можно ли изменить данные?","После публикации одно изменение предоставляется бесплатно."],["Как долго работает ссылка?","До трёх месяцев после даты мероприятия."],["Где смотреть ответы гостей?","В личном кабинете и уведомлениях Telegram."]],
};

const textOptions={
 tj:["Бо камоли эҳтиром Шуморо ба ҷашни арӯсии худ даъват менамоем.","Ҳузури Шумо боиси шодмонӣ ва фараҳмандии мост.","Бо муҳаббат Шуморо ба рӯзи фаромӯшнашавандаи худ даъват мекунем."],
 ru:["С радостью приглашаем вас разделить с нами день нашей свадьбы.","Будем счастливы видеть вас рядом в этот особенный день.","Приглашаем вас стать частью нашего прекрасного праздника."],
};

async function api<T>(path="",options?:RequestInit,token=""){
 const headers=new Headers(options?.headers);
 if(token)headers.set("Authorization","Bearer "+token);
 const res=await fetch(endpoint+path,{...options,headers,cache:"no-store"});const body=await res.json().catch(()=>({})) as {error?:string};
 if(!res.ok)throw new Error(body.error||"Хидмат муваққатан дастнорас аст.");return body as T;
}

export function Studio({catalogOnly=false}:{signedIn:boolean;catalogOnly?:boolean}){
 const [language,setLanguage]=useState<SiteLanguage>("ru");
 const [tab,setTab]=useState<Tab>(catalogOnly?"catalog":"home");
 const [step,setStep]=useState(0);
 const [data,setData]=useState<Invite>(empty);
 const [photo,setPhoto]=useState<File|null>(null);
 const [photoUrl,setPhotoUrl]=useState("");
 const [remotePhoto,setRemotePhoto]=useState("");
 const [order,setOrder]=useState<Order|null>(null);
 const [accessToken,setAccessToken]=useState("");
 const tokenRef=useRef("");
 const saving=useRef(false);
 const [accesses,setAccesses]=useState<SavedAccess[]>([]);
 const [notice,setNotice]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [ready,setReady]=useState(false);
 const t=words[language];
 const locked=!!order&&!['draft','returned'].includes(order.status);
 function remember(value:Order,token:string){
  const all=[{order:value,token},...readAccesses().filter(item=>item.order.id!==value.id)].slice(0,30);
  setAccesses(all);
  try {localStorage.setItem(accessKey,JSON.stringify(all));}catch{
   setNotice("Скопируйте личную ссылку: браузер не разрешает сохранить её на устройстве.");
  }
 }
 function selectToken(token:string){tokenRef.current=token;setAccessToken(token);}
 async function openSaved(token:string){
  if(saving.current)return;
  setBusy(true);setError("");selectToken(token);
  try {
   const value=await api<Listing>("",undefined,token);
   const saved=value.orders[0];
   if(!saved){
    let draft:{data?:Invite;editToken?:string}|null=null;
    try{draft=JSON.parse(localStorage.getItem(draftKey)||"null");}catch{}
    if(draft?.editToken===token&&draft.data){
     setData(draft.data);setOrder(null);setStep(6);setTab("edit");
     setNotice("Сохранение не завершилось. Нажмите «Оформить заказ», чтобы повторить.");return;
    }
    throw new Error("Сохранённое приглашение не найдено. Проверьте личную ссылку.");
   }
   setOrder(saved);setData(saved.data);setPhoto(null);setStep(7);setTab("edit");remember(saved,token);setNotice("");
   history.replaceState(null,"",editLink(token));
  }catch(e){setError((e as Error).message);setTab("orders");}
  finally{setBusy(false);setReady(true);}
 }
 useEffect(()=>{
  const query=new URLSearchParams(location.search);
  const savedLanguage=localStorage.getItem("khushbakhtLanguage");
  const requestedLanguage=query.get("lang");
  const nextLanguage:SiteLanguage=requestedLanguage==="tj"||requestedLanguage==="ru"?requestedLanguage:savedLanguage==="tj"?"tj":"ru";
  setLanguage(nextLanguage);setAccesses(readAccesses());
  const token=new URLSearchParams(location.hash.slice(1)).get("edit");
  if(token){
   if(/^[a-f0-9]{64}$/.test(token)){void openSaved(token);return;}
   setError("Личная ссылка повреждена. Скопируйте её полностью.");setTab("orders");setReady(true);return;
  }
  if(query.get("tab")==="orders")setTab("orders");
  if(query.get("tab")==="edit"){
   const template=templates.find(item=>item.id===query.get("template"))?.id??empty.template;
   let draft:{data?:Invite;step?:number;editToken?:string}|null=null;
   try{draft=JSON.parse(localStorage.getItem(draftKey)||"null");}catch{}
   // A new template choice starts its own invitation; explicit resume restores the device draft.
   const resume=query.get("resume")==="yes"||(draft?.data?.template===template&&!draft?.editToken);
   if(resume&&draft?.editToken){void openSaved(draft.editToken);return;}
   setData(resume&&draft?.data?draft.data:{...empty,template,locale:nextLanguage,palette:paletteFor(template,query.get("palette")??undefined).id});
   setStep(resume?Math.min(draft?.step??0,6):0);setTab("edit");
  }
  setReady(true);
 },[]);
 useEffect(()=>{if(ready)try{localStorage.setItem("khushbakhtLanguage",language);}catch{}},[language,ready]);
 useEffect(()=>{
  if(ready&&tab==="edit"&&!locked)try{localStorage.setItem(draftKey,JSON.stringify({data,step,stepVersion:2,editToken:accessToken}));}catch{}
 },[data,step,tab,ready,accessToken,locked]);
 useEffect(()=>{
  if(!photo){setPhotoUrl("");return;}
  const url=URL.createObjectURL(photo);setPhotoUrl(url);return()=>URL.revokeObjectURL(url);
 },[photo]);
 useEffect(()=>{
  setRemotePhoto("");if(!order?.photo||!accessToken)return;
  let active=true;let url="";const abort=new AbortController();
  fetch(`${endpoint}/${order.id}/photo`,{headers:{Authorization:"Bearer "+accessToken},signal:abort.signal,cache:"no-store"})
   .then(async response=>{if(!response.ok)throw new Error("Не удалось загрузить сохранённую фотографию.");return response.blob();})
   .then(blob=>{if(active){url=URL.createObjectURL(blob);setRemotePhoto(url);}})
   .catch(e=>{if(active&&e.name!=="AbortError")setError(e.message);});
  return()=>{active=false;abort.abort();if(url)URL.revokeObjectURL(url);};
 },[order?.id,order?.photo,accessToken]);
 useEffect(()=>{
  if(tab!=="orders")return;
  let active=true;
  const saved=readAccesses();
  Promise.all(saved.map(async item=>{
   const listing=await api<Listing>("",undefined,item.token);
   return listing.orders[0]?{token:item.token,order:listing.orders[0]}:null;
  })).then(items=>{
   if(!active)return;
   const updated=items.filter((item):item is SavedAccess=>!!item);
   setAccesses(updated);try{localStorage.setItem(accessKey,JSON.stringify(updated));}catch{}
  }).catch(()=>{if(active)setError("Не удалось обновить статусы. Сохранённые ссылки доступны ниже.");});
  return()=>{active=false;};
 },[tab]);
 function changeLanguage(next:SiteLanguage){setLanguage(next);if(!locked)setData(current=>({...current,locale:next}));}
 function update(key:keyof Invite,value:string){if(!locked)setData(current=>key==="template"?{...current,[key]:value,palette:paletteFor(value).id}:{...current,[key]:value});}
 function go(next:Tab){if(busy)return;setError("");setNotice("");setTab(next);window.scrollTo({top:0});}
 async function saveDraft(slug=data.slug):Promise<boolean>{
  if(saving.current)return false;
  saving.current=true;setBusy(true);setError("");
  const token=tokenRef.current||createEditToken();selectToken(token);
  // Retain the capability before sending, so a lost response can be safely retried.
  history.replaceState(null,"",editLink(token));
  try{localStorage.setItem(draftKey,JSON.stringify({data:{...data,slug},step,stepVersion:2,editToken:token}));}catch{}
  const form=new FormData();form.set("data",JSON.stringify({...data,slug,guests:""}));
  if(photo)form.set("photo",photo);if(order)form.set("id",order.id);
  try{
   const result=await api<{order:Order}>("",{method:"POST",body:form},token);
   setOrder(result.order);remember(result.order,token);setNotice("");return true;
  }catch(e){setError((e as Error).message);return false;}
  finally{saving.current=false;setBusy(false);}
 }
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(saving.current)return;
  if(!order||!tokenRef.current){setError("Сначала сохраните приглашение на шаге просмотра.");return;}
  saving.current=true;setBusy(true);setError("");
  const form=new FormData(event.currentTarget);
  if(photo)form.set("photo",photo);
  form.set("data",JSON.stringify({...data,guests:""}));form.set("submit","yes");form.set("id",order.id);
  try{
   const result=await api<{order:Order}>("",{method:"POST",body:form},tokenRef.current);
   setOrder(result.order);remember(result.order,tokenRef.current);
   try{localStorage.removeItem(draftKey);}catch{}
   setTab("orders");setNotice(language==="tj"?"Расид барои санҷиш фиристода шуд.":"Квитанция отправлена на проверку. Приглашение пока не опубликовано.");
   history.replaceState(null,"",location.pathname+"?tab=orders");window.scrollTo({top:0});
  }catch(e){setError((e as Error).message);}finally{saving.current=false;setBusy(false);}
 }
 async function copyLink(token:string){
  try{await navigator.clipboard.writeText(editLink(token));setNotice(language==="tj"?"Пайванди шахсӣ нусхабардорӣ шуд.":"Личная ссылка скопирована.");}catch{setNotice(language==="tj"?"Пайвандро аз майдони поён нусхабардорӣ кунед.":"Скопируйте ссылку из поля ниже.");}
 }
 const accessPanel=order&&accessToken?<div className="private-link-panel">
  <strong>{language==="tj"?"Пайванди шахсии шумо":"Ваша личная ссылка"}</strong>
  <p>{language==="tj"?"Онро нигоҳ доред. Ҳар касе ки ин пайвандро дорад, ба фармоиш дастрасӣ дорад.":"Сохраните её для возврата к заказу с любого устройства. Не отправляйте её гостям: она открывает доступ к заказу."}</p>
  <input aria-label={language==="tj"?"Пайванди шахсӣ":"Личная ссылка"} readOnly value={editLink(accessToken)} onFocus={event=>event.currentTarget.select()}/>
  {order.status==="published"&&<a className="button" href={`/i/${order.data.slug}`} target="_blank" rel="noreferrer">{language==="tj"?"Пайванд барои меҳмонон":"Открыть ссылку для гостей"}</a>}
  <button type="button" className="button secondary" onClick={()=>copyLink(accessToken)}>{language==="tj"?"Нусхабардорӣ":"Скопировать ссылку"}</button>
  {notice&&<p role="status">{notice}</p>}
 </div>:null;
 const header=<header><div className="shell navbar"><a className="brand khush-brand" href="/">KHUSHBAKHT<small>{language==="tj"?"ДАЪВАТНОМАҲОИ ОНЛАЙН":"ОНЛАЙН-ПРИГЛАШЕНИЯ"}</small></a><nav aria-label="Main"><a href={`/templates?lang=${language}`}>{t.templates}</a><button onClick={()=>go("orders")}>{t.my}</button></nav><div className="header-actions"><div className="language-switch"><button aria-pressed={language==="tj"} onClick={()=>changeLanguage("tj")}>Тоҷ</button><button aria-pressed={language==="ru"} onClick={()=>changeLanguage("ru")}>Рус</button></div><a className="button top-cta" href={`/templates?lang=${language}`}>{t.create} ↗</a></div></div></header>;

 return <>{tab!=="edit"&&header}<main className={tab==="edit"?"visual-editor-main":undefined}>
  {tab==="home"&&<>
   <section className="shell hero khush-hero">
    <div className="hero-atmosphere" aria-hidden="true">
     <span className="ambient-veil"/><span className="ambient-blob ambient-rose"/><span className="ambient-blob ambient-gold"/><span className="ambient-blob ambient-lilac"/><span className="ambient-ring ring-one"/><span className="ambient-ring ring-two"/><span className="ambient-sprig"/><span className="ambient-spark spark-a">✦</span><span className="ambient-spark spark-b">·</span><span className="ambient-spark spark-c">✧</span>
    </div>
    <div className="hero-content"><p className="eyebrow">{t.tag}</p><h1>{t.hero}</h1><p>{t.heroText}</p><a className="button" href={`/templates?lang=${language}`}>{t.create} ↗</a></div><div className="hero-image hero-phone"><img src="/images/hero-hand-phone-v2.webp" alt={language==="tj"?"Дасти занона бо телефон ва даъватномаи онлайн":"Женская рука с телефоном и онлайн-приглашением"}/></div>
   </section>
   <TemplateCatalog standalone={false} language={language} limit={6}/>
   <section className="soft-section"><div className="shell"><div className="section-heading"><div><p className="eyebrow">KHUSHBAKHT</p><h2>{t.benefits}</h2><p className="description">{t.benefitText}</p></div></div><div className="benefit-grid"><article><span>01</span><h3>{t.design}</h3><p>{t.designText}</p></article><article><span>02</span><h3>{t.fast}</h3><p>{t.fastText}</p></article></div></div></section>
   <section className="shell home-section"><h2>{t.how}</h2><div className="process-grid">{t.steps.map((item,index)=><article key={item}><b>0{index+1}</b><h3>{item}</h3></article>)}</div></section>
   <section className="shell home-section faq-section"><h2>{t.faq}</h2><div>{faq[language].map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
   <section className="shell final-cta"><h2>{t.final}</h2><a className="button" href={`/templates?lang=${language}`}>{t.choose} ↗</a></section>
  </>}
  {tab==="catalog"&&<TemplateCatalog standalone language={language}/>}
  {tab==="edit"&&<VisualEditor data={data} step={step} language={language} photoUrl={photoUrl} orderPhoto={remotePhoto||undefined} busy={busy} error={error} signedIn={true} locked={locked} lockedMessage={order?.status==="published"?(language==="tj"?"Даъватномаи шумо нашр шудааст.":"Ваше приглашение опубликовано. Ссылка для гостей доступна ниже."):undefined} accessPanel={accessPanel} saveDraft={saveDraft} onExit={()=>go("orders")} update={update} setStep={setStep} setPhoto={setPhoto} submit={submit} signInUrl="/"/>}
  {tab==="orders"&&<Orders language={language} accesses={accesses} notice={notice} error={error} busy={busy} openSaved={openSaved} copyLink={copyLink}/>}

 </main>{tab!=="edit"&&<footer><div className="shell"><b>KHUSHBAKHT</b><span>{t.footer}</span></div></footer>}</>;
}

function Orders({language,accesses,notice,error,busy,openSaved,copyLink}:{language:SiteLanguage;accesses:SavedAccess[];notice:string;error:string;busy:boolean;openSaved:(token:string)=>Promise<void>;copyLink:(token:string)=>Promise<void>}){
 const status:Record<string,string>=language==="tj"?{draft:"Пардохт нашудааст",pending:"Дар санҷиш",returned:"Баргардонда шуд",published:"Нашр шуд"}:{draft:"Ожидает оплаты",pending:"На проверке",returned:"Возвращён",published:"Опубликован"};
 return <section className="shell workspace"><h1>{language==="tj"?"Даъватномаҳои ман":"Мои приглашения"}</h1>
  {notice&&<p className="notice" role="status">{notice}</p>}{error&&<p className="alert" role="alert">{error}</p>}
  <p>{language==="tj"?"Фармоишҳои дар ин дастгоҳ нигоҳдошташуда. Барои дастгоҳи дигар пайванди шахсиро истифода баред.":"Здесь заказы, сохранённые на этом устройстве. На другом устройстве откройте свою личную ссылку."}</p>
  <div className="orders">{!accesses.length?<div className="panel">{language==="tj"?"Ҳоло фармоиш нест.":"Сохранённых заказов пока нет."}</div>:accesses.map(({order:item,token})=><article className="panel" key={item.id}>
   <div className="order-head"><div><h2>{item.data.first} &amp; {item.data.second}</h2><p>{item.data.date||item.data.morningDate}</p></div><span className={`status ${item.status}`}>{status[item.status]}</span></div>
   {item.note&&<p className="notice">{item.note}</p>}
   <div className="actions"><button className="button" disabled={busy} onClick={()=>openSaved(token)}>{language==="tj"?"Кушодан":"Открыть заказ"}</button><button className="button secondary" onClick={()=>copyLink(token)}>{language==="tj"?"Пайванди шахсӣ":"Личная ссылка"}</button>
    {item.status==="published"&&<a className="button secondary" href={`/i/${item.data.slug}`} target="_blank" rel="noreferrer">{language==="tj"?"Пайванд барои меҳмонон":"Ссылка для гостей"}</a>}
   </div><input aria-label="Личная ссылка" readOnly value={editLink(token)} onFocus={event=>event.currentTarget.select()}/>
  </article>)}</div>
 </section>;
}
