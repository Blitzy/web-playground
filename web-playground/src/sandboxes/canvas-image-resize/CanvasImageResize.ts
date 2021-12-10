import Sandbox from "../Sandbox";
import dat, { GUI } from 'dat.gui';

import homer_img from './images/homer.png';
import landscape_img from './images/landscape.jpeg';
import legos_img from './images/legos.jpg';
import { loadImage } from "../../utils/MiscUtils";

const imageNames = [ 'homer', 'landcscape', 'legos' ] as const;
type ImageName = typeof imageNames[number];

const imageUrls: Record<ImageName, string> = { 
    'homer': homer_img,
    'landcscape': landscape_img,
    'legos': legos_img,
};

const qualityValues = [ 'high', 'medium', 'low', 'off' ] as const;
type Quality = typeof qualityValues[number];

export default class CanvasImageResize extends Sandbox {

    imageElements = new Map<ImageName, HTMLImageElement>();
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    quality: Quality = 'high';

    selectedImage: ImageName = 'homer';
    fillScreen: boolean = false;

    resize: boolean = false;
    resizeWidth: number = 128;
    resizeHeight: number = 128;

    gui: dat.GUI;
    resizeFolder: dat.GUI;

    async start(): Promise<void> {
        // Preload all images.
        for (const imageName of imageNames) {
            const url = imageUrls[imageName];
            const imgEl = await loadImage(url);
            imgEl.id = imageName;

            this.imageElements.set(imageName, imgEl);
        }

        // Setup canvas to display images.
        this.canvas = document.createElement('canvas');
        document.body.append(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.update();
        this.initGui();
    }

    update(): void {
        // Clear contents of canvas.
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const imgEl = this.imageElements.get(this.selectedImage);
        const width = this.resize ? this.resizeWidth : imgEl.naturalWidth;
        const height = this.resize ? this.resizeHeight : imgEl.naturalHeight;

        // Set canvas to new width and height.
        this.canvas.width = width;
        this.canvas.height = height;

        // Set style of canvas to either fill the screen or not.
        this.canvas.style.width = this.fillScreen ? '100vw' : null;
        this.canvas.style.height = this.fillScreen ? '100vh' : null;

        // Set image smoothing quality setting.
        if (this.quality === 'off') {
            this.ctx.imageSmoothingEnabled = false;
        } else {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = this.quality;
        }
        
        // Draw image to canvas.
        this.ctx.drawImage(imgEl, 0, 0, width, height);
    }

    updateResizeFolderDisplay(): void {
        if (this.resize) {
            this.resizeFolder.show();
        } else {
            this.resizeFolder.hide();
        }
    }

    initGui(): void {
        this.gui = new GUI();
        this.gui.add(this, 'selectedImage', imageNames).name('image').onChange((value: ImageName) => {
            this.update();
        });
        this.gui.add(this, 'fillScreen').name('fill screen').onChange((value: boolean) => {
            this.update();
        });
        this.gui.add(this, 'quality', qualityValues).onChange((value: string) => {
            this.update();
        });
        this.gui.add(this, 'resize').name('resize').onChange((value: boolean) => {
            this.updateResizeFolderDisplay();
            this.update();
        });

        this.resizeFolder = this.gui.addFolder('resize params');
        this.resizeFolder.open();

        this.resizeFolder.add(this, 'resizeWidth').name('width').onChange((value: number) => {
            this.update();
        });
        this.resizeFolder.add(this, 'resizeHeight').name('height').onChange((value: number) => {
            this.update();
        });

        this.gui.updateDisplay();
        this.updateResizeFolderDisplay();
    }
}