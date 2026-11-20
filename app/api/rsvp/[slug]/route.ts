import {and,desc,eq,sql} from "drizzle-orm";
import {getDb} from "@/db";
import {orders,invitationGuests,invitationRsvps,rsvpLimits} from "@/db/schema";
import {getChatGPTUser} from "@/app/chatgpt-auth";
import {sectionVisible,validSlug} from "@/app/model";

type Context={params:Promise<{slug:string}>};
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers});
const error=(code:string,status:number)=>json({code},status);
async function hash(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,"0")).join("");}

export async function GET(request:Request,{params}:Context){
 const user=await getChatGPTUser();if(!user)return error("access",401);
 const {slug}=await params;if(!validSlug(slug))return error("missing",404);
 const db=getDb();
 const [order]=await db.select({id:orders.id}).from(orders).where(and(eq(orders.slug,slug),eq(orders.owner,user.userId))).limit(1);
 if(!order)return error("missing",404);
 const rawPage=new URL(request.url).searchParams.get("page")??"0";
 if(!/^\d{1,6}$/.test(rawPage))return error("invalid",400);
 const page=Number(rawPage),size=100;
 const filter=eq(invitationRsvps.orderId,order.id);
 const [summary]=await db.select({responses:sql<number>`count(*)`,coming:sql<number>`coalesce(sum(case when ${invitationRsvps.attending}=1 then 1 else 0 end),0)`,declined:sql<number>`coalesce(sum(case when ${invitationRsvps.attending}=0 then 1 else 0 end),0)`,guests:sql<number>`coalesce(sum(${invitationRsvps.guests}),0)`}).from(invitationRsvps).where(filter);
 const rows=await db.select({id:invitationRsvps.id,name:invitationRsvps.name,attending:invitationRsvps.attending,guests:invitationRsvps.guests,updated:invitationRsvps.updated}).from(invitationRsvps).where(filter).orderBy(desc(invitationRsvps.updated),desc(invitationRsvps.id)).limit(size).offset(page*size);
 return json({summary,rows,page,hasMore:(page+1)*size<summary.responses});
}

export async function POST(request:Request,{params}:Context){
 const origin=request.headers.get("origin");
 if(request.headers.get("sec-fetch-site")==="cross-site"||(origin&&origin!==new URL(request.url).origin))return error("access",403);
 if(!request.headers.get("content-type")?.startsWith("application/json"))return error("invalid",415);
 if(Number(request.headers.get("content-length"))>8192)return error("invalid",413);
 const raw=await request.text();if(raw.length>8192)return error("invalid",413);
 let body:Record<string,unknown>;
 try{body=JSON.parse(raw);if(!body||typeof body!=="object"||Array.isArray(body))return error("invalid",400);}catch{return error("invalid",400);}
 const {slug}=await params;if(!validSlug(slug))return error("missing",404);
 const {token,attending,guests,guestId}=body;let {name}=body;
 if(typeof token!=="string"||!/^[a-f0-9]{64}$/.test(token)||typeof name!=="string"||name.trim().length<2||name.trim().length>100||/[\u0000-\u001f\u007f]/.test(name)||typeof attending!=="boolean"||!Number.isInteger(guests)||typeof guests!=="number"||(attending?(guests<1||guests>10):guests!==0))return error("invalid",400);
 const db=getDb();
 const [order]=await db.select({id:orders.id,payload:orders.payload}).from(orders).where(and(eq(orders.slug,slug),eq(orders.status,"published"))).limit(1);
 if(!order||!sectionVisible(order.payload,"rsvp"))return error("missing",404);
 let identity=token;
 if(guestId!==undefined){if(typeof guestId!=="string"||!/^[a-f0-9]{64}$/.test(guestId))return error("invalid",400);const [guest]=await db.select().from(invitationGuests).where(and(eq(invitationGuests.id,guestId),eq(invitationGuests.orderId,order.id))).limit(1);if(!guest)return error("missing",404);name=guest.name;identity="guest:"+guest.id;}
 const now=Date.now();
 const key=await hash("rsvp:"+order.id+":"+(request.headers.get("cf-connecting-ip")??"local"));
 const [rate]=await db.insert(rsvpLimits).values({key,attempts:1,expires:now+900000}).onConflictDoUpdate({target:rsvpLimits.key,set:{attempts:sql`case when ${rsvpLimits.expires} <= ${now} then 1 else ${rsvpLimits.attempts}+1 end`,expires:sql`case when ${rsvpLimits.expires} <= ${now} then ${now+900000} else ${rsvpLimits.expires} end`}}).returning({attempts:rsvpLimits.attempts});
 if(rate.attempts>10)return new Response(JSON.stringify({code:"rate"}),{status:429,headers:{...headers,"Content-Type":"application/json","Retry-After":"900"}});
 if(typeof name!=="string")return error("invalid",400);
 const tokenHash=await hash(identity);
 const [row]=await db.insert(invitationRsvps).values({id:crypto.randomUUID(),orderId:order.id,tokenHash,name:name.trim(),attending,guests,created:now,updated:now}).onConflictDoUpdate({target:[invitationRsvps.orderId,invitationRsvps.tokenHash],set:{name:name.trim(),attending,guests,updated:now}}).returning({name:invitationRsvps.name,attending:invitationRsvps.attending,guests:invitationRsvps.guests});
 return json({response:row});
}
