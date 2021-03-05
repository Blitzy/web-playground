import {
    AdditiveBlending,
    BufferGeometry,
    CanvasTexture,
    Clock,
    Color,
    FrontSide,
    Group,
    Mesh,
    MeshStandardMaterial,
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
    Vector3,
} from "three"

// Splatter maps.
import splat_map_0 from './textures/Terrain_splatmap0_3-5-2021.png';
import splat_map_1 from './textures/Terrain_splatmap1_3-5-2021.png';

// Height map.
import height_map from './textures/Terrain_heightmap_3-5-2021.png';

// Terrain normal map.
import terrain_normal from './textures/Terrain_normal.jpg';

// Terrain textures.
import beachA_tex from './textures/Beach_A.jpg';
import grassC_tex from './textures/Grass_C.jpg';
import gravelA_tex from './textures/Gravel_A.jpg';
import rockA_tex from './textures/Rock_A.jpg';
import soilA_tex from './textures/Soil_A.jpg';
import soilB_tex from './textures/Soil_B.jpg';
import { stringInsertAt } from "../../../utils/MiscUtils";

// Water model.
import water_gltf from '../models/water/water.gltf';
import water_emissive from './textures/water_emissive.jpg';
import { gltfSmartLoad } from "../../../utils/GLTFSmartLoad";


const splat_pars_fragment_glsl = `
// The Unity project that the terrain data is coming from is composed of two splat maps.
// Between those two splat maps there are a few textures that are reused, so instead of loading duplicates of a texture into memory, 
// we load them by texture type and then will map the type to a layer name when whe actually do the splatting.

// Unity Splat Map Table
// ---------------------------------------------
// Layer Name   |  Map Channel  | Texture
// ---------------------------------------------
// Soil         | splatMap0.r   | soilATexture
// Soil_Light   | splatMap0.g   | soilBTexture
// Wet_Sand     | splatMap0.b   | beachATexture
// Grass        | splatMap0.a   | grassCTexture
// Hipodrom     | splatMap1.r   | soilBTexture
// Ground       | splatMap1.g   | grassCTexture
// Rock_A       | splatMap1.b   | rockATexture
// Gravel_A     | splatMap1.a   | gravelATexture

uniform sampler2D splatMap0;
uniform sampler2D splatMap1;

uniform sampler2D beachATexture;
uniform sampler2D soilATexture;
uniform sampler2D soilBTexture;
uniform sampler2D grassCTexture;
uniform sampler2D gravelATexture;
uniform sampler2D rockATexture;

uniform float soilRepeat;
uniform float soilLightRepeat; 
uniform float wetSandRepeat;
uniform float grassRepeat;
uniform float hipodromRepeat;
uniform float groundRepeat;
uniform float rockARepeat;
uniform float gravelARepeat;

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
`;

const splat_fragment_glsl = `
    vec4 splat0 = texture2D(splatMap0, vUv);
    vec4 splat1 = texture2D(splatMap1, vUv);

    vec4 soil = splat0.r * texture2D(soilATexture, vUv * soilRepeat);
    vec4 soilLight = splat0.g * texture2D(soilBTexture, vUv * soilLightRepeat);
    vec4 wetSand = splat0.b * texture2D(beachATexture, vUv * wetSandRepeat);
    vec4 grass = splat0.a * texture2D(grassCTexture, vUv * grassRepeat);
    vec4 hipodrom = splat1.r * texture2D(soilBTexture, vUv * hipodromRepeat);
    vec4 ground = splat1.g * texture2D(grassCTexture, vUv * groundRepeat);
    vec4 rockA = splat1.b * texture2D(rockATexture, vUv * rockARepeat);
    vec4 gravelA = splat1.a * texture2D(gravelATexture, vUv * gravelARepeat);

    diffuseColor = vec4(0.0, 0.0, 0.0, 1.0) + soil + soilLight + wetSand + grass + hipodrom + ground + rockA + gravelA;
`;

ShaderChunk['splat_pars_fragment_glsl'] = splat_pars_fragment_glsl;
ShaderChunk['splat_fragment_glsl'] = splat_fragment_glsl;

const heightfog_pars_vertex_glsl = `
varying vec3 fragWorldPos;
`;

const heightfog_vertex_glsl = `
fragWorldPos = vec3(modelMatrix * vec4(position, 1.0));
`;

const heightfog_pars_fragment_glsl = `
uniform vec3 heightFogColor;
uniform float heightFogSmooth;
uniform float heightFogPos;

varying vec3 fragWorldPos;
`;

