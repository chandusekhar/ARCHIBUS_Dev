Ext.define('ConditionAssessment.view.FloorPlan', {
    extend: 'Floorplan.view.FloorPlan',
    requires: 'Floorplan.component.Svg',

    xtype: 'assessmentFloorPlanPanel',

    config: {
        projectId: null,
        blId: null,
        flId: null,

        hideRedlineButton: true,

        items: [
            {
                xtype: 'titlepanel',
                title: LocaleManager.getLocalizedString('Floor Plan For Survey', 'ConditionAssessment.view.FloorPlan'),
                docked: 'top'
            },
            {
                xtype: 'svgcomponent',
                itemId: 'assessmentFloorPlan',
                headerText: LocaleManager.getLocalizedString('Select a highlighted room to list all items in that room, or to jump to that item if there is only one.',
                    'ConditionAssessment.view.FloorPlan'),
                height: '100%'
            }
        ]
    },

    applyRecord: function (newRecord) {
        var data;
        if (newRecord) {
            data = newRecord.getData();
            this.setBlId(data.bl_id);
            this.setFlId(data.fl_id);
        }
        this.callParent(arguments);

        return newRecord;
    }
});