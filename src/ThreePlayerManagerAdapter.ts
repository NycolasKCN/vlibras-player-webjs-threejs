import { VLibrasExperience } from "./experience/VLibrasExperience";
import { AbstractPlayerManagerAdapter } from "./PlayerManagerAdapter";

export default class ThreePlayerManagerAdapter extends AbstractPlayerManagerAdapter<VLibrasExperience> {
  subtitle: boolean;
  currentBaseUrl: string;

  constructor() {
    super();
    this.subtitle = true;
    this.currentBaseUrl = "";
  }

  setPlayerReference(player: VLibrasExperience): void {
    this.player = player;
    this.registerExperienceEvents();
  }

  applyEmotion(action: string, intensity: number | string): void {
    console.log("applyEmotion: ", action, intensity);
  }

  play(glosa?: string): void {
    console.log("play: ", glosa);
  }

  pause(): void {
    console.log("pause");
  }

  stop(): void {
    console.log("stop");
  }

  setSpeed(speed: number): void {
    console.log("setSpeed: ", speed);
  }

  toggleSubtitle(): void {
    console.log("toggleSubtitle");
  }

  setPersonalization(personalization: string): void {
    console.log("setPersonalization: ", personalization);
  }

  playWellcome(): void {
    console.log("playWellcome");
  }

  changeAvatar(avatarName: string): void {
    console.log("changeAvatar: ", avatarName);
  }

  setBaseUrl(url: string): void {
    console.log("setBaseUrl: ", url);
  }

  private registerExperienceEvents(): void {
    if (!this.player) {
      console.error("Player is not assigned.");
      return;
    }

    this.player.on("load", () => {
      this.emit("load");
      this.player!.start();
    });
  }
}
