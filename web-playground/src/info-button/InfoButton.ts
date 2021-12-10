import { AppBuildInfo } from "../AppBuildInfo";
import { SandboxId, SandboxInfo, SandboxManifest } from "../sandboxes/SandboxManifest";
import button_icon from './code-black-18dp.svg';

const GITHUB_URL = `https://github.com/Blitzy/web-playground`;
const DEFUALT_BRANCH = `master`;

export class InfoButton {
    dom: HTMLDivElement;

    private _button: HTMLButtonElement;
    private _sandboxInfo: SandboxInfo;

    constructor(sandboxId: SandboxId) {
        this._sandboxInfo = SandboxManifest[sandboxId];

        this.dom = document.createElement('div');
        this.dom.id = 'info-button';
        this.dom.style.cssText = `
            position: fixed;
            bottom: 0;
            right: 0;
            z-index: 999;
        `;

        this._button = document.createElement('button');
        this._button.onclick = () => { this.onInfoButtonClick() }
        this._button.style.cssText = `
            background-color: white;
            border-radius: 50%;
            opacity: 0.8;
            padding: 12px;
            cursor: pointer;
            border: none;
            margin-right: 12px;
            margin-bottom: 12px;
            outline: none;
        `;
        this._button.onmouseover = () => {
            this._button.style.opacity = '1';
        };
        this._button.onmouseleave = () => {
            this._button.style.opacity = '0.8';
        };
        this.dom.append(this._button);
        
        const buttonImg = document.createElement('img');
        buttonImg.src = button_icon;
        buttonImg.style.cssText = `
            display: block;
            width: 24px;
        `;
        this._button.append(buttonImg);
    }

    onInfoButtonClick(): void {
        let branch = DEFUALT_BRANCH;
        if (!AppBuildInfo.inDevMode()) {
            branch = `v${AppBuildInfo.version}`;
        }

        const fullUrl = `${GITHUB_URL}/blob/${branch}/${this._sandboxInfo.sourceRelativeUrl}`;
        window.open(fullUrl);
    }

    dispose(): void {
        this.dom.remove();
    }
}