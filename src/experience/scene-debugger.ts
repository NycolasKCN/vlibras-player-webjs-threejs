import * as Three from "three";

export interface SceneDebugger {
  dump(scene: Three.Scene): string[];
  debug(scene: Three.Scene): void;
}

export class ObjectTreeSceneDebugger implements SceneDebugger {
  dump(scene: Three.Scene): string[] {
    return this.dumpObject(scene);
  }

  public debug(scene: Three.Scene): void {
    console.debug(this.dumpObject(scene).join("\n"));
    console.debug(this.listMaterials(scene));
    console.debug(this.listSceneTextures(scene));
  }

  private listSceneTextures(scene: Three.Scene): Three.Texture[] {
    const textures = new Set<Three.Texture>();

    scene.traverse((object) => {
      if (object instanceof Three.Mesh || object instanceof Three.SkinnedMesh) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        for (const material of materials) {
          for (const value of Object.values(material)) {
            if (value instanceof Three.Texture) {
              textures.add(value);
            }
          }
        }
      }
    });

    return Array.from(textures);
  }
  private listMaterials(scene: Three.Scene): Three.Material[] {
    const materials: Set<Three.Material> = new Set();

    scene.traverse((object) => {
      if (object instanceof Three.Mesh) {
        const mat = object.material;
        if (Array.isArray(mat)) {
          mat.forEach((material) => materials.add(material));
        } else {
          materials.add(mat);
        }
      }
    });

    // Remove duplicatas (mesmo material aplicado em múltiplos meshes)
    return Array.from(materials);
  }

  // Code from: https://threejs.org/manual/#en/load-gltf
  private dumpObject(
    obj: Three.Object3D,
    lines: string[] = [],
    isLast = true,
    prefix = "",
  ) {
    const localPrefix = isLast ? "└─" : "├─";
    lines.push(
      `${prefix}${prefix ? localPrefix : ""}${obj.name || "*no-name*"} [${obj.type}]`,
    );
    const newPrefix = prefix + (isLast ? "  " : "│ ");
    const lastNdx = obj.children.length - 1;

    obj.children.forEach((child, ndx) => {
      const isLast = ndx === lastNdx;
      this.dumpObject(child, lines, isLast, newPrefix);
    });

    return lines;
  }
}
