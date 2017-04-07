/**
 * Dynamically loads the Google Maps API, leaflet API and supporting Web Central files
 *
 * @since 23.1
 * @author Jeff Martin
 */
Ext.define('Map.script.loader.Google', {

    mixins: ['Map.script.loader.Loader'],

    singleton: true,

    requires: 'Common.util.Environment',

    googleApiScript: 'http://maps.google.com/maps/api/js?v=3&callback=Map.script.loader.Google.loadMap',

    desktopScripts: [
        '../packages/Map/lib/leaflet.js',
        '../../../../../ab-core/controls/gis/google-leaflet.js',
        '../packages/Map/lib/esri-leaflet.js'
    ],

    deviceScripts: [
        'leaflet.js',
        'leaflet.google.min.js',
        'esri-leaflet.js'
    ],

    constructor: function () {
        var me = this;
        // Load the Google API first. The loadMap function is called when the Google API is loaded.
        Log.log('Loading Map.script.loader.Google', 'verbose');
        me.injectScript(me.googleApiScript);
    },

    // Called by the Google API script when it is finished loading.
    loadMap: function () {
        var me = this,
            scriptArray = Environment.getNativeMode() ? me.deviceScripts : me.desktopScripts;

        Log.log('Google API script loaded', 'verbose');
        // Load the remaining scripts.
        me.loadScripts(scriptArray)
            .then(function () {
                Log.log('Map.script.loader.Google: Scripts loaded','verbose');
            });
    }
});