import { renderFrame } from './runtime.js';
// Deliberately unfinished base: entrants implement rendering and controls in round 1.
const canvas = document.querySelector<HTMLCanvasElement>('#artwork')!;
try {
  renderFrame(canvas, { seed: '0x' + '11'.repeat(32), timeMs: 0,
    viewport: { x: 0, y: 0, width: 2000, height: 2000 } });
} catch (error) {
  document.querySelector('#status')!.textContent = String(error);
}
