Ext.define('Map.script.loader.Esri', {
    mixins: ['Map.script.loader.Loader'],

    singleton: true,

    desktopScripts: [
        '../packages/Map/lib/leaflet.js',
        '../packages/Map/lib/esri-leaflet.js'
    ],

    deviceScripts: [
        'leaflet.js',
        'esri-leaflet.js'
    ],

    constructor: function () {
        var me = this,
            scriptArray = Environment.getNativeMode() ? me.deviceScripts : me.desktopScripts;

        Log.log('Loading Map.script.loader.Esri', 'verbose');
        me.loadScripts(scriptArray);
    }

});
