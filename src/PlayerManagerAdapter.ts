import { EventEmitter } from "events";

const GAME_OBJECT = "PlayerManager";
const EMOTION_OBJECT = "EmotionBridge";
const CUSTOMIZATION_OBJECT = "CustomizationBridge";

type UnityMessageParam = string | number | undefined;

export default class PlayerManagerAdapter extends EventEmitter {
  static instance: PlayerManagerAdapter | null = null;
  subtitle: boolean;
  currentBaseUrl: string;
  player?: UnityPlayerInstance;

  private constructor() {
    super();
    this.subtitle = true;
    this.currentBaseUrl = "";

    this.on("load", () => {
      this._send("initRandomAnimationsProcess");
    });

    PlayerManagerAdapter.instance = this;
  }

  static getInstance(): PlayerManagerAdapter {
    if (!PlayerManagerAdapter.instance) {
      PlayerManagerAdapter.instance = new PlayerManagerAdapter();
    }

    return PlayerManagerAdapter.instance;
  }

  setPlayerReference(player: UnityPlayerInstance): void {
    this.player = player;
  }

  // @param method qual método o player deve executar (UnityPlayer)
  // - playNow
  // - setPauseState
  // - setUrl
  // - stopAll
  // - setSlider
  // - setSubtitlesState
  // - playWellcome
  // - Change
  // @param params
  // - glosa?
  private _send(method: string, params?: UnityMessageParam): void {
    this.player!.SendMessage(GAME_OBJECT, method, params);
  }

  applyEmotion(action: string, intensity: number | string): void {
    this.player!.SendMessage(EMOTION_OBJECT, action, intensity);
  }

  play(glosa?: string): void {
    if (glosa) this._send("playNow", glosa);
    else this._send("setPauseState", 0);
  }

  setPersonalization(personalization: string): void {
    this.player!.SendMessage(CUSTOMIZATION_OBJECT, "setURL", personalization);
  }

  pause(): void {
    this._send("setPauseState", 1);
  }

  stop(): void {
    this._send("stopAll");
  }

  setSpeed(speed: number): void {
    this._send("setSlider", speed);
  }

  toggleSubtitle(): void {
    this.subtitle = !this.subtitle;
    this._send("setSubtitlesState", toInt(this.subtitle));
  }

  playWellcome(): void {
    this._send("playWellcome");
  }

  changeAvatar(avatarName: string): void {
    this._send("Change", avatarName);
  }

  setBaseUrl(url: string): void {
    this._send("setBaseUrl", url);
    this.currentBaseUrl = url;
  }
}

window.onLoadPlayer = function (): void {
  PlayerManagerAdapter.instance!.emit("load");
};

window.updateProgress = function (progress: number): void {
  PlayerManagerAdapter.instance!.emit("progress", progress);
};

window.onPlayingStateChange = function (
  isPlaying: unknown,
  isPaused: unknown,
  _isPlayingIntervalAnimation: unknown,
  isLoading: unknown,
  _isRepeatable: unknown
): void {
  PlayerManagerAdapter.instance!.emit(
    "stateChange",
    toBoolean(isPlaying),
    toBoolean(isPaused),
    toBoolean(isLoading)
  );
};

window.CounterGloss = function (counter: number, glosaLenght: string): void {
  PlayerManagerAdapter.instance!.emit("CounterGloss", counter, glosaLenght);
};

window.GetAvatar = function (avatar: string): void {
  PlayerManagerAdapter.instance!.emit("GetAvatar", avatar);
};

window.FinishWelcome = function (bool: boolean): void {
  PlayerManagerAdapter.instance!.emit("FinishWelcome", bool);
};

function toInt(boolean: boolean): number {
  return !boolean ? 0 : 1;
}

function toBoolean(bool: unknown): boolean {
  return bool != "False";
}
