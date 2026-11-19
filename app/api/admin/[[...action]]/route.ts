import {and,desc,eq,lt,or} from "drizzle-orm";
import {getDb} from "@/db";
import {orders} from "@/db/schema";
import {adminConfigured,checkAdmin,createAdminSession,endAdminSession,loginAllowed,passwordMatches,sameOrigin} from "@/app/admin-auth";
import {bucket,serialize} from "@/app/store";
import {templates,validSlug} from "@/app/model";

type Context={params:Promise<{action?:string[]}>};
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"};
const json=(value:unknown,status=200,extra:Record<string,string>={})=>Response.json(value,{status,headers:{...headers,...extra}});
const error=(message:string,status=400)=>json({error:message},status);
const unauthenticated=()=>error("Войдите в панель администратора.",401);
function adminOrder(row:typeof orders.$inferSelect){return {...serialize(row),revision:row.revision,updated:row.updated,price:templates.find(t=>t.id===row.payload.template)?.price??0};}

export async function GET(request:Request,{params}:Context){
 try{
  if(!adminConfigured())return error("В Cloudflare нужно задать секрет ADMIN_PASSWORD длиной минимум 16 символов.",503);
  if(!await checkAdmin(request))return unauthenticated();
  const [id,kind]=(await params).action??[];
  if(id==="session")return json({authenticated:true});
  const db=getDb();
  if(!id){
   const url=new URL(request.url),status=url.searchParams.get("status")??"pending";
   if(!["pending","published","returned","draft","all"].includes(status))return error("Неизвестный статус.");
   const cursor=url.searchParams.get("cursor");
   let cursorFilter;
   if(cursor){
    const match=/^(\d{10,16})\|([a-zA-Z0-9_-]{1,80})$/.exec(cursor);
    if(!match)return error("Некорректная страница.");
    const time=Number(match[1]);
    cursorFilter=or(lt(orders.updated,time),and(eq(orders.updated,time),lt(orders.id,match[2])));
   }
   const selected=await db.select().from(orders).where(and(eq(orders.demo,false),status==="all"?undefined:eq(orders.status,status as "pending"),cursorFilter)).orderBy(desc(orders.updated),desc(orders.id)).limit(51);
   const page=selected.slice(0,50),last=page.at(-1);
   return json({orders:page.map(adminOrder),nextCursor:selected.length>50&&last?last.updated+"|"+last.id:null});
  }
  const [row]=await db.select().from(orders).where(and(eq(orders.id,id),eq(orders.demo,false))).limit(1);
  if(!row)return error("Заказ не найден.",404);
  if(kind==="photo"||kind==="receipt"){
   const key=row[kind];if(!key)return error("Файл не найден.",404);
   const file=await bucket().get(key);if(!file)return error("Файл не найден.",404);
   const out=new Headers(headers);file.writeHttpMetadata(out);
   if(file.httpMetadata?.contentType==="application/pdf")out.set("Content-Disposition","attachment; filename=receipt.pdf");
   return new Response(file.body,{headers:out});
  }
  if(kind)return error("Страница не найдена.",404);
  return json({order:adminOrder(row)});
 }catch{ return error("Не удалось открыть панель. Проверьте создание таблиц admin_sessions и admin_login_limits.",503); }
}
export async function POST(request:Request,{params}:Context){
 try{
  if(!sameOrigin(request))return error("Откройте панель на сайте приглашений.",403);
  if(!adminConfigured())return error("В Cloudflare нужно задать секрет ADMIN_PASSWORD длиной минимум 16 символов.",503);
  const [action]=(await params).action??[];
  if(action==="login"){
   if(!await loginAllowed(request))return error("Слишком много попыток. Повторите через 15 минут.",429);
   if(!request.headers.get("content-type")?.includes("application/json"))return error("Нужен пароль.");
   const raw=await request.text();if(raw.length>2048)return error("Слишком длинный запрос.",413);
   let body:{password?:unknown};try{body=JSON.parse(raw);}catch{return error("Неверный запрос.");}
   if(!body||typeof body.password!=="string"||!await passwordMatches(body.password))return error("Неверный пароль.",401);
   return json({authenticated:true},200,{"Set-Cookie":await createAdminSession(request)});
  }
  if(action==="logout")return json({authenticated:false},200,{"Set-Cookie":await endAdminSession(request)});
  if(!await checkAdmin(request))return unauthenticated();
  if(action!=="review")return error("Страница не найдена.",404);
  const body=await request.json().catch(()=>null) as {id?:unknown;revision?:unknown;decision?:unknown;note?:unknown}|null;
  if(!body||typeof body.id!=="string"||typeof body.revision!=="string"||!["publish","return"].includes(String(body.decision)))return error("Проверьте действие и заказ.");
  const note=typeof body.note==="string"?body.note.trim():"";
  if(note.length>500)return error("Комментарий должен быть до 500 символов.");
  if(body.decision==="return"&&!note)return error("Укажите причину возврата.");
  const db=getDb();
  const [row]=await db.select().from(orders).where(and(eq(orders.id,body.id),eq(orders.demo,false))).limit(1);
  if(!row)return error("Заказ не найден.",404);
  if(row.status!=="pending"||row.revision!==body.revision)return error("Заказ уже изменился. Обновите список.",409);
  if(body.decision==="publish"&&(!row.receipt||!validSlug(row.slug)))return error("Для публикации нужны чек и корректный адрес приглашения.");
  const [updated]=await db.update(orders).set({status:body.decision==="publish"?"published":"returned",note:body.decision==="return"?note:null,updated:Date.now(),revision:crypto.randomUUID()}).where(and(eq(orders.id,row.id),eq(orders.status,"pending"),eq(orders.revision,body.revision))).returning();
  if(!updated)return error("Заказ уже изменился. Обновите список.",409);
  return json({order:adminOrder(updated),guestPath:updated.status==="published"?"/i/"+updated.slug:null});
 }catch{ return error("Операция не выполнена. Проверьте подключение базы и таблицы администратора.",503); }
}
