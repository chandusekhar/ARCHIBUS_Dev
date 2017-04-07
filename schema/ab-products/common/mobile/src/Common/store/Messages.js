Ext.define('Common.store.Messages', {
    extend: 'Common.store.sync.SyncStore',

    requires: [
        'Common.model.Message',
        'Common.store.proxy.SqliteConnectionManager'
    ],

    serverTableName: 'mobile_log',
    serverFieldNames: [
        'message_id',
        'user_name',
        'device_id',
        'message_timestamp',
        'priority',
        'log_message',
        'application',
        'mob_is_changed',
        'mob_locked_by'
    ],

    inventoryKeyNames: ['message_id'],

    config: {
        model: 'Common.model.Message',
        storeId: 'messages',
        proxy: {
            type: 'Sqlite'
        }
    },

    /**
     * Synchronizes the store with the server. Applies the restriction to the server before getting
     * records from the server.
     *
     */
    synchronize: function () {
        var me = this;

        return me.getChangedOnMobileRecords()
            .then(function (records) {
                return me.checkInRecords(records);
            })
            .then(function() {
                return me.resetMobIsChanged();
            });
    },

    /**
     * Resets the mob_is_changed field in the client database. There could be thousands of log records so we
     * update the client database directly instead of loading a store with thousands of model records.
     */
    resetMobIsChanged: function () {
        return new Promise(function (resolve, reject) {
            var db = SqliteConnectionManager.getConnection(),
                sql = 'UPDATE Message SET mob_is_changed = 0';

            db.transaction(function (tx) {
                tx.executeSql(sql, null, resolve, function (tx, error) {
                    reject(error.message);
                });
            });
        });
    }

});