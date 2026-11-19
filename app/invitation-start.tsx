"use client";

import {useRef,useState,type FormEvent} from "react";
import {sample} from "./model";

export type InvitationBasics = {
 first:string;
 second:string;
 date:string;
 time:string;
 venue:string;
};

export function InvitationStart({templateName,onContinue,children,className}:{templateName:string;onContinue:(basics:InvitationBasics)=>void|false;children:React.ReactNode;className?:string}){
 const dialog=useRef<HTMLDialogElement>(null);
 const [error,setError]=useState("");

 function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  const fields=new FormData(event.currentTarget);
  const first=String(fields.get("first")).trim();
  const second=String(fields.get("second")).trim();
  const invalidName=!first?"first":!second?"second":null;
  if(invalidName){
   const input=event.currentTarget.elements.namedItem(invalidName) as HTMLInputElement;
   input.setCustomValidity("Лутфан номро ворид кунед.");
   input.reportValidity();
   return;
  }
  const result=onContinue({first,second,date:String(fields.get("date")),time:String(fields.get("time")),venue:String(fields.get("venue")).trim()});
  if(result===false){
   setError("Маълумот ба бахши таҳрир гузаронда нашуд. Ба браузер иҷозаи нигоҳдории маълумоти сомонаро диҳед ва дубора кӯшиш кунед.");
   return;
  }
  dialog.current?.close();
 }

 return <>
  <button type="button" className={className} onClick={()=>{setError("");dialog.current?.showModal();}}>{children}</button>
  <dialog ref={dialog} className="start-dialog" aria-labelledby="start-heading" aria-describedby="start-summary">
   <div className="start-dialog-content">
    <div className="start-dialog-heading">
     <h2 id="start-heading">Аз чӣ оғоз мекунем?</h2>
     <button type="button" className="start-close" aria-label="Пӯшидан" onClick={()=>dialog.current?.close()}>×</button>
    </div>
    <p id="start-summary">Қолаби «{templateName}». Маълумоти асосиро ворид кунед. Ҷузъиёти дигарро дар бахши таҳрир илова мекунед ва ҳамон ҷо мебинед, ки даъватнома ба меҳмонон чӣ гуна намоён мешавад.</p>
    <form onSubmit={submit}>
     <div className="start-fields">
      <label>Номи домод<input name="first" placeholder={sample.first} required maxLength={45} autoFocus onInput={event=>event.currentTarget.setCustomValidity("")}/></label>
      <label>Номи арӯс<input name="second" placeholder={sample.second} required maxLength={45} onInput={event=>event.currentTarget.setCustomValidity("")}/></label>
      <label>Санаи тӯй<input name="date" type="date" required min="0001-01-01" max="9999-12-31"/></label>
      <label>Соат<input name="time" type="time" defaultValue="16:00" required/></label>
      <label className="start-venue">Ҷойи баргузорӣ<input name="venue" placeholder="Тарабхона ё шаҳр" maxLength={100} aria-describedby="start-venue-help"/></label>
     </div>
     <p className="start-help" id="start-venue-help">Ҷойро метавонед баъдтар илова кунед. Барои нашри даъватнома ин маълумот лозим аст.</p>
     {error&&<p className="alert" role="alert">{error}</p>}
     <div className="start-actions">
      <button type="button" className="button secondary" onClick={()=>dialog.current?.close()}>Бекор кардан</button>
      <button type="submit" className="button">Гузаштан ба таҳрир</button>
     </div>
    </form>
   </div>
  </dialog>
 </>;
}
