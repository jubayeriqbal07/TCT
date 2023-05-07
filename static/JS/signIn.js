var form = document.getElementById("signInForm");

function submitForm(event) {
    email = document.getElementsByName("usr_email")[0].value;
    pass = document.getElementsByName("usr_pass")[0].value;
    if(email == "" || pass == ""){
        event.preventDefault();
    }
}

form.addEventListener('submit', submitForm);