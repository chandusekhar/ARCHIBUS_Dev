
/**
 * Login form controller for selecting user locale.
 */
var loginLocaleController = View.createController('signInLocale', {
	
    // selected locale
    currentLocale: 'en_US',
    
    // if this locale is selected, login page controls do not have to be localized 
    DEFAULT_LOCALE: 'en_US',
	
    // the list of locale objects (id, title) with locale titles in en_US; retrieved this on load
    initialLocales: null,

    // the list of locale titles in en_US; retrieved this on load
    localeKeys: null,
    
	// constants for constructing localization parameters
	viewName: "/ab-system/system-administration/login.axvw",
	key2_t: "title",
	key2_m: "message",
	key2_lm: "localeMessage",
	transPrefix: false,

    /**
     * Maps DOM events to controller methods.
     */
    events: {
        "click #localizeLink": function() {
            showBlock('changeLocaleCallout');
            hideBlock('lostPasswordCallout');
        },
        "click #changeLocaleCallout a.localizeLink": function(e) {
            hideBlock('changeLocaleCallout');
            this.selectUserLocale(e.currentTarget.id);
        },
        "click #changeLocaleCallout a.closeX": function() {
            hideBlock('changeLocaleCallout');
        }
    },

    /**
     * Initializes the controller objects.
     */	
	afterViewLoad: function() {
        this.initializeControlMap();

		// get locale list from the server
	    SecurityService.getLocales(null, {
	        callback: this.onGetLocales.createDelegate(this),
	        errorHandler: function(m, e) {
	            Ab.view.View.showException(e);
	        }
	    });
	},

	/**
	 * Displays the locale list received from the server.
	 * @param {Object} locales
	 */
	onGetLocales: function(locales) {
        locales = _.sortBy(locales, 'id');

        this.initialLocales = [];
        this.localeKeys = [];

        for (var i = 0; i < locales.length; i++) {
            var locale = this.proofLocale(locales[i]);
            
            this.initialLocales.push({
                key: locale.id,
                value: locale.title
            });
            
            this.localeKeys.push(locale.title);
        }

        this.updateLocaleItems(locales);

        var afm_user_language = getCookie("afm_user_language_per_computer");
        if (afm_user_language == null) {
            afm_user_language = this.currentLocale;

            // set up cookies
            var today = new Date();
            var expires = new Date();

            // expire cookies in one year?
            expires.setTime(today.getTime() + 1000 * 60 * 60 * 24 * 365);
            setCookie("afm_user_language_per_computer", afm_user_language, expires);
        }

        var userLocale = this.findEnabledLocale(afm_user_language);
        this.selectUserLocale(userLocale.key);
	},
	
	/**
	 * Returns the enabled locale by key. If specified locale is not enabled on the server, returns the first enabled locale.  
	 */
	findEnabledLocale: function(localeKey) {
        var userLocale = _.find(this.initialLocales, function(locale) {
            return locale.key === localeKey;
        });

        if (!userLocale) {
            userLocale = this.initialLocales[0];
        }
		
        return userLocale;
	},
    
	/**
	 * Select listener for Sign-In Page Language combobox.
	 */
	selectUserLocale: function(localeId) {
	    if (localeId != this.currentLocale) {
            this.currentLocale = localeId;
		}

        this.updateLocaleLink(localeId);

	    this.localizeControls(this.controlMap, this.localizationParams);
        this.localizeLocaleNames();

        var userController = View.controllers.get('loginUser');
        userController.localizeUsernamePasswordLabels();
	},

    /**
     * Updates HTML for the locale link.
     * @param localeId
     */
    updateLocaleLink: function(localeId) {
        Ext.DomHelper.overwrite(Ext.get('localizeLink').dom, this.createLocaleItem(localeId, 'localizeLink', false));
    },

    /**
     * Updates HTML for all locale items.
     */
    updateLocaleItems: function(locales) {
        var localeItems = '';
        for (var i = 0; i < locales.length; i++) {
            var locale = this.proofLocale(locales[i]);
            localeItems += this.createLocaleItem(locale.id, locale.id, true);
        }
        Ext.DomHelper.insertHtml('afterBegin', Ext.get('localeList').dom, localeItems);
    },

    /**
     * Creates HTML for specified locale item.
     * @param localeId
     * @param elementId
     * @return {--null-string--}
     */
    createLocaleItem: function(localeId, elementId, createLink) {
        var locale = _.find(this.initialLocales, function(locale) {
            return locale.key === localeId;
        });
        var template = createLink ?
            _.template(
                '<a class="localizeLink" id="{{elementId}}">' +
                '<img class="localizeFlag" src="/archibus/schema/ab-core/graphics/icons/flags/{{countryId}}.png">' +
                '<span>{{title}}</span>' +
                '</a>')
            :
            _.template(
                '<img class="localizeFlag" src="/archibus/schema/ab-core/graphics/icons/flags/{{countryId}}.png">' +
                '<span>{{title}}</span>');
        return template({
            elementId: elementId,
            countryId: localeId.substr(localeId.length - 2, 2),
            title: locale.value
        });
    },

    /**
	 * Edit the provided local language titles to fit the key expected by the lang file
	 * e.g., the title "Spanish (Spain)" is truncated to "Spanish".
	 */
	proofLocale: function(locale){
	  /*  if (locale.title.indexOf("German") == 0 && locale.title.indexOf("(") > 1) {
	        locale.title = locale.title.substring(0, locale.title.indexOf("(") - 1);
	    } else if (locale.title.indexOf("Spanish") == 0 && locale.title.indexOf("(") > 1) {
	        locale.title = locale.title.substring(0, locale.title.indexOf("(") - 1);
	    }*/
	    return locale;
	},
    
    /**
     * Initialize two data structures for assisting localization
     *
     * controlMap relates the localization key3 (English message text) to the UI control itself
     * localizationParams are the input params to the localization service
     *
     * the controlMap is all that's needed to change to en_US
     *
     * for other langs the service returns a map from localizationParam to localized string
     *  & the two data structures hold all info needed for the translation function.
     */
    initializeControlMap: function() {
        this.controlMap = [];
        this.addControl(this.controlMap, 'language_label');
        this.addControl(this.controlMap, 'project_label');
        this.addControl(this.controlMap, 'signin_button');
        this.addControl(this.controlMap, 'send_password_control');
        this.addControl(this.controlMap, 'password_email_request');
        this.addControl(this.controlMap, 'remember_message');
        this.addControl(this.controlMap, 'lost_password_y_button');
        this.addControl(this.controlMap, 'lost_password_n_button');

        this.addControl(this.controlMap, 'evaluation_license_label');
        this.addControl(this.controlMap, 'guest_button');
        this.addControl(this.controlMap, 'language_label');
        
        this.localizationParams = [];
        this.addParam(this.localizationParams, this.key2_m, 'project_label_text');
        this.addParam(this.localizationParams, this.key2_t, 'signin_button_text');
        this.addParam(this.localizationParams, this.key2_m, 'send_password_control_text');
        this.addParam(this.localizationParams, this.key2_m, 'remember_message_text');
        this.addParam(this.localizationParams, this.key2_m, 'lost_password_y_button_text');
        this.addParam(this.localizationParams, this.key2_m, 'lost_password_n_button_text');
        this.addParam(this.localizationParams, this.key2_m, 'evaluation_license_label_text');
        this.addParam(this.localizationParams, this.key2_m, 'guest_button_text');
        
        this.addParam(this.localizationParams, this.key2_m, 'password_email_request_text');
        this.addParam(this.localizationParams, this.key2_m, 'error_username_empty');
        this.addParam(this.localizationParams, this.key2_m, 'error_password_empty');
        this.addParam(this.localizationParams, this.key2_m, 'language_label_text');
    },
    
    addControl: function(controlMap, controlId, messageName) {
    	if (!valueExists(messageName)) {
    		messageName = controlId + '_text';
    	}
        controlMap.push({
            key: getMessage(messageName),
            control: Ext.get(controlId)
        });
    },
    
    addParam: function(localizationParams, key2, messageName) {
        localizationParams.push({
            key1: this.viewName,
            key2: key2,
            key3: getMessage(messageName),
            locale: this.currentLocale,
            translatablePrefix: this.transPrefix
        });
    },
    
    localizeUsernamePasswordLabels: function(usernameMessageName, passwordMessageName) {
    	var controlMap = [];
        this.addControl(controlMap, 'username_label', usernameMessageName);
        this.addControl(controlMap, 'password_label', passwordMessageName);
        
        var params = [];
        this.addParam(params, this.key2_m, usernameMessageName);
        this.addParam(params, this.key2_m, passwordMessageName);
        
	    this.localizeControls(controlMap, params);
    },
    
    localizeControls: function(controlMap, localizationParams) {
        // set the current locale in the otherwise static params
        for (var p = 0, param; param = localizationParams[p]; p++) {
            param.locale = this.currentLocale;
        }
        // call the localization service
        var controller = this;
        AdminService.loadLocalizedStrings(localizationParams, {
            callback: function(localizedStringMap){
                for (var c = 0, controlItem; controlItem = controlMap[c]; c++) {
                    var localVal = localizedStringMap[controlItem.key];
                    if (localVal != null) {
                        if (controlItem.control == null) {
                            alert(controlItem.key);
                        }
                        controller.localizeControl(controlItem.control, localVal.replace("&lt;br&gt;", "<br>"));
                    }
                }
                var userController = View.controllers.get('loginUser');
                userController.getEvaluationInfo();
            },
            errorHandler: function(m, e) {
                View.showException(e);
            }
        });
    },
    
    localizeControl: function(control, text) {
        if (control.hasClass('formButton') || control.hasClass('loginDialogButton')) {
            control.dom.value = text;
        } else {
            control.dom.innerHTML = text;
        }
    },
    
    localizeLocaleNames: function() {
        var parameters = [];
        for (var i = 0, langKey; langKey = this.localeKeys[i]; i++) {
            parameters.push({
                key1: this.viewName,
                key2: this.key2_lm,
                key3: langKey,
                locale: this.currentLocale,
                translatablePrefix: this.transPrefix
            });
        }
        
        var controller = this;
        AdminService.loadLocalizedStrings(parameters, {
            callback: function(localizedStringMap) {
                var localeLink = Ext.get('localizeLink').dom;
                var localeItems = Ext.DomQuery.select('a.localizeLink', Ext.get('localeList').dom);

                for (var i = 0; i < localeItems.length; i++) {
                    var initialLocale = controller.initialLocales[i];
                    var localizedString = trim(localizedStringMap[initialLocale.value]);
                    if (localizedString) {
                        localeItems[i].childNodes[1].innerHTML = localizedString;

                        if (initialLocale.key === controller.currentLocale) {
                            localeLink.childNodes[1].innerHTML = localizedString;
                        }
                    }
                }
            },
            errorHandler: function(m, e) {
                View.showException(e);
            }
        });
    }
});


