import { VLibrasExperience, VLibrasExperienceDependencies } from './VLibrasExperience';
import { GltfAvatarLoader } from './avatar-loader';
import { MixerAnimationController } from './animation-controller';
import { ThreeEnvironmentBuilder } from './environment-builder';
import { ResponsiveRenderLoop } from './render-loop';
import { ObjectTreeSceneDebugger } from './scene-debugger';
import { ThreeSceneBootstrapper } from './scene-bootstrapper';
import { GltfAnimationLoader } from './animation-loader';

export function createVLibrasExperience(canvas: HTMLCanvasElement): VLibrasExperience {
  const dependencies: VLibrasExperienceDependencies = {
    sceneBootstrapper: new ThreeSceneBootstrapper(),
    environmentBuilder: new ThreeEnvironmentBuilder(),
    avatarLoader: new GltfAvatarLoader(),
    animationLoader: new GltfAnimationLoader(),
    animationController: new MixerAnimationController(),
    renderLoop: new ResponsiveRenderLoop(),
    sceneDebugger: new ObjectTreeSceneDebugger(),
    modelPath: '/model/base-model.glb',
  };
  return new VLibrasExperience(canvas, dependencies);
}
