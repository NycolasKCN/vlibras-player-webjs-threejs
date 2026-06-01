import * as Three from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export function getOrbitControls(camera: Three.Camera, canvas: Element | null) {
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Canvas with id "main-canvas" was not found.');
  }
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.update();

  return controls;
}
