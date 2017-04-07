Ext.define('Map.script.loader.Loader', {
    extend: 'Ext.mixin.Mixin',


    injectScript: function (url) {
        return new Promise(function (resolve, reject) {
            var head = document.getElementsByTagName('head')[0] || document.documentElement,
                script = document.createElement('script');

            // onload fires even when script loads with an error.
            script.onload = resolve;
            // onerror fires for malformed URLs.
            script.onerror = reject;
            script.src = url;

            head.appendChild(script);
        });

    },

    loadScripts: function (scriptsToLoad) {
        var me = this,
            p = Promise.resolve();

        scriptsToLoad.forEach(function (script) {
            p = p.then(function () {
                return me.injectScript(script);
            });
        });
        return p;
    }
});
