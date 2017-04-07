
var originalDoLayout = View.doLayout;

/**
 * Override the View.dolayout() method to suppress custom scroll bars if the page runs on an Android or iOS device.
 */
View.doLayout = function() {
    if (View.hasNativeScroller()) {
        View.preferences.useScroller = false;

        originalDoLayout.call(View);

        $('login_panel').style.background = 'transparent';
        $('login_panel').parentNode.style.background = 'transparent';
        $('login_panel').parentNode.parentNode.style.background = 'transparent';
        $('login_panel').parentNode.parentNode.parentNode.style.background = 'transparent';
        $('loginContainer').style.zIndex = -1;
    } else {
        originalDoLayout.call(View);
    }
}

/**
 * Login form controller for handling username/password.
 */
var loginUserController = View.createController('loginUser', {

    GUEST_USERNAME: 'GUEST',
    GUEST_PASSWORD: '',

    // selected project
    projectInput: null,
    currentProjectId: null,
    currentProjectName: null,

    // username and password input references
    usernameInput: null,
    passwordInput: null,
    signinButton: null,
    guestButton: null,
    sendPasswordLink: null,
    rememberUserCheckbox: null,
    evalLicenseWrapper: null,
    evalLicenseElement: null,

    isUsernameUppercase: false,
    isPasswordUppercase: false,

    events: {
        'mouseenter #username_input': function() {
            Ext.get('username_label').dom.style.visibility = 'visible';
        },
        'mouseleave #username_input': function() {
            Ext.get('username_label').dom.style.visibility = 'hidden';
        },
        'focus #username_input': function() {
            Ext.get('username_label').dom.style.visibility = 'visible';
        },
        'blur #username_input': function() {
            Ext.get('username_label').dom.style.visibility = 'hidden';
        },
        'mouseenter #password_input': function() {
            Ext.get('password_label').dom.style.visibility = 'visible';
        },
        'mouseleave #password_input': function() {
            Ext.get('password_label').dom.style.visibility = 'hidden';
        },
        'focus #password_input': function() {
            Ext.get('password_label').dom.style.visibility = 'visible';
        },
        'blur #password_input': function() {
            Ext.get('password_label').dom.style.visibility = 'hidden';
        }
    },

    /**
     * Initializes the controller properties and adds event listsners to UI elements.
     */
    afterViewLoad: function() {
        this.GUEST_USERNAME = View.preferences.guestUserId;

        $('project_label').innerHTML = getMessage('project_label_text');

        // get project list from the server
        SecurityService.getProjects({
            callback: this.onGetProjects.createDelegate(this),
            errorHandler: function(m, e) {
                Ab.view.View.showException(e);
            }
        });

        this.projectInput = Ext.get('project_input');
        this.usernameInput = Ext.get('username_input');
        this.passwordInput = Ext.get('password_input');
        this.signinButton = Ext.get('signin_button');
        this.guestButton = Ext.get('guest_button');
        this.sendPasswordLink = Ext.get('lost_password_y_button');
        this.rememberUserCheckbox = Ext.get('remember_username');
        this.evalLicenseElement = Ext.get('evaluation_license_label');
        this.evalLicenseWrapper = Ext.get('evaluation_license_wrapper');

        // get previously used user name stored as a cookie and stick it into the input field
        var storedUsername = getCookie("afm_user_id_per_computer");
        if (valueExists(storedUsername)) {
            this.usernameInput.dom.value = storedUsername;
            this.rememberUserCheckbox.dom.checked = 1;
        }

        // focus on user name or passowrd
        if (this.usernameInput.dom.value == '') {
            this.usernameInput.focus();
        }
        else
        if (this.passwordInput.dom.value == '') {
            this.passwordInput.focus();
        }

        this.signinButton.on('click', this.onLogin.createDelegate(this));
        this.guestButton.on('click', this.onGuestLogin.createDelegate(this));
        this.sendPasswordLink.on('click', this.onSendPassword.createDelegate(this));

        new Ext.KeyMap(this.usernameInput, {
            key: Ext.EventObject.ENTER,
            handler: this.onLogin,
            scope: this
        });
        new Ext.KeyMap(this.passwordInput, {
            key: Ext.EventObject.ENTER,
            handler: this.onLogin,
            scope: this
        });
        new Ext.KeyMap(this.signinButton, {
            key: Ext.EventObject.ENTER,
            handler: this.onLogin,
            scope: this
        });
        new Ext.KeyMap(this.guestButton, {
            key: Ext.EventObject.ENTER,
            handler: this.onGuestLogin,
            scope: this
        });

        this.getEvaluationInfo();
    },

    /**
     * Displays the project list received from the server.
     * @param {Object} projects
     */
    onGetProjects: function(projects) {
        var addOption = function(select, value, title) {
            var newOption = document.createElement('option');
            newOption.value = value;
            newOption.appendChild(document.createTextNode(title));
            select.appendChild(newOption);
        };

        var openProjects = [];
        for (var i = 0; i < projects.length; i++) {
            var project = projects[i];
            if (project.open) {
                openProjects.push(project);
            }
        }

        if (openProjects.length > 0) {
            this.currentProjectId = openProjects[0].id;
            this.currentProjectName = openProjects[0].title;
        }

        if (openProjects.length > 1) {
            this.projectInput.on('change', this.selectProject.createDelegate(this));
            for (var i = 0; i < openProjects.length; i++) {
                var project = openProjects[i];
                addOption(this.projectInput, project.id, project.title);
            }
        } else if (openProjects.length == 1) {
            addOption(this.projectInput, this.currentProjectId, this.currentProjectName);
            this.projectInput.dom.disabled = true;
        }

        this.updateUsernamePasswordCaseSensitivity();
    },

    /**
     * Select listener for Project combobox.
     */
    selectProject: function(e, option) {
        var projectId = option.value;
        if (projectId != this.currentProjectId) {
            this.currentProjectId = projectId;
            this.updateUsernamePasswordCaseSensitivity();

            // KB 3026202: when user changes project, the username and password controls should be cleared
            this.clearUsernameAndPassword();
        }
    },

    /**
     * Gets the user name and password case sensitivity for the selected project from the server.
     */
    updateUsernamePasswordCaseSensitivity: function() {
        var controller = this;

        // get the user name case sensitivity
        SecurityService.isUsernameUppercase(controller.currentProjectId, {
            callback: function(isUsernameUppercase) {
                // get the password case sensitivity
                SecurityService.isPasswordUppercase(controller.currentProjectId, {
                    callback: function(isPasswordUppercase) {
                        // call the User controller to set the values and update the UI
                        controller.setUsernamePasswordCaseSensitivity(
                            isUsernameUppercase, isPasswordUppercase);
                    },
                    errorHandler: function(m, e) {
                        View.showException(e);
                    }
                });
            },
            errorHandler: function(m, e) {
                View.showException(e);
            }
        });
    },

    /**
     *
     */
    onLogin: function(){
        handleUsername();
        handlePassword();

        var username = this.usernameInput.dom.value;
        var password = this.passwordInput.dom.value;
        var locale = View.controllers.get('signInLocale').currentLocale;
        var projectId = this.currentProjectId;

        if (username == '' || username.toLowerCase() == 'username') {
            View.showMessage('error', getMessage('error_username_empty'));
            this.usernameInput.focus();
            return;
        }
        if (password == '' || password.toLowerCase() == 'password') {
            View.showMessage('error', getMessage('error_password_empty'));
            this.passwordInput.focus();
            return;
        }

        // KB 3029702: prevent the user from clicking on the Sign In button more than once
        this.signinButton.dom.disabled = true;

        // set or clear cookies
        this.setCookies(username, locale, this.rememberUserCheckbox.dom.checked);

        var cultureInfo = this.getCultureInfo(locale);

        //  the name of the view to be loaded is returned (to the callback) by the SecurityService.login()
        var controller = this;
        SecurityService.login(doSecure(username), doSecure(password), projectId, cultureInfo, {
            callback: function(viewName) {
                window.location.replace(viewName);
            },
            errorHandler: function(m, e) {
                // re-enable the Sign In button
                controller.signinButton.dom.disabled = false;

                if (e.errorNumber == 20) {
                    controller.handlePasswordExpired(username, projectId);
                } else if (e.message == Workflow.ERROR_SCRIPT_SESSION) {
                    Workflow.handleSessionTimeout(View.logoutView);
                } else {
                    View.showException(e, m);
                }
            }
        });
    },

    getCultureInfo: function(locale){
        if (View.cultureInfos){
            for (var key in View.cultureInfos){
                if (key===locale){
                    return View.cultureInfos[key].cultureInfo;
                }
            }
        }
        return null;
    },

    onGuestLogin: function(){
        var username = this.GUEST_USERNAME;
        var password = this.GUEST_PASSWORD;
        var projectId = this.currentProjectId;

        // set or clear cookies
        var locale = View.controllers.get('signInLocale').currentLocale;
        this.setCookies(username, locale, this.rememberUserCheckbox.dom.checked);

        SecurityService.login(doSecure(username), doSecure(password), projectId, null, {
            callback: function(viewName){
                window.location.replace(viewName);
            },
            errorHandler: function(m, e) {
                if (e.message == Workflow.ERROR_SCRIPT_SESSION) {
                    Workflow.handleSessionTimeout(View.logoutView);
                } else {
                    View.showException(e, m);
                }
            }
        });
    },

    onSendPassword: function(){
        var username = this.usernameInput.dom.value;
        var projectId = this.currentProjectId;

        if (username == '' || username.toLowerCase() == 'username') {
            View.showMessage('message', getMessage('error_username_empty'));
            this.usernameInput.focus();
            return;
        }

        SecurityService.requestNewPassword(doSecure(username), projectId, {
            callback: function() {
                View.showMessage('message', getMessage('password_email_sent'));
            },
            errorHandler: function(m, e){
                if (e.message == Workflow.ERROR_SCRIPT_SESSION) {
                    Workflow.handleSessionTimeout(View.logoutView);
                } else {
                    View.showException(e, m);
                }
            }
        });
    },

    // ----------------------- helper methods ----------------------------------------------------

    setCookies: function(username, locale, store){
        if (store) {
            // set the username cookie to expire in one year
            var today = new Date();
            var expires = new Date();
            expires.setTime(today.getTime() + 1000 * 60 * 60 * 24 * 365);
            setCookie('afm_user_id_per_computer', username, expires);
            setCookie('afm_user_language_per_computer', locale, expires);
        }
        else {
            // clear the username cookie
            setCookie('afm_user_id_per_computer', '', null);
            setCookie('afm_user_language_per_computer', '', null);
        }
    },

    handlePasswordExpired: function(username, projectId){
        // show change password form
        var callback = this.afterPasswordChanged.createDelegate(this);
        var dialog = View.openDialog('ab-change-password.axvw', null, false, {
            closeButton: false,
            maximize: false,

            afterViewLoad: function(dialogView){
                var changePasswordController = dialogView.controllers.get('ab-change-password');
                changePasswordController.username = username;
                changePasswordController.projectId = projectId;

                // set the dialog controller afterPasswordChanged callback
                changePasswordController.afterPasswordChanged = callback;
            }
        });
    },

    afterPasswordChanged: function(username, newPassword, projectId){
        // login
        SecurityService.login(doSecure(username), doSecure(newPassword), projectId, null, {
            callback: function(viewName){
                // show next view
                View.getOpenerWindow().location.replace(viewName);
            },
            errorHandler: function(m, e){
                // show error message
                if (e.message == Workflow.ERROR_SCRIPT_SESSION) {
                    Workflow.handleSessionTimeout(View.logoutView);
                } else {
                    View.showException(e, m);
                }
            }
        });
    },

    getEvaluationInfo: function (){
        var controller = this;
        AdminService.getEvaluationInfo({
            callback: function(evaluationVO){
                if (evaluationVO.daysLeft == -1) {
                    controller.evalLicenseElement.dom.style.visibility = 'hidden';
                }
                else if (evaluationVO.daysLeft != null) {
                    var msg = controller.evalLicenseElement.dom.innerHTML;
                    controller.evalLicenseElement.dom.innerHTML = msg.replace('{0}', evaluationVO.daysLeft);
                }
            }
        });
    },

    clearUsernameAndPassword: function() {
        $('username_input').value = '';
        $('password_input').value = '';
    },

    /**
     * Sets the user name/password case sensitivity.
     */
    setUsernamePasswordCaseSensitivity: function(isUsernameUppercase, isPasswordUppercase) {
        this.isUsernameUppercase = isUsernameUppercase;
        this.isPasswordUppercase = isPasswordUppercase;

        this.localizeUsernamePasswordLabels();

        // convert already entered field values to upper case, if required
        handleUsername();
        handlePassword();

        // set the field CSS style to show entered text as upper case, if required
        $('username_input').style.textTransform = (isUsernameUppercase ? 'uppercase' : '');
        $('password_input').style.textTransform = (isPasswordUppercase ? 'uppercase' : '');
    },

    /**
     * Localizes user name and password labels.
     */
    localizeUsernamePasswordLabels: function() {
        var localeController = View.controllers.get('signInLocale');

        var usernameMessage = 'username_label_text' + (this.isUsernameUppercase ? '_insensitive' : '');
        var passwordMessage = 'password_label_text' + (this.isPasswordUppercase ? '_insensitive' : '');

        localeController.localizeUsernamePasswordLabels(usernameMessage, passwordMessage);
    }
});

/**
 * Called from the User Name input field.
 */
function handleUsername() {
    var userController = View.controllers.get('loginUser');
    if (userController.isUsernameUppercase) {
        var input = $('username_input');
        input.value = input.value.toUpperCase();
    }
}

/**
 * Called from the User Name input field.
 */
function handlePassword() {
    var userController = View.controllers.get('loginUser');
    if (userController.isPasswordUppercase) {
        var input = $('password_input');
        input.value = input.value.toUpperCase();
    }
}

function showBlock(id) {
    var block = Ext.get(id);
    if (block) {
        var box = {
            x: block.getX(),
            y: block.getY(),
            width: block.getWidth(),
            height: block.getHeight()
        };
        View.ensureInViewport(box);
        block.setX(box.x);
        block.setY(box.y);
        block.dom.style.visibility = 'visible';
    }
}

function hideBlock (id) {
    var block = Ext.get(id);
    if (block) {
        block.dom.style.visibility = 'hidden';
    }
}
