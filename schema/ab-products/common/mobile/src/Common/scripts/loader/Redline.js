/**
 * Loads the WebCentral libraries required for the Redlining features.
 * @since 21.3
 * @author Jeff Maritin
 */
Ext.define('Common.scripts.loader.Redline', {
    singleton: true,
    requires: 'Common.scripts.loader.Drawing',
    mixins: ['Common.scripts.loader.Loader'],

    desktopScripts: [
         '../../../../../ab-core/libraries/svg/placement.js',
         '../../../../../ab-core/libraries/svg/redline.js',
         '../../../../../ab-core/controls/drawing/svg/ab-svg-placement-control.js',
         '../../../../../ab-core/controls/drawing/svg/ab-svg-redline-control.js'
    ],
    deviceScripts: [
        'redline.min.js'
    ],

    constructor: function () {
        var me = this,
            scriptArray = Environment.getNativeMode() ? me.deviceScripts : me.desktopScripts;

        me.loadAllScripts(scriptArray);
    }
});