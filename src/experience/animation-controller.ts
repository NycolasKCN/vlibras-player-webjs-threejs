import { EventEmitter } from "events";
import * as Three from "three";
import { AnimationLoader, GltfAnimationLoader } from "./animation-loader";
import { SubtitleController } from "./subtitle-controller";
import { GlossAnimationClip } from "./types";
import { alphabetGenerator } from "./util";

export interface AnimationController extends EventEmitter {
  start(object: Three.Object3D, subtitleController: SubtitleController): void;
  update(delta: number): void;
  pause(): void;
  stop(): void;
  setSpeed(speed: number): void;
  listAnimations(): string[];
  play(glosa?: string): void;
}

interface ActiveAnimation {
  index: number;
  action?: Three.AnimationAction;
}

export class MixerAnimationController
  extends EventEmitter
  implements AnimationController
{
  private mixer?: Three.AnimationMixer;
  private glossAnimationClips: GlossAnimationClip[] = [];
  private alphabet: Map<string, GlossAnimationClip> = new Map();
  private currentAnimation?: ActiveAnimation;
  private animationLoader: AnimationLoader = new GltfAnimationLoader();
  private subtitleController?: SubtitleController;
  private _speed: number = 1;

  async start(
    object: Three.Object3D,
    subtitleController: SubtitleController,
  ): Promise<void> {
    this.subtitleController = subtitleController;
    this.currentAnimation = undefined;
    await this.loadAlphabet();
    this.mixer = new Three.AnimationMixer(object);
    this.mixer.addEventListener("finished", () => {
      this.play();
    });
  }

  async play(glosa?: string): Promise<void> {
    if (glosa) {
      this.isLoading = true;
      await this.loadClips(glosa);
      this.isLoading = false;
    }

    if (!this.mixer || this.glossAnimationClips.length === 0) {
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

    if (nextAnimationIndex >= this.glossAnimationClips.length) {
      this.finishedCleanup();
      return;
    }

    this.playAnimation(nextAnimationIndex);
  }

  pause(): void {
    if (!this.mixer) {
      return;
    }
    this.mixer.timeScale = 0;
    this.isPaused = true;
  }

  stop(): void {
    if (this.currentAnimation) {
      this.currentAnimation.action?.stop();
    }
    this.finishedCleanup();
  }

  setSpeed(speed: number): void {
    if (!this.mixer || speed > 2.5 || speed < 0.5) {
      return;
    }
    this._speed = speed;

    if (!this.isPaused) {
      console.debug("[Animation] setting mixer timeScale", speed);
      this.mixer.timeScale = speed;
    }
  }

  update(delta: number): void {
    if (!this.mixer) {
      return;
    }
    this.mixer.update(delta);
  }

  listAnimations(): string[] {
    return this.glossAnimationClips.map((clip) => clip.word);
  }

  private async loadClips(glosa: string) {
    const words: string[] = glosa
      .split(" ")
      .filter((word) => {
        return !(word.startsWith("[") && word.endsWith("]"));
      })
      .map((word) => {
        return word.trim().replace(/\u200E/g, "");
      });

    const clips = await this.animationLoader.load(words);
    this.glossAnimationClips = clips;
  }

  private resume() {
    if (!this.mixer) return;

    this.mixer.timeScale = this._speed;
    this.isPaused = false;
  }

  // FIXME: Corrigir problema do crossFading que não tá funcionando pois o fluxo segue:
  // [clip 1 começa] ──► [clip 1 termina] ──► evento "finished" ──► [clip 2 começa]
  private playAnimation(index: number): void {
    if (!this.mixer || this.glossAnimationClips.length === 0) {
      return;
    }

    const glossToPlay = this.glossAnimationClips[index];
    if (!glossToPlay.clip) {
      // FIXME: Implementar caminho alternativo para SOLETRAR a plavra
      console.debug("[AnimationController] gloss don't have any clip, skiping");
      this.currentAnimation = { index };
      this.play();
      return;
    }

    const action = this.mixer.clipAction(glossToPlay.clip);
    action.reset();
    action.weight = 1;
    action.setLoop(Three.LoopOnce, 1);
    action.clampWhenFinished = true;

    if (this.currentAnimation && this.currentAnimation.action) {
      action.crossFadeFrom(this.currentAnimation.action, 0.2, true);
    }

    console.debug(
      "[AnimationController] Playing clip: ",
      glossToPlay.clip.name,
    );
    this.subtitleController?.update(glossToPlay.word);
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
    this.glossAnimationClips.forEach((gloss) => {
      if (gloss.clip) {
        this.mixer?.uncacheAction(gloss.clip);
      }
    });
    this.isPlaying = false;
  }

  private emitProgress(): void {
    const progress = this.currentAnimation
      ? this.currentAnimation.index + 1
      : 0;
    this.emit("state:progress", {
      progress,
      total: this.glossAnimationClips.length,
    });
  }

  private async loadAlphabet(): Promise<void> {
    const alphabet = [...alphabetGenerator("A", "Z")];
    const clips = await this.animationLoader.load(alphabet);
    clips.forEach((clip: GlossAnimationClip) => {
      this.alphabet.set(clip.word, clip);
    });
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
