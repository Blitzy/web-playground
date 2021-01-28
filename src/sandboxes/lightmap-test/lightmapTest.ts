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

// Phidias Workshop Color
import color_workshop_gltf from './models/phidias-workshop-color/14-PhidiasWorkshop.gltf';
import color_workshop_bin from './models/phidias-workshop-color/14-PhidiasWorkshop.bin';
import color_limestone_lightmap_tex from './models/phidias-workshop-color/Limestone_Coquille_LightMap.png';
import color_limestone_diffuse_tex from './models/phidias-workshop-color/LimeStoneCoquille_color.jpg';
import color_limestone_normal_tex from './models/phidias-workshop-color/LimeStoneCoquille_normal.jpg';
import color_atlas_lightmap_tex from './models/phidias-workshop-color/LOD0_PhidiasAtlas_LightMap.png';
import color_atlas_diffuse_tex from './models/phidias-workshop-color/PhidiasWorkshop_Atlas_c.jpg';
import color_atlas_normal_tex from './models/phidias-workshop-color/PhidiasWorkshop_Atlas_nml.jpg';
import color_pillar_normal_tex from './models/phidias-workshop-color/PillarGenericA_nml.jpg';
import color_pillar_lightmap_tex from './models/phidias-workshop-color/Pillars_LightMap.png';
import color_stuc_lightmap_tex from './models/phidias-workshop-color/Struc_LightMap.png';
import color_stuc_normal_tex from './models/phidias-workshop-color/Stuc_normal.jpg';
import color_wood_lightmap_tex from './models/phidias-workshop-color/Oak_LightMap.png';
import color_wood_diffuse_tex from './models/phidias-workshop-color/WoodOak_color.png';
import color_wood_normal_tex from './models/phidias-workshop-color/WoodOak_normal.png';

// Phidias Workshop greyscale
import greyscale_workshop_gltf from './models/phidias-workshop-greyscale/14-PhidiasWorkshop.gltf';
import greyscale_workshop_bin from './models/phidias-workshop-greyscale/14-PhidiasWorkshop.bin';
import greyscale_limestone_lightmap_tex from './models/phidias-workshop-greyscale/Limestone_Coquille_LightMap.png';
import greyscale_limestone_diffuse_tex from './models/phidias-workshop-greyscale/LimeStoneCoquille_color.jpg';
import greyscale_limestone_normal_tex from './models/phidias-workshop-greyscale/LimeStoneCoquille_normal.jpg';
import greyscale_atlas_lightmap_tex from './models/phidias-workshop-greyscale/LOD0_PhidiasAtlas_LightMap.png';
import greyscale_atlas_diffuse_tex from './models/phidias-workshop-greyscale/PhidiasWorkshop_Atlas_c.jpg';
import greyscale_atlas_normal_tex from './models/phidias-workshop-greyscale/PhidiasWorkshop_Atlas_nml.jpg';
import greyscale_pillar_normal_tex from './models/phidias-workshop-greyscale/PillarGenericA_nml.jpg';
import greyscale_pillar_lightmap_tex from './models/phidias-workshop-greyscale/Pillars_LightMap.png';
import greyscale_stuc_lightmap_tex from './models/phidias-workshop-greyscale/Struc_LightMap.png';
import greyscale_stuc_normal_tex from './models/phidias-workshop-greyscale/Stuc_normal.jpg';
import greyscale_wood_lightmap_tex from './models/phidias-workshop-greyscale/Oak_LightMap.png';
import greyscale_wood_diffuse_tex from './models/phidias-workshop-greyscale/WoodOak_color.png';
import greyscale_wood_normal_tex from './models/phidias-workshop-greyscale/WoodOak_normal.png';
import { takeWhile } from "lodash";

const modes = [ 'color', 'greyscale' ] as const;

type Mode = typeof modes[number];

export class LightmapTest {

    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    orbitControls: OrbitControls;

    sunLight: DirectionalLight;
    sunLightHelper: DirectionalLightHelper;
    skyLight: HemisphereLight;

