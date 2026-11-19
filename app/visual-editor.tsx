"use client";

import {useEffect,useState,type ReactNode,type FormEvent} from "react";
import {InvitationPage} from "./invitation-page";
import {allTemplates,paletteFor,palettesFor,templateName,templates,validSlug,type Invite,type SiteLanguage} from "./model";

type Props={
 data:Invite;step:number;language:SiteLanguage;photoUrl:string;orderPhoto?:string;busy:boolean;error:string;signedIn:boolean;locked?:boolean;lockedMessage?:string;accessPanel?:ReactNode;saveDraft?:(slug?:string)=>Promise<boolean>;onExit?:()=>void;
 update:(key:keyof Invite,value:string)=>void;setStep:(value:number|((value:number)=>number))=>void;setPhoto:(file:File|null)=>void;submit:(event:FormEvent<HTMLFormElement>)=>void;signInUrl:string;
};

const copy={
 ru:{steps:["Язык","Обложка","Текст","Дизайн и фото","Дата и место","Программа","Ссылка","Просмотр","Оплата"],back:"Назад",next:"Далее",send:"Отправить",signin:"Войти и продолжить",close:"Закрыть",chooseLanguage:"Выберите язык приглашения",chooseLanguageText:"Все надписи и даты сразу появятся на выбранном языке.",cover:"Обложка приглашения",message:"Текст приглашения",design:"Дизайн и фотография",program:"Программа события",link:"Адрес приглашения",payment:"Оплата",ready:"Ваше приглашение готово!",publish:"После оплаты и проверки квитанции мы опубликуем его по выбранной ссылке.",edit:"Вернуться к редактированию",pay:"Перейти к оплате"},
 tj:{steps:["Забон","Муқова","Матн","Тарҳ ва акс","Сана ва макон","Барнома","Пайванд","Пешнамоиш","Пардохт"],back:"Қафо",next:"Давом",send:"Фиристодан",signin:"Ворид шудан",close:"Пӯшидан",chooseLanguage:"Забони даъватномаро интихоб кунед",chooseLanguageText:"Ҳамаи матнҳо ва санаҳо фавран бо забони интихобшуда нишон дода мешаванд.",cover:"Муқоваи даъватнома",message:"Матни даъват",design:"Тарҳ ва акс",program:"Барномаи ҷашн",link:"Нишонии даъватнома",payment:"Пардохт",ready:"Даъватномаи шумо омода аст!",publish:"Пас аз пардохт ва санҷиши расид даъватнома бо пайванди интихобкардаатон нашр мешавад.",edit:"Бозгашт ба таҳрир",pay:"Гузаштан ба пардохт"},
};

const messages={
 tj:["Бо камоли эҳтиром Шуморо ба ҷашни арӯсии худ даъват менамоем.","Ҳузури Шумо боиси шодмонӣ ва фараҳмандии мост."],
 ru:["С радостью приглашаем вас разделить с нами день нашей свадьбы.","Будем счастливы видеть вас рядом в этот особенный день."],
 uz:["Сизни тўй маросимимизга самимий таклиф қиламиз.","Қувончли кунимизда Сизни кутиб қоламиз."],
};

