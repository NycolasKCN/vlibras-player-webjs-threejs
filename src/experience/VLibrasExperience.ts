import { Experience } from "./Experience";
import {
  AnimationController,
  MixerAnimationController,
} from "./animation-controller";
import { EnvironmentBuilder } from "./environment-builder";
import { RenderLoop } from "./render-loop";
import { SceneDebugger } from "./scene-debugger";
import { SceneBootstrapper } from "./scene-bootstrapper";
import { SceneRuntime } from "./types";
import { SubtitleController } from "./subtitle-controller";
import { AvatarController } from "./avatar-controller";
import EventEmitter from "events";

export interface VLibrasExperienceDependencies {
  sceneBootstrapper: SceneBootstrapper;
  environmentBuilder: EnvironmentBuilder;
  avatarController: AvatarController;
  animationController: AnimationController;
  subtitleController: SubtitleController;
  renderLoop: RenderLoop;
  sceneDebugger: SceneDebugger;
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
    console.debug("[Experience] Iniciando");
    this.dependencies.environmentBuilder.build(this.runtime);
    this.dependencies.subtitleController.start(this.runtime.subtitleContainer);

    const loadedAvatar = await this.dependencies.avatarController.start(
      "icaro",
      this.runtime.scene,
    );

    await this.dependencies.animationController.start(
      loadedAvatar.object,
      this.dependencies.subtitleController,
    );

    this.dependencies.renderLoop.start(this.runtime, this.updateObjects);
    this.emit("load");
    console.debug("[Experience] Iniciado e carregado");
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

  public getAvatarController(): AvatarController {
    return this.dependencies.avatarController;
  }

  private updateObjects = (delta: number): void => {
    this.dependencies.animationController.update(delta);
  };
}
