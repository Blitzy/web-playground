export interface CubeConfig {
    position: { x: number, y: number, z: number };
    size: { x: number, y: number, z: number };
    color?: string;
}

export const cubeConfigs: CubeConfig[] = [{
    position: { x: -20, y: 0, z: -140 },
    size: { x: 60, y: 7, z: 100, },
}, {
    position: { x: 0, y: 0, z: -25 },
    size: { x: 30, y: 6, z: 20, },
}, {
    position: { x: -10, y: 0, z: -60 },
    size: { x: 30, y: 6, z: 30, },
}, {
    position: { x: 175, y: 0, z: 40 },
    size: { x: 100, y: 20, z: 40, },
}, {
    position: { x: 100, y: 0, z: -60 },
    size: { x: 20, y: 15, z: 20, },
}, {
    position: { x: 130, y: 0, z: -90 },
    size: { x: 40, y: 10, z: 15, },
}, {
    position: { x: 90, y: 0, z: -120 },
    size: { x: 35, y: 7, z: 35, },
}, {
    position: { x: 25, y: 0, z: 100 },
    size: { x: 100, y: 10, z: 100, },
}, {
    position: { x: 300, y: 0, z: 40 },
    size: { x: 20, y: 10, z: 150, },
}, {
    position: { x: 400, y: 0, z: 200 },
    size: { x: 20, y: 10, z: 150, },
}];