import { EventEmitter } from "events";
import * as Three from "three";
import { AnimationLoader, GltfAnimationLoader } from "./animation-loader";
import { SubtitleController } from "./subtitle-controller";

export interface AnimationController extends EventEmitter {
  start(
    object: Three.Object3D,
    clips: Three.AnimationClip[],
    subtitleController: SubtitleController,
  ): void;
  update(delta: number): void;
  pause(): void;
  stop(): void;
  setSpeed(speed: number): void;
  listAnimations(): string[];
  playGlosa(glosa?: string): void;
}

interface ActiveAnimation {
  index: number;
  action: Three.AnimationAction;
}

export class MixerAnimationController
  extends EventEmitter
  implements AnimationController
{
  private mixer?: Three.AnimationMixer;
  private clips: Three.AnimationClip[] = [];
  private currentAnimation?: ActiveAnimation;
  private animationLoader: AnimationLoader = new GltfAnimationLoader();
  private subtitleController?: SubtitleController;
  private _speed: number = 1;

  public start(
    object: Three.Object3D,
    clips: Three.AnimationClip[],
    subtitleController: SubtitleController,
  ): void {
    this.subtitleController = subtitleController;
    this.currentAnimation = undefined;
    this.mixer = new Three.AnimationMixer(object);
    this.mixer.addEventListener("finished", () => {
      this.play();
    });
  }

  async playGlosa(glosa?: string): Promise<void> {
    // if (this.isPlaying) {
    //   this.stop();
    // }
    if (glosa) {
      this.isLoading = true;
      await this.loadAnimationClips(glosa);
      this.isLoading = false;
    }

    this.play();
  }

  public pause(): void {
    if (!this.mixer) {
      return;
    }
    this.mixer.timeScale = 0;
    this.isPaused = true;
  }

  public stop(): void {
    if (this.currentAnimation) {
      this.currentAnimation.action.stop();
    }
    this.finishedCleanup();
  }

  public setSpeed(speed: number): void {
    if (!this.mixer || speed > 2.5 || speed < 0.5) {
      return;
    }
    this._speed = speed;

    if (!this.isPaused) {
      console.debug("[Animation] setting mixer timeScale", speed);
      this.mixer.timeScale = speed;
    }
  }

  public update(delta: number): void {
    if (!this.mixer) {
      return;
    }
    this.mixer.update(delta);
  }

  public listAnimations(): string[] {
    return this.clips.map((clip) => clip.name);
  }

  private async loadAnimationClips(glosa: string) {
    const words: string[] = glosa
      .split(" ")
      .filter((word) => {
        return !(word.startsWith("[") && word.endsWith("]"));
      })
      .map((word) => {
        return word.trim().replace(/\u200E/g, "");
      });

    const loadedClips = await this.animationLoader.load(words);
    this.clips = loadedClips.clips;
  }

  private play(): void {
    if (!this.mixer || this.clips.length === 0) {
      return;
    }

    if (this.isPaused) {
      this.resume();
      return;
    }

    let nextAnimationIndex = 0;
    if (this.currentAnimation) {
      nextAnimationIndex = this.currentAnimation.index + 1;
    }

    if (nextAnimationIndex >= this.clips.length) {
      this.finishedCleanup();
      return;
    }

    this.playAnimation(nextAnimationIndex);
  }

  private resume() {
    if (!this.mixer) return;

    this.mixer.timeScale = this._speed;
    this.isPaused = false;
  }

  // FIXME: Corrigir problema do crossFading que não tá funcionando pois o fluxo segue:
  // [clip 1 começa] ──► [clip 1 termina] ──► evento "finished" ──► [clip 2 começa]
  private playAnimation(index: number): void {
    if (!this.mixer || this.clips.length === 0) {
      return;
    }

    const clip = this.clips[index];
    const action = this.mixer.clipAction(clip);
    action.reset();
    action.weight = 1;
    action.setLoop(Three.LoopOnce, 1);
    action.clampWhenFinished = true;

    if (this.currentAnimation) {
      action.crossFadeFrom(this.currentAnimation.action, 0.2, true);
    }

    console.debug("[Animation] Playing animation: ", clip.name);
    this.subtitleController?.update(clip.name);
    this.isPlaying = true;
    action.play();
    this.currentAnimation = { index, action };
    this.emitProgress();
  }

  private finishedCleanup(): void {
    console.debug("[Animation] animation finished");
    this.subtitleController?.clear();
    this.currentAnimation = undefined;
    this.mixer?.stopAllAction();
    this.clips.forEach((clip) => {
      this.mixer?.uncacheAction(clip);
    });
    this.isPlaying = false;
  }

  private emitProgress(): void {
    const progress = this.currentAnimation
      ? this.currentAnimation.index + 1
      : 0;
    this.emit("state:progress", { progress, total: this.clips.length });
  }

  private _isPaused: boolean = false;
  private _isPlaying: boolean = false;
  private _isLoading: boolean = false;
  private get isPaused(): boolean {
    return this._isPaused;
  }
  private set isPaused(value: boolean) {
    if (this._isPaused !== value) {
      this._isPaused = value;
      this.emit("state:change", {
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        isLoading: this.isLoading,
      });
    }
  }

  private get isPlaying(): boolean {
    return this._isPlaying;
  }
  private set isPlaying(value: boolean) {
    if (this._isPlaying !== value) {
      this._isPlaying = value;
      this.emit("state:change", {
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        isLoading: this.isLoading,
      });
    }
  }

  private get isLoading(): boolean {
    return this._isLoading;
  }
  private set isLoading(value: boolean) {
    if (this._isLoading !== value) {
      this._isLoading = value;
      this.emit("state:change", {
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        isLoading: this.isLoading,
      });
    }
  }
}
