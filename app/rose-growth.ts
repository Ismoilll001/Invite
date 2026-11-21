"use client";

import {useLayoutEffect,type RefObject} from "react";

type Point = {x:number;y:number};
type Route = {points:Point[];start:number;duration:number};

function sample(path:SVGPathElement,start:number,duration:number):Route{
 const length=path.getTotalLength();
 const steps=Math.max(1,Math.ceil(length/1.5));
 const points=Array.from({length:steps+1},(_,index)=>path.getPointAtLength(length*index/steps));
 return {points,start,duration};
}

function nearest(routes:Route[],target:Point,endpoints=false){
 let distance=Infinity;
 let anchor={...target,arrival:0};
 for(const route of routes){
  const end=route.points.length-1;
  for(let i=endpoints?end:0;i<=end;i++){
   const point=route.points[i];
   const next=(point.x-target.x)**2+(point.y-target.y)**2;
   if(next>=distance)continue;
   distance=next;
   anchor={x:point.x,y:point.y,arrival:route.start+route.duration*i/end};
  }
 }
 return {anchor,distance};
}

export function useRoseGrowth(ref:RefObject<SVGSVGElement|null>){
 useLayoutEffect(()=>{
  const svg=ref.current;
  if(!svg)return;
  const paths=Array.from(svg.querySelectorAll<SVGPathElement>(".rose-flourish-stem"));
  const [stem,...twigs]=paths;
  if(!stem)return;
  const routes=[sample(stem,0,4.2)];
  let end=4.2;

  for(const twig of twigs){
   const source=twig.getAttribute("d");
   if(!source)continue;
   const from=twig.getPointAtLength(0);
   const {anchor}=nearest(routes,from);
   twig.setAttribute("d",source.replace(/^M\s*-?[\d.]+[ ,]+-?[\d.]+/, `M${anchor.x} ${anchor.y}`));
   const start=anchor.arrival+.12;
   const duration=Math.max(.65,Math.min(1.65,twig.getTotalLength()/60));
   twig.style.setProperty("--rose-local-start",`${start}s`);
   twig.style.setProperty("--rose-local-duration",`${duration}s`);
   routes.push(sample(twig,start,duration));
   end=Math.max(end,start+duration);
  }

  for(const node of svg.querySelectorAll<SVGGElement>("[data-rose-growth]")){
   const transform=node.getAttribute("transform");
   const match=transform?.match(/^translate\(([-\d.]+) ([-\d.]+)\)/);
   if(!match)continue;
   const isBloom=node.dataset.roseGrowth==="bloom";
   const target={x:Number(match[1]),y:Number(match[2])};
   const tip=isBloom?nearest(routes,target,true):null;
   const {anchor}=tip&&tip.distance<196?tip:nearest(routes,target);
   node.setAttribute("transform",transform!.replace(match[0],`translate(${anchor.x} ${anchor.y})`));
   const start=anchor.arrival+(isBloom?.34:.1);
   node.style.setProperty("--rose-local-start",`${start}s`);
   end=Math.max(end,start+(isBloom?3.1:2.2));
  }
  svg.style.setProperty("--rose-local-sway",`${end+.18}s`);
 },[ref]);
}
