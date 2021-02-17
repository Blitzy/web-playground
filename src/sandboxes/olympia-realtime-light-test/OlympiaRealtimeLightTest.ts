import { 
    WebGLRenderer,
    sRGBEncoding,
    Scene,
    PerspectiveCamera,
    DirectionalLight,
    HemisphereLight,
    TextureLoader,
    Texture,
    DirectionalLightHelper,
    Object3D,
    UnsignedByteType,
    PMREMGenerator,
    MeshStandardMaterial,
    Mesh,
    BufferGeometry,
    FrontSide,
    NormalMapTypes,
    ObjectSpaceNormalMap,
    TextureFilter,
    LinearFilter,
    WebGLCapabilities,
    LinearMipmapLinearFilter,
    PlaneBufferGeometry,
    VSMShadowMap,
    CameraHelper,
    Group,
    PCFSoftShadowMap,
    Vector3,
} from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { gltfSmartLoad } from "../../utils/GLTFSmartLoad";
import Sandbox from "../Sandbox";
import { getMaterials, precacheObject3DTextures } from "../../utils/MiscUtils";
import Stats from "stats.js";
import { createOlympiaTerrain } from "./olympia-terrain/OlympiaTerrain";
import { CSM } from 'three/examples/jsm/csm/CSM';
import { CSMHelper } from 'three/examples/jsm/csm/CSMHelper';

import venice_sunset_hdr from '../common/envmap/venice_sunset_1k.hdr';
import venice_sunset_dusk_hdr from '../common/envmap/venice_sunset_dusk_1k.hdr';
import venice_sunset_dusk_high_contrast_hdr from '../common/envmap/venice_sunset_dusk_high_contrast_1k.hdr';
import sky_hdr from '../common/envmap/Sky_Orig_BAKELIGHT.hdr';
import sky_ldr from '../common/envmap/Sky_Orig_BAKELIGHT.jpg';

// Original Phidias Workshop
import orig_workshop_gltf from '../common/models/orig-phidias-workshop/14-PhidiasWorkshop.gltf';
import orig_workshop_bin from '../common/models/orig-phidias-workshop/14-PhidiasWorkshop.bin';
import orig_limestone_diffuse_tex from '../common/models/orig-phidias-workshop/LimeStoneCoquille_color.jpg';
import orig_limestone_normal_tex from '../common/models/orig-phidias-workshop/LimeStoneCoquille_normal.jpg';
import orig_atlas_diffuse_tex from '../common/models/orig-phidias-workshop/PhidiasWorkshop_Atlas_c.jpg';
import orig_atlas_normal_tex from '../common/models/orig-phidias-workshop/PhidiasWorkshop_Atlas_nml.jpg';
import orig_pillar_normal_tex from '../common/models/orig-phidias-workshop/PillarGenericA_nml.jpg';
import orig_stuc_normal_tex from '../common/models/orig-phidias-workshop/Stuc_normal.jpg';
import orig_wood_diffuse_tex from '../common/models/orig-phidias-workshop/WoodOak_color.png';
import orig_wood_normal_tex from '../common/models/orig-phidias-workshop/WoodOak_normal.png';
import dat from "dat.gui";

export default class OlympiaRealtimeLightTest extends Sandbox {

    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    orbitControls: OrbitControls;

    // sunLightGroup: Group;
    // sunLight: DirectionalLight;
    // sunLightHelper: DirectionalLightHelper;
    // sunShadowHelper: CameraHelper;
    csm: CSM
    csmHelper: CSMHelper;
    skyLight: HemisphereLight;

    loaded: boolean;
    envMap: Texture;
    orig_model: Object3D;
    terrain: Object3D;
    stats: Stats;
    gui: dat.GUI;

