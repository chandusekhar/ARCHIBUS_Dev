/**
 * Store that creates a client database table using a SQL insert statement.
 * The MaterializedViewStore can be used for cases where the performance of SQLite view is not acceptable.
 * @since 23.1
 * @author Jeff Martin
 */
Ext.define('Common.store.sync.MaterializedViewStore', {
    extend: 'Common.store.sync.SqliteStore',

    isMaterializedView: true,


    config: {
        /**
         * @cfg {String} sqlInsert Insert statement used to populate the client database table.
         */
        sqlInsert: null,

        /**
         * @cfg {String[]} stores that contain the models (tables) used in the sqlInsert statement.
         */
        tableStoreIds: [],

        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        disablePaging: false,
        proxy: {
            type: 'Sqlite'
        }
    },

    insertRecords: function () {
        var me = this,
            db = SqliteConnectionManager.getConnection(),
            sql = me.getSqlInsert();

        return new Promise(function (resolve, reject) {
            db.transaction(function (tx) {
                tx.executeSql(sql, null, resolve, function (tx, error) {
                    reject(error.message);
                });
            });
        });
    },


    populateData: function () {
        var me = this,
            table = me.getProxy().getTable();

        // Load the store so the table is created the first time the data is populated.
        return me.loadStore()
            .then(function () {
                return me.deleteAllRecordsFromTable(table, true);
            })
            .then(function () {
                return me.insertRecords();
            })
            .then(function() {
                return me.recordDownloadTime(me.getStoreId());
            })
            .then(function () {
                return me.loadStore();
            });
    },


    loadStore: function () {
        var me = this;

        return new Promise(function (resolve, reject) {
            me.load(function (records, operation, success) {
                if (success) {
                    resolve(records);
                } else {
                    reject('Loading store: [' + me.$className + '] failed');
                }
            });
        });
    },

    /**
     * Records the download time of the store.
     * @returns {Promise}
     */
    recordDownloadTime: function (storeId) {
        return new Promise(function (resolve) {
            var tableDownloadStore = Ext.getStore('tableDownloadStore'),
                tableRecord;

            if (!tableDownloadStore) {
                resolve();
            } else {
                tableDownloadStore.clearFilter();
                tableDownloadStore.load(function() {
                    tableRecord = tableDownloadStore.findRecord('storeId', storeId);

                    if (tableRecord) {
                        tableRecord.set('downloadTime', new Date());
                        tableRecord.set('reset', 0);
                    } else {
                        tableDownloadStore.add({
                            storeId: storeId,
                            downloadTime: new Date(),
                            reset: 0
                        });
                    }
                    tableDownloadStore.sync(function () {
                        resolve();
                    });
                });
            }
        });
    }

});