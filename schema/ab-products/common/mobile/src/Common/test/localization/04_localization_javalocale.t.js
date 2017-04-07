/**
 * Tests the conversion of the browser locale to Java locale format.
 */
/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {

    var javaLocale = LocaleManager.getJavaLocale();
    t.is(javaLocale, 'en_US', 'Locale is converted to Java locale format');

    // Set locale to it by overriding the LocaleManager.getLocale funciton
    LocaleManager.getBrowserLocale = function() {
        return 'it';
    };

    javaLocale = LocaleManager.getJavaLocale();
    t.is(javaLocale, 'it_IT', 'Locale is converted to Java locale format');

    // Set locale to it_IT by overriding the LocaleManager.getLocale funciton
    LocaleManager.getBrowserLocale = function() {
        return 'it_IT';
    };

    javaLocale = LocaleManager.getJavaLocale();
    t.is(javaLocale, 'it_IT', 'Locale is converted to Java locale format');

    // Set locale to it-it by overriding the LocaleManager.getLocale funciton
    LocaleManager.getBrowserLocale = function() {
        return 'it-it';
    };
    javaLocale = LocaleManager.getJavaLocale();
    t.is(javaLocale, 'it_IT', 'Locale is converted to Java locale format');

    // Set locale to it-it by overriding the LocaleManager.getLocale funciton
    LocaleManager.getBrowserLocale = function() {
        return 'es-419';
    };
    javaLocale = LocaleManager.getJavaLocale();
    t.is(javaLocale, 'es_ES', 'Locale is converted to Java locale format');

    t.done();

});