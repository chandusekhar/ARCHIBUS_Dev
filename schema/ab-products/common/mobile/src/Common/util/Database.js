/* global sqlitePlugin */
/**
 * Database utility functions
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.util.Database', {
    requires: 'Common.env.Feature',

    singleton: true,

    /**
     * Retrieves a list of all database tables in the Sqlite database.
     * Does not include the system tables
     * @returns {Promise}
     */
    getAllDatabaseTables: function () {
        return new Promise(function (resolve, reject) {
            var tableNames = [],
                db = SqliteConnectionManager.getConnection(),
                sql = "SELECT name FROM sqlite_master WHERE type='table' and name NOT IN ('__WebKitDatabaseInfoTable__','sqlite_sequence', 'AppCache')",
                i;

            db.transaction(function (tx) {
                tx.executeSql(sql, null, function (tx, result) {
                    if (result.rows.length > 0) {
                        for (i = 0; i < result.rows.length; i++) {
                            tableNames.push(result.rows.item(i).name);
                        }
                    }
                    resolve(tableNames);
                }, function (tx, error) {
                    reject(error.message);
                });
            });
        });
    },

    /**
     * Deletes the data from all database tables excluding the system tables.
     * @returns {Promise}
     */
    deleteFromAllTables: function () {
        var me = this;
        return me.getAllDatabaseTables()
            .then(function (tables) {
                return Promise.all(tables.map(function (table) {
                    me.deleteDataFromTable(table);
                }));
            });
    },

    /**
     * Deletes all records from the database table
     * @param {String} tableName Name of the database table
     * @returns {Promise}
     *
     */
    deleteDataFromTable: function (tableName) {
        return new Promise(function (resolve, reject) {
            var db = SqliteConnectionManager.getConnection(),
                sql = 'DELETE FROM ' + tableName;

            db.transaction(function (tx) {
                tx.executeSql(sql, null, resolve, function (tx, error) {
                    reject(error.message);
                });
            });
        });

    },

    /**
     * Deletes the Sqlite database from the device. Does nothing when executing on the Desktop
     * @returns {Promise}
     */
    deleteDatabase: function (databaseName) {
        return new Promise(function (resolve, reject) {
            var db;

            if (Common.env.Feature.isNative) {
                db = SqliteConnectionManager.getConnection();
                if (db) {
                    db.close();
                }
                sqlitePlugin.deleteDatabase(databaseName, function () {
                    Log.log('Deleted database [' + databaseName + ']', 'verbose');
                    SqliteConnectionManager.invalidateConnection();
                    resolve();
                }, function (error) {
                    SqliteConnectionManager.invalidateConnection();
                    reject(error);
                });
            } else {
                resolve();
            }
        });
    },

    /**
     * Deletes the database files for each of the databases referenced in the ConfigFileManager
     * database map.
     * @returns {Promise}
     */
    deleteAllDatabases: function() {
        var me = this,
            dbMap = ConfigFileManager.dbMap,
            dbNames = [],
            p;

        if(dbMap) {
            for(p in dbMap) {
                if(dbMap.hasOwnProperty(p)) {
                    dbNames.push(dbMap[p]);
                }
            }
            return Promise.all(dbNames.map(me.deleteDatabase));
        } else {
            return Promise.resolve();
        }
    }
});