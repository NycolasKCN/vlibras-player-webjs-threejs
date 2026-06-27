import { EventEmitter } from "events";
import * as Three from "three";
import { AvatarLoader, GltfAvatarLoader } from "./avatar-loader";
import { EMOTION, FaceMorphTargets, LoadedAvatar } from "./types";
import {
  AVATAR_ARMATURE_NAME,
  FACE_MESH_NAME,
  STAMP_CENTER_NAME,
  SHIRT_MESH_NAME,
  PANTS_MESH_NAME,
  HAIR_MESH_NAME,
  IRIS_MESH_NAME,
  EYES_MESH_NAME,
  DEFAULT_PERSONALIZATION,
  EMOTION_MORPH_MAP,
} from "./config";
export type AvatarName = "icaro" | "hosana" | "guga";

export interface AvatarController extends EventEmitter {
  applyEmotion(emotion: EMOTION): void;
  start(model: string, scene: Three.Scene): Promise<LoadedAvatar>;
  changeAvatar(avatar: string): void;
  setPersonalization(url: string): void;
  getAvatar(): string;
}

export interface AvatarPersonalization {
  calca: string;
  camisa: string;
  cabelo: string;
  corpo: string;
  avatar: "icaro" | "rosana" | "guga" | "random";
  iris: string;
  olhos: string;
  sombrancelhas: string;
  pos: string;
  logo: string;
}

export class AvatarControllerImpl
  extends EventEmitter
  implements AvatarController
{
  private readonly baseUrl = "http://192.168.36.100:8000/static/glb/model/";
  private readonly avatarLoader: AvatarLoader;
  private readonly textureLoader: Three.TextureLoader;
  private scene?: Three.Scene;

  currentAvatarName: AvatarName;
  currentEmotion: EMOTION;
  currentPersonalization: AvatarPersonalization;

  constructor() {
    super();
    this.avatarLoader = new GltfAvatarLoader();
    this.textureLoader = new Three.TextureLoader();
    this.currentAvatarName = "icaro";
    this.currentPersonalization = DEFAULT_PERSONALIZATION;
    this.currentEmotion = EMOTION.NEUTRAL;
  }

  async start(model: AvatarName, scene: Three.Scene): Promise<LoadedAvatar> {
    const modelUrl = this.baseUrl + model;
    const avatar = await this.avatarLoader.load(modelUrl);
    scene.add(avatar.object);
    this.currentAvatarName = model;
    this.scene = scene;
    this.applyPersonalization(this.currentPersonalization);
    this.applyEmotion(this.currentEmotion);
    return avatar;
  }

  async changeAvatar(avatarName: AvatarName): Promise<void> {
    console.debug("[AvatarController] changeAvatar", avatarName);
    if (!this.scene) return;

    const modelUrl = this.baseUrl + avatarName;
    const avatar = await this.avatarLoader.load(modelUrl);
    const oldAvatar = this.scene.getObjectByName(AVATAR_ARMATURE_NAME);
    if (oldAvatar) {
      this.scene.remove(oldAvatar);
    }

    this.scene.add(avatar.object);
    this.currentAvatarName = avatarName;
    this.applyPersonalization(this.currentPersonalization);
    this.applyEmotion(this.currentEmotion);
    this.emit("avatar:change", {
      avatarName: this.currentAvatarName,
      avatarObject: avatar.object,
    });
  }

  getAvatar(): string {
    return this.currentAvatarName;
  }

  async setPersonalization(url: string): Promise<void> {
    console.debug("[AvatarController] setPersonalization", url);
    if (!this.scene) {
      return;
    }

    const personalization = await this.fetchPersonalizationJson(url);
    const avatar = this.scene.getObjectByName(AVATAR_ARMATURE_NAME);

    if (!personalization || !avatar) {
      console.debug(
        "[AvatarController] Personalização não encontrada ou avatar não encontrado",
      );
      return;
    }
    this.applyPersonalization(personalization);
    this.currentPersonalization = personalization;
  }

  // TODO: Fix EMOTION
  applyEmotion(emotion: EMOTION): void {
    const faceMesh = this.scene!.getObjectByName(FACE_MESH_NAME) as
      | Three.SkinnedMesh
      | undefined;

    if (!faceMesh) {
      throw new Error("Mesh group da cabeça não encontrado");
    }
    if (!emotion) {
      return;
    }

    if (!faceMesh.morphTargetDictionary || !faceMesh.morphTargetInfluences)
      return;

    const targets = EMOTION_MORPH_MAP[emotion];
    for (const [name, weight] of Object.entries(targets)) {
      const index = faceMesh.morphTargetDictionary[name];
      if (index === undefined) continue;
      faceMesh.morphTargetInfluences[index] = weight;
    }
  }

  private async fetchPersonalizationJson(
    url: string,
  ): Promise<AvatarPersonalization | undefined> {
    const response: Response = await fetch(url);
    if (!response.ok) {
      this.emit("avatar:error", { description: "Url fetch error" });
      return;
    }
    return (await response.json()) as AvatarPersonalization;
  }

  private async applyPersonalization(
    personalization: AvatarPersonalization,
  ): Promise<void> {
    if (!this.scene) return;

    this.applyColorToMesh(personalization.corpo, FACE_MESH_NAME);
    this.applyColorToMesh(personalization.camisa, SHIRT_MESH_NAME);
    this.applyColorToMesh(personalization.calca, PANTS_MESH_NAME);
    this.applyColorToMesh(personalization.cabelo, HAIR_MESH_NAME);
    this.applyColorToMesh(personalization.iris, IRIS_MESH_NAME);
    this.applyColorToMesh(personalization.olhos, EYES_MESH_NAME);

    if (this.currentAvatarName === "guga") {
      this.applyColorToMesh(personalization.calca, "CamisaDetalhes");
    }

    // Apply Logo on the chest
    {
      const chestMesh = this.scene.getObjectByName(STAMP_CENTER_NAME) as
        | Three.Mesh
        | undefined;
      if (!chestMesh) {
        console.debug("[personalization] Mesh da estampa não encontrada");
        return;
      }

      const logoTexture = await this.textureLoader.loadAsync(
        personalization.logo,
      );
      logoTexture.flipY = false;
      logoTexture.wrapS = Three.ClampToEdgeWrapping;
      logoTexture.wrapT = Three.ClampToEdgeWrapping;
      // simulate scale down
      const scale = this.currentAvatarName == "icaro" ? 1.1 : 1.3;
      logoTexture.repeat.set(scale, scale);
      logoTexture.offset.set((1 - scale) / 2, (1 - scale) / 2);

      chestMesh.material = new Three.MeshPhongMaterial({
        map: logoTexture,
        transparent: true,
      });
      console.debug("[personalization] Logo aplicada ao peito");
    }
  }

  private applyColorToMesh(hex: string, meshName: string): void {
    if (!this.scene) return;

    const mesh = this.scene.getObjectByName(meshName) as Three.Mesh | undefined;
    if (!mesh) return;
    const material = mesh.material as Three.MeshStandardMaterial;
    material.color = new Three.Color(hex);
    material.needsUpdate = true;
    console.debug("[personalization] Cor aplicada a", meshName);
  }
}
