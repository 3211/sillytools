// GumpTools - A suite of tools by 7th7andwich & Gemini

(function () {
    // --- CONFIGURATION ---
    // This array holds the paths to all the tool scripts you want to load.
    // To add a new tool, just add its script path to this list.
    // The path is relative to the GumpTools plugin folder.
    const toolScripts = [
        'App/CharacterNotes.js'
        // 'App/AnotherTool.js', // Example of how to add more later
    ];

    // --- SCRIPT LOADER ---
    // This function dynamically loads all the scripts listed in the array above.
    function loadScripts() {
        const pluginName = 'GumpTools'; // Should match the folder name in /extensions/
        const head = document.head;

        toolScripts.forEach(scriptPath => {
            const scriptUrl = `extensions/${pluginName}/${scriptPath}`;

            // Check if the script is already loaded to prevent duplicates
            if (document.querySelector(`script[src="${scriptUrl}"]`)) {
                console.log(`GumpTools: Script ${scriptPath} is already loaded.`);
                return;
            }

            const scriptElement = document.createElement('script');
            scriptElement.type = 'text/javascript';
            scriptElement.src = scriptUrl;
            scriptElement.onload = () => console.log(`GumpTools: Successfully loaded ${scriptPath}`);
            scriptElement.onerror = () => console.error(`GumpTools: Failed to load ${scriptPath}`);
            head.appendChild(scriptElement);
        });
    }

    // --- INITIALIZATION ---
    console.log('GumpTools: Launcher initialized.');
    loadScripts();

})();
