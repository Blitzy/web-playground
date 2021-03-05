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
    ShaderMaterial,
    Cache,
    ACESFilmicToneMapping,
} from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { gltfSmartLoad } from "../../utils/GLTFSmartLoad";
import Sandbox from "../Sandbox";
import { getJson, getMaterials, precacheObject3DTextures } from "../../utils/MiscUtils";
import Stats from "stats.js";
import { createOlympiaTerrain } from "./olympia-terrain/OlympiaTerrain";
import { CSM } from 'three/examples/jsm/csm/CSM';
import { CSMHelper } from 'three/examples/jsm/csm/CSMHelper';
import Bowser from 'bowser';
import dat from "dat.gui";
import { CSMUtils } from "../common/CSMUtils";
import datUtils from "../../utils/dat.gui.utils";
import { modelConfigs } from "./config/Models";
import { cubeConfigs } from "./config/Cubes";

import presets_json from './presets.json';
import venice_sunset_dusk_hdr from '../common/envmap/venice_sunset_dusk_1k.hdr';

Cache.enabled = true;

const orbitControlPresetNames = [ 'interior_workshop', 'exterior_map' ] as const;
type OrbitControlPresetName = typeof orbitControlPresetNames[number];

interface OrbitControlPresetParams {
    position: Vector3;
    target: Vector3;
}

interface CustomBreaks {
    [key: number]: number;
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
    csmHelper: CSMHelper;
    csmParams = {
        visible: false,
        fade: true,
        cascades: 2,
        maxFar: 500,
        shadowMapSize: 2048,
        shadowBias: 0.00001,
        mode: 'practical',
        customBreaks: {},
        lightX: -1,
        lightY: -1,
        lightZ: -1,
        lightIntensity: 1,
        lightColor: [230, 186, 135],
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
    terrain: Object3D;
    terrainParams = {
        fogHeight: -7.5,
        fogColor: [43, 92, 147],
        fogSmooth: 2.5,
    }
    terrainMesh: Mesh;
    terrainMaterial: ShaderMaterial;
    stats: Stats;
    gui: dat.GUI;

    setupRenderer(): void {
        // Setup renderer.
        this.renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
        });

        (window as any).renderer = this.renderer;

        this.renderer.outputEncoding = sRGBEncoding;
        // this.renderer.toneMapping = 4;
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
        this.camera.near = 0.5;
        this.camera.far = 2000;
        this.scene.add(this.camera);
        (window as any).camera = this.camera;

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
        this.orbitControls.screenSpacePanning = false;
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

            (window as any).csm = this.csm;
    
            // CSM constructor always sets this to false no matter what is passed.
            // So we have to set it afterwords.
            this.csm.fade = this.csmParams.fade;

            for (const light of this.csm.lights) {
                const l = light as DirectionalLight;
                l.visible = this.csmParams.visible;
                // l.color.set
                l.color.setRGB(
                    this.csmParams.lightColor[0] / 255,
                    this.csmParams.lightColor[1] / 255,
                    this.csmParams.lightColor[2] / 255,
                );
            }

            // Add custom break values to params now that we know what number of cascades we have.
            for (let i = 0; i < this.csmParams.cascades; i++) {
                // Uniform split by default.
                const customBreaks = this.csmParams.customBreaks as CustomBreaks;
                customBreaks[i] = 1 * ((i + 1) / this.csmParams.cascades);
            }

            // Setup the custom split function that simply returns the custom break values.
            this.csm.customSplitsCallback = (cascades: number, near: number, far: number, breaks: number[]) => {
                const customBreaks = this.csmParams.customBreaks as CustomBreaks;
                for (let i = 0; i < this.csmParams.cascades; i++) {
                    breaks.push(customBreaks[i]);
                }

                return breaks;
            }

