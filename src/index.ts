import { loadingScreen } from './LoadingScreen';
import APETest from './sandboxes/ape-test/APETest';
import LightmapTest from './sandboxes/lightmap-test/LightmapTest';
import OrbitBox from './sandboxes/orbit-box/OrbitBox';
import Sandbox from './sandboxes/Sandbox';

const SandboxMap: Record<string, { new(): Sandbox }> = {
    'lightmap-test': LightmapTest,
    'orbit-box': OrbitBox,
    'ape-test': APETest,
}

var sandboxIframe: HTMLIFrameElement;

async function init() {

    const queryParams = new URLSearchParams(window.location.search);
    const querySandbox = queryParams.get('sandbox');

    if (querySandbox && SandboxMap[querySandbox]) {
        // Setup and show loading screen.
        loadingScreen.setBackgroundColor('#252629');
        loadingScreen.setProgressVisible(true);
        loadingScreen.setProgressIndeterminate();
        loadingScreen.setTextColor('#fff');
        loadingScreen.setMessage('Loading');
        loadingScreen.setVisible(true);

        // Create and start sandbox.
        const sandbox = new SandboxMap[querySandbox]();
        await sandbox.start();

        loadingScreen.setVisible(false);
    } else {
        initUI();
        setUIVisible(true);
    }
}

function initUI(): void {
    const buttonParent: HTMLDivElement = document.createElement('div');
    buttonParent.id = 'sandbox-buttons';
    document.body.append(buttonParent);

    const sandboxKeys = Object.keys(SandboxMap);

    for (const key of sandboxKeys) {
        const button: HTMLButtonElement = document.createElement('button');
        button.id = key;
        button.textContent = key;

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
    sandboxIframe.id = 'sandbox-iframe';
    sandboxIframe.src = `${window.location.origin}${window.location.pathname}?sandbox=${key}`;

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
