// SillyTools - A suite of tools by 7th7andwich & Gemini

(function () {
    // --- CONFIGURATION ---
    // This array holds the paths to all the tool scripts you want to load.
    // The path is relative to the SillyTools plugin folder.
    const toolScripts = [
        'app/CharacterNotes.js'
        // 'app/AnotherTool.js', // Example of how to add more later
    ];

    // --- SCRIPT LOADER ---
    // This function dynamically loads all the scripts listed in the array above.
    function loadScripts() {
        // IMPORTANT: This name MUST EXACTLY match the name of your plugin's folder
        // in the /public/extensions/ directory.
        const pluginName = 'SillyTools'; 
        const head = document.head;

        toolScripts.forEach(scriptPath => {
            const scriptUrl = `extensions/${pluginName}/${scriptPath}`;

            // Check if the script is already loaded to prevent duplicates
            if (document.querySelector(`script[src="${scriptUrl}"]`)) {
                console.log(`SillyTools: Script ${scriptPath} is already loaded.`);
                return;
            }

            const scriptElement = document.createElement('script');
            scriptElement.type = 'text/javascript';
            scriptElement.src = scriptUrl;
            scriptElement.onload = () => console.log(`SillyTools: Successfully loaded ${scriptPath}`);
            scriptElement.onerror = () => console.error(`SillyTools: Failed to load ${scriptPath}. Check folder name and script path.`);
            head.appendChild(scriptElement);
        });
    }

    // --- INITIALIZATION ---
    console.log('SillyTools: Launcher initialized.');
    loadScripts();

})();
