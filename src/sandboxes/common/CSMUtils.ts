import { Material, Mesh, Object3D } from "three";
import { CSM } from "three/examples/jsm/csm/CSM";


export namespace CSMUtils {
    function getMaterials(mesh: Mesh): Material[] {
        if (Array.isArray(mesh.material)) {
            return mesh.material;
        } else {
            return [mesh.material];
        }
    }
    
    export function setupMaterials(csm: CSM, object3d: Object3D): void {
        if (!object3d) { 
            return;
        }
    
        object3d.traverse((obj3d) => {
            if (obj3d && obj3d instanceof Mesh) {
                const materials = getMaterials(obj3d);
                for (const material of materials) {
                    csm.setupMaterial(material);
                }
            }
        });
    }
}