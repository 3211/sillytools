(function () {
    console.log('CNotes: [V19-DeletionLogic] Script file loaded.');

    // --- GLOBALS ---
    let characterNotesData = {};
    let currentCharacterId = null;
    let modal;
    let folderSelector, folderNameInput, noteSelector, noteTitleInput, noteContentTextarea;
    let isModalOpen = false;
    let currentFolderName = '##root##';

    // ----- DATA FUNCTIONS -----
    function loadNotes() {
        const context = SillyTavern.getContext();
        const loadedData = context.extensionSettings['Character-Notes'];
        if (loadedData) characterNotesData = loadedData;

        // One-time migration for any character data still in the old format
        Object.keys(characterNotesData).forEach(charId => {
            if (Array.isArray(characterNotesData[charId])) {
                const oldNotes = characterNotesData[charId];
                characterNotesData[charId] = { '##root##': oldNotes };
            }
        });
    }

    function saveNotes() {
        if (!currentCharacterId) return;
        const context = SillyTavern.getContext();
        context.extensionSettings['Character-Notes'] = characterNotesData;
        context.saveSettingsDebounced();
    }
    
    // ----- MODAL VISIBILITY -----
    function openModal() {
        modal.style.display = 'flex';
        isModalOpen = true;
        ensureOnScreen();
        refreshFoldersUI();
    }
    function closeModal() {
        modal.style.display = 'none';
        isModalOpen = false;
    }

    // ----- UI AND EVENT FUNCTIONS -----
    function refreshFoldersUI() {
        const context = SillyTavern.getContext();
        if (!context || !context.characterId) {
            if (isModalOpen) closeModal();
            return;
        }
        currentCharacterId = context.characterId;
        if (!characterNotesData[currentCharacterId]) characterNotesData[currentCharacterId] = { '##root##': [] };

        const folders = Object.keys(characterNotesData[currentCharacterId]).sort();
        folderSelector.innerHTML = '';

        const rootOption = document.createElement('option');
        rootOption.value = '##root##';
        rootOption.textContent = '– (Root Folder) –';
        folderSelector.appendChild(rootOption);

        folders.forEach(folderName => {
            if (folderName === '##root##') return;
            const option = document.createElement('option');
            option.value = folderName;
            option.textContent = folderName;
            folderSelector.appendChild(option);
        });

        folderSelector.value = currentFolderName;
        folderNameInput.value = (currentFolderName === '##root##') ? '' : currentFolderName;
        refreshNotesList();
    }

    function refreshNotesList(noteIndexToSelect = -1) {
        const notes = characterNotesData[currentCharacterId]?.[currentFolderName] || [];
        
        noteSelector.innerHTML = '<option value="-1">-- New Note --</option>';
        notes.forEach((note, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = note.title;
            noteSelector.appendChild(option);
        });

        noteSelector.value = noteIndexToSelect;
        displaySelectedNote();
    }

    function displaySelectedNote() {
        const selectedIndex = parseInt(noteSelector.value, 10);
        const notes = characterNotesData[currentCharacterId]?.[currentFolderName] || [];
        if (selectedIndex >= 0 && notes[selectedIndex]) {
            const note = notes[selectedIndex];
            noteTitleInput.value = note.title;
            noteContentTextarea.value = note.text;
        } else {
            noteTitleInput.value = '';
            noteContentTextarea.value = '';
        }
    }
    
    function prepareNewNote() {
        noteSelector.value = -1;
        displaySelectedNote();
    }

    function handleFolderSelect() {
        currentFolderName = folderSelector.value;
        folderNameInput.value = (currentFolderName === '##root##') ? '' : currentFolderName;
        refreshNotesList();
    }

    function handleSaveNote() {
        if (!currentCharacterId) return;
        const title = noteTitleInput.value.trim();
        const text = noteContentTextarea.value.trim();
        if (!title) {
            SillyTavern.utility.showToast("Note title cannot be empty.", "error");
            return;
        }

        let folderToSaveIn = folderNameInput.value.trim();
        if (!folderToSaveIn) {
            folderToSaveIn = '##root##';
        }
        
        if (!characterNotesData[currentCharacterId][folderToSaveIn]) {
            characterNotesData[currentCharacterId][folderToSaveIn] = [];
        }

        const notes = characterNotesData[currentCharacterId][folderToSaveIn];
        let selectedIndex = parseInt(noteSelector.value, 10);
        
        let savedIndex;
        if (selectedIndex >= 0 && folderToSaveIn === currentFolderName) {
            notes[selectedIndex] = { title, text };
            savedIndex = selectedIndex;
        } else {
            notes.push({ title, text });
            savedIndex = notes.length - 1;
        }
        
        currentFolderName = folderToSaveIn;
        saveNotes();
        refreshFoldersUI();
        refreshNotesList(savedIndex);
        SillyTavern.utility.showToast(`Note saved to "${folderToSaveIn === '##root##' ? 'Root Folder' : folderToSaveIn}"`, "success");
    }

    function handleDeleteNote() {
        if (!currentCharacterId || !currentFolderName) return;
        const selectedIndex = parseInt(noteSelector.value, 10);
        if (selectedIndex < 0) return;
        characterNotesData[currentCharacterId][currentFolderName].splice(selectedIndex, 1);
        saveNotes();
        refreshNotesList();
        SillyTavern.getContext().utility.showToast("Note deleted.", "success");
    }

    function handleDeleteFolder() {
        const folderToDelete = folderSelector.value;
        if (folderToDelete === '##root##') {
            SillyTavern.utility.showToast("Cannot delete the Root Folder.", "error");
            return;
        }

        if (confirm(`Are you sure you want to delete the folder "${folderToDelete}" and all notes inside it?`)) {
            delete characterNotesData[currentCharacterId][folderToDelete];
            currentFolderName = '##root##';
            saveNotes();
            refreshFoldersUI();
            SillyTavern.utility.showToast(`Folder "${folderToDelete}" deleted.`, "success");
        }
    }
    
    function ensureOnScreen() {
        const rect = modal.getBoundingClientRect();
        if (rect.left < 0) modal.style.left = '0px';
        if (rect.top < 0) modal.style.top = '0px';
        if (rect.right > window.innerWidth) modal.style.left = `${window.innerWidth - rect.width}px`;
        if (rect.bottom > window.innerHeight) modal.style.top = `${window.innerHeight - rect.height}px`;
    }

    function createModal() {
        if (document.getElementById('character-notes-modal')) return;
        modal = document.createElement('div');
        modal.id = 'character-notes-modal';
        modal.style.display = 'none';

        modal.innerHTML = `
            <div id="character-notes-header"><span>Character Notes</span><button id="character-notes-close" class="fa-solid fa-xmark"></button></div>
            <div id="character-notes-content">
                <div class="cnotes-folder-row">
                    <input type="text" id="character-notes-folder-input" class="text_pole" placeholder="New/Current Folder Name">
                    <button id="character-notes-delete-folder" class="menu_button" title="Delete Selected Folder">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
                <select id="character-notes-folder-selector"></select>
                <select id="character-notes-selector"></select>
                <input type="text" id="character-notes-title" class="text_pole" placeholder="Note Title">
                <textarea id="character-notes-textarea" placeholder="Note content..."></textarea>
                <div id="character-notes-actions">
                    <button id="character-notes-new">New</button>
                    <button id="character-notes-save">Save</button>
                    <button id="character-notes-delete">Delete</button>
                </div>
            </div>`;
        document.body.appendChild(modal);

        folderSelector = document.getElementById('character-notes-folder-selector');
        folderNameInput = document.getElementById('character-notes-folder-input');
        noteSelector = document.getElementById('character-notes-selector');
        noteTitleInput = document.getElementById('character-notes-title');
        noteContentTextarea = document.getElementById('character-notes-textarea');

        document.getElementById('character-notes-close').addEventListener('click', closeModal);
        folderSelector.addEventListener('change', handleFolderSelect);
        document.getElementById('character-notes-delete-folder').addEventListener('click', handleDeleteFolder);
        noteSelector.addEventListener('change', displaySelectedNote);
        document.getElementById('character-notes-new').addEventListener('click', prepareNewNote);
        document.getElementById('character-notes-save').addEventListener('click', handleSaveNote);
        document.getElementById('character-notes-delete').addEventListener('click', handleDeleteNote);
        
        let pos1=0,pos2=0,pos3=0,pos4=0;
        const header=document.getElementById('character-notes-header');
        if(header){header.onmousedown=function(e){e.preventDefault();pos3=e.clientX;pos4=e.clientY;document.onmouseup=()=>{document.onmouseup=null;document.onmousemove=null;};document.onmousemove=(e)=>{e.preventDefault();pos1=pos3-e.clientX;pos2=pos4-e.clientY;pos3=e.clientX;pos4=e.clientY;modal.style.top=`${modal.offsetTop-pos2}px`;modal.style.left=`${modal.offsetLeft-pos1}px`;};};}
    }

    // --- IMMEDIATE EXECUTION ---
    try {
        console.log('CNotes: Entering initialization block.');
        const extensionsMenu = document.getElementById('extensionsMenu');
        if (!extensionsMenu) throw new Error("#extensionsMenu not found in the DOM.");

        const menuItem = document.createElement('div');
        menuItem.classList.add('list-group-item', 'flex-container', 'flexGap5', 'interactable');
        menuItem.innerHTML = `<i class="fa-solid fa-note-sticky"></i><span>Character Notes</span>`;
        
        menuItem.addEventListener('click', () => { (isModalOpen) ? closeModal() : openModal(); });
        
        extensionsMenu.appendChild(menuItem);
        createModal();
        loadNotes();

        const eventSource = SillyTavern.getContext().eventSource;

        eventSource.on('chatLoaded', () => {
            currentFolderName = '##root##';
            refreshFoldersUI();
        });

        // MODIFIED: Listener for character deletion now contains the cleanup logic.
        eventSource.on('characterDeleted', (data) => {
            console.log('CNotes: "characterDeleted" event caught!');
            // SillyTavern's character ID is the avatar filename. The event provides this.
            const charId = data.id;
            console.log(`CNotes: Deleting notes for character ID: ${charId}`);
            if (charId && characterNotesData[charId]) {
                
                delete characterNotesData[charId];
                saveNotes();
                SillyTavern.utility.showToast(`Cleaned up notes for deleted character.`, "info");
            }
        });

        console.log('CNotes: Initialization complete.');
    } catch (error) {
        console.error('CNotes: A critical error occurred during initialization.', error);
    }
})();
