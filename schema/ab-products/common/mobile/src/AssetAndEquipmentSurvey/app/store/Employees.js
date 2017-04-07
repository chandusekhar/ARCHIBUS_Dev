Ext.define('AssetAndEquipmentSurvey.store.Employees', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['AssetAndEquipmentSurvey.model.AssetEmployee'],

    serverTableName: 'em',

    serverFieldNames: [
        'em_id',
        'email',
        'bl_id',
        'fl_id',
        'rm_id',
        'phone',
        'name_last',
        'name_first',
        'dv_id',
        'dp_id'
    ],
    inventoryKeyNames: ['em_id'],

    config: {
        model: 'AssetAndEquipmentSurvey.model.AssetEmployee',
        storeId: 'assetEmployees',
        remoteSort: true,
        remoteFilter: true,
        sorters: [
            {
                property: 'em_id',
                direction: 'ASC'
            }
        ],
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        },
        syncRecordsPageSize: 500,
        tableDisplayName: LocaleManager.getLocalizedString('Employees', 'AssetAndEquipmentSurvey.store.Employees')
    }
});