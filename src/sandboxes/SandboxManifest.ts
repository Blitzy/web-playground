import Sandbox from "./Sandbox";
import { SandboxTags } from "./SandboxTags";

type SandboxConstructor = { new(): Sandbox };
type SandboxModuleType = typeof import('./Sandbox');
type SandboxImportFunction = { (): Promise<SandboxModuleType> };

export interface SandboxInfo {
    id: string;
    title: string;
    description: string;
    sourceRelativeUrl: string;
    tags?: string[];
    importFunction: SandboxImportFunction;
}

export const SandboxManifest: Record<string, SandboxInfo> = {
    'canvas-image-resize': {
        id: 'canvas-image-resize',
        title: 'Canvas Image Resize',
        description: 'Test out how canvas can be used to resize images within the browser.',
        sourceRelativeUrl: 'src/sandboxes/canvas-image-resize/CanvasImageResize.ts',
        importFunction: () => { return import('./canvas-image-resize/CanvasImageResize') }
    },
    'orbit-box': {
        id: 'orbit-box',
        title: 'Orbit Box',
        description: `Very basic Three.js scene with a box, a light, and orbital camera controls. Doesn't get much simpler than this.`,
        sourceRelativeUrl: 'src/sandboxes/orbit-box/orbitBox.ts',
        tags: [ ...SandboxTags.three ],
        importFunction: () => { return import('./orbit-box/orbitBox') }
    },
    'olympia-lightmap-test': {
        id: 'olympia-lightmap-test',
        title: 'Olympia Lightmap Test',
        description: 'Three.js scene with various versions of the same building model showing off lightmaps, env maps, ao maps, etc.',
        sourceRelativeUrl: 'src/sandboxes/olympia-lightmap-test/OlympiaLightmapTest.ts',
        tags: [ ...SandboxTags.three ],
        importFunction: () => { return import('./olympia-lightmap-test/OlympiaLightmapTest') }
    },
    'olympia-realtime-light-test': {
        id: 'olympia-realtime-light-test',
        title: 'Olympia Realtime Light Test',
        description: 'Three.js scene with terrain and buildings used to test realtime lighting.',
        sourceRelativeUrl: 'src/sandboxes/olympia-realtime-light-test/OlympiaRealtimeLightTest.ts',
        tags: [ ...SandboxTags.three, 'csm', 'cascade', 'shadow', 'terrain' ],
        importFunction: () => { return import('./olympia-realtime-light-test/OlympiaRealtimeLightTest') }
    },
    'mesh-performance': {
        id: 'mesh-performance',
        title: 'Mesh Performance',
        description: 'Three.js scene that is rendering 1,000 unique (non-instanced) meshes. Can play with what type of materials are used and how lighting impacts performance.',
        sourceRelativeUrl: 'src/sandboxes/mesh-performance/MeshPerformance.ts',
        tags: [ ...SandboxTags.three ],
        importFunction: () => { return import('./mesh-performance/MeshPerformance') }
    },
    'level-of-detail': {
        id: 'level-of-detail',
        title: 'Level of Detail',
        description: `Three.js scene that shows how to use Three's LOD object.`,
        sourceRelativeUrl: 'src/sandboxes/level-of-detail/LevelOfDetail.ts',
        tags: [ ...SandboxTags.three ],
        importFunction: () => { return import('./level-of-detail/LevelOfDetail') }
    }
}

export type SandboxId = keyof (typeof SandboxManifest); 

function isSandboxConstructor(id: string, obj: any, assert?: boolean): obj is SandboxConstructor {
    if (obj === undefined || obj === null) {
        if (assert) throw new Error(`${id} is not a sandbox constructor, it is undefined or null.`);
        return false;
    }

    if (obj.prototype.constructor.length > 0) {
        if (assert) throw new Error(`${id} must have a constructor that takes no arguments.`);
        return false;
    }

    return true;
}

export function isSandboxDefined(id: string): boolean {
    return !!SandboxManifest[id];
}

export async function loadSandboxModule(id: string): Promise<SandboxConstructor> {
    const info = SandboxManifest[id];
    const module = await info.importFunction();
    const defaultExport = module.default;

    if (defaultExport === undefined || defaultExport === null) {
        throw new Error(`Sandbox module ${id} does not have a default export`);
    }

    if (isSandboxConstructor(id, defaultExport, true)) {
        return defaultExport;
    }
}