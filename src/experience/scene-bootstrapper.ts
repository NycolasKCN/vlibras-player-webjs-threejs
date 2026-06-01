import * as Three from 'three';
import { SceneRuntime } from './types';

export interface SceneBootstrapConfig {
  readonly fov: number;
  readonly near: number;
  readonly far: number;
  readonly cameraPosition: [number, number, number];
}

export interface SceneBootstrapper {
  bootstrap(canvas: HTMLCanvasElement): SceneRuntime;
}

const defaultConfig: SceneBootstrapConfig = {
  fov: 45,
  near: 0.1,
  far: 100,
  cameraPosition: [0, 7, 10],
};

export class ThreeSceneBootstrapper implements SceneBootstrapper {
  constructor(private readonly config: SceneBootstrapConfig = defaultConfig) {}

  public bootstrap(canvas: HTMLCanvasElement): SceneRuntime {
    const renderer = new Three.WebGLRenderer({ antialias: true, canvas });
    const scene = new Three.Scene();
    scene.name = 'root';
    scene.background = new Three.Color(0xebebeb);
   const aspect = window.innerWidth / window.innerHeight;
    const camera = new Three.PerspectiveCamera(
      this.config.fov,
      aspect,
      this.config.near,
      this.config.far
    );
    camera.position.set(...this.config.cameraPosition);
    scene.add(camera);

    return { canvas, renderer, scene, camera };
  }
}
