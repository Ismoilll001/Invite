import {notFound} from "next/navigation";
import {templates} from "@/app/model";
import {DevicePreview} from "../device-preview";

export const dynamic="force-dynamic";

export default async function TemplatePage({params,searchParams}:{params:Promise<{template:string}>;searchParams:Promise<{lang?:string}>}){
 const {template}=await params;
 const {lang}=await searchParams;
 const item=templates.find(candidate=>candidate.id===template);
 if(!item)notFound();
 return <main className="template-demo-page"><DevicePreview item={item} initialLanguage={lang==="ru"?"ru":"tj"}/></main>;
}
