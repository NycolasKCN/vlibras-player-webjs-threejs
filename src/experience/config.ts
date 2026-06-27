import { AvatarPersonalization } from "./avatar-controller";
import { EMOTION, FaceMorphTargets } from "./types";

export const NEXT_ANIMATION_THRESHOLD = 70;
export const ANIMATION_CROSS_FADE_TIME = 0.6;
export const MAX_ANIMATION_SPEED = 2.5;
export const MIN_ANIMATION_SPEED = 0.5;

export const AVATAR_ARMATURE_NAME = "Armature001";
export const FACE_MESH_NAME = "cabecaModifAlisson";
export const STAMP_CENTER_NAME = "EstampaCentral";
export const SHIRT_MESH_NAME = "Camisa";
export const PANTS_MESH_NAME = "Calca";
export const HAIR_MESH_NAME = "Cabelo";
export const IRIS_MESH_NAME = "Iris";
export const EYES_MESH_NAME = "Olho";

export const NEUTRAL_EMOTION_MORPH: FaceMorphTargets = {
  baixaBocaCantoDir: 0,
  baixaBocaCantoEsq: 0,
  baixaCantoBoca: 0,
  bico: 0,
  bochechaContraida: 0,
  bochechaInfla: 0,
  bochechaInfladaDir: 0,
  bochechaInfladaEsq: 0,
  correcaoAbreBoca: 0,
  labioContrair: 0.2,
  labioSuperiorLevanta: 0,
  sobrancelhaDirAberta: 0,
  sobrancelhaDirBaixa: 0,
  sobrancelhaDirLevanta: 0,
  sobrancelhaDirRaiva: 0,
  sobrancelhaEsqAberta: 0,
  sobrancelhaEsqBaixa: 0,
  sobrancelhaEsqLevanta: 0,
  sobrancelhaEsqRaiva: 0,
  sobrancelhaFranzir: 0,
  sorriso: 0.1,
};

export const HAPPY_EMOTION_MORPH: FaceMorphTargets = {
  baixaBocaCantoDir: 0,
  baixaBocaCantoEsq: 0,
  baixaCantoBoca: 0,
  bico: 0,
  bochechaContraida: 0,
  bochechaInfla: 0,
  bochechaInfladaDir: 0,
  bochechaInfladaEsq: 0,
  correcaoAbreBoca: 0,
  labioContrair: 0.2,
  labioSuperiorLevanta: 0,
  sobrancelhaDirAberta: 0,
  sobrancelhaEsqAberta: 0,
  sobrancelhaDirBaixa: 0,
  sobrancelhaEsqBaixa: 0,
  sobrancelhaDirLevanta: 0.15,
  sobrancelhaEsqLevanta: 0.15,
  sobrancelhaDirRaiva: 0,
  sobrancelhaEsqRaiva: 0,
  sobrancelhaFranzir: 0,
  sorriso: 0.6,
};

export const SAD_EMOTION_MORPH: FaceMorphTargets = {
  baixaBocaCantoDir: 0,
  baixaBocaCantoEsq: 0,
  baixaCantoBoca: 0.5,
  bico: 0,
  bochechaContraida: 0,
  bochechaInfla: 0,
  bochechaInfladaDir: 0,
  bochechaInfladaEsq: 0,
  correcaoAbreBoca: 0,
  labioContrair: 0.3,
  labioSuperiorLevanta: 0,

  sobrancelhaDirAberta: 0.8,
  sobrancelhaEsqAberta: 1,

  sobrancelhaDirBaixa: 0.21,
  sobrancelhaEsqBaixa: 0.21,

  sobrancelhaDirLevanta: 0,
  sobrancelhaEsqLevanta: 0,

  sobrancelhaDirRaiva: 0,
  sobrancelhaEsqRaiva: 0,

  sobrancelhaFranzir: 0,
  sorriso: 0,
};

export const EMOTION_MORPH_MAP = {
  [EMOTION.NEUTRAL]: NEUTRAL_EMOTION_MORPH,
  [EMOTION.HAPPY]: HAPPY_EMOTION_MORPH,
  [EMOTION.SAD]: SAD_EMOTION_MORPH,
};

export const DEFAULT_PERSONALIZATION: AvatarPersonalization = {
  calca: "#0E0F18",
  camisa: "#1C204F",
  cabelo: "#000000",
  corpo: "#C18471",
  iris: "#000000",
  olhos: "#FFFFFF",
  sombrancelhas: "#000000",
  avatar: "random",
  pos: "center",
  logo: "https://vlibras.gov.br/config/img/logo-lavid.png",
};
