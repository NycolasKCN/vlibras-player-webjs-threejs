import * as Three from 'three';

function isNeedToResizeDisplay(canvas: HTMLCanvasElement): boolean {
  const clientWidth = canvas.clientWidth;
  const clientHeight = canvas.clientHeight;
  return canvas.width !== clientWidth || canvas.height !== clientHeight;
}

export function renderResponsiveScene(
  renderer: Three.WebGLRenderer,
  scene: Three.Scene,
  camera: Three.PerspectiveCamera,
  updateSceneObjects: (time: number) => void,
  timer: number = 0.0001
): void {
  function render(time: number): void {
    time *= timer;

    const canvas = renderer.domElement;
    if (isNeedToResizeDisplay(canvas)) {
      // Limits the drawing buffer to the maxPixelCount
      // Now the maxPixelCount is equivalent of an 4K monitor
      const maxPixelCount = 3840 * 2160;
      const pixelRatio = window.devicePixelRatio;
      let width = Math.floor(canvas.clientWidth * pixelRatio);
      let height = Math.floor(canvas.clientHeight * pixelRatio);
      const pixelCount = width * height;
      const renderScale = pixelCount > maxPixelCount ? Math.sqrt(maxPixelCount / pixelCount) : 1;
      width = Math.floor(width * renderScale);
      height = Math.floor(height * renderScale);
      renderer.setSize(width, height, false);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    updateSceneObjects(time);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
