import assign from "object-assign";
import { EventEmitter } from "events";
import urlJoin from "url-join";

import * as config from "./config";
import GlosaTranslator from "./GlosaTranslator";
import PlayerManagerAdapter from "./PlayerManagerAdapter";

const STATUSES = {
  idle: "idle",
  preparing: "preparing",
  playing: "playing"
} as const;

type PlayerStatus = (typeof STATUSES)[keyof typeof STATUSES];

type ProgressConstructor = new (wrapper: HTMLElement) => unknown;

export interface PlayerOptions {
  translator?: string;
  targetPath?: string;
  onLoad?: () => void;
  progress?: ProgressConstructor;
  [key: string]: unknown;
}

export interface TranslateOptions {
  isEnabledStats?: boolean;
}

export interface PlayOptions {
  fromTranslation?: boolean;
  isEnabledStats?: boolean;
}

type NormalizedPlayerOptions = PlayerOptions & {
  translator: string;
  targetPath: string;
};

let globalGlosaLenght = "";

export default class Player extends EventEmitter {
  options: NormalizedPlayerOptions;
  playerManager: PlayerManagerAdapter;
  translator: GlosaTranslator;
  translated: boolean;
  text?: string;
  gloss?: string;
  loaded: boolean;
  progress: unknown | null;
  gameContainer: HTMLDivElement | null;
  player: UnityPlayerInstance | null;
  status: PlayerStatus;
  region: string;
  onError!: (reason: string) => void;

  constructor(options: PlayerOptions = {}) {
    super();
    this.options = assign(
      {
        translator: config.translatorUrl,
        targetPath: "target"
      },
      options
    ) as NormalizedPlayerOptions;

    this.playerManager = PlayerManagerAdapter.getInstance();
    this.translator = new GlosaTranslator(this.options.translator);

    this.translated = false;
    this.text = undefined;
    this.gloss = undefined;
    this.loaded = false;
    this.progress = null;
    this.gameContainer = null;
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
      }
    );

    this.playerManager.on(
      "CounterGloss",
      (counter: number, glosaLenght: string) => {
        this.emit("response:glosa", counter, glosaLenght);
        globalGlosaLenght = glosaLenght;
      }
    );

    this.playerManager.on("GetAvatar", (avatar: string) => {
      this.emit("GetAvatar", avatar);
    });

    this.playerManager.on("FinishWelcome", (bool: boolean) => {
      this.emit("stop:welcome", bool);
    });
  }

  translate(text: string, { isEnabledStats = true }: TranslateOptions = {}): void {
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
    { fromTranslation = false, isEnabledStats = true }: PlayOptions = {}
  ): void {
    const isDefaultUrl =
      this.playerManager.currentBaseUrl ===
      config.dictionaryUrl + this.region + "/";

    if (!isEnabledStats && isDefaultUrl) {
      this.playerManager.setBaseUrl(
        config.dictionaryStaticUrl + this.region + "/"
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

    if (typeof this.options.progress === "function") {
      this.progress = new this.options.progress(wrapper);
    }

    wrapper.appendChild(this.gameContainer);

    this._initializeTarget();
  }

  private _getTargetScript(): string {
    return urlJoin(this.options.targetPath, "UnityLoader.js");
  }

  private _initializeTarget(): void {
    const targetSetup = urlJoin(this.options.targetPath, "playerweb.json");
    const targetScript = document.createElement("script");

    targetScript.src = this._getTargetScript();
    targetScript.onload = () => {
      this.player = UnityLoader.instantiate("gameContainer", targetSetup, {
        compatibilityCheck: (_: unknown, accept: () => void, deny: () => void) => {
          if (UnityLoader.SystemInfo.hasWebGL) {
            return accept();
          }

          this.onError("unsupported");
          alert("Seu navegador não suporta WEBGL");
          console.error("Seu navegador não suporta WEBGL");
          deny();
        }
      });

      this.playerManager.setPlayerReference(this.player!);
    };

    document.body.appendChild(targetScript);
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
