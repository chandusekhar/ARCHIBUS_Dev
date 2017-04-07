
/**
 * Login form controller for handling username/password.
 */
var loginUserController = View.createController('loginUser', {

    GUEST_USERNAME: 'GUEST',
    GUEST_PASSWORD: '',
    
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

    afterViewLoad: function() {
	    this.GUEST_USERNAME = View.preferences.guestUserId;
	
        this.usernameInput = Ext.get('username_input');
        this.passwordInput = Ext.get('password_input');
        this.signinButton = Ext.get('signin_button');
        this.guestButton = Ext.get('guest_button');
        this.sendPasswordLink = Ext.get('send_password_control');
        this.rememberUserCheckbox = Ext.get('remember_username');
        this.evalLicenseElement = Ext.get('evaluation_license_message');
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
    
    onLogin: function(){
    	handleUsername();
    	handlePassword();
    	
        var username = this.usernameInput.dom.value;
        var password = this.passwordInput.dom.value;
        var locale = View.controllers.get('loginLocale').currentLocale;
        var projectId = View.controllers.get('loginProject').currentProjectId;
        
        if (username == '') {
            View.showMessage('error', getMessage('error_username_empty'));
            this.usernameInput.focus();
            return;
        }
        if (password == '') {
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
        var projectId = View.controllers.get('loginProject').currentProjectId;
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
        var projectId = View.controllers.get('loginProject').currentProjectId;
        
        if (username == '') {
            View.showMessage('message', getMessage('error_username_empty'));
            this.usernameInput.focus();
            return;
        }

		// confirmation dialog before requestPasswd
		View.confirm(getMessage('password_email_request'), function(button) {
			if (button == 'yes') {
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
					controller.evalLicenseWrapper.dom.style.visibility = 'hidden';
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
		var localeController = View.controllers.get('loginLocale');
		
		var usernameMessage = 'username_label_text' + (this.isUsernameUppercase ? '_insensitive' : '');
		var passwordMessage = 'password_label_text' + (this.isPasswordUppercase ? '_insensitive' : '');
		
		localeController.localizeUsernamePasswordLabels(usernameMessage, passwordMessage);
		
	}
});

// ---- turn on the login controls - avoids early focus before page fully loaded ----
	document.getElementById("login_form").style.display = 'block';

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