import assert from 'node:assert';
import rawData from '../data.js';
import { deepFill } from '../src/lib/content.ts';

const siteData = rawData.default || rawData;

console.log('Testing deepFill logic:');

// Test 1: object hydration with missing keys
const defaultObj = { a: 1, b: { c: 2, d: 3 }, arr: [1, 2] };
const overrideObj = { b: { c: 99 } }; // missing 'a', 'b.d', and 'arr'
const filled = deepFill(defaultObj, overrideObj);

assert.strictEqual(filled.a, 1, 'Missing root key filled from default');
assert.strictEqual(filled.b.c, 99, 'Overridden nested key kept');
assert.strictEqual(filled.b.d, 3, 'Missing nested key filled from default');
assert.deepStrictEqual(filled.arr, [1, 2], 'Missing array filled from default');

// Test 2: override array is taken as-is
const arrOverride = { arr: [9, 8, 7] };
const filledArr = deepFill(defaultObj, arrOverride);
assert.deepStrictEqual(filledArr.arr, [9, 8, 7], 'Override array taken as-is');

// Test 3: siteData verification
console.log('Current site.name from data.js:', siteData.site.name);
console.log('Current site.tagline from data.js:', siteData.site.tagline);
assert.strictEqual(siteData.site.name, 'THINK MIT');
assert.strictEqual(typeof siteData.site.tagline, 'string');

console.log('All content system tests PASSED successfully.');
