"use client";
import {useEffect,useRef,useState} from "react";
import {validSlug,type Invite,type SiteLanguage} from "./model";
export type LinkSuggestions=(fresh?:boolean)=>Promise<string[]>;
export type LinkCheck=(slug:string)=>Promise<boolean>;
export function InvitationLinkFields({data,update,language,invalid,suggestLinks,checkLink}:{data:Invite;update:(key:keyof Invite,value:string)=>void;language:SiteLanguage;invalid:boolean;suggestLinks:LinkSuggestions;checkLink:LinkCheck}){
 const tj=language==="tj",latest=useRef(data.slug);latest.current=data.slug;
 const [options,setOptions]=useState<string[]>([]),[loading,setLoading]=useState(true),[refresh,setRefresh]=useState(0),[error,setError]=useState("");
 const [status,setStatus]=useState<"idle"|"checking"|"available"|"taken"|"invalid"|"error">("idle");
 useEffect(()=>{
  let active=true;const initial=latest.current;setLoading(true);setError("");setOptions([]);
  suggestLinks(refresh>0).then(values=>{if(!active)return;setOptions(values);if(values[0]&&latest.current===initial&&(!initial||refresh>0))update("slug",values[0]);if(!values.length)setError(tj?"Пайванди дигарро ворид кунед.":"Введите другой адрес.");}).catch(()=>{if(active)setError(tj?"Пайвандҳо санҷида нашуданд. Бори дигар кӯшиш кунед.":"Не удалось подобрать ссылки. Повторите попытку.");}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[suggestLinks,refresh]);
 useEffect(()=>{
  let active=true;if(!data.slug){setStatus("idle");return;}if(!validSlug(data.slug)){setStatus("invalid");return;}setStatus("checking");
  const timer=setTimeout(()=>{checkLink(data.slug).then(available=>{if(active)setStatus(available?"available":"taken");}).catch(()=>{if(active)setStatus("error");});},350);
  return()=>{active=false;clearTimeout(timer);};
 },[data.slug,checkLink]);
 return <>
  <p className="sheet-help">{tj?"Пайвандро интихоб кунед ё нишонии худро нависед.":"Выберите вариант ссылки или укажите свой."}</p>
  {loading&&<p role="status">{tj?"Пайвандҳо ҷустуҷӯ мешаванд…":"Подбираем ссылки…"}</p>}
  <div className="message-presets link-suggestions">{options.map(slug=><button type="button" key={slug} aria-pressed={data.slug===slug} onClick={()=>update("slug",slug)}><span>/i/{slug}</span></button>)}</div>
  <button type="button" className="button secondary generate-links" disabled={loading} onClick={()=>setRefresh(v=>v+1)}>{tj?"Пайвандҳои дигар":"Другие варианты"}</button>
  {error&&<p className="alert" role="alert">{error}</p>}
  <label>{tj?"Нишонии пайванд":"Адрес ссылки"}<div className="slug-field"><span>/i/</span><input maxLength={50} autoComplete="off" spellCheck={false} aria-invalid={status==="taken"||status==="invalid"} aria-describedby="link-availability" value={data.slug} onChange={e=>update("slug",e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))}/></div></label>
  <p id="link-availability" className={`link-availability is-${status}`} role="status">{status==="checking"?(tj?"Пайванд санҷида мешавад…":"Проверяем адрес…"):status==="available"?"":status==="taken"?(tj?"Ин пайванд аллакай истифода мешавад. Варианти дигарро интихоб кунед.":"Адрес занят. Выберите другой вариант."):status==="error"?(tj?"Пайванд санҷида нашуд. Бори дигар кӯшиш кунед.":"Не удалось проверить адрес. Повторите попытку."):(status==="invalid"||invalid)&&data.slug?(tj?"Нишонии дурустро ворид кунед.":"Используйте латинские буквы, цифры и дефисы; от 3 до 50 символов."):""}</p>
 </>;
}