const heightfog_fragment_glsl = `
if (fragWorldPos.y <= heightFogPos) {
    float fogFullDensityPos = fragWorldPos.y - heightFogSmooth;
    float fragFogStep = smoothstep(heightFogPos, fogFullDensityPos, fragWorldPos.y);

    gl_FragColor.rgb = mix(gl_FragColor.rgb, heightFogColor, fragFogStep);
}
`;

ShaderChunk['heightfog_pars_vertex'] = heightfog_pars_vertex_glsl;
ShaderChunk['heightfog_vertex'] = heightfog_vertex_glsl;
ShaderChunk['heightfog_pars_fragment'] = heightfog_pars_fragment_glsl;
ShaderChunk['heightfog_fragment'] = heightfog_fragment_glsl;

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
    material.uniforms[uniformName] = { value };
    (material as any)[uniformName] = value;
}

function extractHeightData(heightTexture: Texture, params: { width: number, height: number, heightScale: number }): number[] {

    const heightImage = heightTexture.image as HTMLImageElement;

    // Use canvas to resize image to given resolution.
    let canvas = document.createElement('canvas');
    canvas.width = params.width;
    canvas.height = params.height;
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(heightImage, 0, 0, params.width, params.height);

    const imageData = ctx.getImageData(0, 0, params.width, params.height).data;

    const data = new Array<number>(params.width * params.height);

    for (let i = 0, k = 0; i < data.length; i++, k += 4) {
        data[i] = (imageData[k] / 255) * params.heightScale;
    }

    return data;
}

function generateSolidColorTexture(width: number, height: number, color: Color): Texture {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color.getHexString();
    ctx.fillRect(0, 0, width, height);

    const texture = new CanvasTexture(canvas);
    return texture;
}

