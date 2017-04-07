/**
 * Loads the WebCentral library JavaScript files
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('Common.scripts.loader.Loader', {
    extend: 'Ext.mixin.Mixin',

    /**
     * Loads the script into the global namespace
     * @param {String} data The script data
     * @private
     */
    loadScript: function (data) {
        var head,
            script;

        if (Ext.isEmpty(data)) {
            return;
        }
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
     * Retrieves the script data from the server. Uses a synchronous request
     * to retrieve the script files. This ensures that the scripts are loaded before
     * any dependent classes access the script code.
     * @param {String} scriptName The path of the script
     * @param {Function} onCompleted Called when the script has been retrieved
     * @param {Object} scope The scope to execute the callback
     * @private
     */
    retrieveScript: function (scriptFile, onCompleted, scope) {
        var xhr = new XMLHttpRequest(),
            xhrComplete = function (result) {
                Ext.callback(onCompleted, scope, [result]);
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
    },

    /**
     * Retrieves and installs the scripts contained in the scripts array. The scripts
     * are retrieved using a synchronous request to ensure that the scripts
     * are installed before any dependent classes.
     * @param {String[]} scripts An array of script paths
     */
    loadAllScripts: function (scripts) {
        var me = this,
            numberOfScriptsToLoad = scripts.length;

        var retrieveAndLoadScript = function (scriptIndex) {
            var scriptObject;
            if (scriptIndex < numberOfScriptsToLoad) {
                scriptObject = scripts[scriptIndex];
                me.retrieveScript(scriptObject, function (scriptContent) {
                    if (scriptContent !== false) {
                        me.loadScript(scriptContent);
                    }
                    scriptIndex += 1;
                    retrieveAndLoadScript(scriptIndex);
                }, me);
            }
        };
        retrieveAndLoadScript(0);
    },

    /**
     * Checks if a script is available to be loaded. Returns true if the script can be loaded.
     * @param {String} script The pathname of the script
     * @returns {boolean}
     */
    checkIfScriptExists: function (script) {
        var request = new XMLHttpRequest(),
            status;

        // Use a synchronous XMLHttpRequest
        request.open('GET', script, false);
        try {
            request.send(null);
            status = request.status;
            return (status >= 200 && status < 300 || status === 304 || status === 0 && request.responseText.length > 0);
        }
        catch (e) {
            return false;
        }
    }
});
