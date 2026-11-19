"use client";

import {useEffect,useMemo,useState,type FormEvent} from "react";
import {TemplateCatalog} from "./template-catalog";
import {VisualEditor} from "./visual-editor";
import {empty,paletteFor,palettesFor,templateName,templates,validSlug,type Invite,type Order,type SiteLanguage} from "./model";

type Tab="home"|"catalog"|"edit"|"orders"|"review";
type Listing={orders:Order[];live:boolean;price:number;instructions:string;admin:boolean};
const initial:Listing={orders:[],live:false,price:0,instructions:"",admin:false};
const endpoint="/api/orders";
const draftKey="khushbakhtDraft";

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

async function api<T>(path="",options?:RequestInit){
 const res=await fetch(endpoint+path,options);const body=await res.json().catch(()=>({})) as {error?:string};
 if(!res.ok)throw new Error(body.error||"Хидмат муваққатан дастнорас аст.");return body as T;
}

export function Studio({signedIn,catalogOnly=false}:{signedIn:boolean;catalogOnly?:boolean}){
 const [language,setLanguage]=useState<SiteLanguage>("ru");
 const [tab,setTab]=useState<Tab>(catalogOnly?"catalog":"home");
 const [step,setStep]=useState(0);
 const [data,setData]=useState<Invite>(empty);
 const [photo,setPhoto]=useState<File|null>(null);
 const [photoUrl,setPhotoUrl]=useState("");
 const [list,setList]=useState<Listing>(initial);
 const [order,setOrder]=useState<Order|null>(null);
 const [notice,setNotice]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [returned,setReturned]=useState("");
 const [note,setNote]=useState("");
 const t=words[language];

 useEffect(()=>{
  const query=new URLSearchParams(location.search);const queryLanguage=query.get("lang");
  const savedLanguage=localStorage.getItem("khushbakhtLanguage");
  const nextLanguage:SiteLanguage=queryLanguage==="tj"||queryLanguage==="ru"?queryLanguage:savedLanguage==="tj"||savedLanguage==="ru"?savedLanguage:"ru";setLanguage(nextLanguage);
  const requested=query.get("tab");if(requested==="orders"||requested==="review")setTab(requested);
  if(requested==="edit"){
   const template=templates.find(item=>item.id===query.get("template"))?.id??empty.template;
   let draft:{data?:Invite;step?:number;stepVersion?:number}|null=null;try{draft=JSON.parse(localStorage.getItem(draftKey)||"null");}catch{}
   setData(draft?.data??{...empty,template,locale:nextLanguage,palette:paletteFor(template,query.get("palette")??undefined).id});
   setStep(draft?.stepVersion!==2&&(draft?.step??0)>=4?(draft?.step??0)+1:draft?.step??0);setTab("edit");
  }
 },[]);
 useEffect(()=>{localStorage.setItem("khushbakhtLanguage",language);},[language]);
 useEffect(()=>{if(tab==="edit")localStorage.setItem(draftKey,JSON.stringify({data,step,stepVersion:2}));},[data,step,tab]);
 useEffect(()=>{if(!signedIn)return;let active=true;api<Listing>(tab==="review"?"/review":"").then(value=>active&&setList(value)).catch(e=>active&&setError(e.message));return()=>{active=false};},[signedIn,tab]);
 useEffect(()=>{if(!photo){setPhotoUrl("");return;}const url=URL.createObjectURL(photo);setPhotoUrl(url);return()=>URL.revokeObjectURL(url);},[photo]);

 const currentTemplate=useMemo(()=>templates.find(item=>item.id===data.template)??templates[0],[data.template]);
 function changeLanguage(next:SiteLanguage){setLanguage(next);setData(current=>({...current,locale:next}));}
 function update(key:keyof Invite,value:string){setData(current=>key==="template"?{...current,[key]:value,palette:paletteFor(value).id}:{...current,[key]:value});}
 function openEditor(template=templates[0].id){setData(current=>({...current,template,locale:language,palette:paletteFor(template).id}));setStep(0);setTab("edit");window.scrollTo({top:0});}
 function go(next:Tab){setError("");setNotice("");setTab(next);window.scrollTo({top:0});}
 function signInUrl(){return "/signin-with-chatgpt?return_to="+encodeURIComponent("/?tab=edit&template="+data.template+"&resume=yes");}

 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setError("");
  if(!data.first||!data.second||!validSlug(data.slug)){setError(language==="tj"?"Номҳо ва нишонии дурусти пайвандро ворид кунед.":"Заполните имена и правильный адрес ссылки.");return;}
  const form=new FormData(event.currentTarget);if(photo)form.set("photo",photo);form.set("data",JSON.stringify({...data,guests:""}));form.set("submit","yes");if(order)form.set("id",order.id);
  setBusy(true);try{const result=await api<{order:Order}>("",{method:"POST",body:form});setOrder(result.order);localStorage.removeItem(draftKey);go("orders");setNotice(language==="tj"?"Фармоиш барои санҷиш фиристода шуд.":"Заказ отправлен на проверку.");}catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 async function review(id:string,decision:"publish"|"return"){
  setBusy(true);try{await api("/review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,decision,note})});setList(await api<Listing>("/review"));setReturned("");}catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }

 const header=<header><div className="shell navbar"><a className="brand khush-brand" href="/">KHUSHBAKHT<small>{language==="tj"?"ДАЪВАТНОМАҲОИ ОНЛАЙН":"ОНЛАЙН-ПРИГЛАШЕНИЯ"}</small></a><nav aria-label="Main"><a href={`/templates?lang=${language}`}>{t.templates}</a><button onClick={()=>go("orders")}>{t.my}</button>{list.admin&&<button onClick={()=>go("review")}>{t.review}</button>}</nav><div className="header-actions"><div className="language-switch"><button aria-pressed={language==="tj"} onClick={()=>changeLanguage("tj")}>Тоҷ</button><button aria-pressed={language==="ru"} onClick={()=>changeLanguage("ru")}>Рус</button></div><a className="button top-cta" href={`/templates?lang=${language}`}>{t.create} ↗</a></div></div></header>;

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
  {tab==="edit"&&<VisualEditor data={data} step={step} language={language} photoUrl={photoUrl} orderPhoto={order?.photo?`${endpoint}/${order.id}/photo`:undefined} busy={busy} error={error} signedIn={signedIn} update={update} setStep={setStep} setPhoto={setPhoto} submit={submit} signInUrl={signInUrl()}/>}
  {(tab==="orders"||tab==="review")&&<Orders language={language} tab={tab} signedIn={signedIn} list={list} notice={notice} error={error} busy={busy} returned={returned} note={note} setReturned={setReturned} setNote={setNote} review={review}/>}
 </main>{tab!=="edit"&&<footer><div className="shell"><b>KHUSHBAKHT</b><span>{t.footer}</span></div></footer>}</>;
}

function BasicStep({data,update,language}:{data:Invite;update:(key:keyof Invite,value:string)=>void;language:SiteLanguage}){
 const morning=data.eventType!=="wedding",wedding=data.eventType!=="morning";
 return <section><h2>{language==="tj"?"Маълумоти асосӣ":"Основные данные"}</h2><label>{language==="tj"?"Навъи маросим":"Вид события"}<select value={data.eventType} onChange={e=>update("eventType",e.target.value)}><option value="wedding">{language==="tj"?"Тӯйи арӯсӣ":"Свадьба"}</option><option value="morning">{language==="tj"?"Оши наҳор":"Оши наҳор"}</option><option value="both">{language==="tj"?"Ҳар ду маросим":"Оба события"}</option></select></label><div className="fields"><label>{language==="tj"?"Номи домод":"Имя жениха"}<input value={data.first} maxLength={45} onChange={e=>update("first",e.target.value)}/></label><label>{language==="tj"?"Номи арӯс":"Имя невесты"}<input value={data.second} maxLength={45} onChange={e=>update("second",e.target.value)}/></label></div>
 {wedding&&<fieldset className="event-box"><legend>{language==="tj"?"Тӯйи арӯсӣ":"Свадьба"}</legend><div className="fields"><label>{language==="tj"?"Сана":"Дата"}<input type="date" value={data.date} onChange={e=>update("date",e.target.value)}/></label><label>{language==="tj"?"Соат":"Время"}<input type="time" value={data.time} onChange={e=>update("time",e.target.value)}/></label></div><label>{language==="tj"?"Ҷой":"Место"}<input value={data.venue} maxLength={100} onChange={e=>update("venue",e.target.value)}/></label><label>{language==="tj"?"Суроға":"Адрес"}<input value={data.address} maxLength={160} onChange={e=>update("address",e.target.value)}/></label></fieldset>}
 {morning&&<fieldset className="event-box"><legend>{language==="tj"?"Оши наҳор":"Оши наҳор"}</legend><div className="fields"><label>{language==="tj"?"Сана":"Дата"}<input type="date" value={data.morningDate} onChange={e=>update("morningDate",e.target.value)}/></label><label>{language==="tj"?"Соат":"Время"}<input type="time" value={data.morningTime} onChange={e=>update("morningTime",e.target.value)}/></label></div><label>{language==="tj"?"Ҷой":"Место"}<input value={data.morningVenue} maxLength={100} onChange={e=>update("morningVenue",e.target.value)}/></label><label>{language==="tj"?"Суроға":"Адрес"}<input value={data.morningAddress} maxLength={160} onChange={e=>update("morningAddress",e.target.value)}/></label></fieldset>}
 </section>;
}

function Orders({language,tab,signedIn,list,notice,error,busy,returned,note,setReturned,setNote,review}:{language:SiteLanguage;tab:"orders"|"review";signedIn:boolean;list:Listing;notice:string;error:string;busy:boolean;returned:string;note:string;setReturned:(id:string)=>void;setNote:(value:string)=>void;review:(id:string,decision:"publish"|"return")=>Promise<void>}){
 const status:{[key:string]:string}=language==="tj"?{draft:"Пешнавис",pending:"Дар санҷиш",returned:"Баргардонда шуд",published:"Нашр шуд"}:{draft:"Черновик",pending:"На проверке",returned:"Возвращён",published:"Опубликован"};
 return <section className="shell workspace"><h1>{tab==="orders"?(language==="tj"?"Даъватномаҳои ман":"Мои приглашения"):(language==="tj"?"Санҷиши фармоишҳо":"Проверка заказов")}</h1>{notice&&<p className="notice">{notice}</p>}{error&&<p className="alert">{error}</p>}{!signedIn?<div className="panel">{language==="tj"?"Барои идома ворид шавед.":"Войдите, чтобы продолжить."}</div>:<div className="orders">{list.orders.length===0?<div className="panel">{language==="tj"?"Ҳоло фармоиш нест.":"Заказов пока нет."}</div>:list.orders.map(item=><article className="panel" key={item.id}><div className="order-head"><div><h2>{item.data.first} & {item.data.second}</h2><p>{item.data.date||item.data.morningDate}</p></div><span className={`status ${item.status}`}>{status[item.status]}</span></div><div className="actions">{tab==="review"&&item.receipt&&<a className="button secondary" href={`${endpoint}/${item.id}/receipt`} target="_blank">{language==="tj"?"Расид":"Квитанция"} ↗</a>}{tab==="review"&&item.status==="pending"&&<><button className="button" disabled={busy} onClick={()=>review(item.id,"publish")}>{language==="tj"?"Тасдиқ ва нашр":"Одобрить и опубликовать"}</button><button className="link" onClick={()=>setReturned(item.id)}>{language==="tj"?"Баргардондан":"Вернуть"}</button></>}{item.status==="published"&&<a className="button secondary" href={`/i/${item.data.slug}`} target="_blank">{language==="tj"?"Кушодан":"Открыть"} ↗</a>}</div>{returned===item.id&&<div className="return-form"><label>{language==="tj"?"Шарҳ":"Комментарий"}<textarea value={note} onChange={e=>setNote(e.target.value)}/></label><button className="button secondary" onClick={()=>review(item.id,"return")}>{language==="tj"?"Фиристодан":"Отправить"}</button></div>}</article>)}</div>}</section>;
}
