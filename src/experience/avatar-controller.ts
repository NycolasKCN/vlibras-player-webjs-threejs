import EventEmitter from "events";
import * as Three from "three";
import { AvatarLoader, GltfAvatarLoader } from "./avatar-loader";
import { LoadedAvatar } from "./types";

export interface AvatarController extends EventEmitter {
  start(model: string, scene: Three.Scene): Promise<LoadedAvatar>;
}

export class AvatarControllerImpl
  extends EventEmitter
  implements AvatarController
{
  private readonly avatarLoader: AvatarLoader = new GltfAvatarLoader();
  private readonly baseUrl = "http://192.168.36.100:8000/static/glb/model/";

  constructor() {
    super();
  }

  async start(model: string, scene: Three.Scene): Promise<LoadedAvatar> {
    const modelUrl = this.baseUrl + model;
    const avatar = await this.avatarLoader.load(modelUrl);
    scene.add(avatar.object);
    return avatar;
  }
}
