import {and,desc,eq,sql} from "drizzle-orm";
import {getDb} from "@/db";
import {orders,invitationGuests,invitationWishes,rsvpLimits} from "@/db/schema";
import {getChatGPTUser} from "@/app/chatgpt-auth";
import {sectionVisible,validSlug} from "@/app/model";
import {createEditToken} from "@/app/link-access";
type Context={params:Promise<{slug:string;action:string}>};
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers});
const error=(code:string,status=400)=>json({code},status);
const cleanName=(v:unknown):v is string=>typeof v==="string"&&v.trim().length>=2&&v.trim().length<=100&&!/[\u0000-\u001f\u007f]/.test(v);
async function digest(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,"0")).join("");}
async function owned(slug:string){const user=await getChatGPTUser();if(!user)return null;const [row]=await getDb().select().from(orders).where(and(eq(orders.slug,slug),eq(orders.owner,user.userId))).limit(1);return row;}
export async function GET(request:Request,{params}:Context){
 const {slug,action}=await params;if(!validSlug(slug))return error("missing",404);
 const row=await owned(slug);if(!row)return error("access",401);
 if(action==="guests")return json({rows:await getDb().select({id:invitationGuests.id,name:invitationGuests.name}).from(invitationGuests).where(eq(invitationGuests.orderId,row.id)).orderBy(invitationGuests.created,invitationGuests.id),published:row.status==="published"});
 if(action==="wishes"){
  const raw=new URL(request.url).searchParams.get("page")||"0";if(!/^\d{1,5}$/.test(raw))return error("invalid");const page=Number(raw);
  const rows=await getDb().select({id:invitationWishes.id,name:invitationWishes.name,message:invitationWishes.message,updated:invitationWishes.updated}).from(invitationWishes).where(eq(invitationWishes.orderId,row.id)).orderBy(desc(invitationWishes.updated),invitationWishes.id).limit(51).offset(page*50);
  return json({rows:rows.slice(0,50),hasMore:rows.length>50,page});
 }
 return error("missing",404);
}
export async function POST(request:Request,{params}:Context){
 const origin=request.headers.get("origin");if(request.headers.get("sec-fetch-site")==="cross-site"||(origin&&origin!==new URL(request.url).origin))return error("access",403);
 if(!request.headers.get("content-type")?.startsWith("application/json"))return error("invalid",415);
 const raw=await request.text();if(raw.length>40000)return error("invalid",413);
 let body:Record<string,unknown>;try{body=JSON.parse(raw);if(!body||typeof body!=="object"||Array.isArray(body))return error("invalid");}catch{return error("invalid");}
 const {slug,action}=await params;if(!validSlug(slug))return error("missing",404);const db=getDb();
 if(action==="guests"){
  const row=await owned(slug);if(!row)return error("access",401);
  if(body.remove!==undefined){if(typeof body.remove!=="string"||!/^[a-f0-9]{64}$/.test(body.remove))return error("invalid");await db.delete(invitationGuests).where(and(eq(invitationGuests.id,body.remove),eq(invitationGuests.orderId,row.id)));return json({ok:true});}
  if(!Array.isArray(body.names)||!body.names.length||body.names.length>300||!body.names.every(cleanName))return error("invalid");
  const names=[...new Set((body.names as string[]).map(n=>n.trim()))];
  const old=await db.select({name:invitationGuests.name}).from(invitationGuests).where(eq(invitationGuests.orderId,row.id));
  const added=names.filter(n=>!old.some(g=>g.name===n));if(old.length+added.length>300)return error("limit");
  // Atomic bounded insert; unique names make repeat imports idempotent.
  const chunks=[];for(let i=0;i<added.length;i+=20)chunks.push(db.insert(invitationGuests).values(added.slice(i,i+20).map(name=>({id:createEditToken(),orderId:row.id,name,created:Date.now()}))).onConflictDoNothing());
  if(chunks.length)await db.batch([chunks[0],...chunks.slice(1)]);
  return json({ok:true});
 }
 if(action!=="wishes")return error("missing",404);
 const [row]=await db.select().from(orders).where(and(eq(orders.slug,slug),eq(orders.status,"published"))).limit(1);
 if(!row||!sectionVisible(row.payload,"wishes"))return error("missing",404);
 let {name}=body;const {token,message,guestId}=body;
 if(typeof token!=="string"||!/^[a-f0-9]{64}$/.test(token)||typeof message!=="string"||message.trim().length<3||message.length>1000||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message))return error("invalid");
 let identity=token;
 if(guestId!==undefined){if(typeof guestId!=="string"||!/^[a-f0-9]{64}$/.test(guestId))return error("invalid");const [guest]=await db.select().from(invitationGuests).where(and(eq(invitationGuests.id,guestId),eq(invitationGuests.orderId,row.id))).limit(1);if(!guest)return error("missing",404);name=guest.name;identity="guest:"+guest.id;}
 if(!cleanName(name))return error("invalid");
 const now=Date.now(),key=await digest("wishes:"+row.id+":"+(request.headers.get("cf-connecting-ip")||"local"));
 const [rate]=await db.insert(rsvpLimits).values({key,attempts:1,expires:now+900000}).onConflictDoUpdate({target:rsvpLimits.key,set:{attempts:sql`case when ${rsvpLimits.expires}<=${now} then 1 else ${rsvpLimits.attempts}+1 end`,expires:sql`case when ${rsvpLimits.expires}<=${now} then ${now+900000} else ${rsvpLimits.expires} end`}}).returning({attempts:rsvpLimits.attempts});
 if(rate.attempts>5)return json({code:"rate"},429);
 const tokenHash=await digest(identity);
 await db.insert(invitationWishes).values({id:crypto.randomUUID(),orderId:row.id,tokenHash,name:name.trim(),message:message.trim(),created:now,updated:now}).onConflictDoUpdate({target:[invitationWishes.orderId,invitationWishes.tokenHash],set:{name:name.trim(),message:message.trim(),updated:now}});
 return json({ok:true});
}
