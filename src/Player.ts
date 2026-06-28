import assign from "object-assign";
import { EventEmitter } from "events";
import { WebGL } from "three/examples/jsm/Addons";

import * as config from "./config";
import GlosaTranslator from "./GlosaTranslator";
import { PlayerManagerAdapter } from "./PlayerManagerAdapter";
import ThreePlayerManagerAdapter from "./ThreePlayerManagerAdapter";
import {
  NormalizedPlayerOptions,
  PlayerStatus,
  PlayerOptions,
  PlayOptions,
  TranslateOptions,
  STATUSES,
} from "./types/player.types";
import { VLibrasExperience } from "./experience/VLibrasExperience";
import { createVLibrasExperience } from "./experience/create-vlibras-experience";

export default class Player extends EventEmitter {
  options: NormalizedPlayerOptions;
  playerManager: PlayerManagerAdapter<VLibrasExperience>;
  player: VLibrasExperience | null;
  gameContainer: HTMLDivElement | null;
  gameCanvas: HTMLCanvasElement | null;
  translator: GlosaTranslator;
  translated: boolean;
  text?: string;
  gloss?: string;
  glosaLen: number = 0;
  loaded: boolean;
  progress: unknown | null;
  status: PlayerStatus;
  region: string;
  onError!: (reason: string) => void;

  load(wrapper: HTMLElement): void {
    if (typeof this.options.progress === "function") {
      this.progress = new this.options.progress(wrapper);
    }
    if (!WebGL.isWebGL2Available()) {
      this.onError("unsupported");
      alert("Seu navegador não suporta WEBGL");
      console.error("Seu navegador não suporta WEBGL");
      return;
    }

    this.player = createVLibrasExperience(wrapper);
    this.playerManager.setPlayerReference(this.player);

    this.player.load();
  }

  constructor(options: PlayerOptions = {}) {
    super();
    console.debug("[Player] WebJS Constructor options: ", options);
    this.options = assign(
      {
        translator: config.translatorUrl,
        targetPath: "target",
      },
      options,
    ) as NormalizedPlayerOptions;

    this.playerManager = new ThreePlayerManagerAdapter();
    this.translator = new GlosaTranslator(this.options.translator);

    this.translated = false;
    this.text = undefined;
    this.gloss = undefined;
    this.loaded = false;
    this.progress = null;
    this.gameContainer = null;
    this.gameCanvas = null;
    this.player = null;
    this.status = STATUSES.idle;
    this.region = "BR";

    this.registerPlayerManagerEvents();
  }

  translate(
    text: string,
    { isEnabledStats = true }: TranslateOptions = {},
  ): void {
    this.emit("translate:start");

    if (this.loaded) {
      this.stop();
    }

    this.text = text;

    this.translator.translate(text, location.host, (gloss, error) => {
      if (error) {
        this.play(text.toUpperCase());
        if (error === "timeout_error") this.emit("error", "timeout_error");
        else return this.emit("translate:end");
      }

      this.play(gloss, { fromTranslation: true, isEnabledStats });
      this.emit("translate:end");
    });
  }

  play(
    glosa?: string | null,
    { fromTranslation = false, isEnabledStats = true }: PlayOptions = {},
  ): void {
    const isDefaultUrl =
      this.playerManager.currentBaseUrl ===
      config.dictionaryUrl + this.region + "/";

    if (!isEnabledStats && isDefaultUrl) {
      this.playerManager.setBaseUrl(
        config.dictionaryStaticUrl + this.region + "/",
      );
    } else if (isEnabledStats && !isDefaultUrl) {
      this.playerManager.setBaseUrl(config.dictionaryUrl + this.region + "/");
    }

    this.translated = fromTranslation;
    this.gloss = glosa || this.gloss;

    if (this.gloss !== undefined && this.loaded) {
      this.changeStatus(STATUSES.preparing);
      this.playerManager.play(this.gloss);
    }
  }

  playWellcome(): void {
    this.emit("start:welcome");
    this.playerManager.playWellcome();
    this.emit("stop:welcome", true);
  }

  continue(): void {
    this.playerManager.play();
  }

  repeat(): void {
    this.play();
  }

  pause(): void {
    this.playerManager.pause();
  }

  stop(): void {
    this.playerManager.stop();
  }

  setSpeed(speed: number): void {
    this.playerManager.setSpeed(speed);
  }

  setPersonalization(personalization: string): void {
    this.playerManager.setPersonalization(personalization);
  }

  applyEmotion(action: string, intensity: number | string): void {
    this.playerManager.applyEmotion(action, intensity);
  }

  changeAvatar(avatarName: string): void {
    this.playerManager.changeAvatar(avatarName);
  }

  toggleSubtitle(): void {
    this.playerManager.toggleSubtitle();
  }

  setRegion(region: string): void {
    this.region = region;
    this.playerManager.setBaseUrl(config.dictionaryUrl + region + "/");
  }

  private changeStatus(status: PlayerStatus): void {
    console.debug("[Player] changeStatus to ", status);
    switch (status) {
      case STATUSES.idle:
        if (this.status === STATUSES.playing) {
          this.status = status;
          this.emit("gloss:end", this.glosaLen);
        }
        break;

      case STATUSES.preparing:
        this.status = status;
        break;

      case STATUSES.playing:
        if (this.status === STATUSES.preparing) {
          this.status = status;
          this.emit("gloss:start");
        }
        break;
    }
  }

  private registerPlayerManagerEvents(): void {
    this.playerManager.on("load", () => {
      console.debug("[Player] playerManager onLoad");
      this.loaded = true;
      this.emit("load");

      this.playerManager.setBaseUrl(config.dictionaryUrl);

      if (this.options.onLoad) {
        this.options.onLoad();
      } else {
        this.play(null, { fromTranslation: true });
      }

      console.debug("[Player] playerManager onLoad");
    });

    this.playerManager.on("progress", (progress: number) => {
      console.debug("[Player] playerManager progress", { progress });
      this.emit("animation:progress", progress);
    });

    this.playerManager.on(
      "state:change",
      (state: {
        isPlaying: boolean;
        isPaused: boolean;
        isLoading: boolean;
      }) => {
        console.debug("[Player] playerManager state:change", { state });
        if (state.isPaused) {
          this.emit("animation:pause");
        } else if (state.isPlaying && !state.isPaused) {
          this.emit("animation:play");
          this.changeStatus(STATUSES.playing);
        } else if (!state.isPlaying && !state.isLoading) {
          this.emit("animation:end");
          this.changeStatus(STATUSES.idle);
        }
      },
    );

    this.playerManager.on(
      "state:progress",
      (state: { progress: number; total: number }) => {
        console.debug("[Player] playerManager state:progress", { state });
        this.glosaLen = state.total;
        this.emit("response:glosa", state.progress, state.total);
      },
    );

    this.playerManager.on("GetAvatar", (avatar: string) => {
      console.debug("[Player] playerManager getAvatar", { avatar });
      this.emit("GetAvatar", avatar);
    });

    this.playerManager.on("FinishWelcome", (bool: boolean) => {
      this.emit("stop:welcome", bool);
    });
  }
}
