import * as Three from 'three';

export function removeLights(object: Three.Group) {
  const lightsToRemove: Three.Light[] = [];
  object.traverse((child) => {
    if (child instanceof Three.Light) {
      lightsToRemove.push(child);
    }
  });

  lightsToRemove.forEach((light) => {
    light.removeFromParent();
  });
}
