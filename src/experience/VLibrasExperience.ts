import * as Three from 'three';
import { Experience } from './Experience';
import { AnimationController, MixerAnimationController } from './animation-controller';
import { AvatarLoader } from './avatar-loader';
import { EnvironmentBuilder } from './environment-builder';
import { RenderLoop } from './render-loop';
import { SceneDebugger } from './scene-debugger';
import { SceneBootstrapper } from './scene-bootstrapper';
import { SceneRuntime } from './types';
import { AnimationLoader } from './animation-loader';

export interface VLibrasExperienceDependencies {
  sceneBootstrapper: SceneBootstrapper;
  environmentBuilder: EnvironmentBuilder;
  avatarLoader: AvatarLoader;
  animationLoader: AnimationLoader;
  animationController: AnimationController;
  renderLoop: RenderLoop;
  sceneDebugger: SceneDebugger;
  modelPath: string;
}

export class VLibrasExperience implements Experience {
  private readonly runtime: SceneRuntime;
  private readonly timer = new Three.Timer();
  private readonly dependencies: VLibrasExperienceDependencies;

  constructor(canvas: HTMLCanvasElement, dependencies: VLibrasExperienceDependencies) {
    this.dependencies = dependencies;
    this.runtime = dependencies.sceneBootstrapper.bootstrap(canvas);
  }

  public async init(): Promise<void> {
    this.dependencies.environmentBuilder.build(this.runtime);
    const avatar = await this.dependencies.avatarLoader.load(this.dependencies.modelPath);
    const animations = await this.dependencies.animationLoader.load(
      '/animations/glb/animations.glb'
    );
    avatar.object.position.y = 2;
    this.runtime.scene.add(avatar.object);
    this.dependencies.animationController.bind(avatar.object, animations.clips);
  }

  public start(): void {
    this.dependencies.renderLoop.start(this.runtime, this.updateObjects);
  }

  public debug(): { sceneTree: string[]; animations: string[] } {
    this.dependencies.sceneDebugger.debug(this.runtime.scene);

    return {
      sceneTree: this.dependencies.sceneDebugger.dump(this.runtime.scene),
      animations: (
        this.dependencies.animationController as MixerAnimationController
      ).listAnimations(),
    };
  }

  public cycleAnimations(): void {
    this.dependencies.animationController.cycleAnimations();
  }

  public playAnimation(index: number): void {
    this.dependencies.animationController.playAnimation(index);
  }

  public listAnimations(): string[] {
    return this.dependencies.animationController.listAnimations();
  }

  private updateObjects = (): void => {
    this.timer.update();
    this.dependencies.animationController.update(this.timer.getDelta());
  };
}
