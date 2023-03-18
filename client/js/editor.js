



window.addEventListener('load', function() {
    setEventListeners();
    getLocalStorage();
})


function setEventListeners() {
    const contentEditable = document.querySelector('#md-textarea');
    contentEditable.addEventListener('keyup', function(e) {
        setLocalStorage();
        updatePreview();
    });
    contentEditable.addEventListener('paste', function(e) {
        setLocalStorage();
        updatePreview();
    });
    contentEditable.addEventListener('input', function(e) {
        setLocalStorage();
        updatePreview();
    });
}


function updatePreview() {
    const text = document.getElementById('md-textarea').value;
    document.getElementById('md-preview').innerHTML = marked.parse(text);
}


function getLocalStorage() {
    const contentEditable = document.querySelector('#md-textarea');
    let existingData = JSON.parse(window.localStorage.getItem('anonymous-docs-text-data'));
    
    if (!existingData) {
        existingData = "";
        window.localStorage.setItem('anonymous-docs-text-data', JSON.stringify(existingData));
    }
    else {
        contentEditable.innerHTML = existingData;
        updatePreview();
    } 
}


function setLocalStorage() {
    const contentEditable = document.querySelector('#md-textarea');
    window.localStorage.setItem('anonymous-docs-text-data', JSON.stringify(contentEditable.innerHTML));
}