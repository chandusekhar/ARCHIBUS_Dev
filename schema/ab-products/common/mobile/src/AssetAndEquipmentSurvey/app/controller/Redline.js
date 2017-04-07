Ext.define('AssetAndEquipmentSurvey.controller.Redline', {
    extend: 'Floorplan.controller.Redline',

    requires: [
        'AssetAndEquipmentSurvey.util.Filter',
        'AssetAndEquipmentSurvey.view.TaskPromptList'
    ],

    config: {
        refs: {
            mainView: 'main',
            taskPromptList: 'taskPromptList taskList'
        },
        control: {
            taskPromptList: {
                itemtap: 'onTaskItemTap'
            }
        },

        redlineHighlightParameters: [
            {
                view_file: 'ab-eq-survey-eqauditxrm.axvw',
                hs_ds: 'abEqSurveyEqauditxRmHighlight',
                label_ds: 'abEqSurveyEqauditxRmLabel',
                label_clr: 'gray',
                label_ht: '0.90'
            }
        ],

        documentField: 'survey_redline_eq',

        redlineStoreId: 'surveyTasksStore'
    },

    /**
     * Override to allow us to display the TaskPromptList if the redline is not associated with a room.
     * @override
     *
     */
    onSaveImage: function () {
        var me = this,
            currentView = me.getMainView().getNavigationBar().getCurrentView(),  // currentView is the redline view
            record = currentView.getRecord();

        // If we are saving a redline image created from the Floor Plan view then we need to select a room
        // and store it it the correct Task model
        if (record instanceof AssetAndEquipmentSurvey.model.Task) {
            me.saveRedlineData(record);
        } else {
            me.displayTaskPromptList(record);
        }
    },

    displayTaskPromptList: function (record) {
        var me = this,
            store = Ext.getStore('surveyTasksStore'),
            filters = me.buildTaskListFilter(record);

        store.clearFilter();
        store.setFilters(filters);
        store.load(function () {
            if (!me.taskPromptListPanel) {
                me.taskPromptListPanel = Ext.create('AssetAndEquipmentSurvey.view.TaskPromptList');
                Ext.Viewport.add(me.taskPromptListPanel);
            }
            me.taskPromptListPanel.setTaskFilters(filters);
            me.taskPromptListPanel.show();
        }, me);
    },

    buildTaskListFilter: function (record) {
        return [
            {property: 'survey_id', value: record.get('survey_id')},
            {property: 'bl_id', value: record.get('bl_id')},
            {property: 'fl_id', value: record.get('fl_id')}
        ];
    },

    onTaskItemTap: function (list, index, target, record) {
        var me = this;
        if (me.taskPromptListPanel) {
            me.taskPromptListPanel.hide();
        }
        // Give the taskPrompt some time to close
        setTimeout(function() {
            me.saveRedlineData(record);
        },300);

    }

});