            this.csmHelper = new CSMHelper(this.csm);
            (this.csmHelper as unknown as Group).visible = false;
            this.scene.add(this.csmHelper as unknown as Group);
        }
        
        // Add Sky light
        this.skyLight = new HemisphereLight();
        this.skyLight.name = 'Sky Light';
        this.skyLight.color.setRGB(
            this.skyLightParams.color[0] / 255,
            this.skyLightParams.color[1] / 255,
            this.skyLightParams.color[2] / 255,
        );
        this.skyLight.groundColor.setRGB(
            this.skyLightParams.groundColor[0] / 255,
            this.skyLightParams.groundColor[1] / 255,
            this.skyLightParams.groundColor[2] / 255,
        );
        this.skyLight.intensity = 1;
        this.skyLight.visible = false;
        this.scene.add(this.skyLight);

        // Add interior point light
        this.interiorPointLight = new PointLight();
        this.interiorPointLight.name = 'Interior Point Light';
        this.interiorPointLight.color.setRGB(
            this.interiorPointLightParams.color[0] / 255,
            this.interiorPointLightParams.color[1] / 255,
            this.interiorPointLightParams.color[2] / 255,
        );
        this.interiorPointLight.intensity = 1;
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
        this.interiorSpotLight.color.setRGB(
            this.interiorSpotLightParams.color[0] / 255,
            this.interiorSpotLightParams.color[1] / 255,
            this.interiorSpotLightParams.color[2] / 255,
        );
        this.interiorSpotLight.intensity = 1;
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
        await this.load_models();
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
            sunLightFolder.add(this.csmParams, 'mode', ['uniform', 'logarithmic', 'practical', 'custom']).name( 'frustum split mode' ).onChange((value: string) => {
                this.csm.mode = value;
                this.csm.updateFrustums();
            });

            const customBreaksFolder = sunLightFolder.addFolder('custom breaks');
            for (let i = 0; i < this.csmParams.cascades; i++) {
                customBreaksFolder.add(this.csmParams.customBreaks, i.toString(), 0, 1).step(0.01).onChange((value: number) => {
                    this.csm.updateFrustums();
                });
            }
            
            sunLightFolder.add(this.csmParams, 'lightX', -1, 1).name('light dir x').onChange((value: number) => {
                this.csm.lightDirection = new Vector3(this.csmParams.lightX, this.csmParams.lightY, this.csmParams.lightZ).normalize();
            });
            sunLightFolder.add(this.csmParams, 'lightY', -1, 1).name('light dir y').onChange((value: number) => {
                this.csm.lightDirection = new Vector3(this.csmParams.lightX, this.csmParams.lightY, this.csmParams.lightZ).normalize();
            });
            sunLightFolder.add(this.csmParams, 'lightZ', -1, 1).name('light dir z').onChange((value: number) => {
                this.csm.lightDirection = new Vector3(this.csmParams.lightX, this.csmParams.lightY, this.csmParams.lightZ).normalize();
            });
            sunLightFolder.addColor(this.csmParams, 'lightColor').name('light color').onChange((value: number[]) => {
                for (const light of this.csm.lights) {
                    const l = light as DirectionalLight;
                    l.color.setRGB(value[0] / 255, value[1] / 255, value[2] / 255);
                }
            });
            sunLightFolder.add(this.csmParams, 'lightIntensity', 0, 10).name('light intensity').step(0.1).onChange((value: number) => {
                this.csm.lightIntensity = value;
                for (const light of this.csm.lights) {
                    const l = light as DirectionalLight;
                    l.intensity = value;
                }
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

            const csmHelperFolder = sunLightFolder.addFolder('csm helper');
            csmHelperFolder.open();
            csmHelperFolder.add(this.csmHelper, 'visible');
            csmHelperFolder.add(this.csmHelper, 'displayFrustum').name('show frustum');
            csmHelperFolder.add(this.csmHelper, 'displayPlanes').name('show planes');
            csmHelperFolder.add(this.csmHelper, 'displayShadowBounds').name('show shadow bounds');

        }
        
        // Sky light folder
        const skyLightFolder = this.gui.addFolder('sky light');
        this.gui.remember(this.skyLight);
        this.gui.remember(this.skyLightParams);

        skyLightFolder.add(this.skyLight, 'visible');

        skyLightFolder.addColor(this.skyLightParams, 'color').name('color').onChange((value: number[]) => {
            this.skyLight.color.setRGB(
                value[0] / 255,
                value[1] / 255,
                value[2] / 255,
            );
        });

        skyLightFolder.addColor(this.skyLightParams, 'groundColor').name('ground color').onChange((value: number[]) => {
            this.skyLight.groundColor.setRGB(
                value[0] / 255,
                value[1] / 255,
                value[2] / 255,
            );
        });

        skyLightFolder.add(this.skyLight, 'intensity', 0, 10).step(0.1);

        // Interior point light folder.
        const interiorPointLightFolder = this.gui.addFolder('interior point light');
        this.gui.remember(this.interiorPointLight);
        this.gui.remember(this.interiorPointLight.position);
        this.gui.remember(this.interiorPointLightHelper);
        this.gui.remember(this.interiorPointLightParams);

        interiorPointLightFolder.add(this.interiorPointLight, 'visible');
        interiorPointLightFolder.add(this.interiorPointLightHelper, 'visible').name('helper visible');

        interiorPointLightFolder.addColor(this.interiorPointLightParams, 'color').onChange((value: number[]) => {
            this.interiorPointLight.color.setRGB(
                value[0] / 255,
                value[1] / 255,
                value[2] / 255,
            );
        });

        interiorPointLightFolder.add(this.interiorPointLight, 'intensity', 0, 10).step(0.1);
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
            this.interiorSpotLight.color.setRGB(
                value[0] / 255,
                value[1] / 255,
                value[2] / 255,
            );
        });

        interiorSpotLightFolder.add(this.interiorSpotLight, 'intensity', 0, 10).step(0.1);
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

        // Terrain folder.
        const terrainFolder = this.gui.addFolder('terrain');
        terrainFolder.add(this.terrainMaterial.uniforms['soilRepeat'], 'value').name('soilRepeat');
        terrainFolder.add(this.terrainMaterial.uniforms['soilLightRepeat'], 'value').name('soilLightRepeat');
        terrainFolder.add(this.terrainMaterial.uniforms['wetSandRepeat'], 'value').name('wetSandRepeat');
        terrainFolder.add(this.terrainMaterial.uniforms['grassRepeat'], 'value').name('grassRepeat');
        terrainFolder.add(this.terrainMaterial.uniforms['hipodromRepeat'], 'value').name('hipodromRepeat');
        terrainFolder.add(this.terrainMaterial.uniforms['groundRepeat'], 'value').name('groundRepeat');
        terrainFolder.add(this.terrainMaterial.uniforms['rockARepeat'], 'value').name('rockARepeat');
        terrainFolder.add(this.terrainMaterial.uniforms['gravelARepeat'], 'value').name('gravelARepeat');
        terrainFolder.addColor(this.terrainParams, 'fogColor').name('fog color').onChange((value: number[]) => {
            this.terrainMaterial.uniforms['heightFogColor'].value = new Color().setRGB(
                value[0] / 255,
                value[1] / 255,
                value[2] / 255,
            );
        });
        terrainFolder.add(this.terrainParams, 'fogHeight').name('fog height').onChange((value: number) => {
            this.terrainMaterial.uniforms['heightFogPos'].value = value;
        });
        terrainFolder.add(this.terrainParams, 'fogSmooth').name('fog smooth').onChange((value: number) => {
            this.terrainMaterial.uniforms['heightFogSmooth'].value = value;
        });

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

        this.gui.preset = 'Exterior Map';
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

        this.terrainMesh = this.terrain.children[0] as Mesh;
        this.terrainMaterial = this.terrainMesh.material as ShaderMaterial;

        this.terrainMaterial.uniforms['heightFogColor'].value = new Color().setRGB(
            this.terrainParams.fogColor[0] / 255,
            this.terrainParams.fogColor[1] / 255,
            this.terrainParams.fogColor[2] / 255,
        );
        this.terrainMaterial.uniforms['heightFogPos'].value = this.terrainParams.fogHeight;
        this.terrainMaterial.uniforms['heightFogSmooth'].value = this.terrainParams.fogSmooth;

        if (CSM_Enabled) {
            CSMUtils.setupMaterials(this.csm, this.terrain);
        }

        // Transform terrain so that the workshop building is roughly where it should be.
        this.terrain.position.set(371.300, -20.500, -170.130);
        this.terrain.rotation.y = Math.PI / 2;

        // Enable shadow casting and receiving.
        this.terrain.traverse((obj3d) => {
            obj3d.receiveShadow = true;
            obj3d.castShadow = false;
        });

        this.scene.add(this.terrain);
    }

    async load_models(): Promise<void> {
        const modelGroup = new Group();
        modelGroup.name = 'Model Group';
        this.scene.add(modelGroup);

        for (const cfg of modelConfigs) {
            // Load gltf and clone an instance of it.
            const instance = await new Promise<Group>((resolve) => {
                gltfSmartLoad(cfg.gltf).then((gltf) => resolve(gltf.scene));
            });
    
            instance.traverse((obj3d) => {
                // Enable shadow casting and receiving.
                obj3d.receiveShadow = cfg.receiveShadow ?? true;
                obj3d.castShadow = cfg.castShadow ?? true;
    
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
                CSMUtils.setupMaterials(this.csm, instance);
            }
    
            instance.name = 'Original Phidias Workshop';
            instance.position.set(cfg.position.x, cfg.position.y, cfg.position.z);
            instance.rotation.set(cfg.rotation.x, cfg.rotation.y, cfg.rotation.z);
            if (cfg.scale) {
                instance.scale.set(cfg.scale.x, cfg.scale.y, cfg.scale.z);
            }
            
            modelGroup.add(instance);
    
            precacheObject3DTextures(this.renderer, instance);
        }
    }

    async load_cubes(): Promise<void> {
        const cubeGroup = new Group();
        cubeGroup.name = 'Cubes Group';
        this.scene.add(cubeGroup);

        for (const cfg of cubeConfigs) {
            const geo = new BoxBufferGeometry(cfg.size.x, cfg.size.y, cfg.size.z);
            const mat = new MeshStandardMaterial({
                color: cfg.color || new Color(0.5, 0.5, 0.5),
            });

            if (CSM_Enabled) {
                this.csm.setupMaterial(mat);
            }

            const mesh = new Mesh(geo, mat);
            mesh.position.set(cfg.position.x, cfg.position.y + (cfg.size.y / 2), cfg.position.z)
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            cubeGroup.add(mesh);
        }
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
            if (this.csmHelper) {
                this.csmHelper.updateVisibility();
                this.csmHelper.update();
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