    setupRenderer(): void {
        // Setup renderer.
        this.renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
        });

        this.renderer.outputEncoding = sRGBEncoding;
        // this.renderer.toneMapping = ACESFilmicToneMapping;
        // this.renderer.toneMappingExposure = 1;
        this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.type = VSMShadowMap;
        this.renderer.shadowMap.type = PCFSoftShadowMap;
        // this.renderer.shadowMap.autoUpdate = false;
        document.body.appendChild(this.renderer.domElement);
        
        // Setup stats.
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.append(this.stats.dom);

        // Setup scene.
        this.scene = new Scene();

        // Setup camera.
        this.camera = new PerspectiveCamera(60);
        this.scene.add(this.camera);

        this.update = this.update.bind(this);
        this.renderer.setAnimationLoop(this.update);

        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
        this.resize();
    }

    async start(): Promise<void> {
        this.setupRenderer();

        // Setup camera controls.
        this.camera.position.z = 0;
        this.camera.position.y = 3;
        this.camera.position.x = 10;
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.target.y = 3;

        // Add light to scene.
        // this.sunLightGroup = new Group();
        // this.sunLightGroup.name = 'Sun Light Group';
        
        // this.sunLight = new DirectionalLight('#e6ba87', 1);
        // this.sunLight.name = 'Sun Light';
        // this.sunLight.target.name = 'Sun Light Target';
        // this.sunLight.castShadow = true;
        // this.sunLight.position.set(300, 300, 300);
        // this.sunLight.target.position.set(0, 0, 0);

        // const shadowFrustumSize = 100;
        // this.sunLight.shadow.camera.left = -shadowFrustumSize;
        // this.sunLight.shadow.camera.right = shadowFrustumSize;
        // this.sunLight.shadow.camera.top = shadowFrustumSize;
        // this.sunLight.shadow.camera.bottom = -shadowFrustumSize;
        // this.sunLight.shadow.camera.far = 1000;
        // this.sunLight.shadow.mapSize.set(2048, 2048);
        // this.sunLight.shadow.bias = -0.0001;
        // this.sunLight.shadow.radius = 6;

        // this.sunLightGroup.add(this.sunLight);
        // this.sunLightGroup.add(this.sunLight.target);

        // this.sunLightHelper = new DirectionalLightHelper(this.sunLight, 10, '#ff0');
        // this.sunShadowHelper = new CameraHelper(this.sunLight.shadow.camera);

        // Add cascaded shadow mapping to scene.
        // this.csm = new CSM()

        (window as any).renderer = this.renderer;
        // (window as any).sunLight = this.sunLight;
        
        // this.scene.add(this.sunLightGroup);
        // this.scene.add(this.sunShadowHelper);
        // this.scene.add(this.sunLightHelper);
        
        this.skyLight = new HemisphereLight('#737063', '#000', 0);
        this.skyLight.name = 'Sky Light';
        this.scene.add(this.skyLight);

        // await this.load_hdrEnvMap(venice_sunset_hdr);
        await this.load_hdrEnvMap(venice_sunset_dusk_hdr);
        // await this.load_hdrEnvMap(venice_sunset_dusk_high_contrast_hdr);
        // await this.load_hdrEnvMap(sky_hdr);
        // await this.load_ldrEnvMap(sky_ldr);

        this.scene.environment = this.envMap;

        await this.load_terrain();
        await this.load_origModel();

        // Setup dat gui.
        this.gui = new dat.GUI();

        this.gui.updateDisplay();

        // this.renderer.shadowMap.needsUpdate = true;
        this.loaded = true;
    }

    async load_hdrEnvMap(url: string): Promise<void> {
        const pmremGenerator = new PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();
        
        await new Promise<void>((resolve, reject) => {
            new RGBELoader().setDataType(UnsignedByteType).load(url, 
                (texture) => {
                    this.envMap = pmremGenerator.fromEquirectangular(texture).texture;
                    pmremGenerator.dispose();

                    resolve();
                },
                undefined,
                reject
            );
        });
    }

    async load_ldrEnvMap(url: string): Promise<void> {
        const pmremGenerator = new PMREMGenerator(this.renderer);
        pmremGenerator.compileCubemapShader();
        
        await new Promise<void>((resolve, reject) => {
            new TextureLoader().load(url, 
                (texture) => {
                    this.envMap = pmremGenerator.fromEquirectangular(texture).texture;
                    pmremGenerator.dispose();

                    resolve();
                },
                undefined,
                reject
            );
        });
    }

    async load_terrain(): Promise<void> {
        this.terrain = await createOlympiaTerrain();
        this.terrain.name = 'Terrain';

        // Transform terrain so that the workshop building is roughly where it should be.
        this.terrain.position.set(371.300, -20.500, -170.130);
        this.terrain.rotation.y = Math.PI / 2;

        // Enable shadow casting and receiving.
        this.terrain.traverse((obj3d) => {
            obj3d.receiveShadow = true;
            obj3d.castShadow = true;
        });

        this.scene.add(this.terrain);
    }

    async load_origModel(): Promise<void> {
        const gltf = await gltfSmartLoad({
            gltfUrl: orig_workshop_gltf,
            binUrl: orig_workshop_bin,
            textureUrls: [
                { filename: 'LimeStoneCoquille_color.jpg', redirectUrl: orig_limestone_diffuse_tex },
                { filename: 'LimeStoneCoquille_normal.jpg', redirectUrl: orig_limestone_normal_tex },
                { filename: 'PhidiasWorkshop_Atlas_c.jpg', redirectUrl: orig_atlas_diffuse_tex },
                { filename: 'PhidiasWorkshop_Atlas_nml.jpg', redirectUrl: orig_atlas_normal_tex },
                { filename: 'PillarGenericA_nml.jpg', redirectUrl: orig_pillar_normal_tex },
                { filename: 'Stuc_normal.jpg', redirectUrl: orig_stuc_normal_tex },
                { filename: 'WoodOak_color.png', redirectUrl: orig_wood_diffuse_tex },
                { filename: 'WoodOak_normal.png', redirectUrl: orig_wood_normal_tex },
            ]
        });

        gltf.scene.traverse((obj3d) => {
            // Enable shadow casting and receiving.
            obj3d.receiveShadow = true;
            obj3d.castShadow = true;

            if (obj3d instanceof Mesh) {
                const materials = getMaterials(obj3d);
                if (materials) {
                    for (const material of materials) {
                        // TEMP FIX: Force all materials to front sided rendered.
                        material.side = FrontSide;
                        
                        // TEMP FIX: Force all maps to use LinearMipmapLinearFilter as minFilter.
                        if (material instanceof MeshStandardMaterial) {
                            if (material.map) {
                                material.map.minFilter = LinearMipmapLinearFilter;
                            }
                            if (material.normalMap) {
                                material.normalMap.minFilter = LinearMipmapLinearFilter;
                            }

                            material.normalMap.needsUpdate = true;
                        }

                        material.needsUpdate = true;
                    }
                }
            }
        });

        this.orig_model = gltf.scene;
        this.orig_model.name = 'Original Phidias Workshop';
        this.scene.add(this.orig_model);

        precacheObject3DTextures(this.renderer, this.orig_model);
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
        this.stats.begin();

        this.orbitControls.update();
        // this.sunLightHelper.update();
        // this.sunShadowHelper.update();

        this.renderer.render(this.scene, this.camera);

        this.stats.end();
    }
}