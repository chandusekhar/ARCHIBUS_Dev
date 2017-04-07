Ext.define('AssetReceipt.view.EquipmentList', {
    extend: 'Ext.dataview.List',

    xtype: 'equipmentList',

    config: {
        cls: 'equipment-list',

        defaultType: 'equipmentListItem',

        store: 'assetReceiptEquipment',

        plugins: {
            xclass: 'Common.plugin.DataViewListPaging',
            autoPaging: false
        }
    }
});