Ext.define('Solutions.store.BuildingCodes', {
    extend : 'Common.store.sync.ValidatingTableStore',
    requires : [ 'Solutions.model.BuildingCode' ],

    serverTableName : 'bl',

    serverFieldNames : [ 'bl_id', 'name' ],
    inventoryKeyNames : [ 'bl_id' ],

    config : {
        model : 'Solutions.model.BuildingCode',
        storeId : 'buildingCodes',
        tableDisplayName: LocaleManager.getLocalizedString('Building Codes', 'Common.store.Buildings'),
        remoteSort : true,
        remoteFilter : true,
        sorters : [ {
            property : 'bl_id',
            direction : 'ASC'
        } ],
        enableAutoLoad : true,
        proxy : {
            type : 'Sqlite'
        }
    }
});