Ext.define('AssetAndEquipmentSurvey.view.FloorPlanList', {
    extend: 'Common.view.navigation.ListBase',

    xtype: 'floorPlanList',

    config: {
        layout: 'vbox',
        editViewClass: 'AssetAndEquipmentSurvey.view.FloorPlan',
        title: LocaleManager.getLocalizedString('Floor Plans', 'AssetAndEquipmentSurvey.view.FloorPlanList'),

        items: [
            {
                xtype: 'list',
                store: 'taskFloorsStore',
                flex: 1,
                itemId: 'taskFloorList',
                itemTpl: '{bl_id} - {fl_id}',
                plugins: {
                    xclass: 'Common.plugin.ListPaging',
                    autoPaging: false
                }
            }
        ]
    }
});