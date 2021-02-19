import { 
    BufferAttribute,
    Color,
    DataTexture,
    DoubleSide,
    FrontSide,
    Group,
    LinearEncoding,
    Material,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PlaneBufferGeometry,
    RepeatWrapping,
    Shader,
    ShaderChunk,
    ShaderLib,
    ShaderMaterial,
    sRGBEncoding,
    Texture,
    TextureLoader,
    Uniform,
    UniformsLib,
    UniformsUtils,
    WebGLRenderer 
} from "three"

import white_tex from './textures/white_16x16.png';
import black_tex from './textures/black_16x16.png';
import grey_tex from './textures/grey_16x16.png';

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
import { replace } from "lodash";
import { stringInsertAt } from "../../../utils/MiscUtils";


const vertexShader = `
uniform sampler2D bumpTexture;
uniform float bumpScale;

varying vec2 vUv;

void main()
{
    vUv = uv;

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

varying vec2 vUv;

void main()
{
    vec4 splat1 = texture2D(splatterMap1, vUv);
    vec4 splat2 = texture2D(splatterMap2, vUv);

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

    vec4 beachA = beachAAmount * texture2D(beachATexture, vUv * beachARepeat);
    vec4 grassB = grassBAmount * texture2D(grassBTexture, vUv * grassBRepeat);
    vec4 grassC1 = grassCAmount1 * texture2D(grassCTexture1, vUv * grassC1Repeat);
    vec4 grassC2 = grassCAmount2 * texture2D(grassCTexture2, vUv * grassC2Repeat);
    vec4 gravelA = gravelAAmount * texture2D(gravelATexture, vUv * gravelARepeat);
    vec4 rockA = rockAAmount * texture2D(rockATexture, vUv * rockARepeat);
    vec4 soilA = soilAAmount * texture2D(soilATexture, vUv * soilARepeat);
    vec4 soilB = soilBAmount * texture2D(soilBTexture, vUv * soilBRepeat);

    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) + beachA + grassB + grassC1 + grassC2 + gravelA + rockA + soilA + soilB;
}
`

const splat_pars_fragment_glsl = `
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
`;

const splat_fragment_glsl = `

    vec4 splat1 = texture2D(splatterMap1, vUv);
    vec4 splat2 = texture2D(splatterMap2, vUv);

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

    vec4 beachA = beachAAmount * texture2D(beachATexture, vUv * beachARepeat);
    vec4 grassB = grassBAmount * texture2D(grassBTexture, vUv * grassBRepeat);
    vec4 grassC1 = grassCAmount1 * texture2D(grassCTexture1, vUv * grassC1Repeat);
    vec4 grassC2 = grassCAmount2 * texture2D(grassCTexture2, vUv * grassC2Repeat);
    vec4 gravelA = gravelAAmount * texture2D(gravelATexture, vUv * gravelARepeat);
    vec4 rockA = rockAAmount * texture2D(rockATexture, vUv * rockARepeat);
    vec4 soilA = soilAAmount * texture2D(soilATexture, vUv * soilARepeat);
    vec4 soilB = soilBAmount * texture2D(soilBTexture, vUv * soilBRepeat);

    // gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) + beachA + grassB + grassC1 + grassC2 + gravelA + rockA + soilA + soilB;
    diffuseColor = vec4(0.0, 0.0, 0.0, 1.0) + beachA + grassB + grassC1 + grassC2 + gravelA + rockA + soilA + soilB;
`;

const test_fragment_glsl = `
    diffuseColor *= vec4(1.0, 0.0, 0.0, 1.0);
`;

ShaderChunk['splat_fragment_glsl'] = splat_fragment_glsl;
// ShaderChunk['splat_fragment_glsl'] = test_fragment_glsl;
ShaderChunk['splat_pars_fragment_glsl'] = splat_pars_fragment_glsl;

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

/**    
 * Extending shaders in three really sucks.
 * The WebGLProgram define injection system appears to read 
 * from the material instead of from uniforms. Assigning uniform and property togethor
 * seems to be the only way to fix issses with the WebGLProgram injections.
 */
function assignUniformAndProperty(material: ShaderMaterial, uniformName: string, value: any): void {
    material.uniforms[uniformName].value = value;
    (material as any)[uniformName] = value;
}

