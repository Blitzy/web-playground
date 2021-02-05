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
    DirectionalLightHelper,
    Object3D,
} from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gltfSmartLoad } from "../../utils/GLTFSmartLoad";

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

const modes = [ 'v1 color', 'v1 greyscale', 'v2 color' ] as const;

type Mode = typeof modes[number];

export class LightmapTest {

    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    orbitControls: OrbitControls;

    sunLightEnabled: boolean = false;
    sunLight: DirectionalLight;
    sunLightHelper: DirectionalLightHelper;
    skyLightEnabled: boolean = false;
    skyLight: HemisphereLight;

    loaded: boolean;
    currentMode: Mode;

    v1_colorModel: Object3D;
    v1_greyscaleModel: Object3D;
    v2_colorModel: Object3D;

    constructor() {
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
        this.camera.position.y = 3;
        this.camera.position.x = 10;
        this.scene.add(this.camera);
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.target.y = 3;

        // Add light to scene.
        this.sunLight = new DirectionalLight('#fff', 0.5);
        this.sunLight.name = 'Sun Light';
        this.sunLight.target.name = 'Sun Light Target';
        this.sunLightHelper = new DirectionalLightHelper(this.sunLight, 10, '#ff0');
        this.sunLight.position.set(0, 50, 0);
        this.sunLight.target.position.set(-45, 0, 35);
        this.sunLight.visible = this.sunLightEnabled;
        this.scene.add(this.sunLight);
        this.scene.add(this.sunLight.target);
        this.scene.add(this.sunLightHelper);
        
        this.skyLight = new HemisphereLight('#bde4ff', '#737063', 1);
        this.skyLight.name = 'Sky Light';
        this.skyLight.visible = this.skyLightEnabled;
        this.scene.add(this.skyLight);

        this.update = this.update.bind(this);
        this.renderer.setAnimationLoop(this.update);

        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
        this.resize();
        
        Promise.all([
            this.load_v1_ColorModel(),
            this.load_v1_GreyscaleModel(),
            this.load_v2_ColorModel(),
        ]).then(() => {
            this.loaded = true;

            // Setup mode buttons.
            const buttonParent = document.createElement('div');
            buttonParent.id = 'button-group-lr';

            document.body.append(buttonParent);

            for (const mode of modes) {
                const button = document.createElement('button');
                button.id = mode;
                button.textContent = mode;
                buttonParent.append(button);
    
                button.addEventListener('click', (event) => {
                    this.changeMode(mode);
                });
            }

            this.toggleSunlight = this.toggleSunlight.bind(this);
            this.toggleSkylight = this.toggleSkylight.bind(this);

            // Create toggles for lights.
            const toggleConfigs = [
                {
                    id: 'sun-light',
                    label: 'Sun light',
                    defaultChecked: this.sunLightEnabled,
                    onChange: this.toggleSunlight
                }, {
                    id: 'sky-light',
                    label: 'Sky light',
                    defaultChecked: this.skyLightEnabled,
                    onChange: this.toggleSkylight
                }
            ];

            for (const toggleConfig of toggleConfigs) {
                const toggleDiv = document.createElement('div');
    
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = toggleConfig.id;
                checkbox.name = toggleConfig.id;
                checkbox.defaultChecked = toggleConfig.defaultChecked;
                checkbox.addEventListener('change', toggleConfig.onChange);
                toggleDiv.append(checkbox);
    
                const label = document.createElement('label');
                label.htmlFor = toggleConfig.id;
                label.textContent = toggleConfig.label;
                toggleDiv.append(label);
    
                buttonParent.append(toggleDiv);
            }


            this.changeMode('v2 color');
        });
    }

    toggleSunlight(): void {
        this.sunLightEnabled = !this.sunLightEnabled;
        this.sunLight.visible = this.sunLightEnabled;
    }

    toggleSkylight(): void {
        this.skyLightEnabled = !this.skyLightEnabled;
        this.skyLight.visible = this.skyLightEnabled;
    }

    changeMode(mode: Mode): void {
        if (!this.loaded) {
            return;
        }

        this.v1_colorModel.visible = mode === 'v1 color';
        this.v1_greyscaleModel.visible = mode === 'v1 greyscale';
        this.v2_colorModel.visible = mode === 'v2 color';

        this.currentMode = mode;
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

        this.v1_colorModel = gltf.scene;
        this.v1_colorModel.visible = false;
        this.v1_colorModel.name = 'v1 Phidias Workshop Color';
        this.scene.add(this.v1_colorModel);

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

        this.v1_greyscaleModel = gltf.scene;
        this.v1_greyscaleModel.visible = false;
        this.v1_greyscaleModel.name = 'v1 Phidias Workshop Greyscale';
        this.scene.add(this.v1_greyscaleModel);

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

        this.v2_colorModel = gltf.scene;
        this.v2_colorModel.visible = false;
        this.v2_colorModel.name = 'v2 Phidias Workshop Color';
        this.scene.add(this.v2_colorModel);

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
        } else {
            console.error(`[assignAoMap] Can't handle mesh with multiple materials.`)
        }
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
        this.sunLightHelper.update();

        this.renderer.render(this.scene, this.camera);
    }
}