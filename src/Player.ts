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

let globalGlosaLenght = "";

const CANVAS_ID = "#canvas";

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
  loaded: boolean;
  progress: unknown | null;
  status: PlayerStatus;
  region: string;
  onError!: (reason: string) => void;

  constructor(options: PlayerOptions = {}) {
    super();
    console.log("WebJS Constructor options: ", options);
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

    this.playerManager.on("load", () => {
      this.loaded = true;
      this.emit("load");

      this.playerManager.setBaseUrl(config.dictionaryUrl);

      if (this.options.onLoad) {
        this.options.onLoad();
      } else {
        this.play(null, { fromTranslation: true });
      }
    });

    this.playerManager.on("progress", (progress: number) => {
      this.emit("animation:progress", progress);
    });

    this.playerManager.on(
      "stateChange",
      (isPlaying: boolean, isPaused: boolean, isLoading: boolean) => {
        if (isPaused) {
          this.emit("animation:pause");
        } else if (isPlaying && !isPaused) {
          this.emit("animation:play");
          this.changeStatus(STATUSES.playing);
        } else if (!isPlaying && !isLoading) {
          this.emit("animation:end");
          this.changeStatus(STATUSES.idle);
        }
      },
    );

    this.playerManager.on(
      "CounterGloss",
      (counter: number, glosaLenght: string) => {
        this.emit("response:glosa", counter, glosaLenght);
        globalGlosaLenght = glosaLenght;
      },
    );

    this.playerManager.on("GetAvatar", (avatar: string) => {
      this.emit("GetAvatar", avatar);
    });

    this.playerManager.on("FinishWelcome", (bool: boolean) => {
      this.emit("stop:welcome", bool);
    });
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
    this.playerManager.playWellcome();
    this.emit("start:welcome");
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

  load(wrapper: HTMLElement): void {
    this.gameContainer = document.createElement("div");
    this.gameContainer.setAttribute("id", "gameContainer");
    this.gameContainer.classList.add("emscripten");
    assign(this.gameContainer.style, {
      margin: "0px",
      padding: "0px",
      border: "0px",
      position: "relative",
      background: "rgb(255, 255, 255)",
    });

    this.gameCanvas = document.createElement("canvas");
    this.gameCanvas.setAttribute("id", CANVAS_ID);
    assign(this.gameCanvas.style, {
      cursor: "default",
      minHeight: "calc(0.7 * 450px)",
      minWidth: "calc(0.9 * 300)",
      width: "100%",
      height: "100%",
      aspectRatio: "auto",
    });
    this.gameContainer.appendChild(this.gameCanvas);

    if (typeof this.options.progress === "function") {
      this.progress = new this.options.progress(wrapper);
    }

    wrapper.appendChild(this.gameContainer);

    this._initialize();
  }

  private async _initialize(): Promise<void> {
    if (!WebGL.isWebGL2Available()) {
      this.onError("unsupported");
      alert("Seu navegador não suporta WEBGL");
      console.error("Seu navegador não suporta WEBGL");
      return;
    }
    if (!this.gameCanvas) {
      this.onError("canvas not initialized");
      alert("Player não foi inicializado corretamente.");
      console.error("Player não foi inicializado corretamente.");
      return;
    }
    this.player = createVLibrasExperience(this.gameCanvas, config.baseModelUrl);
    this.playerManager.setPlayerReference(this.player);
    await this.player.init();
    this.player.start();
    this.player.cycleAnimations();
  }

  private changeStatus(status: PlayerStatus): void {
    switch (status) {
      case STATUSES.idle:
        if (this.status === STATUSES.playing) {
          this.status = status;
          this.emit("gloss:end", globalGlosaLenght);
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
}
