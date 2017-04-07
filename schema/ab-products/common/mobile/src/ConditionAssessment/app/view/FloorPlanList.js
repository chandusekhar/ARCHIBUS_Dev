Ext.define('ConditionAssessment.view.FloorPlanList', {

    extend: 'Common.view.navigation.ListBase',

    xtype: 'floorPlanList',

    config: {
        title: LocaleManager.getLocalizedString('Floor Plans for Assessment', 'ConditionAssessment.view.FloorPlanList'),
        layout: 'vbox',
        editViewClass: 'ConditionAssessment.view.FloorPlan',
        items: [
            {
                xtype: 'list',
                store: 'projectFloorsStore',
                flex: 1,
                itemId: 'projectFloorList',
                itemTpl: '{bl_id} - {fl_id}',
                plugins: {
                    xclass: 'Common.plugin.ListPaging',
                    autoPaging: false
                }
            }
        ]
    }
});