import * as Three from 'three';

export interface AnimationController {
  bind(object: Three.Object3D, clips: Three.AnimationClip[]): void;
  cycleAnimations(): void;
  update(delta: number): void;
  playAnimation(index: number): void;
  listAnimations(): string[];
}

interface ActiveAnimation {
  index: number;
  action: Three.AnimationAction;
}

export class MixerAnimationController implements AnimationController {
  private mixer?: Three.AnimationMixer;
  private clips: Three.AnimationClip[] = [];
  private currentAnimation?: ActiveAnimation;
  private isAnimationCycleEnabled?: boolean = false;

  public bind(object: Three.Object3D, clips: Three.AnimationClip[]): void {
    this.clips = clips;
    this.currentAnimation = undefined;
    this.mixer = new Three.AnimationMixer(object);
    this.mixer.addEventListener('finished', this.handleAnimationFinished);
  }

  public cycleAnimations(): void {
    if (!this.mixer || this.clips.length === 0) {
      return;
    }

    this.isAnimationCycleEnabled = true;
    let nextAnimationIndex = 0;
    if (this.currentAnimation) {
      nextAnimationIndex = this.currentAnimation.index + 1;
    }
    if (nextAnimationIndex >= this.clips.length) {
      nextAnimationIndex = 0;
    }

    this.playAnimation(nextAnimationIndex);
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

  public playAnimation(index: number): void {
    if (!this.mixer || this.clips.length === 0) {
      return;
    }

    const clip = this.clips[index];
    const action = this.mixer.clipAction(clip);

    action.reset();
    action.setLoop(Three.LoopOnce, 1);
    action.clampWhenFinished = true;

    if (this.currentAnimation) {
      action.crossFadeFrom(this.currentAnimation.action, 0.25, true);
    }

    action.play();
    this.currentAnimation = {
      index,
      action,
    };
  }

  private readonly handleAnimationFinished = (): void => {
    if (this.isAnimationCycleEnabled) {
      this.cycleAnimations();
    }
  };
}
