"use client";

import {useEffect,useRef} from "react";

export function InvitationReveal({sectionState}:{sectionState:string}){
 const marker=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const page=marker.current?.parentElement;
  if(!page||typeof IntersectionObserver==="undefined"||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const waiting=new Set<Element>();
  const inset=Math.min(76,Math.round(window.innerHeight*.12));
  const observer=new IntersectionObserver(entries=>{
   for(const {target,intersectionRatio} of entries){
    if(intersectionRatio<.35)continue;
    observer.unobserve(target);
    waiting.delete(target);
    target.removeAttribute("data-reveal-waiting");
    if(typeof target.animate!=="function"||target.contains(document.activeElement))continue;
    target.animate(
     [{opacity:.25,transform:"translateY(18px)"},{opacity:1,transform:"translateY(0)"}],
     {duration:1100,easing:"cubic-bezier(.25,.46,.45,.94)"},
    );
   }
  },{rootMargin:`0px 0px -${inset}px 0px`,threshold:.35});
  page.querySelectorAll(".invitation-section :is(h3,h4,p,small,strong,time,dt,dd), .invitation-closing > span").forEach(target=>{
   if(target.getBoundingClientRect().top<window.innerHeight||typeof target.animate!=="function")return;
   target.setAttribute("data-reveal-waiting","");
   waiting.add(target);
   observer.observe(target);
  });
  return ()=>{
   observer.disconnect();
   waiting.forEach(target=>target.removeAttribute("data-reveal-waiting"));
  };
 },[sectionState]);
 return <span ref={marker} hidden/>;
}
