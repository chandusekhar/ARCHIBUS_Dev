/**
 * Contains a collection of {@link Ext.data.Model} objects for Validating data. Validating data is typically used for
 * lookup values such as Building, Floor and Room data. Validating data is read only. Validating data is only downloaded
 * from the server. The models in this store are never updated.
 *
 * For performance reasons, the validating data downloaded from the server is not converted to {@link Ext.data.Model}
 * objects before inserting into the database. There is no data conversion performed when downloading the data. For
 * this reason the fields contained in the {@link Ext.data.Model} should:
 *
 *  - always have fields of type string;
 *  - never have fields of type int, date, time, number (Double, Float).
 *
 *  Defining a store for a collection of Building models.
 *
 *     Ext.define('Common.store.Buildings', {
 *         extend : 'Common.store.sync.ValidatingTableStore',
 *         requires : [ 'Common.model.Building' ],
 *
 *         serverTableName : 'bl',
 *         serverFieldNames : [ 'bl_id', 'site_id', 'pr_id', 'name' ],
 *         inventoryKeyNames : [ 'bl_id' ],
 *
 *         config : {
 *             model : 'Common.model.Building',
 *             storeId : 'buildingsStore',
 *             remoteSort : true,
 *             remoteFilter : true,
 *             sorters : [
 *                  {
 *                      property : 'bl_id',
 *                      direction : 'ASC'
 *                  }],
 *              enableAutoLoad : true,
 *              proxy : {
 *              type : 'Sqlite'
 *            }
 *         }
 *     });
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.store.sync.ValidatingTableStore', {
    extend: 'Common.store.sync.SchemaUpdaterStore',
    requires: [
        'Common.service.MobileSyncServiceAdapter',
        'Common.service.ExceptionTranslator',
        'Common.controller.EventBus',
        'Common.service.Session'
    ],

    TRACKED_SYNC_TABLES_PARAM: 'AbCommonResources-MobileSyncDataChangesOnlyTables',

    isValidatingTableStore: true,

    tableDef: null,

    config: {
        /**
         * @cfg {Number} syncRecordsPageSize The number of records to retrieve at one time from the Web Central server.
         */
        syncRecordsPageSize: 1000,

        /**
         * @cfg {Boolean} timestampDownload default to true for all validating tables.
         */
        timestampDownload: true
    },

    /**
     * Returns true if the server side table is included in the TRACKED_SYNC_TABLES_PARAM
     * activity parameter.
     * @returns {Boolean} true if the server side table changes are tracked, false otherwise.
     */
    serverTableIsTracked: function () {
        var me = this,
            parametersStore = Ext.getStore('appPreferencesStore'),
            trackedTablesList = parametersStore.getParameter(me.TRACKED_SYNC_TABLES_PARAM),
            trackedTables;

        if (trackedTablesList) {
            trackedTables = trackedTablesList.toLocaleLowerCase().split(';');
            return Ext.Array.contains(trackedTables, me.serverTableName);
        } else {
            return false;
        }
    },

    /**
     * Returns true if the store should use the timestamp download feature.
     * The timestampDownload configuration overrides other configurations when
     * the timestampDownload value is false.
     * @param timestamp
     * @param resetFlag
     * @returns {boolean}
     */
    useTimestampDownload: function(timestamp, resetFlag) {
        var me = this,
            timestampDownload = me.getTimestampDownload(),
            isServerTableTracked,
            useTimestampDownload = false;

        // Do not use the timestamp download feature if the timestampDownload feature is
        if(!timestampDownload) {
            return useTimestampDownload;
        }

        // Download and replace all records if a reset is requested or if the timestamp
        // value is 0
        if(timestamp === 0 || resetFlag === 1) {
            return useTimestampDownload;
        }

        isServerTableTracked = me.serverTableIsTracked();
        useTimestampDownload = isServerTableTracked && timestampDownload;

        return useTimestampDownload;
    },

    getStoreDownloadResetFlag: function () {
        var me = this;
        return new Promise(function (resolve, reject) {
            var tableDownloadStore = Ext.getStore('tableDownloadStore');
            tableDownloadStore.load({
                callback: function (records, operation, success) {
                    var downloadRecord,
                        resetFlag = 0;
                    if (success) {
                        downloadRecord = tableDownloadStore.findRecord('storeId', me.getStoreId());
                        if (downloadRecord) {
                            resetFlag = downloadRecord.get('reset');
                        }
                        resolve(resetFlag);
                    } else {
                        reject('Error loading TableDownload store');
                    }
                },
                scope: me
            });
        });
    },

    /**
     * @deprecated Use deleteAndImportRecords instead
     * @param onCompleted
     * @param scope
     */
    clearAndImportRecords: function (onCompleted, scope) {
        var me = this,
            doComplete = function (result) {
                Common.service.Session.end().
                then(function () {
                    Ext.callback(onCompleted, scope || me, [result]);
                });
            };

        Common.service.Session.start()
            .then(function () {
                me.deleteAndImportRecords()
                    .then(function () {
                        doComplete(true);
                    }, function (errorMessage) {
                        Ext.Msg.alert('', errorMessage);
                        doComplete(false);
                    });
            }, function () {
                doComplete(false);
            });
    },

    deleteAndImportRecords: function () {
        var me = this,
            restriction = me.getRestriction(),
            model = me.getModel(),
            table = me.getProxy().getTable(),
            deleteAllRecordsOnSync = me.getDeleteAllRecordsOnSync(),
            lastDownloadTimestamp = 0,
            resetFlag = 0,
            useTimestampDownload = false;

        Common.controller.EventBus.fireStoreSyncStart(me);

        return Common.service.MobileSyncServiceAdapter.getTableDef(me.serverTableName)
            .then(function (tableDef) {
                me.tableDef = tableDef;
                return me.createTableIfNotExists(table, model);
            })
            .then(function () {
                return me.updateIfNotModelAndTable(me.tableDef);
            })
            .then(function () {
                return me.getStoreDownloadResetFlag();
            })
            .then(function (downloadResetFlag) {
                resetFlag = downloadResetFlag;
                return MobileSyncServiceAdapter.retrieveLastTableDownloadTime(table);
            })
            .then(function (timestamp) {
                lastDownloadTimestamp = timestamp;
                useTimestampDownload = me.useTimestampDownload(timestamp, resetFlag);
                if (!useTimestampDownload) {
                    lastDownloadTimestamp = 0;
                    return me.deleteAllRecordsFromTable(table, deleteAllRecordsOnSync);
                }
            })
            .then(function () {
                return me.importRecords(restriction, deleteAllRecordsOnSync, lastDownloadTimestamp);
            })
            .then(function () {
                return me.retrieveRecordsToDelete(me.serverTableName, lastDownloadTimestamp, useTimestampDownload);
            })
            .then(function (recordsToDelete) {
                return me.deleteValidatingTableRecords(recordsToDelete, table, me.inventoryKeyNames);
            })
            .then(function () {
                return MobileSyncServiceAdapter.recordLastTableDownloadTime(table, me.serverTableName);
            })
            .then(function () {
                Common.controller.EventBus.fireStoreSyncEnd(me);
                return me.recordDownloadTime();
            });
    },

    /**
     * @private
     * @param restriction
     * @returns {*}
     */
    importRecords: function (restriction, deleteAllRecordsOnSync, timestamp) {
        var me = this,
            resolveFunc,
            rejectFunc,
            pageSize = me.getSyncRecordsPageSize(),
            pagingRestriction = restriction,
            storeRestriction = me.getRestriction(),
            numberOfImportedRecords = pageSize,
            proxy = me.getProxy(),
            table = proxy.getTable(),
            columns = proxy.getColumns();

        var p = new Promise(function (resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        });

        var doImportRecords = function () {
            if (numberOfImportedRecords === 0 || numberOfImportedRecords < pageSize) {
                resolveFunc();
            } else {
                me.retrieveRecords(pagingRestriction, pageSize, timestamp)
                    .then(function (records) {
                        numberOfImportedRecords = records.length;
                        pagingRestriction = me.createRestrictionUsingLastRecord(records, storeRestriction);
                        return me.convertRecordsFromServer(records);
                    }, function (error) {  // retrieveRecords error handler
                        numberOfImportedRecords = 0;  // End recursion
                        rejectFunc(error);
                    })
                    .then(function (convertedRecords) {
                        return me.insertRecords(convertedRecords, table, columns, me.getModel(), deleteAllRecordsOnSync);
                    })
                    .then(null, function (error) {
                        numberOfImportedRecords = 0;  // End recursion
                        rejectFunc(error);
                    })
                    .then(function () {
                        doImportRecords();
                    });
            }
        };

        doImportRecords();

        return p;
    },

    retrieveRecordsToDelete: function (serverTableName, timestamp, useTimestampDownload) {
        if(!useTimestampDownload) {
            return Promise.resolve([]);
        } else {
            return Common.service.MobileSyncServiceAdapter.retrieveDeletedRecords(serverTableName, timestamp);
        }
    },

    /**
     * @private
     * @returns {Promise}
     */
    recordDownloadTime: function () {
        var me = this,
            deleteAllRecordsOnSync = me.getDeleteAllRecordsOnSync();

        // Do not record the table download time if this is a Partial Sync.
        if (!deleteAllRecordsOnSync) {
            return Promise.resolve();
        } else {
            return new Promise(function (resolve) {
                var storeId = me.getStoreId(),
                    tableDownloadStore = Ext.getStore('tableDownloadStore'),
                    tableRecord;

                if (!tableDownloadStore) {
                    resolve();
                } else {
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
                }
            });
        }
    },

    deleteValidatingTableRecords: function (records, table, keyFields) {
        var me = this;
        if (records.length === 0) {
            return Promise.resolve();
        } else {
            return new Promise(function (resolve, reject) {
                var db = Common.store.proxy.SqliteConnectionManager.getConnection(),
                    deleteSql = 'DELETE FROM ' + table + ' WHERE ',
                    keyFieldsAndValues = me.convertDeletedValidatingRecordsFromServer(records, keyFields),
                    recordsToDelete = keyFieldsAndValues.length,
                    recordsDeleted = 0;

                db.transaction(function (tx) {
                    keyFieldsAndValues.forEach(function (keyField) {
                        var whereClause = me.generateDeleteWhereClause(keyField),
                            sql = deleteSql + whereClause.clause;

                        tx.executeSql(sql, whereClause.values, function () {
                            recordsDeleted++;
                            if (recordsDeleted === recordsToDelete) {
                                resolve();
                            }
                        }, function (tx, error) {
                            reject(error.message);
                        });
                    });
                });
            });
        }
    },

    convertDeletedValidatingRecordsFromServer: function (records, keyFields) {

        var keyFieldsAndValues = [];

        records.forEach(function (record) {
            // Convert the delimited key value to an array
            var keyValues = record.fieldValues[0].fieldValue.split('|'),
                keysAndValues = {},
                i;

            for (i = 0; i < keyFields.length; i++) {
                keysAndValues[keyFields[i]] = keyValues[i];
            }
            keyFieldsAndValues.push(keysAndValues);
        });

        return keyFieldsAndValues;
    }


});