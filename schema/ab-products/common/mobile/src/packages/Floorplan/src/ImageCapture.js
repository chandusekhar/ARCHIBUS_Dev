/* global ImageCapture */
/**
 * Utility functions to capture image (as PNG format) from SVG.
 *
 * @since 21.3
 * @author ED
 * @singleton
 */
Ext.define('Floorplan.ImageCapture', {
    requires: ['Common.scripts.loader.ImageCapture'],

    singleton: true,

    captureImage: function (divId, bDisplayImage, callback) {
        var imageCapture = new ImageCapture();
        imageCapture.captureImage(divId, bDisplayImage, callback);
    },

    getImageBase64: function(divId, onCompleted, scope) {
        var me = this,
            data = '';

        me.captureImage(divId, false, function(dataURI) {
            // Extract the data part of the URI
            if(dataURI.indexOf('data:image/png;base64,') === 0) {
                data = dataURI.substring(22, dataURI.length);
                Ext.callback(onCompleted, scope || me, [data] );
            }
        });
    }
});
