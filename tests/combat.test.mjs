import test from 'node:test';
import assert from 'node:assert/strict';
import {attackRadius,chaseStep,hitsWarning,stopDistance,moveAwayFromPlayer} from '../combat-math.mjs';

test('Nightmare speed cannot overshoot player or stop radius',()=>{
  let x=-10,z=0;
  for(let frame=0;frame<1000;frame++){
    ({x,z}=chaseStep(x,z,0,0,3.5,0.045,stopDistance('skeleton')));
    assert.ok(x<=-1.65+1e-9,'chaser ran past stop radius');
  }
  assert.ok(Math.abs(x+1.65)<1e-8);
});
test('large frame hitch cannot tunnel through target',()=>{
  const p=chaseStep(-3,0,0,0,32,.9,1.65);
  assert.equal(p.x,-1.65);
});
test('archer stops far from player',()=>{
  const p=chaseStep(-10,0,0,0,3,.9,stopDistance('archer'));
  assert.equal(p.x,-7.3);
});
test('hit checks use the warning centre and matching radius',()=>{
  assert.equal(hitsWarning(0,0,0,0,attackRadius('brute')),true);
  assert.equal(hitsWarning(1.71,0,0,0,attackRadius('brute')),false);
  assert.equal(hitsWarning(4.15,0,0,0,attackRadius('boss','shockwave')),true);
  assert.equal(hitsWarning(4.3,0,0,0,attackRadius('boss','shockwave')),false);
});
test('player/enemy overlap is separated',()=>{
  const p=moveAwayFromPlayer(0.2,0,0,0,.95);
  assert.ok(Math.abs(p.x-.95)<1e-9);
});
