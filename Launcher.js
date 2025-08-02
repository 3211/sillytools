// SillyTools - A suite of tools by 7th7andwich & Gemini

(function () {
    // --- CONFIGURATION ---
    const toolScripts = [
        'app/CharacterNotes.js'
        // 'app/AnotherTool.js', // Example for later
    ];

    /**
     * Finds the URL of this launcher script.
     * This is a robust replacement for `document.currentScript`, which is not reliable
     * in all loading environments. It works by finding its own <script> tag in the DOM.
     * @returns {string | null} The full URL of this script, or null if it fails.
     */
    function getLauncherUrl() {
        // Get all script tags on the page.
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            // Find the one that includes our unique filename in its src attribute.
            if (scripts[i].src && scripts[i].src.includes('Launcher.js')) {
                return scripts[i].src;
            }
        }
        console.warn('SillyTools: Could not find launcher URL by searching script tags.');
        return null;
    }

    // --- SCRIPT LOADER ---
    function loadScripts() {
        const launcherUrl = getLauncherUrl();
        if (!launcherUrl) {
            console.error('SillyTools: CRITICAL - Could not determine the base path for loading tools. The launcher cannot find itself in the DOM.');
            return;
        }

        // 1. Derive the base path from the URL we found.
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
    // The "loading_order" in manifest.json should ensure the DOM is ready,
    // but this is an extra safety check.
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        loadScripts();
    } else {
        document.addEventListener('DOMContentLoaded', loadScripts);
    }

})();
