import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const game=readFileSync(new URL('../game.js',import.meta.url),'utf8');
const page=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../style.css',import.meta.url),'utf8');

test('all JavaScript modules pass syntax checks',async()=>{
  const {spawnSync}=await import('node:child_process');
  for(const file of ['game.js','combat-math.mjs']){
    const out=spawnSync(process.execPath,['--check',new URL('../'+file,import.meta.url).pathname],{encoding:'utf8'});
    assert.equal(out.status,0,file+' '+out.stderr);
  }
});
test('legacy saves and combat repair remain intact',()=>{
  assert.match(game,/SAVE_KEY='dungeon-ascension-v0\.1'/);
  assert.match(game,/const VERSION=1/);
  assert.match(game,/function updateEnemyAI/);
  assert.match(game,/chaseStep\(e\.x,e\.z,px,pz/);
  assert.match(game,/hitsWarning\(px,pz,e\.targetX,e\.targetZ,radius\)/);
  assert.match(game,/eliteHunt/);
});
test('new visual effects are optional and pooled',()=>{
  for(const symbol of ['ascendTextures','ascendVaultDetail','ascendAmbient','ascendParticles','ascendLights','ascendAnimateWorld','ascendHeroDetails']) assert.ok(game.includes('function '+symbol),symbol);
  assert.match(game,/save\.settings\.quality==='low'\?5/);
  assert.match(game,/if\(effects\.length>70\)return/);
  assert.match(game,/scene\.remove\(ascend\.embers\)/);
  assert.match(game,/ascend\.embers\.geometry\.dispose\(\)/);
});
test('UI additions and controls are present',()=>{
  for(const id of ['cinematicFlash','victoryBanner','treasureToast','qualityNotice','visualZone','qualityBtn','modelsBtn','eliteHuntPanel']){
    assert.ok(page.includes('id="'+id+'"'),id);
  }
  assert.match(page,/src="game\.js"/);
  assert.match(page,/WAYFINDER · v1\.2\.0/);
  assert.match(css,/#victoryBanner\.show/);
  assert.match(css,/#treasureToast\.show/);
  assert.match(css,/prefers-reduced-motion/);
});

test('v1.1 lighting and non-blocky equipment geometry are wired',()=>{
  for(const sym of ['shapedBlade','shapedKnight','enhanceEnemyShape','visibleStoneLighting','curvedPlateShape']){
    assert.ok(game.includes('function '+sym+'('),sym);
  }
  assert.match(game,/new THREE\.ExtrudeGeometry\(shape/);
  assert.match(game,/new THREE\.LatheGeometry\(/);
  assert.match(game,/new THREE\.PointLight\(0xffdbab/);
  assert.match(game,/new THREE\.DirectionalLight\(0x90b9ee/);
  assert.match(game,/luminous\.follow\.position\.set\(player\.position\.x/);
  assert.match(page,/WAYFINDER · v1\.2\.0/);
  assert.match(css,/#vignette\{background:radial-gradient\(ellipse 90%/);
});

test('v1.2 compass and danger outline are wired without replacing combat AI',()=>{
 for(const id of ['directionArrow','directionLabel','directionDistance'])assert.ok(page.includes('id="'+id+'"'),id);
 for(const fn of ['wayfinderObjective','updateWayfinder','assignWarningOutline','updateWarningOutlines','updateSwordFollowThrough'])assert.ok(game.includes('function '+fn+'('),fn);
 assert.match(game,/attackRadius\(e\.type,e\.attackStyle\)/);
 assert.match(game,/objectiveBearing\(player\.position\.x,player\.position\.z/);
 assert.match(game,/const beforeWayfinderEnemies=updateEnemies/);
 assert.match(css,/#directionArrow/);
});
