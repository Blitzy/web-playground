import { DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneBufferGeometry, RepeatWrapping, ShaderMaterial, sRGBEncoding, Texture, TextureLoader, UniformsLib, UniformsUtils } from "three"

// export const TerrainMapLow = {
//     heightMap: `${baseUrl}/Terrain-LowDetail/terrain_GC_export_flipy_2048.jpg`,
//     heightScale: 117.0,
//     textureMaps: {
//       beachA: `${baseUrl}/Terrain-LowDetail/Beach_A.jpg`,
//       grassB: `${baseUrl}/Terrain-LowDetail/Grass_B.jpg`,
//       grassC: `${baseUrl}/Terrain-LowDetail/Grass_C.jpg`,
//       gravelA: `${baseUrl}/Terrain-LowDetail/Gravel_A.jpg`,
//       rockA: `${baseUrl}/Terrain-LowDetail/Rock_A.jpg`,
//       soilA: `${baseUrl}/Terrain-LowDetail/Soil_A.jpg`,
//       soilB: `${baseUrl}/Terrain-LowDetail/Soil_B.jpg`,
//     },
//     normalMaps: {
//       beachA: `${baseUrl}/Terrain-LowDetail/Beach_A_norm.jpg`,
//       grassB: `${baseUrl}/Terrain-LowDetail/Grass_B_norm.jpg`,
//       grassC: `${baseUrl}/Terrain-LowDetail/Grass_C_norm.jpg`,
//       gravelA: `${baseUrl}/Terrain-LowDetail/Gravel_A_normal.jpg`,
//       rockA: `${baseUrl}/Terrain-LowDetail/Rock_A_norm.jpg`,
//       soilA: `${baseUrl}/Terrain-LowDetail/Soil_A_norm.jpg`,
//       soilB: `${baseUrl}/Terrain-LowDetail/Soil_B_norm.jpg`,
//     },
//     splatterMaps: {
//       map1: `${baseUrl}/Terrain-Splattermap/TerrainSplattermap1.png`,
//       map2: `${baseUrl}/Terrain-Splattermap/TerrainSplattermap2.png`,
//     },
//   }

// Splatter maps.
import splatter_map_1 from './textures/TerrainSplattermap1.png';
import splatter_map_2 from './textures/TerrainSplattermap2.png';

// Height map.
import height_map from './textures/olympia_terrain_heightmap.jpg';

// Terrain textures.
import beachA_tex from './textures/Beach_A.jpg';
import beachA_norm from './textures/Beach_A_norm.jpg';
import grassB_tex from './textures/Grass_B.jpg';
import grassC_tex from './textures/Grass_C.jpg';
import grassD_tex from './textures/Grass_D.jpg';
import gravelA_tex from './textures/Gravel_A.jpg';
import rockA_tex from './textures/Rock_A.jpg';
import rockA_norm from './textures/Rock_A_norm.jpg';
import soilA_tex from './textures/Soil_A.jpg';
import soilA_norm from './textures/Soil_A_norm.jpg';
import soilB_tex from './textures/Soil_B.jpg';
import soilB_norm from './textures/Soil_B_norm.jpg';


const vertexShader = `
uniform sampler2D bumpTexture;
uniform float bumpScale;

varying vec2 vUV;

void main()
{
    vUV = uv;

    vec4 bumpData = texture2D(bumpTexture, uv);
    float vAmount = bumpData.r;

    // move the position along the normal
    vec3 newPosition = position + normal * bumpScale * vAmount;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`

