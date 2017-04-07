Ext.define('AssetAndEquipmentSurvey.view.FloorPlan', {
    extend: 'Floorplan.view.FloorPlan',

    xtype: 'taskFloorPlanPanel',

    config: {
        surveyId: null,
        blId: null,
        flId: null,

        title: LocaleManager.getLocalizedString('Floor Plan For Survey', 'AssetAndEquipmentSurvey.view.FloorPlan'),

        record: null,

        items: [
            {
                xtype: 'titlepanel',
                title: LocaleManager.getLocalizedString('Floor Plan For Survey', 'AssetAndEquipmentSurvey.view.FloorPlan'),
                docked: 'top'
            },
            {
                xtype: 'svgcomponent',
                headerText: LocaleManager.getLocalizedString('Select a highlighted room to list all tasks in that room, or to jump to that task if there is only one.',
                    'AssetAndEquipmentSurvey.view.FloorPlan')
            }
        ]

    },

    applyRecord: function (newRecord) {
        if (newRecord) {
            this.setSurveyId(newRecord.get('survey_id'));
            this.setBlId(newRecord.get('bl_id'));
            this.setFlId(newRecord.get('fl_id'));
        }
        this.callParent(arguments);

        return newRecord;
    }

});