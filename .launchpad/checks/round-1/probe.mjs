// Trusted browser driver. Entry code executes only in this child process/browser.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
const { chromium } = createRequire(process.cwd() + '/package.json')('playwright');
const mode = process.argv[2];
const port = await new Promise((resolve, reject) => {
  const s = createServer().once('error', reject).listen(0, '127.0.0.1', () => {
    const port = s.address().port; s.close(() => resolve(port));
  });
});
const server = spawn(process.execPath, ['server.mjs', '--port', String(port)], { env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
let logs = ''; for (const stream of [server.stdout, server.stderr]) stream.on('data', d => { logs = (logs + d).slice(-2000); });
let browser;
try {
  const url = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let i = 0; i < 50; i++) {
    if (server.exitCode !== null) throw new Error('Server exited before listening: ' + logs);
    try { if ((await fetch(url, { signal: AbortSignal.timeout(500) })).ok) { ready = true; break; } } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  if (!ready) throw new Error('Server did not become ready: ' + logs);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage(); page.setDefaultTimeout(5000);
  const external = [], errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', route => {
    const u = route.request().url();
    if (u.startsWith(url + '/') || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
    external.push(u); return route.abort();
  });
  await page.goto(url);
  // A functional render is the positive control for every behaviour, including refusals.
  const result = await page.evaluate(async (mode) => {
    const { renderFrame } = await import('/dist/runtime.js');
    const a = '0x' + '11'.repeat(32), b = '0x' + 'ab'.repeat(32);
    const full = { x: 0, y: 0, width: 2000, height: 2000 };
    const digest = async data => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', data))).map(x => x.toString(16).padStart(2,'0')).join('');
    async function frame(seed = a, timeMs = 0, viewport = full, width = 200, height = 200, canvas) {
      const c = canvas || document.createElement('canvas'); c.width = width; c.height = height;
      renderFrame(c, { seed, timeMs, viewport });
      const pixels = c.getContext('2d').getImageData(0, 0, width, height).data;
      const colors = new Set(); let opaque = 0;
      for (let i=0;i<pixels.length;i+=4) { colors.add(`${pixels[i]},${pixels[i+1]},${pixels[i+2]},${pixels[i+3]}`); if (pixels[i+3] === 255) opaque++; }
      return { hash: await digest(pixels), colors: colors.size, opaque, count: width*height };
    }
    const control = await frame();
    const out = { control };
    if (mode === 'render') out.frames = [await frame(a,0,full,128,128),await frame(a,0,full,512,512)];
    if (mode === 'repeat') {
      const c = document.createElement('canvas');
      const first = await frame(a,1234,full,200,200,c);
      await frame(b,7890,full,200,200,c);
      out.hashes = [first.hash,(await frame(a,1234,full,200,200,c)).hash,(await frame(a,1234)).hash];
    }
    if (mode === 'motion') out.hashes = await Promise.all([0,731,2137,5039].map(async t => (await frame(a,t)).hash));
    if (mode === 'seed') out.hashes = [(await frame(a,1234)).hash,(await frame(b,1234)).hash];
    if (mode === 'crops') {
      const world = document.createElement('canvas'); world.width=world.height=2000;
      renderFrame(world, { seed:a,timeMs:1731,viewport:full });
      out.crops = [];
      for (const [x,y] of [[0,0],[1950,0],[0,1920],[1950,1920],[950,960],[1000,960],[950,1040],[1000,1040]]) {
        const c=document.createElement('canvas'); c.width=50;c.height=80;
        renderFrame(c,{seed:a,timeMs:1731,viewport:{x,y,width:50,height:80}});
        const actual=c.getContext('2d').getImageData(2,2,46,76).data;
        const expected=world.getContext('2d').getImageData(x+2,y+2,46,76).data;
        let changed=0;for(let i=0;i<actual.length;i++) if(Math.abs(actual[i]-expected[i])>2) changed++;
        out.crops.push({x,y,changed,channels:actual.length});
      }
    }
    if (mode === 'seed-validation' || mode === 'time-validation' || mode === 'viewport-validation') {
      const cases = mode === 'seed-validation' ? ['', '0x12', '0x'+'gg'.repeat(32), 17, null] : mode === 'time-validation' ? [-1, NaN, Infinity, '10', null] : [null, {x:-1,y:0,width:50,height:80},{x:0,y:0,width:0,height:80},{x:0,y:0,width:50,height:-1},{x:1990,y:0,width:50,height:80},{x:0,y:1990,width:50,height:80},{x:NaN,y:0,width:50,height:80},{x:0,y:0,width:Infinity,height:80},{x:'0',y:0,width:50,height:80}];
      const key = mode === 'seed-validation' ? 'seed' : mode === 'time-validation' ? 'timeMs' : 'viewport';
      out.errors = cases.map(value => {
        const c=document.createElement('canvas'); c.width=c.height=100;
        try { renderFrame(c, {seed:a,timeMs:0,viewport:full,[key]:value}); return ''; }
        catch(e) { return e instanceof Error ? e.message : ''; }
      });
    }
    return out;
  }, mode);
  const canvasHash = () => page.locator('#artwork').evaluate(c => c.toDataURL());
  if (mode === 'controls') {
    await page.locator('#pause').click();
    const before = await canvasHash(); await page.waitForTimeout(160); const paused = await canvasHash();
    await page.locator('#play').click(); await page.waitForTimeout(250); const playing = await canvasHash();
    await page.locator('#pause').click(); await page.waitForTimeout(50); const stop = await canvasHash();
    await page.waitForTimeout(160); const stopped = await canvasHash();
    result.controls = { pauses: before===paused, plays: playing!==paused, stops:stop===stopped };
  }
  if (mode === 'scrub') {
    await page.locator('#pause').click();
    const hashes=[];
    for (const t of [731,2137,731]) {
      await page.locator('#time').fill(String(t)); await page.locator('#time').dispatchEvent('input');
      await page.waitForTimeout(40); hashes.push(await canvasHash());
    }
    result.scrub = { changes:hashes[0]!==hashes[1], repeats:hashes[0]===hashes[2] };
  }
  if (mode === 'seed-control') {
    await page.locator('#pause').click();
    await page.locator('#time').fill('1234'); await page.locator('#time').dispatchEvent('input');
    const hashes=[];
    for (const v of ['11','ab','11']) {
      await page.locator('#seed').fill('0x'+v.repeat(32));await page.locator('#apply-seed').click();
      await page.waitForTimeout(40);hashes.push(await canvasHash());
    }
    result.seedControl={changes:hashes[0]!==hashes[1],repeats:hashes[0]===hashes[2]};
  }
  result.external=external;result.pageErrors=errors;
  console.log(JSON.stringify(result));
} finally { await browser?.close(); server.kill('SIGKILL'); }
