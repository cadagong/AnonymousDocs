
const IMAGES_PATH = '../images';


window.addEventListener('load', function() {
    const textArea = document.getElementById('md-textarea');
    textArea.focus();

    setEventListeners();
    getLocalStorage();
})


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
        const downloadBtn = document.getElementById(`${btnName}-btn`);
        downloadBtn.addEventListener('mouseover', function() {
            downloadBtn.src = `${IMAGES_PATH}/${btnName}-colour.svg`;
        });
        downloadBtn.addEventListener('mouseout', function() {
            downloadBtn.src = `${IMAGES_PATH}/${btnName}-bw.svg`;
        });
    })
}


function updatePreview() {
    const text = document.getElementById('md-textarea').value;
    document.getElementById('md-preview').innerHTML = marked.parse(text);
}


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


function setLocalStorage() {
    const textArea = document.querySelector('#md-textarea');
    window.localStorage.setItem('anonymous-docs-text-data', JSON.stringify(textArea.value));
}