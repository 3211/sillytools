// SillyTools - A suite of tools by 7th7andwich & Gemini

(function () {
    // This script is "self-aware". It automatically finds its own path
    // to make sure it works no matter how or where SillyTavern installs it.

    // --- CONFIGURATION ---
    const toolScripts = [
        'app/CharacterNotes.js'
        // 'app/AnotherTool.js', // Example for later
    ];

    // --- SCRIPT LOADER ---
    function loadScripts() {
        // 1. Find the URL of this currently running script.
        const launcherUrl = document.currentScript.src;
        
        // 2. Derive the base path of the extension from that URL.
        // It strips "Launcher.js" from the end to get the folder path.
        const baseUrl = launcherUrl.substring(0, launcherUrl.lastIndexOf('/') + 1);

        const head = document.head;

        toolScripts.forEach(scriptPath => {
            // 3. Build the full, correct URL to the tool's script.
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
    // Wait for the UI to be ready before trying to load anything.
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
