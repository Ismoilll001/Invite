"use client";

import {useEffect,useRef,useState,type ReactNode} from "react";
import type {InvitationProps} from "../invitation-page";
import {InvitationCredit} from "../invitation-credit";
import {GuestGreeting} from "../invitation-extras";
import {InlineField} from "../invitation-inline-field";
import {InvitationMusic} from "../invitation-music";
import {InvitationCountdown} from "../invitation-countdown";
import {InvitationReveal} from "../invitation-reveal";
import {invitationDate} from "../invitation-date";
import {invitationTextOverrides,sectionVisible,sample,type Invite} from "../model";

const copy={
 tj:{kicker:"ДАЪВАТНОМАИ ТӮЙ",join:"ва",open:"Даъватномаро кушоед",dear:"Меҳмонони азиз",welcome:"Хуш омадед ба ҷашни мо",message:"Бо камоли эҳтиром Шуморо ба ҷашни арӯсии худ даъват мекунем. Ҳузури Шумо шодии ин рӯзро дучанд мегардонад.",story:"Қиссаи мо",storyText:"Беҳтарин лаҳзаҳо ҳамонҳоянд, ки онҳоро бо наздиконамон мегузаронем. Имрӯз мехоҳем оғози саҳифаи нави зиндагии худро бо Шумо ҷашн гирем.",details:"Вақт ва макони ҷашн",when:"Рӯзи ҷашн",where:"Макони ҷашн",map:"Дидани харита",program:"Барномаи ҷашн",closing:"Бо муҳаббат интизори Шумоем",closingText:"Ташрифи Шумо барои мо беҳтарин туҳфа аст.",photo:"Акси арӯсу домод",edit:"Таҳрир",hide:"Пинҳон кунед",restore:"Баргардонед",morning:"Оши наҳор",wedding:"Тӯйи арӯсӣ",scroll:"Лаҳзаҳои ҷашни мо",unknown:"Маълумот баъдтар илова мешавад"},
 ru:{kicker:"СВАДЕБНОЕ ПРИГЛАШЕНИЕ",join:"и",open:"Открыть приглашение",dear:"Дорогие гости",welcome:"Разделите с нами этот день",message:"С большой радостью приглашаем вас на нашу свадьбу. Будем счастливы разделить этот особенный день с самыми близкими людьми.",story:"Наша история",storyText:"Самые тёплые воспоминания рождаются рядом с любимыми людьми. Мы начинаем новую главу нашей жизни и хотим отпраздновать её вместе с вами.",details:"Когда и где встречаемся",when:"Дата и время",where:"Место торжества",map:"Открыть карту",program:"Программа вечера",closing:"С любовью ждём вас",closingText:"Ваше присутствие — самый дорогой подарок для нас.",photo:"Фото жениха и невесты",edit:"Изменить",hide:"Убрать раздел",restore:"Вернуть раздел",morning:"Оши наҳор",wedding:"Свадьба",scroll:"Особенные мгновения нашего дня",unknown:"Информация будет добавлена позже"},
 uz:{kicker:"ТЎЙ ТАКЛИФНОМАСИ",join:"ва",open:"Таклифномани очиш",dear:"Азиз меҳмонлар",welcome:"Бахтли кунимизга хуш келибсиз",message:"Сизни тўйимизга таклиф этамиз. Ушбу қувончли кунимизни сиз билан баҳам кўришдан бахтиёрмиз.",story:"Бизнинг ҳикоямиз",storyText:"Энг гўзал лаҳзалар яқинларимиз билан бирга ўтади. Янги ҳаётимизнинг бошланишини сиз билан нишонлашни истаймиз.",details:"Қачон ва қаерда",when:"Сана ва вақт",where:"Тантана манзили",map:"Харитани очиш",program:"Байрам дастури",closing:"Сизни меҳр билан кутамиз",closingText:"Ташрифингиз биз учун энг қимматли совға.",photo:"Келин ва куёв сурати",edit:"Таҳрир",hide:"Бўлимни яшириш",restore:"Бўлимни қайтариш",morning:"Оши наҳор",wedding:"Тўй",scroll:"Байрамимиз лаҳзалари",unknown:"Маълумот кейинроқ қўшилади"},
};

