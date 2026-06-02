import { VLibrasExperience } from "./experience/VLibrasExperience";
import { AbstractPlayerManagerAdapter } from "./PlayerManagerAdapter";

export default class ThreePlayerManagerAdapter extends AbstractPlayerManagerAdapter<VLibrasExperience> {
  subtitle: boolean;
  currentBaseUrl: string;

  constructor() {
    super();
    this.subtitle = true;
    this.currentBaseUrl = "";

    this.on("load", () => {});
  }

  applyEmotion(action: string, intensity: number | string): void {
    throw new Error("Method not implemented.");
  }

  play(glosa?: string): void {
    throw new Error("Method not implemented.");
  }

  pause(): void {
    throw new Error("Method not implemented.");
  }

  stop(): void {
    throw new Error("Method not implemented.");
  }

  setSpeed(speed: number): void {
    throw new Error("Method not implemented.");
  }

  toggleSubtitle(): void {
    throw new Error("Method not implemented.");
  }

  setPersonalization(personalization: string): void {
    throw new Error("Method not implemented.");
  }

  playWellcome(): void {
    throw new Error("Method not implemented.");
  }

  changeAvatar(avatarName: string): void {
    throw new Error("Method not implemented.");
  }

  setBaseUrl(url: string): void {
    throw new Error("Method not implemented.");
  }
}
