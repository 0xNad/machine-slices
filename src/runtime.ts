export interface Viewport { x: number; y: number; width: number; height: number }
export interface FrameOptions { seed: string; timeMs: number; viewport: Viewport }
/** Round 1 entry point. Replace this stub; see ARCHITECTURE.md for the contract. */
export function renderFrame(_canvas: HTMLCanvasElement, _options: FrameOptions): void {
  throw new Error('Round 1 renderer is not implemented');
}
