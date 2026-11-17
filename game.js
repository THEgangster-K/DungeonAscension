import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const $=id=>document.getElementById(id);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const rand=(a,b)=>a+Math.random()*(b-a);
const SAVE_KEY='dungeon-ascension-v0.1';
const VERSION=1;
const tiers=[{name:'Common',color:'#b8b9c5',weight:55,scale:1},{name:'Uncommon',color:'#68d88e',weight:25,scale:1.22},{name:'Rare',color:'#72a7ff',weight:12,scale:1.55},{name:'Epic',color:'#bd8dff',weight:6,scale:1.95},{name:'Legendary',color:'#f6bd58',weight:1.8,scale:2.6},{name:'Mythic',color:'#ff6d88',weight:.2,scale:3.5}];
const names=['Rustbound','Emberguard','Stormforged','Moonfall','Oathkeeper','Ironclad','Starshard','Runemarked','Graveborn','Dawnbringer'];
const defaultSave=()=>({version:VERSION,level:1,xp:0,gold:250,gems:0,maxHealth:110,health:110,attackUpgrade:0,healthUpgrade:0,armorUpgrade:0,critUpgrade:0,luckUpgrade:0,mastery:0,depth:1,clears:0,kills:0,bossKills:0,inventory:[{id:'starter',name:'Worn Sword',slot:'weapon',tier:0,power:9,bonus:0}],equipped:{weapon:'starter',armor:null},questRewardClaimed:0,settings:{quality:'medium',camera:'third'},created:Date.now()});
let save=defaultSave();let noticeTime=0;let uid=0;let autoCombat=true;
const nextXp=lv=>Math.round(85*Math.pow(lv,1.32));
function cleanSave(s){if(!s||typeof s!=='object')return null;let d=defaultSave();for(const k of Object.keys(d))if(Object.prototype.hasOwnProperty.call(s,k))d[k]=s[k];d.version=VERSION;for(const k of ['level','xp','gold','gems','attackUpgrade','healthUpgrade','armorUpgrade','critUpgrade','luckUpgrade','mastery','depth','clears','kills','bossKills'])d[k]=clamp(Number(d[k])||0,0,1e10);d.level=Math.max(1,Math.floor(d.level));d.depth=clamp(Math.floor(d.depth),1,5);d.maxHealth=clamp(110+d.healthUpgrade*18,110,1e7);d.health=clamp(Number(d.health)||d.maxHealth,1,d.maxHealth);if(!Array.isArray(d.inventory))d.inventory=[];d.inventory=d.inventory.filter(x=>x&&typeof x.id==='string'&&typeof x.name==='string'&&['weapon','armor'].includes(x.slot)).slice(0,120);if(!d.inventory.length)d.inventory=[{id:'starter',name:'Worn Sword',slot:'weapon',tier:0,power:9,bonus:0}];if(!d.equipped||typeof d.equipped!=='object')d.equipped={weapon:d.inventory[0].id,armor:null};for(const slot of ['weapon','armor'])if(!d.inventory.some(x=>x.id===d.equipped[slot]&&x.slot===slot))d.equipped[slot]=slot==='weapon'?d.inventory.find(x=>x.slot===slot)?.id||null:null;d.settings={...defaultSave().settings,...(d.settings||{})};return d;}
function load(){try{const raw=localStorage.getItem(SAVE_KEY);if(raw){const s=cleanSave(JSON.parse(raw));if(s)save=s;}}catch(e){console.warn('Save read failed',e)}}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));$('savedInfo').textContent=`Saved adventurer · Level ${save.level} · ${save.clears} dungeon clears`;return true}catch(e){notify('Save blocked: export a backup from the pause menu');return false}}
load();
let scene,camera,renderer,clock,player,playerRig,sword,torches=[],decor=[],enemies=[],loot=[],effects=[],walls=[],interactables=[],keys=new Set(),moveVector=new THREE.Vector3();
let state='title',world='hub',camMode=save.settings.camera==='first'?'first':'third',yaw=0,pitch=.18,speedBoost=0,invulnerable=0,attackTimer=0,stamina=100,skillCD=[0,0,0,0],dodgeTime=0,hitTime=0,nearby=null,runTime=0,gameTick=0,ambientClock=0,seed=1,activePanel='',panelTab='inventory',depth=1,rooms=[],bossDefeated=false,runKills=0,runGold=0,portal=null,hubProps=[];
const mat=(color,roughness=1,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const stone=mat('#4d5264'),stone2=mat('#37394a'),floorMat=mat('#343443'),goldMat=new THREE.MeshStandardMaterial({color:0xe8b765,metalness:.55,roughness:.3}),portalMat=new THREE.MeshStandardMaterial({color:0x885eea,emissive:0x432ca0,emissiveIntensity:1.6,transparent:true,opacity:.84,side:THREE.DoubleSide});
const hpColor=new THREE.Color('#e15c70');
function mesh(geo,material,parent=scene){const o=new THREE.Mesh(geo,material);o.castShadow=false;o.receiveShadow=true;parent.add(o);return o}
function box(w,h,d,m,x,y,z,parent=scene){const o=mesh(new THREE.BoxGeometry(w,h,d),m,parent);o.position.set(x,y,z);return o}
function sphere(r,m,x,y,z,parent=scene){const o=mesh(new THREE.SphereGeometry(r,12,8),m,parent);o.position.set(x,y,z);return o}
function cylinder(rt,rb,h,m,x,y,z,parent=scene,n=8){const o=mesh(new THREE.CylinderGeometry(rt,rb,h,n),m,parent);o.position.set(x,y,z);return o}
function light(color,intensity,distance,x,y,z){const l=new THREE.PointLight(color,intensity,distance,2);l.position.set(x,y,z);scene.add(l);return l}
function notify(t){$('message').textContent=t;$('message').style.opacity=1;clearTimeout(noticeTime);noticeTime=setTimeout(()=>$('message').style.opacity=0,3300)}
function floater(text,cls=''){let el=document.createElement('div');el.className='floater '+cls;el.textContent=text;el.style.left=`${rand(43,57)}%`;el.style.top=`${rand(36,49)}%`;$('floaters').appendChild(el);setTimeout(()=>el.remove(),1050)}
function addWall(x,z,w,d,h=5,m=stone){box(w,h,d,m,x,h/2,z);walls.push({x,z,w,d})}
function makeTorch(x,z){const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);cylinder(.22,.35,1.45,stone2,0,.72,0,g);cylinder(.3,.25,.16,goldMat,0,1.49,0,g);const f=mesh(new THREE.ConeGeometry(.22,.67,6),new THREE.MeshBasicMaterial({color:0xffb763}),g);f.position.y=1.89;let l=light(0xffa94a,2.2,11,x,2,z);torches.push({f,l});return g}
function makeCrystal(x,z,color=0x8e86ed,size=1){const group=new THREE.Group();group.position.set(x,0,z);scene.add(group);const cry=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.65,metalness:.16,roughness:.32});for(let k=0;k<3;k++){let h=rand(.7,1.8)*size;let o=mesh(new THREE.ConeGeometry(rand(.2,.38)*size,h,5),cry,group);o.position.set(rand(-.42,.42)*size,h/2,rand(-.36,.36)*size);o.rotation.z=rand(-.23,.23)}light(color,1.6,10,x,1.7,z);return group}
function createPortal(x,z,action){const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);cylinder(1.1,1.25,.4,stone2,0,.2,0,g,12);const arch=mesh(new THREE.TorusGeometry(1.43,.22,8,24,Math.PI),goldMat,g);arch.rotation.z=Math.PI/2;arch.position.y=1.43;const disk=mesh(new THREE.CircleGeometry(1.25,32),portalMat,g);disk.position.set(0,1.33,0);const frame=mesh(new THREE.TorusGeometry(1.23,.075,6,28),new THREE.MeshBasicMaterial({color:0xbc9bff}),g);frame.position.y=1.33;interactables.push({x,z,range:2.6,text:action==='enter'?'Enter Forgotten Catacombs':'Return to Adventurer’s Haven',action});return g}
function makeMerchant(x,z,type){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);cylinder(.5,.7,.92,mat(type==='forge'?0x696475:0x3f7b8a),0,.92,0,g);sphere(.33,mat(0xd6a778),0,1.68,0,g);const hat=mesh(new THREE.ConeGeometry(.45,.5,8),mat(type==='forge'?0x73596d:0x365e69),g);hat.position.y=2.13;box(.7,.14,.22,stone2,0,.48,-.5,g);interactables.push({x,z,range:2.5,text:type==='forge'?'Open Blacksmith and Upgrades':'Open Inventory and Crafting',action:type});return g}
function clearWorld(){for(const child of [...scene.children])if(child!==playerRig && child!==camera && child.type!=='AmbientLight' && child.type!=='HemisphereLight' && child.type!=='DirectionalLight'){scene.remove(child);child.traverse(o=>{if(o.isMesh&&o.geometry)o.geometry.dispose()})};torches=[];enemies=[];loot=[];effects=[];walls=[];interactables=[];rooms=[];nearby=null;portal=null;bossDefeated=false;runKills=0;runGold=0;}
function buildHub(){world='hub';clearWorld();scene.background=new THREE.Color(0x151b2b);scene.fog=new THREE.FogExp2(0x151b2b,.026);box(44,.6,44,floorMat,0,-.3,0);for(let i=-20;i<=20;i+=4){box(.035,.02,44,stone2,i,.02,0);box(44,.02,.035,stone2,0,.02,i)}addWall(0,-22,44,1);addWall(-22,0,1,44);addWall(22,0,1,44);addWall(0,22,44,1);for(let i of [-17,17])for(let j of [-17,17]){cylinder(.75,.85,4.5,stone,i,2.25,j);cylinder(.95,.95,.5,goldMat,i,4.5,j);makeTorch(i*.73,j*.73)}makeCrystal(-12,-7);makeCrystal(13,-13,0x53cba7,.7);makeCrystal(-12,12,0xc78adc,.75);makeMerchant(-7,2,'forge');makeMerchant(7,2,'craft');createPortal(0,-14,'enter');box(12,.12,4,stone2,0,.06,-9);for(let i=-2;i<=2;i++){cylinder(.22,.28,1.8,stone,0,.9,i*3.5+3);}
player.position.set(0,0,10);yaw=0;pitch=.2;state='playing';save.health=clamp(save.health,1,save.maxHealth);notify('Welcome to the Adventurer’s Haven · E near the portal');updateUI();}
function sRand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
function buildDungeon(){world='dungeon';clearWorld();seed=(Math.random()*4294967295)>>>0;depth=clamp(selectedDepth||save.depth,1,Math.max(1,save.depth));const roomCount=4+Math.min(depth,2);const width=18;const gap=7;const roomLength=15;const spacing=roomLength+gap;const total=roomCount*spacing;scene.background=new THREE.Color(0x0c1020);scene.fog=new THREE.FogExp2(0x111421,.035);for(let i=0;i<roomCount;i++){let z=-i*spacing, boss=i===roomCount-1;rooms.push({z,boss,cleared:false});box(width,.55,roomLength,floorMat,0,-.275,z);box(width,.02,.09,stone2,0,.012,z-roomLength/4);box(width,.02,.09,stone2,0,.012,z+roomLength/4);addWall(-width/2,z,.8,roomLength+1);addWall(width/2,z,.8,roomLength+1);if(i===0)addWall(0,z+roomLength/2,width,1);if(i===roomCount-1)addWall(0,z-roomLength/2,width,1);if(i<roomCount-1){const corridorZ=z-roomLength/2-gap/2;box(5,.55,gap+.5,floorMat,0,-.275,corridorZ);addWall(-2.5,corridorZ,.5,gap);addWall(2.5,corridorZ,.5,gap);addWall(-5.8,z-roomLength/2,width/2-5.9,.9);addWall(5.8,z-roomLength/2,width/2-5.9,.9);addWall(-5.8,z-roomLength/2-gap,width/2-5.9,.9);addWall(5.8,z-roomLength/2-gap,width/2-5.9,.9)}for(let s of [-1,1]){cylinder(.6,.65,4.3,stone,s*7,2.15,z+5);cylinder(.6,.65,4.3,stone,s*7,2.15,z-5);makeTorch(s*6.9,z+(i%2===0?3:-3));if(sRand()>.48)makeCrystal(s*(5+sRand()*2),z+(sRand()-.5)*9,i>2?0xd28c6e:0x9079e9,.48)}if(i>0){let count=boss?1:Math.min(2+Math.floor(depth/2)+Math.floor(i/2),5);for(let j=0;j<count;j++)spawnEnemy((sRand()-.5)*10,z+(sRand()-.5)*7,boss? 'boss':sRand()>.6?'brute':'skeleton')}if(i===Math.floor(roomCount/2)){spawnChest(5,z+3)}}let portalZ=-(roomCount-1)*spacing-4;createPortal(0,portalZ,'exit'); // exit can only be used after boss
player.position.set(0,0,3.5);yaw=0;pitch=.16;state='playing';notify('Catacombs entered · Defeat the Bone Guardian');updateUI();}
function enemyRig(type){let g=new THREE.Group();let isBoss=type==='boss',isBrute=type==='brute',scale=isBoss?1.78:isBrute?1.25:1;g.scale.setScalar(scale);const bone=mat(isBoss?0x797189:isBrute?0x6d7185:0xb3a99b),armor=mat(isBoss?0x48375d:isBrute?0x61566f:0x494b61),eye=new THREE.MeshBasicMaterial({color:isBoss?0xff5a86:0xffd886});cylinder(.39,.48,.9,armor,0,1.04,0,g);sphere(.31,bone,0,1.67,0,g);box(.65,.3,.52,armor,0,1.35,0,g);for(let sx of [-1,1]){cylinder(.13,.16,.72,bone,sx*.57,.95,0,g);cylinder(.15,.15,.8,bone,sx*.22,.36,0,g);sphere(.065,eye,sx*.13,1.72,.27,g)}let horn=mat(isBoss?0xaa8dc7:0x9a9190);if(isBoss)for(let sx of [-1,1]){let h=mesh(new THREE.ConeGeometry(.2,.6,5),horn,g);h.position.set(sx*.26,2.08,0);h.rotation.z=sx*.35}let blade=box(.13,.85,.12,isBoss?goldMat:stone2,.73,1.04,.15,g);blade.rotation.z=-.35;let aura=isBoss?sphere(.18,new THREE.MeshBasicMaterial({color:0xd26fff}),0,1.06,.48,g):null;return g}
function spawnEnemy(x,z,type){let g=enemyRig(type);g.position.set(x,0,z);scene.add(g);let boss=type==='boss';let hp=(boss?390:type==='brute'?100:62)*Math.pow(1.48,depth-1);enemies.push({g,type,x,z,hp,max:hp,alive:true,speed:(boss?1.5:type==='brute'?1.7:2.2)+depth*.08,range:boss?2.2:1.5,damage:(boss?22:type==='brute'?12:8)*Math.pow(1.22,depth-1),cool:rand(0,2),attackFlash:0,roam:rand(0,5),dir:rand(0,6.28),phase:0});}
function spawnChest(x,z){let g=new THREE.Group();g.position.set(x,0,z);scene.add(g);box(1,.6,.7,mat(0x705136),0,.34,0,g);box(1.04,.18,.76,goldMat,0,.71,0,g);box(.13,.6,.8,goldMat,0,.42,0,g);interactables.push({x,z,range:2.3,text:'Open treasure chest',action:'chest',g,opened:false})}
function calcAttack(){const equip=save.inventory.find(x=>x.id===save.equipped.weapon);return Math.floor(9+save.level*1.7+save.attackUpgrade*5+Math.min(25,Math.floor(save.mastery/30))+(runBlessing?.damage||0)+(equip?.power||0)+(equip?.bonus||0))}
function calcArmor(){const equip=save.inventory.find(x=>x.id===save.equipped.armor);return Math.floor(save.armorUpgrade*3+save.level*.35+(equip?.power||0))}
function gainXp(v){save.xp+=Math.max(0,Math.floor(v));let count=0;while(save.xp>=nextXp(save.level)&&count++<20){save.xp-=nextXp(save.level);save.level++;save.maxHealth+=0;save.health=Math.min(save.maxHealth,save.health+25);floater('LEVEL UP!','reward');notify(`LEVEL ${save.level} · Your power is growing`)}updateUI()}
function dropItem(type='enemy'){const rate=type==='boss'?1:Math.min(.42,.20+save.luckUpgrade*.025+(runBlessing?.loot||0));if(Math.random()>rate)return null;let roll=rand(0,100),tier=0;for(const t of tiers){roll-=t.weight;if(roll<=0)break;tier++}tier=clamp(tier,0,5);const slot=Math.random()<.72?'weapon':'armor';const name=`${names[Math.floor(Math.random()*names.length)]} ${slot==='weapon'?'Blade':'Mail'}`;const item={id:`i${Date.now().toString(36)}${(uid++).toString(36)}`,name,slot,tier,power:Math.round((slot==='weapon'?6:3)*(1+depth*.55)*tiers[tier].scale+rand(1,6)),bonus:tier>=2?Math.floor(rand(1,5)*tier):0};if(save.inventory.length>=100){save.gold+=Math.ceil(15*tiers[tier].scale);notify('Inventory full · Loot converted to gold');return null}save.inventory.push(item);floater(`✦ ${tiers[tier].name} ${slot}!`,'reward');notify(`${tiers[tier].name} ${name} obtained!`);persist();return item}
function defeatEnemy(e){e.alive=false;e.g.visible=false;let amt=Math.floor((e.type==='boss'?250: e.type==='brute'?55:25)*Math.pow(1.75,depth-1)*(contract?.reward||1));let exp=Math.floor((e.type==='boss'?175:e.type==='brute'?43:22)*Math.pow(1.55,depth-1)*(contract?.reward||1));save.gold+=amt;runGold+=amt;save.kills++;save.mastery++;runKills++;gainXp(exp);floater(`+${amt} Gold`,'reward');dropItem(e.type==='boss'?'boss':'enemy');if(e.type==='boss'){bossDefeated=true;save.bossKills++;save.clears++;save.gems+=Math.round((2+depth)*(contract?.reward||1));save.depth=Math.min(5,Math.max(save.depth,depth+1));notify(`BOSS DEFEATED! +${2+depth} Gems · Exit portal unlocked`);persist()}updateUI()}
function damageEnemy(e,n,critChance=.12){if(!e.alive)return;const crit=Math.random()<Math.min(.55,critChance+save.critUpgrade*.018);const dmg=Math.round(n*(crit?1.65:1)*rand(.9,1.1));e.hp-=dmg;e.attackFlash=.18;floater(`${crit?'CRIT ':''}${dmg}`,crit?'crit':'');if(e.hp<=0)defeatEnemy(e)}
function hurt(n){if(invulnerable>0||state!=='playing'||save.health<=0)return;let dmg=Math.max(1,Math.round(n*(100/(100+calcArmor()*3))*(runBlessing?.guard||1)));save.health-=dmg;invulnerable=.55;$('hitflash').style.opacity=1;setTimeout(()=>$('hitflash').style.opacity=0,150);floater(`-${dmg}`);updateUI();if(save.health<=0){save.health=save.maxHealth;save.gold=Math.max(0,Math.floor(save.gold*.95));persist();setTimeout(()=>{buildHub();notify('You fell in the dungeon · Lost 5% Gold. Try again!')},450)}}
function nearestEnemy(dist=3.2){let best=null,bd=dist;for(const e of enemies){if(!e.alive)continue;const d=Math.hypot(e.x-player.position.x,e.z-player.position.z);if(d<bd){best=e;bd=d}}return best}
function performAttack(){let e=nearestEnemy(3.15);if(!e)return;damageEnemy(e,calcAttack());sword.rotation.z=-.95;setTimeout(()=>{if(sword)sword.rotation.z=-.36},120)}
function activateSkill(n){if(state!=='playing'||skillCD[n]>0)return;const power=calcAttack();if(n===0){let target=nearestEnemy(4.4);if(!target){notify('No target in range');return}damageEnemy(target,power*2.65,.27);skillCD[0]=6;notify('POWER STRIKE!')}if(n===1){let hits=0;for(const e of enemies)if(e.alive&&Math.hypot(e.x-player.position.x,e.z-player.position.z)<5.1){damageEnemy(e,power*1.4);hits++}if(!hits){notify('No enemies close enough');return}skillCD[1]=9;notify(`WHIRLWIND · ${hits} enemies hit`)}if(n===2){speedBoost=4;invulnerable=.3;skillCD[2]=13;notify('BATTLE RUSH · Increased movement and attack speed')}if(n===3){if(save.health>=save.maxHealth){notify('Health is already full');return}save.health=Math.min(save.maxHealth,save.health+Math.round(save.maxHealth*.36));skillCD[3]=22;floater('HEALED','reward');updateUI()}}
function spend(cost,cb){if(save.gold<cost){notify(`Need ${cost.toLocaleString()} gold`);return}save.gold-=cost;cb();persist();updateUI();openPanel('upgrade')}
function renderPanel(){let body=$('panelBody');$('panelTitle').textContent=activePanel==='upgrade'?'Blacksmith & Upgrades':activePanel==='help'?'Guide to Dungeon Ascension':'Adventurer Inventory';$('panelSubtitle').textContent=activePanel==='upgrade'?'FORGE YOUR STRENGTH':activePanel==='help'?'CONTROLS & SURVIVAL':'EQUIPMENT & CRAFTING';const item=save.inventory.find(x=>x.id===save.equipped.weapon),armor=save.inventory.find(x=>x.id===save.equipped.armor);
if(activePanel==='help'){body.innerHTML=`<div class="notice">Fight through the Catacombs, defeat the Bone Guardian, earn loot and upgrade equipment. Press E near the violet portal to start. Enemies respawn in every new run.</div><div class="item-grid">${[['WASD','Move'],['Mouse','Look around (click game to lock pointer)'],['V','Switch first/third-person'],['Shift','Sprint'],['Q','Dodge roll'],['1–4','Activate special abilities'],['E','Interact with portal, merchants, chests'],['I','Inventory & crafting'],['U','Blacksmith upgrades'],['Esc','Pause / release mouse']].map(x=>`<div class="item"><b>${x[0]}</b><p>${x[1]}</p></div>`).join('')}</div><p class="sub">Auto-attacks target nearby enemies automatically. Every dungeon clear grants permanent progress. Save data is local to this browser; use Export Save for backup.</p>`;return}
if(activePanel==='upgrade'){let defs=[['attackUpgrade','Sharpen Weapon',100,'+5 base attack per level'],['healthUpgrade','Increase Vitality',120,'+18 maximum HP per level'],['armorUpgrade','Reinforce Armour',140,'+3 defence per level'],['critUpgrade','Precision Training',250,'+1.8% critical chance per level'],['luckUpgrade','Treasure Instinct',300,'+2.5% equipment drop chance per level']];body.innerHTML=`<div class="notice">Current damage: <b>${calcAttack()}</b> · Defence: <b>${calcArmor()}</b> · Health: <b>${save.maxHealth}</b><br>Available gold: <b>${save.gold.toLocaleString()}</b></div>`+defs.map(([k,title,base,desc])=>{let lv=save[k],cost=Math.round(base*Math.pow(1.55,lv));return `<div class="shop-card"><div><b>${title} +${lv}</b><p>${desc}</p><p>Next cost: ${cost.toLocaleString()} gold</p></div><button data-upgrade="${k}" ${save.gold<cost?'disabled':''}>UPGRADE</button></div>`}).join('')+`<p class="sub">Upgrades have no failure chance. Use gold from dungeon encounters to improve your build.</p>`;body.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>{let k=b.dataset.upgrade;let base={attackUpgrade:100,healthUpgrade:120,armorUpgrade:140,critUpgrade:250,luckUpgrade:300}[k];let cost=Math.round(base*Math.pow(1.55,save[k]));spend(cost,()=>{save[k]++;if(k==='healthUpgrade'){save.maxHealth+=18;save.health+=18}notify('Upgrade successful!')})});return}
const tabs=`<div class="tabs"><button data-tab="inventory" class="${panelTab==='inventory'?'active':''}">INVENTORY (${save.inventory.length})</button><button data-tab="craft" class="${panelTab==='craft'?'active':''}">CRAFTING</button><button data-tab="stats" class="${panelTab==='stats'?'active':''}">CHARACTER</button></div>`;let html=tabs;
if(panelTab==='inventory'){html+=`<div class="notice">Equipped: ${item?.name||'None'} · ${armor?.name||'No Armour'}<br>Click Equip to use an item or Sell to receive gold. Equipped items cannot be sold.</div><div class="item-grid">`+save.inventory.map(x=>`<div class="item" style="border-color:${tiers[x.tier]?.color||'#999'}88"><div class="eyebrow" style="color:${tiers[x.tier]?.color||'#999'}">${tiers[x.tier]?.name||'Common'} ${x.slot.toUpperCase()}</div><h3>${escapeHtml(x.name)}</h3><p>Power +${x.power} ${x.bonus?`· Bonus +${x.bonus}`:''}</p><button data-equip="${x.id}" ${save.equipped[x.slot]===x.id?'disabled':''}>${save.equipped[x.slot]===x.id?'EQUIPPED':'EQUIP'}</button><button data-sell="${x.id}" ${save.equipped[x.slot]===x.id?'disabled':''}>SELL</button></div>`).join('')+'</div>';}
if(panelTab==='craft'){const recipes=[{name:'Forged Steel Blade',slot:'weapon',tier:2,power:28,cost:700,gems:1},{name:'Guardian Plate',slot:'armor',tier:2,power:14,cost:900,gems:1},{name:'Runic Greatsword',slot:'weapon',tier:3,power:54,cost:2500,gems:6}];html+=`<div class="notice">Craft reliable upgrades using gold and boss gems. This guarantees useful items even if random drops are unlucky.</div>`+recipes.map((r,i)=>`<div class="shop-card"><div><b>${r.name}</b><p>${r.slot} · Power +${r.power} · ${r.cost} gold + ${r.gems} gems</p></div><button data-craft="${i}" ${save.gold<r.cost||save.gems<r.gems?'disabled':''}>CRAFT</button></div>`).join('');}
if(panelTab==='stats'){html+=`<div class="item-grid">${[['Level',save.level],['Experience',`${save.xp} / ${nextXp(save.level)}`],['Damage',calcAttack()],['Defence',calcArmor()],['Health',`${save.health} / ${save.maxHealth}`],['Gold',save.gold.toLocaleString()],['Gems',save.gems],['Dungeon clears',save.clears],['Enemies defeated',save.kills],['Bosses defeated',save.bossKills],['Deepest unlocked',save.depth],['Saved items',save.inventory.length],['Weapon mastery',save.mastery||0],['Critical training',save.critUpgrade||0],['Loot instinct',save.luckUpgrade||0]].map(x=>`<div class="item"><div class="sub">${x[0]}</div><h3>${x[1]}</h3></div>`).join('')}</div>`}
body.innerHTML=html;body.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{panelTab=b.dataset.tab;renderPanel()});body.querySelectorAll('[data-equip]').forEach(b=>b.onclick=()=>{let x=save.inventory.find(i=>i.id===b.dataset.equip);if(x){save.equipped[x.slot]=x.id;persist();renderPanel();updateUI()}});body.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>{let x=save.inventory.find(i=>i.id===b.dataset.sell);if(!x||save.equipped[x.slot]===x.id)return;save.inventory=save.inventory.filter(i=>i.id!==x.id);save.gold+=Math.round((x.power+x.bonus)*8*tiers[x.tier].scale);persist();renderPanel();updateUI()});body.querySelectorAll('[data-craft]').forEach(b=>b.onclick=()=>{const r=[{name:'Forged Steel Blade',slot:'weapon',tier:2,power:28,cost:700,gems:1},{name:'Guardian Plate',slot:'armor',tier:2,power:14,cost:900,gems:1},{name:'Runic Greatsword',slot:'weapon',tier:3,power:54,cost:2500,gems:6}][Number(b.dataset.craft)];if(!r||save.gold<r.cost||save.gems<r.gems||save.inventory.length>=100)return;save.gold-=r.cost;save.gems-=r.gems;save.inventory.push({id:`c${Date.now()}${uid++}`,name:r.name,slot:r.slot,tier:r.tier,power:r.power,bonus:0});persist();notify(`${r.name} crafted!`);renderPanel();updateUI()})}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function openPanel(type){activePanel=type;state='panel';document.exitPointerLock?.();$('panel').classList.remove('hidden');$('pauseScreen').classList.add('hidden');renderPanel()}
function closePanel(){activePanel='';$('panel').classList.add('hidden');state='playing'}
function pause(){if(state==='playing'){state='paused';document.exitPointerLock?.();$('pauseScreen').classList.remove('hidden');persist()}else if(state==='paused'){state='playing';$('pauseScreen').classList.add('hidden')}else if(state==='panel')closePanel()}
function updateUI(){$('levelLabel').textContent=`LV ${save.level}`;$('statsLabel').textContent=`${calcAttack()} ATK · ${calcArmor()} DEF`;$('healthBar').style.width=`${100*save.health/save.maxHealth}%`;$('healthLabel').textContent=`${Math.ceil(save.health)} / ${save.maxHealth} HP`;$('xpBar').style.width=`${100*save.xp/nextXp(save.level)}%`;$('xpLabel').textContent=`${save.xp} / ${nextXp(save.level)} XP`;$('goldLabel').textContent=save.gold.toLocaleString();$('gemLabel').textContent=save.gems.toLocaleString();$('zoneLabel').textContent=world==='hub'?'ADVENTURER’S HAVEN':`FORGOTTEN CATACOMBS · TIER ${depth}`;$('mapNote').textContent=world==='hub'?'HAVEN':'CATACOMBS';$('cameraLabel').textContent=camMode==='third'?'THIRD PERSON':'FIRST PERSON';if(world==='hub'){$('questTitle').textContent='Enter the Catacombs';$('questDesc').textContent='Find the purple portal. Press E to enter.'}else if(bossDefeated){$('questTitle').textContent='Dungeon Cleared!';$('questDesc').textContent='Find the exit portal and claim your progress.'}else{$('questTitle').textContent='Defeat the Bone Guardian';$('questDesc').textContent=`${runKills} enemies defeated · Explore deeper`}}
function initScene(){scene=new THREE.Scene();scene.background=new THREE.Color(0x151b2b);camera=new THREE.PerspectiveCamera(72,window.innerWidth/window.innerHeight,.08,115);renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));renderer.shadowMap.enabled=false;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;$('game').appendChild(renderer.domElement);scene.add(new THREE.HemisphereLight(0xb5beff,0x353041,2.05));const sun=new THREE.DirectionalLight(0xe6d3ad,1.3);sun.position.set(-8,18,13);scene.add(sun);playerRig=new THREE.Group();player=new THREE.Group();playerRig.add(player);scene.add(playerRig);const armor=mat(0x53688c,.7,.2),skin=mat(0xe0ba96),dark=mat(0x242a3a),blade=new THREE.MeshStandardMaterial({color:0x9bb8ec,metalness:.82,roughness:.18});cylinder(.45,.39,.92,armor,0,1.07,0,player);sphere(.31,skin,0,1.73,0,player);cylinder(.35,.3,.3,armor,0,1.99,0,player);box(.48,.16,.65,dark,0,1.51,-.02,player);for(let x of [-.56,.56]){sphere(.21,armor,x,1.37,0,player);cylinder(.15,.16,.8,armor,x,1.02,0,player);cylinder(.16,.16,.75,dark,x*.39,.37,0,player)}sword=new THREE.Group();player.add(sword);sword.position.set(.8,1.06,.1);sword.rotation.z=-.36;box(.13,1.13,.12,blade,0,.44,0,sword);box(.45,.08,.19,goldMat,0,-.12,0,sword);cylinder(.085,.1,.42,dark,0,-.33,0,sword);clock=new THREE.Clock();window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});renderer.domElement.addEventListener('click',()=>{if(state==='playing'&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock?.()});document.addEventListener('mousemove',e=>{if(document.pointerLockElement===renderer.domElement&&state==='playing'){yaw-=e.movementX*.0025;pitch=clamp(pitch+e.movementY*.002, -.65,.9)}});document.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' ','tab'].includes(k))e.preventDefault();if(e.repeat&&['e','q','v','escape','i','u','t','1','2','3','4'].includes(k))return;keys.add(k);if(k==='escape'){pause();return}if(state!=='playing')return;if(k==='v'){camMode=camMode==='third'?'first':'third';save.settings.camera=camMode;updateUI();persist()}if(k==='e')interact();if(k==='t'){autoCombat=!autoCombat;notify(autoCombat?'Auto combat enabled':'Auto combat disabled')}if(k==='q'&&dodgeTime<=0&&stamina>=25){stamina-=25;dodgeTime=.3;invulnerable=.38;speedBoost=Math.max(speedBoost,.2)}if(k==='i')openPanel('inventory');if(k==='u')openPanel('upgrade');if('1234'.includes(k))activateSkill(Number(k)-1)});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();if(state==='playing')pause()});requestAnimationFrame(loop)}
function interact(){if(!nearby)return;let action=nearby.action;if(action==='enter'){buildDungeon();persist()}else if(action==='exit'){if(!bossDefeated){notify('Defeat the Bone Guardian before leaving!');return}save.health=Math.min(save.maxHealth,save.health+35);const earned=runGold;save.gold+=Math.round((120+35*depth)*(contract?.reward||1));gainXp(Math.round(80*depth*(contract?.reward||1)));persist();buildHub();notify(`Dungeon complete · ${earned} gold earned!`)}else if(action==='forge')openPanel('upgrade');else if(action==='craft')openPanel('inventory');else if(action==='chest'&&!nearby.opened){nearby.opened=true;nearby.g.visible=false;save.gold+=120*depth;save.gems+=1;if(Math.random()<.8)dropItem('boss');floater('TREASURE FOUND!','reward');persist();updateUI()}}
function collides(x,z){let r=.42;for(const w of walls)if(Math.abs(x-w.x)<w.w/2+r&&Math.abs(z-w.z)<w.d/2+r)return true;return false}
function attemptMove(dx,dz){let x=player.position.x,z=player.position.z;if(!collides(x+dx,z))player.position.x+=dx;if(!collides(player.position.x,z+dz))player.position.z+=dz}
function updatePlayer(dt){let x=(keys.has('d')?1:0)-(keys.has('a')?1:0),z=(keys.has('s')?1:0)-(keys.has('w')?1:0);const len=Math.hypot(x,z);if(len){x/=len;z/=len;const sprint=keys.has('shift')&&stamina>2;let v=(sprint?7.3:4.6)*(speedBoost>0?1.55:1)*(dodgeTime>0?2.3:1);attemptMove((Math.cos(yaw)*x+Math.sin(yaw)*z)*dt*v,(-Math.sin(yaw)*x+Math.cos(yaw)*z)*dt*v);if(sprint)stamina=Math.max(0,stamina-22*dt);else stamina=Math.min(100,stamina+18*dt)}else stamina=Math.min(100,stamina+26*dt);player.rotation.y=-yaw;if(camMode==='first'){player.visible=false;camera.position.set(player.position.x,1.85,player.position.z);camera.rotation.order='YXZ';camera.rotation.y=yaw;camera.rotation.x=-pitch;}else{player.visible=true;const back=6;const x=player.position.x+Math.sin(yaw)*back*Math.cos(pitch);const z=player.position.z+Math.cos(yaw)*back*Math.cos(pitch);const y=clamp(3.0+Math.sin(pitch)*back,1.6,8);let target=new THREE.Vector3(x,y,z);const start=new THREE.Vector3(player.position.x,1.65,player.position.z);const direction=target.clone().sub(start);let best=1;for(let t=.08;t<1;t+=.05){let p=start.clone().addScaledVector(direction,t);if(collides(p.x,p.z)){best=Math.max(.1,t-.08);break}}camera.position.lerp(start.addScaledVector(direction,best),Math.min(1,dt*12));camera.lookAt(player.position.x,1.52,player.position.z)}if(autoCombat&&attackTimer<=0&&world==='dungeon'&&nearestEnemy(3.1)){performAttack();attackTimer=speedBoost>0?.34:.65} }
function updateEnemies(dt){for(const e of enemies){if(!e.alive)continue;e.cool-=dt;e.attackFlash=Math.max(0,e.attackFlash-dt);const dx=player.position.x-e.x,dz=player.position.z-e.z,d=Math.hypot(dx,dz);if(d<15){if(d>e.range){let step=Math.min(d-e.range*.8,e.speed*dt);let nx=e.x+dx/d*step,nz=e.z+dz/d*step;if(!collides(nx,nz)){e.x=nx;e.z=nz}}else if(e.cool<=0){hurt(e.damage);e.cool=e.type==='boss'?1.8:1.5;e.attackFlash=.3}e.g.rotation.y=Math.atan2(dx,dz)}else{e.roam-=dt;if(e.roam<0){e.roam=rand(2,5);e.dir=rand(0,6.28)}let nx=e.x+Math.sin(e.dir)*dt*.48,nz=e.z+Math.cos(e.dir)*dt*.48;if(!collides(nx,nz)){e.x=nx;e.z=nz}}e.g.position.set(e.x,Math.sin(gameTick*2+e.x)*.03,e.z);if(e.attackFlash>0)e.g.scale.setScalar((e.type==='boss'?1.78:e.type==='brute'?1.25:1)*(1+e.attackFlash*.27))}}
function updateNearby(){nearby=null;let d=2.7;for(const i of interactables){if(i.opened)continue;const dd=Math.hypot(player.position.x-i.x,player.position.z-i.z);if(dd<Math.min(d,i.range)){d=dd;nearby=i}}$('interact').classList.toggle('hidden',!nearby);if(nearby)$('interactText').textContent=nearby.text}
function drawMap(){const c=$('minimap'),ctx=c.getContext('2d');let w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#0e1323';ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(w/2,h/2);let scale=world==='hub'?3.25:3;ctx.rotate(yaw);ctx.translate(-player.position.x*scale,-player.position.z*scale);ctx.strokeStyle='#63637f';ctx.lineWidth=2;for(const wall of walls){ctx.fillStyle='#555b70';ctx.fillRect((wall.x-wall.w/2)*scale,(wall.z-wall.d/2)*scale,wall.w*scale,wall.d*scale)}for(const e of enemies)if(e.alive){ctx.fillStyle=e.type==='boss'?'#f0af53':'#e36c80';ctx.beginPath();ctx.arc(e.x*scale,e.z*scale,e.type==='boss'?5:3,0,Math.PI*2);ctx.fill()}for(const i of interactables)if(!i.opened){ctx.fillStyle=i.action==='enter'||i.action==='exit'?'#b17df5':'#75d8b1';ctx.fillRect(i.x*scale-3,i.z*scale-3,6,6)}ctx.restore();ctx.fillStyle='#7dc8ff';ctx.beginPath();ctx.moveTo(w/2,h/2-8);ctx.lineTo(w/2-6,h/2+5);ctx.lineTo(w/2+6,h/2+5);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffffff40';ctx.strokeRect(1,1,w-2,h-2)}
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock?.getDelta()||0,.055);if(!renderer||!scene)return;if(state==='playing'){gameTick+=dt;attackTimer=Math.max(0,attackTimer-dt);invulnerable=Math.max(0,invulnerable-dt);dodgeTime=Math.max(0,dodgeTime-dt);speedBoost=Math.max(0,speedBoost-dt);for(let i=0;i<4;i++){skillCD[i]=Math.max(0,skillCD[i]-dt);$("cd"+(i+1)).textContent=skillCD[i]>0?skillCD[i].toFixed(1)+'s':['STRIKE','WHIRL','RUSH','HEAL'][i]}updatePlayer(dt);if(world==='dungeon')updateEnemies(dt);updateNearby();ambientClock+=dt;if(ambientClock>.12){ambientClock=0;drawMap()}for(let j=0;j<torches.length;j++)torches[j].f.scale.y=.85+Math.sin(gameTick*6+j*2)*.12;if(gameTick-runTime>30){runTime=gameTick;persist()}}renderer.render(scene,camera)}
function startGame(){if(!renderer)initScene();$('titleScreen').classList.add('hidden');$('hud').classList.remove('hidden');$('pauseScreen').classList.add('hidden');$('panel').classList.add('hidden');buildHub();persist()}

