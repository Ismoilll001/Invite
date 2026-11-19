"use client";

import {useState,type ReactNode} from "react";

export function InlineField({value,display,label,onChange,long=false,max=450,type="text"}:{
 value:string;display?:ReactNode;label:string;onChange:(value:string)=>void;long?:boolean;max?:number;type?:string;
}){
 const [editing,setEditing]=useState(false);
 const [draft,setDraft]=useState("");
 function save(){onChange(draft.trim());setEditing(false);}
 return <span className="inline-invitation-field">
  {editing ? <span className="inline-invitation-input">
   {long ? <textarea autoFocus rows={4} aria-label={label} value={draft} maxLength={max}
    onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Escape"){e.preventDefault();setEditing(false);}}}/>
    : <input autoFocus type={type} aria-label={label} value={draft} maxLength={max}
    onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();save();}if(e.key==="Escape"){e.preventDefault();setEditing(false);}}}/>}
   <button type="button" aria-label={label+" ✓"} onClick={save}>✓</button>
   <button type="button" aria-label={label+" ×"} onClick={()=>setEditing(false)}>×</button>
  </span> : <>{display??value}<button type="button" className="invitation-edit-button" aria-label={label} title={label} onClick={()=>{setDraft(value);setEditing(true);}}>✎</button></>}
 </span>;
}
