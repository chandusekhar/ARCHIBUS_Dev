/**
 * Loads the WebCentral JavaScript libraries that are required to
 * @since 21.3
 */
Ext.define('Common.scripts.loader.ImageCapture', {
    singleton: true,
    requires: 'Common.scripts.loader.Drawing',
    mixins: ['Common.scripts.loader.Loader'],

    desktopScripts: [
        '../../../../../ab-core/libraries/svg/rgbcolor.js',
        '../../../../../ab-core/libraries/svg/StackBlur.js',
        '../../../../../ab-core/libraries/svg/canvg.js',
        '../../../../../ab-core/controls/drawing/svg/ab-svg-capture-control.js'
    ],
    deviceScripts: [
        'imagecapture.min.js'
    ],

    constructor: function () {
        var me = this,
            scriptArray = Environment.getNativeMode() ? me.deviceScripts : me.desktopScripts;

        me.loadAllScripts(scriptArray);
    }
});