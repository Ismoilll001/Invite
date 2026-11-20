"use client";
import {InvitationCredit} from "../invitation-credit";
import {GuestGreeting} from "../invitation-extras";
import {sectionVisible} from "../model";

// Raabta's scene markup, artwork and motion styles are adapted from
// ziyazee/wedding-invite (src/pages/raabta). Orders and editing use our engine.
import {createContext,createElement,useContext,useEffect,useRef,useState,type CSSProperties,type ReactNode} from "react";
import type {InvitationProps} from "../invitation-page";
import {InlineField} from "../invitation-inline-field";
import {InvitationMusic} from "../invitation-music";
import {invitationTextOverrides,sample} from "../model";
import {invitationDate} from "../invitation-date";
import {useScratchCard} from "./useScratchCard";
const ASSETS="/templates/raabta/assets/";
const EditContext=createContext<InvitationProps|null>(null);
const coreFields:Record<string,"first"|"second"|"message"|"venue"|"address">={"gate.groom":"first","hero.groom":"first","blessing.groom":"first","invite.groom":"first","gate.bride":"second","hero.bride":"second","blessing.bride":"second","invite.bride":"second","family.message":"message","things.venue":"venue","things.address":"address"};
function Copy({field,children,as="span",className,long=false}:{field:string;children:string;as?:"span"|"div"|"h1"|"h2"|"h3"|"p";className?:string;long?:boolean}){
 const props=useContext(EditContext)!;
 const overrides=invitationTextOverrides(props.data.textOverrides);
 const key="raabta."+field;
 const value=overrides[key]??children;
 const label=(props.data.locale==="ru"?"Редактировать: ":"Таҳрир: ")+value;
 const content=props.editor?<InlineField value={value} label={label} long={long} onChange={next=>{
  const core=coreFields[field];
  if(core)props.editor!.update(core,next);
  else props.editor!.update("textOverrides",JSON.stringify({...overrides,[key]:next}));
 }}/>:value;
 return createElement(as,{className},content);
}
const copy={
 ru:{enter:"Открыть приглашение",join:"и",blessing:"С благословением Всевышнего",invite:"Приглашение на свадьбу",honour:"Будем рады видеть вас на нашем торжестве",scratch:"Коснитесь, чтобы узнать дату",scratchHint:"Откройте дату",wedding:"Свадебное торжество",morning:"Оши наҳор",route:"Посмотреть на карте",message:"Дорогие гости!",family:"С радостью приглашаем вас разделить с нами этот особенный день. Ваше присутствие и добрые пожелания станут для нас самым ценным подарком.",photo:"Наше счастливое мгновение",program:"Программа торжества",countdown:"До нашей свадьбы",units:["дней","часов","минут","секунд"],closing:"С любовью и благодарностью",waiting:"Ждём вас!",hide:"Убрать раздел",restore:"Вернуть раздел",date:"Дата торжества",time:"Время",venue:"Место уточняется"},
 tj:{enter:"Даъватномаро кушоед",join:"ва",blessing:"Бо номи Худованди меҳрубон",invite:"Даъватномаи тӯй",honour:"Ҳузури Шумо боиси шодмонии мо мегардад",scratch:"Барои дидани сана ламс кунед",scratchHint:"Санаро кушоед",wedding:"Тӯйи арӯсӣ",morning:"Оши наҳор",route:"Кушодани харита",message:"Меҳмонони гиромӣ!",family:"Бо камоли эҳтиром Шуморо ба ҷашни арӯсии худ даъват менамоем. Ҳузури Шумо ва дуои некатон боиси шодмонӣ ва фараҳмандии мо мегардад.",photo:"Лаҳзаи хушбахтии мо",program:"Барномаи ҷашн",countdown:"То рӯзи тӯй",units:["рӯз","соат","дақиқа","сония"],closing:"Бо муҳаббат ва эҳтиром",waiting:"Шуморо интизорем!",hide:"Бахшро пинҳон кунед",restore:"Бахшро баргардонед",date:"Санаи ҷашн",time:"Вақт",venue:"Ҷой баъдтар муайян мешавад"},
 uz:{enter:"Таклифномани очинг",join:"ва",blessing:"Меҳрибон Аллоҳнинг номи билан",invite:"Тўй таклифномаси",honour:"Тантанамизда сизни кутиб қоламиз",scratch:"Санани билиш учун босинг",scratchHint:"Санани очинг",wedding:"Тўй маросими",morning:"Оши наҳор",route:"Харитада кўриш",message:"Азиз меҳмонлар!",family:"Сизни тўй маросимимизга самимий таклиф қиламиз. Ташрифингиз ва эзгу тилакларингиз биз учун энг азиз совғадир.",photo:"Бизнинг бахтли лаҳзамиз",program:"Тадбир дастури",countdown:"Тўйгача",units:["кун","соат","дақиқа","сония"],closing:"Меҳр ва ҳурмат билан",waiting:"Сизни кутамиз!",hide:"Бўлимни яшириш",restore:"Бўлимни қайтариш",date:"Тадбир санаси",time:"Вақт",venue:"Манзил кейинроқ маълум қилинади"},
};
function Corners(){return <>{["tl","tr","bl","br"].map(pos=><img key={pos} src={ASSETS+"corner-spray.webp"} alt="" loading="lazy" className={`vessel-corner vessel-corner-${pos}`}/>)}</>}
export function RaabtaInvitation(props:InvitationProps){
 if(props.coverOnly){
  const locale=props.data.locale==="ru"?"ru":props.data.locale==="uz"?"uz":"tj";
  return <div className="raabta-native raabta-thumbnail" data-gate="entered" aria-hidden="true">
   <div className="scene scene-hero"><img src={ASSETS+"mosque-scene.webp"} alt="" className="scene-hero-mosque" loading="lazy"/>
    <div className="scene-hero-content"><img src={ASSETS+"crescent-moon.webp"} alt="" className="scene-hero-moon" loading="lazy"/>
     <div className="hero-names-row"><span className="hero-name">{props.data.first||sample.first}</span><span className="hero-join">{copy[locale].join}</span><span className="hero-name">{props.data.second||sample.second}</span></div>
     <div className="hero-rule"/><p className="hero-blessing">{copy[locale].honour}</p>
    </div>
   </div>
  </div>;
 }
 return <EditContext.Provider value={props}><RaabtaFull {...props}/></EditContext.Provider>;
}
function RaabtaFull({data,photo,editor,preview,rsvp,guest,skipOpening}:InvitationProps){
 const locale=data.locale==="ru"?"ru":data.locale==="uz"?"uz":"tj";
 const t=copy[locale];
 const first=data.first||sample.first,second=data.second||sample.second;
 const root=useRef<HTMLDivElement>(null);
 const [opened,setOpened]=useState(Boolean(editor||preview||skipOpening));
 const [entered,setEntered]=useState(Boolean(editor||preview||skipOpening));
 function openGate(){
  if(opened)return;
  setOpened(true);
  const audio=root.current?.querySelector<HTMLAudioElement>(".invitation-music audio");
  if(audio)void audio.play().catch(()=>{});
 }
 useEffect(()=>{
  if(editor||preview||skipOpening||entered)return;
  const body=document.body,html=document.documentElement;
  const oldBody=body.style.overflow,oldHtml=html.style.overflow;
  body.style.overflow="hidden";html.style.overflow="hidden";
  const timer=opened?window.setTimeout(()=>setEntered(true),window.matchMedia("(prefers-reduced-motion: reduce)").matches?0:2800):undefined;
  return ()=>{body.style.overflow=oldBody;html.style.overflow=oldHtml;if(timer!==undefined)window.clearTimeout(timer);};
 },[opened,entered,Boolean(editor),preview,skipOpening]);
 const canvas=useRef<HTMLCanvasElement>(null),scratch=useRef<HTMLDivElement>(null),confetti=useRef<HTMLDivElement>(null);
 const hidden=(data.hiddenSections??"").split(",");
 const [seconds,setSeconds]=useState<number|null>(null);
 const eventDate=data.eventType==="morning"?data.morningDate:data.date;
 const eventTime=data.eventType==="morning"?data.morningTime:data.time;
 const pretty=(value:string)=>{const day=new Date(value+"T12:00:00Z");return Number.isFinite(+day)?invitationDate(day,locale):value;};
 const starts=eventDate&&eventTime?new Date(eventDate+"T"+eventTime+":00+05:00").getTime():NaN;
 const {fallbackReveal}=useScratchCard(canvas,scratch,confetti,t.scratchHint,eventDate);
 useEffect(()=>{
  if(!Number.isFinite(starts)){setSeconds(null);return;}
  const tick=()=>setSeconds(Math.max(0,Math.floor((starts-Date.now())/1000)));
  tick();const id=setInterval(tick,1000);return ()=>clearInterval(id);
 },[starts]);
 // The gate covers the opening scene, not browser chrome or the editor's toolbar.
 useEffect(()=>{
  const page=root.current;
  if(!page||editor||!opened||typeof IntersectionObserver==="undefined"||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  page.setAttribute("data-reveal-active","");
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}},{threshold:.2});
  page.querySelectorAll('.scene,.lantern-divider').forEach(scene=>scene.querySelectorAll<HTMLElement>('.reveal').forEach((el,index)=>{el.style.transitionDelay=`${Math.min(index*90,540)}ms`;observer.observe(el);}));
  return ()=>{observer.disconnect();page.removeAttribute("data-reveal-active");};
 },[opened,editor,data.hiddenSections,Boolean(photo)]);
 const sections=(id:string,title:string,children:ReactNode)=><section data-editor-section={id} key={id}>
  {editor&&<div className="invitation-section-control"><span>{title}</span><button type="button" onClick={()=>editor.setSectionHidden(id,!hidden.includes(id))}>{hidden.includes(id)?t.restore:t.hide}</button></div>}
  {!hidden.includes(id)&&children}
  {editor?.controls?.[id]&&<div className="editor-in-place">{editor.controls[id]}</div>}
 </section>;
 const field=(key:keyof typeof data,value:string,type="text",display?:string)=>editor?<InlineField value={value} display={display} type={type} label={type==="date"?t.date:type==="time"?t.time:value} onChange={value=>editor.update(key,value)}/>:display??value;
 const events=data.eventType==="both"?[{title:t.morning,date:data.morningDate,time:data.morningTime,venue:data.morningVenue,address:data.morningAddress},{title:t.wedding,date:data.date,time:data.time,venue:data.venue,address:data.address}]:[{title:data.eventType==="morning"?t.morning:t.wedding,date:eventDate,time:eventTime,venue:data.eventType==="morning"?data.morningVenue:data.venue,address:data.eventType==="morning"?data.morningAddress:data.address}];
 const parts=seconds===null?["—","—","—","—"]:[Math.floor(seconds/86400),Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60];
 const programs=(data.program||sample.program).split("\n").map(v=>v.trim()).filter(Boolean);
 const colors={"--inv-paper":"#faf7f0","--inv-ink":"#1a2340","--inv-accent":"#ad7d1f"} as CSSProperties;
 return <div ref={root} className={`raabta-native${editor?" is-editing":""}`} data-gate={entered?"entered":opened?"opening":"closed"} lang={locale==="tj"?"tg":locale}>
  <section data-editor-section="cover" className="raabta-opening">
   {!editor&&!preview&&!entered&&<button type="button" className={`gate-overlay${opened?" gate-open gate-revealed":""}`} aria-hidden={opened||undefined} tabIndex={opened?-1:0} aria-label={t.enter} onPointerUp={event=>{if(event.button===0)openGate();}} onClick={openGate}>
    <span className="gate-leaf gate-leaf-left"/><span className="gate-leaf gate-leaf-right"/><span className="gate-flare"/>
    <span className="gate-cta"><span className="gate-cta-bismillah" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span><span className="gate-cta-names"><span className="gate-cta-groom">{first}</span><span className="gate-cta-amp">{t.join}</span><span className="gate-cta-bride">{second}</span></span>{guest&&<span className="gate-personal-name">{guest.name}</span>}<span className="gate-cta-tap">{t.enter}</span></span>
   </button>}
   <div className="scene scene-hero"><img src={ASSETS+"mosque-scene.webp"} alt="" className="scene-hero-mosque" fetchPriority="high"/>
    <div className="stars" aria-hidden="true">{[6,16,27,38,49,59,69,78,87].map((left,i)=><span key={left} className={`star star-${["a","b","c"][i%3]}`} style={{left:left+"%",width:10+i%5,animationDelay:`-${i}s`}}/>)}</div>
    <div className="scene-hero-content"><img src={ASSETS+"crescent-moon.webp"} alt="" className="scene-hero-moon"/><div className="hero-names-row"><Copy field="hero.groom" className="hero-name">{first}</Copy><span className="hero-join">{t.join}</span><Copy field="hero.bride" className="hero-name">{second}</Copy></div><div className="hero-rule"/><Copy field="hero.blessing" as="div" className="hero-blessing">{t.honour}</Copy><GuestGreeting guest={guest} locale={locale}/></div>
   </div>{editor?.controls?.cover}
  </section>
  {sections("story",t.blessing,<div className="scene scene-blessing scene-crowned"><div className="scene-inner"><div className="vessel reveal"><Corners/><img src={ASSETS+"bismillah-medallion.webp"} alt="Бисмиллоҳ" className="scene-medallion" loading="lazy"/><Copy as="div" field="blessing.text" className="invite-blessing">{t.blessing}</Copy><div className="invite-person-block"><Copy as="div" field="blessing.groom" className="invite-person-name">{first}</Copy></div><div className="invite-divider"/><div className="invite-person-block"><Copy as="div" field="blessing.bride" className="invite-person-name">{second}</Copy></div></div></div></div>)}
  {sections("details",t.invite,<><div className="scene scene-invite"><div className="scene-inner"><img src={ASSETS+"lattice-arch.webp"} alt="" className="scene-arch reveal" loading="lazy"/><Copy as="h1" field="invite.title" className="invite-title reveal">{t.invite}</Copy><Copy as="div" field="invite.subtitle" className="invite-join reveal">{t.honour}</Copy><Copy as="div" field="invite.groom" className="invite-person reveal">{first}</Copy><div className="invite-amp">{t.join}</div><Copy as="div" field="invite.bride" className="invite-person reveal">{second}</Copy><div className="invite-divider"/>
   {eventDate&&<><div className="scratch-date-wrap reveal" ref={scratch}><div className="scratch-date-box"><span className="scratch-date-text">{field(data.eventType==="morning"?"morningDate":"date",eventDate,"date",pretty(eventDate))}</span>{!editor&&<canvas ref={canvas} className="scratch-date-canvas" aria-hidden="true"/>}</div>{!editor&&<button type="button" className="scratch-date-fallback" onClick={fallbackReveal}>{t.scratch}</button>}</div><div ref={confetti} className="confetti-burst" aria-hidden="true"/></>}
  </div></div><div className="functions-run">{events.map((event,i)=>{const morning=data.eventType==="morning"||(data.eventType==="both"&&i===0);return <div className="scene scene-function" key={event.title}><div className="function-card reveal"><Corners/><h3 className="fn-name">{event.title}</h3><div className="invite-divider fn-divider"/>{event.date&&<p className="fn-row">{pretty(event.date)}</p>}<p className="fn-row">{field(morning?"morningTime":"time",event.time,"time")}</p><p className="fn-row">{field(morning?"morningVenue":"venue",event.venue||t.venue)}<br/>{field(morning?"morningAddress":"address",event.address)}</p>{event.venue&&<a className="fn-map" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue+" "+event.address)}`}>{t.route}</a>}</div></div>;})}</div></>)}
  {sections("welcome",t.message,<div className="scene scene-couple"><div className="scene-inner"><Copy as="h2" field="family.title" className="meet-title reveal">{t.message}</Copy><div className="invite-divider"/><Copy as="p" field="family.message" className="meet-story reveal" long>{data.message||t.family}</Copy></div></div>)}
  {(photo||editor)&&sections("photo",t.photo,<div className="scene scene-invite"><div className="scene-inner"><Copy as="h2" field="photo.title" className="meet-title reveal">{t.photo}</Copy>{editor?.photoUpload}<div className="raabta-photo reveal"><img src={photo||"/images/demo-couple.webp"} alt={t.photo} loading="lazy"/><img src={ASSETS+"photo-frame.webp"} className="raabta-photo-frame" alt="" loading="lazy"/></div></div></div>)}
  <div className="lantern-divider" aria-hidden="true"><div className="hang-row">{[0,1,2].map(i=><div key={i} className={`hang${i===1?" hang-mid":""}`} style={{"--drop":i===1?"36px":"8px","--dur":(4+i*.6)+"s","--delay":(-i)+"s","--tilt":"5deg","--w":i===1?"84px":"62px"} as CSSProperties}><img src={ASSETS+"lantern-float.webp"} className="hang-img" alt="" loading="lazy"/><span className="hang-glow"/></div>)}</div></div>
  {(editor||programs.length>0)&&sections("program",t.program,<div className="scene scene-things scene-crowned"><div className="scene-inner"><div className="vessel reveal"><Corners/><Copy as="h2" field="program.title" className="things-title">{t.program}</Copy><div className="invite-divider"/>{programs.map((line,i)=>{const [time,...rest]=line.split(/\s+[—-]\s+/);return <div className="thing-row" key={i}><div className="thing-sub">{rest.length?time:""}</div><Copy as="div" field={"program.item"+i} className="thing-val">{rest.length?rest.join(" — "):line}</Copy></div>;})}</div></div></div>)}
  {Number.isFinite(starts)&&sections("countdown",t.countdown,<div className="scene scene-countdown"><div className="scene-inner"><Copy as="h2" field="countdown.title" className="countdown-title reveal">{t.countdown}</Copy><div className="countdown-date">{pretty(eventDate)}</div><div className="countdown-timer" role="timer">{t.units.map((label,i)=><div className="countdown-box" key={label}><span className="countdown-val">{typeof parts[i]==="number"?String(parts[i]).padStart(2,"0"):parts[i]}</span><span className="countdown-lbl">{label}</span></div>)}</div></div></div>)}
  {rsvp}
  {sections("closing",t.waiting,<div className="scene scene-rsvp"><div className="scene-inner"><Copy as="h2" field="closing.title" className="rsvp-title reveal">{t.waiting}</Copy><div className="invite-divider"/><Copy as="p" field="closing.text" className="raabta-closing-copy reveal">{t.closing}</Copy><div className="invite-person reveal">{first} {t.join} {second}</div><div className="footer-ending"><img src={ASSETS+"footer-ornament.webp"} className="footer-ornament" alt="" loading="lazy"/><InvitationCredit/></div></div></div>)}
  {!preview&&sectionVisible(data,"music")&&<InvitationMusic locale={locale} style={colors} src="/templates/raabta/music.mp3" volume={1}/>}
 </div>;
}
