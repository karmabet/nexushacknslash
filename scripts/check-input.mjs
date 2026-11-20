import assert from 'node:assert/strict';
import { mobileControls, movementAxes } from '../src/input.js';
assert.equal(mobileControls({touchPoints:5,coarse:true,fine:false,mobile:true}),true);
assert.equal(mobileControls({touchPoints:5,coarse:false,fine:true,mobile:false}),false);
assert.equal(mobileControls({touchPoints:0,coarse:false,fine:true}),false);
assert.deepEqual(movementAxes({keyw:true,keyd:true}),{x:1,y:1});
assert.deepEqual(movementAxes({keyw:true,keys:true}),{x:0,y:0});
assert.deepEqual(movementAxes({arrowleft:true,arrowdown:true}),{x:-1,y:-1});
console.log('PASS device selection and physical key movement axes.');

import { difficultyFor } from '../src/difficulty.js';
assert.deepEqual(difficultyFor(0,0),{tier:0,enemies:7,speed:1,chaseRange:45});
assert.equal(difficultyFor(45,0).enemies,9);assert.equal(difficultyFor(0,15).enemies,9);
assert.equal(difficultyFor(90,30).enemies,11);assert.equal(difficultyFor(999999,999999).enemies,19);
assert(Math.abs(difficultyFor(999999,0).speed-1.36)<1e-9);
console.log('PASS active-time/score escalation, reset and bounded reinforcement/speed.');
