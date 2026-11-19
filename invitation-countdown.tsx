"use client";

import {useEffect,useState,type ReactNode} from "react";

export function InvitationCountdown({startsAt,locale,title,unitLabels}:{startsAt:number;locale:string;title?:ReactNode;unitLabels?:ReactNode[]}){
 const [seconds,setSeconds]=useState<number|null>(null);
 useEffect(()=>{
  const tick=()=>setSeconds(Math.max(0,Math.floor((startsAt-Date.now())/1000)));
  tick();
  const timer=setInterval(tick,1000);
  return ()=>clearInterval(timer);
 },[startsAt]);

 if(seconds===0)return null;
 const parts=seconds===null?["–","–","–","–"]:[
  Math.floor(seconds/86400),Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60,
 ];
 const labels=locale==="tj"?["рӯз","соат","дақиқа","сония"]:locale==="uz"?["кун","соат","дақиқа","сония"]:["дни","часы","минуты","секунды"];
 return <section className="invitation-section countdown-section">
  <h3>{title??(locale==="tj"?"То рӯзи тӯй":locale==="uz"?"Тўйгача":"До свадьбы")}</h3>
  <dl className="invitation-countdown" role="timer">
   {labels.map((label,index)=><div key={label}><dt>{unitLabels?.[index]??label}</dt><dd>{String(parts[index]).padStart(2,"0")}</dd></div>)}
  </dl>
 </section>;
}
