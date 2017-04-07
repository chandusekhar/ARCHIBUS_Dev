/**
 * My Profile Controller 
 * Utilizing the locale controller provided by ab-view-locale.js 'viewLocaleController'
 * requires sharing of varibales due to delegation of the locale control listener
 *
 */
var controller = View.createController('myProfileController', {
	// controller providing localization functionality for the locale select control in the form
	localeController: null,

	// reference to the select input
	localeSelector: null,

	// function called by the delegate
	proofLocale: null,

    // selected locale
    currentLocale: 'en_US',
    
	// key3 of the localization lang file - actually the locale title
    localeKeys: null,

	// if this locale is selected, login page controls do not have to be localized
    // DEFAULT_LOCALE: 'en_US',
	
	/**
	 * After view loads set up the top panel's localized labels and profile values
	 * Set up the listener -- and localize the values -- for the locale select control in the form
	 */
	afterViewLoad: function() {
        if (!View.getOpenerView() || View.getOpenerView().viewName === this.view.viewName) {
            View.panels.get('preferencesForm').actions.get('close').show(false);
        }

	    // set up the top panel label and user values
		var employeeNameElem = document.getElementById("employeeName");
		empNameText = getMessage('employee');
		employeeNameElem.innerHTML = empNameText;

		var locationElem = document.getElementById("locationTitle");
		locText = getMessage('location');
		locationElem.innerHTML = locText;
			

		var divisionElem = document.getElementById("divisionTitle");
		divText = getMessage('division');
		divisionElem.innerHTML = divText;

		var deptElem = document.getElementById("departmentTitle");
		deptText = getMessage('department');
		deptElem.innerHTML = deptText;

		var employeeNumberElem = document.getElementById("employeeNumber");
		empNumText = getMessage('employee_number');
		employeeNumberElem.innerHTML = empNumText;

		var instrElem = document.getElementById("instruction");
		if (instrElem != null) {
			instrElem.className = 'formMessage';
			instrText = getMessage('logout_message');
			instrElem.innerHTML = instrText
		}
		
		var currentUser = View.user;
		if (currentUser != null) {
			employeeNameElem.innerHTML = employeeNameElem.innerHTML + ': ' + currentUser.name;

			var empLocation = currentUser.employee.space.buildingId;
			if (currentUser.employee.space.buildingId.length > 0) {
				empLocation += '-';
			}
			empLocation += currentUser.employee.space.floorId;
			if (currentUser.employee.space.floorId.length > 0) {
				empLocation += '-';
			}
			empLocation += currentUser.employee.space.roomId;
			locationElem.innerHTML = locationElem.innerHTML + ': ' + empLocation;

			divisionElem.innerHTML = divisionElem.innerHTML + ': ' + currentUser.employee.organization.divisionId;
			deptElem.innerHTML = deptElem.innerHTML + ': ' + currentUser.employee.organization.departmentId;
			employeeNumberElem.innerHTML = employeeNumberElem.innerHTML + ': ' + currentUser.employee.number;
		}
		
		// get the locale controller from the view
		this.localeController = View.controllers.get('viewLocaleController');
		// assign the select control to a listener that calls the other controller to localize the control's values
        this.localeSelector = Ext.get('preferencesForm_afm_users.locale');
		this.localeSelector.on('change', this.selectUserLocale.createDelegate(this));

		// set local vars in this when needed by delegate
		this.proofLocale = this.localeController.proofLocale;
		this.localeKeys = this.localeController.localeKeys;
		
		// KB 3026680: disable Change Password button in preauth mode
		SmartClientConfigService.getSsoMode({
	        callback: this.setSsoMode.createDelegate(this),
	        errorHandler: function(m, e) {
	            View.showException(e);
	        }
	    });
	    
	    this.currentLocale = Ab.view.View.user.locale;

		// get locale list from the server
	    SecurityService.getLocales(this.currentLocale, {
	        callback: this.localeController.onGetLocales.createDelegate(this),
	        errorHandler: function(m, e) {
	            Ab.view.View.showException(e);
	        }
	    });
	},    
	
	/**
	 * Disables the Change Password button if the server runs in SSO mode.
	 * 1. Invoke SmartClientConfigService.getSsoMode();
     * 2. Decode the returned string.
     * 3. If the value contains "preauth" or "ldap", than we are in SSO mode: disable the button.
	 */
	setSsoMode: function(ssoMode) {
        if (ssoMode) {
            var ssoModeUnsecured = doUnsecure(ssoMode);
            if (ssoModeUnsecured.indexOf('preauth') != -1 || ssoModeUnsecured.indexOf('ldap') != -1) {
                var changePasswordAction = this.preferencesForm.actions.get(1);
                if (changePasswordAction) {
                    changePasswordAction.button.el.dom.style.display = 'none';
                }
            }
        }
	},

	/**
	 * Select listener for the Locale combobox.
	 */
	selectUserLocale: function(e, option) {
		var op = option;
		var localeId = option.value;
	    if (localeId != this.localeController.currentLocale) {
            this.localeController.currentLocale = localeId;
            
            var cultureInfo = View.cultureInfos[localeId];
            if (valueExists(cultureInfo)) {
            	this.preferencesForm.setFieldValue('vf_ctry_id', cultureInfo.country);
            	this.preferencesForm.setFieldValue('vf_currency_id', cultureInfo.currency);
            }
		}

		// localize the control's values
        this.localeController.localizeLocaleNames(this);
	},

    preferencesForm_onSave: function() {
		var canSave = this.preferencesForm.save();
		if(canSave){
			var instructionElem = Ext.get('instruction');
            if (instructionElem) {
                var message = getMessage('logout_message');
                instructionElem.innerHTML = message;
                instructionElem.setVisible(true, {duration: 1});
                instructionElem.setHeight(20, {duration: 1});
                this.dismissMessage.defer(3000, this, [instructionElem]);
            }
			
			this.setCookie();
		}
	},

	setCookie: function() {
		// set cookie
		afm_user_language = this.localeSelector.dom.value;
		
		// set up cookies
		var today = new Date();
		var expires = new Date();
		
		// expire cookies in one year?
		expires.setTime(today.getTime() + 1000 * 60 * 60 * 24 * 365);
		setCookie("afm_user_language_per_computer", afm_user_language, expires);
	},
	
	dismissMessage: function(messageElement) {
		messageElement.setHeight(1, {duration: 1});
		messageElement.setVisible(false, {duration: 0.25});	
	},

    preferencesForm_onChangePassword: function() {
        // show change password form
        var dialog = View.openDialog('ab-change-password.axvw', null, false, {
            width: 450,
            height: 200,
            closeButton: false,
            title: getMessage('Change_password'),

            afterViewLoad: function(dialogView) {
                var changePasswordController = dialogView.controllers.get('ab-change-password');
                changePasswordController.username = View.user.name;
                // user is authenticated, do not supply projectId
                changePasswordController.projectId = null;
            }
        });
    }
});

