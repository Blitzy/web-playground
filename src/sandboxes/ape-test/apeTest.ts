import { APEngine } from "@yeti-cgi/ape";

export class APETest {
    constructor() {
        APEngine.init({
            antialias: true,
            powerPreference: 'high-performance',
        });
    }
}