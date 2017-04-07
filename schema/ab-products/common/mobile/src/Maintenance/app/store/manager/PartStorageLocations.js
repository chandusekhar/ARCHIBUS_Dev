Ext.define('Maintenance.store.manager.PartStorageLocations', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: 'Maintenance.model.PartStorageLocation',

    serverTableName: 'pt_store_loc_pt',
    serverFieldNames: [
        'pt_store_loc_id',
        'part_id',
        'qty_on_hand',
        'cost_unit_last'

    ],
    inventoryKeyNames: ['pt_store_loc_id'],

    config: {
        model: 'Maintenance.model.PartStorageLocation',
        storeId: 'partStorageLocStore',
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Part Storage Locations', 'Maintenance.store.manager.PartStorageLocations')

    }
});