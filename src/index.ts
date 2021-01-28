import { APETest } from './sandboxes/ape-test/apeTest';
import { LightmapTest } from './sandboxes/lightmap-test/lightmapTest';
import { OrbitBox } from './sandboxes/orbit-box/orbitBox';
import { Sandbox } from './sandboxes/Sandbox';

const SandboxMap: Record<string, { new (): Sandbox }> = {
    'lightmap-test': LightmapTest,
    'orbit-box': OrbitBox,
    'ape-test': APETest,
}

var sandboxIframe: HTMLIFrameElement;

async function init() {
    const queryParams = new URLSearchParams(window.location.search);
    const querySandbox = queryParams.get('sandbox');

    if (querySandbox && SandboxMap[querySandbox]) {
        new SandboxMap[querySandbox]();
    } else {
        initUI();
        setUIVisible(true);
    }
}

function initUI(): void {
    const buttonParent: HTMLDivElement = document.createElement('div');
    buttonParent.id = 'sandbox-buttons';
    buttonParent.style.overflow = 'auto';
    buttonParent.style.width = '100vw';
    buttonParent.style.height = '100vh';
    document.body.append(buttonParent);

    const sandboxKeys = Object.keys(SandboxMap);

    for (const key of sandboxKeys) {
        const button: HTMLButtonElement = document.createElement('button');
        button.id = key;
        button.textContent = key;
        button.style.backgroundColor = 'transparent';
        button.style.border = 'white';
        button.style.borderWidth = 'thin';
        button.style.borderStyle = 'solid';
        button.style.color = 'white';
        button.style.padding = '8px';
        button.style.margin = '8px';

        button.addEventListener('click', (event) => {
            const clickedButton = event.target as HTMLButtonElement;

            // Put the sandbox key in the url query params.
            const queryParams = new URLSearchParams(window.location.search);
            queryParams.set('sandbox', clickedButton.id);
            history.pushState({ 'sandbox': clickedButton.id }, null, `?${queryParams.toString()}`);

            loadSandbox(clickedButton.id);
            setUIVisible(false);
        });

        buttonParent.append(button);
    }
}

function loadSandbox(key: string): void {
    // Create iframe for the sandbox to run in.
    sandboxIframe = document.createElement('iframe');
    sandboxIframe.name = 'sandbox-iframe';
    sandboxIframe.style.position = 'fixed';
    sandboxIframe.style.top = '0';
    sandboxIframe.style.left = '0';
    sandboxIframe.style.width = '100vw';
    sandboxIframe.style.height = '100vh';
    sandboxIframe.style.border = 'none';
    sandboxIframe.src = `${window.location.origin}?sandbox=${key}`;

    document.body.append(sandboxIframe);
}

function setUIVisible(visible: boolean): void {
    const buttonParent = document.getElementById('sandbox-buttons') as HTMLDivElement;
    buttonParent.style.visibility = visible ? 'visible' : 'hidden';
}

window.addEventListener('load', () => {
    init();
});

window.addEventListener('popstate', (event) => {

    if (event.state) {
        if (event.state.sandbox && SandboxMap[event.state.sandbox]) {
            loadSandbox(event.state.sandbox);
        }
    } else {
        if (sandboxIframe) {
            sandboxIframe.remove();
        }

        setUIVisible(true);
    }

    console.log(event);
});