    loaded: boolean;
    colorModel: Object3D;
    greyscaleModel: Object3D;
    currentMode: Mode;

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
        this.camera.position.z = 40;
        this.camera.position.y = 20;
        this.camera.position.x = 40;
        this.scene.add(this.camera);
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

        // Add light to scene.
        this.sunLight = new DirectionalLight('#fff', 0.5);
        this.sunLight.name = 'Sun Light';
        this.sunLight.target.name = 'Sun Light Target';
        this.sunLightHelper = new DirectionalLightHelper(this.sunLight, 10, '#ff0');
        this.sunLight.position.set(0, 50, 0);
        this.sunLight.target.position.set(-45, 0, 35);
        this.scene.add(this.sunLight);
        this.scene.add(this.sunLight.target);
        this.scene.add(this.sunLightHelper);
        
        this.skyLight = new HemisphereLight('#bde4ff', '#737063', 1);
        this.skyLight.name = 'Sky Light';
        this.scene.add(this.skyLight);

        this.update = this.update.bind(this);
        this.renderer.setAnimationLoop(this.update);

        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
        this.resize();
        
        this.loadModels().then(() => {
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

            this.changeMode('color');
        });
    }

    async loadModels(): Promise<void> {
        await Promise.all([
            this.loadColorModel(),
            this.loadGreyscaleModel(),
        ]);

        this.loaded = true;
    }

    changeMode(mode: Mode): void {
        if (!this.loaded) {
            return;
        }

        this.colorModel.visible = mode === 'color';
        this.greyscaleModel.visible = mode === 'greyscale';

        if (mode === 'color') {
            this.skyLight.visible = false;
        } else if (mode === 'greyscale') {
            this.skyLight.visible = false;
        } else {
            console.error(`Mode ${mode} is not implemented.`);
        }

        this.currentMode = mode;
    }

    async loadColorModel(): Promise<void> {
        const gltf = await gltfSmartLoad({
            gltfUrl: color_workshop_gltf,
            binUrl: color_workshop_bin,
            textureUrls: [
                { filename: 'LimeStoneCoquille_color.jpg', redirectUrl: color_limestone_diffuse_tex },
                { filename: 'LimeStoneCoquille_normal.jpg', redirectUrl: color_limestone_normal_tex },
                { filename: 'PhidiasWorkshop_Atlas_c.jpg', redirectUrl: color_atlas_diffuse_tex },
                { filename: 'PhidiasWorkshop_Atlas_nml.jpg', redirectUrl: color_atlas_normal_tex },
                { filename: 'PillarGenericA_nml.jpg', redirectUrl: color_pillar_normal_tex },
                { filename: 'Stuc_normal.jpg', redirectUrl: color_stuc_normal_tex },
                { filename: 'WoodOak_color.png', redirectUrl: color_wood_diffuse_tex },
                { filename: 'WoodOak_normal.png', redirectUrl: color_wood_normal_tex },
            ]
        });

        this.colorModel = gltf.scene;
        this.colorModel.visible = false;
        this.colorModel.name = 'Phidias Workshop Color';
        this.scene.add(this.colorModel);

        // Assign lightmap textures.
        const meshStuc = this.colorModel.getObjectByName('PhidiasWorkshop_ModelFixesstruc_mesh') as Mesh;
        this.assignLightmap(meshStuc, color_stuc_lightmap_tex);

        const meshPillars = this.colorModel.getObjectByName('PhidiasWorkshop_ModelFixespillars_mesh') as Mesh;
        this.assignLightmap(meshPillars, color_pillar_lightmap_tex);

        const meshLimestone = this.colorModel.getObjectByName('PhidiasWorkshop_ModelFixesLimestone_Coquille_mesh') as Mesh;
        this.assignLightmap(meshLimestone, color_limestone_lightmap_tex);

        const meshAtlas = this.colorModel.getObjectByName('PhidiasWorkshop_ModelFixesLOD0_PhidiasAtlas_mesh') as Mesh;
        this.assignLightmap(meshAtlas, color_atlas_lightmap_tex);

        const meshWood = this.colorModel.getObjectByName('PhidiasWorkshop_ModelFixesoak_mesh') as Mesh;
        this.assignLightmap(meshWood, color_wood_lightmap_tex);
    }

    async loadGreyscaleModel(): Promise<void> {
        const gltf = await gltfSmartLoad({
            gltfUrl: greyscale_workshop_gltf,
            binUrl: greyscale_workshop_bin,
            textureUrls: [
                { filename: 'LimeStoneCoquille_color.jpg', redirectUrl: greyscale_limestone_diffuse_tex },
                { filename: 'LimeStoneCoquille_normal.jpg', redirectUrl: greyscale_limestone_normal_tex },
                { filename: 'PhidiasWorkshop_Atlas_c.jpg', redirectUrl: greyscale_atlas_diffuse_tex },
                { filename: 'PhidiasWorkshop_Atlas_nml.jpg', redirectUrl: greyscale_atlas_normal_tex },
                { filename: 'PillarGenericA_nml.jpg', redirectUrl: greyscale_pillar_normal_tex },
                { filename: 'Stuc_normal.jpg', redirectUrl: greyscale_stuc_normal_tex },
                { filename: 'WoodOak_color.png', redirectUrl: greyscale_wood_diffuse_tex },
                { filename: 'WoodOak_normal.png', redirectUrl: greyscale_wood_normal_tex },
            ]
        });

        this.greyscaleModel = gltf.scene;
        this.greyscaleModel.visible = false;
        this.greyscaleModel.name = 'Phidias Workshop Greyscale';
        this.scene.add(this.greyscaleModel);

        // Assign lightmap textures.
        const meshStuc = this.greyscaleModel.getObjectByName('PhidiasWorkshop_ModelFixesstruc_mesh') as Mesh;
        this.assignLightmap(meshStuc, greyscale_stuc_lightmap_tex);
        // this.assignAoMap(meshStuc, greyscale_stuc_lightmap_tex);

        const meshPillars = this.greyscaleModel.getObjectByName('PhidiasWorkshop_ModelFixespillars_mesh') as Mesh;
        this.assignLightmap(meshPillars, greyscale_pillar_lightmap_tex);
        // this.assignAoMap(meshPillars, greyscale_pillar_lightmap_tex);

        const meshLimestone = this.greyscaleModel.getObjectByName('PhidiasWorkshop_ModelFixesLimestone_Coquille_mesh') as Mesh;
        this.assignLightmap(meshLimestone, greyscale_limestone_lightmap_tex);
        // this.assignAoMap(meshLimestone, greyscale_limestone_lightmap_tex);

        const meshAtlas = this.greyscaleModel.getObjectByName('PhidiasWorkshop_ModelFixesLOD0_PhidiasAtlas_mesh') as Mesh;
        this.assignLightmap(meshAtlas, greyscale_atlas_lightmap_tex);
        // this.assignAoMap(meshAtlas, greyscale_atlas_lightmap_tex);

        const meshWood = this.greyscaleModel.getObjectByName('PhidiasWorkshop_ModelFixesoak_mesh') as Mesh;
        this.assignLightmap(meshWood, greyscale_wood_lightmap_tex);
        // this.assignAoMap(meshWood, greyscale_wood_lightmap_tex);
    }

    async assignLightmap(mesh: Mesh, lightmapUrl: string): Promise<void> {
        if (!Array.isArray(mesh.material)) {
            const lightmap = await new TextureLoader().loadAsync(lightmapUrl) as Texture;
            lightmap.flipY = false;
            lightmap.needsUpdate = true;

            const material = mesh.material as MeshStandardMaterial;
            material.lightMap = lightmap;
            material.needsUpdate = true;
        } else {
            console.error(`[assignLightmap] Can't handle mesh with multiple materials.`)
        }
    }

    async assignAoMap(mesh: Mesh, aoMapUrl: string): Promise<void> {
        if (!Array.isArray(mesh.material)) {
            const aoMap = await new TextureLoader().loadAsync(aoMapUrl) as Texture;
            aoMap.flipY = false;
            aoMap.needsUpdate = true;

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