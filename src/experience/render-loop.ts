import * as Three from 'three';
import { SceneRuntime } from './types';

export interface RenderLoop {
  start(runtime: SceneRuntime, updateSceneObjects: () => void): void;
}

export class ResponsiveRenderLoop implements RenderLoop {
  public start(runtime: SceneRuntime, updateSceneObjects: () => void): void {
    this.renderResponsiveScene(runtime.renderer, runtime.scene, runtime.camera, () => {
      updateSceneObjects();
    });
  }

  private renderResponsiveScene(
    renderer: Three.WebGLRenderer,
    scene: Three.Scene,
    camera: Three.PerspectiveCamera,
    updateSceneObjects: (time: number) => void,
    timer: number = 0.0001
  ): void {
    function render(time: number): void {
      time *= timer;

      const canvas = renderer.domElement;
      const clientWidth = canvas.clientWidth;
      const clientHeight = canvas.clientHeight;
      const isNeedToResizeDisplay = canvas.width !== clientWidth || canvas.height !== clientHeight;
      if (isNeedToResizeDisplay) {
        // Limits the drawing buffer to the maxPixelCount
        // Now the maxPixelCount is equivalent of an 4K monitor
        const maxPixelCount = 3840 * 2160;
        const pixelRatio = window.devicePixelRatio;

        let width = Math.floor(clientWidth * pixelRatio);
        let height = Math.floor(clientHeight * pixelRatio);

        const pixelCount = width * height;
        const renderScale = pixelCount > maxPixelCount ? Math.sqrt(maxPixelCount / pixelCount) : 1;

        width = Math.floor(width * renderScale);
        height = Math.floor(height * renderScale);

        renderer.setSize(width, height, false);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();

      }

      updateSceneObjects(time);

      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }
}
