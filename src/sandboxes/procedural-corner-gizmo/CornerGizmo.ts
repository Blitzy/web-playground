import { MeshBuilder, Scene, TransformNode, Mesh, Vector3, StandardMaterial } from "@babylonjs/core";
import earcut from 'earcut';

const TriangleGap = 0.2;
const TriangleDepth = 0.1;

export class CornerGizmo {
    private _scene: Scene;
    private _root: TransformNode;

    constructor(scene: Scene) {
        this._scene = scene;

        this._root = new TransformNode('corner_gizmo', this._scene);
        
        const triangleLeft = CornerGizmo.CreateTriangle('triangle_left', this._scene);
        triangleLeft.setParent(this._root);
        triangleLeft.rotation.set(0, 0, -Math.PI / 2);
        triangleLeft.position.set(TriangleDepth, TriangleGap, -TriangleGap);

        const triangleRight = CornerGizmo.CreateTriangle('triangle_right', this._scene);
        triangleRight.setParent(this._root);
        triangleRight.rotation.set(0, -Math.PI / 2, -Math.PI / 2);
        triangleRight.position.set(TriangleGap, TriangleGap, 0);

        const triangleBottom = CornerGizmo.CreateTriangle('triangle_bottom', this._scene);
        triangleBottom.setParent(this._root);
        triangleBottom.rotation.set(0, -Math.PI / 2, 0);
        triangleBottom.position.set(TriangleGap, TriangleDepth, -TriangleGap);
    }

    static CreateTriangle(name: string, scene: Scene): Mesh {
        const points: Vector3[] = [
            new Vector3(0, 0, -1),
            new Vector3(0, 0, 0),
            new Vector3(-1, 0, 0),
        ];

        const triangle = MeshBuilder.CreatePolygon(name, { 
            shape: points,
            depth: TriangleDepth
        }, scene, earcut);

        const triangleMaterial = new StandardMaterial(`${name}_material`, scene);
        triangleMaterial.diffuseColor.set(1, 1, 1);
        triangleMaterial.emissiveColor.set(0.6, 0.6, 0.6);
        triangle.material = triangleMaterial;

        return triangle;
    }

    dispose(): void {
        this._root.dispose(false, true);
    }
}