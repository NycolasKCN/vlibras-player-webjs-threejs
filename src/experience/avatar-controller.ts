import { EventEmitter } from "events";
import * as Three from "three";
import { AvatarLoader, GltfAvatarLoader } from "./avatar-loader";
import { EMOTION, FaceMorphTargets, LoadedAvatar } from "./types";
import { EMOTION_MORPH_MAP } from "./config";

export interface AvatarController extends EventEmitter {
  applyEmotion(emotion: EMOTION): void;
  start(model: string, scene: Three.Scene): Promise<LoadedAvatar>;
  changeAvatar(avatar: string): void;
  getAvatar(): string;
}

export class AvatarControllerImpl
  extends EventEmitter
  implements AvatarController
{
  private readonly FACE_GROUP_NAME = "cabecaModifAlisson";
  private readonly BODY_MESH_NAME = "corpoModifAlisson";
  private readonly LOGO_DECAL_SIZE = new Three.Vector3(2, 2, 2);
  private readonly baseUrl = "http://192.168.36.100:8000/static/glb/model/";
  private readonly avatarLoader: AvatarLoader = new GltfAvatarLoader();
  private scene?: Three.Scene;
  currentAvatarName: string = "";

  constructor() {
    super();
  }

  async start(model: string, scene: Three.Scene): Promise<LoadedAvatar> {
    const modelUrl = this.baseUrl + model;
    const avatar = await this.avatarLoader.load(modelUrl);
    scene.add(avatar.object);
    this.currentAvatarName = model;
    this.scene = scene;
    this.applyEmotion(EMOTION.NEUTRAL);
    return avatar;
  }

  async changeAvatar(avatar: string): Promise<void> {
    console.debug("[AvatarController] changeAvatar");
    this.emit("avatar:change", this.currentAvatarName);
  }

  getAvatar(): string {
    return this.currentAvatarName;
  }

  applyEmotion(emotion: EMOTION): void {
    const faceGroup = this.scene!.getObjectByName(this.FACE_GROUP_NAME) as
      | Three.Group
      | undefined;

    if (!faceGroup) {
      throw new Error("Mesh group da cabeça não encontrado");
    }
    if (!emotion) {
      return;
    }

    faceGroup.traverse((obj) => {
      if (obj.type === "SkinnedMesh") {
        this.applyMothTargets(
          obj as Three.SkinnedMesh,
          EMOTION_MORPH_MAP[emotion],
        );
      }
    });
  }

  private applyMothTargets(mesh: Three.Mesh, targets: FaceMorphTargets): void {
    if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

    for (const [name, weight] of Object.entries(targets)) {
      const index = mesh.morphTargetDictionary[name];
      if (index === undefined) continue;
      mesh.morphTargetInfluences[index] = weight;
    }
  }
}
