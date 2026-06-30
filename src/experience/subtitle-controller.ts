import EventEmitter from "events";

export interface SubtitleController {
  load(subtitleContainer: HTMLDivElement): void;
  toggleSubtitle(): void;
  update(text: string): void;
  clear(): void;
}

export class HtmlSubtitleController
  extends EventEmitter
  implements SubtitleController
{
  private _subtitleElement?: HTMLElement;
  private enabled = true;

  constructor() {
    super();
  }

  load(subtitleContainer: HTMLDivElement): void {
    this._subtitleElement = document.createElement("span");
    Object.assign(this._subtitleElement.style, {
      display: this.enabled ? "inline" : "none",
      width: "100%",
      color: "#2b2b2b",
      fontSize: "20px",
      fontWeight: "500",
      fontFamily: "arial",
      textAlign: "center",
      whiteSpace: "nowrap",
    });
    subtitleContainer.appendChild(this._subtitleElement);
  }

  toggleSubtitle(): void {
    this.enabled = !this.enabled;
    if (this._subtitleElement) {
      Object.assign(this._subtitleElement.style, {
        display: this.enabled ? "inline" : "none",
      });
    }
    this.emit("subtitle:toggle", { enabled: this.enabled });
  }

  update(text: string): void {
    if (!this._subtitleElement) return;
    this._subtitleElement.innerHTML = text;
  }

  clear(): void {
    if (!this._subtitleElement) return;
    this._subtitleElement.innerHTML = "";
  }
}
