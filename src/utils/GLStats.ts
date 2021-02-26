import { WebGLRenderer } from "three";

export class GLStats {
    renderer: WebGLRenderer;
    dom: HTMLDivElement;

    private _drawCount: HTMLDivElement;
    private _triangleCount: HTMLDivElement;
    private _pointsCount: HTMLDivElement;
    private _linesCount: HTMLDivElement;
    
    constructor(renderer: WebGLRenderer) {
        this.renderer = renderer;
        
        this.dom = document.createElement('div');
        document.body.append(this.dom);
        this.dom.id = 'gl-stats';
        this.dom.style.cssText = `
            position: fixed;
            left: 0;
            bottom: 0;
        `;

        this._drawCount = document.createElement('div');
        this.dom.append(this._drawCount);

        this._triangleCount = document.createElement('div');
        this.dom.append(this._triangleCount);

        this._pointsCount = document.createElement('div');
        this.dom.append(this._pointsCount);

        this._linesCount = document.createElement('div');
        this.dom.append(this._linesCount);

        this.update();
    }

    update(): void {
        this._drawCount.textContent = `Draw calls: ${this.renderer.info.render.calls.toLocaleString('en-US')}`;
        this._triangleCount.textContent = `Triangles: ${this.renderer.info.render.triangles.toLocaleString('en-US')}`;
        this._pointsCount.textContent = `Points: ${this.renderer.info.render.points.toLocaleString('en-US')}`;
        this._linesCount.textContent = `Lines: ${this.renderer.info.render.lines.toLocaleString('en-US')}`;
    }
}