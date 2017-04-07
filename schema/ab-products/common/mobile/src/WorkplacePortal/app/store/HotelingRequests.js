Ext.define('WorkplacePortal.store.HotelingRequests', {

    extend: 'Common.store.sync.ValidatingTableStore',
    requires: [ 'WorkplacePortal.model.HotelingRequest' ],

    serverTableName: 'activity_log',
    serverFieldNames: ['activity_log_id'
    ],

    inventoryKeyNames: [ 'res_id' ],

    config: {
        model: 'WorkplacePortal.model.HotelingRequest',
        storeId: 'hotelingRequestsStore',
        enableAutoLoad: true,
        remoteFilter: true,
        remoteSort: true,
        tableDisplayName: LocaleManager.getLocalizedString('Hoteling Requests', 'WorkplacePortal.store.HotelingRequests'),
        proxy: {
            type: 'Sqlite'
        },

        restriction: [
            {
                tableName: 'activity_log',
                fieldName: 'activity_type',
                operation: 'EQUALS',
                value: 'SERVICE DESK - HOTELING'
            }
        ]
    }
});