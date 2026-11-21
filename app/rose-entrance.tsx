"use client";

import {useEffect,useRef,useState,type CSSProperties,type PointerEvent,type ReactNode} from "react";

import {InvitationMusic} from "./invitation-music";

const labels={
 ru:{open:"Открыть"},
 tj:{open:"Кушодан"},
 uz:{open:"Очиш"},
};

export function RoseEntrance({locale,children,music}:{locale:string;children:ReactNode;music?:{src:string;style:CSSProperties}}){
 const copy=labels[locale as keyof typeof labels]??labels.tj;
 const curtain=useRef<HTMLDialogElement>(null);
 const invitation=useRef<HTMLDivElement>(null);
 const track=useRef<HTMLDivElement>(null);
 const sweepSound=useRef<HTMLAudioElement>(null);
 const musicPlayer=useRef<HTMLAudioElement>(null);
 const started=useRef(false);
 const gesture=useRef<{id:number;y:number;travel:number}|null>(null);
 const [progress,setProgress]=useState(0);
 const [dragging,setDragging]=useState(false);
 const [opening,setOpening]=useState(false);
 const [opened,setOpened]=useState(false);

 useEffect(()=>{
  const dialog=curtain.current;
  if(opened||!dialog)return;
  dialog.showModal();
  const root=document.documentElement;
  const overflow=root.style.overflow;
  root.style.overflow="hidden";
  return ()=>{dialog.close();root.style.overflow=overflow;};
 },[opened]);

 useEffect(()=>{
  if(opened)invitation.current?.focus({preventScroll:true});
 },[opened]);

 useEffect(()=>{
  if(!opening||opened)return;
  const timeout=window.setTimeout(()=>setOpened(true),2050);
  return ()=>window.clearTimeout(timeout);
 },[opening,opened]);

 function open(){
  if(started.current)return;
  started.current=true;
  // Start both players in the accepted gesture so mobile browsers can unlock playback.
  void musicPlayer.current?.play().catch(()=>{});
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
   setOpened(true);
  }else{
   void sweepSound.current?.play().catch(()=>{});
   setOpening(true);
  }
 }

 function startSwipe(event:PointerEvent<HTMLButtonElement>){
  if(!event.isPrimary||event.button!==0||opening||!track.current)return;
  const travel=track.current.clientHeight-event.currentTarget.offsetHeight;
  if(travel<=0)return;
  gesture.current={id:event.pointerId,y:event.clientY,travel};
  event.currentTarget.setPointerCapture(event.pointerId);
  setDragging(true);
 }

 function moveSwipe(event:PointerEvent<HTMLButtonElement>){
  const start=gesture.current;
  if(start?.id!==event.pointerId)return;
  setProgress(Math.max(0,Math.min(1,(start.y-event.clientY)/start.travel)));
 }

 function resetSwipe(){
  gesture.current=null;
  setDragging(false);
  setProgress(0);
 }

 function endSwipe(event:PointerEvent<HTMLButtonElement>){
  const start=gesture.current;
  if(start?.id!==event.pointerId)return;
  resetSwipe();
  if(start.y-event.clientY>=start.travel*.84){
   setProgress(1);
   open();
  }
 }

 return <>
  <div className={opening||opened?"rose-entrance-content is-revealed":"rose-entrance-content"} ref={invitation} tabIndex={-1}>
   {children}
   {music&&<InvitationMusic locale={locale} {...music} playbackRef={musicPlayer}/>}
  </div>
  {!opened&&<dialog ref={curtain} className={opening?"rose-curtain is-opening":"rose-curtain"} aria-label={copy.open}
   onCancel={event=>event.preventDefault()}
   onAnimationEnd={event=>{if(event.target===event.currentTarget&&event.animationName==="rose-curtain-sweep")setOpened(true);}}>
   <audio ref={sweepSound} src="/audio/rose-opening-sweep.mp3" preload="auto" playsInline/>
   <div className="rose-curtain-controls">
    <div ref={track} className="rose-swipe-track" data-dragging={dragging||undefined}>
     <button type="button" aria-label={copy.open} style={{"--rose-slide":progress} as CSSProperties}
      onClick={event=>{if(event.detail===0){setProgress(1);open();}}}
      onPointerDown={startSwipe} onPointerMove={moveSwipe} onPointerUp={endSwipe}
      onPointerCancel={resetSwipe} onLostPointerCapture={()=>{if(gesture.current)resetSwipe();}}
      disabled={opening}>
      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true">
       <path d="M12 20V4m-6 6 6-6 6 6" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
     </button>
    </div>
   </div>
  </dialog>}
 </>;
}
