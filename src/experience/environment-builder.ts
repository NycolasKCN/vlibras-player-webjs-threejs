import * as Three from "three";
import { SceneRuntime } from "./types";
import { OrbitControls } from "three/examples/jsm/Addons";

export interface EnvironmentConfig {
  readonly controlsTarget: [number, number, number];
  readonly focusPosition: [number, number, number];
}

export interface EnvironmentBuilder {
  build(runtime: SceneRuntime): void;
}

const defaultConfig: EnvironmentConfig = {
  controlsTarget: [0, 2.5, 0],
  focusPosition: [0, 3.5, 0],
};

export class ThreeEnvironmentBuilder implements EnvironmentBuilder {
  constructor(private readonly config: EnvironmentConfig = defaultConfig) {}

  public build(runtime: SceneRuntime): void {
    this.setupControls(runtime.camera, runtime.canvas);
    const spotlights = this.setupLights(runtime.scene);
    const focusObject = this.setupFocusObject(runtime.scene);
    this.targetSpotsToObject(spotlights, focusObject);
  }

  private setupControls(camera: Three.Camera, canvas: HTMLCanvasElement): void {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("Element is not an canvas.");
    }
    const controls = new OrbitControls(camera, canvas);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI * 0.45;
    controls.maxPolarAngle = Math.PI * 0.45;

    controls.target.set(...this.config.controlsTarget);
    controls.update();
  }

  private setupLights(scene: Three.Scene): [Three.SpotLight, Three.SpotLight] {
    const ambientLight = new Three.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const spotRight = new Three.SpotLight(0xffffff, 150);
    spotRight.name = "spotRight";
    spotRight.position.set(12, 6, 10);
    spotRight.distance = 40;
    spotRight.angle = Math.PI / 8;
    spotRight.decay = 1.5;
    spotRight.penumbra = 1;
    scene.add(spotRight);

    const spotLeft = new Three.SpotLight(0xffffff, 150);
    spotLeft.name = "spotLeft";
    spotLeft.position.set(-10, 6, 10);
    spotLeft.distance = 40;
    spotLeft.angle = Math.PI / 8;
    spotLeft.decay = 1.5;
    spotLeft.penumbra = 1;
    scene.add(spotLeft);

    return [spotRight, spotLeft];
  }

  private setupFocusObject(scene: Three.Scene): Three.Mesh {
    const transparentMaterial = new Three.MeshPhongMaterial({
      transparent: true,
      opacity: 0,
    });
    const boxGeometry = new Three.BoxGeometry(0.1, 0.1, 0.1);
    const focusMesh = new Three.Mesh(boxGeometry, transparentMaterial);
    focusMesh.position.set(...this.config.focusPosition);
    focusMesh.name = "focus";
    scene.add(focusMesh);
    return focusMesh;
  }

  private targetSpotsToObject(
    spotlights: [Three.SpotLight, Three.SpotLight],
    object: Three.Object3D,
  ): void {
    const [first, second] = spotlights;
    first.target = object;
    second.target = object;
  }
}
