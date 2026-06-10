import * as Three from "three";
import EventEmitter from "events";

export interface SubtitleController {
  start(subtitleContainer: HTMLDivElement): void;
  toggleSubtitle(): void;
  update(text: string): void;
  clear(): void;
}

export class HtmlSubtitleController
  extends EventEmitter
  implements SubtitleController
{
  private _subtitleElement?: HTMLParagraphElement;
  private enabled: boolean = true;

  constructor() {
    super();
  }

  start(subtitleContainer: HTMLDivElement): void {
    this._subtitleElement = document.createElement("p");
    Object.assign(this._subtitleElement.style, {
      display: this.enabled ? "block" : "none",
      color: "#2b2b2b",
      fontSize: "20px",
      fontWeight: "600",
      fontFamily: "arial",
      whiteSpace: "nowrap",
    });
    subtitleContainer.appendChild(this._subtitleElement);
  }

  toggleSubtitle(): void {
    this.enabled = !this.enabled;
    if (this._subtitleElement) {
      Object.assign(this._subtitleElement.style, {
        display: this.enabled ? "block" : "none",
      });
    }
    this.emit("subtitle:toggle", { enabled: this.enabled });
  }

  update(text: string): void {
    if (!this._subtitleElement) return;
    this._subtitleElement.textContent = text;
  }

  clear(): void {
    if (!this._subtitleElement) return;
    this._subtitleElement.textContent = "";
  }
}
