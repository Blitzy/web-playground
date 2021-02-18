import { 
    WebGLRenderer,
    sRGBEncoding,
    Scene,
    PerspectiveCamera,
    DirectionalLight,
    HemisphereLight,
    TextureLoader,
    Texture,
    Object3D,
    UnsignedByteType,
    PMREMGenerator,
    MeshStandardMaterial,
    Mesh,
    FrontSide,
    LinearMipmapLinearFilter,
    Group,
    PCFSoftShadowMap,
    Vector3,
    Color,
    BoxBufferGeometry,
    PointLight,
    PointLightHelper,
    SpotLight,
    SpotLightHelper,
    CameraHelper,
} from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { gltfSmartLoad } from "../../utils/GLTFSmartLoad";
import Sandbox from "../Sandbox";
import { getJson, getMaterials, precacheObject3DTextures } from "../../utils/MiscUtils";
import Stats from "stats.js";
import { createOlympiaTerrain } from "./olympia-terrain/OlympiaTerrain";
import { CSM } from 'three/examples/jsm/csm/CSM';
import Bowser from 'bowser';
import dat from "dat.gui";
import { CSMUtils } from "../common/CSMUtils";

import venice_sunset_hdr from '../common/envmap/venice_sunset_1k.hdr';
import venice_sunset_dusk_hdr from '../common/envmap/venice_sunset_dusk_1k.hdr';
import venice_sunset_dusk_high_contrast_hdr from '../common/envmap/venice_sunset_dusk_high_contrast_1k.hdr';
import sky_hdr from '../common/envmap/Sky_Orig_BAKELIGHT.hdr';
import sky_ldr from '../common/envmap/Sky_Orig_BAKELIGHT.jpg';

import presets_json from './presets.json';

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
import datUtils from "../../utils/dat.gui.utils";

interface CubeConfig {
    position: { x: number, y: number, z: number };
    size: { x: number, y: number, z: number };
    color?: string;
}

const orbitControlPresetNames = [ 'interior_workshop', 'exterior_map' ] as const;
type OrbitControlPresetName = typeof orbitControlPresetNames[number];

interface OrbitControlPresetParams {
    position: Vector3;
    target: Vector3;
}

const CSM_Enabled: boolean = true;

export default class OlympiaRealtimeLightTest extends Sandbox {

    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    orbitControls: OrbitControls;
    activeOrbitControlPreset: OrbitControlPresetName = 'interior_workshop';

    orbitControlPresets: Record<OrbitControlPresetName, OrbitControlPresetParams> = {
        interior_workshop: {
            position: new Vector3(10, 3, 0),
            target: new Vector3(9, 3, 0),
        },
        exterior_map: {
            position: new Vector3(40.7, 187.8, 286),
            target: new Vector3(133.7, -19.7, 4.2),
        }
    }

    skyLight: HemisphereLight;
    skyLightParams = {
        color: [238,213,176],
        groundColor: [45,40,28],
    };

    interiorPointLight: PointLight;
    interiorPointLightHelper: PointLightHelper;
    interiorPointLightParams = {
        color: [255, 227, 208],
    }

    interiorSpotLight: SpotLight;
    interiorSpotLightHelper: SpotLightHelper;
    interiorSpotShadowHelper: CameraHelper;
    interiorSpotLightParams = {
        color: [255,227,208],
    }

    csm: CSM;
    csmParams = {
        visible: false,
        fade: true,
        cascades: 4,
        maxFar: 500,
        shadowMapSize: 2048,
        shadowBias: 0.00001,
        mode: 'practical',
        lightX: -1,
        lightY: -1,
        lightZ: -1,
        lightIntensity: 1,
        lightMargin: 200,
        lightFar: 1000,
        lightNear: 1,
        autoUpdate: true,
    }

    loaded: boolean;
    envMap: Texture;
    envMapParams = {
        visible: true,
    }
    orig_model: Object3D;
    terrain: Object3D;
    stats: Stats;
    gui: dat.GUI;

