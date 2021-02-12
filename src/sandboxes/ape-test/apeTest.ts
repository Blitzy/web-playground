import { APEngine } from "@yeti-cgi/ape";
import Sandbox from "../Sandbox";

export default class APETest extends Sandbox {
    async start(): Promise<void> {

        APEngine.init({
            antialias: true,
            powerPreference: 'high-performance',
        });
    }
}