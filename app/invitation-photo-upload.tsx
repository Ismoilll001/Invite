"use client";
import {useState} from "react";
import type {SiteLanguage} from "./model";
export function InvitationPhotoUpload({language,onSelect,hasPhoto}:{language:SiteLanguage;onSelect:(file:File)=>void;hasPhoto:boolean}){
 const [error,setError]=useState("");const tj=language==="tj";
 return <div className="photo-upload-above"><label className="photo-upload-button"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/></svg><span>{hasPhoto?(tj?"Иваз кардани акс":"Заменить фотографию"):(tj?"Бор кардани акс":"Загрузить фотографию")}</span><input aria-label={tj?"Бор кардани акс":"Загрузить фотографию"} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024){setError(tj?"JPG, PNG ё WebP то 5 МБ интихоб кунед.":"Выберите JPG, PNG или WebP до 5 МБ.");e.target.value="";return;}setError("");onSelect(file);e.target.value="";}}/></label><small>JPG · PNG · WebP · {tj?"то 5 МБ":"до 5 МБ"}</small>{error&&<p role="alert">{error}</p>}</div>;
}