export function VisualEditor({data,step,language,photoUrl,orderPhoto,busy,error,signedIn,update,setStep,setPhoto,submit,signInUrl,locked=false,lockedMessage,accessPanel,saveDraft,onExit}:Props){
 const linkStep=6, previewStep=7, paymentStep=8;
 const t=copy[language];
 const isPreview=step===previewStep;
 const isPayment=step===paymentStep;
 const totalSteps=t.steps.length;
 const currentTemplate=allTemplates.find(item=>item.id===data.template)??templates[0];
 const photo=photoUrl||orderPhoto||"/images/demo-couple.webp";
 function edit(target:"cover"|"message"|"photo"|"location"|"program"){
  if(locked||busy)return;
  const targetStep=target==="message"?2:target==="photo"?3:target==="location"?4:target==="program"?5:1;
  setStep(targetStep);
 }
 const [linkError,setLinkError]=useState(false);
 const [detailsError,setDetailsError]=useState(false);
 const optionalSection=step===2?"welcome":step===3?"photo":step===5?"program":undefined;
 useEffect(()=>{
  const target=["cover","cover","welcome","photo","details","program","checkout","ready","checkout"][step];
  const frame=requestAnimationFrame(()=>{
   const behavior=window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth";
   const section=document.querySelector('[data-editor-section="'+target+'"]');
   if(section)section.scrollIntoView({block:"start",behavior});
   else window.scrollTo({top:0,behavior});
  });
  return ()=>cancelAnimationFrame(frame);
 },[step]);
 const skipLabel=language==="tj"?"Гузарондан":"Пропустить";
 function setSectionHidden(section:string,hide:boolean){
  const hidden=(data.hiddenSections??"").split(",").filter(Boolean);
  update("hiddenSections",(hide?[...new Set([...hidden,section])]:hidden.filter(item=>item!==section)).join(","));
 }
 function skip(){
  if(optionalSection)setSectionHidden(optionalSection,true);
  const slug=step===linkStep&&!validSlug(data.slug)?suggestedSlug(data):data.slug;
  if(slug!==data.slug)update("slug",slug);
  move(step+1,slug);
 }
 function nextStep(){
  move(step+1);
 }
 async function move(next:number,slug=data.slug){
  if(busy||locked)return;
  if(step===linkStep&&next===previewStep&&!validSlug(slug)){
   setLinkError(true);return;
  }
  if(step===linkStep&&next===previewStep&&(!data.first.trim()||!data.second.trim()||
    (data.eventType!=="morning"&&(!data.date||!data.time||!data.venue.trim()))||
    (data.eventType!=="wedding"&&(!data.morningDate||!data.morningTime||!data.morningVenue.trim())))){
   setDetailsError(true);setStep(!data.first.trim()||!data.second.trim()?1:4);return;
  }
  if(saveDraft&&((step<previewStep&&next===previewStep)||next===paymentStep)&&!await saveDraft(slug))return;
  setDetailsError(false);
  setLinkError(false);setStep(Math.max(0,Math.min(totalSteps-1,next)));

 }
 const sectionControls:Record<string,ReactNode>={};
 if(step===1&&detailsError) sectionControls.cover=<p role="alert">{language==="tj"?"Номҳоро ворид кунед.":"Введите имена пары."}</p>;
 if(step===2) sectionControls.welcome=<MessageFields data={data} update={update} language={language}/>;
 if(step===3) sectionControls.photo=<DesignFields data={data} update={update} setPhoto={setPhoto} language={language}/>;
 if(step===4) sectionControls.details=<><DetailsFields data={data} update={update} language={language}/>{detailsError&&<p role="alert">{language==="tj"?"Сана, вақт ва маконро ворид кунед.":"Заполните дату, время и место."}</p>}</>;
 if(step===5) sectionControls.program=<ProgramFields data={data} update={update} language={language}/>;
 if(optionalSection) sectionControls[optionalSection]=<>{sectionControls[optionalSection]}<button type="button" className="button secondary editor-skip" onClick={skip}>{skipLabel}</button></>;
 return <form className="visual-editor" onSubmit={event=>{
  if(isPayment&&signedIn&&!locked)submit(event);
  else event.preventDefault();
 }}>
  {isPreview&&<section data-editor-section="ready" className="invitation-ready" aria-labelledby="invitation-ready-title">
   <h1 id="invitation-ready-title">{locked?(language==="tj"?"Фармоиши шумо":"Ваш заказ"):t.ready}</h1>
   <p>{lockedMessage??(locked?(language==="tj"?"Фармоиш барои санҷиш фиристода шудааст. Пайванди меҳмонон пас аз тасдиқ омода мешавад.":"Заказ отправлен на проверку. Ссылка для гостей будет доступна после подтверждения публикации."):t.publish)}</p>
   {accessPanel}
   {!locked&&<button disabled={busy} type="button" className="button secondary" onClick={()=>move(1)}>{t.edit}</button>}
   {!locked&&<button disabled={busy} type="button" className="button secondary" onClick={()=>move(paymentStep)}>{t.pay}</button>}
  </section>}
  <div className="visual-editor-canvas"><InvitationPage data={data} photo={isPreview||isPayment?photoUrl||orderPhoto:photo} editor={locked||step>=linkStep?undefined:{onEdit:edit,update,setSectionHidden,controls:sectionControls}}/></div>
  {step===0&&<div className="language-choice-backdrop"><section className="language-choice-card"><span className="choice-mark">BAZMNOMA</span><h1>{t.chooseLanguage}</h1><p>{t.chooseLanguageText}</p><div className="language-choice-grid">
   {([['tj','Тоҷикӣ','Тоҷикӣ'],['ru','Русский','Русский'],['uz','Ўзбекча','Ўзбекча']] as const).map(([value,title,sample])=><button type="button" key={value} aria-pressed={data.locale===value} onClick={()=>update("locale",value)}><span>{value.toUpperCase()}</span><strong>{title}</strong><small>{sample}</small></button>)}
  </div><button type="button" className="button secondary editor-skip" onClick={skip}>{skipLabel}</button></section></div>}
  {(step===linkStep||isPayment)&&<section className="editor-in-place editor-checkout" data-editor-section="checkout">
   <h2>{isPayment?t.payment:t.link}</h2>
   {isPayment&&accessPanel}
   {isPayment?<PaymentFields language={language} template={currentTemplate}/>:<LinkFields data={data} update={update} language={language} invalid={linkError}/>}
   <button type="button" className="button secondary editor-skip" onClick={isPayment?()=>move(previewStep):skip}>{isPayment?(language==="tj"?"Баъдтар пардохт кардан":"Оплатить позже"):skipLabel}</button>

  </section>}
  {error&&<p className="alert editor-save-error" role="alert">{error}</p>}
  <div className="visual-step-dock"><button type="button" className="visual-back" disabled={busy} onClick={()=>locked?onExit?.():step===0?location.assign(`/templates/${data.template}?lang=${language}`):move(step-1)}>← <span>{t.back}</span></button><div className="visual-progress"><strong>{t.steps[step]} · {step+1} {language==="tj"?"аз":"из"} {totalSteps}</strong><span><i style={{width:`${((step+1)/totalSteps)*100}%`}}/></span></div>{locked?<button type="button" className="visual-next" onClick={onExit}>{language==="tj"?"Фармоишҳои ман":"Мои заказы"}</button>:!isPayment?<button disabled={busy} type="button" className="visual-next" onClick={nextStep}>{isPreview?t.pay:step===linkStep?(language==="tj"?"Сабти фармоиш":"Оформить заказ"):busy?(language==="tj"?"Сабт мешавад…":"Сохраняем…"):t.next} →</button>:signedIn?<button className="visual-next" disabled={busy}>{t.send} →</button>:<a className="visual-next" href={signInUrl} target="_top">{t.signin} →</a>}</div>
 </form>;
}

