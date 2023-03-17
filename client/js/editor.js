window.addEventListener('load', function() {
    
    const contentEditable = document.querySelector('#contenteditable');

    contentEditable.addEventListener('keyup', function(e) {
        console.log('keyuped');
    })

    contentEditable.addEventListener('paste', function(e) {
        console.log('pasted');
    })

    contentEditable.addEventListener('input', function(e) {
        console.log('inputed');
    })
    //contentEditable.click();
})