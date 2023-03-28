
window.addEventListener('load', function() {

    // verify login after btn press
    document.getElementById('login-btn').addEventListener('click', function() {
    
        const user = document.getElementById('username-input').value;
        const pass = document.getElementById('password-input').value;
        const json = {
            "username": user,
            "password": pass
        }
    
        const request = new XMLHttpRequest();
        const url = '/user/login';
        request.open("POST", url, true);
        request.setRequestHeader("Content-Type", "application/json");
        
        request.addEventListener("load", function(){           
            if (this.status == 200) {
                const resJson = JSON.parse(this.responseText);
                console.log(resJson);

                // valid credentials
                if (resJson && resJson.success) {                    
                    let tokenData = JSON.parse(window.localStorage.getItem('anonymous-docs-token-data'));
                    
                    if (!tokenData) {
                        tokenData = {
                            user: resJson.user.username,
                            token: resJson.token,
                            user_id: resJson.user._id
                        }
                    }
                    else {
                        tokenData.user = resJson.user.username;
                        tokenData.token = resJson.token;
                        tokenData.user_id = resJson.user._id;
                    }

                    // set new token in localStorage
                    window.localStorage.setItem('anonymous-docs-token-data', JSON.stringify(tokenData));
                    //redirectToDashboard(tokenData.user, tokenData.token);
                    window.location.href = 'http://localhost:8080/dashboard';
                }
                // invalid credentials
                else if (resJson && !resJson.success) {
                    document.getElementById('response-msg-div').innerHTML = `Error: ${resJson.error}`;
                    document.getElementById('response-msg-div').style.display = 'flex';
                }                
            }
            else alert('Server error. Please try again later');
    
        }, false);
    
        const data = JSON.stringify(json);
        request.send(data);
    });
});


function redirectToDashboard(user, token) {
    // req.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pass)); 

    const request = new XMLHttpRequest();
    const url = '/dashboard';
    request.open("GET", url, true);
    //request.setRequestHeader("Content-Type", "application/json");
    request.setRequestHeader("Authorization", `Bearer ${token}`);
    
    request.addEventListener("load", function(){           
        if (this.status == 200) {
            console.log(this.response);
        }
        else alert('Server error. Please try again later');

    }, false);

    //const data = JSON.stringify(json);
    request.send();
}