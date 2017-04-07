/**
 * Example that demonstrates locating Room 101 of build Building HQ / Floor 17.  
 * This example builds on top of the 'Solutions.view.PanZoom' example.
 */
Ext.define('Solutions.view.LocateAsset', {
    extend : 'Floorplan.view.FloorPlan',

    requires: 'Floorplan.util.Drawing',


    config : {
        items: [
            {
                xtype : 'svgcomponent',
                height : '100%'
            }
        ]
    },


    initialize: function () {
        var me = this,
            svgComponent = me.down('svgcomponent'),
            planType =  '1 - ALLOCATION',
            blId = 'HQ',
            flId = '17';

        me.callParent(arguments);

        // Register aftersvgload listener. Called when the SVG component is finished loading the SVG data.
        svgComponent.on('aftersvgload', me.locateAssets, me);

        me.loadDrawing(planType, blId, flId);
    },

    loadDrawing: function(planType, blId, flId) {
        var me = this,
            svgComponent = me.down('svgcomponent'),
            eventHandler = [
                {
                    'assetType': 'rm',
                    'handler': me.onClickRoom
                }
            ];
        Floorplan.util.Drawing.readDrawingFromStorageOrRetrieveIfNot(blId, flId, planType, [], function(svgData) {
            svgComponent.setSvgData(svgData);
            svgComponent.setEventHandlers(eventHandler);
        },me);
    },

    onClickRoom: function (locationCodes) {
        alert('Room Code: ' + locationCodes);
    },

    /**
     * Zoom into Room 101 and highlight the room.
     */
    locateAssets: function(svgComponent) {
        var opts = {cssClass: 'zoomed-asset-red', removeStyle: true};

        svgComponent.findAssets(['HQ;17;101'], opts);
    }
});