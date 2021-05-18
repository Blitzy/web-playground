import { ArcRotateCamera, Engine, EngineOptions, HemisphericLight, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import Sandbox from "../Sandbox";
import { CornerGizmo } from "./CornerGizmo";

export default class ProceduralCornerGizmo extends Sandbox {

    engine: Engine;
    scene: Scene;

    async start(): Promise<void> {

        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.top = '0';
        div.style.left = '0';
        document.body.append(div);

        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        div.append(canvas);

        const engineOptions: EngineOptions = {
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            audioEngine: false,
        };

        this.engine = new Engine(canvas, engineOptions.antialias, engineOptions, true);
        this.scene = new Scene(this.engine);
        this.scene.clearColor.set(0, 0, 0, 0);

        this.scene.debugLayer.show({ enableClose: false });

        await this.setupScene();

        this._onRender = this._onRender.bind(this);
        this._onResize = this._onResize.bind(this);
        
        this.engine.runRenderLoop(this._onRender);
        window.addEventListener('resize', this._onResize);
    }

    async setupScene(): Promise<void> {
        const camera = new ArcRotateCamera('camera', 0, 1, 10, Vector3.Zero(), this.scene);
        camera.attachControl();

        const light = new HemisphericLight('light', Vector3.Up(), this.scene);
        light.intensity = 0.7;

        const cornerGizmo = new CornerGizmo(this.scene);

        const ground = MeshBuilder.CreateGround('ground', { width: 10, height: 10 }, this.scene);
        const groundMat = new GridMaterial('gound_material', this.scene);
        groundMat.lineColor.set(1, 1, 1);
        groundMat.mainColor.set(1, 1, 1);
        groundMat.opacity = 0;
        ground.material = groundMat;
    }

    private _onRender(): void {
        this.scene.render();
    }

    private _onResize(): void {
        this.engine.resize();
    }
}