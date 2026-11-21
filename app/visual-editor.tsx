"use client";

import {InvitationLinkFields,type LinkSuggestions,type LinkCheck} from "./invitation-link-fields";
import {EditorDialog} from "./editor-dialog";
import {InvitationPhotoUpload} from "./invitation-photo-upload";
import {SiteAtmosphere} from "./site-atmosphere";
import {ActionArrow} from "./action-arrow";
import {useEffect,useRef,useState,type ReactNode,type FormEvent} from "react";
import {InvitationOptions} from "./invitation-options";
import {InvitationPage} from "./invitation-page";
import {allTemplates,paletteFor,palettesFor,templateName,templates,validSlug,type Invite,type SiteLanguage} from "./model";

type Props={
 data:Invite;step:number;language:SiteLanguage;photoUrl:string;orderPhoto?:string;busy:boolean;error:string;signedIn:boolean;locked?:boolean;lockedMessage?:string;accessPanel?:ReactNode;saveDraft?:(slug?:string)=>Promise<boolean>;suggestLinks:LinkSuggestions;checkLink:LinkCheck;onExit?:()=>void;
 update:(key:keyof Invite,value:string)=>void;setStep:(value:number|((value:number)=>number))=>void;setPhoto:(file:File|null)=>void;submit:(event:FormEvent<HTMLFormElement>)=>void;signInUrl:string;
};

const copy={
 ru:{steps:["Язык","Обложка","Текст","Дизайн и фото","Дата и место","Программа","Ссылка","Просмотр","Оплата"],back:"Назад",next:"Далее",send:"Отправить",signin:"Войти и продолжить",close:"Закрыть",chooseLanguage:"Выберите язык приглашения",chooseLanguageText:"Все надписи и даты сразу появятся на выбранном языке.",cover:"Обложка приглашения",message:"Текст приглашения",design:"Дизайн и фотография",program:"Программа события",link:"Адрес приглашения",payment:"Оплата",ready:"Ваше приглашение почти готово.",publish:"После оплаты и проверки квитанции мы опубликуем его по выбранной ссылке.",edit:"Вернуться к редактированию",pay:"Перейти к оплате"},
 tj:{steps:["Забон","Муқова","Матн","Тарҳ ва акс","Сана ва макон","Барнома","Пайванд","Пешнамоиш","Пардохт"],back:"Қафо",next:"Давом",send:"Фиристодан",signin:"Ворид шудан",close:"Пӯшидан",chooseLanguage:"Забони даъватномаро интихоб кунед",chooseLanguageText:"Ҳамаи матнҳо ва санаҳо фавран бо забони интихобшуда нишон дода мешаванд.",cover:"Муқоваи даъватнома",message:"Матни даъват",design:"Тарҳ ва акс",program:"Барномаи ҷашн",link:"Нишонии даъватнома",payment:"Пардохт",ready:"Даъватномаи Шумо қариб омода аст.",publish:"Пас аз пардохт ва санҷиши расид даъватнома бо пайванди интихобкардаатон нашр мешавад.",edit:"Бозгашт ба таҳрир",pay:"Гузаштан ба пардохт"},
};

const messages={
 tj:["Бо камоли эҳтиром Шуморо ба ҷашни арӯсии худ даъват менамоем.","Ҳузури Шумо боиси шодмонӣ ва фараҳмандии мост."],
 ru:["С радостью приглашаем вас разделить с нами день нашей свадьбы.","Будем счастливы видеть вас рядом в этот особенный день."],
 uz:["Сизни тўй маросимимизга самимий таклиф қиламиз.","Қувончли кунимизда Сизни кутиб қоламиз."],
};

