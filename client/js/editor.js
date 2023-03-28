const IMAGES_PATH = '../images';


/**
 * On window load, focus text area, set event listeners, 
 * and retrieve textarea text from localStorage.
 */
window.addEventListener('load', function() {
    // setEventListeners();
    getDocumentSections(false);
    // setInterval(function() {
    //     getDocumentSections(true);
    // }, 2000);    
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
            console.log('input');
            updateDocumentSection(textArea.getAttribute('sectionID'), textArea.value);
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
        content += `\n\n${textArea.value}`;
    });

    document.getElementById('md-preview').innerHTML = marked.parse(content);
}


/**
 * Get textarea text from server
 */
function getDocumentSections(excludeThisUser) {
    const tokenData = JSON.parse(window.localStorage.getItem('anonymous-docs-token-data'));
    const token = tokenData.token;
    const username = tokenData.user;

    const request = new XMLHttpRequest();
    const id = document.getElementById('filename').getAttribute('doc-id');
    const url = `/document/view1?id=${id}&token=${token}`;
    request.open("GET", url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", `Bearer ${token}`);
    
    request.addEventListener("load", function(){           
        if (this.status == 200) {
            console.log(JSON.parse(this.response));
            const jsonRes = JSON.parse(this.response);
            const sections = jsonRes.sections;
            let html = ""
            let i = 0;
            sections.forEach(section => {
                //if (jsonRes)
                html +=
                `<div class="document-section-heading">
                    <div class="document-section-title">Section ${i+1}: ${section.title}</div>
                    <img class="edit-document-section-btn" src="../images/edit-document-section-bw.svg" loading="lazy">                    
                </div>
                <textarea class="text-editor-content md-textarea" sectionID="${section._id}">${section.text}</textarea>`;
                i++;
            });
            document.getElementById('document-sections-container').innerHTML = html;
            setEventListeners();
            updatePreview();
        }
        else alert('Server error. Please try again later');

    }, false);

    request.send();
}


/**
 * Exclude sections of this user
 */
function getDocumentSectionUpdates() {
    const tokenData = JSON.parse(window.localStorage.getItem('anonymous-docs-token-data'));
    const token = tokenData.token;
    const username = tokenData.user;

    const request = new XMLHttpRequest();
    const id = document.getElementById('filename').getAttribute('doc-id');
    const url = `/document/view1?id=${id}&token=${token}`;
    request.open("GET", url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", `Bearer ${token}`);
    
    request.addEventListener("load", function(){           
        if (this.status == 200) {
            console.log(JSON.parse(this.response));
            const jsonRes = JSON.parse(this.response);
            const sections = jsonRes.sections;
            let html = ""
            let i = 0;
            sections.forEach(section => {
                html +=
                `<div class="document-section-heading">
                    <div class="document-section-title">Section ${i+1}</div>
                    <img class="edit-document-section-btn" src="../images/edit-document-section-bw.svg" loading="lazy">                    
                </div>
                <textarea class="text-editor-content md-textarea" sectionID="${section}">${sectionText}</textarea>`;
                i++;
            });
            document.getElementById('document-sections-container').innerHTML = html;
            setEventListeners();
            updatePreview();
        }
        else alert('Server error. Please try again later');

    }, false);

    request.send();
}



/**
 * Send textarea text to server
 */
function updateDocumentSection(sectionID, sectionText) {
    const tokenData = JSON.parse(window.localStorage.getItem('anonymous-docs-token-data'));
    const token = tokenData.token;

    const docID = document.getElementById('filename').getAttribute('doc-id');

    const request = new XMLHttpRequest();
    const url = `/document/writesection`;
    request.open("POST", url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", `Bearer ${token}`);
    
    request.addEventListener("load", function(){           
        if (this.status == 200) {
            console.log(this.response);
        }
        else alert('Server error. Please try again later');

    }, false);

    const json = { 
        id: docID,
        sectionid: sectionID,
        sectiontext: sectionText
    };
    console.log(json);
    const data = JSON.stringify(json);
    request.send(data);
}