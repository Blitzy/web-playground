import Sandbox from "./sandboxes/Sandbox";
import OrbitBox from "./sandboxes/orbit-box/OrbitBox";
import OlympiaLightmapTest from "./sandboxes/olympia-lightmap-test/OlympiaLightmapTest";
import OlympiaRealtimeLightTest from "./sandboxes/olympia-realtime-light-test/OlympiaRealtimeLightTest";
import CanvasImageResize from "./sandboxes/image-resize/CanvasImageResize";

const SandboxManifest: Record<string, { new(): Sandbox }> = {
    'canvas-image-resize': CanvasImageResize,
    'orbit-box': OrbitBox,
    'olympia-lightmap-test': OlympiaLightmapTest,
    'olympia-realtime-light-test': OlympiaRealtimeLightTest
}

export default SandboxManifest;