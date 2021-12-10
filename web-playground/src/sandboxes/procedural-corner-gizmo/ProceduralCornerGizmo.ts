import { ArcRotateCamera, Engine, EngineOptions, HemisphericLight, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import Sandbox from "../Sandbox";
import { CornerGizmo, CornerGizmoOptions } from "./CornerGizmo";
import dat from 'dat.gui';

export default class ProceduralCornerGizmo extends Sandbox {

    engine: Engine;
    scene: Scene;
    rootDivElement: HTMLDivElement;
    cornerGizmo: CornerGizmo;
    cornerGizmoOptions: CornerGizmoOptions = {...CornerGizmo.defaultOptions};
    gui: dat.GUI;

    async start(): Promise<void> {

        this.rootDivElement = document.createElement('div');
        this.rootDivElement.style.position = 'fixed';
        this.rootDivElement.style.width = '100%';
        this.rootDivElement.style.height = '100%';
        this.rootDivElement.style.top = '0';
        this.rootDivElement.style.left = '0';
        document.body.append(this.rootDivElement );

        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        this.rootDivElement .append(canvas);

        const engineOptions: EngineOptions = {
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            audioEngine: false,
        };

        this.engine = new Engine(canvas, engineOptions.antialias, engineOptions, true);
        this.scene = new Scene(this.engine);
        this.scene.clearColor.set(0, 0, 0, 0);

        this.scene.debugLayer.show({ enableClose: false, embedMode: true });

        await this.setupScene();
        this.setupDatGui();

        this.onRender = this.onRender.bind(this);
        this.onResize = this.onResize.bind(this);
        
        this.engine.runRenderLoop(this.onRender);
        window.addEventListener('resize', this.onResize);
    }

    async setupScene(): Promise<void> {
        const camera = new ArcRotateCamera('camera', -0.5, 1, 10, Vector3.Zero(), this.scene);
        camera.attachControl();

        const light = new HemisphericLight('light', Vector3.Up(), this.scene);
        light.intensity = 0.7;

        this.cornerGizmo = new CornerGizmo(this.scene, this.cornerGizmoOptions);
        this.cornerGizmo.show(true);

        const ground = MeshBuilder.CreateGround('ground', { width: 10, height: 10 }, this.scene);
        const groundMat = new GridMaterial('gound_material', this.scene);
        groundMat.lineColor.set(1, 1, 1);
        groundMat.mainColor.set(1, 1, 1);
        groundMat.opacity = 0;
        ground.material = groundMat;
    }

    setupDatGui(): void {
        this.gui = new dat.GUI({ autoPlace: false });
        this.rootDivElement.append(this.gui.domElement);
        this.gui.domElement.style.position = 'fixed';
        this.gui.domElement.style.top = '0';
        this.gui.domElement.style.left = '0';

        this.gui.add(this, 'datGuiFunc_new').name('new');
        this.gui.add(this, 'datGuiFunc_show').name('show');
        this.gui.add(this, 'datGuiFunc_hide').name('hide');

        this.gui.add(this.cornerGizmoOptions, 'dashAnimation').onChange((value: boolean) => {
            this.cornerGizmo.dashAnimation = value;
        });
        this.gui.add(this.cornerGizmoOptions, 'dashAnimationDuration').onChange((value: number) => {
            this.cornerGizmo.dashAnimationDuration = value;
        });
        this.gui.add(this.cornerGizmoOptions, 'dashCount').min(0).max(50).step(1).onFinishChange(() => {
            this.datGuiFunc_new();
        });
        this.gui.add(this.cornerGizmoOptions, 'dashThickness').min(0.01).max(2).onChange((value: number) => {
            this.cornerGizmo.dashThickness = value;
        });
        this.gui.add(this.cornerGizmoOptions, 'dashLength').min(0.01).max(2).onChange((value: number) => {
            this.cornerGizmo.dashLength = value;
        });
        this.gui.add(this.cornerGizmoOptions, 'dashGap').min(0).max(2).onChange((value: number) => {
            this.cornerGizmo.dashGap = value;
        });
        this.gui.add(this.cornerGizmoOptions, 'lineOriginSpace').min(0).max(1).onChange((value: number) => {
            this.cornerGizmo.lineOriginSpace = value;
        });
        this.gui.add(this.cornerGizmoOptions, 'lineOpacity').min(0).max(1).listen().onChange((value: number) => {
            this.cornerGizmo.lineOpacity = value;
        });
        this.gui.add(this.cornerGizmoOptions, 'triangleGap').min(0).max(1).onChange((value: number) => {
            this.cornerGizmo.triangleGap = value;
        });
        this.gui.add(this.cornerGizmoOptions, 'triangleOpacity').min(0).max(1).listen().onChange((value: number) => {
            this.cornerGizmo.triangleOpacity = value;
        });

        this.gui.updateDisplay();
    }

    datGuiFunc_new(): void {
        this.cornerGizmo?.dispose();
        this.cornerGizmo = new CornerGizmo(this.scene, this.cornerGizmoOptions);
        this.cornerGizmo.show(true);
    }

    datGuiFunc_show(): void {
        this.cornerGizmo?.show();
    }

    datGuiFunc_hide(): void {
        this.cornerGizmo?.hide();
    }

    onRender(): void {
        this.scene.render();
    }

    onResize(): void {
        this.engine.resize();
    }
}