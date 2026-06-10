import * as Three from "three";
import { Experience } from "./Experience";
import {
  AnimationController,
  MixerAnimationController,
} from "./animation-controller";
import { AvatarLoader } from "./avatar-loader";
import { EnvironmentBuilder } from "./environment-builder";
import { RenderLoop } from "./render-loop";
import { SceneDebugger } from "./scene-debugger";
import { SceneBootstrapper } from "./scene-bootstrapper";
import { SceneRuntime } from "./types";
import { AnimationLoader } from "./animation-loader";
import { SubtitleController } from "./subtitle-controller";
import EventEmitter from "events";

export interface VLibrasExperienceDependencies {
  sceneBootstrapper: SceneBootstrapper;
  environmentBuilder: EnvironmentBuilder;
  avatarLoader: AvatarLoader;
  animationLoader: AnimationLoader;
  animationController: AnimationController;
  subtitleController: SubtitleController;
  renderLoop: RenderLoop;
  sceneDebugger: SceneDebugger;
  modelPath: string;
}

export class VLibrasExperience extends EventEmitter implements Experience {
  private readonly runtime: SceneRuntime;
  private readonly dependencies: VLibrasExperienceDependencies;

  constructor(
    wrapper: HTMLElement,
    dependencies: VLibrasExperienceDependencies,
  ) {
    super();
    this.dependencies = dependencies;
    this.runtime = dependencies.sceneBootstrapper.bootstrap(wrapper);
  }

  public async init(): Promise<void> {
    console.debug("[Experience] init");
    this.dependencies.environmentBuilder.build(this.runtime);
    const avatar = await this.dependencies.avatarLoader.load(
      this.dependencies.modelPath,
    this.dependencies.subtitleController.start(this.runtime.subtitleContainer);
    );
    
    this.dependencies.animationController.start(
      loadedAvatar.object,
      [],
      this.dependencies.subtitleController,
    );

    this.dependencies.renderLoop.start(this.runtime, this.updateObjects);
    this.emit("load");
    console.debug("[Experience] Loaded and started");
  }

  public start(): void {}

  public debug(): { sceneTree: string[]; animations: string[] } {
    this.dependencies.sceneDebugger.debug(this.runtime.scene);

    return {
      sceneTree: this.dependencies.sceneDebugger.dump(this.runtime.scene),
      animations: (
        this.dependencies.animationController as MixerAnimationController
      ).listAnimations(),
    };
  }

  public getAnimationController(): AnimationController {
    return this.dependencies.animationController;
  }

  public getSubtitleController(): SubtitleController {
    return this.dependencies.subtitleController;
  }

  private updateObjects = (delta: number): void => {
    this.dependencies.animationController.update(delta);
  };
}
