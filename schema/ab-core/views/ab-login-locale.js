
/**
 * Login form controller for selecting user locale.
 */
var loginLocaleController = View.createController('loginLocale', {
	
	// reference to the select input
	localeSelector: null,
	
    // selected locale
    currentLocale: 'en_US',
    
    // if this locale is selected, login page controls do not have to be localized 
    DEFAULT_LOCALE: 'en_US',
	
    // copy of locales array with locale titles in en_US; constant throught lifecycle of view
    initialLocales: null,
	
    localeKeys: null,
    
	// constants for constructing localization parameters
	viewName: "/ab-system/system-administration/login.axvw",
	key2_t: "title",
	key2_m: "message",
	key2_lm: "localeMessage",
	transPrefix: false,

    /**
     * Initializes the controller objects.
     */	
	afterViewLoad: function() {
        this.initializeControlMap();

        this.localeSelector = Ext.get('language_selector');
		this.localeSelector.on('change', this.selectUserLocale.createDelegate(this));
		
		// get locale list from the server
	    SecurityService.getLocales(null, {
	        callback: this.onGetLocales.createDelegate(this),
	        errorHandler: function(m, e) {
	            Ab.view.View.showException(e);
	        }
	    });
	},
	
	/**
	 * Displays the locale list recieved from the server.
	 * @param {Object} locales
	 */
	onGetLocales: function(locales) {
		this.localeSelector.dom.options.length = 0;
		
        this.initialLocales = [];
        this.localeKeys = [];
        for (var i = 0; i < locales.length; i++) {
            var locale = this.proofLocale(locales[i]);
            
            this.initialLocales.push({
                key: locale.id,
                value: locale.title
            });
            
            this.localeKeys.push(locale.title);
			
			this.localeSelector.dom.options[i] = new Option(locale.title, locale.id);
        }

        var afm_user_language = getCookie("afm_user_language_per_computer");
        if (afm_user_language == null) {
            afm_user_language = this.currentLocale;

            // set up cookies
            var today = new Date();
            var expires = new Date();

            // expire cookies in one year?
            expires.setTime(today.getTime() + 1000 * 60 * 60 * 24 * 365);
            
            setCookie("afm_user_language_per_computer", afm_user_language, expires);

            // show the language in the UI
            this.localeSelector.dom.value = afm_user_language;
        }
        else {
            this.localeSelector.dom.value = afm_user_language;
            this.selectUserLocale(null, {
                value: afm_user_language
            });
        }
	},
    
	/**
	 * Select listener for Sign-In Page Language combobox.
	 */
	selectUserLocale: function(e, option) {
		var localeId = option.value;
	    if (localeId != this.currentLocale) {
            this.currentLocale = localeId;
		}

	    this.localizeControls(this.controlMap, this.localizationParams);
        this.localizeLocaleNames();

        var userController = View.controllers.get('loginUser');
        userController.localizeUsernamePasswordLabels();
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
        this.addControl(this.controlMap, 'signin_label');
        this.addControl(this.controlMap, 'signin_message');
        this.addControl(this.controlMap, 'signin_button');
        this.addControl(this.controlMap, 'send_password_control');
        this.addControl(this.controlMap, 'remember_message');
        this.addControl(this.controlMap, 'guest_label');
        this.addControl(this.controlMap, 'evaluation_license_label');
        this.addControl(this.controlMap, 'guest_message');
        this.addControl(this.controlMap, 'guest_button');
        
        this.localizationParams = [];
        this.addParam(this.localizationParams, this.key2_m, 'project_label_text');
        this.addParam(this.localizationParams, this.key2_t, 'signin_label_text');
        this.addParam(this.localizationParams, this.key2_m, 'signin_message_text');
        this.addParam(this.localizationParams, this.key2_t, 'signin_button_text');
        this.addParam(this.localizationParams, this.key2_m, 'language_label_text');
        this.addParam(this.localizationParams, this.key2_m, 'send_password_control_text');
        this.addParam(this.localizationParams, this.key2_m, 'remember_message_text');
        this.addParam(this.localizationParams, this.key2_m, 'guest_label_text');
        this.addParam(this.localizationParams, this.key2_m, 'evaluation_license_label_text');
        this.addParam(this.localizationParams, this.key2_m, 'guest_message_text');
        this.addParam(this.localizationParams, this.key2_t, 'guest_button_text');
        
        this.addParam(this.localizationParams, this.key2_m, 'password_email_request');
        this.addParam(this.localizationParams, this.key2_m, 'error_username_empty');
        this.addParam(this.localizationParams, this.key2_m, 'error_password_empty');
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
        if (this.currentLocale == this.DEFAULT_LOCALE && false) {
            for (var i = 0, controlItem; controlItem = controlMap[i]; i++) {
                this.localizeControl(controlItem.control, controlItem.key);
            }
        } 
		else {
            // set the current locale in the otherwise static params
            for (var p = 0, param; param = localizationParams[p]; p++) {
                param.locale = this.currentLocale;
            }
            // call the localization service
            var controller = this;
            AdminService.loadLocalizedStrings(localizationParams, {
                callback: function(localizedStringMap){
                    for (var c = 0, controlItem; controlItem = controlMap[c]; c++) {
                        var localVal = localizedStringMap[controlItem.key]
                        if (localVal != null) {
                            controller.localizeControl(controlItem.control, localVal);
                        }
                    }
                    //XXX: update messages with runtime locale and its localization strings.
                	for(var messageKey in Ab.view.View.messages){
                		if (Ab.view.View.messages.propertyIsEnumerable(messageKey)){
                		  for(var key in localizedStringMap){
                			  if (localizedStringMap.propertyIsEnumerable(key) && Ab.view.View.messages[messageKey] === key){
                            	  Ab.view.View.messages[messageKey] = localizedStringMap[key];
                            	  break;
                              }
                          }
                		}
                	}
                },
                errorHandler: function(m, e) {
                    View.showException(e);
                }
            });
        }
    },
    
    localizeControl: function(control, text){
        if (control.hasClass('formButton')) {
            control.dom.value = text;
        } 
		else {
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
                for (var i = 0; i < controller.localeSelector.dom.options.length; i++) {
                    var option = controller.localeSelector.dom.options[i];
                    var initialLocale = controller.initialLocales[i];
                    var localizedString = trim(localizedStringMap[initialLocale.value]);
                    if (localizedString) {
                        option.text = localizedString;
                    }
                }
            },
            errorHandler: function(m, e) {
                View.showException(e);
            }
        });
    }
});


