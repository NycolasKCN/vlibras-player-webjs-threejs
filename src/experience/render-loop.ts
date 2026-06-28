import * as Three from "three";
import { SceneRuntime } from "./types";

export interface RenderLoop {
  run(
    runtime: SceneRuntime,
    updateSceneObjects: (delta: number) => void,
  ): void;
}

export class ResponsiveRenderLoop implements RenderLoop {
  public run(
    runtime: SceneRuntime,
    updateSceneObjects: (delta: number) => void,
  ): void {
    this.renderResponsiveScene(
      runtime.renderer,
      runtime.scene,
      runtime.camera,
      (delta) => {
        updateSceneObjects(delta);
      },
    );
  }

  private renderResponsiveScene(
    renderer: Three.WebGLRenderer,
    scene: Three.Scene,
    camera: Three.PerspectiveCamera,
    updateSceneObjects: (delta: number) => void,
  ): void {
    const timer = new Three.Timer();

    function render(): void {
      const canvas = renderer.domElement;
      const clientWidth = canvas.clientWidth;
      const clientHeight = canvas.clientHeight;
      const isNeedToResizeDisplay =
        canvas.width !== clientWidth || canvas.height !== clientHeight;
      if (isNeedToResizeDisplay) {
        // Limits the drawing buffer to the maxPixelCount
        // Now the maxPixelCount is equivalent of an 4K monitor
        const maxPixelCount = 3840 * 2160;
        const pixelRatio = window.devicePixelRatio;

        let width = Math.floor(clientWidth * pixelRatio);
        let height = Math.floor(clientHeight * pixelRatio);

        const pixelCount = width * height;
        const renderScale =
          pixelCount > maxPixelCount
            ? Math.sqrt(maxPixelCount / pixelCount)
            : 1;

        width = Math.floor(width * renderScale);
        height = Math.floor(height * renderScale);

        renderer.setSize(width, height, false);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
      }

      timer.update();
      updateSceneObjects(timer.getDelta());

      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }
}
