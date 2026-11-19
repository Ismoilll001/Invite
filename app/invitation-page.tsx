import type {CSSProperties,ReactNode} from "react";
import {invitationDate} from "./invitation-date";
import {InvitationCountdown} from "./invitation-countdown";
import {InvitationReveal} from "./invitation-reveal";
import {InvitationMusic} from "./invitation-music";
import {InlineField} from "./invitation-inline-field";
import {invitationTextOverrides,paletteFor,sample,type Invite} from "./model";

type EditTarget="cover"|"message"|"photo"|"location"|"program";
type Props={data:Invite;photo?:string;preview?:boolean;coverOnly?:boolean;editor?:{controls?:Record<string,ReactNode>;onEdit:(target:EditTarget)=>void;setSectionHidden:(section:string,hide:boolean)=>void;update:(key:keyof Invite,value:string)=>void}};

function calendarTime(value:Date){
 return value.toISOString().replaceAll("-","").replaceAll(":","").replace(".000","");
}

export function InvitationPage({data,photo,preview=false,coverOnly=false,editor}:Props){
 const locale=["ru","tj","uz"].includes(data.locale)?data.locale:"tj";
 const text=locale==="tj"?{
  venue:"Ҷой баъдтар муайян мешавад",message:"Бо камоли эҳтиром Шуморо ба ҷашни арӯсии худ даъват мекунем.",event:"Тӯй",kicker:"ДАЪВАТНОМАИ ТӮЙ",joiner:"ва",photo:"Акси арӯсу домод",location:"Ҷойи баргузорӣ",morning:"Оши наҳор",wedding:"Тӯйи арӯсӣ",program:"Барномаи ҷашн",map:"Кушодан дар Google",yandex:"Кушодан дар Яндекс",calendar:"Ба тақвим",lang:"tg",welcomeKicker:"БАРОИ МЕҲМОНОНИ АЗИЗ",welcomeTitle:"Меҳмонони гиромӣ!",welcomeText:"Мо аз самими дил мехоҳем, ки Шумо дар рӯзи муҳимтарини зиндагии мо ҳамроҳамон бошед.",photoKicker:"ЛАҲЗАИ МО",photoTitle:"Як хотираи дӯстдошта",photoText:"Ин танҳо оғози қиссаест, ки мехоҳем бо наздиконамон идома диҳем.",storyKicker:"ҚИССАИ МО",storyTitle:"Ҳамааш чӣ гуна оғоз ёфт",story:[["Баҳори 2022","Вохӯрии аввал","Як вохӯрии ногаҳонӣ ба суҳбате табдил ёфт, ки намехостем анҷом ёбад."],["Тобистони 2025","Қадами муҳим","Дар як шоми ором мо қарор додем, ки ҳамеша паҳлуи ҳам бошем."],["Ба наздикӣ","Рӯзи мо","Акнун вақти он расидааст, ки ин хушбахтиро бо Шумо тақсим кунем."]],detailsKicker:"МАЪЛУМОТИ ҶАШН",detailsTitle:"Сана ва макони вохӯрӣ",when:"Кай",where:"Дар куҷо",programKicker:"БАРНОМА",programTitle:"Нақшаи рӯзи ҷашн",programItems:[["18:00","Пешвози меҳмонон","Шуморо бо табассум ва фазои гарм истиқбол мекунем."],["19:00","Оғози маросим","Лаҳзаи асосӣ, ки ҳамаи моро гирд меорад."],["20:00","Зиёфати идона","Таомҳои болаззат, суханҳои самимӣ ва шодмонӣ."],["22:00","Рақсу суруд","Шомро бо мусиқӣ ва кайфияти хуб идома медиҳем."]],closingKicker:"БО МУҲАББАТ",closingTitle:"Шуморо интизорем!",closingText:"Ҳузури Шумо ин рӯзро барои мо боз ҳам хотирмонтар мегардонад.",signature:"Бо муҳаббат",
 }:locale==="uz"?{
  venue:"Манзил кейинроқ маълум қилинади",message:"Сизни тўй маросимимизга самимий таклиф қиламиз.",event:"Тўй",kicker:"ТЎЙ ТАКЛИФНОМАСИ",joiner:"ва",photo:"Келин ва куёв сурати",location:"Тўй манзили",morning:"Оши наҳор",wedding:"Тўй",program:"Тадбир дастури",map:"Google харитаси",yandex:"Яндекс харитаси",calendar:"Тақвимга қўшиш",lang:"uz",welcomeKicker:"АЗИЗ МЕҲМОНЛАР УЧУН",welcomeTitle:"Азиз меҳмонлар!",welcomeText:"Ҳаётимизнинг энг муҳим кунида сиз ҳам биз билан бирга бўлишингизни чин дилдан истаймиз.",photoKicker:"БИЗНИНГ ЛАҲЗА",photoTitle:"Севимли хотира",photoText:"Бу яқинларимиз билан давом эттирмоқчи бўлган гўзал ҳикоямизнинг бир қисми.",storyKicker:"БИЗНИНГ ҲИКОЯ",storyTitle:"Ҳаммаси қандай бошланган",story:[["Баҳор 2022","Биринчи учрашув","Кутилмаган учрашув тугатгимиз келмаган самимий суҳбатга айланди."],["Ёз 2025","Муҳим қарор","Осойишта бир оқшомда ҳаёт йўлини бирга давом эттиришга қарор қилдик."],["Жуда яқинда","Бизнинг кунимиз","Энди бу қувончни сиз билан баҳам кўриш вақти келди."]],detailsKicker:"ТЎЙ ТАФСИЛОТЛАРИ",detailsTitle:"Қачон ва қаерда",when:"Қачон",where:"Қаерда",programKicker:"ДАСТУР",programTitle:"Байрам куни режаси",programItems:[["18:00","Меҳмонларни кутиб олиш","Сизни илиқ муҳит ва табассум билан кутиб оламиз."],["19:00","Маросим бошланиши","Барчамизни бирлаштирадиган энг муҳим лаҳза."],["20:00","Байрам зиёфати","Мазали таомлар, самимий тилаклар ва хурсандчилик."],["22:00","Рақс ва мусиқа","Оқшомни мусиқа ва яхши кайфият билан давом эттирамиз."]],closingKicker:"МЕҲР БИЛАН",closingTitle:"Сизни кутамиз!",closingText:"Сизнинг ташрифингиз бу кунни янада унутилмас қилади.",signature:"Меҳр билан",
 }:{
  venue:"Место уточняется",message:"Будем рады разделить с вами радость нашего свадебного дня.",event:"Свадьба",kicker:"СВАДЕБНОЕ ПРИГЛАШЕНИЕ",joiner:"и",photo:"Фото жениха и невесты",location:"Место проведения",morning:"Оши наҳор",wedding:"Свадьба",program:"Программа события",map:"Открыть в Google",yandex:"Открыть в Яндекс",calendar:"В календарь",lang:"ru",welcomeKicker:"ДЛЯ ДОРОГИХ ГОСТЕЙ",welcomeTitle:"Дорогие гости!",welcomeText:"Мы от всего сердца хотим, чтобы в один из самых важных дней нашей жизни вы были рядом с нами.",photoKicker:"НАШ МОМЕНТ",photoTitle:"Любимое воспоминание",photoText:"Это один из кадров нашей истории, которую мы хотим продолжать рядом с близкими людьми.",storyKicker:"НАША ИСТОРИЯ",storyTitle:"Как всё начиналось",story:[["Весна 2022","Первая встреча","Неожиданная встреча превратилась в тёплый разговор, который не хотелось заканчивать."],["Лето 2025","Важное решение","В один тихий вечер мы решили, что хотим всегда идти по жизни рядом."],["Совсем скоро","Наш день","Теперь пришло время разделить это счастье вместе с вами."]],detailsKicker:"ДЕТАЛИ ТОРЖЕСТВА",detailsTitle:"Когда и где встречаемся",when:"Когда",where:"Где",programKicker:"ПРОГРАММА",programTitle:"План праздничного дня",programItems:[["18:00","Встреча гостей","Встречаем вас с улыбками и создаём тёплое настроение."],["19:00","Начало церемонии","Главный и самый трогательный момент нашего вечера."],["20:00","Праздничный ужин","Вкусные блюда, искренние пожелания и радость общения."],["22:00","Танцы и музыка","Продолжаем праздник под любимые песни до позднего вечера."]],closingKicker:"С ЛЮБОВЬЮ",closingTitle:"Мы ждём вас!",closingText:"Ваше присутствие сделает этот день по-настоящему особенным и незабываемым.",signature:"С любовью",
 };
 const first=data.first||sample.first;
 const second=data.second||sample.second;
 const morningOnly=data.eventType==="morning";
 const eventDate=morningOnly?data.morningDate:data.date;
 const eventTime=morningOnly?data.morningTime:data.time;
 const date=eventDate||sample.date;
 const time=eventTime||sample.time;
 const venue=(morningOnly?data.morningVenue:data.venue)||text.venue;
 const address=morningOnly?data.morningAddress:data.address;
 const message=data.message||text.message;
 const day=new Date(date+"T12:00:00Z");
 const validDate=Number.isFinite(+day);
 const dateText=validDate?invitationDate(day,locale,true):date;
 const starts=eventDate&&eventTime?new Date(eventDate+"T"+eventTime+":00+05:00"):null;
 const palette=paletteFor(data.template,data.palette);
 const visible=(section:string)=>!(data.hiddenSections??"").split(",").includes(section);
 const removeLabel=locale==="ru"?"Убрать раздел":locale==="uz"?"Бўлимни олиб ташлаш":"Бахшро пинҳон кунед";
 const restoreLabel=locale==="ru"?"Вернуть раздел":locale==="uz"?"Бўлимни қайтариш":"Бахшро баргардонед";
 function section(id:string,title:string,content:ReactNode){
  const shown=visible(id);
  if(!editor||!content)return shown?content:null;
  const label=shown?removeLabel:restoreLabel;
  return <>
   <div className="invitation-section-control" data-editor-section={id} data-hidden={!shown}>
    {!shown&&<span>{title}</span>}
    <button type="button" aria-label={label+": "+title} onClick={()=>editor.setSectionHidden(id,shown)}>{label}</button>
   </div>
   {shown&&content}
   {editor.controls?.[id]&&<div className="editor-in-place">{editor.controls[id]}</div>}
  </>;
 }
 const editLabel=locale==="ru"?"Редактировать":"Таҳрир";
 const overrides=invitationTextOverrides(data.textOverrides);
 function editableText(key:string,fallback:string,long=false,display?:(value:string)=>ReactNode){
  const value=overrides[key]??fallback;
  const shown=display?display(value):value;
  if(!editor)return shown;
  return <InlineField value={value} display={shown} label={editLabel+" · "+(value||fallback)} long={long}
    onChange={next=>editor.update("textOverrides",JSON.stringify({...overrides,[key]:next}))}/>;
 }
 const field=(key:keyof Invite,value:string,label=editLabel,max=450,long=false,type="text")=>editor
   ? <InlineField value={value} label={label} max={max} long={long} type={type} onChange={next=>editor.update(key,next)}/>
   : value;
 const colors={"--inv-paper":palette.background,"--inv-ink":palette.ink,"--inv-accent":palette.accent} as CSSProperties;
 const place=[venue,address].filter(Boolean).join(", ");
 const mapQuery=new URLSearchParams({api:"1",query:place});
 const calendar=starts&&Number.isFinite(+starts)?new URLSearchParams({
  action:"TEMPLATE",text:`${text.event} · ${first} & ${second}`,
  dates:`${calendarTime(starts)}/${calendarTime(new Date(+starts+3*3600000))}`,location:place,
 }):null;
 const customProgram=data.program.trim().split("\n").map(line=>line.trim()).filter(Boolean);
 const programItems=customProgram.length>0?customProgram.map((line,index)=>{const [itemTime,...rest]=line.split(/\s+[—-]\s+/);return [rest.length?itemTime:"",rest.join(" — ")||line,text.programItems[index]?.[2]||""];}):text.programItems;

 return <article className={`invitation-site theme-${data.template}`} data-palette={palette.id} style={colors} lang={text.lang} aria-hidden={coverOnly||undefined}>
  {data.template==="rose"&&!coverOnly&&<InvitationReveal sectionState={`${data.hiddenSections??""}|${Boolean(photo)}|${data.eventType}|${Boolean(starts)}`}/>}
  {data.template==="rose"&&<div className="rose-page-vines" aria-hidden="true"><span/><span/></div>}
  <section data-editor-section="cover" className="invitation-cover">
   {data.template==="rose"&&!preview&&!coverOnly&&<InvitationMusic locale={locale}/>}
   {data.template==="rose"&&<div className="rose-garden" aria-hidden="true">
    <svg className="rose-opening-branch" viewBox="0 0 840 155" focusable="false">
      <path className="rose-opening-stem" pathLength="1" d="M8 12C90 9 117 77 196 88S301 42 372 75 446 145 513 126 580 71 651 88 750 71 830 17"/>
      {[[93, 30, -96], [148, 68, 43], [222, 89, 80], [282, 70, -92], [354, 69, 34], [426, 111, -73], [501, 129, 65], [564, 101, -102], [633, 84, -49], [708, 88, 71], [767, 58, -66]].map(([x, y, angle], index) =>
        <g key={x} transform={`translate(${x} ${y}) rotate(${angle})`}>
          <path className="rose-opening-leaf" style={{animationDelay: `${2.1 + index * .11}s`}} d="M0 0C2-12 14-19 27-15 24-5 13 2 0 0Z"/>
        </g>
      )}
    </svg>
    {[6, 17, 29, 42, 58, 70, 83, 94].map((left, index) =>
      <span key={left} className="rose-petal" style={{
        left: `${left}%`,
        animationDelay: `${-index * 2.7}s`,
        animationDuration: `${16 + (index % 4) * 2}s`,
      }}/>
    )}
    <span className="rose-flight rose-flight-background"><span className="rose-butterfly"/></span>
    <span className="rose-flight rose-flight-cover"><span className="rose-butterfly"/></span>
   </div>}
   <span className="invitation-spark spark-one" aria-hidden="true">✦</span>
   <span className="invitation-spark spark-two" aria-hidden="true">✧</span>
   <span className="invitation-spark spark-three" aria-hidden="true">✦</span>


   <div className="editable-invitation-line invitation-names"><h2>{field("first",first,editLabel+" · "+first,45)}<i>{editableText("joiner",text.joiner)}</i>{field("second",second,editLabel+" · "+second,45)}</h2></div>
   {(editor||(eventDate&&validDate))&&<div className="editable-invitation-line">
    <p className="invitation-date invitation-cover-date">{editor
     ? <InlineField type="date" value={eventDate} display={eventDate&&validDate?dateText:locale==="ru"?"Указать дату":locale==="uz"?"Санани киритинг":"Санаро ворид кунед"}
       label={locale==="ru"?"Изменить дату":locale==="uz"?"Санани ўзгартириш":"Тағйир додани сана"}
       onChange={value=>editor.update(morningOnly?"morningDate":"date",value)}/>
     : dateText}</p>
   </div>}




   {editor?.controls?.cover}
  </section>
  {!coverOnly&&<>
  {section("countdown",locale==="ru"?"Обратный отсчёт":locale==="uz"?"Саноқ":"Ҳисоби баръакс",!preview&&starts&&Number.isFinite(+starts)&&<InvitationCountdown startsAt={+starts} locale={locale}/>)}
  {section("welcome",text.welcomeTitle,<section className="invitation-section invitation-welcome"><p className="invitation-section-kicker">{editableText("welcomeKicker",text.welcomeKicker)}</p><h3>{editableText("welcomeTitle",text.welcomeTitle)}</h3><div className="editable-invitation-line"><p>{field("message",message,editLabel,450,true)}</p></div></section>)}
  {section("photo",text.photo,photo&&<section className="invitation-section invitation-photo-block editable-invitation-section"><div className="invitation-section-heading"><p className="invitation-section-kicker">{editableText("photoKicker",text.photoKicker)}</p><h3>{editableText("photoTitle",text.photoTitle)}</h3><p>{editableText("photoText",text.photoText,true)}</p></div><div className="invitation-photo-stack"><img src={photo} alt={text.photo} loading="lazy"/></div>{editor&&<EditButton label={locale==="ru"?"Изменить фотографию":"Иваз кардани акс"} onClick={()=>editor.onEdit("photo")}/>}</section>)}
  {section("story",text.storyKicker,<section className="invitation-section invitation-story"><p className="invitation-section-kicker">{editableText("storyKicker",text.storyKicker)}</p><h3>{editableText("storyTitle",text.storyTitle)}</h3><div className="invitation-story-grid">{text.story.map(([season,title,description],index)=><article key={season}><span>0{index+1}</span><small>{editableText("story.season"+index,season)}</small><h4>{editableText("story.title"+index,title)}</h4><p>{editableText("story.body"+index,description,true)}</p></article>)}</div></section>)}
  {data.eventType==="both"&&<section className="invitation-section dual-events"><h3>{editableText("events.title",locale==="tj"?"Ду маросим":locale==="uz"?"Икки маросим":"Два события")}</h3><div className="event-cards"><EventCard title={editableText("events.morning",text.morning)} date={data.morningDate} time={data.morningTime} venue={data.morningVenue} address={data.morningAddress} locale={locale}/><EventCard title={editableText("events.wedding",text.wedding)} date={data.date} time={data.time} venue={data.venue} address={data.address} locale={locale}/></div></section>}
  {section("details",text.detailsTitle,<section className="invitation-section invitation-details editable-invitation-section"><p className="invitation-section-kicker">{editableText("detailsKicker",text.detailsKicker)}</p><h3>{editableText("detailsTitle",text.detailsTitle)}</h3><div className="invitation-details-grid"><article><small>{editableText("when",text.when)}</small><strong>{editor?field(morningOnly?"morningDate":"date",date,editLabel+" · "+text.when,10,false,"date"):dateText}</strong><p>{field(morningOnly?"morningTime":"time",time,editLabel+" · "+time,5,false,"time")}</p></article><article><small>{editableText("where",text.where)}</small><strong>{field(morningOnly?"morningVenue":"venue",venue,editLabel+" · "+text.where,100)}</strong>{(editor||address)&&<p>{field(morningOnly?"morningAddress":"address",address,editLabel+" · "+text.location,160)}</p>}</article></div>{!preview&&<div className="invitation-actions">
    {address&&editableText("actions.map",text.map,false,label=><a href={`https://www.google.com/maps/search/?${mapQuery}`} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}
    {address&&editableText("actions.yandex",text.yandex,false,label=><a href={`https://yandex.com/maps/?text=${encodeURIComponent(place)}`} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}
    {calendar&&editableText("actions.calendar",text.calendar,false,label=><a href={`https://calendar.google.com/calendar/render?${calendar}`} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}
   </div>}</section>)}
  {section("program",text.programTitle,<section className="invitation-section invitation-program editable-invitation-section"><p className="invitation-section-kicker">{editableText("programKicker",text.programKicker)}</p><h3>{editableText("programTitle",text.programTitle)}</h3><div className="invitation-program-grid">{programItems.map(([itemTime,title,description],index)=><article key={`${itemTime}-${index}`}><time>{editableText("program.time"+index,itemTime)}</time><div><h4>{editableText("program.title"+index,title)}</h4>{(editor||description)&&<p>{editableText("program.body"+index,description,true)}</p>}</div></article>)}</div></section>)}
  {section("closing",text.closingTitle,<section className="invitation-section invitation-closing"><p className="invitation-section-kicker">{editableText("closingKicker",text.closingKicker)}</p><h3>{editableText("closingTitle",text.closingTitle)}</h3><p>{editableText("closingText",text.closingText,true)}</p><span>{editableText("signature",text.signature)}</span><strong>{editableText("closing.names",first+" "+(overrides.joiner??text.joiner)+" "+second)}</strong><small>{editableText("closing.brand","KHUSHBAKHT")}</small></section>)}
  </>}
 </article>;
}

function EditButton({label,onClick}:{label:string;onClick:()=>void}){
 return <button type="button" className="invitation-edit-button" aria-label={label} title={label} onClick={onClick}>✎</button>;
}

function EventCard({title,date,time,venue,address,locale}:{title:ReactNode;date:string;time:string;venue:string;address:string;locale:string}){
 const day=new Date(date+"T12:00:00Z");
 return <article><h4>{title}</h4>{date&&<p>{Number.isFinite(+day)?invitationDate(day,locale):date}{time&&` · ${time}`}</p>}<strong>{venue}</strong>{address&&<small>{address}</small>}</article>;
}
