import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";
import { LoadedAvatar } from "./types";
import { AVATAR_ARMATURE_NAME } from "./config";

export interface AvatarLoader {
  load(path: string): Promise<LoadedAvatar>;
}

export class GltfAvatarLoader implements AvatarLoader {
  private readonly loader: GLTFLoader;

  constructor() {
    this.loader = new GLTFLoader().setCrossOrigin("anonymous");

    // const dracoLoader = new DRACOLoader();
    // dracoLoader.setDecoderPath("/examples/jsm/libs/draco/");
    // this.loader.setDRACOLoader(dracoLoader);
  }

  public async load(path: string): Promise<LoadedAvatar> {
    const gltf = await this.loader.loadAsync(path);
    const armature = gltf.scene.getObjectByName(AVATAR_ARMATURE_NAME);
    if (!armature) {
      throw new Error(`${AVATAR_ARMATURE_NAME} Not found.`);
    }

    return {
      object: armature,
      clips: gltf.animations,
    };
  }
}
