import { 
    WebGLRenderer,
    sRGBEncoding,
    Scene,
    PerspectiveCamera,
    DirectionalLight,
    HemisphereLight,
    Mesh,
    MeshStandardMaterial,
    TextureLoader,
    Texture,
    Object3D,
    PMREMGenerator,
    FrontSide,
} from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { gltfSmartLoad } from "../../utils/GLTFSmartLoad";
import Sandbox from "../Sandbox";
import { getMaterials, precacheObject3DTextures } from "../../utils/MiscUtils";
import dat from "dat.gui";

import venice_sunset_dusk_hdr from '../common/envmap/venice_sunset_dusk_1k.hdr';
// import sky_hdr from '../common/envmap/Sky_Orig_BAKELIGHT.hdr';
// import sky_ldr from '../common/envmap/Sky_Orig_BAKELIGHT.jpg';

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

// v1 Phidias Workshop Color
import v1_color_workshop_gltf from './models/phidias-workshop-color/14-PhidiasWorkshop.gltf';
import v1_color_workshop_bin from './models/phidias-workshop-color/14-PhidiasWorkshop.bin';
import v1_color_limestone_lightmap_tex from './models/phidias-workshop-color/Limestone_Coquille_LightMap.png';
import v1_color_limestone_diffuse_tex from './models/phidias-workshop-color/LimeStoneCoquille_color.jpg';
import v1_color_limestone_normal_tex from './models/phidias-workshop-color/LimeStoneCoquille_normal.jpg';
import v1_color_atlas_lightmap_tex from './models/phidias-workshop-color/LOD0_PhidiasAtlas_LightMap.png';
import v1_color_atlas_diffuse_tex from './models/phidias-workshop-color/PhidiasWorkshop_Atlas_c.jpg';
import v1_color_atlas_normal_tex from './models/phidias-workshop-color/PhidiasWorkshop_Atlas_nml.jpg';
import v1_color_pillar_normal_tex from './models/phidias-workshop-color/PillarGenericA_nml.jpg';
import v1_color_pillar_lightmap_tex from './models/phidias-workshop-color/Pillars_LightMap.png';
import v1_color_stuc_lightmap_tex from './models/phidias-workshop-color/Struc_LightMap.png';
import v1_color_stuc_normal_tex from './models/phidias-workshop-color/Stuc_normal.jpg';
import v1_color_wood_lightmap_tex from './models/phidias-workshop-color/Oak_LightMap.png';
import v1_color_wood_diffuse_tex from './models/phidias-workshop-color/WoodOak_color.png';
import v1_color_wood_normal_tex from './models/phidias-workshop-color/WoodOak_normal.png';

// v1 Phidias Workshop greyscale
import v1_greyscale_workshop_gltf from './models/phidias-workshop-greyscale/14-PhidiasWorkshop.gltf';
import v1_greyscale_workshop_bin from './models/phidias-workshop-greyscale/14-PhidiasWorkshop.bin';
import v1_greyscale_limestone_lightmap_tex from './models/phidias-workshop-greyscale/Limestone_Coquille_LightMap.png';
import v1_greyscale_limestone_diffuse_tex from './models/phidias-workshop-greyscale/LimeStoneCoquille_color.jpg';
import v1_greyscale_limestone_normal_tex from './models/phidias-workshop-greyscale/LimeStoneCoquille_normal.jpg';
import v1_greyscale_atlas_lightmap_tex from './models/phidias-workshop-greyscale/LOD0_PhidiasAtlas_LightMap.png';
import v1_greyscale_atlas_diffuse_tex from './models/phidias-workshop-greyscale/PhidiasWorkshop_Atlas_c.jpg';
import v1_greyscale_atlas_normal_tex from './models/phidias-workshop-greyscale/PhidiasWorkshop_Atlas_nml.jpg';
import v1_greyscale_pillar_normal_tex from './models/phidias-workshop-greyscale/PillarGenericA_nml.jpg';
import v1_greyscale_pillar_lightmap_tex from './models/phidias-workshop-greyscale/Pillars_LightMap.png';
import v1_greyscale_stuc_lightmap_tex from './models/phidias-workshop-greyscale/Struc_LightMap.png';
import v1_greyscale_stuc_normal_tex from './models/phidias-workshop-greyscale/Stuc_normal.jpg';
import v1_greyscale_wood_lightmap_tex from './models/phidias-workshop-greyscale/Oak_LightMap.png';
import v1_greyscale_wood_diffuse_tex from './models/phidias-workshop-greyscale/WoodOak_color.png';
import v1_greyscale_wood_normal_tex from './models/phidias-workshop-greyscale/WoodOak_normal.png';

