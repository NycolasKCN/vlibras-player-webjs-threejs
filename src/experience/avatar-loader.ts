import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { LoadedAvatar } from './types';

const OBJECT_NAME = 'Armature001';

export interface AvatarLoader {
  load(path: string): Promise<LoadedAvatar>;
}

export class GltfAvatarLoader implements AvatarLoader {
  constructor(private readonly loader: GLTFLoader = new GLTFLoader().setCrossOrigin('anonymous')) {}

  public async load(path: string): Promise<LoadedAvatar> {
    const gltf = await this.loader.loadAsync(path);
    const armature = gltf.scene.getObjectByName(OBJECT_NAME);
    if (!armature) {
      throw new Error(`${OBJECT_NAME} Not found.`);
    }

    return {
      object: armature,
      clips: gltf.animations,
    };
  }
}
