import { AnimationClip } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import { GlossAnimationClip } from "./types";

export interface AnimationLoader {
  load(words: string[]): Promise<GlossAnimationClip[]>;
}

export class GltfAnimationLoader implements AnimationLoader {
  constructor(
    private readonly loader: GLTFLoader = new GLTFLoader().setCrossOrigin(
      "anonymous",
    ),
    private readonly baseUrl: string = "http://192.168.36.100:8000/static/glb/glosa/",
  ) {}

  public async load(words: string[]): Promise<GlossAnimationClip[]> {
    const promises: Promise<GLTF>[] = words.map((word) => {
      const url = this.baseUrl + word;
      return this.loader.loadAsync(url);
    });
    const results = await Promise.allSettled(promises);

    const animations: GlossAnimationClip[] = results
      .map((result, i) => ({ result, word: words[i] }))
      .map(({ result, word }) => {
        let clip: AnimationClip | undefined = undefined;
        if (result.status === "fulfilled") {
          // We have to garantie that all gltf files has only one clip
          clip = (result as PromiseFulfilledResult<GLTF>).value.animations[0];
        }
        // Remove word category
        word = word.split("&")[0];
        return {
          word,
          clip,
        } as GlossAnimationClip;
      });

    return animations;
  }
}
