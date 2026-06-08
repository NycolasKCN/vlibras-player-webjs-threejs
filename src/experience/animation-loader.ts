import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { LoadedAnimationClips } from "./types";

export interface AnimationLoader {
  load(words: string[]): Promise<LoadedAnimationClips>;
}

export class GltfAnimationLoader implements AnimationLoader {
  constructor(
    private readonly loader: GLTFLoader = new GLTFLoader().setCrossOrigin(
      "anonymous",
    ),
    private readonly baseUrl: string = "http://192.168.36.100:8000/static/glb/glosa/",
  ) {}

  public async load(words: string[]): Promise<LoadedAnimationClips> {
    const promises: Promise<GLTF>[] = words.map((word) => {
      const url = this.baseUrl + word;
      return this.loader.loadAsync(url);
    });

    const gltfs: GLTF[] = await Promise.all(promises);

    const allAnimations = gltfs.flatMap((gltf) => gltf.animations);

    return {
      clips: allAnimations,
    };
  }
}