// DUNGEON REFORGED v0.2 — modular enhancements that preserve the v0.1 save format.
const reforged = {target:null, fps:60, frameCount:0, time:0, pulse:0, lastBossHp:0};
const carved=mat(0x656073,.94), bronze=mat(0xae8654,.58,.3), moss=mat(0x345c4d), velvet=mat(0x473050), midnight=mat(0x242c46), runeMat=new THREE.MeshStandardMaterial({color:0x9a83f0,emissive:0x4331a1,emissiveIntensity:.65});
function detailPillar(x,z,style=0){
  const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);
  cylinder(.52,.62,.32,carved,0,.16,0,g,8);cylinder(.4,.48,3.6,stone,0,2,0,g,8);
  for(let n=0;n<4;n++)cylinder(.12,.13,2.9,carved,Math.cos(n*Math.PI/2)*.31,2,Math.sin(n*Math.PI/2)*.31,g,6);
  cylinder(.64,.49,.34,bronze,0,3.91,0,g,8);
  if(style)cylinder(.25,.32,.46,runeMat,0,4.27,0,g,6);
}
function detailBanner(x,z,rot=0){
  const g=new THREE.Group();scene.add(g);g.position.set(x,2.8,z);g.rotation.y=rot;
  box(1.25,1.6,.06,velvet,0,-.72,0,g);box(1.46,.1,.2,bronze,0,.16,0,g);
  const sig=mesh(new THREE.OctahedronGeometry(.34),runeMat,g);sig.position.set(0,-.61,.08);sig.scale.y=1.55;
}
function detailRubble(x,z){
  for(let j=0;j<4;j++){const o=box(.28+rand(0,.42),.17+rand(0,.25),.25+rand(0,.36),j%2?stone:carved,x+rand(-.8,.8),.14,z+rand(-.7,.7));o.rotation.y=rand(0,6.2)}
}
function detailBrazier(x,z){
  const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);
  cylinder(.22,.38,1.0,midnight,0,.52,0,g,8);
  cylinder(.52,.25,.22,bronze,0,1.09,0,g,10);
  const ember=mesh(new THREE.OctahedronGeometry(.24),new THREE.MeshBasicMaterial({color:0xffa15f}),g);ember.position.y=1.35;
  torches.push({f:ember,l:{intensity:0}});
}


 // v0.4 THE CONTRACT UPDATE — repeatable unlocked tiers and optional challenge modifiers.
