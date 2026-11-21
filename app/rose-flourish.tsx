"use client";

import {useEffect,useId,useRef,type CSSProperties} from "react";
import {useRoseGrowth} from "./rose-growth";
import {LeafFoil,RoseFoil,RoseMetalDefs,type Leaf,type Flower} from "./rose-metal";

const cornerLeaves:readonly Leaf[]=[[24,120,19,.62],[36,65,-59,.67],[79,45,165,.62],[134,52,69,.78],[170,59,164,.68],[218,48,-28,.76],[260,37,85,.67],[60,99,-27,.63]];
const cornerFlowers:readonly Flower[]=[[82,119,.77,-22],[117,88,.63,21],[181,21,.58,-13],[218,104,.88,15],[253,80,.51,-24],[288,40,.94,14]];
const uprightLeaves:readonly Leaf[]=[[43,218,-116,.81],[55,190,-12,.76],[58,159,-119,.69],[75,127,-89,.77],[83,97,-17,.72],[36,123,-124,.57],[102,127,22,.68]];
const uprightFlowers:readonly Flower[]=[[108,38,1.1,12],[32,85,.63,-26],[130,101,.67,23],[111,167,.56,32],[63,56,.53,-28],[13,82,.32,-8]];

export function RoseFlourish({position,head=false,corner=false,animate=true}:{position:string;head?:boolean;corner?:boolean;animate?:boolean}){
 const flower=useRef<SVGSVGElement>(null);
 const foilId=useId();
 useRoseGrowth(flower);
 useEffect(()=>{
  const node=flower.current;
  if(!node||!animate||!window.IntersectionObserver||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  node.setAttribute("data-pending","");
  const observer=new IntersectionObserver(([entry])=>{
   if(!entry.isIntersecting)return;
   node.removeAttribute("data-pending");
   node.setAttribute("data-blooming","");
   observer.disconnect();
  },{threshold:.12});
  observer.observe(node);
  return ()=>{observer.disconnect();node.removeAttribute("data-pending");node.removeAttribute("data-blooming");};
 },[animate]);

 const leaves=corner?cornerLeaves:uprightLeaves;
 const flowers=head?[[0,0,.87,0] as const]:corner?cornerFlowers:uprightFlowers;
 return <svg ref={flower} className={`rose-flourish rose-flourish-${position}`} data-rose-head={head||undefined} data-rose-branch={!head||undefined} viewBox={head?"-35 -35 70 70":corner?"0 0 320 210":"0 0 160 264"} aria-hidden="true" focusable="false" style={{"--rose-foil":`url(#${foilId}-stem)`} as CSSProperties}>
  <RoseMetalDefs id={foilId}/>
  <g className={corner?"rose-sway rose-sway-corner":"rose-sway"}>
   {!head&&<>
    <path className="rose-flourish-stem" pathLength="1" d={corner
     ?"M13 244C13 220 12 195 13 170C15 105 22 40 85 36C135 32 164 71 203 56S253 19 291 40"
     :"M7 294C8 278 12 263 17 250C55 219 47 179 66 149C84 120 75 77 108 47"}/>
    {(corner?[
     "M25 100C45 88 59 92 82 113",
     "M72 38C88 57 88 75 118 86",
     "M126 44C149 42 172 28 182 17",
     "M170 59C191 72 192 98 219 101",
     "M210 52C234 50 244 62 250 77",
    ]:[
     "M55 178C43 151 23 125 32 94",
     "M72 139C92 130 114 124 127 105",
     "M49 197C62 185 85 163 109 167",
     "M80 110C68 89 52 77 63 58",
     "M36 128C30 113 16 107 12 85",
    ]).map(path=><path key={path} className="rose-flourish-stem rose-flourish-twig" pathLength="1" d={path}/>)}
    {leaves.map((leaf,index)=><LeafFoil key={index} leaf={leaf} id={foilId} index={index}/>)}
   </>}
   {flowers.map((bloom,index)=><RoseFoil key={index} flower={bloom} id={foilId} index={index}/>)}
  </g>
 </svg>;
}
