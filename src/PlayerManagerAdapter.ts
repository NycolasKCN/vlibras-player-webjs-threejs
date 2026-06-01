import { EventEmitter } from "events";
import { toBoolean } from "./utils";

export interface PlayerManagerAdapter extends EventEmitter {
  currentBaseUrl: string;
  setPlayerReference(player: UnityPlayerInstance): void;
  applyEmotion(action: string, intensity: number | string): void;
  play(glosa?: string): void;
  pause(): void;
  stop(): void;
  setSpeed(speed: number): void;
  toggleSubtitle(): void;
  setPersonalization(personalization: string): void;
  playWellcome(): void;
  changeAvatar(avatarName: string): void;
  setBaseUrl(url: string): void;
}

export abstract class AbstractPlayerManagerAdapter
  extends EventEmitter
  implements PlayerManagerAdapter {
  protected constructor() {
    super();
    this.registerUnityCallbacks();
  }

  private registerUnityCallbacks(): void {
    window.onLoadPlayer = (): void => {
      this.emit("load");
    };

    window.updateProgress = (progress: number): void => {
      this.emit("progress", progress);
    };

    window.onPlayingStateChange = (
      isPlaying: unknown,
      isPaused: unknown,
      _isPlayingIntervalAnimation: unknown,
      isLoading: unknown,
      _isRepeatable: unknown,
    ): void => {
      this.emit(
        "stateChange",
        toBoolean(isPlaying),
        toBoolean(isPaused),
        toBoolean(isLoading),
      );
    };

    window.CounterGloss = (counter: number, glosaLength: string): void => {
      this.emit("CounterGloss", counter, glosaLength);
    };

    window.GetAvatar = (avatar: string): void => {
      this.emit("GetAvatar", avatar);
    };

    window.FinishWelcome = (value: boolean): void => {
      this.emit("FinishWelcome", value);
    };
  }

  abstract currentBaseUrl: string;
  abstract setPlayerReference(player: UnityPlayerInstance): void;
  abstract applyEmotion(action: string, intensity: number | string): void;
  abstract play(glosa?: string): void;
  abstract pause(): void;
  abstract stop(): void;
  abstract setSpeed(speed: number): void;
  abstract toggleSubtitle(): void;
  abstract setPersonalization(personalization: string): void;
  abstract playWellcome(): void;
  abstract changeAvatar(avatarName: string): void;
  abstract setBaseUrl(url: string): void;
}