    cubeConfigs: CubeConfig[] = [{
            position: { x: -20, y: 0, z: -140 },
            size: { x: 60, y: 7, z: 100, },
        }, {
            position: { x: 0, y: 0, z: -25 },
            size: { x: 30, y: 6, z: 20, },
        }, {
            position: { x: -10, y: 0, z: -60 },
            size: { x: 30, y: 6, z: 30, },
        }, {
            position: { x: 175, y: 0, z: 40 },
            size: { x: 100, y: 20, z: 40, },
        }, {
            position: { x: 100, y: 0, z: -60 },
            size: { x: 20, y: 15, z: 20, },
        }, {
            position: { x: 130, y: 0, z: -90 },
            size: { x: 40, y: 10, z: 15, },
        }, {
            position: { x: 90, y: 0, z: -120 },
            size: { x: 35, y: 7, z: 35, },
        }, {
            position: { x: 25, y: 0, z: 100 },
            size: { x: 100, y: 10, z: 100, },
        }, {
            position: { x: 300, y: 0, z: 40 },
            size: { x: 20, y: 10, z: 150, },
        }, {
            position: { x: 400, y: 0, z: 200 },
            size: { x: 20, y: 10, z: 150, },
    }];

    setupRenderer(): void {
        // Setup renderer.
        this.renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
        });

        (window as any).renderer = this.renderer;

        this.renderer.outputEncoding = sRGBEncoding;
        // this.renderer.toneMapping = ACESFilmicToneMapping;
        // this.renderer.toneMappingExposure = 1;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;
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
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        (window as any).orbitControls = this.orbitControls;
        this.resetOrbitCamera();

        // Add cascaded shadow mapping to scene.
        if (CSM_Enabled) {
            this.csm = new CSM({
                maxFar: this.csmParams.maxFar,
                cascades: this.csmParams.cascades,
                mode: this.csmParams.mode,
                shadowMapSize: this.csmParams.shadowMapSize,
                shadowBias: this.csmParams.shadowBias,
                lightDirection: new Vector3(this.csmParams.lightX, this.csmParams.lightY, this.csmParams.lightZ).normalize(),
                lightMargin: this.csmParams.lightMargin,
                lightIntensity: this.csmParams.lightIntensity,
                lightFar: this.csmParams.lightFar,
                lightNear: this.csmParams.lightNear,
                parent: this.scene,
                camera: this.camera
            });
    
            // CSM constructor always sets this to false no matter what is passed.
            // So we have to set it afterwords.
            this.csm.fade = this.csmParams.fade;

            for (const light of this.csm.lights) {
                const l = light as DirectionalLight;
                l.visible = this.csmParams.visible;
            }
    
            (window as any).csm = this.csm;
        }
        
        // Add Sky light
        this.skyLight = new HemisphereLight();
        this.skyLight.name = 'Sky Light';
        this.skyLight.color.fromArray(this.skyLightParams.color);
        this.skyLight.groundColor.fromArray(this.skyLightParams.groundColor);
        this.skyLight.intensity = 0.0005;
        this.skyLight.visible = false;
        this.scene.add(this.skyLight);

        // Add interior point light
        this.interiorPointLight = new PointLight();
        this.interiorPointLight.name = 'Interior Point Light';
        this.interiorPointLight.color.fromArray(this.interiorPointLightParams.color);
        this.interiorPointLight.intensity = 0.001;
        this.interiorPointLight.distance = 40;
        this.interiorPointLight.decay = 2.8;
        this.interiorPointLight.visible = false;
        this.interiorPointLight.castShadow = true;
        this.interiorPointLight.shadow.mapSize.setScalar(512);
        this.interiorPointLight.shadow.radius = 2;
        this.interiorPointLight.position.set(-5, 10, 0)
        this.scene.add(this.interiorPointLight);

        this.interiorPointLightHelper = new PointLightHelper(this.interiorPointLight, 0.5);
        this.interiorPointLightHelper.visible = false;
        this.scene.add(this.interiorPointLightHelper);

        // Add interior spot light.
        this.interiorSpotLight = new SpotLight();
        this.interiorSpotLight.name = 'Interior Spot Light';
        this.interiorSpotLight.color.fromArray(this.interiorSpotLightParams.color);
        this.interiorSpotLight.intensity = 0.0015;
        this.interiorSpotLight.distance = 40;
        this.interiorSpotLight.decay = 1.1;
        this.interiorSpotLight.visible =  true;
        this.interiorSpotLight.castShadow = true;
        this.interiorSpotLight.shadow.mapSize.setScalar(512);
        this.interiorSpotLight.shadow.radius = 2;
        this.interiorSpotLight.shadow.focus = 1;
        this.interiorSpotLight.position.set(15.3, 13.3, 2.7);
        this.interiorSpotLight.penumbra = 1;
        this.interiorSpotLight.angle = 1.2;
        this.scene.add(this.interiorSpotLight);
        this.interiorSpotLight.target.position.set(-6.3, 0, 0);
        this.scene.add(this.interiorSpotLight.target);

        this.interiorSpotLightHelper = new SpotLightHelper(this.interiorSpotLight);
        this.interiorSpotLightHelper.visible = false;
        this.scene.add(this.interiorSpotLightHelper);

        this.interiorSpotShadowHelper = new CameraHelper(this.interiorSpotLight.shadow.camera);
        this.interiorSpotShadowHelper.visible = false;
        this.scene.add(this.interiorSpotShadowHelper);

        // await this.load_hdrEnvMap(venice_sunset_hdr);
        await this.load_hdrEnvMap(venice_sunset_dusk_hdr);
        // await this.load_hdrEnvMap(venice_sunset_dusk_high_contrast_hdr);
        // await this.load_hdrEnvMap(sky_hdr);
        // await this.load_ldrEnvMap(sky_ldr);

        if (this.envMapParams.visible) {
            this.scene.environment = this.envMap;
        }

        await this.load_terrain();
        await this.load_origModel();
        await this.load_cubes();

        await this.initGui();

        // this.renderer.shadowMap.needsUpdate = true;
        this.loaded = true;
    }

    async initGui(): Promise<void> {
        const guiPresets = await getJson(presets_json);
        this.gui = new dat.GUI({ closeOnTop: true, load: guiPresets });
        
        if (CSM_Enabled) {
            // Sun light (csm) folder.
            const sunLightFolder = this.gui.addFolder('sun light (csm)');
            this.gui.remember(this.csmParams);
    
            sunLightFolder.add(this.csmParams, 'visible').onChange((value: boolean) => {
                for (const light of this.csm.lights) {
                    const l = light as DirectionalLight;
                    l.visible = value;
                }
            });

            sunLightFolder.add(this.csmParams, 'fade').onChange((value: boolean) => {
                this.csm.fade = value;
                this.csm.updateFrustums();
            });
            sunLightFolder.add(this.csmParams, 'maxFar', 1, 50000).onChange((value: number) =>{
                this.csm.maxFar = value;
                this.csm.updateFrustums();
            });
            sunLightFolder.add(this.csmParams, 'mode', ['uniform', 'logarithmic', 'practical']).name( 'frustum split mode' ).onChange((value: string) => {
                this.csm.mode = value;
                this.csm.updateFrustums();
            });
            sunLightFolder.add(this.csmParams, 'lightX', -1, 1).name('light dir x').onChange((value: number) => {
                this.csm.lightDirection = new Vector3(this.csmParams.lightX, this.csmParams.lightY, this.csmParams.lightZ).normalize();
            });
            sunLightFolder.add(this.csmParams, 'lightY', -1, 1).name('light dir y').onChange((value: number) => {
                this.csm.lightDirection = new Vector3(this.csmParams.lightX, this.csmParams.lightY, this.csmParams.lightZ).normalize();
            });
            sunLightFolder.add(this.csmParams, 'lightZ', -1, 1).name('light dir z').onChange((value: number) => {
                this.csm.lightDirection = new Vector3(this.csmParams.lightX, this.csmParams.lightY, this.csmParams.lightZ).normalize();
            });
            sunLightFolder.add(this.csmParams, 'lightMargin').name('light margin').onChange((value: number) => {
                this.csm.lightMargin = value;
            });
            sunLightFolder.add(this.csmParams, 'lightNear').step(1).name('light near').onChange((value: number) => {
                this.csm.lightNear = value;
    
                for (const light of this.csm.lights) {
                    const l = light as DirectionalLight;
                    l.shadow.camera.near = value;
                    l.shadow.camera.updateProjectionMatrix();
                }
            });
            sunLightFolder.add(this.csmParams, 'lightFar').step(1).name('light far').onChange((value: number) => {
                this.csm.lightFar = value;
    
                for (const light of this.csm.lights) {
                    const l = light as DirectionalLight;
                    l.shadow.camera.far = value;
                    l.shadow.camera.updateProjectionMatrix();
                }
            });
            sunLightFolder.add(this.csmParams, 'shadowBias', -0.0001, 0.0001).step(0.000001).name('shadow bias').onChange((value: number) => {
                this.csm.shadowBias = value;
    
                for (const light of this.csm.lights) {
                    const l = light as DirectionalLight;
                    l.shadow.bias = value;
                    l.shadow.needsUpdate = true;
                    l.shadow.camera.updateProjectionMatrix();
                }
            });
            sunLightFolder.add(this.csmParams, 'autoUpdate').name('auto update');
            sunLightFolder.add(this, 'updateCSM').name('update csm');
        }
        
        // Sky light folder
        const skyLightFolder = this.gui.addFolder('sky light');
        this.gui.remember(this.skyLight);
        this.gui.remember(this.skyLightParams);

        skyLightFolder.add(this.skyLight, 'visible');

        skyLightFolder.addColor(this.skyLightParams, 'color').name('color').onChange((value: number[]) => {
            this.skyLight.color.fromArray(value);
        });

        skyLightFolder.addColor(this.skyLightParams, 'groundColor').name('ground color').onChange((value: number[]) => {
            this.skyLight.groundColor.fromArray(value);
        });

        skyLightFolder.add(this.skyLight, 'intensity', 0, 0.01).step(0.00001);

        // Interior point light folder.
        const interiorPointLightFolder = this.gui.addFolder('interior point light');
        this.gui.remember(this.interiorPointLight);
        this.gui.remember(this.interiorPointLight.position);
        this.gui.remember(this.interiorPointLightHelper);
        this.gui.remember(this.interiorPointLightParams);

        interiorPointLightFolder.add(this.interiorPointLight, 'visible');
        interiorPointLightFolder.add(this.interiorPointLightHelper, 'visible').name('helper visible');

        interiorPointLightFolder.addColor(this.interiorPointLightParams, 'color').onChange((value: number[]) => {
            this.interiorPointLight.color.fromArray(value);
        });

        interiorPointLightFolder.add(this.interiorPointLight, 'intensity', 0, 0.01).step(0.00001);
        interiorPointLightFolder.add(this.interiorPointLight, 'distance', 0, 1000);
        interiorPointLightFolder.add(this.interiorPointLight, 'decay', 0, 10);
        datUtils.addVector3(interiorPointLightFolder, 'position', this.interiorPointLight.position);

        const interiorPointLightShadowFolder = interiorPointLightFolder.addFolder('shadow');
        interiorPointLightShadowFolder.add(this.interiorPointLight, 'castShadow');
        interiorPointLightShadowFolder.add(this.interiorPointLight.shadow, 'radius', 0, 20);

        // Interior spot light folder.
        const interiorSpotLightFolder = this.gui.addFolder('interior spot light');
        this.gui.remember(this.interiorSpotLight);
        this.gui.remember(this.interiorSpotLight.position);
        this.gui.remember(this.interiorSpotLight.target.position);
        this.gui.remember(this.interiorSpotLightHelper);
        this.gui.remember(this.interiorSpotLightParams);

        interiorSpotLightFolder.add(this.interiorSpotLight, 'visible');
        interiorSpotLightFolder.add(this.interiorSpotLightHelper, 'visible').name('helper visible').onChange((value: boolean) => {
            // Also toggle shadow camera helper.
            this.interiorSpotShadowHelper.visible = value;
        });

        interiorSpotLightFolder.addColor(this.interiorSpotLightParams, 'color').onChange((value: number[]) => {
            this.interiorSpotLight.color.fromArray(value);
        });

        interiorSpotLightFolder.add(this.interiorSpotLight, 'intensity', 0, 0.01).step(0.00001);
        interiorSpotLightFolder.add(this.interiorSpotLight, 'distance', 0, 1000);
        interiorSpotLightFolder.add(this.interiorSpotLight, 'decay', 0, 10);
        interiorSpotLightFolder.add(this.interiorSpotLight, 'penumbra', 0, 1);
        interiorSpotLightFolder.add(this.interiorSpotLight, 'angle', 0, Math.PI / 2);
        datUtils.addVector3(interiorSpotLightFolder, 'position', this.interiorSpotLight.position);
        datUtils.addVector3(interiorSpotLightFolder, 'target position', this.interiorSpotLight.target.position);
        
        const interiorSpotLightShadowFolder = interiorSpotLightFolder.addFolder('shadow');
        interiorSpotLightShadowFolder.add(this.interiorSpotLight, 'castShadow');
        interiorSpotLightShadowFolder.add(this.interiorSpotLight.shadow, 'radius', 0, 20);
        interiorSpotLightShadowFolder.add(this.interiorSpotLight.shadow, 'focus', 0, 1);

        // Camera folder
        const cameraValuesFolder = this.gui.addFolder('camera values (read-only)');
        datUtils.addVector3(cameraValuesFolder, 'position', this.orbitControls.object.position, { listen: true });
        datUtils.addVector3(cameraValuesFolder, 'target', this.orbitControls.target, { listen: true });

        // Root folder.
        this.gui.remember(this);

        this.gui.add(this, 'activeOrbitControlPreset', orbitControlPresetNames).name('camera preset').onChange((value: OrbitControlPresetName) => {
            this.resetOrbitCamera();
        });

        this.gui.add(this, 'resetOrbitCamera').name('camera reset');

        this.gui.remember(this.envMapParams);
        this.gui.add(this.envMapParams, 'visible').name('environment map').onChange((value: boolean) => {
            this.scene.environment = value ? this.envMap : null;
        });

        this.gui.updateDisplay();
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

        if (CSM_Enabled) {
            CSMUtils.setupMaterials(this.csm, this.terrain);
        }

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

        if (CSM_Enabled) {
            CSMUtils.setupMaterials(this.csm, gltf.scene);
        }

        this.orig_model = gltf.scene;
        this.orig_model.name = 'Original Phidias Workshop';
        this.scene.add(this.orig_model);

        precacheObject3DTextures(this.renderer, this.orig_model);
    }

    async load_cubes(): Promise<void> {
        const cubeGroup = new Group();
        cubeGroup.name = 'Cubes Group';

        for (const cubeConfig of this.cubeConfigs) {
            const geo = new BoxBufferGeometry(cubeConfig.size.x, cubeConfig.size.y, cubeConfig.size.z);
            const mat = new MeshStandardMaterial({
                color: cubeConfig.color || new Color(0.5, 0.5, 0.5),
            });

            if (CSM_Enabled) {
                this.csm.setupMaterial(mat);
            }

            const mesh = new Mesh(geo, mat);
            mesh.position.set(cubeConfig.position.x, cubeConfig.position.y + (cubeConfig.size.y / 2), cubeConfig.position.z)
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            cubeGroup.add(mesh);
        }

        this.scene.add(cubeGroup);
    }

    resetOrbitCamera(): void {
        const preset = this.orbitControlPresets[this.activeOrbitControlPreset];

        this.orbitControls.object.position.copy(preset.position);
        this.orbitControls.target.copy(preset.target);
    }

    updateCSM(): void {
        if (CSM_Enabled) {
            if (this.csm) {
                this.csm.update();
            }
        }
    }

    resize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderer.setSize(width, height);

        // Set pixel ratio of webgl renderer.
        let pixelRatio = window.devicePixelRatio || 1;
        const bowserResult = Bowser.parse(window.navigator.userAgent);
        if (bowserResult.platform.type === 'mobile' || bowserResult.platform.type === 'tablet') {
            if (pixelRatio > 1) {
                // Half resolution on mobile devices that have a high density display.
                pixelRatio /= 2;
            }
        }
        
        this.renderer.setPixelRatio(pixelRatio);

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    update(): void {
        this.stats.begin();

        this.orbitControls.update();

        if (this.interiorPointLightHelper.visible) {
            this.interiorPointLightHelper.update();
        }
        if (this.interiorSpotLightHelper.visible) {
            this.interiorSpotLightHelper.update();
        }
        if (this.interiorSpotShadowHelper.visible) {
            this.interiorSpotShadowHelper.update();
        }

        if (CSM_Enabled) {
            if (this.csmParams.autoUpdate) {
                this.updateCSM();
            }
        }

        this.renderer.render(this.scene, this.camera);

        this.stats.end();
    }
}