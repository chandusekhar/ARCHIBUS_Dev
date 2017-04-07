Ext.define('AssetReceipt.store.EquipmentStandardsSync', {
    extend: 'Common.store.sync.PagedSyncStore',
    requires: ['AssetReceipt.model.EquipmentStandardSync'],

    serverTableName: 'eqstd_sync',

    serverFieldNames: [
        'eq_std',
        'description',
        'mob_locked_by',
        'mob_is_changed'
    ],
    inventoryKeyNames: ['eq_std'],

    config: {
        model: 'AssetReceipt.model.EquipmentStandardSync',
        storeId: 'equipmentStandardsSyncStore',
        autoSync: true,
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Equipment Standards', 'AssetReceipt.store.EquipmentStandardsSync'),
        sorters: [
            {
                property: 'eq_std',
                direction: 'ASC'
            }
        ],
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});