function Seal({first,second}:{first:string;second:string}){return <div className="royal-seal" aria-hidden="true"><span>{Array.from(first)[0]}</span><i>·</i><span>{Array.from(second)[0]}</span></div>}

export function RoyalInvitation({data,photo,preview=false,coverOnly=false,editor,rsvp,guest,skipOpening}:InvitationProps){
 const locale=data.locale in copy?data.locale as keyof typeof copy:"tj";const t=copy[locale];
 const first=data.first||sample.first,second=data.second||sample.second;
 const [opened,setOpened]=useState(!!editor||preview||coverOnly||!!skipOpening);
 const [entered,setEntered]=useState(!!editor||preview||coverOnly||!!skipOpening);
 const root=useRef<HTMLDivElement>(null);
 const overrides=invitationTextOverrides(data.textOverrides);
 const morning=data.eventType==="morning";
 const date=(morning?data.morningDate:data.date)||sample.date;
 const time=(morning?data.morningTime:data.time)||sample.time;
 const venue=(morning?data.morningVenue:data.venue)||t.unknown;
 const address=morning?data.morningAddress:data.address;
 const parsed=new Date(date+"T12:00:00Z");
 const dateLabel=Number.isFinite(+parsed)?invitationDate(parsed,locale,true):date;
 const start=Date.parse(date+"T"+time+":00+05:00");
 useEffect(()=>{
  if(entered)return;
  const previous=document.documentElement.style.overflow;document.documentElement.style.overflow="hidden";
  return()=>{document.documentElement.style.overflow=previous;};
 },[entered]);
 useEffect(()=>{if(opened&&!entered){const timer=setTimeout(()=>setEntered(true),1100);return()=>clearTimeout(timer);}},[opened,entered]);
 function open(){if(opened)return;setOpened(true);const player=root.current?.querySelector<HTMLAudioElement>('audio');if(player)void player.play().catch(()=>{});}
 const field=(key:keyof Invite,value:string)=>editor?<InlineField value={value} label={t.edit} onChange={next=>editor.update(key,next)}/>:value;
 function text(key:string,fallback:string,long=false){const value=overrides[key]??fallback;return editor?<InlineField value={value} label={t.edit} long={long} onChange={next=>editor.update("textOverrides",JSON.stringify({...overrides,[key]:next}))}/>:value;}
 function section(id:string,title:string,content:ReactNode){const hidden=(data.hiddenSections??"").split(",").includes(id);return <>{editor&&<div className="invitation-section-control" data-editor-section={id}><button type="button" onClick={()=>editor.setSectionHidden(id,!hidden)}>{hidden?t.restore:t.hide} · {title}</button></div>}{!hidden&&content}{editor?.controls?.[id]&&<div className="editor-in-place">{editor.controls[id]}</div>}</>;}
 const hero=<section className="royal-hero"><div className="royal-frame" aria-hidden="true"/><div className="royal-cover-copy"><GuestGreeting guest={guest} locale={locale}/><p className="royal-eyebrow">{text("royal.kicker",t.kicker)}</p><Seal first={first} second={second}/><h1 className="royal-names"><span>{field("first",first)}</span><i>{t.join}</i><span>{field("second",second)}</span></h1><p className="royal-date">{editor?<InlineField type="date" value={date} display={dateLabel} label={t.edit} onChange={v=>editor.update(morning?"morningDate":"date",v)}/>:dateLabel}</p><div className="royal-fine-rule"/>{!coverOnly&&<p className="royal-scroll">{text("royal.scroll",t.scroll)}</p>}</div><span className="royal-corner royal-corner-one" aria-hidden="true">✧</span><span className="royal-corner royal-corner-two" aria-hidden="true">✧</span></section>;
 if(coverOnly)return <div className="royal-invitation royal-thumbnail" aria-hidden="true">{hero}</div>;
 return <div ref={root} className={`royal-invitation${editor?" royal-editing":""}`} lang={locale==="tj"?"tg":locale}>
  {!entered&&<div className={`royal-gate${opened?" is-open":""}`}><div className="royal-frame" aria-hidden="true"/><p className="royal-eyebrow">{t.kicker}</p><Seal first={first} second={second}/><p className="royal-gate-names">{first}<i>{t.join}</i>{second}</p><p className="royal-date">{dateLabel}</p><GuestGreeting guest={guest} locale={locale}/><div className="royal-guest-label"><span>{t.dear}</span><p>{locale==="ru"?"Для вас — особое место в нашем празднике":locale==="uz"?"Байрамимизда сиз учун алоҳида ўрин бор":"Дар ҷашни мо барои Шумо ҷойи махсус ҳаст"}</p></div><button className="royal-button" type="button" onClick={open}>{t.open}</button></div>}
  {hero}
  {Number.isFinite(start)&&section("countdown",t.when,<div className="royal-countdown"><InvitationCountdown startsAt={start} locale={locale}/></div>)}
  {section("welcome",t.dear,<section className="royal-section royal-welcome invitation-section"><div className="royal-section-heading"><p className="royal-eyebrow">{text("welcomeKicker",t.dear)}</p><h2>{text("welcomeTitle",t.welcome)}</h2><div className="royal-fine-rule"/><p>{field("message",data.message||t.message)}</p></div></section>)}
  {(photo||editor)&&section("photo",t.photo,<section className="royal-section invitation-section">{editor?.photoUpload}{photo&&<figure className="royal-portrait"><img src={photo} alt={t.photo} loading="lazy"/><figcaption>{first} &amp; {second}</figcaption></figure>}</section>)}
  {section("story",t.story,<section className="royal-section royal-story invitation-section"><p className="royal-eyebrow">{text("storyKicker",locale==="ru"?"НОВАЯ ГЛАВА":"САҲИФАИ НАВ")}</p><h2>{text("storyTitle",t.story)}</h2><div className="royal-fine-rule"/><p>{text("storyText",t.storyText,true)}</p><div className="royal-rings" aria-hidden="true"><span/><span/></div></section>)}
  {section("details",t.details,<section className="royal-section royal-details invitation-section"><p className="royal-eyebrow">{text("detailsKicker",t.wedding)}</p><h2>{text("detailsTitle",t.details)}</h2><div className="royal-details-grid"><article><span className="royal-eyebrow">{t.when}</span><h3>{dateLabel}</h3><p className="royal-time">{field(morning?"morningTime":"time",time)}</p></article><article><span className="royal-eyebrow">{t.where}</span><h3>{field(morning?"morningVenue":"venue",venue)}</h3><p>{field(morning?"morningAddress":"address",address)}</p>{(data.venue||data.morningVenue)&&<a className="royal-button" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue+" "+address)}`} target="_blank" rel="noreferrer">{t.map}</a>}</article></div>{data.eventType==="both"&&<article className="royal-morning"><h3>{t.morning}</h3><p>{data.morningDate} · {data.morningTime}</p><p>{data.morningVenue} · {data.morningAddress}</p></article>}</section>)}
  {section("program",t.program,<section className="royal-section royal-program invitation-section"><p className="royal-eyebrow">{text("programKicker",locale==="ru"?"ПЛАН ВЕЧЕРА":"БАРНОМА")}</p><h2>{text("programTitle",t.program)}</h2><div className="royal-timeline">{(data.program||sample.program).split("\n").filter(Boolean).map((line,i)=>{const split=line.match(/^(\d{1,2}:\d{2})\s*[—–-]?\s*(.*)$/);return <article key={i}><time>{split?.[1]??"✦"}</time><p>{split?.[2]??line}</p></article>;})}</div></section>)}
  {rsvp}
  {section("closing",t.closing,<section className="royal-section royal-closing invitation-section"><Seal first={first} second={second}/><h2>{text("closingTitle",t.closing)}</h2><p>{text("closingText",t.closingText)}</p><strong>{first} <i>{t.join}</i> {second}</strong><InvitationCredit/></section>)}
  {!preview&&!editor&&sectionVisible(data,"music")&&<InvitationMusic locale={locale} style={{"--inv-ink":"#441020","--inv-accent":"#c9a45e"} as React.CSSProperties}/>}
  <InvitationReveal sectionState={data.hiddenSections??""} enabled={!editor}/>
 </div>;
}
