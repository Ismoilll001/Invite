import {FeatureIcon} from "./feature-icon";
import type {SiteLanguage} from "./model";

const features=[
 {icon:"clock",tj:["Омодагӣ дар 5 дақиқа","Ному санаи ҷашнро нависед — пешнамоиш тайёр аст."],ru:["Приглашение за 5 минут","Укажите имена и дату — предпросмотр готов."]},
 {icon:"guests",tj:["Ҷавоби меҳмонон","Бинед, ки кӣ меояд ва чанд меҳмонро интизор шавед."],ru:["Кто придёт на праздник?","Узнайте, кто придёт и сколько гостей ожидать."]},
 {icon:"invitation",tj:["Даъват бо номи меҳмон","Барои ҳар меҳмон — номи худаш ва пайванди алоҳида."],ru:["Каждому гостю — по имени","Для каждого гостя — его имя и отдельная ссылка."]},
 {icon:"qr",tj:["QR-коди зебои даъватнома","QR-коди зебо созед ва ба даъватномаи чопӣ гузоред."],ru:["Красивый QR-код","Создайте красивый QR-код для печатного приглашения."]},
 {icon:"dashboard",tj:["Саҳифаи шахсӣ","Фармоишҳо, пайвандҳо ва ҷавоби меҳмонон — дар як ҷо."],ru:["Всё в личном кабинете","Заказы, ссылки и ответы гостей — в одном месте."]},
 {icon:"globe",tj:["Даъват ба ҳар гӯшаи ҷаҳон","Наздиконатонро аз дур ҳам бо меҳру эҳтиром даъват кунед."],ru:["Близким по всему миру","Пригласите близких с теплом, даже если они далеко."]},
 {icon:"location",tj:["Суроға, барнома ва мусиқӣ","Ҷойи тӯй, вақти маросим ва мусиқӣ — дар даъватнома."],ru:["Карта, программа и музыка","Место, время событий и любимая музыка в приглашении."]},
 {icon:"edit",tj:["Фақат бахшҳои лозимӣ","Бахшҳои нолозимро бардоред. Танҳо чизи муҳимро монед."],ru:["Только нужные разделы","Уберите лишние разделы. Оставьте только важное."]},
 {icon:"heart",tj:["Орзуҳои неки меҳмонон","Табрик ва орзуҳои неки наздиконатонро нигоҳ доред."],ru:["Тёплые пожелания гостей","Сохраните поздравления и добрые пожелания близких."]},
 {icon:"gift",tj:["Туҳфа аз наздикон","Бо хоҳиши худ маълумоти туҳфаи пулиро илова кунед."],ru:["Подарок от близких","По желанию добавьте реквизиты для денежного подарка."]},
] as const;

export function SiteFeatures({language}:{language:SiteLanguage}){
 const tj=language==="tj";
 const primary=[features[0],features[1],features[2],features[4]];
 const extra=features.filter(feature=>!primary.some(item=>item.icon===feature.icon));
 const card=(feature:(typeof features)[number])=><article className={`capability-card capability-${feature.icon}`} key={feature.icon}><div className="capability-top"><FeatureIcon kind={feature.icon}/></div><h3>{feature[language][0]}</h3><p>{feature[language][1]}</p></article>;
 return <section className="shell home-section capabilities" id="features" aria-labelledby="features-title">
  <div className="capabilities-heading"><div><p className="eyebrow">{tj?"ИМКОНИЯТҲОИ МО":"НАШИ ВОЗМОЖНОСТИ"}</p><h2 id="features-title">{tj?"Ҳама чиз барои ҷашни Шумо":"Всё для вашего праздника"}</h2></div><p className="description">{tj?"Зебо, осон ва бо меҳру эҳтиром.":"Красиво, просто и с вниманием к каждому."}</p></div>
  <div className="capabilities-grid capabilities-primary">{primary.map(card)}</div>
  <details className="capabilities-more"><summary className="button secondary"><span className="capabilities-show">{tj?"Ҳамаи имкониятҳо":"Все возможности"}</span><span className="capabilities-hide">{tj?"Камтар нишон диҳед":"Показать меньше"}</span><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg></summary><div className="capabilities-grid capabilities-extra">{extra.map(card)}</div></details>
 </section>;
}
