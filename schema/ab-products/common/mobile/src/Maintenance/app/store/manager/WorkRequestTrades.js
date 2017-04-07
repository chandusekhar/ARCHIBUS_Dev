Ext.define('Maintenance.store.manager.WorkRequestTrades', {
    extend: 'Common.store.sync.SyncStore',
    requires: ['Maintenance.model.manager.WorkRequestTrade'],

    serverTableName: 'wrtr_sync',
    serverFieldNames: ['tr_id', 'wr_id', 'hours_est', 'date_assigned', 'time_assigned', 'mob_is_changed', 'mob_locked_by'],

    inventoryKeyNames: ['wr_id', 'tr_id'],

    config: {
        model: 'Maintenance.model.manager.WorkRequestTrade',
        storeId: 'workRequestTradesStore',
        enableAutoLoad: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Trades', 'Maintenance.store.manager.WorkRequestTrades'),
        autoSync: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});