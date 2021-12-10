import Sandbox from "../Sandbox";
import { 
    WebGLRenderer,
    sRGBEncoding,
    Scene,
    PerspectiveCamera,
    IcosahedronBufferGeometry,
    BufferGeometry,
    LOD,
    Mesh,
    MeshLambertMaterial,
    DirectionalLight,
    HemisphereLight,
    Vector3,
} from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from "stats.js";
import { DebugTextPanel } from "../../utils/DebugTextPanel";

interface LODLevel {
    geometry: BufferGeometry,
    distance: number,
}

export default class LevelOfDetail extends Sandbox {

    renderer: WebGLRenderer;
    debugText: DebugTextPanel;
    stats: Stats;
    scene: Scene;
    camera: PerspectiveCamera;
    orbitControls: OrbitControls;
    loaded: boolean;

    lod: LOD;

    setupRenderer(): void {
        // Setup renderer.
        this.renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });

        this.renderer.outputEncoding = sRGBEncoding;
        document.body.appendChild(this.renderer.domElement);
        
        // Setup scene.
        this.scene = new Scene();

        // Setup stats.
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.append(this.stats.dom);

        // Setup debug text panel.
        this.debugText = new DebugTextPanel();
        document.body.append(this.debugText.dom);
        //@ts-expect-error
        this.debugText.dom.style.bottom = null;
        this.debugText.dom.style.top = '48px';

        // Setup camera.
        this.camera = new PerspectiveCamera(60);
        this.camera.position.z = 5;
        this.camera.position.y = 5;
        this.camera.position.x = 5;
        this.scene.add(this.camera);
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

        this.update = this.update.bind(this);
        this.renderer.setAnimationLoop(this.update);

        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
        this.resize();
    }

    async setupScene(): Promise<void> {
        // Add light to scene.
        const sunLight = new DirectionalLight('#fff', 1);
        sunLight.position.set(-100, 200, -100);
        this.scene.add(sunLight);
        
        const skyLight = new HemisphereLight('#bde4ff', '#737063', 1);
        this.scene.add(skyLight);

        // Add lod object to scene.
        const levels: LODLevel[] = [
            { geometry: new IcosahedronBufferGeometry(1, 2), distance: 0 },
            { geometry: new IcosahedronBufferGeometry(1, 1), distance: 50 },
            { geometry: new IcosahedronBufferGeometry(1, 0), distance: 100 },
        ];

        this.lod = new LOD();
        this.scene.add(this.lod);

        for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            const material = new MeshLambertMaterial({ color: '#600', flatShading: true });
            const mesh = new Mesh(level.geometry, material);
            mesh.name = `LOD${i}`;

            this.lod.addLevel(mesh, level.distance);
        }

        // Add some debug text.
        this.debugText.addLine('lod-level', () => {
            return `Current LOD Level: ${this.lod.getCurrentLevel()}`;
        });

        this.debugText.addLine('distance', () => {
            // Calculate distance to the lod the same way that the LOD object does.
            const cameraWorldPos = new Vector3().setFromMatrixPosition(this.camera.matrixWorld);
            const lodWorldPos = new Vector3().setFromMatrixPosition(this.lod.matrixWorld);
            const distance = cameraWorldPos.distanceTo(lodWorldPos) / this.camera.zoom;

            return `Current Distance: ${distance.toLocaleString('en-US')}`;
        });
    }

    async start(): Promise<void> {
        this.setupRenderer();
        await this.setupScene();

        this.loaded = true;
    }

    resize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderer.setSize(width, height);

        const pixelRatio = window.devicePixelRatio || 1;
        this.renderer.setPixelRatio(pixelRatio);

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    update(): void {
        if (!this.loaded) {
            return;
        }

        this.stats.begin();

        this.orbitControls.update();

        this.renderer.render(this.scene, this.camera);

        this.stats.end();
        this.debugText.update();
    }
}