function DetailsFields({data,update,language}:{data:Invite;update:Props['update'];language:SiteLanguage}){return <><label>{language==="tj"?"Навъи маросим":"Вид события"}<select value={data.eventType} onChange={e=>update("eventType",e.target.value)}><option value="wedding">{language==="tj"?"Тӯйи арӯсӣ":"Свадьба"}</option><option value="morning">Оши наҳор</option><option value="both">{language==="tj"?"Ду маросим":"Два события"}</option></select></label>{data.eventType!=="morning"&&<EventFields data={data} update={update} language={language} morning={false}/>}
 {data.eventType!=="wedding"&&<EventFields data={data} update={update} language={language} morning/>}</>}
function EventFields({data,update,language,morning}:{data:Invite;update:Props["update"];language:SiteLanguage;morning:boolean}){
 const date=morning?"morningDate":"date",time=morning?"morningTime":"time";
 const venue=morning?"morningVenue":"venue",address=morning?"morningAddress":"address";
 return <>
  {data.eventType==="both"&&<h3>{morning?"Оши наҳор":language==="tj"?"Тӯйи арӯсӣ":"Свадьба"}</h3>}
  <div className="fields">
   <label>{language==="tj"?"Сана":"Дата"}<input type="date" value={data[date]} onChange={e=>update(date,e.target.value)}/></label>
   <label>{language==="tj"?"Соат":"Время"}<input type="time" value={data[time]} onChange={e=>update(time,e.target.value)}/></label>
  </div>
  <label>{language==="tj"?"Ҷой":"Место"}<input value={data[venue]} onChange={e=>update(venue,e.target.value)}/></label>
  <label>{language==="tj"?"Суроға":"Адрес"}<input value={data[address]} onChange={e=>update(address,e.target.value)}/></label>
 </>;
}
function MessageFields({data,update,language}:{data:Invite;update:Props['update'];language:SiteLanguage}){const options=messages[data.locale as keyof typeof messages]??messages.tj;return <><div className="message-presets">{options.map(value=><button type="button" key={value} aria-pressed={data.message===value} onClick={()=>update("message",value)}>{value}</button>)}</div><label>{language==="tj"?"Матни худ":"Свой текст"}<textarea rows={6} maxLength={450} value={data.message} onChange={e=>update("message",e.target.value)}/></label></>}
function DesignFields({data,update,setPhoto,language}:{data:Invite;update:Props['update'];setPhoto:Props['setPhoto'];language:SiteLanguage}){return <><p className="sheet-help">{language==="tj"?"Ранги мувофиқро интихоб кунед — натиҷа фавран нишон дода мешавад.":"Выберите палитру — результат сразу появится на приглашении."}</p><div className="visual-palettes">{palettesFor(data.template).map(option=><button type="button" key={option.id} aria-pressed={paletteFor(data.template,data.palette).id===option.id} onClick={()=>update("palette",option.id)}><span style={{background:`conic-gradient(${option.background} 0 33%,${option.accent} 33% 66%,${option.ink} 66%)`}}/><strong>{option.label}</strong></button>)}</div><label>{language==="tj"?"Акси асосӣ":"Главная фотография"}<input type="file" name="photo" accept="image/jpeg,image/png,image/webp" onChange={e=>setPhoto(e.target.files?.[0]??null)}/></label></>}
function ProgramFields({data,update,language}:{data:Invite;update:Props['update'];language:SiteLanguage}){return <label>{language==="tj"?"Барномаи ҷашн":"Программа события"}<textarea rows={9} maxLength={1000} value={data.program} placeholder="18:00 — Сбор гостей" onChange={e=>update("program",e.target.value)}/></label>}
function slugName(name:string){
 const source="абвгдеёжзийклмнопрстуфхцчшщъыьэюяғӣқӯҳҷ";
 const latin=["a","b","v","g","d","e","yo","zh","z","i","y","k","l","m","n","o","p","r","s","t","u","f","kh","ts","ch","sh","shch","","y","","e","yu","ya","gh","i","q","u","h","j"];
 return [...name.toLowerCase().trim()].map(letter=>source.includes(letter)?latin[source.indexOf(letter)]:letter).join("").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,19).replace(/-$/,"");
}
function suggestedSlug(data:Invite){
 return [slugName(data.first)||"wedding",slugName(data.second)||"invite"].join("-");
}
function LinkFields({data,update,language,invalid}:{data:Invite;update:Props["update"];language:SiteLanguage;invalid:boolean}){
 const first=slugName(data.first)||"wedding",second=slugName(data.second)||"invite";
 const year=data.date.slice(0,4);
 const options=[...new Set([`${first}-${second}`,`${second}-${first}`,`${first}-${second}-${/^\d{4}$/.test(year)?year:"tuy"}`])];
 return <>
  <p className="sheet-help">{language==="tj"?"Пайвандро интихоб кунед ё нишонии худро нависед.":"Выберите вариант ссылки или введите свой адрес."}</p>
  <div className="message-presets">{options.map(slug=><button type="button" key={slug} aria-pressed={data.slug===slug} onClick={()=>update("slug",slug)}>/i/{slug}</button>)}</div>
  <label>{language==="tj"?"Нишонии пайванд":"Адрес ссылки"}<div className="slug-field"><span>/i/</span><input maxLength={50} value={data.slug} onChange={e=>update("slug",e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))}/></div></label>
  {invalid&&!validSlug(data.slug)&&<p className="alert" role="alert">{language==="tj"?"Нишонии дурустро ворид кунед.":"Укажите адрес из латинских букв, цифр и дефисов."}</p>}
 </>;
}
function PaymentFields({language,template}:{language:SiteLanguage;template:(typeof templates)[number]}){
 return <>
  <div className="visual-order-summary"><span>{templateName(template,language)}</span><strong>{template.price} {language==="tj"?"сомонӣ":"сомони"}</strong></div>
  <p>{language==="tj"?"Пардохтро аз яке аз барномаҳои зерин ба ин рақам гузаронед.":"Переведите оплату на этот номер через любое из приложений ниже."}</p>
  <p className="payment-phone"><strong dir="ltr">+992 92 914 22 20</strong></p>
  <ul className="payment-banks"><li>Душанбе Сити</li><li>Алиф</li><li>Эсхата</li></ul>
  <label>{language==="tj"?"Расиди пардохт":"Квитанция об оплате"}<input type="file" name="receipt" required accept="image/jpeg,image/png,image/webp,application/pdf"/></label>
  <p className="notice">{language==="tj"?"Пас аз пардохт расидро замима кунед.":"После оплаты прикрепите квитанцию."}</p>
 </>;
}
