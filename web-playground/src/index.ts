import { AppBuildInfo } from './AppBuildInfo';
import { InfoButton } from './info-button/InfoButton';
import { loadingScreen } from './LoadingScreen';
import { isSandboxId, loadSandboxModule, SandboxId, SandboxIds } from './sandboxes/SandboxManifest';

var sandboxIframe: HTMLIFrameElement | null;
var infoButton: InfoButton | null;

async function init() {
    const queryParams = new URLSearchParams(window.location.search);
    const querySandbox = queryParams.get('sandbox');
    const queryLoad = queryParams.get('load');

    if (querySandbox && isSandboxId(querySandbox) && (queryLoad === 'true' || queryLoad === '1')) {
        // Setup and show loading screen.
        loadingScreen.setBackgroundColor('#252629');
        loadingScreen.setProgressVisible(true);
        loadingScreen.setProgressIndeterminate();
        loadingScreen.setTextColor('#fff');
        loadingScreen.setMessage('Loading');
        loadingScreen.setVisible(true);

        // Create and start sandbox.
        const sandboxConstructor = await loadSandboxModule(querySandbox);
        const sandbox = new sandboxConstructor();
        await sandbox.start();

        loadingScreen.setVisible(false);
    } else {
        console.info(`== Blitzy's Web Playground v${AppBuildInfo.version} ==\nDate: ${AppBuildInfo.date().toString()}\nMode: ${AppBuildInfo.mode()}`);

        initUI();
        setUIVisible(true);

        // If sandbox is in the url, pretend we clicked the button for it.
        if (querySandbox && isSandboxId(querySandbox)) {
            onSandboxButtonClick(querySandbox);
        }
    }
}

function initUI(): void {
    const app = document.createElement('div');
    app.id = 'app'
    app.innerHTML = `
        <div id="intro-box">
            <h1 class="font-display">Blitzy's Web Playground</h1>
            <p class="font-regular">
                This is a loose collection of sandboxed web tech experiments and demos that I've made available publicy.
            </p>
            <p class="font-regular">
                Each sandbox (as well as this entire site) has its source code public available on GitHub.
                There is a source code button inside each sandbox that will take you directly to its location on GitHub.
            </p>
        </div>
        <div class="version-info">
            <p>Version: ${AppBuildInfo.version}</p>
            <p>Date: ${AppBuildInfo.date().toString()}</p>
        </div>
    `

    document.body.append(app);

    const buttonParent: HTMLDivElement = document.createElement('div');
    buttonParent.id = 'sandbox-buttons';
    app.append(buttonParent);

    for (const id of SandboxIds) {
        const button: HTMLButtonElement = document.createElement('button');
        button.id = id;
        button.className = 'sandbox-button';
        button.textContent = id;

        button.addEventListener('click', (event) => {
            const clickedButton = event.target as HTMLButtonElement;
            onSandboxButtonClick(clickedButton.id as SandboxId);
        });

        buttonParent.append(button);
    }
}

function onSandboxButtonClick(id: SandboxId): void {
    // Put the sandbox key in the url query params.
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('sandbox', id);

    history.pushState({ 'sandbox': id }, '', `?${queryParams.toString()}`);

    loadSandbox(id);
    setUIVisible(false);
}

function loadSandbox(id: SandboxId): void {
    // Create iframe for the sandbox to run in.
    sandboxIframe = document.createElement('iframe');
    sandboxIframe.name = 'sandbox-iframe';
    sandboxIframe.id = 'sandbox-iframe';
    sandboxIframe.src = `${window.location.origin}${window.location.pathname}?sandbox=${id}&load=1`;

    document.body.append(sandboxIframe);

    // Create info button for the sandbox.
    infoButton = new InfoButton(id);
    document.body.append(infoButton.dom);
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
        if (event.state.sandbox && isSandboxId(event.state.sandbox)) {
            loadSandbox(event.state.sandbox);
        }
    } else {
        history.replaceState(null, '', window.location.origin);

        if (sandboxIframe) {
            sandboxIframe.remove();
            sandboxIframe = null;
        }

        if (infoButton) {
            infoButton.dispose();
            infoButton = null;
        }

        setUIVisible(true);
    }
});
