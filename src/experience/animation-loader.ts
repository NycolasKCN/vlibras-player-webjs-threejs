import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { LoadedAnimationClips } from './types';


export interface AnimationLoader {
  load(path: string): Promise<LoadedAnimationClips>;
}

export class GltfAnimationLoader implements AnimationLoader {
  constructor(private readonly loader: GLTFLoader = new GLTFLoader().setCrossOrigin('anonymous')) {}

  public async load(path: string): Promise<LoadedAnimationClips> {
    const gltf = await this.loader.loadAsync(path);

    return {
      clips: gltf.animations,
    };
  }
}
