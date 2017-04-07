Ext.define('Common.store.RepairTypes', {
    extend : 'Common.store.sync.ValidatingTableStore',
    requires : [ 'Common.model.RepairType' ],

    serverTableName : 'repairty',
    serverFieldNames : [ 'repair_type', 'description' ],
    inventoryKeyNames : [ 'repair_type' ],

    config : {
        autoLoad : false,
        model : 'Common.model.RepairType',
        sorters : [ {
            property : 'description',
            direction : 'ASC'
        } ],
        storeId : 'repairTypesStore',
        enableAutoLoad : true,
        disablePaging: true,
        proxy : {
            type : 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Repair Types', 'Common.store.RepairTypes')
    }
});