const fragmentShader = `
uniform sampler2D beachATexture;
uniform sampler2D grassBTexture;
uniform sampler2D grassCTexture1;
uniform sampler2D grassCTexture2;
uniform sampler2D gravelATexture;
uniform sampler2D rockATexture;
uniform sampler2D soilATexture;
uniform sampler2D soilBTexture;

uniform sampler2D splatterMap1;
uniform sampler2D splatterMap2;

varying vec2 vUV;

void main()
{
    vec4 splat1 = texture2D(splatterMap1, vUV);
    vec4 splat2 = texture2D(splatterMap2, vUV);

    // the result of guesswork after decomposing the two splatmaps into RGBA
    // https://docs.gimp.org/en/plug-in-decompose-registered.html
    float gravelAAmount = splat2.a;
    float beachAAmount = splat1.b;
    float grassCAmount1 = splat1.g;
    float grassCAmount2 = splat1.a;
    float soilBAmount = splat2.g;
    float soilAAmount = splat1.r;
    float grassBAmount = splat2.r;
    float rockAAmount = splat2.b;

    float beachARepeat = 451.0;
    float grassBRepeat = 331.0;
    float grassC1Repeat = 307.0;
    float grassC2Repeat = 50.0;
    float gravelARepeat = 97.0;
    float rockARepeat = 451.0;
    float soilARepeat = 311.0;
    float soilBRepeat = 667.0;

    vec4 beachA = beachAAmount * texture2D(beachATexture, vUV * beachARepeat);
    vec4 grassB = grassBAmount * texture2D(grassBTexture, vUV * grassBRepeat);
    vec4 grassC1 = grassCAmount1 * texture2D(grassCTexture1, vUV * grassC1Repeat);
    vec4 grassC2 = grassCAmount2 * texture2D(grassCTexture2, vUV * grassC2Repeat);
    vec4 gravelA = gravelAAmount * texture2D(gravelATexture, vUV * gravelARepeat);
    vec4 rockA = rockAAmount * texture2D(rockATexture, vUV * rockARepeat);
    vec4 soilA = soilAAmount * texture2D(soilATexture, vUV * soilARepeat);
    vec4 soilB = soilBAmount * texture2D(soilBTexture, vUV * soilBRepeat);

    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) + beachA + grassB + grassC1 + grassC2 + gravelA + rockA + soilA + soilB;
}
`

async function loadTexture(url: string, postProcess?: (texture: Texture) => void): Promise<Texture> {
    return new Promise<Texture>((resolve, reject) => {
        const loader = new TextureLoader();
        loader.load(
            url,
            (texture) => {
                // On Load.
                if (postProcess) {
                    postProcess(texture);
                }

                resolve(texture);
            },
            (event) => {
                // On progress.
            },
            (event) => {
                // On error.
                reject(event);
            }
        );
    });   
}

export async function createOlympiaTerrain(): Promise<Group> {
    const terrainGroup = new Group();
    terrainGroup.name = 'Terrain';

    const heightScale = 117.0;

    const heightTexture = await loadTexture(height_map, (texture) => {
        texture.encoding = sRGBEncoding;
        texture.anisotropy = 16;
    });

    // const postProcessTexture = (texture: Texture) => {
    //     texture.wrapS = RepeatWrapping;
    //     texture.wrapT = RepeatWrapping;
    //     texture.encoding = sRGBEncoding;
    //     texture.anisotropy = 16;
    // }

    // const beachATexture = await loadTexture(beachA_tex, postProcessTexture);
    // const grassBTexture = await loadTexture(grassB_tex, postProcessTexture);
    // const grassCTexture1 = await loadTexture(grassC_tex, postProcessTexture);
    // const grassCTexture2 = await loadTexture(grassC_tex, postProcessTexture);
    // const gravelATexture = await loadTexture(gravelA_tex, postProcessTexture);
    // const rockATexture = await loadTexture(rockA_tex, postProcessTexture);
    // const soilATexture = await loadTexture(soilA_tex, postProcessTexture);
    // const soilBTexture = await loadTexture(soilB_tex, postProcessTexture);

    // const splatterMap1 = await loadTexture(splatter_map_1);
    // const splatterMap2 = await loadTexture(splatter_map_2);

    const planeGeo = new PlaneBufferGeometry(2048, 2048, 256, 256);
    const planeMat = new MeshStandardMaterial({
        map: heightTexture,
        displacementMap: heightTexture,
        displacementScale: heightScale,
        envMapIntensity: 1,
        color: '#fff',
        roughness: 1,
    });
    /*
    const planeMat = new ShaderMaterial({
        uniforms: {
            ...lightUniforms,
            bumpTexture: { value: heightTexture },
            bumpScale: { value: heightScale },
            beachATexture: { value: beachATexture },
            grassBTexture: { value: grassBTexture },
            grassCTexture1: { value: grassCTexture1 },
            grassCTexture2: { value: grassCTexture2 },
            gravelATexture: { value: gravelATexture },
            rockATexture: { value: rockATexture },
            soilATexture: { value: soilATexture },
            soilBTexture: { value: soilBTexture },
            splatterMap1: { value: splatterMap1 },
            splatterMap2: { value: splatterMap2 },
        },
        vertexShader,
        fragmentShader,
        side: DoubleSide,
        lights: true
    });
    */

    const planeMesh = new Mesh(planeGeo, planeMat);
    planeMesh.rotation.x = -Math.PI / 2;
    terrainGroup.add(planeMesh);

    return terrainGroup;
}