Ext.define('Common.store.Departments', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: [ 'Common.model.Department' ],

    serverTableName: 'dp',

    serverFieldNames: [ 'dp_id', 'dv_id', 'name' ],
    inventoryKeyNames: [ 'dv_id', 'dp_id' ],

    config: {
        model: 'Common.model.Department',
        storeId: 'departmentsStore',
        remoteSort: true,
        remoteFilter: true,
        sorters: [
            {
                property: 'dv_id',
                direction: 'ASC'
            },
            {
                property: 'dp_id',
                direction: 'ASC'
            }
        ],
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Departments', 'Common.store.Departments')
    }
});