import Sandbox from "./Sandbox";
import { SandboxTags } from "./SandboxTags";

type SandboxConstructor = { new(): Sandbox };
type SandboxModuleType = typeof import('./Sandbox');
type SandboxImportFunction = { (): Promise<SandboxModuleType> };

export interface SandboxInfo {
    id: SandboxId;
    title: string;
    description: string;
    sourceRelativeUrl: string;
    tags?: string[];
    importFunction: SandboxImportFunction;
}

export const SandboxIds = [
    'canvas-image-resize',
    'orbit-box',
    'olympia-lightmap-test',
    'olympia-realtime-light-test',
    'mesh-performance',
    'level-of-detail',
    'procedural-corner-gizmo',
] as const;

export type SandboxId = typeof SandboxIds[number];

export const SandboxManifest: Record<SandboxId, SandboxInfo> = {
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
    },
    'procedural-corner-gizmo': {
        id: 'procedural-corner-gizmo',
        title: 'Procedural Corner Gizmo',
        description: 'Babylon JS scene that create a procedural model to denote room corners. Useful for AR applications.',
        sourceRelativeUrl: 'src/sandboxes/procedural-corner-gizmo/ProceduralCornerGizmo.ts',
        tags: [ ...SandboxTags.babylon ],
        importFunction: () => { return import('./procedural-corner-gizmo/ProceduralCornerGizmo') }
    }
}

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

export function isSandboxId(id: string): id is SandboxId {
    return SandboxIds.some(i => i === id);
}

export async function loadSandboxModule(id: SandboxId): Promise<SandboxConstructor> {
    const info = SandboxManifest[id];
    const module = await info.importFunction();
    const defaultExport = module.default;

    if (defaultExport === undefined || defaultExport === null) {
        throw new Error(`Sandbox module ${id} does not have a default export`);
    }

    if (isSandboxConstructor(id, defaultExport, true)) {
        return defaultExport;
    } else {
        throw new Error(`Sandbox module ${id} does not have a default export that returns a new Sandbox.`);
    }
}