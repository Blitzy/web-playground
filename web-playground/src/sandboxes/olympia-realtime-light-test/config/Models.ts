import { GLTFConfig } from "../../../utils/GLTFSmartLoad";

// Original Phidias Workshop
import orig_workshop_gltf from '../../common/models/orig-phidias-workshop/14-PhidiasWorkshop.gltf';
import orig_workshop_bin from '../../common/models/orig-phidias-workshop/14-PhidiasWorkshop.bin';
import orig_limestone_diffuse_tex from '../../common/models/orig-phidias-workshop/LimeStoneCoquille_color.jpg';
import orig_limestone_normal_tex from '../../common/models/orig-phidias-workshop/LimeStoneCoquille_normal.jpg';
import orig_atlas_diffuse_tex from '../../common/models/orig-phidias-workshop/PhidiasWorkshop_Atlas_c.jpg';
import orig_atlas_normal_tex from '../../common/models/orig-phidias-workshop/PhidiasWorkshop_Atlas_nml.jpg';
import orig_pillar_normal_tex from '../../common/models/orig-phidias-workshop/PillarGenericA_nml.jpg';
import orig_stuc_normal_tex from '../../common/models/orig-phidias-workshop/Stuc_normal.jpg';
import orig_wood_diffuse_tex from '../../common/models/orig-phidias-workshop/WoodOak_color.png';
import orig_wood_normal_tex from '../../common/models/orig-phidias-workshop/WoodOak_normal.png';
import { MathUtils } from "three";

export interface ModelConfig {
    name: string;
    gltf: GLTFConfig;
    receiveShadow?: boolean;
    castShadow?: boolean;
    position: { x: number, y: number, z: number };
    rotation: { x: number, y: number, z: number };
    scale?: { x: number, y: number, z: number };
}

const workshopGltfConfig: GLTFConfig = {
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
}
export const modelConfigs: ModelConfig[] = [
    {
        name: 'Phidias Workshop',
        gltf: workshopGltfConfig,
        position: { x: 0, y: 0, z: 0},
        rotation: { x: 0, y: 0, z: 0},
    }
];


// Randomly place instances of workshop building to test high poly count performance.
const count = 0;
const posRange = {
    x: { min: 50, max: 250 },
    y: { min: 0, max: 0 },
    z: { min: -100, max: 200 },
}
const rotRange = {
    x: { min: 0, max: 0 },
    y: { min: 0, max: Math.PI * 2 },
    z: { min: 0, max: 0 },
}


for (let i = 0; i < count; i++) {
    const position = {
        x: MathUtils.randFloat(posRange.x.min, posRange.x.max),
        y: MathUtils.randFloat(posRange.y.min, posRange.y.max),
        z: MathUtils.randFloat(posRange.z.min, posRange.z.max)
    };

    const rotation = {
        x: MathUtils.randFloat(rotRange.x.min, rotRange.x.max),
        y: MathUtils.randFloat(rotRange.y.min, rotRange.y.max),
        z: MathUtils.randFloat(rotRange.z.min, rotRange.z.max)
    };
    

    modelConfigs.push({
        name: `Phidias Workshop PerfClone ${i}`,
        gltf: workshopGltfConfig,
        position,
        rotation
    });
}