let selectedDepth=1,contract=null;
const contractTypes=[
  {key:'explorer',name:'Explorer',description:'Standard enemies and steady rewards',health:1,damage:1,speed:1,reward:1},
  {key:'veteran',name:'Veteran',description:'Enemies +45% HP and +20% damage',health:1.45,damage:1.2,speed:1,reward:1.65},
  {key:'nightmare',name:'Nightmare',description:'Enemies +90% HP, +45% damage, faster',health:1.9,damage:1.45,speed:1.12,reward:2.3}
];
const baseSpawnEnemyContract=spawnEnemy;
spawnEnemy=function(x,z,type){
  baseSpawnEnemyContract(x,z,type);
  const e=enemies[enemies.length-1];if(!e)return;
  const c=contract||contractTypes[0];
  e.hp=Math.round(e.hp*c.health);e.max=e.hp;
  e.damage=Math.round(e.damage*c.damage);e.speed*=c.speed;
};
const baseRenderPanelContract=renderPanel;
renderPanel=function(){
  if(activePanel!=='contract')return baseRenderPanelContract();
  $('panelTitle').textContent='Dungeon Contracts';
  $('panelSubtitle').textContent='CHOOSE YOUR CHALLENGE';
  const maxTier=Math.max(1,Math.min(5,Math.floor(save.depth)||1));
  selectedDepth=clamp(selectedDepth||maxTier,1,maxTier);
  const mode=contract?.key||'explorer';
  let out='<div class="notice"><b>Choose a dungeon tier and challenge.</b><p>Unlocked tiers remain replayable. Harder contracts boost rewards without resetting progress.</p></div>';
  out+='<div class="contract-heading">DUNGEON TIER</div><div class="contract-levels">';
  const names=['Forgotten Crypt','Ashen Vault','Crystal Tomb','Ancient Keep','Guardian Sanctum'];
  for(let i=1;i<=maxTier;i++)out+='<button class="contract-tier '+(selectedDepth===i?'selected':'')+'" data-contract-depth="'+i+'">TIER '+i+'<small>'+names[i-1]+'</small></button>';
  out+='</div><div class="contract-heading">CHALLENGE LEVEL</div><div class="contract-list">';
  for(const c of contractTypes)out+='<button class="contract-option '+(mode===c.key?'selected':'')+'" data-contract-mode="'+c.key+'"><span><b>'+c.name+'</b><small>'+c.description+'</small></span><strong>'+Math.round(c.reward*100)+'% REWARDS</strong></button>';
  out+='</div><div class="contract-summary">Selected: Tier '+selectedDepth+' · '+(contractTypes.find(c=>c.key===mode)?.name||'Explorer')+'</div>';
  out+='<button class="contract-start primary" id="startContractBtn">ENTER DUNGEON</button>';
  $('panelBody').innerHTML=out;
  for(const b of $('panelBody').querySelectorAll('[data-contract-depth]'))b.onclick=()=>{selectedDepth=Number(b.dataset.contractDepth);renderPanel()};
  for(const b of $('panelBody').querySelectorAll('[data-contract-mode]'))b.onclick=()=>{contract=contractTypes.find(c=>c.key===b.dataset.contractMode)||contractTypes[0];renderPanel()};
  $('startContractBtn').onclick=()=>{
    contract=contractTypes.find(c=>c.key===(contract?.key||'explorer'))||contractTypes[0];
    if(selectedDepth<1||selectedDepth>maxTier)return;
    $('panel').classList.add('hidden');activePanel='';
    buildDungeon();persist();refreshReforgedUI();
  };
};
const baseInteractContract=interact;
interact=function(){
  if(nearby?.action==='enter'){
    selectedDepth=Math.max(1,Math.min(5,Math.floor(save.depth)||1));
    contract=contractTypes[0];openPanel('contract');return;
  }
  baseInteractContract();
};

