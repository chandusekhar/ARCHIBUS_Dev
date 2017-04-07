Ext.define('Common.scripts.loader.Marker', {
    singleton: true,
    requires: 'Common.scripts.loader.Drawing',
    mixins: ['Common.scripts.loader.Loader'],

    desktopScripts: [
        '../../../../../ab-core/libraries/svg/marker.js',
        '../../../../../ab-core/controls/drawing/marker-control.js'
    ],
    deviceScripts: [
        'marker.min.js'
    ],

    constructor: function () {
        var me = this,
            scriptArray = Environment.getNativeMode() ? me.deviceScripts : me.desktopScripts;

        me.loadAllScripts(scriptArray);
    }

});
