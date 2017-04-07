Ext.define('Common.store.Employees', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Common.model.Employee'],

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
        'dp_id',
        'em_photo'
    ],
    inventoryKeyNames: ['em_id'],

    config: {
        model: 'Common.model.Employee',
        storeId: 'employeesStore',
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
        tableDisplayName: LocaleManager.getLocalizedString('Employees', 'Common.store.Employees')
    }
});