Ext.define('Maintenance.store.manager.StorageLocations', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Maintenance.model.StorageLocation'],

    serverTableName: 'pt_store_loc',
    serverFieldNames: [
        'pt_store_loc_id',
        'pt_store_loc_name',
        'site_id',
        'bl_id',
        'fl_id',
        'rm_id'
    ],
    inventoryKeyNames: ['pt_store_loc_id'],

    config: {
        model: 'Maintenance.model.StorageLocation',
        sorters: [
            {
                property: 'pt_store_loc_id',
                direction: 'ASC'
            }
        ],
        storeId: 'storageLocStore',
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Storage Locations', 'Maintenance.store.manager.StorageLocations')

    }
});