import type {Metadata} from "next";
import {getChatGPTUser} from "../chatgpt-auth";
import {Studio} from "../studio";

export const metadata:Metadata={title:"Қолабҳо · KHUSHBAKHT"};
export const dynamic="force-dynamic";

export default async function TemplatesPage(){
 return <Studio signedIn={!!await getChatGPTUser()} catalogOnly/>;
}