export async function createOlympiaTerrain(): Promise<Group> {
    const terrainGroup = new Group();
    terrainGroup.name = 'Terrain';

    const heightScale = 117.0;

    const whiteTexture = await loadTexture(white_tex);

    const heightTexture = await loadTexture(height_map, (texture) => {
        texture.encoding = sRGBEncoding;
        texture.anisotropy = 16;
        texture.needsUpdate = true;
    });

    const postProcessTexture = (texture: Texture) => {
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.encoding = sRGBEncoding;
        texture.anisotropy = 8;
    }

    const beachATexture = await loadTexture(beachA_tex, postProcessTexture);
    const grassBTexture = await loadTexture(grassB_tex, postProcessTexture);
    const grassCTexture1 = await loadTexture(grassC_tex, postProcessTexture);
    const grassCTexture2 = await loadTexture(grassC_tex, postProcessTexture);
    const gravelATexture = await loadTexture(gravelA_tex, postProcessTexture);
    const rockATexture = await loadTexture(rockA_tex, postProcessTexture);
    const soilATexture = await loadTexture(soilA_tex, postProcessTexture);
    const soilBTexture = await loadTexture(soilB_tex, postProcessTexture);

    const splatterMap1 = await loadTexture(splatter_map_1);
    const splatterMap2 = await loadTexture(splatter_map_2);

    const planeGeo = new PlaneBufferGeometry(2048, 2048, 256, 256);

    // Assing uv2 attribute with value of uv. Need these for aoMap.
    planeGeo.attributes.uv2 = planeGeo.attributes.uv;

    // Create a new shader material that inherits from the mesh standard material.
    let vertexShader = ShaderLib.standard.vertexShader;
    let fragmentShader = ShaderLib.standard.fragmentShader;
    let uniforms = UniformsUtils.clone(ShaderLib.standard.uniforms);

    // Assing splatting textures to the material's uniforms.
    uniforms['bumpTexture'] = { value: heightTexture };
    uniforms['bumpScale'] = { value: heightScale };
    uniforms['beachATexture'] = { value: beachATexture };
    uniforms['grassBTexture'] = { value: grassBTexture };
    uniforms['grassCTexture1'] = { value: grassCTexture1 };
    uniforms['grassCTexture2'] = { value: grassCTexture2 };
    uniforms['gravelATexture'] = { value: gravelATexture };
    uniforms['rockATexture'] = { value: rockATexture };
    uniforms['soilATexture'] = { value: soilATexture };
    uniforms['soilBTexture'] = { value: soilBTexture };
    uniforms['splatterMap1'] = { value: splatterMap1 };
    uniforms['splatterMap2'] = { value: splatterMap2 };

    // Insert the splat glsl uniform declartions.
    fragmentShader = splat_pars_fragment_glsl + '\n' + fragmentShader;

    // Insert the splat fragment right after the map fragment.
    fragmentShader = fragmentShader.replace(
        '#include <map_fragment>',
        '#include <splat_fragment_glsl>',
    );
    // const mapFragInclude = '#include <map_fragment>';
    // const mapFragStart = fragmentShader.indexOf(mapFragInclude);
    // fragmentShader = stringInsertAt(fragmentShader, '\n#include <splat_fragment_glsl>', mapFragStart + mapFragInclude.length);

    // console.log(`terrain fragment shader before compile:`, fragmentShader);
    
    const planeMat = new ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        side: FrontSide,
        lights: true,
        name: 'TerrainMaterial',
    });

    (window as any).planeMat = planeMat;
    
    (planeMat as any).isMeshStandardMaterial = true;
    
    // Assign these uniforms and properties after the material is created.
    // This gets around three's handling of ShaderMaterial differently from 
    // the MeshStandardMaterial when compiling it in WebGLProgram.

    // Assign map property so that shader defines for uvs get injected by WebGLProgram.
    // The texture is otherwise unused as it gets overwritten by the splatter.
    assignUniformAndProperty(planeMat, 'map', whiteTexture);

    // Use standard shader's displacement functionality for terrain.
    assignUniformAndProperty(planeMat, 'displacementMap', heightTexture);
    assignUniformAndProperty(planeMat, 'displacementScale', heightScale);
    
    assignUniformAndProperty(planeMat, 'envMapIntensity', 1);
    assignUniformAndProperty(planeMat, 'metalness', 0);
    assignUniformAndProperty(planeMat, 'roughness', 1);

    assignUniformAndProperty(planeMat, 'aoMap', heightTexture);
    assignUniformAndProperty(planeMat, 'aoMapIntensity', 1);


    // const planeMat = new MeshStandardMaterial({
    //     displacementMap: heightTexture,
    //     displacementScale: heightScale,
    //     aoMapIntensity: 5,
    //     aoMap: heightTexture,
    //     envMapIntensity: 1,
    //     color: '#fff',
    //     roughness: 1,
    // });

    // planeMat.onBeforeCompile = (shader: Shader, renderer: WebGLRenderer) => {
    // };

    // const lightUniforms = UniformsUtils.merge([
    //     UniformsLib.lights
    // ]);

    // const planeMat = new ShaderMaterial({
    //     uniforms: {
    //         bumpTexture: { value: heightTexture },
    //         bumpScale: { value: heightScale },
    //         beachATexture: { value: beachATexture },
    //         grassBTexture: { value: grassBTexture },
    //         grassCTexture1: { value: grassCTexture1 },
    //         grassCTexture2: { value: grassCTexture2 },
    //         gravelATexture: { value: gravelATexture },
    //         rockATexture: { value: rockATexture },
    //         soilATexture: { value: soilATexture },
    //         soilBTexture: { value: soilBTexture },
    //         splatterMap1: { value: splatterMap1 },
    //         splatterMap2: { value: splatterMap2 },
    //     },
    //     vertexShader,
    //     fragmentShader,
    //     side: DoubleSide,
    // });

    const planeMesh = new Mesh(planeGeo, planeMat);
    planeMesh.rotation.x = -Math.PI / 2;
    terrainGroup.add(planeMesh);

    return terrainGroup;
}