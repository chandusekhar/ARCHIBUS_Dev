Ext.define('Solutions.view.PanZoom', {
	extend : 'Floorplan.view.FloorPlan',

	requires: 'Floorplan.util.Drawing',

	xtype : 'floorplanPanel',

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
            planType =  '1 - ALLOCATION',
            blId = 'HQ',
            flId = '17';

        me.callParent(arguments);
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
    }

});