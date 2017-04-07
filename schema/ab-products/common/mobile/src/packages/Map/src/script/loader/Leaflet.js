Ext.define('Map.script.loader.Leaflet', {
    mixins: ['Map.script.loader.Loader'],

    singleton: true,

    desktopScripts: [
        '../packages/Map/lib/leaflet.js'
    ],

    deviceScripts: [
        'leaflet.js'
    ],

    isLoading: false,

    constructor: function () {
        var me = this,
            scriptArray = Environment.getNativeMode() ? me.deviceScripts : me.desktopScripts;

        Log.log('Loading Map.script.loader.Leaflet', 'verbose');

        if(!me.isLoading) {
            me.isLoading = true;

            me.loadScripts(scriptArray)
                .done(function() {
                    me.isLoading = false;
                });
        }
    }
});