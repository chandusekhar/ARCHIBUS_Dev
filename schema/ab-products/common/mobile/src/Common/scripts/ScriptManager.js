/**
 * Manages scripts used in the application. Provides functions for dynamically managing scripts.
 *
 * @singleton
 * @author Jeff Martin
 * @since 21.1
 */

Ext.define('Common.scripts.ScriptManager', {
    alternateClassName: ['ScriptManager'],
    // Load the Android events with the ScriptManager class
    requires: [
        'Common.scripts.event.Android',
        'Ext.Ajax',
        'Ext.MessageBox'
    ],


    singleton: true,

    dwrScripts: [
        '/archibus/dwr/engine.js',
        '/archibus/dwr/interface/MobileSyncService.js',
        '/archibus/dwr/interface/SecurityService.js',
        '/archibus/dwr/interface/MobileSecurityService.js',
        '/archibus/dwr/interface/SmartClientConfigService.js',
        '/archibus/dwr/interface/AdminService.js',
        '/archibus/dwr/interface/DrawingSvgService.js',
        '/archibus/dwr/interface/workflow.js',
        '/archibus/dwr/interface/DocumentService.js'
    ],

    /**
     * Registers the DWR scripts. It can take several seconds for the scripts to load so we provide a callback function
     * that is called when all the scripts have loaded.
     *
     * @param {Function} callback Called when the scripts have completed loading.
     * @param {Object} scope The scope to execute the callback function in.
     */
    // TODO: Change to promise
    registerDwrServiceScripts: function (callback, scope) {
        var me = this;

        me.loadDwrScripts().
            then(function() {
                Ext.callback(callback, scope, [true]);
            }, function() {
                Ext.callback(callback, scope, [false]);
            });
    },

    loadDwrScripts: function () {
        var me = this,
            networkErrorMessage = LocaleManager.getLocalizedString('Error loading network services. The network connection may be slow or unavailable', 'Common.scripts.ScriptManager');

        return new Promise(function (resolve, reject) {
            if (me.checkIfDwrScriptsAreLoaded()) {
                resolve(false);
            } else {
                me.retrieveAllDwrScripts(me.dwrScripts)
                    .then(function () {
                        resolve();
                    }, function () {
                        reject(networkErrorMessage);
                    });

            }
        });
    },

    /**
     * Returns true if all of the DWR scripts are loaded in memory
     * @returns {boolean}
     */
    checkIfDwrScriptsAreLoaded: function () {
        return !!((typeof dwr !== 'undefined') &&
        (typeof SecurityService !== 'undefined') &&
        (typeof MobileSecurityService !== 'undefined') &&
        (typeof AdminService !== 'undefined') &&
        (typeof SmartClientConfigService !== 'undefined') &&
        (typeof workflow !== 'undefined') &&
        (typeof DrawingSvgService !== 'undefined') &&
        (typeof DocumentService !== 'undefined') &&
        (typeof MobileSyncService !== 'undefined'));
    },

    /**
     * Loads the script into the global namespace
     * @param data
     */
    loadScript: function (data) {
        var head,
            script;

        data = data.replace(/^\s*|\s*$/g, '');
        if (data) {
            head = document.getElementsByTagName("head")[0] || document.documentElement;
            script = document.createElement('script');

            script.type = 'text/javascript';
            script.text = data;

            head.appendChild(script);
            head.removeChild(script);
        }
    },

    /**
     * Retrieves the DWR script data from the server
     * @param scriptName
     */
    retrieveAndLoadDwrScript: function(scriptName) {
        var me = this;

        return new Promise(function(resolve, reject) {
            Ext.Ajax.request({
                url: scriptName,
                timeout: 12000,
                success: function(response) {
                    me.loadScript(response.responseText);
                    resolve();
                },
                failure: reject
            });
        });
    },

    retrieveAllDwrScripts: function(dwrScripts) {

        var me = this,
            scriptLoader = function (allScripts) {
                var p = Promise.resolve();
                allScripts.forEach(function (script) {
                    p = p.then(function () {
                        return me.retrieveAndLoadDwrScript(script);
                    });
                });
                return p;
            };

        return scriptLoader(dwrScripts);
    }
});