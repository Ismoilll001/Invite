import {notFound} from "next/navigation";
import {InvitationPage} from "@/app/invitation-page";
import {published} from "@/app/store";
import {validSlug} from "@/app/model";
export const dynamic="force-dynamic";
export default async function Guest({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const row=validSlug(slug)?await published(slug):null;
 if(!row)notFound();
 return <main className="guest">{row.demo&&<p className="demo">Намунаи даъватнома</p>}<InvitationPage data={row.payload} photo={row.photo?`/api/orders/guest-photo/${slug}`:undefined}/></main>
}
