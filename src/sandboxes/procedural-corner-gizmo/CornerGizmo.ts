import { MeshBuilder, Scene, TransformNode, Mesh, Vector3, StandardMaterial, Node } from "@babylonjs/core";
import earcut from 'earcut';
import gsap from 'gsap';
import _ from "lodash";
import defaults from 'lodash/defaults';

export interface CornerGizmoOptions {
    triangleGap?: number;
    triangleDepth?: number;
    triangleOpacity?: number;
    dashCount?: number;
    dashGap?: number;
    dashLength?: number;
    dashThickness?: number;
    dashAnimation?: boolean;
    dashAnimationDuration?: number;
    lineOriginSpace?: number;
    lineOpacity?: number;
}

export class CornerGizmo {
    private _scene: Scene;
    private _root: TransformNode;
    private _visiblityTimeline: gsap.core.Timeline;

    private _triangles = new Array<Mesh>(3);
    private _lines = new Array<MarqueeLine>(3);
    private _params: Readonly<Required<CornerGizmoOptions>>;
    private _curParams: Required<CornerGizmoOptions>;

    get triangleGap(): number { return this._curParams.triangleGap }
    set triangleGap(value: number) {
        if (this._curParams.triangleGap !== value) {
            this._curParams.triangleGap = value;
            this._updateTrianglePositions();
        }
    }

    get triangleOpacity(): number { return this._curParams.triangleOpacity }
    set triangleOpacity(value: number) {
        if (this._curParams.triangleOpacity !== value) {
            this._curParams.triangleOpacity = value;
            this._updateTriangleOpacity();
        }
    }

    get dashThickness(): number { return this._curParams.dashThickness }
    set dashThickness(value: number) {
        if (this._curParams.dashThickness !== value) {
            this._curParams.dashThickness = value;
            this._lines.forEach(l => l.dashThickness = value);
        }
    }

    get dashAnimation(): boolean { return this._curParams.dashAnimation }
    set dashAnimation(value: boolean) {
        if (this._curParams.dashAnimation !== value) {
            this._curParams.dashAnimation = value;
            this._lines.forEach(l => l.dashAnimation = value);
        }
    }

    get dashAnimationDuration(): number { return this._curParams.dashAnimationDuration }
    set dashAnimationDuration(value: number) {
        if (this._curParams.dashAnimationDuration !== value) {
            this._curParams.dashAnimationDuration = value;
            this._lines.forEach(l => l.dashAnimationDuration = value);
        }
    }

    get dashLength(): number { return this._curParams.dashLength }
    set dashLength(value: number) {
        if (this._curParams.dashLength !== value) {
            this._curParams.dashLength = value;
            this._lines.forEach(l => l.dashLength = value);
        }
    }

    get dashGap(): number { return this._curParams.dashGap }
    set dashGap(value: number) {
        if (this._curParams.dashGap !== value) {
            this._curParams.dashGap = value;
            this._lines.forEach(l => l.dashGap = value);
        }
    }

    get lineOriginSpace(): number { return this._curParams.lineOriginSpace }
    set lineOriginSpace(value: number) {
        if (this._curParams.lineOriginSpace !== value) {
            this._curParams.lineOriginSpace = value;
            this._lines.forEach(l => l.lineOriginSpace = value);
        }
    }

    get lineOpacity(): number { return this._curParams.lineOpacity }
    set lineOpacity(value: number) {
        if (this._curParams.lineOpacity !== value) {
            this._curParams.lineOpacity = value;
            this._lines.forEach(l => l.lineOpacity = value);
        }
    }

    static readonly defaultOptions: Required<CornerGizmoOptions> = {
        triangleGap: 0.2,
        triangleDepth: 0.1,
        triangleOpacity: 1,
        dashCount: 10,
        dashGap: 0.23,
        dashLength: 0.24,
        dashThickness: 0.05,
        lineOriginSpace: 0,
        lineOpacity: 1,
        dashAnimation: true,
        dashAnimationDuration: 0.75,
    }

