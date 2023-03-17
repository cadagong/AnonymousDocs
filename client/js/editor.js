



window.addEventListener('load', function() {
    setEventListeners();
    getLocalStorage();
})


function setEventListeners() {
    const contentEditable = document.querySelector('#contenteditable');
    contentEditable.addEventListener('keyup', function(e) {
        setLocalStorage();
    });
    contentEditable.addEventListener('paste', function(e) {
        setLocalStorage();
    });
    contentEditable.addEventListener('input', function(e) {
        setLocalStorage();
    });
}

function getLocalStorage() {
    const contentEditable = document.querySelector('#contenteditable');
    let existingData = JSON.parse(window.localStorage.getItem('anonymous-docs-text-data'));
    
    if (!existingData) {
        existingData = "";
        window.localStorage.setItem('anonymous-docs-text-data', JSON.stringify(existingData));
    }
    else {
        contentEditable.innerHTML = existingData;
    } 
}


function setLocalStorage() {
    const contentEditable = document.querySelector('#contenteditable');
    window.localStorage.setItem('anonymous-docs-text-data', JSON.stringify(contentEditable.innerHTML));
}