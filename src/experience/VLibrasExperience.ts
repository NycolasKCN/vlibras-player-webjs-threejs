import EventEmitter from "events";
import * as Three from "three";
import { Experience } from "./Experience";
import {
    AnimationController,
    MixerAnimationController,
} from "./animation-controller";
import { AvatarController } from "./avatar-controller";
import { EnvironmentBuilder } from "./environment-builder";
import { RenderLoop } from "./render-loop";
import { SceneBootstrapper } from "./scene-bootstrapper";
import { SceneDebugger } from "./scene-debugger";
import { SubtitleController } from "./subtitle-controller";
import { SceneRuntime } from "./types";

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

  public async load(): Promise<void> {
    console.debug("[Experience] Iniciando");
    this.dependencies.environmentBuilder.build(this.runtime);
    this.dependencies.subtitleController.load(this.runtime.subtitleContainer);

    const loadedAvatar = await this.dependencies.avatarController.load(
      this.runtime.scene,
    );

    await this.dependencies.animationController.load(
      loadedAvatar.object,
      this.dependencies.subtitleController,
    );

    this.dependencies.renderLoop.run(this.runtime, this.updateObjects);
    this.registerEventsHandlers();
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

  public getObject(name: string): Three.Object3D | undefined {
    return this.runtime.scene.getObjectByName(name);
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

  private registerEventsHandlers(): void {
    this.dependencies.avatarController.on(
      "avatar:change",
      (event: { avatarName: string; avatarObject: Three.Object3D }) => {
        this.dependencies.animationController.updateObject(event.avatarObject);
      },
    );
  }
}
