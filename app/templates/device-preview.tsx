"use client";

import {ActionArrow} from "../action-arrow";
import {useState} from "react";
import {InvitationPage} from "../invitation-page";
import {palettesFor,sample,templateName,templates,type SiteLanguage} from "../model";

export function DevicePreview({item,initialLanguage="tj"}:{item:(typeof templates)[number];initialLanguage?:SiteLanguage}){
 const [language,setLanguage]=useState<SiteLanguage>(initialLanguage);
 const palettes=palettesFor(item.id);
 const [palette,setPalette]=useState(palettes[0].id);
 function start(){
  const data={...sample,template:item.id,palette,locale:language,eventType:item.event,program:""};
  localStorage.setItem("khushbakhtDraft",JSON.stringify({data,step:0}));
  location.assign(`/?tab=edit&template=${item.id}&palette=${palette}&lang=${language}`);
 }
 return <div className={`template-demo template-demo-${item.id}`}>
  <div className="demo-language-switch language-switch" aria-label={language==="tj"?"Забони намоиш":"Язык демо"}><button aria-pressed={language==="tj"} onClick={()=>setLanguage("tj")}>Тоҷ</button><button aria-pressed={language==="ru"} onClick={()=>setLanguage("ru")}>Рус</button></div>
  <InvitationPage data={{...sample,template:item.id,palette,locale:language,eventType:item.event,program:""}} photo="/images/demo-couple.webp"/>
  <div className="demo-dock-wrap"><div className="demo-dock">
   <a className="demo-back" aria-label={language==="tj"?"Бозгашт ба даъватномаҳо":"Назад к шаблонам"} href={`/templates?lang=${language}`}>← <span>{language==="tj"?"Бозгашт":"Назад"}</span></a>
   <div className="demo-name"><small>{language==="tj"?"НАМУНАИ ДАЪВАТНОМА":"ДЕМО ПРИГЛАШЕНИЯ"}</small><strong>{templateName(item,language)}</strong></div>
   <button className="demo-select" onClick={start}><ActionArrow/>{language==="tj"?"Ҳамин даъватномаро интихоб мекунам":"Выбрать этот шаблон"}</button>
  </div></div>
 </div>;
}
