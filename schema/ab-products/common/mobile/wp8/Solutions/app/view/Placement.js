Ext.define('Solutions.view.Placement', {
    extend: 'Floorplan.view.Placement',

    requires: 'Floorplan.util.Drawing',

    config: {
        legendSvg: 'legend.svg',
        assetGroupId: 'eq-assets',
        assetGroupClass: 'eq-asset'
    },

    initialize: function() {
        var me = this,
            placementContainer = me.down('placement');

        me.callParent();

        // Retrieve the SVG Data
        me.loadDrawing('1 - ALLOCATION', 'HQ', '17');

        // Register listeners for the Redline action buttons. These handlers would usually be implemented in
        // a Controller class. See {@link Floorplan.controller.Redline} for an example

        placementContainer.on({
            scope: me,
            legendcopytap: 'copyAssets',   // copyAssets and pasteAssets are methods on Floorplan.view.Redline
            legendpastetap: 'pasteAssets',
            legendreloadtap: 'onLegendReloadTap',
            legendsavetap: 'onLegendSaveTap'

        });
    },

    loadDrawing: function (planType, blId, flId) {
        var me = this;

        Floorplan.util.Drawing.readDrawingFromStorageOrRetrieveIfNot(blId, flId, planType, [], function (svgData) {
            me.setSvgData(svgData);
        }, me);
    },

    onLegendReloadTap: function () {
        this.loadDrawing('1 - ALLOCATION', 'HQ', '17');
    },

    onLegendSaveTap: function () {
        var me = this,
            placementComponent = me.down('placementcomponent');

        placementComponent.getImageBase64(function (imageData) {
            var dataURI = 'data:image/png;base64,' + imageData;
            if (!me.imageDisplay) {
                me.imageDisplay = Ext.create('Solutions.view.DrawingCapture');
                Ext.Viewport.add(me.imageDisplay);
            }

            me.imageDisplay.setImageUrl(dataURI);
            me.imageDisplay.show();
        }, me);
    }



});