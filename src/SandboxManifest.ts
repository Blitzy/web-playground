import Sandbox from "./sandboxes/Sandbox";
import OrbitBox from "./sandboxes/orbit-box/OrbitBox";
import OlympiaLightmapTest from "./sandboxes/olympia-lightmap-test/OlympiaLightmapTest";
import OlympiaRealtimeLightTest from "./sandboxes/olympia-realtime-light-test/OlympiaRealtimeLightTest";

const SandboxManifest: Record<string, { new(): Sandbox }> = {
    'orbit-box': OrbitBox,
    'olympia-lightmap-test': OlympiaLightmapTest,
    'olympia-realtime-light-test': OlympiaRealtimeLightTest
}

export default SandboxManifest;