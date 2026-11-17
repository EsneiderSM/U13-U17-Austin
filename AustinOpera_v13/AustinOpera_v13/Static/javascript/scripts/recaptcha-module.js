
var dialog = undefined;

document.addEventListener("DOMContentLoaded", function (event) {
    //Disable the button
    var submitButton = document.querySelectorAll('[data-recaptcha-button]');
    if (submitButton.length > 0) {
        submitButton[0].disabled = true;
    }

    var guestCheckoutTextBox = document.querySelectorAll('[data-recaptcha-guest-textbox]');
    if (guestCheckoutTextBox.length > 0) {
        guestCheckoutTextBox[0].addEventListener("change", guestEmailTextBoxFunction);
    }



    var guestCheckoutButton = document.querySelectorAll('[data-recaptcha-guest-button]');
    if (guestCheckoutButton.length > 0) {
        guestCheckoutButton[0].addEventListener("click", guestCheckoutFunction);
        guestCheckoutButton[0].disabled = true;
    }

    overrideAllyShow();
});
function guestEmailTextBoxFunction() {
    if (Page_ClientValidate("vgContinueAsGuest")) {
        document.querySelectorAll('[data-recaptcha-guest-button]')[0].disabled = false;
    } else {
        document.querySelectorAll('[data-recaptcha-guest-button]')[0].disabled = true;
    }
}


function recaptchaWorks() {
    //Regsiter Page
    //SignUp Page
    var response = grecaptcha.getResponse();
    if (response.length != 0) {
        var submitButton = document.querySelectorAll('[data-recaptcha-button]');
        if (submitButton.length > 0) {
            submitButton[0].disabled = false;
        }
    }
}

function recaptchaModalWorks() {
    var response = grecaptcha.getResponse();
    if (response.length != 0) {
        document.getElementsByClassName("loadingContainer")[0].style.display = 'block';
        document.getElementById("btnContinueAsGuest").click();
    }
}

function guestCheckoutFunction(e) {
    if (Page_ClientValidate("vgContinueAsGuest")) {
        e.preventDefault();
    }
}

function overrideAllyShow() {

}


