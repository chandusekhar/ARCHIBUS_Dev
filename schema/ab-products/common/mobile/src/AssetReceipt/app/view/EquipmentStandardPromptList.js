Ext.define('AssetReceipt.view.EquipmentStandardPromptList', {
    extend: 'Ext.dataview.List',

    xtype: 'equipmentStandardPromptList',

    config: {
        cls: 'equipment-list',

        defaultType: 'equipmentStandardPromptListItem',

        store: 'equipmentStandardsSyncStore',

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: false
        },

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                iconCls: 'add',
                cls: 'ab-icon-action',
                action: 'createEqStd',
                displayOn: 'all',
                align: 'right'
            }
        ]
    }
});