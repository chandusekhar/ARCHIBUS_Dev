Ext.define('Maintenance.controller.FloorPlan', {

    extend: 'Ext.app.Controller',

    requires: [
        'Floorplan.util.Drawing',
        'Floorplan.util.Floorplan'
    ],

    config: {
        refs: {
            mainView: 'mainview',
            floorPlanView: 'floorPlanPanel'
        }
    },

    /**
     * Handles the item selected event of the Floor Plan picker button
     *
     */
    loadFloorPlan: function () {
        var floorPlanPanel = this.getFloorPlanView(),
            record = floorPlanPanel.getRecord(),
            planType = '10 - MAINTENANCE';

        floorPlanPanel.setPlanType(planType);
        this.loadDrawing(planType, record, floorPlanPanel);
    },

    loadDrawing: function (planType, record, view) {
        var me = this,
            blId = record.get('bl_id'),
            flId = record.get('fl_id');

        Floorplan.util.Drawing.readDrawingFromStorageOrRetrieveIfNot(blId, flId, planType, [], function(svgData) {
            view.setSvgData(svgData);
            view.setEventHandlers([
                {
                    'assetType': 'rm',
                    'handler': view.onClickRoom,
                    'scope': view
                }
            ]);
            me.findRoomAsset(view, record);

            // Save the floor plan
            Floorplan.util.Floorplan.saveFloorPlan(blId,flId,planType,svgData);

        }, me);
    },

    findRoomAsset: function (view, record) {
        var blId = record.get('bl_id'),
            flId = record.get('fl_id'),
            rmId = record.get('rm_id'),
            fullRmId = blId + ';' + flId + ';' + rmId;

        view.findAssets(fullRmId, {});
    },

    doProcessSvgData: function (svgData, view) {
        var svgDivId = view.getSvgDivId();

        view.processSvg(view, svgDivId, svgData, [
            {
                'assetType': 'rm',
                'handler': view.onClickRoom,
                'scope': view
            }
        ]);
    }
});