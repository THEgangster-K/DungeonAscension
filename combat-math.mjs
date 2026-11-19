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

// v0.9 — Bounty rewards are deterministic and can be checked separately from graphics.
export function eliteBountyReward(tier,multiplier=1){
  const level=Math.max(1,Math.min(5,Math.floor(Number(tier)||1)));
  const bonus=Math.max(1,Math.min(3,Number(multiplier)||1));
  return {gold:Math.round((125+level*85)*bonus),gems:Math.max(1,Math.round(level*.6*bonus)),xp:Math.round((65+level*35)*bonus)};
}
export function eliteHuntTierEligible(tier){return Number.isFinite(tier)&&tier>=1&&tier<=5}

// v1.2: compass information is derived from world-space coordinates, never from animated meshes.
export function objectiveBearing(fromX,fromZ,toX,toZ,heading=0){
  const dx=toX-fromX,dz=toZ-fromZ;
  if(![fromX,fromZ,toX,toZ,heading].every(Number.isFinite))return {angle:0,distance:0};
  const distance=Math.hypot(dx,dz);
  if(distance<.001)return {angle:0,distance:0};
  const a=Math.atan2(dx,dz)+heading;
  return {angle:Math.atan2(Math.sin(a),Math.cos(a)),distance};
}
