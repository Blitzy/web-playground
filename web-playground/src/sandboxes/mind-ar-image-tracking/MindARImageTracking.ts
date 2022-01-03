import Sandbox from "../Sandbox";

export default class MindARImageTracking extends Sandbox {
    loaded: boolean;

    async start(): Promise<void> {
        // Setup your sandbox stuff here.

        this.loaded = true;
    }
}