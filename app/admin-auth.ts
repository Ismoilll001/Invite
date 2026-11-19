import { env } from "cloudflare:workers";
import { createEditToken } from "./link-access";

const cookieName="khushbakht_admin";
const lifetime=8*60*60;
const encoder=new TextEncoder();
const hex=(bytes:ArrayBuffer)=>Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,"0")).join("");
const digest=async(value:string)=>hex(await crypto.subtle.digest("SHA-256",encoder.encode(value)));
function secret(){const value=(env as typeof env&{ADMIN_PASSWORD?:string}).ADMIN_PASSWORD;return value&&value.length>=16?value:null;}
function database(){if(!env.DB)throw new Error("Admin database unavailable");return env.DB;}
async function signingKey(value:string){return crypto.subtle.importKey("raw",encoder.encode("khushbakht-admin-v1\0"+value),{name:"HMAC",hash:"SHA-256"},false,["sign","verify"]);}
function cookieToken(request:Request){
 const candidates=(request.headers.get("cookie")??"").split(";").map(v=>v.trim()).filter(v=>v.startsWith(cookieName+"="));
 if(candidates.length!==1)return null;
 const token=candidates[0].slice(cookieName.length+1);
 return /^[a-f0-9]{64}$/.test(token)?token:null;
}
function sessionCookie(request:Request,token:string,age:number){
 const secure=new URL(request.url).protocol==="https:"?"; Secure":"";
 return `${cookieName}=${token}; Path=/api/admin; Max-Age=${age}; HttpOnly; SameSite=Strict${secure}`;
}
export function adminConfigured(){return !!secret();}
export function sameOrigin(request:Request){
 return request.headers.get("origin")===new URL(request.url).origin&&request.headers.get("sec-fetch-site")!=="cross-site";
}
export async function checkAdmin(request:Request){
 const value=secret(),token=cookieToken(request);if(!value||!token)return false;
 const tokenHash=await digest(token);
 const row=await database().prepare("SELECT proof, expires FROM admin_sessions WHERE token_hash = ? AND expires > ?").bind(tokenHash,Date.now()).first<{proof:string;expires:number}>();
 if(!row||!Number.isFinite(row.expires)||row.expires>Date.now()+lifetime*1000+60_000||!/^[a-f0-9]{64}$/.test(row.proof))return false;
 const signature=Uint8Array.from(row.proof.match(/../g)!,pair=>parseInt(pair,16));
 return crypto.subtle.verify("HMAC",await signingKey(value),signature,encoder.encode(tokenHash));
}
async function takeAttempt(key:string,maximum:number){
 const now=Date.now();
 const row=await database().prepare(`INSERT INTO admin_login_limits (key, attempts, expires) VALUES (?, 1, ?)
  ON CONFLICT(key) DO UPDATE SET attempts = CASE WHEN expires <= ? THEN 1 ELSE attempts + 1 END,
   expires = CASE WHEN expires <= ? THEN excluded.expires ELSE expires END
  WHERE expires <= ? OR attempts < ? RETURNING attempts`).bind(key,now+15*60_000,now,now,now,maximum).first();
 return !!row;
}
export async function loginAllowed(request:Request){
 const address=request.headers.get("cf-connecting-ip")??"local";
 if(!await takeAttempt("ip:"+await digest(address),5))return false;
 return takeAttempt("global",50);
}
export async function passwordMatches(candidate:string){
 const value=secret();if(!value||candidate.length>512)return false;
 const [left,right]=await Promise.all([digest(candidate),digest(value)]);
 let different=0;for(let index=0;index<64;index++)different|=left.charCodeAt(index)^right.charCodeAt(index);
 return different===0;
}
export async function createAdminSession(request:Request){
 const value=secret();if(!value)throw new Error("Admin password unavailable");
 const token=createEditToken(),tokenHash=await digest(token);
 const proof=hex(await crypto.subtle.sign("HMAC",await signingKey(value),encoder.encode(tokenHash)));
 await database().prepare("INSERT INTO admin_sessions (token_hash, proof, expires) VALUES (?, ?, ?)").bind(tokenHash,proof,Date.now()+lifetime*1000).run();
 // Only expired records are removed. Password rotation invalidates prior proofs.
 await database().prepare("DELETE FROM admin_sessions WHERE expires <= ?").bind(Date.now()).run();
 return sessionCookie(request,token,lifetime);
}
export async function endAdminSession(request:Request){
 const token=cookieToken(request);
 if(token)await database().prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(await digest(token)).run();
 return sessionCookie(request,"",0);
}