// v2 Phidias Workshop color
import v2_color_workshop_gltf from './models/v2-phidias-workshop-color/14-PhidiasWorkshop.gltf';
import v2_color_workshop_bin from './models/v2-phidias-workshop-color/14-PhidiasWorkshop.bin';
import v2_color_limestone_ao_tex from './models/v2-phidias-workshop-color/Limestone_Coquille_AO.png';
import v2_color_limestone_lightmap_tex from './models/v2-phidias-workshop-color/Limestone_Coquille_LightMap.png';
import v2_color_limestone_diffuse_tex from './models/v2-phidias-workshop-color/LimeStoneCoquille_color.jpg';
import v2_color_limestone_normal_tex from './models/v2-phidias-workshop-color/LimeStoneCoquille_normal.jpg';
import v2_color_atlas_ao_tex from './models/v2-phidias-workshop-color/LOD0_PhidiasAtlas_AO.png';
import v2_color_atlas_lightmap_tex from './models/v2-phidias-workshop-color/LOD0_PhidiasAtlas_LightMap.png';
import v2_color_atlas_diffuse_tex from './models/v2-phidias-workshop-color/PhidiasWorkshop_Atlas_c.jpg';
import v2_color_atlas_normal_tex from './models/v2-phidias-workshop-color/PhidiasWorkshop_Atlas_nml.jpg';
import v2_color_pillar_normal_tex from './models/v2-phidias-workshop-color/PillarGenericA_nml.jpg';
import v2_color_pillar_ao_tex from './models/v2-phidias-workshop-color/Pillars_AO.png';
import v2_color_pillar_lightmap_tex from './models/v2-phidias-workshop-color/Pillars_LightMap.png';
import v2_color_stuc_ao_tex from './models/v2-phidias-workshop-color/Struc_AO.png';
import v2_color_stuc_lightmap_tex from './models/v2-phidias-workshop-color/Struc_LightMap.png';
import v2_color_stuc_normal_tex from './models/v2-phidias-workshop-color/Stuc_normal.jpg';
import v2_color_wood_ao_tex from './models/v2-phidias-workshop-color/Oak_AO.png';
import v2_color_wood_lightmap_tex from './models/v2-phidias-workshop-color/Oak_LightMap.png';
import v2_color_wood_diffuse_tex from './models/v2-phidias-workshop-color/WoodOak_color.png';
import v2_color_wood_normal_tex from './models/v2-phidias-workshop-color/WoodOak_normal.png';
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

const modes = [ 'original', 'v1 color', 'v1 greyscale', 'v2 color' ] as const;

type Mode = typeof modes[number];

export default class OlympiaLightmapTest extends Sandbox {

    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    orbitControls: OrbitControls;
    
    sunLight: DirectionalLight;
    // sunLightHelper: DirectionalLightHelper;
    skyLight: HemisphereLight;

    envMap: Texture;
    envMapVisible: boolean = false;
    
    loaded: boolean;
    currentMode: Mode = 'v2 color';

    gui: dat.GUI;
    currentModeController: dat.GUIController;
    sunLightController: dat.GUIController;
    skyLightController: dat.GUIController;
    envMapController: dat.GUIController;

