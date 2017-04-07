Ext.define('WorkplacePortal.controller.FloorPlan', {

    extend: 'Ext.app.Controller',

    config: {
        refs: {
            mainView: 'mainview',
            planTypeButtonPicker: 'mainview buttonpicker',
            floorPlanView: 'workplacePortalFloorPlanPanel',
            floorPlanViewSelectButton: 'workplacePortalFloorPlanPanel > toolbar[docked=bottom] > segmentedbutton',
            roomList: 'roomslist',
            floorPlanContainer: 'workplacePortalFloorPlanPanel > svgcomponent',
            floorPlanZoomButton: 'workplacePortalFloorPlanPanel zoombutton',
            floorPlanTitleBar: 'workplacePortalFloorPlanPanel > titlepanel'
        },
        control: {
            floorPlanViewSelectButton: {
                toggle: 'onFloorPlanViewButtonToggled'
            },
            planTypeButtonPicker: {
                itemselected: function (record) {
                    this.onChangePlanType(record);
                }
            }
        }
    },

    /**
     * Handles the item selected event of the Floor Plan picker button
     *
     * @param planTypeRecord
     */
    onChangePlanType: function (planTypeRecord) {
        var floorPlanPanel = this.getFloorPlanView();

        Space.SpaceFloorPlan.showPlanTypeInTitle(this.getFloorPlanTitleBar(), planTypeRecord, true);
        Space.SpaceFloorPlan.onChangePlanType(floorPlanPanel, planTypeRecord, null, this.updateHighlights, this);
    },

    onFloorPlanViewButtonToggled: function (segmentedButton, button, isPressed) {
        var planTypePicker = this.getPlanTypeButtonPicker();

        Space.SpaceFloorPlan.onFloorPlanViewButtonToggled(button, isPressed, this);
        this.updateHighlights();

        if (planTypePicker) {
            planTypePicker.setHidden(true);
        }
    },

    updateHighlights: function () {
        var floorPlanPanel = this.getFloorPlanView(),
            planType = floorPlanPanel.getPlanType(),
            record = floorPlanPanel.getRecord(),
            fullRmId = this.getFullRmId(record),
            roomsStore = Ext.getStore('roomsStore');

        if (!floorPlanPanel.isPainted()) {
            return;
        }

        if (planType === WorkplacePlansHighlight.planTypes.LOCATE_RM
            || planType === WorkplacePlansHighlight.planTypes.LOCATE_EM
            || planType === WorkplacePlansHighlight.planTypes.RESERVATIONS
            || planType === WorkplacePlansHighlight.planTypes.HOTELING
            || WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.facInfMenuActions.myDeptSpace) {

            WorkplacePlansHighlight.updateFloorPlanHighlight(roomsStore, floorPlanPanel);

            // zoom into the room
            if (WorkplacePortal.util.NavigationHelper.mobileAction !== WorkplacePortal.util.Ui.facInfMenuActions.myDeptSpace) {
                if (!Ext.isEmpty(fullRmId)) {
                    floorPlanPanel.findAssets(fullRmId, {});
                }
            }
        }
    },

    getFullRmId:function(record){
        var fullRmId;

        if (record instanceof Common.data.Model) {
            fullRmId = record.getRoomId();
        } else if (!Ext.isEmpty(record.get('bl_id')) && !Ext.isEmpty(record.get('fl_id')) && !Ext.isEmpty(record.get('rm_id'))) {
            fullRmId = Ext.String.format('{0};{1};{2}', record.get('bl_id'), record.get('fl_id'), record.get('rm_id'));
        }

        return fullRmId;
    }
});