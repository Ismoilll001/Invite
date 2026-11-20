import {and,eq} from "drizzle-orm";
import {getDb} from "@/db";
import {invitationGuests} from "@/db/schema";
import {notFound} from "next/navigation";
import {InvitationPage} from "@/app/invitation-page";
import {published} from "@/app/store";
import {validSlug} from "@/app/model";
export const dynamic="force-dynamic";
export default async function Guest({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{g?:string}>}){
 const {slug}=await params;
 const row=validSlug(slug)?await published(slug):null;
 if(!row)notFound();
 const {g}=await searchParams;
 let guest: {id:string;name:string}|undefined;
 if(g!==undefined){if(!/^[a-f0-9]{64}$/.test(g))notFound();const [match]=await getDb().select({id:invitationGuests.id,name:invitationGuests.name}).from(invitationGuests).where(and(eq(invitationGuests.id,g),eq(invitationGuests.orderId,row.id))).limit(1);if(!match)notFound();guest=match;}

 return <main className="guest">{row.demo&&<p className="demo">Намунаи даъватнома</p>}<InvitationPage guest={guest} rsvpSlug={slug} data={row.payload} photo={row.photo?`/api/orders/guest-photo/${slug}`:undefined}/></main>
}