// v0.3 THE RELIC UPDATE: seeded dungeon accents, meaningful shrines and loot quality-of-life.
let runBlessing=null;
function makeShrine(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  cylinder(1.0,1.25,.42,carved,0,.21,0,g,10);
  cylinder(.62,.82,.9,stone2,0,.84,0,g,8);
  cylinder(.44,.52,.15,bronze,0,1.35,0,g,8);
  const gem=mesh(new THREE.IcosahedronGeometry(.39,1),runeMat,g);
  gem.position.y=1.98;gem.rotation.z=.5;
  const halo=mesh(new THREE.TorusGeometry(.55,.045,7,30),goldMat,g);
  halo.position.y=1.92;halo.rotation.x=Math.PI/3;
  interactables.push({x,z,range:2.8,text:'Claim a relic blessing',action:'relic',g,opened:false});
}
function buildDungeonFeatures(){
  if(rooms.length<4)return;
  // Three room variations per run. These do not change collisions or required pathways.
  for(let i=1;i<rooms.length-1;i++){
    const z=rooms[i].z;
    const theme=(Math.floor(sRand()*3)+i)%3;
    if(theme===0){
      for(const x of [-6.5,6.5])for(const dz of [-1.6,1.6]){
        const crystal=mesh(new THREE.ConeGeometry(.35,1.65,6),runeMat);
        crystal.position.set(x,.86,z+dz);
        crystal.rotation.z=(x<0?.1:-.1);
      }
    }else if(theme===1){
      for(const x of [-7.7,7.7])for(const dz of [-4,0,4]){
        const alcove=box(.32,2.3,1.35,midnight,x,1.2,z+dz);
        const marker=box(.34,.53,.31,bronze,x*1.01,2.15,z+dz);
      }
    }else{
      for(let j=0;j<4;j++){
        const x=j%2===0?-6.4:6.4, dz=(j<2?-3.4:3.4);
        detailRubble(x,z+dz);
      }
    }
  }
  const shrineRoom=1+Math.floor(sRand()*Math.max(1,rooms.length-3));
  const side=(sRand()>.5?1:-1);
  makeShrine(side*4.3,rooms[shrineRoom].z-1.9);
  if(rooms.length>=5){
    const x=-side*4.8,z=rooms[2].z+3;
    const standard=mesh(new THREE.CylinderGeometry(.06,.06,2.45,6),bronze);
    standard.position.set(x,1.2,z);
    const flag=box(.85,1.25,.08,velvet,x,2.0,z);
    const emblem=mesh(new THREE.OctahedronGeometry(.21),goldMat);
    emblem.position.set(x,2.0,z+.1);
  }
}
const oldInteractRelic=interact;
interact=function(){
  if(nearby?.action==='relic'&&!nearby.opened){
    const shrine=nearby;
    shrine.opened=true;
    shrine.g.visible=false;
    const blessings=[
      {name:'Fury of the Ancients',damage:Math.max(5,Math.round(calcAttack()*.18)),loot:0,guard:1},
      {name:'Guardian Ward',damage:0,loot:0,guard:.70},
      {name:'Treasure Seeker',damage:0,loot:.12,guard:1},
      {name:'Renewal',damage:0,loot:0,guard:1,heal:.45}
    ];
    const picked=blessings[Math.floor(Math.random()*blessings.length)];
    runBlessing=picked;
    if(picked.heal)save.health=Math.min(save.maxHealth,save.health+Math.round(save.maxHealth*picked.heal));
    notify('RELIC BLESSING: '+picked.name+' · Active until you leave');
    floater('✦ RELIC AWAKENED','reward');
    updateUI();refreshReforgedUI();
    return;
  }
  oldInteractRelic();
};
const oldRenderPanelRelic=renderPanel;
renderPanel=function(){
  oldRenderPanelRelic();
  if(activePanel!=='inventory'||panelTab!=='inventory')return;
  const root=$('panelBody');
  if(!root||root.querySelector('[data-salvage-all]'))return;
  const section=document.createElement('div');section.className='relic-tools';
  const common=save.inventory.filter(i=>i.tier<=1&&save.equipped[i.slot]!==i.id);
  section.innerHTML='<div><b>Loot Management</b><p>Safely sell unused Common and Uncommon equipment. Equipped gear and Rare+ items are protected.</p></div><button data-salvage-all '+(common.length?'':'disabled')+'>SELL '+common.length+' LOW-TIER ITEMS</button>';
  root.insertBefore(section,root.querySelector('.item-grid'));
  section.querySelector('[data-salvage-all]').onclick=()=>{
    const candidates=save.inventory.filter(i=>i.tier<=1&&save.equipped[i.slot]!==i.id);
    if(!candidates.length)return;
    const value=candidates.reduce((a,i)=>a+Math.round(((Number(i.power)||0)+(Number(i.bonus)||0))*8*(tiers[i.tier]?.scale||1)),0);
    if(!confirm('Sell '+candidates.length+' low-tier items for '+value.toLocaleString()+' gold?'))return;
    const ids=new Set(candidates.map(i=>i.id));
    save.inventory=save.inventory.filter(i=>!ids.has(i.id));
    save.gold+=value;
    persist();updateUI();renderPanel();notify('Sold '+candidates.length+' items for '+value.toLocaleString()+' gold');
  };
};

