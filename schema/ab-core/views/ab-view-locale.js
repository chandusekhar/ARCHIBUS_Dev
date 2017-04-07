/**
 * Controller for selecting user locale.
 *
 * To be used along with a view-specific controller. See ab-core/views/main-toollbar/ab-my-user-profile.js
 *
 */
var viewLocaleController = View.createController('viewLocaleController', {
	
	// constants for constructing localization parameters
	viewName: "/ab-system/system-administration/login.axvw",
	key2_t: "title",
	key2_m: "message",
	key2_lm: "localeMessage",
	transPrefix: false,

	/**
	 * Displays the locale list recieved from the server.
	 * @param {Object} locales
	 */
	onGetLocales: function(locales) {
		this.localeSelector.dom.options.length = 0;
		
		this.currentLocale = Ab.view.View.user.locale;
		
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

        this.localeSelector.dom.value = this.currentLocale;
        this.selectUserLocale(null, {
            value: this.currentLocale
        });
	},
    
	/**
	 * Edit the provided local language titles to fit the key expected by the lang file
	 * e.g., the title "Spanish (Spain)" is truncated to "Spanish".
	 */
	proofLocale: function(locale){
	 /*   if (locale.title.indexOf("German") == 0 && locale.title.indexOf("(") > 1) {
	        locale.title = locale.title.substring(0, locale.title.indexOf("(") - 1);
	    } else if (locale.title.indexOf("Spanish") == 0 && locale.title.indexOf("(") > 1) {
	        locale.title = locale.title.substring(0, locale.title.indexOf("(") - 1);
	    }*/
	    return locale;
	},
    

	/**
	 * Localize select control values displayed in drop-down
	 */
    localizeLocaleNames: function(controller) {
        var parameters = [];
        for (var i = 0, langKey; langKey = controller.localeKeys[i]; i++) {
            parameters.push({
                key1: this.viewName,
                key2: this.key2_lm,
                key3: langKey,
                locale: this.currentLocale,
                translatablePrefix: this.transPrefix
            });
        }
        
        var controller = controller;
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


