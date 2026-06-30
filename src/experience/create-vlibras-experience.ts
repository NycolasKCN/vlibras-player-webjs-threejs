import {
  VLibrasExperience,
  VLibrasExperienceDependencies,
} from "./VLibrasExperience";
import { MixerAnimationController } from "./animation-controller";
import { AvatarControllerImpl } from "./avatar-controller";
import { ThreeEnvironmentBuilder } from "./environment-builder";
import { ResponsiveRenderLoop } from "./render-loop";
import { ThreeSceneBootstrapper } from "./scene-bootstrapper";
import { ObjectTreeSceneDebugger } from "./scene-debugger";
import { HtmlSubtitleController } from "./subtitle-controller";

export function createVLibrasExperience(
  wrapper: HTMLElement,
): VLibrasExperience {
  const dependencies: VLibrasExperienceDependencies = {
    sceneBootstrapper: new ThreeSceneBootstrapper(),
    environmentBuilder: new ThreeEnvironmentBuilder(),
    avatarController: new AvatarControllerImpl(),
    animationController: new MixerAnimationController(),
    subtitleController: new HtmlSubtitleController(),
    renderLoop: new ResponsiveRenderLoop(),
    sceneDebugger: new ObjectTreeSceneDebugger(),
  };
  return new VLibrasExperience(wrapper, dependencies);
}
