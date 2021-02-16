import { DirectionalLight } from "three";

export class DirectionalLightGlue {
    light: DirectionalLight;

    constructor(light: DirectionalLight) {
        this.light = light;
    }
}