    constructor(scene: Scene, options?: CornerGizmoOptions) {
        this._scene = scene;

        this._params = defaults(options ? {...options} : {}, CornerGizmo.defaultOptions) as Required<CornerGizmoOptions>;
        this._curParams = {...this._params};

        this._root = new TransformNode('corner_gizmo', this._scene);
        
        // Create and position triangles.
        this._triangles[0] = CornerGizmo.CreateTriangle('triangle_left', this._params.triangleDepth, this._scene);
        this._triangles[0].setParent(this._root);
        this._triangles[0].rotation.set(0, 0, -Math.PI / 2);

        this._triangles[1] = CornerGizmo.CreateTriangle('triangle_right', this._params.triangleDepth, this._scene);
        this._triangles[1].setParent(this._root);
        this._triangles[1].rotation.set(0, -Math.PI / 2, -Math.PI / 2);

        this._triangles[2] = CornerGizmo.CreateTriangle('triangle_bottom', this._params.triangleDepth, this._scene);
        this._triangles[2].setParent(this._root);
        this._triangles[2].rotation.set(0, -Math.PI / 2, 0);

        this._updateTrianglePositions();
        this._updateTriangleOpacity();

        // Create and position marquee lines.
        const marqueeLineParams: MarqueeLineParams = {
            dashCount: this._params.dashCount,
            dashGap: this._params.dashGap,
            dashLength: this._params.dashLength,
            dashThickness: this._params.dashThickness,
            dashAnimation: this._params.dashAnimation,
            dashAnimationDuration: this._params.dashAnimationDuration,
            lineOriginSpace: this._params.lineOriginSpace,
            lineOpacity: this._params.lineOpacity,
        }

        this._lines[0] = new MarqueeLine('marquee_line_left', this._scene, marqueeLineParams);
        this._lines[0].setParent(this._root);
        this._lines[0].rotation.set(0, Math.PI, 0);
        this._lines[0].scaling.x = -1;

        this._lines[1] = new MarqueeLine('marquee_line_right', this._scene, marqueeLineParams);
        this._lines[1].setParent(this._root);
        this._lines[1].rotation.set(0, Math.PI / 2, 0);

        this._lines[2] = new MarqueeLine('marquee_line_up', this._scene, marqueeLineParams);
        this._lines[2].setParent(this._root);
        this._lines[2].rotation.set(-Math.PI / 2, 0, 0);

        this.hide(true);
    }

    static CreateTriangle(name: string, triangleDepth: number, scene: Scene): Mesh {
        const points: Vector3[] = [
            new Vector3(0, 0, -1),
            new Vector3(0, 0, 0),
            new Vector3(-1, 0, 0),
        ];

        const triangle = MeshBuilder.CreatePolygon(name, { 
            shape: points,
            depth: triangleDepth
        }, scene, earcut);

        const triangleMaterial = new StandardMaterial(`${name}_material`, scene);
        triangleMaterial.diffuseColor.set(1, 1, 1);
        triangleMaterial.emissiveColor.set(0.6, 0.6, 0.6);
        triangle.material = triangleMaterial;

        return triangle;
    }

    private _updateTrianglePositions(): void {
        this._triangles[0].position.set(this._curParams.triangleDepth, this._curParams.triangleGap, -this._curParams.triangleGap);
        this._triangles[1].position.set(this._curParams.triangleGap, this._curParams.triangleGap, 0);
        this._triangles[2].position.set(this._curParams.triangleGap, this._curParams.triangleDepth, -this._curParams.triangleGap);
    }

    private _updateTriangleOpacity(): void {
        this._triangles[0].material.alpha = this._curParams.triangleOpacity;
        this._triangles[1].material.alpha = this._curParams.triangleOpacity;
        this._triangles[2].material.alpha = this._curParams.triangleOpacity;
    }

