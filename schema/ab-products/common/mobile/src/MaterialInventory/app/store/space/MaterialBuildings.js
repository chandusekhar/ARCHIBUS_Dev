Ext.define('MaterialInventory.store.space.MaterialBuildings', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.space.MaterialBuilding'],

    serverTableName: 'bl',
    serverFieldNames: [
        'bl_id',
        'name',
        'city_id',
        'state_id',
        'ctry_id',
        'address1',
        'address2',
        'bldg_photo',
        'site_id'
    ],

    inventoryKeyNames: ['bl_id'],

    config: {
        model: 'MaterialInventory.model.space.MaterialBuilding',
        tableDisplayName: LocaleManager.getLocalizedString('Buildings', 'MaterialInventory.store.MaterialBuildings'),
        sorters: [
            {
                property: 'bl_id',
                direction: 'ASC'
            }
        ],
        storeId: 'materialBuildings',
        destroyRemovedRecords: false,
        enableAutoLoad: true,
        autoSync: false,
        remoteFilter: true,
        proxy: {
            type: 'Sqlite'
        },
        timestampDownload: false
    }
});