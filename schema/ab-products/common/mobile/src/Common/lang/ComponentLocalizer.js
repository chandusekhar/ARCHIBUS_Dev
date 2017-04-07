/**
 * Registers the localization text settings for the application components
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.lang.ComponentLocalizer', {
    alternateClassName: ['ComponentLocalizer'],
    requires: [
        'Common.util.Format'
    ],

    singleton: true,

    dateFormat: 'm/d/Y',

    constructor: function() {
        this.initialize();
    },

    initialize: function() {
        var locale = LocaleManager.getLocale(),
            javaLocale = LocaleManager.getJavaLocale();

        this.setComponentLocalization(locale);
        this.setFormatLocalization(locale, javaLocale);
    },


    /**
     * Applies the locale text to the Sencha controls
     *
     * @param {String} locale The locale string to use to retrieve the localized text strings.
     */
    setComponentLocalization: function (locale) {
        var me = this,
            localeObject,
            isControlFileLoaded = me.isNameSpaceLoaded('control',locale);

        if (!isControlFileLoaded) {
            return;
        }

        localeObject = Mobile.control[locale];
        me.setDateLocalizationOverrides(localeObject);
        me.setControlLocalizationOverrides(localeObject);
        me.setValidationMessages(localeObject);
    },

    /**
     * Applies the locale specific formats
     * @param {String} locale The locale string to use to retrieve the localized text strings.
     * @param {String} javaLocale The Java locale name
     */
    setFormatLocalization: function(locale, javaLocale) {
        var me = this,
            localeObject,
            isFormatFileLoaded = me.isNameSpaceLoaded('format',locale);

        if (!isFormatFileLoaded) {
            return;
        }

        localeObject = Mobile.format[locale];
        // Check for region date format
        if(!Ext.isEmpty(Mobile.format.dateFormat[javaLocale])) {
            localeObject.defaultDateFormat = Mobile.format.dateFormat[javaLocale];
        }
        me.setLocalizedFormat(localeObject);
    },


    /**
     * Checks if the localization namespace is loaded
     * @param {String} namespace  The Mobile namespace. Valid values are language, control, and format.
     * @param {String}  locale The two character locale code
     * @returns {Boolean} Returns true if the namespace is loaded, false otherwise
     */
    isNameSpaceLoaded: function(namespace, locale) {
        return (typeof Mobile !== 'undefined') &&
               (typeof Mobile[namespace] !== 'undefined') &&
               (typeof Mobile[namespace][locale] !== 'undefined');
    },

    /**
     * Sets the localized Date properties
     *
     * @private
     * @param localeObject
     */
    setDateLocalizationOverrides: function (localeObject) {
        var dayNamesArray,
            monthNamesArray,
            monthNumbers;

        if (Ext.isDefined(localeObject.dayNames)) {
            dayNamesArray = this.getNamesArray(localeObject.dayNames, 'DAY_');
            Ext.Date.dayNames = dayNamesArray;
            Ext.DateExtras.dayNames = dayNamesArray;
        }
        if (Ext.isDefined(localeObject.monthNames)) {
            monthNamesArray = this.getNamesArray(localeObject.monthNames, 'MONTH_');
            Ext.Date.monthNames = monthNamesArray;
            Ext.DateExtras.monthNames = monthNamesArray;
        }
        if (Ext.isDefined(localeObject.monthNumbers)) {
            monthNumbers = this.getMonthNumbersObject(localeObject.monthNumbers);
            Ext.Date.monthNumbers = monthNumbers;
            Ext.DateExtras.monthNumbers = monthNumbers;
        }
    },

    /**
     * Sets the localized text for application controls.
     *
     * @private
     * @param {Object} localeObject
     */
    setControlLocalizationOverrides: function (localeObject) {
        var msgBoxItems = {};

        if(Ext.MessageBox && Ext.isDefined(localeObject.msgbox)) {
            Ext.each(localeObject.msgbox, function(item) {
                msgBoxItems[item.key1] = {value: item.value};
            });
        } else {
            return;
        }

        Ext.MessageBox.OK.text = msgBoxItems.OK_TEXT.value;
        Ext.MessageBox.CANCEL.text = msgBoxItems.CANCEL_TEXT.value;
        Ext.MessageBox.YES.text = msgBoxItems.YES_TEXT.value;
        Ext.MessageBox.NO.text = msgBoxItems.NO_TEXT.value;

        Ext.MessageBox.YESNO[0].text = msgBoxItems.NO_TEXT.value;
        Ext.MessageBox.YESNO[1].text = msgBoxItems.YES_TEXT.value;

        Ext.MessageBox.OKCANCEL[0].text = msgBoxItems.CANCEL_TEXT.value;
        Ext.MessageBox.OKCANCEL[1].text = msgBoxItems.OK_TEXT.value;

        Ext.MessageBox.YESNOCANCEL[0].text = msgBoxItems.CANCEL_TEXT.value;
        Ext.MessageBox.YESNOCANCEL[1].text = msgBoxItems.NO_TEXT.value;
        Ext.MessageBox.YESNOCANCEL[2].text = msgBoxItems.YES_TEXT.value;
    },


    /**
     * Applies the localized number decimal and grouping seperator to the number format class.
     *
     * @private
     * @param {Object} localeObject
     */
    setLocalizedFormat: function (localeObject) {
        var decimalSeparator,
            groupingSeparator;

        if (Ext.isDefined(localeObject.decimalSeparator)) {
            decimalSeparator = localeObject.decimalSeparator;
        }

        if (Ext.isDefined(localeObject.groupingSeparator)) {
            groupingSeparator = localeObject.groupingSeparator;
        }

        Common.util.Format.setNumberFormatSeparators(decimalSeparator, groupingSeparator);

        if (Ext.util.Format && Ext.isDefined(localeObject.defaultDateFormat)) {
            Ext.util.Format.defaultDateFormat = localeObject.defaultDateFormat;
            this.dateFormat = localeObject.defaultDateFormat;
        }
    },

    /**
     * Generates an array object from the control text mapping
     * @param {Object[]} localeObjectArray Array containing string mappings
     * @param {String} keyPrefix The prefix of the key field in the string mapping. Values can be
     * MONTH_ and DAY_
     * @returns {Object[]} Array of values to be applied to the control override
     */
    getNamesArray: function(localeObjectArray, keyPrefix) {
        var names = {},
            nameArray = [],
            ln = localeObjectArray.length,
            i;

        Ext.each(localeObjectArray, function(item) {
            names[item.key1] = {value: item.value};
        });

        for(i=0;i<ln;i++) {
            nameArray[i] = names[keyPrefix + i.toString()].value;
        }

        return nameArray;
    },

    /**
     * Generates an object of short month names and integer values from the control text mapping
     * @param {Object[]} monthNumbersArray Array of month numbers in the control file format.
     * @returns {Object} Object of short month names and integer values.
     * @private
     */
    getMonthNumbersObject: function(monthNumbersArray) {
        var monthNumbers = {},
            tempMonthNumbers = {},
            ln = monthNumbersArray.length,
            i;

        // Load items into a temp object to protect from the data being unordered.
        Ext.each(monthNumbersArray, function(item) {
            tempMonthNumbers[item.key1] = {value: item.value};
        });

        for(i=0;i<ln;i++) {
            monthNumbers[tempMonthNumbers['MONTH_' + i.toString()].value] = i;
        }

        return monthNumbers;
    },

    /**
     * Translates the messages used in the Ext.data.Validations class
     * @private
     */
    setValidationMessages: function (localeObject) {
        var validations = Ext.data.Validations;

        // Ext.data.Validations should always be defined here. Check just in case
        if(!Ext.isDefined(validations)) {
            console.log('The Ext.data.Validations object is not defined. Validation messages will not be translated', 'warn', this, arguments);
            return;
        }

        if(Ext.isDefined(localeObject.validationMessages)) {
            Ext.each(localeObject.validationMessages, function(message) {
                // Convert key1 value to the validation setter function name and execute.
                var fn = message.key1.toLowerCase();
                fn = fn.replace(/\b[a-z]/g, function() { return arguments[0].toUpperCase();});
                fn = 'set' + fn + 'Message';
                validations[fn](message.value);
            });
        }
    }

});
