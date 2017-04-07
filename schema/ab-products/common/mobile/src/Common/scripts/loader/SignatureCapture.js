/**
 * Loads the signature capture JavaScript library
 * @since 23.1
 * @author Jeff Maritin
 */
Ext.define('Common.scripts.loader.SignatureCapture', {
    singleton: true,
    mixins: ['Common.scripts.loader.Loader'],

    desktopScripts: [
        '../Common/lib/signature_pad.min.js'
    ],
    deviceScripts: [
        'signature_pad.min.js'
    ],

    constructor: function () {
        var me = this,
            scriptArray = Environment.getNativeMode() ? me.deviceScripts : me.desktopScripts;

        me.loadAllScripts(scriptArray);
    }
});