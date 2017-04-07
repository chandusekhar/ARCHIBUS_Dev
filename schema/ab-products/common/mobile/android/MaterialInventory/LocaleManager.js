/**
 *
 * Manages the the loading of the localized language and control strings.
 * The LocaleManger script is loaded by the application index.html file when the app starts. The
 * LocaleManager is guaranteed to load the localized string before the Ext code is loaded.
 *
 * Strings accessed using the LocaleManger#getLocalizedString function will have any required string objects
 * loaded before the app starts.
 *
 * @since 23.1
 * @author Jeff Martin
 * @type {{}}
 */

// Load the Mobile objects for the case where they are not present when the LocaleManager script
// is loaded.

var Mobile = Mobile || {};
Mobile.language = Mobile.language || {};
Mobile.control = Mobile.control || {};

/* Disable JSHint Variable Not Used and Too Many Statement errors. */
/* jshint -W098 */
/* jshint -W071 */
var LocaleManager = (function () {

    var l = {};
    var localizedStrings = {};
    var localizedDateFormat = null; // Set to the first time it is accessed
    var readyStateRe =  (/MSIE 10/.test(navigator.userAgent)) ? /complete|loaded/ : /interactive|complete|loaded/;

    var locales = {
        'SQ_AL': 'sq_AL',
        'AR_DZ': "ar_DZ",
        'AR_BH': "ar_BH",
        'AR_EG': "ar_EG",
        'AR_IQ': "ar_IQ",
        'AR_JO': "ar_JO",
        'AR_KW': "ar_KW",
        'AR_LB': "ar_LB",
        'AR_LY': "ar_LY",
        'AR_MA': "ar_MA",
        'AR_OM': "ar_OM",
        'AR_QA': "ar_QA",
        'AR_SA': "ar_SA",
        'AR_SD': "ar_SD",
        'AR_SY': "ar_SY",
        'AR_TN': "ar_TN",
        'AR_AE': "ar_AE",
        'AR_YE': "ar_YE",
        'BE_BY': "be_BY",
        'BG_BG': "bg_BG",
        'CA_ES': "ca_ES",
        'ZH_CN': "zh_CN",
        'ZH_SG': "zh_SG",
        'ZH_HK': "zh_HK",
        'ZH_TW': "zh_TW",
        'HR_HR': "hr_HR",
        'CS_CZ': "cs_CZ",
        'DA_DK': "da_DK",
        'NL_BE': "nl_BE",
        'NL_NL': "nl_NL",
        'EN_AU': "en_AU",
        'EN_CA': "en_CA",
        'EN_IN': "en_IN",
        'EN_IE': "en_IE",
        'EN_MT': "en_MT",
        'EN_NZ': "en_NZ",
        'EN_PH': "en_PH",
        'EN_SG': "en_SG",
        'EN_ZA': "en_ZA",
        'EN_GB': "en_GB",
        'EN_US': "en_US",
        'ET_EE': "et_EE",
        'FI_FI': "fi_FI",
        'FR_BE': "fr_BE",
        'FR_CA': "fr_CA",
        'FR_FR': "fr_FR",
        'FR_LU': "fr_LU",
        'FR_CH': "fr_CH",
        'DE_AT': "de_AT",
        'DE_DE': "de_DE",
        'DE_LU': "de_LU",
        'DE_CH': "de_CH",
        'DE_CY': "el_CY",
        'EL_GR': "el_GR",
        'IW_IL': "iw_IL",
        'HI_IN': "hi_IN",
        'HU_HU': "hu_HU",
        'IS_IS': "is_IS",
        'IN_ID': "in_ID",
        'GA_IE': "ga_IE",
        'IT_IT': "it_IT",
        'IT_CH': "it_CH",
        'JA_JP': "ja_JP",
        'JA_JP_U_CA_JAPANESE': "ja_JP_u_ca_japanese",
        'JA_JP_X_LVARIANT_JP': "ja_JP_x_lvariant_JP",
        'KO_KR': "ko_KR",
        'LV_LV': "lv_LV",
        'LT_LT': "lt_LT",
        'MK_MK': "mk_MK",
        'MS_MY': "ms_MY",
        'MT_MT': "mt_MT",
        'NO_NO': "no_NO",
        'NB_NO': "nb_NO",
        'NN_NO': "nn_NO",
        'NO_NO_X_LVARIANT_NY': "no_NO_x_lvariant_NY",
        'PL_PL': "pl_PL",
        'PT_BR': "pt_BR",
        'PT_PT': "pt_PT",
        'RO_RO': "ro_RO",
        'RU_RU': "ru_RU",
        'SR_BA': "sr_BA",
        'SR_ME': "sr_ME",
        'SR_RS': "sr_RS",
        'SR_LATN_BA': "sr_Latn_BA",
        'SR_LATN_ME': "sr_Latn_ME",
        'SR_LATN_RS': "sr_Latn_RS",
        'SK_SK': "sk_SK",
        'SL_SI': "sl_SI",
        'ES_AR': "es_AR",
        'ES_BO': "es_BO",
        'ES_CL': "es_CL",
        'ES_CO': "es_CO",
        'ES_CR': "es_CR",
        'ES_DO': "es_DO",
        'ES_EC': "es_EC",
        'ES_SV': "es_SV",
        'ES_GT': "es_GT",
        'ES_HN': "es_HN",
        'ES_MX': "es_MX",
        'ES_NI': "es_NI",
        'ES_PA': "es_PA",
        'ES_PY': "es_PY",
        'ES_PE': "es_PE",
        'ES_PR': "es_PR",
        'ES_ES': "es_ES",
        'ES_US': "es_US",
        'ES_UY': "es_UY",
        'ES_VE': "es_VE",
        'SV_SE': "sv_SE",
        'TH_TH': "th_TH",
        'TH_TH_U_CA_BUDDHIST': "th_TH_u_ca_buddhist",
        'TH_TH_U_CA_BUDDHIST_NU_THAI': "th_TH_u_ca_buddhist_nu_thai",
        'TH_TH_X_LVARIANT_TH': "th_TH_x_lvariant",
        'TR_TR': "tr_TR",
        'UK_UA': "uk_UA",
        'VI_VN': "vi_VN",
        // Non Java locales
        'ES_419': "es_ES",
        'EN': "en_US",
        'FR': "fr_FR",
        'DE': "de_DE",
        'ES': "es_ES",
        'IT': "it_IT",
        'NL': "nl_NL"
    };

    function init() {
        var scriptFileNames;
        scriptFileNames= getLanguageScriptFileNames(l.getLocale());

        loadAllScripts(scriptFileNames);
        initializeLocalizedStrings();
    }

    /**
     * Returns the two character locale region. This value is used to associate the
     * browser locale with the language file containing the localized strings.
     *
     * For example, a returned locale of fr causes the LocaleManager to load the lang_fr.js and
     * control_fr.js files.
     *
     * If the traditional Chinese locale of zh is found the method returns the simplified Chinese
     * locale of ch.
     *
     * @returns {String}
     */
    l.getLocale = function () {
        var locale = l.getBrowserLocale();
        if (locale.length > 1) {
            locale = locale.substring(0, 2).toLowerCase();
            // Convert the traditional Chinese locale to Simplified Chinese
            return locale === 'zh' ? 'ch' : locale;
        } else {
            return 'en';
        }
    };

    /**
     * Returns the Java locale associated with the browser locale. Valid Java locales are
     * contained in the locale property.
     * @returns {String} the decoded Java locale.
     */
    l.getJavaLocale = function () {
        // Convert locale to Java locale format
        return convertToJavaLocale(l.getBrowserLocale());
    };

    /**
     * Returns the date format for the detected Java locale. The Java date format is
     * listed in the format.js file
     * @returns {*}
     */
    l.getLocalizedDateFormat = function () {
        var javaLocale;
        if (localizedDateFormat === null) {
            javaLocale = l.getJavaLocale().toUpperCase();
            if (Mobile.format && Mobile.format.dateFormat[javaLocale]) {
                return Mobile.format.dateFormat[javaLocale];
            } else {
                return l.defaultDateFormat;
            }
        } else {
            return localizedDateFormat;
        }
    };

    /**
     * Returns the localized string if it has been loaded from a string resource file.
     * If a localized string is not found the key value is returned.
     * @param {String} key The English string. The key is used along with the className to look up the string in the
     * loaded language object.
     * @param {String} className The name of the class that the localized string is used.
     * @returns {String} the localized string value of the key value if the string is not found.
     */
    l.getLocalizedString = function (key, className) {
        var localizedString = key;

        if (!key) {
            return '';
        }

        if (localizedStrings[className] && localizedStrings[className][key]) {
            localizedString = localizedStrings[className][key];
        }

        return localizedString;
    };

    /**
     * Returns the locale of the browser
     * Provides a public function that can be overridden for testing
     * @returns {string} the browser locale or the English US locale if the browser locale cannot be detected.
     */
    l.getBrowserLocale = function() {
        return navigator.language || navigator.userLanguage || 'en_US';
    };


    if (document.readyState.match(readyStateRe) !== null) {
        init();
    }
    else {
        document.addEventListener('DOMContentLoaded', function () {
            init();
        }, false);
    }

    /**
     *
     * @property {string} The default date format
     */
    l.defaultDateFormat = 'm/d/Y';

    function retrieveScript(scriptFile, onCompleted, scope) {
        var xhr = new XMLHttpRequest(),
            xhrComplete = function (result) {
                onCompleted.call(scope, result);
            },
            status,
            content;

        try {
            xhr.open('GET', scriptFile, false);
            xhr.send(null);
            status = xhr.status;
            content = xhr.responseText;

            if ((status >= 200 && status < 300) || status === 304 || (status === 0 && content.length > 0)) {
                xhrComplete(content);
            }
            else {
                xhrComplete(false);
            }
        } catch (e) {
            xhrComplete(false);
        }
    }

    function loadScript(data) {
        var head,
            script;

        if(data) {
            data = data.replace(/^\s*|\s*$/g, '');
            if (data) {
                head = document.getElementsByTagName("head")[0] || document.documentElement;
                script = document.createElement('script');

                script.type = 'text/javascript';
                script.text = data;

                head.appendChild(script);
                head.removeChild(script);
            }
        }
    }

    function isNativeMode() {
        var href = document.location.href,
            mode = href.indexOf('/mobile/android') + href.indexOf('/mobile/ios') + href.indexOf('/mobile/wp8');

        return mode !== -3;
    }

    function getLanguageScriptFileNames(locale) {
        var scriptSourcePath = isNativeMode() ? '' : '../Common/resources/language/',
            controlFileName = scriptSourcePath + 'control_' + locale + '.js',
            languageFileName = scriptSourcePath + 'lang_' + locale + '.js',
            formatFileName = scriptSourcePath + 'format.js';

        return [languageFileName, controlFileName, formatFileName];
    }

    function loadAllScripts(scripts) {
        var numberOfScriptsToLoad = scripts.length;

        var retrieveAndLoadScript = function (scriptIndex) {
            var scriptObject;
            if (scriptIndex < numberOfScriptsToLoad) {
                scriptObject = scripts[scriptIndex];
                retrieveScript(scriptObject, function (scriptContent) {
                    if (scriptContent !== false) {
                        loadScript(scriptContent);
                    }
                    scriptIndex += 1;
                    retrieveAndLoadScript(scriptIndex);
                });
            }
        };
        retrieveAndLoadScript(0);
    }

    function initializeLocalizedStrings() {
        var locale = l.getLocale(),
            tuples;

        if(typeof Mobile.language[locale] !== 'undefined') {
            tuples = Mobile.language[locale].localizedStrings;

            tuples.forEach(function (tuple) {
                if (!localizedStrings.hasOwnProperty(tuple.key1)) {
                    localizedStrings[tuple.key1] = {};
                }
                localizedStrings[tuple.key1][tuple.key2] = tuple.value;
            });
        }
    }

    function convertToJavaLocale(locale) {
        var tmpLocale = locale.replace('-', '_'),
            javaLocale = 'en_US',
            items;

        // Check if the locale is a valid locale
        if (locales.hasOwnProperty(tmpLocale.toUpperCase())) {
            return locales[tmpLocale.toUpperCase()];
        }

        // Check if there is a valid locale for the language code
        items = tmpLocale.split('_');
        if (items[0] && locales.hasOwnProperty(items[0].toUpperCase())) {
            return locales[items[0].toUpperCase()];
        }

        return javaLocale;
    }

    return l;

})();