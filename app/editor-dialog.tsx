"use client";
import {useEffect,useRef,type ReactNode} from "react";
export function EditorDialog({open,onClose,busy=false,className,label,closeLabel,children}:{open:boolean;onClose:()=>void;busy?:boolean;className:string;label:string;closeLabel:string;children:ReactNode}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current;if(!dialog)return;if(open&&!dialog.open)dialog.showModal();if(!open&&dialog.open)dialog.close();},[open]);
 useEffect(()=>{if(!open)return;const previous=document.documentElement.style.overflow;document.documentElement.style.overflow="hidden";return()=>{document.documentElement.style.overflow=previous;};},[open]);
 return <dialog ref={ref} className={`editor-dialog ${className}`} aria-label={label} onCancel={e=>{e.preventDefault();if(!busy)onClose();}} onClick={e=>{if(e.target!==e.currentTarget||busy)return;const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}>
  <button className="editor-dialog-close" type="button" disabled={busy} aria-label={closeLabel} onClick={onClose}><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg></button>{children}
 </dialog>;
}
