"use client";

import {useEffect,useRef,type CSSProperties} from "react";

const particles=Array.from({length:120},(_,i)=>({
 left:`${(i*37+7)%100}%`,top:i<64?`${(i*23+11)%100}%`:"-16px",
 "--dot-size":`${2+i%3}px`,"--dot-duration":`${i<64?14+i%13:20+i%21}s`,"--dot-delay":`${-(i*1.7)}s`,
 "--dot-x":`${i%2?22:-28}px`,"--dot-y":`${-(24+i%5*9)}px`,
} as CSSProperties));

function Butterfly(){
 return <svg viewBox="0 0 100 90" fill="currentColor" aria-hidden="true">
  <g className="butterfly-wing butterfly-wing-left"><path d="M49 43C40 19 20 10 4 4C11 28 20 47 47 47C26 48 16 59 22 70C30 83 45 68 49 48Z"/></g>
  <g className="butterfly-wing butterfly-wing-right"><path d="M51 43C60 19 80 10 96 4C89 28 80 47 53 47C74 48 84 59 78 70C70 83 55 68 51 48Z"/></g>
  <ellipse cx="50" cy="51" rx="2.3" ry="23"/><circle cx="50" cy="28" r="3"/>
  <path d="M49 27Q43 10 36 9M51 27Q57 10 64 9" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
 </svg>;
}

export function SiteAtmosphere({showButterflies=true}:{showButterflies?:boolean}){
 const butterflies=useRef<(HTMLDivElement|null)[]>([]);
 useEffect(()=>{
  if(!showButterflies)return;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  let frame=0,previous=0,active=!reduced.matches;
  const target={x:innerWidth*.78,y:innerHeight*.32,last:0};
  const birds=Array.from({length:3},(_,i)=>({x:innerWidth*(.72+i*.06),y:innerHeight*(.35+i*.12),angle:0}));
  function move(event:PointerEvent){target.x=event.clientX;target.y=event.clientY;target.last=performance.now();}
  function animate(now:number){
   if(!active)return;
   const delta=Math.min((now-(previous||now))/1000,.05);previous=now;
   const following=target.last>0&&now-target.last<20000;
   birds.forEach((bird,i)=>{
    const phase=now/3200+i*2.1;
    const centerX=following?target.x:innerWidth*(.5+.32*Math.sin(now/26000+i*.35));
    const centerY=following?target.y:innerHeight*(.47+.29*Math.cos(now/32000+i*.45));
    const x=Math.max(28,Math.min(innerWidth-28,centerX+Math.cos(phase)*(55+i*22)));
    const y=Math.max(90,Math.min(innerHeight-30,centerY+Math.sin(phase*.8)*(35+i*16)+38));
    const dx=x-bird.x,dy=y-bird.y;
    const easing=1-Math.exp(-delta*.5*(1.35-i*.28));
    bird.x+=dx*easing;bird.y+=dy*easing;
    const tilt=Math.max(-24,Math.min(24,dx*.18));bird.angle+=(tilt-bird.angle)*easing;
    const element=butterflies.current[i];
    if(element)element.style.transform=`translate3d(${bird.x}px,${bird.y}px,0) translate(-50%,-50%) rotate(${bird.angle}deg)`;
   });
   frame=requestAnimationFrame(animate);
  }
  function visibility(){cancelAnimationFrame(frame);previous=0;if(!document.hidden&&active)frame=requestAnimationFrame(animate);}
  function preference(){active=!reduced.matches;cancelAnimationFrame(frame);previous=0;if(active&&!document.hidden)frame=requestAnimationFrame(animate);}
  window.addEventListener("pointermove",move,{passive:true});
  window.addEventListener("pointerdown",move,{passive:true});
  document.addEventListener("visibilitychange",visibility);
  reduced.addEventListener("change",preference);
  if(active)frame=requestAnimationFrame(animate);
  return()=>{active=false;cancelAnimationFrame(frame);window.removeEventListener("pointermove",move);window.removeEventListener("pointerdown",move);document.removeEventListener("visibilitychange",visibility);reduced.removeEventListener("change",preference);};
 },[showButterflies]);
 return <div className="site-atmosphere" aria-hidden="true">
  <div className="site-particles">{particles.map((style,i)=><i key={i} className={i<64?"particle-floating":"particle-falling"} style={style}/>)}</div>
  {showButterflies&&<div className="site-butterflies">{[0,1,2].map(i=><div key={i} ref={element=>{butterflies.current[i]=element;}} className={`site-butterfly butterfly-${i+1}`}><Butterfly/></div>)}</div>}
 </div>;
}