const oldBuildHub=buildHub;
buildHub=function(){
  oldBuildHub();
  runBlessing=null;
  contract=null;
  for(const x of [-15,-9,9,15])for(const z of [-16,16])detailPillar(x,z);
  for(const z of [-21,21])for(const x of [-12,0,12])detailBanner(x,z,z<0?0:Math.PI);
  for(let i=0;i<8;i++)detailRubble(rand(-17,17),rand(-17,17));
  for(const x of [-9,9])for(const z of [-10,10])detailBrazier(x,z);
  scene.fog.density=.019;
  renderer.toneMappingExposure=1.25;
  refreshReforgedUI();
};
const oldBuildDungeon=buildDungeon;
buildDungeon=function(){
  oldBuildDungeon();
  scene.fog.density=.028;
  const variant=Math.floor(sRand()*4);
  for(let i=0;i<rooms.length;i++){
    const z=rooms[i].z;
    for(const x of [-7.45,7.45])for(const dz of [-5.3,5.3])detailPillar(x,z+dz,i===rooms.length-1);
    for(const x of [-8.38,8.38])detailBanner(x,z+(i%2?1.5:-1.5),x<0?Math.PI/2:-Math.PI/2);
    if(i>0){for(const x of [-5.9,5.9])detailRubble(x,z+4.0);if(i%2===0)detailBrazier(-5,z-3);}
    const center=mesh(new THREE.RingGeometry(1.35+i*.08,1.42+i*.08,32),i===rooms.length-1?goldMat:runeMat);
    center.rotation.x=-Math.PI/2;center.position.set(0,.032,z);scene.add(center);
    for(let j=0;j<4;j++){
      const x=(j%2?1:-1)*(7.8+variant*.08), zz=z+(j<2?-3:3);
      const trim=box(.12,.07,4.3,bronze,x,.04,zz);
      trim.rotation.y=0;
    }
  }
  for(let n=0;n<3;n++)spawnChestSide(n);
  buildDungeonFeatures();
  refreshReforgedUI();
};
function spawnChestSide(n){
  if(n>=rooms.length-2||n===0)return;
  const z=rooms[n].z, x=n%2===0?-5.3:5.3;
  if(sRand()>.55)spawnChest(x,z+1.8);
}
const oldSpawnEnemy=spawnEnemy;
spawnEnemy=function(x,z,type){
  if(type!=='boss'&&type==='skeleton'&&sRand()>.66)type='archer';
  oldSpawnEnemy(x,z,type);
  const e=enemies[enemies.length-1],g=e.g;
  // Layered clothing, armour trim, boots and eye sockets replace toy-like silhouettes.
  const plate=mat(type==='boss'?0x66516f:type==='brute'?0x6c6467:0x435267,.7,.3);
  box(.82,.31,.59,plate,0,1.31,0,g);
  box(.44,.07,.65,bronze,0,1.01,.01,g);
  for(const sx of [-1,1]){
    const pauldron=mesh(new THREE.DodecahedronGeometry(.27),plate,g);pauldron.position.set(sx*.55,1.34,0);
    box(.24,.38,.36,midnight,sx*.23,.25,0,g);
    const socket=box(.115,.07,.09,new THREE.MeshBasicMaterial({color:type==='boss'?0xff6179:0xe1c399}),sx*.13,1.73,.285,g);
    socket.rotation.z=sx*.1;
  }
  const cloak=box(.85,.96,.12,type==='boss'?velvet:midnight,0,.91,-.35,g);cloak.rotation.x=.12;
  if(type==='boss'){
    for(let i=0;i<5;i++){const angle=i/5*Math.PI*2;const spike=mesh(new THREE.ConeGeometry(.13,.46,5),bronze,g);spike.position.set(Math.cos(angle)*.33,2.12,Math.sin(angle)*.32)}
    const halo=mesh(new THREE.TorusGeometry(.85,.035,6,24),runeMat,g);halo.rotation.x=Math.PI/2;halo.position.y=1.55;
  }
  if(type==='archer'){e.speed=2.1;e.range=7.0;e.damage*=.85;}
  e.windup=0;e.targetX=0;e.targetZ=0;e.stunned=0;e.phase=0;
  e.warning=mesh(new THREE.RingGeometry(.6,type==='boss'?3.4:1.75,32),new THREE.MeshBasicMaterial({color:type==='boss'?0xff554d:0xe9a65b,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));
  e.warning.rotation.x=-Math.PI/2;e.warning.position.set(x,.065,z);
};
const oldClearWorld=clearWorld;
clearWorld=function(){oldClearWorld();reforged.target=null};
const oldDamageEnemy=damageEnemy;
damageEnemy=function(e,n,critChance=.12){
  if(e?.alive){e.stunned=Math.max(e.stunned||0,.13);reforged.target=e;}
  oldDamageEnemy(e,n,critChance);
  if(e?.alive){
    e.g.traverse(child=>{if(child.isMesh&&child.material&&child.material.emissive&&child.material!==runeMat){child.userData.flashUntil=gameTick+.11}});
  }
};
const oldPerformAttack=performAttack;
performAttack=function(){
  const e=nearestEnemy(3.15);
  if(!e)return;
  oldPerformAttack();
  const slash=mesh(new THREE.TorusGeometry(1.05,.045,5,24,Math.PI*1.16),new THREE.MeshBasicMaterial({color:0xa8dafe,transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false}));
  const angle=Math.atan2(e.x-player.position.x,e.z-player.position.z);
  slash.position.set(player.position.x+Math.sin(angle)*1.3,1.34,player.position.z+Math.cos(angle)*1.3);
  slash.rotation.y=angle;effects.push({g:slash,time:.19,initial:.19});
};
const oldActivateSkill=activateSkill;
activateSkill=function(n){
  const old=skillCD[n];oldActivateSkill(n);
  if(skillCD[n]<=old)return;
  const color=[0xffd49a,0xa48dff,0x72cfff,0x74e3a7][n];
  const ring=mesh(new THREE.RingGeometry(.75,1,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.set(player.position.x,.11,player.position.z);
  effects.push({g:ring,time:.48,initial:.48,expand:true});
};
const oldDefeatEnemy=defeatEnemy;
defeatEnemy=function(e){
  oldDefeatEnemy(e);
  if(e.type==='boss'){notify('BONE GUARDIAN VANQUISHED · NEW DEPTH UNLOCKED!');}
  refreshReforgedUI();
};
function refreshReforgedUI(){
  const contractLabel=$('contractLabel');if(contractLabel)contractLabel.textContent=world==='dungeon' ? 'TIER '+depth+' · '+(contract?.name||'EXPLORER').toUpperCase()+' · '+Math.round((contract?.reward||1)*100)+'% REWARDS' : 'CHOOSE YOUR NEXT CONTRACT';
  const status=$('blessingLabel'); if(status)status.textContent=runBlessing ? '✦ '+runBlessing.name.toUpperCase() : 'NO ACTIVE BLESSING';
  const node=$('staminaFill');if(node)node.style.width=stamina.toFixed(0)+'%';
  const auto=$('autoLabel');if(auto)auto.textContent=autoCombat?'AUTO ATTACK: ON':'AUTO ATTACK: OFF';
  const mastery=$('masteryLabel');if(mastery)mastery.textContent='MASTERY '+(save.mastery||0);
  const panel=$('bossPanel'),boss=enemies.find(e=>e.type==='boss'&&e.alive);
  if(panel){panel.classList.toggle('hidden',world!=='dungeon'||!boss);if(boss){$('bossBarFill').style.width=(100*Math.max(0,boss.hp)/boss.max).toFixed(1)+'%';$('bossHpText').textContent=Math.ceil(boss.hp)+' / '+Math.ceil(boss.max);}}
  const target=$('targetPanel'),e=reforged.target;
  if(target){const shown=world==='dungeon'&&e?.alive&&e.type!=='boss';target.classList.toggle('hidden',!shown);
    if(shown){$('targetName').textContent=e.type==='archer'?'BONE ARCHER':e.type==='brute'?'CRYPT BRUTE':'RESTLESS SKELETON';$('targetFill').style.width=(100*Math.max(0,e.hp)/e.max).toFixed(1)+'%';}
  }
}
function updateEnemyAI(dt){
  const px=player.position.x,pz=player.position.z;
  for(const e of enemies){
    if(!e.alive)continue;
    const dx=px-e.x,dz=pz-e.z,d=Math.max(.001,Math.hypot(dx,dz));
    e.cool=Math.max(0,e.cool-dt);
    e.stunned=Math.max(0,(e.stunned||0)-dt);
    e.attackFlash=Math.max(0,e.attackFlash-dt);
    if(e.type==='boss'&&e.hp<e.max*.5&&e.phase===0){e.phase=1;e.speed*=1.2;e.damage*=1.25;notify('THE GUARDIAN ENTERS PHASE TWO!')}
    if(e.windup>0){
      e.windup-=dt;
      const opacity=Math.min(.65, .12+.53*(1-e.windup/(e.type==='boss'?.95:.6)));
      e.warning.material.opacity=opacity;
      e.warning.position.set(e.targetX,.055,e.targetZ);
      e.warning.scale.setScalar(e.type==='boss'?1.1:1);
      if(e.windup<=0){
        e.warning.material.opacity=0;
        const targetDist=Math.hypot(px-e.targetX,pz-e.targetZ);
        if(targetDist<(e.type==='boss'?3.3:e.type==='archer'?1.15:1.7))hurt(e.damage);
        e.cool=e.type==='boss'?(e.phase?1.25:1.8):e.type==='archer'?2.15:1.35;
        e.attackFlash=.21;
      }
    }else if(e.stunned<=0&&d<16){
      if(d>e.range){
        const step=Math.min(d-e.range*.8,e.speed*dt),nx=e.x+dx/d*step,nz=e.z+dz/d*step;
        if(!collides(nx,nz)){e.x=nx;e.z=nz;}
      }else if(e.cool<=0){
        e.windup=e.type==='boss'?.95:e.type==='archer'?.85:.6;
        e.targetX=e.type==='archer'?px:e.x+dx/d*Math.min(d,e.type==='boss'?2.5:1.1);
        e.targetZ=e.type==='archer'?pz:e.z+dz/d*Math.min(d,e.type==='boss'?2.5:1.1);
        if(e.type==='archer'){e.warning.geometry.dispose();e.warning.geometry=new THREE.RingGeometry(.25,1.15,32);}
        e.warning.position.set(e.targetX,.06,e.targetZ);e.warning.material.opacity=.19;
      }
      e.g.rotation.y=Math.atan2(dx,dz);
    }else if(d>=16){
      e.roam-=dt;
      if(e.roam<0){e.roam=rand(2,5);e.dir=rand(0,6.28)}
      const nx=e.x+Math.sin(e.dir)*dt*.35,nz=e.z+Math.cos(e.dir)*dt*.35;
      if(!collides(nx,nz)){e.x=nx;e.z=nz;}
    }
    e.g.position.set(e.x,Math.sin(gameTick*2.6+e.x)*.045,e.z);
    const scale=e.type==='boss'?1.78:e.type==='brute'?1.25:1;
    e.g.scale.setScalar(scale*(1+e.attackFlash*.09));
    const warn=e.windup>0?1:0;
    e.g.rotation.z=warn?Math.sin(gameTick*19)*.04:0;
  }
}
updateEnemies=updateEnemyAI;
const oldLoop=loop;
loop=function(){
  // Replaced animation entry-point retains the v0.1 scene and combat pipeline.
  requestAnimationFrame(loop);
  const dt=Math.min(clock?.getDelta()||0,.045);
  if(!renderer||!scene)return;
  if(state==='playing'){
    gameTick+=dt;reforged.time+=dt;reforged.frameCount++;
    if(reforged.time>=1){reforged.fps=Math.round(reforged.frameCount/reforged.time);reforged.time=0;reforged.frameCount=0;const el=$('fpsLabel');if(el)el.textContent=reforged.fps+' FPS';}
    attackTimer=Math.max(0,attackTimer-dt);invulnerable=Math.max(0,invulnerable-dt);dodgeTime=Math.max(0,dodgeTime-dt);speedBoost=Math.max(0,speedBoost-dt);
    for(let i=0;i<4;i++){skillCD[i]=Math.max(0,skillCD[i]-dt);$('cd'+(i+1)).textContent=skillCD[i]>0?skillCD[i].toFixed(1)+'s':['STRIKE','WHIRL','RUSH','HEAL'][i];}
    updatePlayer(dt);if(world==='dungeon')updateEnemies(dt);updateNearby();
    ambientClock+=dt;if(ambientClock>.12){ambientClock=0;drawMap();refreshReforgedUI();}
    for(let j=0;j<torches.length;j++)torches[j].f.scale.y=.85+Math.sin(gameTick*6+j*2)*.12;
    for(let i=effects.length-1;i>=0;i--){const fx=effects[i];fx.time-=dt;fx.g.material.opacity=Math.max(0,fx.time/fx.initial)*.85;if(fx.expand)fx.g.scale.setScalar(1+(1-fx.time/fx.initial)*5);if(fx.time<=0){scene.remove(fx.g);fx.g.geometry.dispose();fx.g.material.dispose();effects.splice(i,1)}}
    if(gameTick-runTime>30){runTime=gameTick;persist();}
  }
  renderer.render(scene,camera);
};
const oldInitScene=initScene;
initScene=function(){
  oldInitScene();
  const torso=box(.43,.52,.2,bronze,0,1.12,.42,player);
  const crest=mesh(new THREE.OctahedronGeometry(.19),runeMat,player);crest.position.set(0,1.37,.54);
  for(const sx of [-1,1]){
    const pad=mesh(new THREE.DodecahedronGeometry(.28),midnight,player);pad.position.set(sx*.52,1.42,0);
    box(.26,.35,.42,bronze,sx*.38,.32,.06,player);
  }
  const cape=box(.88,1.3,.12,velvet,0,.95,-.39,player);cape.rotation.x=.12;
  const helm=mesh(new THREE.ConeGeometry(.36,.43,7),bronze,player);helm.position.set(0,2.23,0);
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35));
  // The player can choose performance preferences without breaking the original settings.
  const existing=save.settings?.quality||'medium';
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,existing==='low'?1:existing==='high'?1.5:1.25));
};

