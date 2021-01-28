import { 
    WebGLRenderer,
    sRGBEncoding,
    Scene,
    Object3D,
    Color,
    PerspectiveCamera,
    DirectionalLight,
    HemisphereLight,
    Mesh,
    Material,
    MeshStandardMaterial,
    TextureLoader,
    Texture,
} from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gltfSmartLoad } from "../../utils/GLTFSmartLoad";

import workshop_gltf from './models/phidias-workshop/14-PhidiasWorkshop.gltf';
import workshop_bin from './models/phidias-workshop/14-PhidiasWorkshop.bin';
import limestone_lightmap_tex from './models/phidias-workshop/Limestone_Coquille_LightMap.png';
import limestone_color_tex from './models/phidias-workshop/LimeStoneCoquille_color.jpg';
import limestone_normal_tex from './models/phidias-workshop/LimeStoneCoquille_normal.jpg';
import atlas_lightmap_tex from './models/phidias-workshop/LOD0_PhidiasAtlas_LightMap.png';
import atlas_color_tex from './models/phidias-workshop/PhidiasWorkshop_Atlas_c.jpg';
import atlas_normal_tex from './models/phidias-workshop/PhidiasWorkshop_Atlas_nml.jpg';
import pillar_normal_tex from './models/phidias-workshop/PillarGenericA_nml.jpg';
import pillar_lightmap_tex from './models/phidias-workshop/Pillars_LightMap.png';
import stuc_lightmap_tex from './models/phidias-workshop/Struc_LightMap.png';
import stuc_normal_tex from './models/phidias-workshop/Stuc_normal.jpg';
import wood_lightmap_tex from './models/phidias-workshop/Oak_LightMap.png';
import wood_color_tex from './models/phidias-workshop/WoodOak_color.png';
import wood_normal_tex from './models/phidias-workshop/WoodOak_normal.png';
import { disposeObject3d } from "@yeti-cgi/ape";

export class LightmapTest {

    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    orbitControls: OrbitControls;

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
        this.camera.position.z = 20;
        this.camera.position.y = 20;
        this.camera.position.x = 20;
        this.scene.add(this.camera);
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);

        // Add light to scene.
        const sunLight = new DirectionalLight('#fff', 1);
        sunLight.position.set(-100, 200, -100);
        this.scene.add(sunLight);
        
        const skyLight = new HemisphereLight('#bde4ff', '#737063', 1);
        this.scene.add(skyLight);

        this.update = this.update.bind(this);
        this.renderer.setAnimationLoop(this.update);

        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
        this.resize();

        this.loadModel();
    }

    async loadModel(): Promise<void> {
        const workshopGltf = await gltfSmartLoad({
            gltfUrl: workshop_gltf,
            binUrl: workshop_bin,
            textureUrls: [
                { filename: 'LimeStoneCoquille_color.jpg', redirectUrl: limestone_color_tex },
                { filename: 'LimeStoneCoquille_normal.jpg', redirectUrl: limestone_normal_tex },
                { filename: 'PhidiasWorkshop_Atlas_c.jpg', redirectUrl: atlas_color_tex },
                { filename: 'PhidiasWorkshop_Atlas_nml.jpg', redirectUrl: atlas_normal_tex },
                { filename: 'PillarGenericA_nml.jpg', redirectUrl: pillar_normal_tex },
                { filename: 'Stuc_normal.jpg', redirectUrl: stuc_normal_tex },
                { filename: 'WoodOak_color.png', redirectUrl: wood_color_tex },
                { filename: 'WoodOak_normal.png', redirectUrl: wood_normal_tex },
            ]
        });

        console.log(workshopGltf);
        this.scene.add(workshopGltf.scene);

        // Assign lightmap textures.
        const meshStuc = workshopGltf.scene.getObjectByName('PhidiasWorkshop_ModelFixesstruc_mesh') as Mesh;
        this.assignLightmap(meshStuc, stuc_lightmap_tex);

        const meshPillars = workshopGltf.scene.getObjectByName('PhidiasWorkshop_ModelFixespillars_mesh') as Mesh;
        this.assignLightmap(meshPillars, pillar_lightmap_tex);

        const meshLimestone = workshopGltf.scene.getObjectByName('PhidiasWorkshop_ModelFixesLimestone_Coquille_mesh') as Mesh;
        this.assignLightmap(meshLimestone, limestone_lightmap_tex);

        const meshAtlas = workshopGltf.scene.getObjectByName('PhidiasWorkshop_ModelFixesLOD0_PhidiasAtlas_mesh') as Mesh;
        this.assignLightmap(meshAtlas, atlas_lightmap_tex);

        const meshWood = workshopGltf.scene.getObjectByName('PhidiasWorkshop_ModelFixesoak_mesh') as Mesh;
        this.assignLightmap(meshWood, wood_lightmap_tex);
    }

    async assignLightmap(mesh: Mesh, lightmapUrl: string): Promise<void> {
        if (!Array.isArray(mesh.material)) {
            const material = mesh.material as MeshStandardMaterial;

            const lightmap = await new TextureLoader().loadAsync(lightmapUrl) as Texture;
            material.lightMap = lightmap;
            material.needsUpdate = true;
        } else {
            console.error(`[assignLightmap] Can't handle mesh with multiple materials.`)
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

        this.renderer.render(this.scene, this.camera);
    }
}