// Shared combat geometry — independent of renderer, safe to unit test.
export function attackRadius(type,style='slam'){
  if(type==='boss')return style==='shockwave'?4.2:3.25;
  return type==='archer'?1.15:1.7;
}
export function chaseStep(fromX,fromZ,toX,toZ,speed,dt,stopDistance){
  const dx=toX-fromX,dz=toZ-fromZ,dist=Math.hypot(dx,dz);
  if(!Number.isFinite(dist)||dist<=stopDistance||dist<1e-6)return {x:fromX,z:fromZ,moved:false};
  const maxStep=Math.min(Math.max(0,speed)*Math.max(0,dt),dist-stopDistance);
  return {x:fromX+dx/dist*maxStep,z:fromZ+dz/dist*maxStep,moved:maxStep>0};
}
export function hitsWarning(x,z,centerX,centerZ,radius){
  return Math.hypot(x-centerX,z-centerZ)<=radius;
}
export function stopDistance(type){
  return type==='boss'?2.85:type==='archer'?6.7:1.65;
}
export function moveAwayFromPlayer(x,z,px,pz,minDistance){
  const dx=x-px,dz=z-pz,d=Math.hypot(dx,dz);
  if(d>=minDistance)return {x,z};
  if(d<1e-6)return {x:px+minDistance,z:pz};
  return {x:px+dx/d*minDistance,z:pz+dz/d*minDistance};
}
