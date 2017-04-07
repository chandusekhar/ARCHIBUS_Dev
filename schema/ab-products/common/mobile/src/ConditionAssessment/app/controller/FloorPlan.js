Ext.define('ConditionAssessment.controller.FloorPlan', {
    extend: 'Floorplan.controller.FloorPlan',

    config: {
        refs: {
            mainView: 'mainview',
            assessmentListView: 'conditionAssessmentListPanel'
        },

        conditionAssessmentMessage: LocaleManager.getLocalizedString('This support space is not included in the project.',
            'ConditionAssessment.controller.FloorPlan'),
        conditionAssessmentTitle: LocaleManager.getLocalizedString('Condition Assessment Items',
            'ConditionAssessment.controller.FloorPlan')
    },

    init: function (application) {
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
            conditionAssessmentsStore = Ext.getStore('conditionAssessmentsStore'),
            codes = roomCodes.split(';'),
            assessmentListView = me.getAssessmentListView(),
            projectId = assessmentListView.getProjectId();

        conditionAssessmentsStore.clearFilter();
        conditionAssessmentsStore.setDisablePaging(true);
        conditionAssessmentsStore.filter([
            {property: "project_id", value: projectId},
            {property: "bl_id", value: codes[0]},
            {property: "fl_id", value: codes[1]},
            {property: "rm_id", value: codes[2]}
        ]);
        conditionAssessmentsStore.load(function (records) {
            conditionAssessmentsStore.setDisablePaging(false);
            me.displayPanel(records);
        });
    },

    /**
     *  Display the assessments list if the current room has more items
     *  or the edit assessment form if there is only one in the room.
     * @param records
     */
    displayPanel: function (records) {
        var me = this,
            mainView = me.getMainView(),
            assessmentRecordCount = 0,
            conditionAssessmentView,
            roomConditionAssessmentList;

        if (records) {
            assessmentRecordCount = records.length;
        }
        if (assessmentRecordCount === 0) {
            Ext.Msg.alert(me.getConditionAssessmentTitle(), me.getConditionAssessmentMessage());
        }
        else if (assessmentRecordCount === 1) {
            conditionAssessmentView = Ext.create('ConditionAssessment.view.ConditionAssessment', {
                projectId: records[0].get('project_id')
            });
            conditionAssessmentView.setRecord(records[0]);
            mainView.push(conditionAssessmentView);
        }
        else {
            roomConditionAssessmentList = Ext.create('ConditionAssessment.view.ConditionAssessmentList');
            mainView.push(roomConditionAssessmentList);
        }
    }
});