$('playBtn').onclick=startGame;$('resetFromTitle').onclick=()=>{if(confirm('Erase ALL progress on this browser? This cannot be undone unless you have exported a backup.')){save=defaultSave();persist();notify('Save reset')}};$('closePanel').onclick=closePanel;$('resumeBtn').onclick=pause;$('inventoryBtn').onclick=()=>openPanel('inventory');$('upgradesBtn').onclick=()=>openPanel('upgrade');$('helpBtn').onclick=()=>openPanel('help');$('saveBtn').onclick=()=>{persist();notify('Saved successfully')};$('quitBtn').onclick=()=>{persist();$('pauseScreen').classList.add('hidden');$('hud').classList.add('hidden');$('titleScreen').classList.remove('hidden');state='title'};$('exportBtn').onclick=()=>{persist();const blob=new Blob([JSON.stringify(save,null,2)],{type:'application/json'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`dungeon-ascension-save-level-${save.level}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),500)};$('importInput').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>500000)throw Error('File too large');const data=JSON.parse(await file.text());if(!data||data.version!==VERSION||!Array.isArray(data.inventory)||typeof data.level!=='number')throw Error('Invalid save format');const s=cleanSave(data);if(!s)throw Error('Invalid save');if(confirm(`Load Level ${s.level} save? This replaces current progress.`)){save=s;persist();$('pauseScreen').classList.add('hidden');buildHub();notify('Save imported successfully!')}}catch(err){alert(`Could not import save: ${err.message}`)}e.target.value=''};
// Render a decorative 3D title backdrop so first load isn't a blank screen.
const style=document.createElement('style');style.textContent='#game{background:linear-gradient(140deg,#12192b,#121421)}';document.head.appendChild(style);