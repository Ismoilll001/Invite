"use client";

import {useEffect,useRef} from "react";

// Reveal reading units once, when they reach the lower part of the viewport.
// The final state stays readable without JavaScript, observers or animation support.
export function InvitationReveal({sectionState,enabled=true}:{sectionState:string;enabled?:boolean}){
 const marker=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const page=marker.current?.parentElement;
  const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
  if(!page||!enabled||motion.matches||typeof IntersectionObserver==="undefined")return;
  const waiting=new Set<Element>();
  const running=new Set<Animation>();
  const finish=(target:Element)=>{
   waiting.delete(target);
   target.removeAttribute("data-reveal-waiting");
  };
  const observer=new IntersectionObserver(entries=>{
   let sequence=0;
   for(const {target,isIntersecting} of entries){
    if(!isIntersecting)continue;
    observer.unobserve(target);
    if(!waiting.has(target))continue;
    if(motion.matches||target.contains(document.activeElement)||typeof target.animate!=="function"){
     finish(target);continue;
    }
    const animation=target.animate(
     [{opacity:0,transform:"translateY(24px)"},{opacity:1,transform:"translateY(0)"}],
     {duration:1250,delay:Math.min(sequence++*110,330),easing:"cubic-bezier(.22,1,.36,1)",fill:"both"},
    );
    running.add(animation);
    animation.finished.then(()=>{
     finish(target);running.delete(animation);animation.cancel();
    }).catch(()=>{});
   }
  },{rootMargin:`0px 0px -${Math.round(window.innerHeight*.16)}px 0px`,threshold:0});
  const selector=[
   ".invitation-section > .invitation-section-kicker",
   ".invitation-section > h3",
   ".invitation-section > .editable-invitation-line",
   ".invitation-photo-block > .invitation-section-heading",
   ".invitation-photo-block > .invitation-photo-stack",
   ".invitation-story-grid > article",
   ".invitation-program-grid > article",
   ".invitation-details-grid > article",
   ".event-cards > article",
   ".invitation-section > .invitation-actions",
   ".invitation-section > .invitation-countdown",
   ".invitation-closing > p:not(.invitation-section-kicker)",
   ".invitation-closing > span",
   ".invitation-closing > strong",
   ".invitation-closing > small",
  ].join(",");
  page.querySelectorAll(selector).forEach(target=>{
   if(typeof target.animate!=="function")return;
   // Already-read content must not disappear after section changes or back navigation.
   if(target.getBoundingClientRect().bottom<=0)return;
   waiting.add(target);target.setAttribute("data-reveal-waiting","");observer.observe(target);
  });
  const showFocused=(event:FocusEvent)=>{
   for(const target of waiting)if(event.target instanceof Node&&target.contains(event.target)){
    observer.unobserve(target);finish(target);
   }
  };
  const stop=()=>{
   observer.disconnect();running.forEach(animation=>animation.cancel());
   waiting.forEach(target=>target.removeAttribute("data-reveal-waiting"));waiting.clear();
  };
  const onMotionChange=()=>{if(motion.matches)stop();};
  page.addEventListener("focusin",showFocused);
  motion.addEventListener("change",onMotionChange);
  return ()=>{
   stop();page.removeEventListener("focusin",showFocused);motion.removeEventListener("change",onMotionChange);
  };
 },[sectionState,enabled]);
 return <span ref={marker} hidden/>;
}
