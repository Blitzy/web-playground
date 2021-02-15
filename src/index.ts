import { AppBuildInfo } from './AppBuildInfo';
import { loadingScreen } from './LoadingScreen';
import SandboxManifest from './SandboxManifest';

var sandboxIframe: HTMLIFrameElement;

async function init() {
    const queryParams = new URLSearchParams(window.location.search);
    const querySandbox = queryParams.get('sandbox');
    const queryInternalLoadSandbox = queryParams.get('internal-load-sandbox');

    if (querySandbox && SandboxManifest[querySandbox] && queryInternalLoadSandbox === 'true') {
        // Setup and show loading screen.
        loadingScreen.setBackgroundColor('#252629');
        loadingScreen.setProgressVisible(true);
        loadingScreen.setProgressIndeterminate();
        loadingScreen.setTextColor('#fff');
        loadingScreen.setMessage('Loading');
        loadingScreen.setVisible(true);

        // Create and start sandbox.
        const sandbox = new SandboxManifest[querySandbox]();
        await sandbox.start();

        loadingScreen.setVisible(false);
    } else {
        console.info(`== Web Playground v${AppBuildInfo.version} ==\nDate: ${AppBuildInfo.date().toString()}\nMode: ${AppBuildInfo.mode}`);

        initUI();
        setUIVisible(true);

        // If sandbox is in the url, pretend we clicked the button for it.
        if (querySandbox && SandboxManifest[querySandbox]) {
            onSandboxButtonClick(querySandbox);
        }
    }
}

function initUI(): void {
    const buttonParent: HTMLDivElement = document.createElement('div');
    buttonParent.id = 'sandbox-buttons';
    document.body.append(buttonParent);

    const sandboxKeys = Object.keys(SandboxManifest);

    for (const key of sandboxKeys) {
        const button: HTMLButtonElement = document.createElement('button');
        button.id = key;
        button.textContent = key;

        button.addEventListener('click', (event) => {
            const clickedButton = event.target as HTMLButtonElement;
            onSandboxButtonClick(clickedButton.id);
        });

        buttonParent.append(button);
    }
}

function onSandboxButtonClick(sandboxId: string): void {
    // Put the sandbox key in the url query params.
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('sandbox', sandboxId);

    history.pushState({ 'sandbox': sandboxId }, null, `?${queryParams.toString()}`);

    loadSandbox(sandboxId);
    setUIVisible(false);
}

function loadSandbox(key: string): void {
    // Create iframe for the sandbox to run in.
    sandboxIframe = document.createElement('iframe');
    sandboxIframe.name = 'sandbox-iframe';
    sandboxIframe.id = 'sandbox-iframe';
    sandboxIframe.src = `${window.location.origin}${window.location.pathname}?sandbox=${key}&internal-load-sandbox=true`;

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
        if (event.state.sandbox && SandboxManifest[event.state.sandbox]) {
            loadSandbox(event.state.sandbox);
        }
    } else {
        history.replaceState(null, null, window.location.origin);

        if (sandboxIframe) {
            sandboxIframe.remove();
        }

        setUIVisible(true);
    }
});
