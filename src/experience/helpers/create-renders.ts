import * as Three from 'three';

export function createRender(): Three.WebGLRenderer {
  const canvas = document.querySelector('#main-canvas');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Canvas with id "main-canvas" was not found.');
  }

  const rendererConfig: Three.WebGLRendererParameters = {
    antialias: true,
    canvas,
  };
  return new Three.WebGLRenderer(rendererConfig);
}
export function createRenderAndScene(): [Three.WebGLRenderer, Three.Scene] {
  const renderer = createRender();
  const scene = new Three.Scene();
  return [renderer, scene];
}

export function createRenderSceneAndLight(): [Three.WebGLRenderer, Three.Scene] {
  const [renderer, scene] = createRenderAndScene();

  // light
  const color = 0xc9a130;
  const intensity = 3;
  const light = new Three.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);

  return [renderer, scene];
}
