import type {Invite} from "./model";
export function slugName(name:string){
 const source="абвгдеёжзийклмнопрстуфхцчшщъыьэюяғӣқӯҳҷ";
 const latin=["a","b","v","g","d","e","yo","zh","z","i","y","k","l","m","n","o","p","r","s","t","u","f","kh","ts","ch","sh","shch","","y","","e","yu","ya","gh","i","q","u","h","j"];
 return [...name.toLowerCase().trim()].map(letter=>source.includes(letter)?latin[source.indexOf(letter)]:letter).join("").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,19).replace(/-$/,"");
}
export function slugSearch(data:Invite,id?:string,fresh=false){
 const first=slugName(data.first)||"wedding",second=slugName(data.second)||"invite";
 return new URLSearchParams({base:first+"-"+second,reverse:second+"-"+first,year:(data.eventType==="morning"?data.morningDate:data.date).slice(0,4),...(id?{id}:{}),...(fresh?{fresh:"yes"}:{})});
}