    show(immediate?: boolean): void {
        this._visiblityTimeline?.kill();
        this._visiblityTimeline = undefined;

        if (immediate) {
            this._root.setEnabled(true);
            this.triangleGap = this._params.triangleGap;
            this.triangleOpacity = this._params.triangleOpacity;
            this.lineOpacity = this._params.lineOpacity;
        } else {
            this._visiblityTimeline = gsap.timeline({
                onStart: () => {
                    this._root.setEnabled(true);
                },
                onComplete: () => {
                    this._visiblityTimeline = undefined;
                }
            });

            this._visiblityTimeline.to(this._curParams, {
                    triangleGap: this._params.triangleGap,
                    duration: 0.4,
                    ease: 'power1.inOut',
                    onUpdate: () => {
                        this._updateTrianglePositions();  
                    }
            }, 0);

            this._visiblityTimeline.to(this._curParams, {
                triangleOpacity: this._params.triangleOpacity,
                duration: 0.4,
                ease: 'power1.inOut',
                onUpdate: () => {
                    this._updateTriangleOpacity();
                }
            }, 0);

            this._visiblityTimeline.to(this._curParams, {
                lineOpacity: this._params.lineOpacity,
                duration: 0.3,
                ease: 'power2.in',
                onUpdate: () => {
                    this._lines.forEach(l => l.lineOpacity = this._curParams.lineOpacity);
                }
            }, 0.2);
        }
    }

    hide(immediate?: boolean): void {
        this._visiblityTimeline?.kill();
        this._visiblityTimeline = undefined;

        if (immediate) {
            this._root.setEnabled(false);
            this.triangleGap = 2;
            this.triangleOpacity = 0;
            this.lineOpacity = 0;
        } else {
            this._visiblityTimeline = gsap.timeline({
                onComplete: () => {
                    this._visiblityTimeline = undefined;
                    this._root.setEnabled(false);
                }
            });

            this._visiblityTimeline.to(this._curParams, {
                triangleGap: 2,
                duration: 0.4,
                ease: 'power1.inOut',
                onUpdate: () => {
                    this._updateTrianglePositions();
                }
            }, 0);

            this._visiblityTimeline.to(this._curParams, {
                triangleOpacity: 0,
                duration: 0.4,
                ease: 'power1.inOut',
                onUpdate: () => {
                    this._updateTriangleOpacity();
                }
            }, 0);

            this._visiblityTimeline.to(this._curParams, {
                lineOpacity: 0,
                duration: 0.3,
                ease: 'power2.out',
                onUpdate: () => {
                    this._lines.forEach(l => l.lineOpacity = this._curParams.lineOpacity);
                }
            }, 0.2);
        }
    }

    dispose(): void {
        this._visiblityTimeline?.kill();
        this._visiblityTimeline = undefined;
        
        for (const triangle of this._triangles) {
            triangle?.dispose();
        }

        for (const line of this._lines) {
            line?.dispose();
        }

        this._root?.dispose(false, true);
    }
}

interface MarqueeLineParams {
    dashCount: number;
    dashGap: number;
    dashLength: number;
    dashThickness: number;
    lineOriginSpace: number;
    lineOpacity: number;
    dashAnimation: boolean;
    dashAnimationDuration: number;
}

class MarqueeLine {
    private _root: TransformNode;
    private _params: Readonly<MarqueeLineParams>;
    private _curParams: MarqueeLineParams;
    private _dashes: Mesh[] = [];
    private _dashTimeline: gsap.core.Timeline;

    get dashAnimation(): boolean { return this._curParams.dashAnimation }
    set dashAnimation(value: boolean) {
        if (this._curParams.dashAnimation !== value) {
            this._curParams.dashAnimation = value;
            this._updateLine();
        }
    }

    get dashAnimationDuration(): number { return this._curParams.dashAnimationDuration }
    set dashAnimationDuration(value: number) {
        if (this._curParams.dashAnimationDuration !== value) {
            this._curParams.dashAnimationDuration = value;
            this._updateLine();
        }
    }

    get dashThickness(): number { return this._curParams.dashThickness }
    set dashThickness(value: number) {
        if (this._curParams.dashThickness !== value) {
            this._curParams.dashThickness = value;
            this._updateLine();
        }
    }

    get dashLength(): number { return this._curParams.dashLength }
    set dashLength(value: number) {
        if (this._curParams.dashLength !== value) {
            this._curParams.dashLength = value;
            this._updateLine();
        }
    }

    get dashGap(): number { return this._curParams.dashGap }
    set dashGap(value: number) {
        if (this._curParams.dashGap !== value) {
            this._curParams.dashGap = value;
            this._updateLine();
        }
    }

