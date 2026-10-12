import test from 'node:test';import assert from 'node:assert/strict';
import {wholeNumberStep} from '../src/utils/numericStep.ts';
test('whole-unit steps preserve decimal precision without floating point drift',()=>{
 for(const value of ['12.50','0.01','17.123456789','999.99']){const up=wholeNumberStep(value,1)!;assert.equal(wholeNumberStep(up,-1),value);}
 assert.equal(wholeNumberStep('12.50',1),'13.50');assert.equal(wholeNumberStep('12.50',-1),'11.50');assert.equal(wholeNumberStep('-0.25',1,-100),'0.75');
});
test('empty inputs, boundaries and invalid numbers remain safe',()=>{
 assert.equal(wholeNumberStep('',1),'1');assert.equal(wholeNumberStep('0.25',-1),'0');assert.equal(wholeNumberStep('99.75',1,0,100),'100');
 for(const value of ['abc','1.2.3','Infinity','NaN'])assert.equal(wholeNumberStep(value,1),null);
 assert.equal(wholeNumberStep('2.',1),'3.');
});
