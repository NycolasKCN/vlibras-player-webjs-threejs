import EventEmitter from "events";
import * as Three from "three";
import { AvatarLoader, GltfAvatarLoader } from "./avatar-loader";
import { LoadedAvatar } from "./types";

export interface AvatarController extends EventEmitter {
  start(model: string, scene: Three.Scene): Promise<LoadedAvatar>;
  changeAvatar(avatar: string): void;
  getAvatar(): string;
}

export class AvatarControllerImpl
  extends EventEmitter
  implements AvatarController
{
  private readonly avatarLoader: AvatarLoader = new GltfAvatarLoader();
  private readonly baseUrl = "http://192.168.36.100:8000/static/glb/model/";
  currentAvatarName: string = "";

  constructor() {
    super();
  }

  async start(model: string, scene: Three.Scene): Promise<LoadedAvatar> {
    const modelUrl = this.baseUrl + model;
    const avatar = await this.avatarLoader.load(modelUrl);
    scene.add(avatar.object);
    this.currentAvatarName = model;
    return avatar;
  }

  async changeAvatar(avatar: string): Promise<void> {
    console.debug("[AvatarController] changeAvatar");
    this.emit("avatar:change", this.currentAvatarName);
  }

  getAvatar(): string {
    return this.currentAvatarName;
  }
}
