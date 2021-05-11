// Copied form Puppeteer
`use strict`;
const childProcess = require('child_process');
const readline = require('readline');
const promisify = require('util').promisify;
const fs = require('fs');
const path = require('path');
const os = require('os');

const mkdtempAsync = promisify(fs.mkdtemp);

module.exports = {
    launch: async function () {
        return launch();
    }
};

async function launch() {
    const tempDir = await getTempDir();
    const chromeExecutable = process.env.CHROME_PATH;

    const proc = childProcess.spawn(
        chromeExecutable,
        ["--disable-background-networking",
            "--enable-features=NetworkService,NetworkServiceInProcess",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-breakpad",
            "--disable-client-side-phishing-detection",
            "--disable-component-extensions-with-background-pages",
            "--disable-default-apps",
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--disable-features=TranslateUI",
            "--disable-hang-monitor",
            "--disable-ipc-flooding-protection",
            "--disable-popup-blocking",
            "--disable-prompt-on-repost",
            "--disable-renderer-backgrounding",
            "--disable-sync",
            "--force-color-profile=srgb",
            "--metrics-recording-only",
            "--no-first-run",
            "--enable-automation",
            "--password-store=basic",
            "--use-mock-keychain",
            "--enable-blink-features=IdleDetection",
            "--remote-debugging-port=0",
            // TODO: get `headless` flag from env
            // "--headless",
            "--user-data-dir=" + tempDir,
            "about:blank"
        ],
    );
    return await waitForWSEndpoint(proc);
}

async function getTempDir() {
    const profilePath = path.join(os.tmpdir(), 'bidi_mapper_profiles_');
    return await mkdtempAsync(profilePath);
}

function waitForWSEndpoint(browserProcess) {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({ input: browserProcess.stderr });
        addEventListener(rl, 'line', onLine);

        function onLine(line) {
            const match = line.match(/^DevTools listening on (ws:\/\/.*)$/);
            if (!match) return;
            resolve(match[1]);
        }
    });
}

function addEventListener(emitter, eventName, handler) {
    emitter.on(eventName, handler);
    return { emitter, eventName, handler };
}