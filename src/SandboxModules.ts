import Sandbox from "./sandboxes/Sandbox";

type SandboxConstructor = { new(): Sandbox }

export const SandboxModules: Record<string, { (): Promise<any> }> = {
    'canvas-image-resize':                  () => { return import('./sandboxes/image-resize/CanvasImageResize') },
    'orbit-box':                            () => { return import('./sandboxes/orbit-box/OrbitBox') },
    'olympia-lightmap-test':                () => { return import('./sandboxes/olympia-lightmap-test/OlympiaLightmapTest') },
    'olympia-realtime-light-test':          () => { return import('./sandboxes/olympia-realtime-light-test/OlympiaRealtimeLightTest') },
}

export type SandboxId = keyof (typeof SandboxModules); 

function isSandboxConstructor(obj: any, assert?: boolean): obj is SandboxConstructor {
    if (obj === undefined || obj === null) {
        if (assert) console.error(`Object is not a sandbox constructor, it is undefined or null.`);
        return false;
    }

    return true;
}

export function isSandboxDefined(id: string): boolean {
    return !!SandboxModules[id];
}

export async function loadSandboxModule(id: string): Promise<SandboxConstructor> {
    const module = await SandboxModules[id]();
    const defualtExport = module.default;

    if (isSandboxConstructor(defualtExport, true)) {
        return defualtExport;
    } else {
         return null;
    }
}