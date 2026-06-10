import { AnimationController } from "./experience/animation-controller";
import { AvatarController } from "./experience/avatar-controller";
import { SubtitleController } from "./experience/subtitle-controller";
import { VLibrasExperience } from "./experience/VLibrasExperience";
import { AbstractPlayerManagerAdapter } from "./PlayerManagerAdapter";

export default class ThreePlayerManagerAdapter extends AbstractPlayerManagerAdapter<VLibrasExperience> {
  subtitle: boolean;
  currentBaseUrl: string;
  animationController: AnimationController | null;
  subtitleController: SubtitleController | null;
  avatarController: AvatarController | null;

  constructor() {
    super();
    this.subtitle = true;
    this.currentBaseUrl = "";
    this.animationController = null;
    this.subtitleController = null;
    this.avatarController = null;
  }

  setPlayerReference(player: VLibrasExperience): void {
    this.player = player;
    this.animationController = this.player.getAnimationController();
    this.subtitleController = this.player.getSubtitleController();
    this.avatarController = this.player.getAvatarController();
    this.registerExperienceEvents();
  }

  applyEmotion(action: string, intensity: number | string): void {
    console.debug("[PlayerManager] applyEmotion: ", action, intensity);
  }

  play(glosa?: string): void {
    console.debug("[PlayerManager] play: ", glosa);
    this.animationController?.play(glosa);
  }

  pause(): void {
    console.debug("[PlayerManager] pause");
    this.animationController?.pause();
  }

  stop(): void {
    console.debug("[PlayerManager] stop");
    this.animationController?.stop();
  }

  setSpeed(speed: number): void {
    console.debug("[PlayerManager] setSpeed: ", speed);
    this.animationController?.setSpeed(speed);
  }

  toggleSubtitle(): void {
    console.debug("[PlayerManager] toggleSubtitle");
    this.subtitleController?.toggleSubtitle();
  }

  setPersonalization(personalization: string): void {
    console.debug("[PlayerManager] setPersonalization: ", personalization);
  }

  playWellcome(): void {
    console.debug("[PlayerManager] playWellcome");
  }

  changeAvatar(avatarName: string): void {
    console.debug("[PlayerManager] changeAvatar: ", avatarName);
    this.avatarController?.changeAvatar(avatarName);
  }

  setBaseUrl(url: string): void {
    console.debug("[PlayerManager] setBaseUrl: ", url);
  }

  private registerExperienceEvents(): void {
    this.player!.on("load", () => {
      this.emit("load");
      this.player!.start();
    });

    this.animationController!.on(
      "state:change",
      (state: {
        isPlaying: boolean;
        isPaused: boolean;
        isLoading: boolean;
      }) => {
        this.emit("state:change", state);
      },
    );

    this.animationController!.on(
      "state:progress",
      (state: { progress: number; total: number }) => {
        this.emit("state:progress", state);
      },
    );

    this.avatarController!.on("avatar:change", (avatarName: string) => {
      this.emit("GetAvatar", { avatar: avatarName });
    });
  }
}
