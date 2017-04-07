Ext.define('Common.store.EquipmentStandards', {
    extend : 'Common.store.sync.ValidatingTableStore',
    requires : [ 'Common.model.EquipmentStandard' ],

    serverTableName : 'eqstd',

    serverFieldNames : [ 'eq_std', 'description' ],
    inventoryKeyNames : [ 'eq_std' ],

    config : {
        model : 'Common.model.EquipmentStandard',
        storeId : 'equipmentStandardsStore',
        tableDisplayName: LocaleManager.getLocalizedString('Equipment Standards', 'Common.store.EquipmentStandards'),
        remoteSort : true,
        remoteFilter : true,
        sorters : [ {
            property : 'eq_std',
            direction : 'ASC'
        } ],
        enableAutoLoad : true,
        proxy : {
            type : 'Sqlite'
        }
    }
});