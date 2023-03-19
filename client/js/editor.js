
const IMAGES_PATH = '../images';


/**
 * On window load, focus text area, set event listeners, 
 * and retrieve textarea text from localStorage.
 */
window.addEventListener('load', function() {
    setEventListeners();
    getLocalStorage();

    const textArea = document.getElementById('md-textarea');
    textArea.focus();
})


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
    const textArea = document.getElementById('md-textarea');
    textArea.addEventListener('input', function(e) {
        setLocalStorage();
        updatePreview();
    });

    // navbar btns listeners
    const btnNames = ['download', 'share', 'chat'];
    btnNames.forEach((btnName) => {
        const btn = document.getElementById(`${btnName}-btn`);
        btn.addEventListener('mouseover', function() {
            btn.src = `${IMAGES_PATH}/${btnName}-colour.svg`;
        });
        btn.addEventListener('mouseout', function() {
            btn.src = `${IMAGES_PATH}/${btnName}-bw.svg`;
        });

        switch(btnName) {
            case "download":
                btn.addEventListener('click', function() {
                    download(document.getElementById('md-textarea').value)
                })
                break;

        }
    })
}


/**
 * Update the markdown preview to display latest changes in textarea
 */
function updatePreview() {
    const text = document.getElementById('md-textarea').value;
    document.getElementById('md-preview').innerHTML = marked.parse(text);
}


/**
 * Get saved textarea text from localStorage
 */
function getLocalStorage() {
    const textArea = document.querySelector('#md-textarea');
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
    const textArea = document.querySelector('#md-textarea');
    window.localStorage.setItem('anonymous-docs-text-data', JSON.stringify(textArea.value));
}