export function VisualEditor({data,step,language,photoUrl,orderPhoto,busy,error,signedIn,update,setStep,setPhoto,submit,signInUrl,locked=false,lockedMessage,accessPanel,saveDraft,suggestLinks,checkLink,onExit}:Props){
 const linkStep=6, previewStep=7, paymentStep=8;
 const t=copy[language];
 const isPreview=step===previewStep||step===paymentStep;
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
 const [linkNotice,setLinkNotice]=useState("");
 const [checkingLink,setCheckingLink]=useState(false);const moving=useRef(false);
 const [detailsError,setDetailsError]=useState(false);
 const [showEventDetails,setShowEventDetails]=useState(false);
 const continueLabel=language==="tj"?"Идома додан":"Продолжить";
 const eventDetailsTitle=language==="tj"?"Маълумоти ҷашни шумо :)":"Данные вашего торжества :)";
 const optionalSection=step===2?"welcome":step===3?"photo":step===5?"program":undefined;
 useEffect(()=>{
  if(step===paymentStep)return;
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
  void move(step+1,step===linkStep?"":data.slug);
 }
 function nextStep(){void move(step+1);}
 async function move(next:number,slug=data.slug){
  if(busy||locked||moving.current)return;
  moving.current=true;setCheckingLink(true);setLinkNotice("");
  try{
   if(step===linkStep&&next===previewStep){
    if(!slug){const [available]=await suggestLinks();if(!available)throw new Error();slug=available;}
    if(!validSlug(slug)){setLinkError(true);return;}
    if(!await checkLink(slug)){const [available]=await suggestLinks(true);if(!available)throw new Error();slug=available;}
    update("slug",slug);
    if(!data.first.trim()||!data.second.trim()||
     (data.eventType!=="morning"&&(!data.date||!data.time||!data.venue.trim()))||
     (data.eventType!=="wedding"&&(!data.morningDate||!data.morningTime||!data.morningVenue.trim()))){
     setDetailsError(true);setStep(!data.first.trim()||!data.second.trim()?1:4);return;
    }
   }
   if(saveDraft&&((step<previewStep&&next===previewStep)||next===paymentStep)&&!await saveDraft(slug))return;
   setDetailsError(false);setLinkError(false);setStep(Math.max(0,Math.min(totalSteps-1,next)));
  }catch{setLinkNotice(language==="tj"?"Пайванд санҷида нашуд. Бори дигар кӯшиш кунед.":"Не удалось проверить ссылку. Попробуйте ещё раз.");}
  finally{moving.current=false;setCheckingLink(false);}
 }
 const sectionControls:Record<string,ReactNode>={};
 if(step===1&&detailsError) sectionControls.cover=<p role="alert">{language==="tj"?"Номҳоро ворид кунед.":"Введите имена пары."}</p>;
 if(step===2) sectionControls.welcome=<MessageFields data={data} update={update} language={language}/>;
 if(step===3) sectionControls.photo=<DesignFields data={data} update={update} language={language}/>;
 if(step===4) sectionControls.details=<><DetailsFields data={data} update={update} language={language}/>{detailsError&&<p role="alert">{language==="tj"?"Сана, вақт ва маконро ворид кунед.":"Заполните дату, время и место."}</p>}</>;
 if(step===5) sectionControls.program=<><ProgramFields data={data} update={update} language={language}/><InvitationOptions data={data} update={update} language={language}/></>;
 if(optionalSection) sectionControls[optionalSection]=<>{sectionControls[optionalSection]}<button type="button" className="button secondary editor-skip" onClick={skip}>{skipLabel}</button></>;
 return <div className="visual-editor">
  {isPreview&&<section data-editor-section="ready" className={`invitation-ready${locked?" is-locked":""}`} aria-labelledby="invitation-ready-title">
   <div className="ready-atmosphere" aria-hidden="true"><SiteAtmosphere showButterflies={false}/></div>
   <div className="ready-content">
    <p className="ready-kicker">{locked?"BAZMNOMA":language==="tj"?"ҚАДАМИ ОХИРИН":"ПОСЛЕДНИЙ ШАГ"}</p>
    <h1 id="invitation-ready-title">{locked?(language==="tj"?"Фармоиши шумо":"Ваш заказ"):t.ready}</h1>
    {!locked&&<p className="ready-payment-line">{language==="tj"?"Танҳо пардохт мондааст.":"Осталась только оплата."}</p>}
    <p className="ready-description">{lockedMessage??(locked?(language==="tj"?"Фармоиш барои санҷиш фиристода шудааст. Пайванди меҳмонон пас аз тасдиқ омода мешавад.":"Заказ отправлен на проверку. Ссылка для гостей будет доступна после подтверждения публикации."):language==="tj"?"Даъватномаи Шумо сохта шуд. Пардохт кунед ва расидро фиристед — пас аз санҷиш пайванд барои меҳмонон омода мешавад.":"Дизайн и данные уже сохранены. Оплатите приглашение и приложите квитанцию — после проверки мы откроем ссылку для гостей.")}</p>
    {!locked&&<div className="ready-payment-card"><div className="ready-template"><span>{templateName(currentTemplate,language)}</span><strong>{currentTemplate.price} {language==="tj"?"сомонӣ":"сомони"}</strong></div><div className="ready-includes">{language==="tj"?"Пайванди шахсӣ · Ҷавоби меҳмонон · Орзуҳои нек":"Именные ссылки · Ответы гостей · Пожелания"}</div><button disabled={busy||checkingLink} type="button" className="button ready-pay-button" onClick={()=>move(paymentStep)}>{busy?(language==="tj"?"Сабт мешавад…":"Сохраняем…"):(language==="tj"?"Пардохти даъватнома":"Оплатить приглашение")} <ActionArrow/></button><p className="ready-review-note">{language==="tj"?"Нашр пас аз пардохт ва санҷиши расид.":"Публикация после оплаты и проверки квитанции."}</p></div>}
    {!locked&&<button disabled={busy||checkingLink} type="button" className="ready-edit-link" onClick={()=>move(1)}>{t.edit}</button>}
    {accessPanel&&(locked?accessPanel:<details className="ready-access"><summary>{language==="tj"?"Нигоҳ доштани дастрасӣ ба даъватнома":"Сохранить доступ к приглашению"}</summary>{accessPanel}</details>)}
   </div>
  </section>}
  <div className="visual-editor-canvas"><InvitationPage skipOpening data={data} photo={isPreview||isPayment?photoUrl||orderPhoto:photo} editor={locked||step===0||step>=linkStep?undefined:{onEdit:edit,update,setSectionHidden,controls:sectionControls,photoUpload:<InvitationPhotoUpload language={language} onSelect={setPhoto} hasPhoto={!!(photoUrl||orderPhoto)}/>}}/></div>
  <EditorDialog open={step===0&&!showEventDetails} onClose={()=>location.assign(`/templates/${data.template}?lang=${language}`)} className="language-choice-card" label={t.chooseLanguage} closeLabel={t.close}><span className="choice-mark">BAZMNOMA</span><h1>{t.chooseLanguage}</h1><p>{t.chooseLanguageText}</p><div className="language-choice-grid">
   {([['tj','Тоҷикӣ','Тоҷикӣ'],['ru','Русский','Русский'],['uz','Ўзбекча','Ўзбекча']] as const).map(([value,title,sample])=><button type="button" key={value} onClick={()=>{update("locale",value);setShowEventDetails(true);}}><span>{value.toUpperCase()}</span><strong>{title}</strong><small>{sample}</small></button>)}
  </div></EditorDialog>
  <EditorDialog open={step===0&&showEventDetails} onClose={()=>setShowEventDetails(false)} className="event-details-dialog" label={eventDetailsTitle} closeLabel={t.back}>
   <h1>{eventDetailsTitle}</h1>
   <p>{language==="tj"?"Мо ин маълумотро худамон ба бахшҳои лозими даъватнома мегузорем.":"Укажите имена, дату и место. Мы сами подставим эти данные во все нужные разделы приглашения."}</p>
   <form onSubmit={event=>{event.preventDefault();setStep(1);}}>
    <div className="fields">
     <label>{language==="tj"?"Номи домод":"Имя жениха"}<input value={data.first} onChange={event=>update("first",event.target.value)} required pattern={".*\\S.*"}/></label>
     <label>{language==="tj"?"Номи арӯс":"Имя невесты"}<input value={data.second} onChange={event=>update("second",event.target.value)} required pattern={".*\\S.*"}/></label>
    </div>
    <DetailsFields data={data} update={update} language={language} required/>
    <div className="event-details-actions">
     <button type="button" className="button secondary" onClick={()=>setShowEventDetails(false)}>{t.back}</button>
     <button type="submit" className="button">{continueLabel}</button>
    </div>
   </form>
  </EditorDialog>
  {step===linkStep&&<section className="editor-in-place editor-checkout" data-editor-section="checkout"><h2>{t.link}</h2><InvitationLinkFields data={data} update={update} language={language} invalid={linkError} suggestLinks={suggestLinks} checkLink={checkLink}/>{linkNotice&&<p className="alert" role="alert">{linkNotice}</p>}<button type="button" className="button secondary editor-skip" onClick={skip}>{skipLabel}</button></section>}
  <EditorDialog open={isPayment&&!locked} onClose={()=>setStep(previewStep)} busy={busy} className="payment-dialog" label={language==="tj"?"Пардохти даъватнома":"Оплата приглашения"} closeLabel={t.close}>
   <p className="payment-kicker">BAZMNOMA</p><h2>{language==="tj"?"Як қадам то даъвати меҳмонон":"Один шаг до приглашения гостей"}</h2><p className="payment-dialog-intro">{language==="tj"?"Пардохт кунед ва расидро фиристед. Мо онро месанҷем ва даъватномаро нашр мекунем.":"Оплатите и прикрепите квитанцию. Мы проверим её и опубликуем ваше приглашение."}</p>
   <form id="invitation-payment" onSubmit={event=>{if(signedIn&&!locked)submit(event);else event.preventDefault();}}><fieldset disabled={busy||checkingLink}><PaymentFields language={language} template={currentTemplate}/>{error&&<p className="alert payment-error" role="alert">{error}</p>}{signedIn?<button type="submit" className="button payment-submit" disabled={busy||checkingLink}>{busy?(language==="tj"?"Фиристода мешавад…":"Отправляем…"):(language==="tj"?"Пардохт кардам — фиристодани расид":"Я оплатил(а) — отправить квитанцию")} <ActionArrow/></button>:<a className="button payment-submit" href={signInUrl}>{t.signin}</a>}</fieldset></form>
   <button type="button" disabled={busy||checkingLink} className="payment-later" onClick={()=>setStep(previewStep)}>{language==="tj"?"Баъдтар пардохт мекунам":"Оплачу позже"}</button>
  </EditorDialog>
  {error&&!isPayment&&<p className="alert editor-save-error" role="alert">{error}</p>}
  {step!==0&&!isPayment&&<div className="visual-step-dock"><button type="button" className="visual-back" disabled={busy||checkingLink} onClick={()=>locked?onExit?.():move(step-1)}>← <span>{t.back}</span></button><div className="visual-progress"><strong>{t.steps[step]} · {step+1} {language==="tj"?"аз":"из"} {totalSteps}</strong><span><i style={{width:`${((step+1)/totalSteps)*100}%`}}/></span></div>{locked?<button type="button" className="visual-next" onClick={onExit}>{language==="tj"?"Фармоишҳои ман":"Мои заказы"}</button>:!isPayment?<button disabled={busy||checkingLink} type="button" className="visual-next" onClick={nextStep}>{isPreview?t.pay:step===linkStep?(language==="tj"?"Сабти фармоиш":"Оформить заказ"):(busy||checkingLink)?(language==="tj"?"Сабт мешавад…":"Сохраняем…"):t.next} →</button>:signedIn?<button type="submit" form="invitation-payment" className="visual-next" disabled={busy||checkingLink}>{t.send} →</button>:<a className="visual-next" href={signInUrl} target="_top">{t.signin} →</a>}</div>}
 </div>;
}

function DetailsFields({data,update,language,required=false}:{data:Invite;update:Props['update'];language:SiteLanguage;required?:boolean}){return <><label>{language==="tj"?"Навъи маросим":"Вид события"}<select value={data.eventType} onChange={e=>update("eventType",e.target.value)}><option value="wedding">{language==="tj"?"Тӯйи арӯсӣ":"Свадьба"}</option><option value="morning">Оши наҳор</option><option value="both">{language==="tj"?"Ду маросим":"Два события"}</option></select></label>{data.eventType!=="morning"&&<EventFields data={data} update={update} language={language} required={required} morning={false}/>}
 {data.eventType!=="wedding"&&<EventFields data={data} update={update} language={language} required={required} morning/>}</>}
function EventFields({data,update,language,morning,required}:{data:Invite;update:Props["update"];language:SiteLanguage;morning:boolean;required:boolean}){
 const date=morning?"morningDate":"date",time=morning?"morningTime":"time";
 const venue=morning?"morningVenue":"venue",address=morning?"morningAddress":"address";
 return <>
  {data.eventType==="both"&&<h3>{morning?"Оши наҳор":language==="tj"?"Тӯйи арӯсӣ":"Свадьба"}</h3>}
  <div className="fields">
   <label>{language==="tj"?"Сана":"Дата"}<input type="date" required={required} value={data[date]} onInput={e=>update(date,e.currentTarget.value)}/></label>
   <label>{language==="tj"?"Соат":"Время"}<input type="time" required={required} value={data[time]} onInput={e=>update(time,e.currentTarget.value)}/></label>
  </div>
  <label>{required?(language==="tj"?"Тарабхона ё макон":"Ресторан или место"):(language==="tj"?"Ҷой":"Место")}<input required={required} pattern={required?".*\\S.*":undefined} value={data[venue]} onChange={e=>update(venue,e.target.value)}/></label>
  <label>{language==="tj"?"Суроға":"Адрес"}<input value={data[address]} onChange={e=>update(address,e.target.value)}/></label>
 </>;
}
function MessageFields({data,update,language}:{data:Invite;update:Props['update'];language:SiteLanguage}){const options=messages[data.locale as keyof typeof messages]??messages.tj;return <><div className="message-presets">{options.map(value=><button type="button" key={value} aria-pressed={data.message===value} onClick={()=>update("message",value)}>{value}</button>)}</div><label>{language==="tj"?"Матни худ":"Свой текст"}<textarea rows={6} maxLength={450} value={data.message} onChange={e=>update("message",e.target.value)}/></label></>}
function DesignFields({data,update,language}:{data:Invite;update:Props['update'];language:SiteLanguage}){return <><p className="sheet-help">{language==="tj"?"Ранги мувофиқро интихоб кунед — натиҷа фавран нишон дода мешавад.":"Выберите палитру — результат сразу появится на приглашении."}</p><div className="visual-palettes">{palettesFor(data.template).map(option=><button type="button" key={option.id} aria-pressed={paletteFor(data.template,data.palette).id===option.id} onClick={()=>update("palette",option.id)}><span style={{background:`conic-gradient(${option.background} 0 33%,${option.accent} 33% 66%,${option.ink} 66%)`}}/><strong>{option.label}</strong></button>)}</div></>}
function ProgramFields({data,update,language}:{data:Invite;update:Props['update'];language:SiteLanguage}){return <label>{language==="tj"?"Барномаи ҷашн":"Программа события"}<textarea rows={9} maxLength={1000} value={data.program} placeholder="18:00 — Сбор гостей" onChange={e=>update("program",e.target.value)}/></label>}
function PaymentFields({language,template}:{language:SiteLanguage;template:(typeof templates)[number]}){
 const [copied,setCopied]=useState(false),[receiptName,setReceiptName]=useState("");
 const tj=language==="tj";
 return <>
  <div className="visual-order-summary"><span>{templateName(template,language)}</span><strong>{template.price} {tj?"сомонӣ":"сомони"}</strong></div>
  <div className="payment-transfer"><h3>{tj?"Маблағро ба ин рақам гузаронед":"Переведите оплату на этот номер"}</h3><p className="payment-phone"><strong dir="ltr">+992 92 914 22 20</strong></p><button type="button" className="payment-copy" onClick={async()=>{try{await navigator.clipboard.writeText("+992929142220");setCopied(true);}catch{setCopied(false);}}}>{copied?(tj?"Нусхабардорӣ шуд":"Номер скопирован"):(tj?"Нусхабардории рақам":"Скопировать номер")}</button><ul className="payment-banks"><li>Душанбе Сити</li><li>Алиф</li><li>Эсхата</li></ul></div>
  <label className="payment-receipt"><span>{tj?"Расиди пардохтро замима кунед":"Прикрепите квитанцию об оплате"}</span><input type="file" name="receipt" required accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e=>setReceiptName(e.target.files?.[0]?.name||"")}/><strong className="receipt-file-button">{receiptName||(tj?"Интихоби расид":"Выбрать квитанцию")}</strong><small>JPG · PNG · WebP · PDF · {tj?"то 5 МБ":"до 5 МБ"}</small></label>
 </>;
}
