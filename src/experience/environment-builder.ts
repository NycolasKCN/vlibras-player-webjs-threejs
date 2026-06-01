import * as Three from 'three';
import { getOrbitControls } from './helpers/orbit-controls';
import { SceneRuntime } from './types';

export interface EnvironmentConfig {
  readonly planeSize: number;
  readonly planeTexturePath: string;
  readonly controlsTarget: [number, number, number];
  readonly focusPosition: [number, number, number];
}

export interface EnvironmentBuilder {
  build(runtime: SceneRuntime): void;
}

const defaultConfig: EnvironmentConfig = {
  planeSize: 40,
  planeTexturePath: '/images/checker.png',
  controlsTarget: [0, 5, 0],
  focusPosition: [0, 5, 0],
};

export class ThreeEnvironmentBuilder implements EnvironmentBuilder {
  constructor(private readonly config: EnvironmentConfig = defaultConfig) {}

  public build(runtime: SceneRuntime): void {
    this.setupControls(runtime.camera, runtime.canvas);
    const spotlights = this.setupLights(runtime.scene);
    //this.setupPlane(runtime.scene);
    const focusObject = this.setupFocusObject(runtime.scene);
    this.targetSpotsToObject(spotlights, focusObject);
  }

  private setupControls(camera: Three.Camera, canvas: HTMLCanvasElement): void {
    const controls = getOrbitControls(camera, canvas);
    controls.target.set(...this.config.controlsTarget);
    controls.update();
  }

  private setupLights(scene: Three.Scene): [Three.SpotLight, Three.SpotLight] {
    const ambientLight = new Three.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const spotRight = new Three.SpotLight(0xffffff, 150);
    spotRight.name = "spotRight"
    spotRight.position.set(12, 8, 10);
    spotRight.distance = 40;
    spotRight.angle = Math.PI / 8;
    spotRight.decay = 1.5;
    spotRight.penumbra = 1;
    scene.add(spotRight);

    const spotLeft = new Three.SpotLight(0xffffff, 150);
    spotLeft.name = "spotLeft"
    spotLeft.position.set(-10, 8, 10);
    spotLeft.distance = 40;
    spotLeft.angle = Math.PI / 8;
    spotLeft.decay = 1.5;
    spotLeft.penumbra = 1;
    scene.add(spotLeft);

    return [spotRight, spotLeft];
  }

  private setupPlane(scene: Three.Scene): void {
    const textureLoader = new Three.TextureLoader();
    const texture = textureLoader.load(this.config.planeTexturePath);
    texture.wrapS = Three.RepeatWrapping;
    texture.wrapT = Three.RepeatWrapping;
    texture.magFilter = Three.NearestFilter;
    texture.colorSpace = Three.SRGBColorSpace;

    const repeats = this.config.planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeometry = new Three.PlaneGeometry(this.config.planeSize, this.config.planeSize);
    const planeMaterial = new Three.MeshPhongMaterial({
      map: texture,
      side: Three.DoubleSide,
    });
    const planeMesh = new Three.Mesh(planeGeometry, planeMaterial);
    planeMesh.rotation.x = Math.PI / 2;
    scene.add(planeMesh);
  }

  private setupFocusObject(scene: Three.Scene): Three.Mesh {
    const transparentMaterial = new Three.MeshPhongMaterial({ transparent: true, opacity: 0 });
    const boxGeometry = new Three.BoxGeometry(0.1, 0.1, 0.1);
    const focusMesh = new Three.Mesh(boxGeometry, transparentMaterial);
    focusMesh.position.set(...this.config.focusPosition);
    focusMesh.name = "focus";
    scene.add(focusMesh);
    return focusMesh;
  }

  private targetSpotsToObject(
    spotlights: [Three.SpotLight, Three.SpotLight],
    object: Three.Object3D
  ): void {
    const [first, second] = spotlights;
    first.target = object;
    second.target = object;
  }
}