    orig_model: Object3D;
    v1_colorModel: Object3D;
    v1_greyscaleModel: Object3D;
    v2_colorModel: Object3D;

    setupRenderer(): void {
        // Setup renderer.
        this.renderer = new WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });

        this.renderer.outputEncoding = sRGBEncoding;
        // this.renderer.toneMapping = ACESFilmicToneMapping;
        // this.renderer.toneMappingExposure = 1;
        document.body.appendChild(this.renderer.domElement);
        
        // Setup scene.
        this.scene = new Scene();

        // Setup camera.
        this.camera = new PerspectiveCamera(60);
        this.camera.position.z = 0;
        this.camera.position.y = 3;
        this.camera.position.x = 10;
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
        this.orbitControls.target.y = 3;

        // Add light to scene.
        this.sunLight = new DirectionalLight('#e6ba87', 1);
        this.sunLight.name = 'Sun Light';
        this.sunLight.target.name = 'Sun Light Target';
        // this.sunLightHelper = new DirectionalLightHelper(this.sunLight, 10, '#ff0');
        this.sunLight.position.set(0, 50, 0);
        this.sunLight.target.position.set(-45, 0, 35);
        this.scene.add(this.sunLight);
        this.scene.add(this.sunLight.target);
        // this.scene.add(this.sunLightHelper);
        
        this.skyLight = new HemisphereLight('#737063', '#737063', 0.025);
        this.skyLight.name = 'Sky Light';
        this.scene.add(this.skyLight);

        await this.load_hdrEnvMap(venice_sunset_dusk_hdr);
        // await this.load_hdrEnvMap(sky_hdr);
        // await this.load_ldrEnvMap(sky_ldr);

        await Promise.all([
            this.load_origModel(),
            this.load_v1_ColorModel(),
            this.load_v1_GreyscaleModel(),
            this.load_v2_ColorModel(),
        ]);

        // Setup dat gui.
        this.gui = new dat.GUI();

        this.currentModeController = this.gui.add(this, 'currentMode', modes).name('model mode').onChange((value: Mode) => {
            this.changeMode(value);
        });

        const lightingFolder = this.gui.addFolder('lighting');

        this.sunLightController = lightingFolder.add(this.sunLight, 'visible').name('sun light');
        this.skyLightController = lightingFolder.add(this.skyLight, 'visible').name('sky light');
        this.envMapController = lightingFolder.add(this, 'envMapVisible').name('environment map').onChange((value: boolean) => {
            this.scene.environment = value ? this.envMap : null;
        });

        this.loaded = true;
        this.changeMode(this.currentMode);
    }

    changeMode(mode: Mode): void {
        if (!this.loaded) {
            return;
        }

        this.orig_model.visible = mode === 'original';
        this.v1_colorModel.visible = mode === 'v1 color';
        this.v1_greyscaleModel.visible = mode === 'v1 greyscale';
        this.v2_colorModel.visible = mode === 'v2 color';
        
        if (mode === 'original') {
            this.sunLightController.setValue(true);
            this.skyLightController.setValue(true);
            this.envMapController.setValue(false);
        } else if (mode === 'v1 color') {
            this.sunLightController.setValue(false);
            this.skyLightController.setValue(false);
            this.envMapController.setValue(false);
        } else if (mode === 'v1 greyscale') {
            this.sunLightController.setValue(false);
            this.skyLightController.setValue(false);
            this.envMapController.setValue(false);
        } else if (mode === 'v2 color') {
            this.sunLightController.setValue(false);
            this.skyLightController.setValue(false);
            this.envMapController.setValue(true);
        } else {
            console.error(`Mode ${mode} is not implemented.`)
        }

        this.currentMode = mode;
        this.gui.updateDisplay();
    }

    async load_hdrEnvMap(url: string): Promise<void> {
        const pmremGenerator = new PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();
        
        await new Promise<void>((resolve, reject) => {
            new RGBELoader().load(url, 
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

            // new RGBELoader().setDataType(UnsignedByteType).load(url, 
            //     (texture) => {
            //         this.envMap = pmremGenerator.fromEquirectangular(texture).texture;
            //         pmremGenerator.dispose();

            //         resolve();
            //     },
            //     undefined,
            //     reject
            // );
        });
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

        this.setAllMaterialsFrontSided(gltf);

        this.orig_model = gltf.scene;
        this.orig_model.visible = false;
        this.orig_model.name = 'Original Phidias Workshop';
        this.scene.add(this.orig_model);

        precacheObject3DTextures(this.renderer, this.orig_model);
    }

    async load_v1_ColorModel(): Promise<void> {
        const gltf = await gltfSmartLoad({
            gltfUrl: v1_color_workshop_gltf,
            binUrl: v1_color_workshop_bin,
            textureUrls: [
                { filename: 'LimeStoneCoquille_color.jpg', redirectUrl: v1_color_limestone_diffuse_tex },
                { filename: 'LimeStoneCoquille_normal.jpg', redirectUrl: v1_color_limestone_normal_tex },
                { filename: 'PhidiasWorkshop_Atlas_c.jpg', redirectUrl: v1_color_atlas_diffuse_tex },
                { filename: 'PhidiasWorkshop_Atlas_nml.jpg', redirectUrl: v1_color_atlas_normal_tex },
                { filename: 'PillarGenericA_nml.jpg', redirectUrl: v1_color_pillar_normal_tex },
                { filename: 'Stuc_normal.jpg', redirectUrl: v1_color_stuc_normal_tex },
                { filename: 'WoodOak_color.png', redirectUrl: v1_color_wood_diffuse_tex },
                { filename: 'WoodOak_normal.png', redirectUrl: v1_color_wood_normal_tex },
            ]
        });

        this.setAllMaterialsFrontSided(gltf);

        this.v1_colorModel = gltf.scene;
        this.v1_colorModel.visible = false;
        this.v1_colorModel.name = 'v1 Phidias Workshop Color';
        this.scene.add(this.v1_colorModel);

        precacheObject3DTextures(this.renderer, this.v1_colorModel);

        // Assign lightmap textures.
        const meshStuc = this.v1_colorModel.getObjectByName('PhidiasWorkshop_ModelFixesstruc_mesh') as Mesh;
        this.assignLightmap(meshStuc, v1_color_stuc_lightmap_tex, false);

        const meshPillars = this.v1_colorModel.getObjectByName('PhidiasWorkshop_ModelFixespillars_mesh') as Mesh;
        this.assignLightmap(meshPillars, v1_color_pillar_lightmap_tex, false);

        const meshLimestone = this.v1_colorModel.getObjectByName('PhidiasWorkshop_ModelFixesLimestone_Coquille_mesh') as Mesh;
        this.assignLightmap(meshLimestone, v1_color_limestone_lightmap_tex, false);

        const meshAtlas = this.v1_colorModel.getObjectByName('PhidiasWorkshop_ModelFixesLOD0_PhidiasAtlas_mesh') as Mesh;
        this.assignLightmap(meshAtlas, v1_color_atlas_lightmap_tex, false);

        const meshWood = this.v1_colorModel.getObjectByName('PhidiasWorkshop_ModelFixesoak_mesh') as Mesh;
        this.assignLightmap(meshWood, v1_color_wood_lightmap_tex, false);
    }

    async load_v1_GreyscaleModel(): Promise<void> {
        const gltf = await gltfSmartLoad({
            gltfUrl: v1_greyscale_workshop_gltf,
            binUrl: v1_greyscale_workshop_bin,
            textureUrls: [
                { filename: 'LimeStoneCoquille_color.jpg', redirectUrl: v1_greyscale_limestone_diffuse_tex },
                { filename: 'LimeStoneCoquille_normal.jpg', redirectUrl: v1_greyscale_limestone_normal_tex },
                { filename: 'PhidiasWorkshop_Atlas_c.jpg', redirectUrl: v1_greyscale_atlas_diffuse_tex },
                { filename: 'PhidiasWorkshop_Atlas_nml.jpg', redirectUrl: v1_greyscale_atlas_normal_tex },
                { filename: 'PillarGenericA_nml.jpg', redirectUrl: v1_greyscale_pillar_normal_tex },
                { filename: 'Stuc_normal.jpg', redirectUrl: v1_greyscale_stuc_normal_tex },
                { filename: 'WoodOak_color.png', redirectUrl: v1_greyscale_wood_diffuse_tex },
                { filename: 'WoodOak_normal.png', redirectUrl: v1_greyscale_wood_normal_tex },
            ]
        });

        this.setAllMaterialsFrontSided(gltf);

        this.v1_greyscaleModel = gltf.scene;
        this.v1_greyscaleModel.visible = false;
        this.v1_greyscaleModel.name = 'v1 Phidias Workshop Greyscale';
        this.scene.add(this.v1_greyscaleModel);

        precacheObject3DTextures(this.renderer, this.v1_greyscaleModel);

        // Assign lightmap textures.
        const meshStuc = this.v1_greyscaleModel.getObjectByName('PhidiasWorkshop_ModelFixesstruc_mesh') as Mesh;
        this.assignLightmap(meshStuc, v1_greyscale_stuc_lightmap_tex, false);
        // this.assignAoMap(meshStuc, greyscale_stuc_lightmap_tex);

        const meshPillars = this.v1_greyscaleModel.getObjectByName('PhidiasWorkshop_ModelFixespillars_mesh') as Mesh;
        this.assignLightmap(meshPillars, v1_greyscale_pillar_lightmap_tex, false);
        // this.assignAoMap(meshPillars, greyscale_pillar_lightmap_tex);

        const meshLimestone = this.v1_greyscaleModel.getObjectByName('PhidiasWorkshop_ModelFixesLimestone_Coquille_mesh') as Mesh;
        this.assignLightmap(meshLimestone, v1_greyscale_limestone_lightmap_tex, false);
        // this.assignAoMap(meshLimestone, greyscale_limestone_lightmap_tex);

        const meshAtlas = this.v1_greyscaleModel.getObjectByName('PhidiasWorkshop_ModelFixesLOD0_PhidiasAtlas_mesh') as Mesh;
        this.assignLightmap(meshAtlas, v1_greyscale_atlas_lightmap_tex, false);
        // this.assignAoMap(meshAtlas, greyscale_atlas_lightmap_tex);

        const meshWood = this.v1_greyscaleModel.getObjectByName('PhidiasWorkshop_ModelFixesoak_mesh') as Mesh;
        this.assignLightmap(meshWood, v1_greyscale_wood_lightmap_tex, false);
        // this.assignAoMap(meshWood, greyscale_wood_lightmap_tex);
    }

    async load_v2_ColorModel(): Promise<void> {
        const gltf = await gltfSmartLoad({
            gltfUrl: v2_color_workshop_gltf,
            binUrl: v2_color_workshop_bin,
            textureUrls: [
                { filename: 'LimeStoneCoquille_color.jpg', redirectUrl: v2_color_limestone_diffuse_tex },
                { filename: 'LimeStoneCoquille_normal.jpg', redirectUrl: v2_color_limestone_normal_tex },
                { filename: 'PhidiasWorkshop_Atlas_c.jpg', redirectUrl: v2_color_atlas_diffuse_tex },
                { filename: 'PhidiasWorkshop_Atlas_nml.jpg', redirectUrl: v2_color_atlas_normal_tex },
                { filename: 'PillarGenericA_nml.jpg', redirectUrl: v2_color_pillar_normal_tex },
                { filename: 'Stuc_normal.jpg', redirectUrl: v2_color_stuc_normal_tex },
                { filename: 'WoodOak_color.png', redirectUrl: v2_color_wood_diffuse_tex },
                { filename: 'WoodOak_normal.png', redirectUrl: v2_color_wood_normal_tex },
            ]
        });

        this.setAllMaterialsFrontSided(gltf);

        this.v2_colorModel = gltf.scene;
        this.v2_colorModel.visible = false;
        this.v2_colorModel.name = 'v2 Phidias Workshop Color';
        this.scene.add(this.v2_colorModel);

        precacheObject3DTextures(this.renderer, this.v2_colorModel);

        // Assign lightmap textures.
        const meshStuc = this.v2_colorModel.getObjectByName('PhidiasWorkshop_ModelFixesstruc_mesh') as Mesh;
        this.assignLightmap(meshStuc, v2_color_stuc_lightmap_tex);
        this.assignAoMap(meshStuc, v2_color_stuc_ao_tex);

        const meshPillars = this.v2_colorModel.getObjectByName('PhidiasWorkshop_ModelFixespillars_mesh') as Mesh;
        this.assignLightmap(meshPillars, v2_color_pillar_lightmap_tex);
        this.assignAoMap(meshPillars, v2_color_pillar_ao_tex);

        const meshLimestone = this.v2_colorModel.getObjectByName('PhidiasWorkshop_ModelFixesLimestone_Coquille_mesh') as Mesh;
        this.assignLightmap(meshLimestone, v2_color_limestone_lightmap_tex);
        this.assignAoMap(meshLimestone, v2_color_limestone_ao_tex);

        const meshAtlas = this.v2_colorModel.getObjectByName('PhidiasWorkshop_ModelFixesLOD0_PhidiasAtlas_mesh') as Mesh;
        this.assignLightmap(meshAtlas, v2_color_atlas_lightmap_tex, false);
        this.assignAoMap(meshAtlas, v2_color_atlas_ao_tex);

        const meshWood = this.v2_colorModel.getObjectByName('PhidiasWorkshop_ModelFixesoak_mesh') as Mesh;
        this.assignLightmap(meshWood, v2_color_wood_lightmap_tex);
        this.assignAoMap(meshWood, v2_color_wood_ao_tex);
    }

    async assignLightmap(mesh: Mesh, lightmapUrl: string, flipY?: boolean): Promise<void> {
        if (!Array.isArray(mesh.material)) {
            const lightmap = await new TextureLoader().loadAsync(lightmapUrl) as Texture;

            if (flipY !== undefined && flipY !== null) {
                lightmap.flipY = flipY;
                lightmap.needsUpdate = true;
            }

            const material = mesh.material as MeshStandardMaterial;
            material.lightMap = lightmap;
            material.needsUpdate = true;

            this.renderer.initTexture(lightmap);
        } else {
            console.error(`[assignLightmap] Can't handle mesh with multiple materials.`)
        }
    }

    async assignAoMap(mesh: Mesh, aoMapUrl: string, flipY?: boolean): Promise<void> {
        if (!Array.isArray(mesh.material)) {
            const aoMap = await new TextureLoader().loadAsync(aoMapUrl) as Texture;

            if (flipY !== undefined && flipY !== null) {
                aoMap.flipY = flipY;
                aoMap.needsUpdate = true;
            }

            const material = mesh.material as MeshStandardMaterial;
            material.aoMap = aoMap;
            material.needsUpdate = true;

            this.renderer.initTexture(aoMap);
        } else {
            console.error(`[assignAoMap] Can't handle mesh with multiple materials.`)
        }
    }

    setAllMaterialsFrontSided(gltf: GLTF): void {
        gltf.scene.traverse((obj3d) => {
            if (obj3d instanceof Mesh) {
                // TEMP FIX: Force all materials to front sided rendered.
                const materials = getMaterials(obj3d);
                if (materials) {
                    for (const material of materials) {
                        material.side = FrontSide;
                    }
                }
            }
        });
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
        // this.sunLightHelper.update();

        this.renderer.render(this.scene, this.camera);
    }
}