import Sandbox from "../Sandbox";

export default class TemplateVanillaSandbox extends Sandbox {
    loaded: boolean;

    async start(): Promise<void> {
        // Setup your sandbox stuff here.

        this.loaded = true;
    }
}