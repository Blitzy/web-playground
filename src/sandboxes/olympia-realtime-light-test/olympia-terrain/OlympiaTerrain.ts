import {
    FrontSide,
    Group,
    Mesh,
    PlaneBufferGeometry,
    RepeatWrapping,
    ShaderChunk,
    ShaderLib,
    ShaderMaterial,
    sRGBEncoding,
    TangentSpaceNormalMap,
    Texture,
    TextureLoader,
    UniformsUtils,
    Vector2,
} from "three"

import white_tex from './textures/white_16x16.png';

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

const splat_pars_fragment_glsl = `
uniform sampler2D beachATexture;
uniform sampler2D grassBTexture;
uniform sampler2D grassCTexture1;
uniform sampler2D grassCTexture2;
uniform sampler2D gravelATexture;
uniform sampler2D rockATexture;
uniform sampler2D soilATexture;
uniform sampler2D soilBTexture;

uniform float beachARepeat;
uniform float grassBRepeat;
uniform float grassC1Repeat;
uniform float grassC2Repeat;
uniform float gravelARepeat;
uniform float rockARepeat;
uniform float soilARepeat;
uniform float soilBRepeat;

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

ShaderChunk['splat_fragment_glsl'] = splat_fragment_glsl;
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

function extractHeightData(heightTexture: Texture, params: { width: number, height: number, heightScale: number }): number[] {

    const heightImage = heightTexture.image as HTMLImageElement;

    // Use canvas to resize image to given resolution.
    var canvas = document.createElement('canvas');
    canvas.width = params.width;
    canvas.height = params.height;
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(heightImage, 0, 0, params.width, params.height);

    const imageData = ctx.getImageData(0, 0, params.width, params.height).data;

    const data = new Array<number>(params.width * params.height);

    for (let i = 0, k = 0; i < data.length; i++, k += 4) {
        data[i] = imageData[k] * params.heightScale;
    }

    return data;
}

export async function createOlympiaTerrain(): Promise<Group> {
    const terrainGroup = new Group();
    terrainGroup.name = 'Terrain';

    const terrainParams = {
        width: 256,
        height: 256,
        heightScale: 0.465,
    }

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

    const planeGeo = new PlaneBufferGeometry(2048, 2048, terrainParams.width - 1, terrainParams.height - 1);
    (window as any).planeGeo = planeGeo;

    // Assign uv2 attribute with value of uv. Need these for aoMap/lightMap.
    planeGeo.attributes.uv2 = planeGeo.attributes.uv;

    // Plane deformation:
    // Draw the height texture image to 2d canvas context, and then
    // use the context to read pixel values for geometry deformation.
    const heightData = extractHeightData(heightTexture, terrainParams);

    // Get plane vertex position attribute and apply height deformation based
    // on height image pixel values.
    const planeGeoPosAttr = planeGeo.getAttribute('position');
    if (planeGeoPosAttr.count !== heightData.length) {
        console.error(`Height data length (${heightData.length}) does not match number of vertices (${planeGeoPosAttr.count})`);
    }
    
    for (let i = 0; i < planeGeoPosAttr.count; i++) {
        planeGeoPosAttr.setZ(i, heightData[i]);
    }

    // Create a new shader material that inherits from the mesh standard material.
    let vertexShader = ShaderLib.standard.vertexShader;
    let fragmentShader = ShaderLib.standard.fragmentShader;
    let uniforms = UniformsUtils.clone(ShaderLib.standard.uniforms);

    // Assing splatting textures to the material's uniforms.
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

    // Assign texture repeating values to material's uniforms.
    uniforms['beachARepeat'] = { value: 451.0 };
    uniforms['grassBRepeat'] = { value: 331.0 };
    uniforms['grassC1Repeat'] = { value: 307.0 };
    uniforms['grassC2Repeat'] = { value: 50.0 };
    uniforms['gravelARepeat'] = { value: 97.0 };
    uniforms['rockARepeat'] = { value: 451.0 };
    uniforms['soilARepeat'] = { value: 311.0 };
    uniforms['soilBRepeat'] = { value: 667.0 };

    // Insert the splat glsl uniform declartions.
    fragmentShader = splat_pars_fragment_glsl + '\n' + fragmentShader;

    // Insert the splat fragment right after the map fragment.
    fragmentShader = fragmentShader.replace(
        '#include <map_fragment>',
        '#include <splat_fragment_glsl>',
    );
    
    const planeMat = new ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        side: FrontSide,
        lights: true,
        name: 'TerrainMaterial',
    });
    
    (planeMat as any).isMeshStandardMaterial = true;
    
    // Assign these uniforms and properties after the material is created.
    // This gets around three's handling of ShaderMaterial differently from 
    // the MeshStandardMaterial when compiling it in WebGLProgram.

    // Assign map property so that shader defines for uvs get injected by WebGLProgram.
    // The texture is otherwise unused as it gets overwritten by the splatter.
    assignUniformAndProperty(planeMat, 'map', whiteTexture);
    
    assignUniformAndProperty(planeMat, 'envMapIntensity', 1);
    assignUniformAndProperty(planeMat, 'metalness', 0);
    assignUniformAndProperty(planeMat, 'roughness', 1);

    assignUniformAndProperty(planeMat, 'aoMap', heightTexture);
    assignUniformAndProperty(planeMat, 'aoMapIntensity', 1);

    const planeMesh = new Mesh(planeGeo, planeMat);
    planeMesh.rotation.x = -Math.PI / 2;
    terrainGroup.add(planeMesh);

    return terrainGroup;
}