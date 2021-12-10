import { LoadingManager } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { getFilename, getExtension } from "./MiscUtils";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export interface GLTFConfig {
    gltfUrl: string;
    binUrl?: string;
    textureUrls?: GLTFTextureRedirect[];
}

export interface GLTFTextureRedirect {
    filename: string;
    redirectUrl: string;
}

var dracoLoader: DRACOLoader;

/**
 * GLTF loader function that can handle DRACO compression and texture url redirects.
 * @returns GLTF
 */
export function gltfSmartLoad(config: GLTFConfig): Promise<GLTF> {
    return new Promise<GLTF>((resolve: (value: GLTF) => void, reject) => {
        const loadingManager = new LoadingManager();

        loadingManager.setURLModifier((url): string => {
            if (url.startsWith('data:')) {
                // Do not redirect data uris.
                return url;
            }
            if (url.startsWith('blob:')) {
                // Do not redirect blobs.
                return url;
            }

            // Redirect gltf relative url to CDN asset location.
            const filename = getFilename(url);
            const ext = getExtension(url);

            if (filename === 'draco_wasm_wrapper.js' || filename === 'draco_decoder.wasm' || filename === 'draco_decoder.js') {
                // Do not redirect draco specific files.
                return url;
            }
            
            if (ext === 'gltf' || ext === 'glb') {
                return config.gltfUrl;
            } else if (ext === 'bin') {
                if (config.binUrl) {
                    return config.binUrl;
                }
            } else {
                // Assume that url is for texture image.
                if (config.textureUrls) {
                    const textureRedirect = config.textureUrls.find((tr) => filename === tr.filename);
                    if (textureRedirect) {
                        return textureRedirect.redirectUrl;
                    }
                }
            }
            
            return url;
        });

        const gltfLoader = new GLTFLoader(loadingManager);

        if (!dracoLoader) {
            dracoLoader = new DRACOLoader(loadingManager);
            dracoLoader.setDecoderPath('draco/');
            dracoLoader.setDecoderConfig({ type: 'js' });
        }
        gltfLoader.setDRACOLoader(dracoLoader);

        gltfLoader.load(
            config.gltfUrl,
            (gltf) => {
                resolve(gltf);
            },
            undefined,
            (errorEvent) => {
                console.error(`[GLTFSmartLoad] Error: ${errorEvent}`);
                reject(errorEvent);
            }
        );
    });
}