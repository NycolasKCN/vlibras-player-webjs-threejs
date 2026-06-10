import * as Three from 'three';

export interface SceneRuntime {
  subtitleContainer: HTMLDivElement;
  canvas: HTMLCanvasElement;
  renderer: Three.WebGLRenderer;
  scene: Three.Scene;
  camera: Three.PerspectiveCamera;
}

export interface LoadedAvatar {
  object: Three.Object3D;
  clips: Three.AnimationClip[];
}

export interface LoadedAnimationClips {
  clips: Three.AnimationClip[];
}
