"use client";
import {ActionArrow} from "./action-arrow";


import {useEffect,useMemo,useRef,useState} from "react";
import {InvitationPage} from "./invitation-page";
import {sample,templateDetail,templateName,templates,type EventFilter,type SiteLanguage} from "./model";

const labels={
 tj:{title:"Даъватномаҳои мо",catalog:"Даъватномаи дӯстдоштаи худро интихоб кунед",kicker:"ДАЪВАТНОМАҲО БАРОИ ҶАШНИ ШУМО",description:"Даъватномаҳоро бинед ва тарҳи писандидаатонро интихоб кунед.",all:"Ҳама",wedding:"Тӯй",morning:"Оши наҳор",both:"Ду маросим",popular:"Пешниҳоди мо",newest:"Нав",low:"Аввал арзон",high:"Аввал гарон",currency:"сомонӣ"},
 ru:{title:"Популярные шаблоны",catalog:"Выберите приглашение, которое подходит именно вам",kicker:"КОЛЛЕКЦИЯ ШАБЛОНОВ",description:"Откройте демо, посмотрите приглашение глазами гостя и выберите любимый дизайн.",all:"Все",wedding:"Свадьба",morning:"Оши наҳор",both:"Два события",popular:"Популярные",newest:"Новые",low:"Сначала дешевле",high:"Сначала дороже",currency:"сомони"},
};

export function TemplateCatalog({standalone,language="tj",limit}:{standalone:boolean;language?:SiteLanguage;limit?:number}){
 const t=labels[language];
 const [filter,setFilter]=useState<EventFilter>("all");
 const [sort,setSort]=useState("popular");
 const visible=useMemo(()=>{
  const list=filter==="all"?[...templates]:templates.filter(item=>item.event===filter);
  if(sort==="low")list.sort((a,b)=>a.price-b.price);
  if(sort==="high")list.sort((a,b)=>b.price-a.price);
  if(sort==="newest")list.reverse();
  return limit?list.slice(0,limit):list;
 },[filter,sort,limit]);
 return <section className={`shell catalog ${standalone?"catalog-page":""}`} id="designs">
  {standalone?<div className="catalog-hero">
   <span className="catalog-orbit catalog-orbit-one" aria-hidden="true"/><span className="catalog-orbit catalog-orbit-two" aria-hidden="true"/><span className="catalog-star catalog-star-one" aria-hidden="true">✦</span><span className="catalog-star catalog-star-two" aria-hidden="true">·</span>
   <p className="catalog-kicker">{t.kicker}</p><h1>{t.catalog}</h1><p className="catalog-lead">{t.description}</p>
  </div>:<div className="section-heading"><div><h2>{t.title}</h2><p className="description">{t.description}</p></div></div>}
  <div className={standalone?"catalog-controls":""}>
   <div className="style-filters" role="group" aria-label={language==="tj"?"Навъи маросим":"Вид события"}>
    {(["all","wedding","morning","both"] as EventFilter[]).filter(value=>value==="all"||templates.some(item=>item.event===value)).map(item=><button key={item} type="button" aria-pressed={filter===item} onClick={()=>setFilter(item)}>{t[item]}</button>)}
   </div>
   {standalone&&<select className="catalog-sort" aria-label={language==="tj"?"Тартиб":"Сортировка"} value={sort} onChange={e=>setSort(e.target.value)}><option value="popular">{t.popular}</option><option value="newest">{t.newest}</option><option value="low">{t.low}</option><option value="high">{t.high}</option></select>}
  </div>
  <div className="gallery template-gallery">
   {visible.map(item=><article className="tile" key={item.id}><a href={`/templates/${item.id}?lang=${language}`} className="tile-link" aria-label={templateName(item,language)}>
    <TemplatePreview item={item} language={language}/>
    <div className="tile-caption"><div><p className="tile-style">{templateDetail(item,language)}</p><h3>{templateName(item,language)}</h3><p><strong>{item.price}</strong> {t.currency}</p></div><span className="icon" aria-hidden="true"><ActionArrow/></span></div>
   </a></article>)}
  </div>
  {!standalone&&<div className="catalog-more"><a className="button secondary" href={`/templates?lang=${language}`}>{language==="tj"?"Ҳамаи даъватномаҳо":"Все шаблоны"} <ActionArrow/></a></div>}
 </section>;
}

function TemplatePreview({item,language}:{item:(typeof templates)[number];language:SiteLanguage}){
 const root=useRef<HTMLDivElement>(null);
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const element=root.current;
  if(!element)return;
  if(typeof IntersectionObserver==="undefined"){setVisible(true);return;}
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.15});
  observer.observe(element);return ()=>observer.disconnect();
 },[]);
 return <div className="tile-preview" ref={root} data-preview-visible={visible}>
  <InvitationPage data={{...sample,template:item.id,locale:language,eventType:item.event}} coverOnly/>
 </div>;
}
