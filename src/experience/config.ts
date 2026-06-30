import { AvatarPersonalization, EMOTION, FaceMorphTargets } from "./types";

export const DRACO_DECODER_PATH = "/libs/js/draco/";

export const NEXT_ANIMATION_THRESHOLD = 70;
export const ANIMATION_CROSS_FADE_TIME = 0.6;
export const MAX_ANIMATION_SPEED = 2.5;
export const MIN_ANIMATION_SPEED = 0.5;

export const AVATAR_ARMATURE_NAME = "Armature001";
export const FACE_MESH_NAME = "Cabeca";
export const STAMP_CENTER_NAME = "EstampaCentral";
export const SHIRT_MESH_NAME = "Camisa";
export const PANTS_MESH_NAME = "Calca";
export const HAIR_MESH_NAME = "Cabelo";
export const IRIS_MESH_NAME = "Iris";
export const EYES_MESH_NAME = "Olho";

export const NEUTRAL_EMOTION_MORPH: FaceMorphTargets = {
  baixarCantoBoca: 0,
  baixarBocaCantoDir: 0,
  baixarBocaCantoEsq: 0,
  labioContrair: 0.2,
  labioSuperior: 0,
  labioEsq: 0,
  labioDir: 0,
  sorriso: 0.1,
  bico: 0,

  sobrancelhaFranzir: 0,
  sobrancelhaDirBaixar: 0,
  sobrancelhaEsqBaixar: 0,
  sobrancelhaDirAbrir: 0,
  sobrancelhaEsqAbrir: 0,
  sobrancelhaDirRaiva: 0,
  sobrancelhaEsqRaiva: 0,
  sobrancelhaDirLevantar: 0,
  sobrancelhaEsqLevantar: 0,

  bochechaInflar: 0,
  bochechaDirInflar: 0,
  bochechaEsqInflar: 0,
  bochechaContrair: 0,

  fechaOlhos: 0,
};

export const HAPPY_EMOTION_MORPH: FaceMorphTargets = {
  baixarCantoBoca: 0,
  baixarBocaCantoDir: 0,
  baixarBocaCantoEsq: 0,
  labioContrair: 0.2,
  labioSuperior: 0,
  labioEsq: 0,
  labioDir: 0,
  sorriso: 0.6,
  bico: 0,

  sobrancelhaFranzir: 0,
  sobrancelhaDirBaixar: 0,
  sobrancelhaEsqBaixar: 0,
  sobrancelhaDirAbrir: 0,
  sobrancelhaEsqAbrir: 0,
  sobrancelhaDirRaiva: 0,
  sobrancelhaEsqRaiva: 0,
  sobrancelhaDirLevantar: 0.15,
  sobrancelhaEsqLevantar: 0.15,

  bochechaInflar: 0,
  bochechaDirInflar: 0,
  bochechaEsqInflar: 0,
  bochechaContrair: 0,

  fechaOlhos: 0,
};

export const SAD_EMOTION_MORPH: FaceMorphTargets = {
  baixarCantoBoca: 1,
  baixarBocaCantoDir: 0,
  baixarBocaCantoEsq: 0,
  labioContrair: 0.6,
  labioSuperior: 0,
  labioEsq: 0,
  labioDir: 0,
  sorriso: 0,
  bico: 0,

  sobrancelhaFranzir: 0,
  sobrancelhaDirBaixar: 0.21,
  sobrancelhaEsqBaixar: 0.21,
  sobrancelhaDirAbrir: 1,
  sobrancelhaEsqAbrir: 1,
  sobrancelhaDirRaiva: 0,
  sobrancelhaEsqRaiva: 0,
  sobrancelhaDirLevantar: 0,
  sobrancelhaEsqLevantar: 0,

  bochechaInflar: 0,
  bochechaDirInflar: 0,
  bochechaEsqInflar: 0,
  bochechaContrair: 0,

  fechaOlhos: 0,
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
  avatar: "icaro",
  pos: "center",
  logo: "https://vlibras.gov.br/config/img/logo-lavid.png",
};