export async function createOlympiaTerrain(): Promise<Group> {
    const terrainGroup = new Group();
    terrainGroup.name = 'Terrain';

    const terrainParams = {
        width: 256,
        height: 256,
        heightScale: 117,
    }

    const whiteTexture = generateSolidColorTexture(16, 16, new Color('#fff'));

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
    const grassCTexture = await loadTexture(grassC_tex, postProcessTexture);
    const gravelATexture = await loadTexture(gravelA_tex, postProcessTexture);
    const rockATexture = await loadTexture(rockA_tex, postProcessTexture);
    const soilATexture = await loadTexture(soilA_tex, postProcessTexture);
    const soilBTexture = await loadTexture(soilB_tex, postProcessTexture);

    const splatMap0Texture = await loadTexture(splat_map_0);
    const splatMap1Texture = await loadTexture(splat_map_1);

    const terrainNormalTexture = await loadTexture(terrain_normal);

    let planeGeo: BufferGeometry = new PlaneBufferGeometry(2048, 2048, terrainParams.width - 1, terrainParams.height - 1);
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

    planeGeo.computeVertexNormals();
    planeGeo.computeTangents();
    planeGeo.computeBoundingBox();
    planeGeo.computeBoundingSphere();

    // Create a new shader material that inherits from the mesh standard material.
    let vertexShader = ShaderLib.standard.vertexShader;
    let fragmentShader = ShaderLib.standard.fragmentShader;
    let uniforms = UniformsUtils.clone(ShaderLib.standard.uniforms);

    // Insert the splat glsl uniform declarations.
    fragmentShader = '#include <splat_pars_fragment_glsl>' + '\n' + fragmentShader;

    // Replace the map fragment with the splat fragment.
    fragmentShader = fragmentShader.replace(
        '#include <map_fragment>',
        '#include <splat_fragment_glsl>',
    );

    // Assign splatting textures to the material's uniforms.
    uniforms['beachATexture'] = { value: beachATexture };
    uniforms['soilATexture'] = { value: soilATexture };
    uniforms['soilBTexture'] = { value: soilBTexture };
    uniforms['grassCTexture'] = { value: grassCTexture };
    uniforms['gravelATexture'] = { value: gravelATexture };
    uniforms['rockATexture'] = { value: rockATexture };
    uniforms['splatMap0'] = { value: splatMap0Texture };
    uniforms['splatMap1'] = { value: splatMap1Texture };

    // Assign texture repeating values to material's uniforms.
    uniforms['soilRepeat'] = { value: 150.0 };
    uniforms['soilLightRepeat'] = { value: 150.0 };
    uniforms['wetSandRepeat'] = { value: 220.0 };
    uniforms['grassRepeat'] = { value: 150.0 };
    uniforms['hipodromRepeat'] = { value: 220.0 };
    uniforms['groundRepeat'] = { value: 220.0 };
    uniforms['rockARepeat'] = { value: 55.0 };
    uniforms['gravelARepeat'] = { value: 180.0 };

    // Insert the height fog uniform declarations.
    vertexShader = '#include <heightfog_pars_vertex>' + '\n' + vertexShader;
    fragmentShader = '#include <heightfog_pars_fragment>' + '\n' + fragmentShader;

    // Insert the height fog vertex after the fog vertex.
    const fogVertInclude = '#include <fog_vertex>';
    const fogVertStartIndex = vertexShader.indexOf(fogVertInclude);
    vertexShader = stringInsertAt(vertexShader, '\n    #include <heightfog_vertex>', fogVertStartIndex + fogVertInclude.length);

    // Insert the height fog fragment after the fog fragment.
    const fogFragInclude = '#include <fog_fragment>';
    const fogFragStartIndex = fragmentShader.indexOf(fogFragInclude);
    fragmentShader = stringInsertAt(fragmentShader, '\n    #include <heightfog_fragment>', fogFragStartIndex + fogFragInclude.length);

    // Assign height fog values to the material's uniforms.
    uniforms['heightFogColor'] = { value: new Color(0.5, 0.5, 0.5) };
    uniforms['heightFogSmooth'] = { value: 2 };
    uniforms['heightFogPos'] = { value: 30 };
    
    const terrainMaterial = new ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        extensions: {
            derivatives: true
        },
        side: FrontSide,
        lights: true,
        name: 'TerrainMaterial',
    });

    (window as any).terrainMaterial = terrainMaterial;
    
    // Assign these uniforms and properties after the material is created.
    // This gets around three's handling of ShaderMaterial differently from 
    // the MeshStandardMaterial when compiling it in WebGLProgram.

    // Assign map property so that shader defines for uvs get injected by WebGLProgram.
    // The texture is otherwise unused as it gets overwritten by the splatter.
    assignUniformAndProperty(terrainMaterial, 'map', whiteTexture);
    
    assignUniformAndProperty(terrainMaterial, 'envMapIntensity', 1);
    assignUniformAndProperty(terrainMaterial, 'metalness', 0);
    assignUniformAndProperty(terrainMaterial, 'roughness', 1);

    assignUniformAndProperty(terrainMaterial, 'normalMap', terrainNormalTexture);
    assignUniformAndProperty(terrainMaterial, 'normalScale', new Vector2(2, 2));
    assignUniformAndProperty(terrainMaterial, 'normalMapType', TangentSpaceNormalMap);

    const planeMesh = new Mesh(planeGeo, terrainMaterial);
    planeMesh.name = 'land';
    planeMesh.rotation.x = -Math.PI / 2;
    terrainGroup.add(planeMesh);

    // Load water mesh.
    const waterGltf = await gltfSmartLoad({ gltfUrl: water_gltf });
    const waterMesh = waterGltf.scene.getObjectByName('default') as Mesh;
    waterMesh.name = 'water';
    waterMesh.position.set(0, -41.5, 0);

    // Modify the water material to give it more water-like appearence that plays well with the terrain shader's height fog.
    const waterMaterial = waterMesh.material as MeshStandardMaterial;

    (window as any).waterMaterial = waterMaterial;

    waterMaterial.opacity = 1;
    waterMaterial.color.setScalar(0);
    waterMaterial.blending = AdditiveBlending;
    
    waterMaterial.emissiveMap = await loadTexture(water_emissive, (t) => {});
    waterMaterial.emissiveMap.wrapS = RepeatWrapping;
    waterMaterial.emissiveMap.wrapT = RepeatWrapping;
    waterMaterial.emissive.setRGB(0.3, 0.7, 1);
    waterMaterial.emissiveIntensity = 0.05;

    const clock = new Clock(true);
    const flowSpeed = new Vector2(0.07, 0.03);
    
    waterMaterial.normalMap.wrapS = RepeatWrapping;
    waterMaterial.normalMap.wrapT = RepeatWrapping;
    waterMaterial.normalMap.repeat = new Vector2().setScalar(32);
    waterMaterial.normalMap.needsUpdate = true;
    
    waterMesh.onBeforeRender = () => {
        const timeDelta = clock.getDelta();

        waterMaterial.normalMap.offset.x += flowSpeed.x * timeDelta;
        waterMaterial.normalMap.offset.y += flowSpeed.y * timeDelta;
    }
    
    terrainGroup.add(waterMesh);

    return terrainGroup;
}