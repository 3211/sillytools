// SillyTools - A suite of tools by 7th7andwich & Gemini

(function () {
    // --- IMMEDIATE EXECUTION ---
    // We MUST capture the script's URL immediately, before any delays or events.
    // If we don't, document.currentScript will become null.
    const launcherUrl = document.currentScript.src;

    // --- CONFIGURATION ---
    const toolScripts = [
        'app/CharacterNotes.js'
        // 'app/AnotherTool.js', // Example for later
    ];

    // --- SCRIPT LOADER ---
    function loadScripts() {
        // 1. Derive the base path from the URL we captured earlier.
        const baseUrl = launcherUrl.substring(0, launcherUrl.lastIndexOf('/') + 1);
        const head = document.head;

        toolScripts.forEach(scriptPath => {
            // 2. Build the full, correct URL to the tool's script.
            const scriptUrl = baseUrl + scriptPath;
            const scriptName = scriptPath.split('/').pop();

            if (document.querySelector(`script[src="${scriptUrl}"]`)) {
                console.log(`SillyTools: Script ${scriptName} is already loaded.`);
                return;
            }

            const scriptElement = document.createElement('script');
            scriptElement.type = 'text/javascript';
            scriptElement.src = scriptUrl;
            scriptElement.onload = () => console.log(`SillyTools: Successfully loaded ${scriptName} from ${scriptUrl}`);
            scriptElement.onerror = () => console.error(`SillyTools: CRITICAL - Failed to load ${scriptName}. URL was ${scriptUrl}`);
            head.appendChild(scriptElement);
        });
    }

    // --- INITIALIZATION ---
    // Now we can safely wait for the DOM to be ready before calling our function.
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('SillyTools: Launcher initialized.');
        loadScripts();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('SillyTools: Launcher initialized on DOMContentLoaded.');
            loadScripts();
        });
    }

})();
