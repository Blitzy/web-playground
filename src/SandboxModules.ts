import Sandbox from "./sandboxes/Sandbox";

type SandboxConstructor = { new(): Sandbox }
type SandboxModuleType = typeof import('./sandboxes/Sandbox');

export const SandboxModules: Record<string, { (): Promise<SandboxModuleType> }> = {
    'canvas-image-resize':                  () => { return import('./sandboxes/canvas-image-resize/CanvasImageResize') },
    'orbit-box':                            () => { return import('./sandboxes/orbit-box/OrbitBox') },
    'olympia-lightmap-test':                () => { return import('./sandboxes/olympia-lightmap-test/OlympiaLightmapTest') },
    'olympia-realtime-light-test':          () => { return import('./sandboxes/olympia-realtime-light-test/OlympiaRealtimeLightTest') },
    'mesh-performance':                     () => { return import('./sandboxes/mesh-performance/MeshPerformance') },
    'level-of-detail':                      () => { return import('./sandboxes/level-of-detail/LevelOfDetail') },
}

export type SandboxId = keyof (typeof SandboxModules); 

function hasValue(obj: any) {
    return obj !== undefined && obj !== null;
}

function isSandboxConstructor(id: string, obj: any, assert?: boolean): obj is SandboxConstructor {
    if (!hasValue(obj)) {
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
    return !!SandboxModules[id];
}

export async function loadSandboxModule(id: string): Promise<SandboxConstructor> {
    const module = await SandboxModules[id]();
    const defaultExport = module.default;

    if (defaultExport === undefined || defaultExport === null) {
        throw new Error(`Sandbox module ${id} does not have a default export`);
    }

    if (isSandboxConstructor(id, defaultExport, true)) {
        return defaultExport;
    }
}