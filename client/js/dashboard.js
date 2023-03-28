


window.addEventListener('load', function() {
    // const tokenData = JSON.parse(window.localStorage.getItem('anonymous-docs-token-data'));
    // const token = tokenData.token;

    // const request = new XMLHttpRequest();
    // const url = '/document/create';
    // request.open("POST", url, true);
    // request.setRequestHeader("Content-Type", "application/json");
    // request.setRequestHeader("Authorization", `Bearer ${token}`);
    
    // request.addEventListener("load", function(){           
    //     if (this.status == 200) {
    //         console.log(this.response);
    //     }
    //     else alert('Server error. Please try again later');

    // }, false);

    // const json = { title: 'a third document' };
    // const data = JSON.stringify(json);
    // request.send(data);


    const tokenData = JSON.parse(window.localStorage.getItem('anonymous-docs-token-data'));
    const token = tokenData.token;

    const request = new XMLHttpRequest();
    const url = '/document/viewall';
    request.open("GET", url, true);
    //request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", `Bearer ${token}`);
    
    request.addEventListener("load", function(){           
        if (this.status == 200) {
            const jsonResponse = JSON.parse(this.response);
            if (jsonResponse.success) {            
                const docs = jsonResponse.doc;

                const docsContainer = document.getElementById('uploaded-docs-content');
                let html = "";
                docs.forEach(doc => {
                    html += 
                    `<div class="document-entry" doc-name="${doc.title}" doc-id="${doc._id}">
                        <div class="filename-text">${doc.title}</div>
                    </div>`;
                    
                });
                docsContainer.innerHTML = html;

                setEventListeners();
            }
            else {
                // handle other stuff
            }
            console.log(this.response);
        }
        else alert('Server error. Please try again later');

    }, false);

    request.send();
})


function setEventListeners() {

    const docs = Array.from(document.querySelectorAll('.document-entry'));
    const tokenData = JSON.parse(window.localStorage.getItem('anonymous-docs-token-data'));
    const token = tokenData.token;

    docs.forEach(doc => {
        doc.addEventListener('dblclick', function() {
            const form = document.getElementById('doc-form');
            document.getElementById('doc-name-input').value = doc.getAttribute('doc-name');
            document.getElementById('doc-id-input').value = doc.getAttribute('doc-id');
            document.getElementById('token-input').value = token;
            form.submit();
        })
    })


}