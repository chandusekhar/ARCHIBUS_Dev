Ext.define('WorkplacePortal.store.WorkspaceTransactions', {

    extend: 'Common.store.sync.ValidatingTableStore',
    requires: [ 'WorkplacePortal.model.HotelingBooking' ],

    serverTableName: 'rmpct',
    serverFieldNames: [
        'pct_id', 'parent_pct_id', 'visitor_id',
        'date_start', 'date_end', 'day_part',
        'bl_id', 'fl_id', 'rm_id', 'dv_id', 'dp_id',
        'status', 'em_id', 'activity_log_id', 'confirmed'
    ],

    inventoryKeyNames: [ 'pct_id' ],

    config: {
        model: 'WorkplacePortal.model.HotelingBooking',
        storeId: 'workspaceTransactionsStore',
        enableAutoLoad: true,
        remoteFilter: true,
        remoteSort: true,
        tableDisplayName: LocaleManager.getLocalizedString('Hoteling Bookings', 'WorkplacePortal.store.WorkspaceTransactions'),
        proxy: {
            type: 'Sqlite'
        },

        restriction: [
            {
                tableName: 'rmpct',
                fieldName: 'status',
                operation: 'EQUALS',
                value: '1'
            }
        ]
    }
});