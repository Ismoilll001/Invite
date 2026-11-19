import {invitationDate} from "./invitation-date";
import {sample,type Invite} from "./model";
export function Artwork({data,compact,photo}:{data:Invite;compact?:boolean;photo?:string}){
 const locale=["ru","tj","uz"].includes(data.locale)?data.locale:"tj";
 const text=locale==="tj"?{kicker:"ДАЪВАТНОМАИ ТӮЙ",photo:"Акси арӯсу домод",message:"Бо камоли эҳтиром Шуморо ба ҷашни арӯсии худ даъват мекунем.",map:"Кушодани харита",lang:"tg"}:locale==="uz"?{kicker:"ТЎЙ ТАКЛИФНОМАСИ",photo:"Келин ва куёв сурати",message:"Сизни тўй маросимимизга самимий таклиф қиламиз.",map:"Харитани очиш",lang:"uz"}:{kicker:"ПРИГЛАШЕНИЕ НА СВАДЬБУ",photo:"Фото пары",message:"Будем рады разделить с вами этот особенный день!",map:"Открыть карту",lang:"ru"};
 const date=invitationDate(new Date((data.date||sample.date)+"T12:00:00Z"),locale);
 return <article className={`art ${data.template} ${compact?"compact":""}`} lang={text.lang}>
  <span className="ornament" aria-hidden="true">✦</span>
  <small>{text.kicker}</small>
  <h2>{data.first||sample.first}<i>&amp;</i>{data.second||sample.second}</h2>
  <p className="date">{date}{data.time?" · "+data.time:""}</p>
  {!compact&&<>{photo&&<img src={photo} alt={text.photo}/>}<hr/><p className="message">{data.message||text.message}</p>
   <strong className="venue">{data.venue||sample.venue}</strong>{data.address&&<><span>{data.address}</span><a className="link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.venue+" "+data.address)}`} target="_blank" rel="noreferrer">{text.map} ↗</a></>}</>}
 </article>;
}
