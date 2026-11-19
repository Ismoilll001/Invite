import {and,desc,eq,ne} from "drizzle-orm";
import {getDb} from "@/db";
import {orders} from "@/db/schema";
import {getChatGPTUser} from "@/app/chatgpt-auth";
import {invitationTextOverrides,optionalSections,palettesFor,templates,validSlug,type Invite,type Status} from "@/app/model";
import {bucket,config,published,serialize} from "@/app/store";
type Context={params:Promise<{action?:string[]}>};
const limit=5*1024*1024;
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers});
const err=(error:string,status=400)=>json({error},status);
const missing=()=>err("Фармоиш ё файл ёфт нашуд.",404);
const denied=()=>err("Барои идома ба ҳисоб ворид шавед.",401);
const maxima={template:10,first:45,second:45,date:10,time:5,venue:100,address:160,message:450,locale:2,slug:50,eventType:10,morningDate:10,morningTime:5,morningVenue:100,morningAddress:160,program:1000,guests:5000};

function parse(raw:unknown,submit:boolean):Invite|null{
 if(!raw||typeof raw!=="object")return null;
 const values=raw as Record<string,unknown>;
 for(const [key,max] of Object.entries(maxima)){
  const value=values[key];
  if(typeof value!=="string"||value.length>max)return null;
 }
 const data=Object.fromEntries(Object.keys(maxima).map(key=>[key,(values[key] as string).trim()])) as Invite;
 if(!data.first||!data.second||((submit||data.slug)&&!validSlug(data.slug))||!templates.some(t=>t.id===data.template)||!["ru","tj","uz"].includes(data.locale)||!["wedding","morning","both"].includes(data.eventType))return null;
 const needsWedding=data.eventType!=="morning",needsMorning=data.eventType!=="wedding";
 const validDate=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(+new Date(value+"T00:00:00Z"));
 const validTime=(value:string)=>/^([01]\d|2[0-3]):[0-5]\d$/.test(value);
 if(needsWedding&&(!validDate(data.date)||!validTime(data.time)||(submit&&!data.venue)))return null;
 if(needsMorning&&(!validDate(data.morningDate)||!validTime(data.morningTime)||(submit&&!data.morningVenue)))return null;
 if(values.palette!==undefined){
  const palette=palettesFor(data.template).find(item=>item.id===values.palette);
  if(!palette)return null;
  data.palette=palette.id;
 }
 if(values.hiddenSections!==undefined){
  if(typeof values.hiddenSections!=="string"||values.hiddenSections.length>70)return null;
  const hidden=values.hiddenSections.split(",");
  data.hiddenSections=optionalSections.filter(section=>hidden.includes(section)).join(",");
 }
 if(values.textOverrides!==undefined){
  if(typeof values.textOverrides!=="string"||values.textOverrides.length>40000)return null;
  data.textOverrides=JSON.stringify(invitationTextOverrides(values.textOverrides));
 }
 return data;
}
async function mime(file:File,pdf:boolean){
 if(file.size>limit||file.size<8)return null;
 const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
 const ascii=new TextDecoder().decode(bytes);
 if([137,80,78,71,13,10,26,10].every((x,i)=>x===bytes[i]))return "image/png";
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return "image/jpeg";
 if(ascii.startsWith("RIFF")&&ascii.slice(8,12)==="WEBP")return "image/webp";
 if(pdf&&ascii.startsWith("%PDF-"))return "application/pdf";
 return null;
}
async function sendFile(key:string|null){
 if(!key)return missing();
 const file=await bucket().get(key);
 if(!file)return missing();
 const out=new Headers(headers);
 file.writeHttpMetadata(out);
 if(out.get("Content-Type")==="application/pdf")out.set("Content-Disposition","attachment; filename=receipt.pdf");
 return new Response(file.body,{headers:out});
}
export async function GET(request:Request,{params}:Context){
 const [id,kind]=(await params).action??[];
 if(id==="guest-photo"&&kind){const row=await published(kind);return row?sendFile(row.photo):missing();}
 const user=await getChatGPTUser();
 if(!user)return denied();
 const cfg=config();
 const admin=user.email.toLowerCase()===cfg.email;
 const db=getDb();
 if(id==="availability"){
  const search=new URL(request.url).searchParams;
  const slug=search.get("slug")||"";
  if(!validSlug(slug))return err("Номи пайвандро бо ҳарфҳои лотинӣ, рақамҳо ё нимтире ворид кунед.");
  const [row]=await db.select({id:orders.id,owner:orders.owner}).from(orders).where(eq(orders.slug,slug)).limit(1);
  return json({available:!row||(row.owner===user.userId&&row.id===search.get("id"))});
 }
 if(!id||id==="review"){
  const owned=eq(orders.owner,user.userId);
  const submitted=ne(orders.status,"draft");
  const filter=id!=="review"?owned:admin&&cfg.live?and(submitted,eq(orders.demo,false)):and(owned,submitted,eq(orders.demo,true));
  const rows=await db.select().from(orders).where(filter).orderBy(desc(orders.updated)).limit(100);
  return json({orders:rows.map(serialize),live:cfg.live,price:cfg.price,instructions:cfg.instructions,admin});
 }
 if(kind==="photo"||kind==="receipt"){
  const [row]=await db.select().from(orders).where(eq(orders.id,id)).limit(1);
  if(!row||(row.owner!==user.userId&&!(admin&&!row.demo&&row.status!=="draft")))return missing();
  return sendFile(row[kind]);
 }
 return missing();
}
export async function POST(request:Request,{params}:Context){
 if(request.headers.get("sec-fetch-site")==="cross-site")return err("Варақаро дар сомонаи даъватномаҳо кушоед.",403);
 const user=await getChatGPTUser();
 if(!user)return denied();
 const [action]=(await params).action??[];
 const cfg=config();
 const db=getDb();
 if(action==="review"){
  const body=await request.json().catch(()=>null) as {id?:unknown;decision?:unknown;note?:unknown}|null;
  if(!body||typeof body.id!=="string"||(body.decision!=="publish"&&body.decision!=="return"))return err("Амали интихобшударо барои фармоиш санҷед.");
  const [row]=await db.select().from(orders).where(eq(orders.id,body.id)).limit(1);
  if(!row||(row.demo?row.owner!==user.userId:!cfg.live||user.email.toLowerCase()!==cfg.email))return missing();
  const note=typeof body.note==="string"?body.note.trim().slice(0,500):"";
  if(body.decision==="return"&&!note)return err("Сабаби баргардондани фармоишро нависед.");
  const result=await db.update(orders).set({status:body.decision==="publish"?"published":"returned",note:note||null,updated:Date.now(),revision:crypto.randomUUID()}).where(and(eq(orders.id,row.id),eq(orders.status,"pending"),eq(orders.revision,row.revision))).returning();
  return result.length?json({order:serialize(result[0])}):err("Фармоиш тағйир ёфт. Рӯйхатро нав кунед.",409);
 }
 if(action)return missing();
 if(Number(request.headers.get("content-length"))>2*limit+65536)return err("Ҳаҷми ҳар файл бояд то 5 МБ бошад.",413);
 const form=await request.formData().catch(()=>null);
 if(!form)return err("Варақаи фармоишро санҷед.");
 const submit=form.get("submit")==="yes";
 let data:Invite|null=null;
 try{data=parse(JSON.parse(String(form.get("data"))),submit);}catch{}
 if(!data)return err("Номҳо, сана, соат ва маълумоти даъватномаро санҷед.");
 const id=form.get("id");
 const [previous]=typeof id==="string"&&id?await db.select().from(orders).where(and(eq(orders.id,id),eq(orders.owner,user.userId))).limit(1):[];
 if(id&&!previous)return missing();
 if(previous&&(previous.demo!==!cfg.live||!["draft","returned"].includes(previous.status)))return err("Ҳоло ин фармоишро тағйир дода наметавонед.",409);
 const [taken]=data.slug?await db.select({id:orders.id}).from(orders).where(eq(orders.slug,data.slug)).limit(1):[];
 if(taken&&taken.id!==previous?.id)return err("Ин нишонӣ аллакай истифода мешавад.",409);
 const files=[];
 for(const type of ["photo","receipt"] as const){
  const file=form.get(type);
  if(!(file instanceof File)||!file.size)continue;
  const contentType=await mime(file,type==="receipt");
  if(!contentType)return err(type==="photo"?"Аксро дар шакли JPG, PNG ё WebP то 5 МБ бор кунед.":"Расидро дар шакли JPG, PNG, WebP ё PDF то 5 МБ бор кунед.");
  files.push({file,type,contentType});
 }
 if(submit&&!files.some(f=>f.type==="receipt"))return err("Расиди пардохтро замима кунед.");
 const orderId=previous?.id??crypto.randomUUID();
 const replacement:{photo?:string;receipt?:string}={};
 try{
  for(const {file,type,contentType} of files){
   const key=`orders/${orderId}/${type}/${crypto.randomUUID()}`;
   await bucket().put(key,await file.arrayBuffer(),{httpMetadata:{contentType}});
   replacement[type]=key;
  }
  const values={slug:data.slug||`_draft_${orderId}`,payload:data,status:(submit?"pending":previous?.status??"draft") as Status,
   revision:crypto.randomUUID(),updated:Date.now(),note:submit?null:previous?.note??null,
   photo:replacement.photo??previous?.photo??null,receipt:replacement.receipt??previous?.receipt??null};
  const result=previous?await db.update(orders).set(values).where(and(eq(orders.id,orderId),eq(orders.revision,previous.revision))).returning()
   :await db.insert(orders).values({...values,id:orderId,owner:user.userId,demo:!cfg.live}).returning();
  if(!result.length){
   await Promise.allSettled(Object.values(replacement).map(key=>bucket().delete(key)));
   return err("Фармоиш тағйир ёфт. Саҳифаро нав кунед.",409);
  }
  for(const {type} of files){const old=previous?.[type];if(old)await bucket().delete(old).catch(()=>{});}
  return json({order:serialize(result[0])});
 }catch(failure){
  await Promise.allSettled(Object.values(replacement).map(key=>bucket().delete(key)));
  if(String(failure).includes("UNIQUE constraint"))return err("Ин нишонӣ аллакай истифода мешавад.",409);
  console.error("Failed to save invitation",failure);
  return err("Захиракунӣ муваққатан дастнорас аст.",500);
 }
}
