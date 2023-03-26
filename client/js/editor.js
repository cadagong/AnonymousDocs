const IMAGES_PATH = '../images';


/**
 * On window load, focus text area, set event listeners, 
 * and retrieve textarea text from localStorage.
 */
window.addEventListener('load', function() {
    setEventListeners();
    getLocalStorage();

    const textArea = document.querySelector('.md-textarea');
    textArea.focus();
})


function addDocumentSections() {

}

/**
 * Open modal with specified view
 * 
 * @param {String} view  The view to be displaye din the modal.
 *      options are: 'collab-settings', 'edit-document-section', 'add-document-section' 
 * 
 * @param {Object} options View options object. Options depend on the view.
 */
function openModal(view, options) {
    switch (view) {
        case 'collab-settings':
            document.getElementById('modal-title').innerHTML = 'Collaborator Settings';
            document.getElementById('modal-content').innerHTML = COLLAB_SETTINGS;
            break;
        
        case 'edit-document-section':
            //const documentSectionID = options.documentSectionID;
            document.getElementById('modal-title').innerHTML = 'Edit Document Section Settings';
            document.getElementById('modal-content').innerHTML = EDIT_DOCUMENT_SECTION;
            break;

        case 'add-document-section':
            document.getElementById('modal-title').innerHTML = 'Add Document Section';
            break;
    }

    document.getElementById('modal').style.display = 'inline';
    //document.getElementById('editor-page-main-content').style.filter = 'blur(2px)';
}


/**
 * Download the contents of the textarea as a markdown file
 * 
 * @param {String} text The text inside the textarea
 */
function download(text){
    const element = document.createElement('a');
  
    // A blob is a data type that can store binary data
    // "type" is a MIME type
    // It can have a different value, based on a file you want to save
    const blob = new Blob([text], { type: 'text/markdown' });
    const fileUrl = URL.createObjectURL(blob);
    const filename = document.getElementById('filename').innerHTML;
    
    // setAttribute() Sets the value of an attribute on the specified element.
    element.setAttribute('href', fileUrl); // file location
    element.setAttribute('download', filename); // file name
    element.style.display = 'none';
    
    //use appendChild() method to move an element from one element to another
    document.body.appendChild(element);
    element.click();
}


/**
 * Set all the necessary event listeners on the page
 */
function setEventListeners() {
    // text area listeners
    const textAreas = Array.from(document.querySelectorAll('.md-textarea'));
    textAreas.forEach((textArea) => {
        textArea.addEventListener('input', function(e) {
            setLocalStorage();
            updatePreview();
        });
    });


    // edit document section btn listens
    const editDocumentSectionBtns = Array.from(document.querySelectorAll('.edit-document-section-btn'));
    editDocumentSectionBtns.forEach((btn) => {
        btn.addEventListener('mouseover', function() {
            btn.src = `${IMAGES_PATH}/edit-document-section-colour.svg`;
        });
        btn.addEventListener('mouseout', function() {
            btn.src = `${IMAGES_PATH}/edit-document-section-bw.svg`;
        });
        btn.addEventListener('click', function() {
            openModal('edit-document-section');
        });
    });

    // close modal listeners
    const closeModalBtn = document.getElementById('close-modal-btn')
    closeModalBtn.addEventListener('click', function() {
        document.getElementById('modal').style.display = 'none';
    });
    document.body.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.getElementById('modal').style.display = 'none';
        }
    }) 

    // download, share, and chat btns liteners
    const navbarBtnNames = ['download', 'collab-settings', 'chat', 'add-document-section']
    navbarBtnNames.forEach((btnName) => {
        const btn = document.getElementById(`${btnName}-btn`)
        btn.addEventListener('mouseover', function() {
            btn.src = `${IMAGES_PATH}/${btnName}-colour.svg`;
        });
        btn.addEventListener('mouseout', function() {
            btn.src = `${IMAGES_PATH}/${btnName}-bw.svg`;
        });

        switch (btnName) {
            case 'collab-settings':
                btn.addEventListener('click', function() {
                    openModal('collab-settings');
                });
                break;
            
            case 'download':
                btn.addEventListener('click', function() {
                    download();
                });
                break;

            case 'add-document-section':
                btn.addEventListener('click', function() {
                    openModal('add-document-section');
                });
                break;
        }
    })
}


/**
 * Update the markdown preview to display latest changes in textarea
 */
function updatePreview() {
    const textAreas = Array.from(document.querySelectorAll('.md-textarea'));
    
    let content = '';
    textAreas.forEach((textArea) => {
        content += `\n${textArea.value}`;
    });

    document.getElementById('md-preview').innerHTML = marked.parse(content);
}


/**
 * Get saved textarea text from localStorage
 */
function getLocalStorage() {
    const textArea = document.querySelector('.md-textarea');
    let existingData = JSON.parse(window.localStorage.getItem('anonymous-docs-text-data'));
    
    if (!existingData) {
        existingData = "";
        window.localStorage.setItem('anonymous-docs-text-data', JSON.stringify(existingData));
    }
    else {
        textArea.value = existingData;
        updatePreview();
    } 
}


/**
 * Save textarea text to localStorage
 */
function setLocalStorage() {
    const textArea = document.querySelector('.md-textarea');
    window.localStorage.setItem('anonymous-docs-text-data', JSON.stringify(textArea.value));
}