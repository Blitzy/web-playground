// Suzanne model
import suzanne_gltf from '../common/models/suzanne/Suzanne.gltf';
import suzanne_bin from '../common/models/suzanne/Suzanne.bin';
import suzanne_baseColor from '../common/models/suzanne/Suzanne_BaseColor.png';
import suzanne_metallicRoughness from '../common/models/suzanne/Suzanne_MetallicRoughness.png';
import { gltfSmartLoad } from "../../utils/GLTFSmartLoad";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Sandbox from "../Sandbox";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import dat from 'dat.gui';
import Stats from "stats.js";

import { 
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    sRGBEncoding,
    DirectionalLight,
    HemisphereLight,
    Object3D,
    MathUtils,
    Mesh,
    MeshNormalMaterial,
    MeshBasicMaterial,
    MeshLambertMaterial,
    Material,
    MeshStandardMaterial,
    MeshPhongMaterial,
} from "three";
import { Time } from '../../utils/Time';
import { GLStats } from '../../utils/GLStats';

const instanceCount = 1000;
const instanceAreaSize = 40;
const instanceRotationSpeed = {
    x: 1,
    y: 2,
    z: 0,
}

const materialTypes = [ 'standard', 'phong', 'lambert', 'basic', 'normal' ] as const;
type MaterialType = typeof materialTypes[number];

export default class MeshPerformance extends Sandbox {

    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    orbitControls: OrbitControls;
    time: Time;
    
    srcSuzanneGltf: GLTF;
    srcSuzanneMaterial: MeshStandardMaterial;
    gui: dat.GUI;
    stats: Stats;
    glStats: GLStats;
    loaded: boolean;

    instances: Object3D[];
    dirLight1: DirectionalLight;
    dirLight2: DirectionalLight;
    hemiLight: HemisphereLight;
    materialType: MaterialType = 'standard';
    materialsMap = new Map<MaterialType, Material>();

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

        // Setup camera.
        this.camera = new PerspectiveCamera(60);
        this.camera.position.z = 0;
        this.camera.position.y = 0;
        this.camera.position.x = instanceAreaSize + 20;
        this.scene.add(this.camera);
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

        // Setup stats.
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.append(this.stats.dom);

        // Setup gl stats.
        this.glStats = new GLStats(this.renderer);
        this.glStats.dom.style.bottom = null;
        this.glStats.dom.style.top = '48px';
        document.body.append(this.glStats.dom);

        // Setup clock.
        this.time = new Time();

        // Add light to scene.
        this.dirLight1 = new DirectionalLight('#27c3f2', 1);
        this.dirLight1.position.set(-100, 200, -100);
        this.scene.add(this.dirLight1);

        this.dirLight2 = new DirectionalLight('#ffab2e', 1);
        this.dirLight2.position.set(100, 200, 100);
        this.scene.add(this.dirLight2);
        
        this.hemiLight = new HemisphereLight('#bde4ff', '#737063', 2);
        this.scene.add(this.hemiLight);

        this.update = this.update.bind(this);
        this.renderer.setAnimationLoop(this.update);

        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
        this.resize();
    }

    createMaterialsMap(standardMaterial: MeshStandardMaterial): Map<MaterialType, Material> {
        const map = new Map<MaterialType, Material>();
        
        map.set('standard', standardMaterial);

        map.set('phong', new MeshPhongMaterial({
            map: standardMaterial.map,
            // specularMap: standardMaterial.metalnessMap,
        }));

        map.set('lambert', new MeshLambertMaterial({
            map: standardMaterial.map,
            // specularMap: standardMaterial.roughnessMap,
        }));

        map.set('basic', new MeshBasicMaterial({
            map: standardMaterial.map
        }));

        map.set('normal', new MeshNormalMaterial({}));


        // Make sure all the entries in the map are set to a valid material.
        for (const materialType of materialTypes) {
            const m = map.get(materialType);
            if (!m) {
                throw new Error(`No material defined for material type '${materialType}'`);
            }
        }

        return map;
    }
    
    async start(): Promise<void> {
        this.setupRenderer();

        this.srcSuzanneGltf = await gltfSmartLoad({
            gltfUrl: suzanne_gltf,
            binUrl: suzanne_bin,
            textureUrls: [{
                filename: 'Suzanne_BaseColor.png',
                redirectUrl: suzanne_baseColor,
            }, {
                filename: 'Suzanne_MetallicRoughness.png',
                redirectUrl: suzanne_metallicRoughness
            }]
        });

        const srcSuzanneMaterial = (this.srcSuzanneGltf.scene.children[0] as Mesh).material as MeshStandardMaterial;
        console.log(`src suzanne material:`, srcSuzanneMaterial);

        // Setup materials map.
        this.materialsMap = this.createMaterialsMap(srcSuzanneMaterial);

        // Spawn instances randomly in area.
        this.instances = new Array(instanceCount);

        for (let i = 0; i < instanceCount; i++) {
            const instance = this.srcSuzanneGltf.scene.clone(true);
            
            // Make sure instance mesh has a unique material.
            const mesh = instance.children[0] as Mesh;
            mesh.material = (mesh.material as Material).clone();

            instance.position.set(
                MathUtils.randFloatSpread(instanceAreaSize),
                MathUtils.randFloatSpread(instanceAreaSize),
                MathUtils.randFloatSpread(instanceAreaSize)
            );
            instance.rotation.set(
                MathUtils.randFloat(0, Math.PI * 2),
                MathUtils.randFloat(0, Math.PI * 2),
                MathUtils.randFloat(0, Math.PI * 2)
            );
            this.scene.add(instance);
            this.instances[i] = instance;
        }

        this.initGui();

        this.loaded = true;
    }

    initGui(): void {
        this.gui = new dat.GUI();

        this.gui.add(this.dirLight1, 'visible').name('light 1');
        this.gui.add(this.dirLight2, 'visible').name('light 2');
        this.gui.add(this.hemiLight, 'visible').name('ambient light');
        this.gui.add(this, 'materialType', materialTypes).name('material type').onChange(() => this.updateMaterials());
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
    
    updateMaterials(): void {
        for (let i = 0; i < this.instances.length; i++) {
            const mesh = this.instances[i].children[0] as Mesh;

            (mesh.material as Material).dispose();
            mesh.material = this.materialsMap.get(this.materialType).clone();
        }
    }

    update(): void {
        if (!this.loaded) {
            return;
        }

        this.stats.begin();

        this.orbitControls.update();

        for (let i = 0; i < this.instances.length; i++) {
            this.instances[i].rotation.x += instanceRotationSpeed.x * this.time.deltaTime;
            this.instances[i].rotation.y += instanceRotationSpeed.y * this.time.deltaTime;
            this.instances[i].rotation.z += instanceRotationSpeed.z * this.time.deltaTime;
        }

        this.renderer.render(this.scene, this.camera);

        this.time.update();

        this.stats.end();
        this.glStats.update();
    }
}