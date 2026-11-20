import assert from 'node:assert/strict';
import { mobileControls, movementAxes } from '../src/input.js';
assert.equal(mobileControls({touchPoints:5,coarse:true,fine:false,mobile:true}),true);
assert.equal(mobileControls({touchPoints:5,coarse:false,fine:true,mobile:false}),false);
assert.equal(mobileControls({touchPoints:0,coarse:false,fine:true}),false);
assert.deepEqual(movementAxes({keyw:true,keyd:true}),{x:1,y:1});
assert.deepEqual(movementAxes({keyw:true,keys:true}),{x:0,y:0});
assert.deepEqual(movementAxes({arrowleft:true,arrowdown:true}),{x:-1,y:-1});
console.log('PASS device selection and physical key movement axes.');
