import { EventEmitter } from "events";

export interface PlayerManagerAdapter<T> extends EventEmitter {
  currentBaseUrl: string;
  setPlayerReference(player: T): void;
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

export abstract class AbstractPlayerManagerAdapter<T>
  extends EventEmitter
  implements PlayerManagerAdapter<T>
{
  protected player: T | null;
  abstract currentBaseUrl: string;

  protected constructor() {
    super();
    this.player = null;
  }

  setPlayerReference(player: T): void {
    this.player = player;
  }

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
