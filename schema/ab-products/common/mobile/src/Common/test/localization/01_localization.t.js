/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/*jshint newcap: false */


var LocaleManager = (function (l) {
    // Replace the getLocale function to force the French strings to be loaded by the LocaleManager
    l.getLocale = function () {
        return 'fr';
    };

    return l;
}(LocaleManager || {}));


/* global StartTest */
StartTest(function (t) {
    var defaultDateFormat,
        localizedDateFormat,
        localizedString;

    // Override the browser locale for the test
    LocaleManager.getBrowserLocale = function() {
        return 'fr';
    };

    // Verify default date format
    defaultDateFormat = LocaleManager.defaultDateFormat;
    t.is(defaultDateFormat,'m/d/Y', 'The Default Date format is correct');

    // Verify the localized date format
    localizedDateFormat = LocaleManager.getLocalizedDateFormat();
    t.is(localizedDateFormat,'d/m/Y', 'Localized date format is correct');

    //Retrieve localized values loaded from the ../Common/resources/language/lang_fr.js file
    localizedString = LocaleManager.getLocalizedString('Device','AppLauncher.controller.Registration');
    t.is(localizedString,'Appareil','Localized Value matches localization file');

    // Null value for the key -> should return a blank string
    localizedString = LocaleManager.getLocalizedString(null,'AppLauncher.controller.Registration');
    t.is(localizedString, '', 'null key returns blank string');

    // undefined value for the key -> should return a blank string
    localizedString = LocaleManager.getLocalizedString(undefined,'AppLauncher.controller.Registration');
    t.is(localizedString, '', 'undefined key returns blank string');

    // A null class name should return the key value
    localizedString = LocaleManager.getLocalizedString('Device',null);
    t.is(localizedString, 'Device', 'null class name returns the key value');

    // An undefined class name should return the key value
    localizedString = LocaleManager.getLocalizedString('Device',undefined);
    t.is(localizedString, 'Device', 'undefined class name returns the key value');

    // A key that does not exist in the language file should return the key value
    localizedString = LocaleManager.getLocalizedString('TestKey','AppLauncher.controller.Registration');
    t.is(localizedString, 'TestKey', 'Non existent key returns the key value');

    t.done();
});


