import { disposeObject3d } from "@yeti-cgi/ape";
import { 
    WebGLRenderer,
    sRGBEncoding,
    Scene,
    Object3D,
    Color,
    PerspectiveCamera,
    BoxBufferGeometry,
    MeshStandardMaterial,
    Mesh,
    DirectionalLight,
    HemisphereLight 
} from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class OrbitBox {

    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    orbitControls: OrbitControls;
    box: Object3D;

    constructor() {
        // Setup renderer.
        this.renderer = new WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });

        this.renderer.outputEncoding = sRGBEncoding;
        document.body.appendChild(this.renderer.domElement);
        
        // Setup scene.
        this.scene = new Scene();
        this.scene.background = new Color('#252629');

        // Setup camera.
        this.camera = new PerspectiveCamera(60);
        this.camera.position.z = 5;
        this.camera.position.y = 5;
        this.camera.position.x = 5;
        this.scene.add(this.camera);
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

        // Add box to scene.
        const boxGeo = new BoxBufferGeometry(1, 1, 1);
        const boxMat = new MeshStandardMaterial({ 
            color: '#600'
        });

        // Add light to scene.
        const sunLight = new DirectionalLight('#fff', 1);
        sunLight.position.set(-100, 200, -100);
        this.scene.add(sunLight);
        
        const skyLight = new HemisphereLight('#bde4ff', '#737063', 1);
        this.scene.add(skyLight);

        this.box = new Mesh(boxGeo, boxMat);
        this.scene.add(this.box);

        this.update = this.update.bind(this);
        this.renderer.setAnimationLoop(this.update);

        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
        this.resize();
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
        this.orbitControls.update();

        this.renderer.render(this.scene, this.camera);
    }
}