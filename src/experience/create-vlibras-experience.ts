import {VLibrasExperience, VLibrasExperienceDependencies,} from "./VLibrasExperience";
import {MixerAnimationController} from "./animation-controller";
import {ThreeEnvironmentBuilder} from "./environment-builder";
import {ResponsiveRenderLoop} from "./render-loop";
import {ObjectTreeSceneDebugger} from "./scene-debugger";
import {ThreeSceneBootstrapper} from "./scene-bootstrapper";
import {HtmlSubtitleController} from "./subtitle-controller";

export function createVLibrasExperience(
  wrapper: HTMLElement,
  baseModelUrl: string = "/resources/model/base-model.glb",
): VLibrasExperience {
  const dependencies: VLibrasExperienceDependencies = {
    sceneBootstrapper: new ThreeSceneBootstrapper(),
    environmentBuilder: new ThreeEnvironmentBuilder(),
    avatarLoader: new GltfAvatarLoader(),
    animationLoader: new GltfAnimationLoader(),
    animationController: new MixerAnimationController(),
    subtitleController: new HtmlSubtitleController(),
    renderLoop: new ResponsiveRenderLoop(),
    sceneDebugger: new ObjectTreeSceneDebugger(),
    modelPath: baseModelUrl,
  };
  return new VLibrasExperience(wrapper, dependencies);
}
