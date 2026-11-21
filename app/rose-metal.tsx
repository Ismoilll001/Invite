export type Leaf = readonly [x:number,y:number,angle:number,scale:number];
export type Flower = readonly [x:number,y:number,scale:number,angle:number];

export function LeafFoil({leaf,id,index}:{leaf:Leaf;id:string;index:number}){
 const [x,y,angle,scale]=leaf;
 return <g data-rose-growth="leaf" transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
  <g className="rose-metal-leaf" style={{animationDelay:`var(--rose-local-start, calc(var(--rose-leaf-start) + ${index} * var(--rose-leaf-step)))`}}>
   <path fill={`url(#${id}-leaf-light)`} d="M0 0C11-17 30-22 49-12C34-10 17-3 0 0Z"/>
   <path fill={`url(#${id}-leaf-shadow)`} d="M0 0C17-3 34-10 49-12C37 5 15 10 0 0Z"/>
   <path className="rose-metal-leaf-vein" d="M1-.2C17-3 33-9 46-11M15-3L24-13M24-6L35-16M20-4L29 2M31-8L39-4"/>
  </g>
 </g>;
}

export function RoseFoil({flower,id,index}:{flower:Flower;id:string;index:number}){
 const [x,y,scale,angle]=flower;
 const fill=(layer:string)=>`url(#${id}-${layer})`;
 return <g data-rose-growth="bloom" transform={`translate(${x} ${y}) scale(${scale}) rotate(${angle})`}>
  <g className="rose-bloom rose-metal-bloom" style={{animationDelay:`var(--rose-local-start, calc(var(--rose-bloom-start) + ${index} * var(--rose-bloom-step)))`}}>
   <path fill={fill("outer")} d="M-28-2C-37-11-28-24-16-24C-14-34 3-36 12-28C25-31 36-20 32-8C42-2 35 14 25 18C26 29 9 34 1 29C-8 35-23 29-25 21C-37 18-39 5-28-2Z"/>
   <path fill={fill("rim")} d="M-26-4C-29-19-18-27-9-25C-4-32 11-31 17-23C30-23 33-12 25-6C16-13 1-18-10-12C-15-9-16-5-14-2C-19-1-22-3-26-4Z"/>
   <path fill={fill("cup")} d="M-29 1C-21-8-9-6-3-2C0-13 9-15 17-12C28-14 35-7 32 2C31 11 18 17 7 14C0 18-7 19-14 16C-24 16-31 9-29 1Z"/>
   <path fill={fill("rim")} d="M-23 14C-14 9-5 16 4 14C15 12 24 8 28 13C21 31 4 29-3 23C-11 30-22 24-23 14Z"/>
   <path fill={fill("cup")} d="M-12-3C-11-12 0-20 11-16C19-16 23-8 17-3C11 2 8 8 0 7C-8 8-16 3-12-3Z"/>
   <path fill={fill("rim")} d="M-4-2C-3-9 8-13 13-7C16-2 9 3 6 1C12-1 10-7 5-6C0-5-1 1 3 3C-2 5-6 1-4-2Z"/>
   <path className="rose-metal-petal-reflection" d="M-30-11C-26-16-21-15-17-12M-17 9C-11 7-6 9-3 11M10-19C15-19 19-16 21-14M16 8C22 7 26 4 27 0M-4 25C0 22 3 21 8 22"/>
   <path className="rose-metal-petal-light" d="M-20-18C-16-22-11-23-7-22M-2-27C4-29 10-27 14-23M20-10C25-11 28-8 29-6M-23 3C-17-1-12 0-8 2M-16 19C-12 22-7 23-3 21M7 23C13 24 18 22 21 19M-7-10C-2-15 4-16 8-15"/>
  </g>
 </g>;
}

export function RoseMetalDefs({id}:{id:string}){
 return <defs>
  <radialGradient id={`${id}-stem`} cx="35%" cy="30%" r="80%">
   <stop stopColor="var(--metal-deep)"/><stop offset=".34" stopColor="var(--metal-mid)"/>
   <stop offset=".48" stopColor="var(--metal-peak)"/><stop offset=".55" stopColor="var(--metal-shade)"/>
   <stop offset=".84" stopColor="var(--metal-light)"/><stop offset="1" stopColor="var(--metal-mid)"/>
  </radialGradient>
  <radialGradient id={`${id}-leaf-light`} cx="68%" cy="78%" r="82%" gradientTransform="translate(.1 -.16) rotate(-19 .5 .5)">
   <stop stopColor="var(--metal-deep)"/><stop offset=".3" stopColor="var(--metal-shade)"/>
   <stop offset=".59" stopColor="var(--metal-mid)"/><stop offset=".72" stopColor="var(--metal-peak)"/>
   <stop offset=".79" stopColor="var(--metal-light)"/><stop offset="1" stopColor="var(--metal-mid)"/>
  </radialGradient>
  <radialGradient id={`${id}-leaf-shadow`} cx="43%" cy="18%" r="89%">
   <stop stopColor="var(--metal-light)"/><stop offset=".23" stopColor="var(--metal-mid)"/>
   <stop offset=".51" stopColor="var(--metal-deep)"/><stop offset=".81" stopColor="var(--metal-shade)"/>
   <stop offset="1" stopColor="var(--metal-light)"/>
  </radialGradient>
  <radialGradient id={`${id}-outer`} cx="29%" cy="21%" r="84%">
   <stop stopColor="var(--metal-peak)"/><stop offset=".25" stopColor="var(--metal-mid)"/>
   <stop offset=".55" stopColor="var(--metal-deep)"/><stop offset=".73" stopColor="var(--metal-shade)"/>
   <stop offset=".89" stopColor="var(--metal-light)"/><stop offset="1" stopColor="var(--metal-mid)"/>
  </radialGradient>
  <radialGradient id={`${id}-rim`} cx="36%" cy="15%" r="81%" gradientTransform="translate(.08 -.09) rotate(-14 .5 .5)">
   <stop stopColor="var(--metal-shade)"/><stop offset=".29" stopColor="var(--metal-mid)"/>
   <stop offset=".41" stopColor="var(--metal-light)"/><stop offset=".47" stopColor="var(--metal-peak)"/>
   <stop offset=".53" stopColor="var(--metal-light)"/><stop offset=".73" stopColor="var(--metal-deep)"/>
   <stop offset="1" stopColor="var(--metal-mid)"/>
  </radialGradient>
  <radialGradient id={`${id}-cup`} cx="29%" cy="73%" r="76%">
   <stop stopColor="var(--metal-peak)"/><stop offset=".27" stopColor="var(--metal-light)"/>
   <stop offset=".48" stopColor="var(--metal-mid)"/><stop offset=".71" stopColor="var(--metal-deep)"/>
   <stop offset=".82" stopColor="var(--metal-shade)"/><stop offset=".95" stopColor="var(--metal-light)"/>
   <stop offset="1" stopColor="var(--metal-peak)"/>
  </radialGradient>
 </defs>;
}
