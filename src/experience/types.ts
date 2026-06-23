import * as Three from "three";

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

export interface GlossAnimationClip {
  word: string;
  clip: Three.AnimationClip | undefined;
}

export enum EMOTION {
  NEUTRAL = 1,
  HAPPY = 2,
  SAD = 3,
}

export interface FaceMorphTargets {
  baixaBocaCantoDir: number;
  baixaBocaCantoEsq: number;
  baixaCantoBoca: number;
  bico: number;
  bochechaContraida: number;
  bochechaInfla: number;
  bochechaInfladaDir: number;
  bochechaInfladaEsq: number;
  correcaoAbreBoca: number;
  labioContrair: number;
  labioSuperiorLevanta: number;
  sobrancelhaDirAberta: number;
  sobrancelhaDirBaixa: number;
  sobrancelhaDirLevanta: number;
  sobrancelhaDirRaiva: number;
  sobrancelhaEsqAberta: number;
  sobrancelhaEsqBaixa: number;
  sobrancelhaEsqLevanta: number;
  sobrancelhaEsqRaiva: number;
  sobrancelhaFranzir: number;
  sorriso: number;
}
