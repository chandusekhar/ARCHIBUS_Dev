Ext.define('Maintenance.store.manager.WorkRequestTools', {
    extend: 'Common.store.sync.SyncStore',
    requires: ['Maintenance.model.manager.WorkRequestTool'],

    serverTableName: 'wrtl_sync',
    serverFieldNames: ['tool_id', 'wr_id',
        'date_assigned', 'time_assigned', 'hours_est',
        'date_start', 'time_start', 'date_end', 'time_end', 'hours_straight',
        'mob_is_changed', 'mob_locked_by'],

    inventoryKeyNames: ['wr_id', 'tool_id', 'date_assigned', 'time_assigned'],

    config: {
        model: 'Maintenance.model.manager.WorkRequestTool',
        storeId: 'workRequestToolsStore',
        tableDisplayName: LocaleManager.getLocalizedString('Tools', 'Maintenance.store.manager.WorkRequestTools'),
        enableAutoLoad: true,
        remoteFilter: true,
        autoSync: true,
        proxy: {
            type: 'Sqlite'
        }
    },

    importRecords: function (lastModifiedTimestamp) {
        var me = this;

        return me.callParent([lastModifiedTimestamp])
            .then(function () {
                return me.setMobileWorkRequest();
            });
    },

    setMobileWorkRequest: function () {
        var me = this,
            table = me.getProxy().getTable();
        return new Promise(function (resolve, reject) {
            var db = Common.store.proxy.SqliteConnectionManager.getConnection(),
                sql = 'UPDATE ' + table + ' SET mob_wr_id = (SELECT mob_wr_id FROM WorkRequest WHERE WorkRequest.wr_id = ' + table + '.wr_id)';

            db.transaction(function (tx) {
                tx.executeSql(sql, null, resolve, function (tx, error) {
                    reject(error.message);
                });
            });
        });
    }
});