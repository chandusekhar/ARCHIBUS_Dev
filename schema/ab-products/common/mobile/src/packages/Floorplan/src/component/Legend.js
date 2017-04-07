/**
 * A component that displays a SVG floor plan
 * @since 22.1
 * @author Jeff Martin
 */
Ext.define('Floorplan.component.Legend', {
    extend: 'Ext.Component',
    requires: [
        'Common.scripts.loader.Redline',
        'Common.scripts.loader.ImageCapture'
    ],

    xtype: 'legendcomponent',

    copiedAssets: [],

    config: {
        /**
         * @cfg {Object} control The RedlineSvg control. The control is created using the Web Central Drawing
         * library in the component initialize function
         */
        control: null,

        /**
         * @cfg {String} assetGroupId The SVG group id of the redline elements
         */
        assetGroupId: 'redlines',

        /**
         * @cfg {String} assetGroupClass The CSS class to apply to the redline elements
         */
        assetGroupClass: 'redline',

        /**
         * @cfg {String} drawingDivId The div element id of the svg element
         */
        drawingDivId: null
    },

    template: [
        {
            tag: 'div',
            reference: 'legend',
            cls: 'redline-legend'
        }
    ],

    initialize: function () {
        var me = this,
            redlineControl;

        me.callParent(arguments);

        //The first parameter to RedlineSvg is the svg divId, set this when the drawing is displayed.
        redlineControl = new RedlineSvg('', me.config);
        redlineControl.z_MESSAGE_ENTER_TEXT = LocaleManager.getLocalizedString('Please enter the text box content:', 'Floorplan.component.Legend');
        redlineControl.z_MESSAGE_DELETE = LocaleManager.getLocalizedString('Are you sure you want to delete this object?', 'Floorplan.component.Legend');
        me.setControl(redlineControl);

        me.on('painted', me.onPainted, me, {delay: 150, single: true});
    },

    onPainted: function () {
        var me = this,
            redlineControl = me.getControl();

        //Set the legend id of the control
        redlineControl.legendId = me.legend.getId();
    },

    loadLegend: function (svgDivId, options) {
        var me = this,
            redlineControl = me.getControl(),
            legendOptions = options || {};

        redlineControl.divId = svgDivId;
        redlineControl.loadLegend(legendOptions);
    },

    /**
     * Each asset dropped onto the drawing will be tagged with a 'dropped' class.
     * This method queries for all nodes under the 'redlines' layer with for this class.
     * Returns an array of nodes.
     * @returns {Array} Array of nodes
     */
    copyAssets: function () {
        var me = this,
            drawingDivId = me.getDrawingDivId();

        me.copiedAssets = me.getControl().copyAssets(drawingDivId);
        return me.copiedAssets;
    },

    /**
     * Pastes an array of nodes/symbols onto the drawing.  Hide interactive grips.
     * @param redlinesToPaste    Array. Array of SVGGElements to place onto the drawing
     */
    pasteAssets: function () {
        var me = this,
            drawingDivId = me.getDrawingDivId(),
            assetGroupId = me.getAssetGroupId(),
            assetGroupClass = me.getAssetGroupClass();

        if(me.copiedAssets && me.copiedAssets.length > 0) {
            me.getControl().pasteAssets(drawingDivId, me.copiedAssets, assetGroupId, assetGroupClass, me.legend.getId());
        }
    },

    /**
     * Converts the SVG drawing into a base64 encoded PNG image
     * @param {Function} onCompleted Called when the SVG conversion is completed
     * @param {Object} scope The scope to execute the callback function
     */
    getImageBase64: function (onCompleted, scope) {
        var me = this,
            drawingDivId = me.getDrawingDivId(),
            data = '';

        me.captureImage(drawingDivId, false, function (dataURI) {
            // Extract the data part of the URI
            if (dataURI.indexOf('data:image/png;base64,') === 0) {
                data = dataURI.substring(22, dataURI.length);
                Ext.callback(onCompleted, scope || me, [data]);
            }
        });
    },

    /**
     * @private
     * @param {String} divId The div id of the SVG element
     * @param {Boolean} displayImage True to display the image after conversion, false otherwise.
     * @param {Function} callback Executed when the image conversion is completed.
     */
    captureImage: function (divId, displayImage, callback) {
        var imageCapture = new ImageCapture();
        imageCapture.captureImage(divId, displayImage, callback);
    }
});