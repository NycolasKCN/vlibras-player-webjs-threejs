import { AbstractPlayerManagerAdapter } from "./PlayerManagerAdapter";
import { toBoolean, toInt } from "./utils";

type UnityMessageParam = string | number | undefined;

const GAME_OBJECT = "PlayerManager";
const EMOTION_OBJECT = "EmotionBridge";
const CUSTOMIZATION_OBJECT = "CustomizationBridge";

export default class UnityPlayerManagerAdapter extends AbstractPlayerManagerAdapter<UnityPlayerInstance> {
  subtitle: boolean;
  currentBaseUrl: string;

  constructor() {
    super();
    this.subtitle = true;
    this.currentBaseUrl = "";
    this.registerUnityCallbacks();

    this.on("load", () => {
      this._send("initRandomAnimationsProcess");
    });
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
}
