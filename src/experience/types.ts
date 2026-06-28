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

export type AvatarName = "icaro" | "hosana" | "guga";

export interface AvatarPersonalization {
  calca: string;
  camisa: string;
  cabelo: string;
  corpo: string;
  avatar: AvatarName | "random";
  iris: string;
  olhos: string;
  sombrancelhas: string;
  pos: string;
  logo: string;
}

export enum EMOTION {
  NEUTRAL = 1,
  HAPPY = 2,
  SAD = 3,
}

export interface FaceMorphTargets {
  baixarCantoBoca: number;
  baixarBocaCantoDir: number;
  baixarBocaCantoEsq: number;
  labioContrair: number;
  labioSuperior: number;
  labioEsq: number;
  labioDir: number;
  sorriso: number;
  bico: number;

  sobrancelhaFranzir: number;
  sobrancelhaDirBaixar: number;
  sobrancelhaEsqBaixar: number;
  sobrancelhaDirAbrir: number;
  sobrancelhaEsqAbrir: number;
  sobrancelhaDirRaiva: number;
  sobrancelhaEsqRaiva: number;
  sobrancelhaDirLevantar: number;
  sobrancelhaEsqLevantar: number;

  bochechaInflar: number;
  bochechaDirInflar: number;
  bochechaEsqInflar: number;
  bochechaContrair: number;

  fechaOlhos: number;
}
