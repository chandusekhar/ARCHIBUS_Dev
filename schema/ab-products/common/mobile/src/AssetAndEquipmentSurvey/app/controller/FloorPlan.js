Ext.define('AssetAndEquipmentSurvey.controller.FloorPlan', {
    extend: 'Floorplan.controller.FloorPlan',

    config: {
        refs: {
            mainView: 'main',
            taskListView: 'taskListPanel',
            floorPlanView: 'taskFloorPlanPanel'
        },

        surveyTaskMessage: LocaleManager.getLocalizedString('This support space is not included in the survey.',
            'AssetAndEquipmentSurvey.controller.FloorPlan'),
        surveyTaskTitle: LocaleManager.getLocalizedString('Survey Tasks', 'AssetAndEquipmentSurvey.controller.FloorPlan')
    },

    init: function(application) {
        var me = this;
        me.callParent(arguments);
        application.on([{
            event: 'roomtapped',
            fn: me.onRoomTap,
            scope: me
        }]);
    },

    onRoomTap: function (roomCodes) {
        var me = this,
            surveyTaskStore = Ext.getStore('surveyTasksStore'),
            codes = roomCodes.split(';'),
            taskListView = this.getTaskListView(),
            surveyId = taskListView.getSurveyId();

        surveyTaskStore.clearFilter();
        surveyTaskStore.setDisablePaging(true);
        surveyTaskStore.filter([
            {property: "survey_id", value: surveyId},
            {property: "bl_id", value: codes[0]},
            {property: "fl_id", value: codes[1]},
            {property: "rm_id", value: codes[2]}
        ]);
        surveyTaskStore.load(function (records) {
            surveyTaskStore.setDisablePaging(false);
            me.displayPanel(records, roomCodes);
        });
    },

    /**
     *  Display the equipments list if the current room has more items
     *  or the edit equipment form if there is only one in the room.
     * @param records
     * @param roomCodes
     */
    displayPanel: function(records, roomCodes){
        var mainView = this.getMainView(),
            taskRecordCount = 0,
            taskView,
            roomTaskList;
        if (records) {
            taskRecordCount = records.length;
        }
        if (taskRecordCount === 0) {
            //Ext.Msg.alert(this.getSurveyTaskTitle(), this.getSurveyTaskMessage());
            alert(this.getSurveyTaskMessage());
            return;
        }
        if (taskRecordCount === 1) {
            taskView = Ext.create('AssetAndEquipmentSurvey.view.Task', {
                surveyId: records[0].get('survey_id')
            });
            taskView.setRecord(records[0]);
            mainView.push(taskView);
        } else {
            roomTaskList = Ext.create('AssetAndEquipmentSurvey.view.RoomTaskList');
            roomTaskList.setRoomCodes(roomCodes);
            mainView.push(roomTaskList);
        }
    },

    onAfterSvgLoad: function() {
        var me = this,
            floorPlanView = me.getFloorplanView();

        //TODO: Do we want to highlight for redline views?

        if(floorPlanView) {
            // Add highlight attribute to all rooms
            d3.selectAll('#rm-assets').selectAll('*').attr('highlighted', 'true');
            AssetAndEquipmentSurvey.util.RoomHighlight.updateSurveyPlanHighlights(floorPlanView.getRecord());
        }
    }
});