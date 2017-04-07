/**-f
 * Loads the WebCentral JavaScript library files required to support the Drawing features.
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('Common.scripts.loader.Drawing', {
    requires: 'Common.util.Environment',
    singleton: true,
    mixins: ['Common.scripts.loader.Loader'],

    desktopScripts: [
         '../../../../../ab-core/libraries/d3/d3.js',
         '../../../../../ab-core/libraries/base/base.js',
         '../../../../../ab-core/controls/drawing/svg/ab-svg-drawing-control.js',
         '../../../../../ab-core/controls/drawing/svg/ab-svg-drawing-popup.js',
         '../../../../../ab-core/libraries/svg/marker.js',
         '../../../../../ab-core/controls/drawing/marker-control.js'
    ],
    deviceScripts: [
        'd3.min.js',
        'drawing.min.js'
    ],

    constructor: function () {
        var me = this,
            scriptArray = Environment.getNativeMode() ? me.deviceScripts : me.desktopScripts;

        me.loadAllScripts(scriptArray);
    }
});