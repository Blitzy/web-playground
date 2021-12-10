export interface CircleProgressBarOptions {
    canvas: HTMLCanvasElement;
    resolution?: { width: number, height: number }
    thickness?: number;
    color?: string;
    fillColor?: string;
    normalizedLength?: number;
    startAngleDeg?: 270;
    interderminateSpeed?: number;
    clockwise?: boolean;
}

export class CircleProgressBar {
    parameters: RenderCanvasCircleParameters;
    indeterminateSpeed: number;

    private _progress: number = 0;
    private _indeterminateMode: boolean = false;
    private _indeterminateAnimateId: number;
    private _indeterminateLoopElapsedTime: number = 0;
    private _indeterminateParams: RenderCanvasCircleParameters;
    private _indeterminateLastAnimateTime: number;

    constructor(options: CircleProgressBarOptions) {
        this.parameters = {
            canvas: options.canvas,
            resolution: getOptionalValue(options.resolution, { width: options.canvas.width, height: options.canvas.height }),
            thickness: getOptionalValue(options.thickness, 32),
            color: getOptionalValue(options.color, '#c4a0c4'),
            fillColor: getOptionalValue(options.fillColor, '#92278f'),
            normalizedLength: getOptionalValue(options.normalizedLength, 1),
            startAngleDeg: getOptionalValue(options.startAngleDeg, 270),
            clockwise: getOptionalValue(options.clockwise, true),
        }

        this._indeterminateParams = {
            ...this.parameters,
            color: 'rgba(0,0,0,0)',
        };

        this.indeterminateSpeed = getOptionalValue(options.interderminateSpeed, 0.75);

        this._indeterminateAnimate = this._indeterminateAnimate.bind(this);

        renderCanvasCircle(this._progress, this.parameters);
    }

    getProgress(): number {
        return this._progress;
    }

    setProgress(value: number): void {
        if (this._indeterminateMode) {
            this.stopIndeterminateAnimation();

            this._progress = value;
            renderCanvasCircle(this._progress, this.parameters);
        } else {
            if (this._progress != value) {
                this._progress = value;
    
                renderCanvasCircle(this._progress, this.parameters);
            }
        }
    }
    
    playIndeterminateAnimation(): void {
        if (this._indeterminateMode) {
            return;
        }

        this._indeterminateMode = true;
        
        // Setup some initial values before trigger the indeterminate animation loop.
        this._indeterminateParams.startAngleDeg = 0;
        this._indeterminateLastAnimateTime = Date.now();

        this._indeterminateAnimate();
    }

    stopIndeterminateAnimation(): void {
        if (!this._indeterminateMode) {
            return;
        }
        
        this._indeterminateMode = false;
        cancelAnimationFrame(this._indeterminateAnimateId);
    }

    private _indeterminateAnimate(): void {
        const curTime = Date.now();
        const deltaTimeS = (curTime - this._indeterminateLastAnimateTime) / 1000;
        this._indeterminateLoopElapsedTime += deltaTimeS;

        this._indeterminateParams.startAngleDeg = interpolate(
            0,
            360,
            this._indeterminateLoopElapsedTime * this.indeterminateSpeed
        );

        renderCanvasCircle(0.25, this._indeterminateParams);

        this._indeterminateLastAnimateTime = curTime;

        if (this._indeterminateMode) {
            this._indeterminateAnimateId = requestAnimationFrame(this._indeterminateAnimate);
        }
    }
}

interface RenderCanvasCircleParameters {
    canvas: HTMLCanvasElement;
    resolution: { width: number, height: number };
    thickness: number;
    color: string;
    fillColor: string;
    normalizedLength: number;
    startAngleDeg: number;
    clockwise: boolean;
}

function renderCanvasCircle(progress: number, parameters: RenderCanvasCircleParameters): void {
    const ctx = parameters.canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const width = parameters.resolution.width * dpr;
    const height = parameters.resolution.height * dpr;
    const thickness = parameters.thickness * dpr;

    if (parameters.canvas.width !== width || parameters.canvas.height !== height) {
        parameters.canvas.width = width;
        parameters.canvas.height = height;
    }
  
    // Erase entire canvas.
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(0,0,0,0)";

    const x = width / 2;
    const y = height / 2;
    const smallestDimension = Math.min(width, height);
    const radius = smallestDimension / 2 - thickness / 2; // This keeps the stroke inside the canvas.
    const startAngle = (parameters.startAngleDeg * (Math.PI / 180));

    // Draw circle stroke background.
    ctx.beginPath();
    ctx.lineWidth =  thickness;
    const bgEndAngle = startAngle + ((Math.PI * 2) * parameters.normalizedLength);
    ctx.arc(x, y, radius, startAngle, bgEndAngle, !parameters.clockwise);
    ctx.strokeStyle = parameters.color;
    ctx.stroke();
  
    // Draw circle stroke fill.
    ctx.beginPath();
    ctx.lineWidth =  thickness;
    const fillEndAngle = startAngle + ((Math.PI * 2) * parameters.normalizedLength) * progress;
    ctx.arc(x, y, radius, startAngle, fillEndAngle, !parameters.clockwise);
    ctx.strokeStyle = parameters.fillColor;
    ctx.stroke();
}

function getOptionalValue<T>(obj: T | undefined, defaultValue: T): T {
    return obj !== undefined && obj !== null ? obj : defaultValue;
}

function interpolate(start: number, end: number, progress: number, ease?: (t: number) => number): number {
    if (ease) {
        progress = ease(progress);
    }

    return (1 - progress) * start + progress * end;
}