    get lineOriginSpace(): number { return this._curParams.lineOriginSpace }
    set lineOriginSpace(value: number) {
        if (this._curParams.lineOriginSpace !== value) {
            this._curParams.lineOriginSpace = value;
            this._updateLine();
        }
    }

    get lineOpacity(): number { return this._curParams.lineOpacity }
    set lineOpacity(value: number) {
        if (this._curParams.lineOpacity !== value) {
            this._curParams.lineOpacity = value;
            this._updateLineOpacity();
        }
    }

    get position(): Vector3 { return this._root.position };
    set position(value: Vector3) { this._root.position = value; }

    get rotation(): Vector3 { return this._root.rotation };
    set rotation(value: Vector3) { this._root.rotation = value; }

    get scaling(): Vector3 { return this._root.scaling };
    set scaling(value: Vector3) { this._root.scaling = value; }

    constructor(name: string, scene: Scene, params: MarqueeLineParams) {
        this._params = {...params};
        this._curParams = {...params};
        this._root = new TransformNode(name, scene);

        for (let i = 0; i < this._params.dashCount; i++) {
            const dash = MeshBuilder.CreateBox(`${name}_dash_${i}`, { size: 1 }, scene);
            this._dashes.push(dash);

            const dashMaterial = new StandardMaterial(`${dash.name}_material`, scene);
            dashMaterial.diffuseColor.set(1, 1, 1);
            dashMaterial.emissiveColor.set(0.6, 0.6, 0.6);
            dash.material = dashMaterial;

            dash.setParent(this._root);

            this._updateLine();
        }
    }

    private _updateLine(): void {
        this._dashTimeline?.kill();
        this._dashTimeline = undefined;

        if (this._curParams.dashAnimation) {
            this._dashTimeline = gsap.timeline({ repeat: -1 });
        }

        for (let i = 0; i < this._dashes.length; i++) {
            const dash = this._dashes[i];
            dash.setEnabled(true);

            // Set base dash size.
            dash.scaling.set(this._curParams.dashThickness, this._curParams.dashThickness, this._curParams.dashLength);

            // Set start dash position.
            this._calcDashPosition(i, dash.position);

            if (this._curParams.dashAnimation) {
                const targetPosition = new Vector3();
                this._calcDashPosition(i + 1, targetPosition);
    
                this._dashTimeline.to(dash.position, {
                    x: targetPosition.x,
                    y: targetPosition.y,
                    z: targetPosition.z,
                    duration: this._curParams.dashAnimationDuration,
                    ease: 'none',
                    onStart: () => {
                        dash.setEnabled(true);
                    }
                }, 0);
                
                
                let animateScale: 'up' | 'down' | undefined;
                if (i === 0) { animateScale = 'up' }
                else if (i === this._dashes.length - 1) { animateScale = 'down' }
    
                if (animateScale) {
                    // Scale dash length.
                    const fromZ = animateScale === 'up' ? 0 : this._curParams.dashLength;
                    const toZ = animateScale === 'up' ? this._curParams.dashLength : 0;
    
                    this._dashTimeline.fromTo(dash.scaling, 
                    {
                        z: fromZ
                    }, 
                    {
                        z: toZ,
                        duration: this._curParams.dashAnimationDuration / 2,
                        ease: 'none',
                        onStart: () => {
                            if (animateScale === 'up') {
                                dash.setEnabled(true);
                            }
                        },
                        onComplete: () => {
                            if (animateScale === 'down') {
                                dash.setEnabled(false);
                            }
                        }
                    }, 0);
                }
            }
        }
    }

    private _updateLineOpacity(): void {
        for (const dash of this._dashes) {
            if (dash) {
                dash.material.alpha = this._curParams.lineOpacity;
            }
        }
    }

    private _calcDashPosition(index: number, result: Vector3): void {
        result.setAll(0);

        result.x = result.y = this._curParams.dashThickness / 2;

        result.z = (this._curParams.dashLength * index);
        result.z += (this._curParams.dashGap * index);
        result.z += (this._curParams.dashLength / 2) + this._curParams.lineOriginSpace;
    }

    setParent(node: Node) {
        this._root.setParent(node);
    }

    dispose(): void {
        this._dashTimeline?.kill();
        this._dashTimeline = undefined;

        this._root.dispose(false, true);
    }
}