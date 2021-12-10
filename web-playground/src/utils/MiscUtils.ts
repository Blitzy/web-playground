import { Material, Mesh, Object3D, Texture, WebGLRenderer } from "three";


export function hasValue(obj: any): boolean {
    return obj !== undefined && obj !== null;
}

export function getOptionalValue<T>(obj: T, defaultValue: T): T {
    return obj !== undefined && obj !== null ? obj : defaultValue;
}

export async function getJson<T>(url: string): Promise<T> {
    const response = await fetch(url, { method: 'GET'})

    if (response.ok) {
        const json = await response.json() as T;
        return json;
    } else {
        throw new Error(`Could not get JSON from ${url}.\ncode: ${response.status}, msg: ${response.statusText}`);
    }
}

/**
 * Post the given data object as JSON to the provided URL.
 * @returns - Promise that resolves to a Response or null if an exception occured.
 */
export async function postJsonData(url: string, data: any): Promise<Response> {
    console.log(`[postJsonData] start...`);

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    const init: RequestInit = {
        method: 'POST',
        body: JSON.stringify(data),
        mode: 'cors',
        headers: headers,

    }

    const request = new Request(url, init);
    console.log(request);

    try {
        // Until aux is CORS enabled, the response will always be opaque and thus checking the response for anything is pointless.
        const response = await fetch(request);
        console.log(`[postJsonData] response received.`);
        return response;
    } catch (error) {
        console.error(`[postJsonData] Could not fetch. error: ${error}`);
        return null;
    }
}

/**
 * Search through element's descendents and return the first child element that contains the given class name(s). 
 * An element must contain all of the given class names in order to be matched.
 * @param element The element to search the descendents of.
 * @param className The class name(s) to search for. Can be either a single class name or many.
 */
export function getElementByClassName(element: Element, names: string): HTMLElement {
    if (element instanceof HTMLElement) {
        // Check element for class names.
        const elementClassList: DOMTokenList = element.classList;

        if (elementClassList.length > 0) {
            const classNames: string[] = names.split(' ');
            let classFoundCount: number = 0;

            for (const className of classNames) {
                if (elementClassList.contains(className)) {
                    classFoundCount++;

                    if (classFoundCount === classNames.length) {
                        return element;
                    }
                }
            }
        }
    }

    // Check descendents of element.
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
        const match = getElementByClassName(children[i], names);
        if (match !== null) {
            return match;
        }
    }

    // No matching element.
    return null;
}

export function getFilename(path: string): string | null {
    const lastSlashIndex = path.lastIndexOf('/');

    let filename: string | null = null;
    if (lastSlashIndex < 0) {
        filename = path;
    } else {
        filename = path.substr(lastSlashIndex + 1);
    }

    // Make sure that it is a file by check for an extension.
    const ext = getExtension(filename);

    if (ext !== null) {
        return filename;
    } else {
        return null;
    }
}

export function getExtension(path: string): string | null {
    if (path.includes('.')) {
        const ext = path.split('.').pop();

        if (ext) {
            if (!ext.includes('/')) {
                return ext;
            }
        }
    }

    return null;
}

/**
 * Load the image from the given url (or from the cache if the browser as it stored).
 * @param url Location of the image to load.
 */
export async function loadImage(url: string, onProgress?: (event: ProgressEvent<EventTarget>) => void): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>(((resolve: (value: HTMLImageElement) => void, reject) => {
        const img: HTMLImageElement = new Image();

        img.addEventListener('load', (event) => {
            resolve(img);
        });
        
        img.addEventListener('progress', (event) => {
            if (onProgress) {
                onProgress(event);
            }
        })

        img.addEventListener('error', (event) => {
            reject(event);
        });
        
        img.src = url;
    }));
}

export function copyToClipboard(text: string): void {
    // Create text area element to contain text content.
    const textArea = document.createElement('textarea');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.textContent = text;
    document.body.appendChild(textArea);

    // Select text area element and execute document's copy command.
    textArea.select();
    document.execCommand('copy');

    // Remove text area element from document.
    textArea.remove();
}

export function appendLine(text: string, line: string): string {
    if (!text || text.length === 0) {
        return line;
    } else if (text.length > 0) {
        text += `\n${line}`;
    }

    return text;
}

export function sortAZ<T, K extends keyof T>(array: T[], propertyKey: K): void {
    array.sort((a, b) => {
        return a[propertyKey] > b[propertyKey] ? 1 : -1
    });
}

export function sortZA<T, K extends keyof T>(array: T[], propertyKey: K): void {
    array.sort((a, b) => {
        return a[propertyKey] < b[propertyKey] ? 1 : -1
    });
}

export function stringInsertAt(str: string, sub: string, pos: number): string {
    return `${str.slice(0, pos)}${sub}${str.slice(pos)}`;
}

export function getMaterials(mesh: Mesh): Material[] {
    if (Array.isArray(mesh.material)) {
        return mesh.material;
    } else {
        return [mesh.material];
    }
}

const TextureMapNames: string[] = [
    'map', 'aoMap', 'alphaMap', 'lightMap', 'envMap', 'specularMap', 'bumpMap', 'displacementMap', 'emissiveMap', 'metalnessMap', 'normalMap', 'roughnessMap'
];

/**
 * Preload all textures in present underneath the given Object3D.
 * This will help prevent a GPU decode lag spike for objects with large textures when it becomes visible for the first time.
 */
export function precacheObject3DTextures(renderer: WebGLRenderer, object3d: Object3D): void {
    object3d.traverse((obj3d) => {
        if (obj3d instanceof Mesh) {
            // Get materials on mesh.
            let materials: Material[] = [];
            if (Array.isArray(obj3d.material)) {
                materials = obj3d.material;
            } else {
                materials = [obj3d.material];
            }

            const textures = new Set<Texture>();

            for (const material of materials) {
                for (const mapName of TextureMapNames) {
                    const m = material as any;

                    if (m[mapName] && m[mapName] instanceof Texture) {
                        textures.add(m[mapName]);
                    }
                }
            }

            for (const texture of textures) {
                if (texture) {
                    renderer.initTexture(texture);
                }
            }
        }
    });
}

export function convertMaterials<T extends Material>(object3d: Object3D, materialType: { new(): T }): void {
    object3d.traverse((obj3d) => {
        if (obj3d instanceof Mesh) {
        if (Array.isArray(obj3d.material)) {
            console.error(`dont know how to convert materials of meshes that have more than one.`);
            return;
        }

        const origMaterial = obj3d.material;
        const newMaterial = new materialType();
        newMaterial.copy(origMaterial);

        obj3d.material = newMaterial;
        }
    });
}

export function disposeObject3d<T extends Object3D>(obj: T) {
    if (obj) {
        obj.traverse((o) => {
            if (o instanceof Mesh) {
                if (o.geometry) {
                    o.geometry.dispose();
                }
                
                if (Array.isArray(o.material)) {
                    o.material.forEach((m) => disposeMaterial(m));
                } else {
                    disposeMaterial(o.material);
                }
            }
        });
    
        if (obj.parent) {
            obj.parent.remove(obj);
        }
    }
}

export function disposeMaterial(material: Material) {
    for (const value of Object.values(material)) {
        if (value instanceof Texture) {
            value.dispose();
        }
    }

    material.dispose();
}