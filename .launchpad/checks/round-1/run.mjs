import { harness, check } from './lib/harness.mjs';
import { entry, succeeds } from './lib/entry.mjs';
import { homedir, platform } from 'node:os';
const { test, done } = harness();
let buildError;
try { await succeeds(entry('npm', ['run','build'], { timeoutMs:60000 }), []); } catch(e) { buildError=e; }
const browsers = process.env.PLAYWRIGHT_BROWSERS_PATH || (process.env.LAUNCHPAD_SANDBOXED ? '/ms-playwright' : platform()==='darwin' ? homedir()+'/Library/Caches/ms-playwright' : homedir()+'/.cache/ms-playwright');
async function probe(mode) {
  if(buildError) throw buildError;
  const r=await succeeds(entry('node',['.launchpad/checks/round-1/probe.mjs',mode],{timeoutMs:25000,maxBytes:100000,env:{PLAYWRIGHT_BROWSERS_PATH:browsers}}),[]);
  const o=JSON.parse(r.out);
  check(o.control.colors>=8 && o.control.opaque===o.control.count,'Valid input must render an opaque, non-uniform artwork (at least 8 RGBA colors)');
  return o;
}
await test('renders opaque non-uniform frames at different canvas sizes',async()=>{
 const o=await probe('render');check(o.frames.every(f=>f.colors>=8&&f.opaque===f.count),'Both sizes must contain opaque artwork');
});
await test('reproduces identical pixels after other seeds and times',async()=>{
 const o=await probe('repeat');check(new Set(o.hashes).size===1,'The same inputs must reproduce pixels regardless of call history');
});
await test('changes the artwork across distinct animation times',async()=>{
 const o=await probe('motion');check(new Set(o.hashes).size===4,'Frames at 0, 731, 2137 and 5039 ms must differ');
});
await test('changes the artwork when the seed changes',async()=>{
 const o=await probe('seed');check(new Set(o.hashes).size===2,'Different valid seeds must produce different frames');
});
await test('aligns corner and neighbouring slice crops with the whole machine',async()=>{
 const o=await probe('crops');check(o.crops.every(c=>c.changed/c.channels<=0.005),'Crops must match full frame at scale 1; 2px inset, channel tolerance 2, at most 0.5% differing channels: '+JSON.stringify(o.crops));
});
for(const [mode,name] of [['seed-validation','rejects malformed seeds after rendering a valid seed'],['time-validation','rejects negative nonfinite and nonnumeric times after a valid time'],['viewport-validation','rejects invalid or out-of-bounds viewports after a valid viewport']]) {
 await test(name,async()=>{const o=await probe(mode);check(o.errors.every(e=>typeof e==='string'&&e.trim().length>0),'Every invalid argument must throw an Error with a reason');});
}
await test('plays and pauses the visible artwork',async()=>{const o=await probe('controls');check(Object.values(o.controls).every(Boolean),'Play must advance frames and Pause must hold them');});
await test('scrubs to repeatable visible frames',async()=>{const o=await probe('scrub');check(o.scrub.changes&&o.scrub.repeats,'Time control must change frames and reproduce a previous time');});
await test('applies preview seeds reproducibly in the viewer',async()=>{const o=await probe('seed-control');check(o.seedControl.changes&&o.seedControl.repeats,'Seed control must change the work and reproduce an earlier seed');});
await test('renders without external requests or uncaught browser errors',async()=>{const o=await probe('render');check(o.external.length===0&&o.pageErrors.length===0,JSON.stringify({external:o.external,errors:o.pageErrors}));});
done();
