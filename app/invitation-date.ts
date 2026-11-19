const tajikMonths=["январ","феврал","март","апрел","май","июн","июл","август","сентябр","октябр","ноябр","декабр"];
const tajikWeekdays=["якшанбе","душанбе","сешанбе","чоршанбе","панҷшанбе","ҷумъа","шанбе"];
const uzbekMonths=["январ","феврал","март","апрел","май","июн","июл","август","сентябр","октябр","ноябр","декабр"];
const uzbekWeekdays=["якшанба","душанба","сешанба","чоршанба","пайшанба","жума","шанба"];

export function invitationDate(date:Date,locale:string,weekday=false){
 if(locale==="tj"){
  const day=`${date.getUTCDate()} ${tajikMonths[date.getUTCMonth()]}и ${date.getUTCFullYear()}`;
  return weekday?`${tajikWeekdays[date.getUTCDay()]}, ${day}`:day;
 }
 if(locale==="uz"){
  const day=`${date.getUTCDate()} ${uzbekMonths[date.getUTCMonth()]} ${date.getUTCFullYear()} йил`;
  return weekday?`${uzbekWeekdays[date.getUTCDay()]}, ${day}`:day;
 }
 return new Intl.DateTimeFormat("ru-RU",{dateStyle:weekday?"full":"long",timeZone:"UTC"}).format(date);
}
