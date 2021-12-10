import { CircleProgressBar } from "./utils/CircleProgressBar";

export type ProgressFrameCallback = () => number;

class LoadingScreen {
    private _visible: boolean;
    private _progressVisible: boolean;
    private _rootElement: HTMLElement;
    private _logoElement: HTMLElement;
    private _messageElement: HTMLElement;
    private _iconElement: HTMLElement;
    private _circleProgressBar: CircleProgressBar;
    private _onProgressAnimate: ProgressFrameCallback | null;

    constructor() {
        this._rootElement = document.getElementById('loading-screen')!;

        this._messageElement = document.getElementById('loading-message')!;
        this._messageElement.textContent = null;

        this._iconElement = document.getElementById('loading-icon')!;
        this._logoElement = document.getElementById('logo')!;

        const progressCanvas = document.getElementById('loading-progress-circle') as HTMLCanvasElement;
        this._circleProgressBar = new CircleProgressBar({
            canvas: progressCanvas,
            fillColor: '#1ec668',
            color: '#bfe7d8',
            thickness: 8,
            resolution: { width: 102, height: 102 }
        });

        // Initialize the loading screen to hidden state.
        this.setVisible(false);
        this.setProgressVisible(false);
        this.setMessage(null);

        this._animate = this._animate.bind(this);
        this._animate();

    }

    setVisible(visible: boolean): LoadingScreen {
        this._visible = visible;
        this._rootElement.style.visibility = visible ? 'visible' : 'hidden';
        return this;
    }

    setTextColor(color: string): LoadingScreen {
        this._rootElement.style.color = color;
        return this;
    }

    setBackgroundColor(color: string): LoadingScreen {
        this._rootElement.style.backgroundColor = color;
        return this;
    }

    setSpinnerIcon(imgUrl: string): LoadingScreen {
        this._iconElement.style.backgroundImage = `url(${imgUrl})`;
        return this;
    }

    setLogo(imgUrl: string): LoadingScreen {
        this._logoElement.style.backgroundImage = `url(${imgUrl})`;
        return this;
    }

    setProgress(progress: number): LoadingScreen {
        this._onProgressAnimate = null;
        this._circleProgressBar.setProgress(progress);
        return this;
    }

    setProgressVisible(visible: boolean): LoadingScreen {
        this._progressVisible = visible;
        this._circleProgressBar.parameters.canvas.style.visibility = visible ? 'inherit' : 'hidden';
        return this;
    }

    setProgressIndeterminate(): LoadingScreen {
        this._onProgressAnimate = null;
        this._circleProgressBar.playIndeterminateAnimation();
        return this;
    }

    setProgressAnimationLoop(onProgressAnimate: ProgressFrameCallback): LoadingScreen {
        this._onProgressAnimate = onProgressAnimate;
        return this;
    }

    setMessage(message: string | null): LoadingScreen {
        if (!message || message === '') {
            this._messageElement.style.fontSize = '0';
        } else {
            this._messageElement.style.removeProperty('fontSize');
        }

        this._messageElement.textContent = message;
        return this;
    }

    private _animate(): void {
        if (this._visible && this._progressVisible && this._onProgressAnimate) {
            let progress: number | undefined = undefined;

            try {
                progress = this._onProgressAnimate();
            } catch (e) {
                console.error(`[LoadingScreen] Error occured in progress animate function. Error: `, e);
                this._onProgressAnimate = null;
            }

            if (typeof progress === 'number' && progress >= 0) {
                this._circleProgressBar.setProgress(progress);
            }
        }

        requestAnimationFrame(this._animate);
    }
}

export const loadingScreen = new LoadingScreen();
