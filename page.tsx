import {getChatGPTUser} from "./chatgpt-auth";
import {Studio} from "./studio";
export const dynamic="force-dynamic";
export default async function Home(){return <Studio signedIn={!!await getChatGPTUser()}/>}
