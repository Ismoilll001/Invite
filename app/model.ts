export const allTemplates = [
 {id:"rose", nameTj:"Гули садбарг",nameRu:"Бархатная роза",event:"wedding",tier:"standard",price:100,detailTj:"Барои тӯйи арӯсӣ",detailRu:"Для свадебного торжества",description:"Рангҳои гарми гулобӣ, ҳошияи дуқабата ва номҳои калон."},
 {id:"olive", nameTj:"Субҳи сабз",nameRu:"Оливковое утро",event:"morning",tier:"standard",price:100,detailTj:"Барои оши наҳор",detailRu:"Для оши наҳор",description:"Рангҳои ороми зайтунӣ ва фазои сабуки саҳарӣ."},
 {id:"gold", nameTj:"Номаи заррин",nameRu:"Золотое письмо",event:"both",tier:"premium",price:150,detailTj:"Тӯй ва оши наҳор",detailRu:"Свадьба и оши наҳор",description:"Заминаи айвори, ҷузъиёти заррин ва ду барномаи ҷашн."},
 {id:"raabta",nameTj:"Ҳилоли заррин",nameRu:"Золотой полумесяц",event:"wedding",tier:"premium",price:150,detailTj:"Даъватномаи мусалмонӣ",detailRu:"Мусульманское приглашение",description:"Гунбазҳои кабуд, нақшҳои заррин ва чароғҳои фурӯзон."},
 {id:"royal",nameTj:"Шоми заррин",nameRu:"Золотой вечер",event:"wedding",tier:"premium",price:150,detailTj:"Бордо ва тилло",detailRu:"Бордо и золото",description:"Бордо, ҳошияҳои заррин ва фазои шоми идона."},
] as const;
// Retired designs stay readable for existing orders, but are not offered in the catalog.
export const templates=allTemplates.filter(template=>!["olive","gold"].includes(template.id));
export const sample={template:"rose",first:"Фаридун",second:"Сабрина",date:"2027-06-19",time:"18:00",venue:"Тарабхонаи «Гулистон»",address:"Хуҷанд, кӯчаи Камоли Хуҷандӣ, 28",message:"",locale:"tj",slug:"",eventType:"wedding",morningDate:"2027-06-19",morningTime:"08:00",morningVenue:"Ҳавлии домод",morningAddress:"Хуҷанд, Тоҷикистон",program:"18:00 — Пешвози меҳмонон\n19:00 — Оғози базм",guests:""};
export const empty={...sample,first:"",second:"",date:"",time:"",venue:"",address:"",slug:"",morningDate:"",morningTime:"",morningVenue:"",morningAddress:"",program:"",guests:""};
export const optionalSections = ["countdown","welcome","photo","story","details","program","closing","rsvp","wishes","gifts","music"] as const;
export type Invite=typeof sample & {palette?: string; hiddenSections?: string; textOverrides?: string; giftDetails?: string};
export function invitationTextOverrides(value?: string): Record<string,string> {
 if(!value)return {};
 try {
  const parsed:unknown=JSON.parse(value);
  if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))return {};
  return Object.fromEntries(Object.entries(parsed).filter(([key,text])=>
   /^[a-z][a-zA-Z0-9.]{0,35}$/.test(key)&&typeof text==="string"&&text.length<=450
  ).slice(0,80));
 } catch {return {};}
}

export type SiteLanguage="tj"|"ru";
const demoDetails={
 raabta:{first:"Муҳаммадҷон",second:"Оминахон",date:"2027-08-21",venue:"Тарабхонаи «Ситора»",address:"Исфара, кӯчаи Рӯдакӣ, 16",morningAddress:"Исфара, Тоҷикистон"},
 royal:{first:"Шаҳриёр",second:"Нигина",date:"2027-10-09",venue:"Тарабхонаи «Баҳористон»",address:"Конибодом, кӯчаи Исмоили Сомонӣ, 42",morningAddress:"Конибодом, Тоҷикистон"},
} as const;

export function demoInvitation(template:(typeof templates)[number],locale:SiteLanguage):Invite{
 const details=template.id==="raabta"||template.id==="royal"?demoDetails[template.id]:sample;
 return {...sample,...details,template:template.id,locale,eventType:template.event,morningDate:details.date};
}

export type EventFilter="all"|"wedding"|"morning"|"both";
export function templateName(template:(typeof templates)[number],language:SiteLanguage){return language==="tj"?template.nameTj:template.nameRu;}
export function templateDetail(template:(typeof templates)[number],language:SiteLanguage){return language==="tj"?template.detailTj:template.detailRu;}

export const palettes = [
 {id:"ivory", label:"Сафеди оҷӣ", background:"#f8f4eb", ink:"#30271d", accent:"#967b54"},
 {id:"blue", label:"Кабуди хира", background:"#edf2f6", ink:"#243749", accent:"#657d94"},
 {id:"blush", label:"Гулобии нозук", background:"#f7ebed", ink:"#502c39", accent:"#9c5b70"},
 {id:"sage", label:"Сабзи зайтунӣ", background:"#edf0e5", ink:"#35442c", accent:"#687a56"},
 {id:"champagne", label:"Кремии тиллоӣ", background:"#f5eddf", ink:"#503923", accent:"#a17b4a"},
] as const;

export function palettesFor(template:string){
 if(template==="royal")return [{id:"royal",label:"Бордо ва тилло",background:"#3b0d1c",ink:"#fff5e3",accent:"#d9b976"}];
 if(template==="raabta")return [{id:"raabta",label:"Тиллои шаб",background:"#faf7f0",ink:"#1a2340",accent:"#ad7d1f"}];
 const defaultId=template==="rose"?"blush":template==="olive"?"sage":"ivory";
 return [
  palettes.find(item=>item.id===defaultId)!,
  ...palettes.filter(item=>item.id!==defaultId&&["ivory","blue","champagne"].includes(item.id)).slice(0,2),
 ];
}

export function paletteFor(template:string,palette?:string){
 const options=palettesFor(template);
 return options.find(item=>item.id===palette)??options[0];
}

export const statuses={draft:"Пешнавис",pending:"Пардохт дар ҳоли санҷиш",returned:"Расиди нав лозим аст",published:"Нашр шуд"};
export type Status=keyof typeof statuses;
export type Order={id:string; data:Invite; status:Status; note:string|null; photo:boolean; receipt:boolean; demo:boolean};
const reserved=new Set(["www","invite","admin","mail","api","cdn","app","ftp","demo","support","shop"]);
export function validSlug(slug:string){return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)&&slug.length>=3&&slug.length<=50&&!reserved.has(slug);}

export type GiftDetails={groom:{name:string;bank:string;account:string;url:string};bride:{name:string;bank:string;account:string;url:string}};
export function giftDetails(value?:string):GiftDetails {
 const blank={name:"",bank:"",account:"",url:""};
 try{const raw=JSON.parse(value||"{}");const read=(item:unknown)=>{const v=item&&typeof item==="object"?item as Record<string,unknown>:{};return Object.fromEntries(Object.keys(blank).map(k=>[k,typeof v[k]==="string"?v[k].slice(0,k==="url"?500:120):""])) as typeof blank;};return {groom:read(raw.groom),bride:read(raw.bride)};}catch{return {groom:{...blank},bride:{...blank}};}
}
export function sectionVisible(data:Invite,id:string){return !(data.hiddenSections||"").split(",").includes(id);}
