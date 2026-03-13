
function showLoginForm() {
    $("#login-form").dialog("open");
}

function addLogoutActions(loginAction, successRedirect) {
    var menuBtn = $("#logout-menu");
    if (menuBtn.length) {
        menuBtn.click(function(e) {
                var fd = new FormData();
                fd.append("action", "logout");

                var okHandler = function() {
                    window.location.href = successRedirect;
                };
                var errorHandler = function(message) {
                    console.log("Logout error: " + message);
                    window.location.href = successRedirect;
                };
                doLoginFormSubmit(loginAction, fd, okHandler, errorHandler);
            });
    }
}

function addLoginActions(loginAction, successRedirect) {
    var loginMenuBtn = $("#login-menu");
    if (loginMenuBtn.length) {
        var loginForm = $("#login-form");

        var loginCheckFn = function() {
            var emailElem = $("#login-email");
            var passElem = $("#login-password");
            var email = emailElem.val();
            var pass = passElem.val();
            
            var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            var emailIsValid = emailRe.test(email);
            if (!emailIsValid)
                emailElem.css({"background-color": "#E77471"});
            else 
                emailElem.css({"background-color": "#fff"});

            if (pass.length == 0)
                passElem.css({"background-color": "#E77471"});
            else 
                passElem.css({"background-color": "#fff"});

            if (pass.length && emailIsValid) {
                var fd = new FormData();
                fd.append("email", email);
                fd.append("password", pass);
                fd.append("action", "login");
                var loginHandler = function() {
                    window.location.href = successRedirect;
                    loginForm.addClass("hidden");
                };
                var errorHandler = function(message) {
                    var loginError = $("#login-error");
                    loginError.text(message);
                    var resetBtn = $("<div><button type='button' class='light'>Reset Password</button></div>");
                    loginError.parent().append(resetBtn);
                    resetBtn.click(function() {
                            var resetFd = new FormData();
                            resetFd.append("email", email);
                            resetFd.append("action", "send-reset");
                            var okHandler = function() {
                                resetBtn.hide();
                                loginError.text("A password reset email has been sent to " + email + ". Please follow the instructions in the email to reset your password.");
                            };
                            var errHandler = function() {};
                            doLoginFormSubmit(loginAction, resetFd, okHandler, errorHandler);
                        });
                };
                doLoginFormSubmit(loginAction, fd, loginHandler, errorHandler);
            }
        };


        loginForm.dialog({resizeable: false, draggable: false, autoOpen: false, height: 350, width: 500,
            buttons: { "Sign In": loginCheckFn }
        });

        loginMenuBtn.click(function(e) {
            $("#login-form").dialog("open");
        });
    }
}


function doLoginFormSubmit(formAction, formData, completionHandler, errorHandler) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", formAction, true);
    xhr.send(formData);
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4) {
            var jsonObj = false;
            try {
                jsonObj = JSON.parse(xhr.responseText);
            } catch(e) {}

            if (jsonObj && jsonObj.valid) {
                if (jsonObj.cookieInfo)
                    document.cookie = jsonObj.cookieInfo;
                completionHandler();
            } else if (jsonObj && jsonObj.message) {
                errorHandler(jsonObj.message);
            } else {
                errorHandler("");
            }
        }
    }
}


