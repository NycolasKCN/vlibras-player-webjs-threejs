import * as Three from "three";
import { SceneRuntime } from "./types";
import assign from "object-assign";

export interface SceneBootstrapConfig {
  readonly fov: number;
  readonly near: number;
  readonly far: number;
  readonly cameraPosition: [number, number, number];
}

export interface SceneBootstrapper {
  bootstrap(wrapper: HTMLElement): SceneRuntime;
}

const defaultConfig: SceneBootstrapConfig = {
  fov: 40,
  near: 0.1,
  far: 20,
  cameraPosition: [0, 5.5, 10],
};

export class ThreeSceneBootstrapper implements SceneBootstrapper {
  constructor(private readonly config: SceneBootstrapConfig = defaultConfig) {}

  public bootstrap(wrapper: HTMLElement): SceneRuntime {
    const [subtitleContainer, canvas] = this.bootstrapHtmlElements(wrapper);

    const renderer = new Three.WebGLRenderer({ antialias: true, canvas });
    const scene = new Three.Scene();
    scene.name = "root";
    scene.background = new Three.Color(0xebebeb);
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new Three.PerspectiveCamera(
      this.config.fov,
      aspect,
      this.config.near,
      this.config.far,
    );
    camera.position.set(...this.config.cameraPosition);
    scene.add(camera);

    return { subtitleContainer, canvas, renderer, scene, camera };
  }

  private bootstrapHtmlElements(
    wrapper: HTMLElement,
  ): [HTMLDivElement, HTMLCanvasElement] {
    if (!(wrapper instanceof HTMLDivElement)) {
      throw new Error("Wrapper element is not a div.");
    }

    const vlContainer = document.createElement("div");
    vlContainer.setAttribute("id", "gameContainer");
    vlContainer.classList.add("emscripten");
    assign(vlContainer.style, {
      margin: "0px",
      padding: "0px",
      border: "0px",
      position: "relative",
      background: "rgb(255, 255, 255)",
    });

    const vlCanvas = document.createElement("canvas");
    vlCanvas.setAttribute("id", "#canvas");
    assign(vlCanvas.style, {
      cursor: "default",
      minHeight: "calc(0.7 * 450px)",
      minWidth: "calc(0.9 * 300)",
      width: "100%",
      height: "100%",
      aspectRatio: "auto",
    });
    vlContainer.appendChild(vlCanvas);

    const vlSubtitle = document.createElement("div");
    vlSubtitle.setAttribute("id", "#subtitle");
    assign(vlSubtitle.style, {
      position: "absolute",
      display: "grid",
      placeItems: "center",
      top: "4px",
      left: "50%",
      width: "100%",
      transform: "translateX(-50%)",
    });
    vlContainer.appendChild(vlSubtitle);

    wrapper.appendChild(vlContainer);

    return [vlSubtitle, vlCanvas];
  }
}
