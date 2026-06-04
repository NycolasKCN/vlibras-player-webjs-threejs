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
import EventEmitter from "events";

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

export class VLibrasExperience extends EventEmitter implements Experience {
  private readonly runtime: SceneRuntime;
  private readonly timer = new Three.Timer();
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
    );
    this.runtime.scene.add(avatar.object);
    this.dependencies.animationController.bind(avatar.object, []);

    this.emit("load");
    console.debug("[Experience] load emited");
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

  private updateObjects = (): void => {
    this.timer.update();
    this.dependencies.animationController.update(this.timer.getDelta());
  };
}
