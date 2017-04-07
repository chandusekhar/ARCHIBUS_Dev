/**
 * @since 22.1
 */
Ext.define('Common.sync.Manager', {
    alternateClassName: ['SyncManager'],
    singleton: true,

    requires: [
        'Common.log.Logger'
    ],


    syncMessageView: null,

    /**
     * @property syncIsActive true when a sync is in progress
     */
    syncIsActive: false,

    fieldSizeLimitErrors: [],

    messages: {
        errorTitle: LocaleManager.getLocalizedString('Error', 'Common.sync.Manager'),
        downloadPrefix: LocaleManager.getLocalizedString('Downloading', 'Common.sync.Manager'),
        syncPrefix: LocaleManager.getLocalizedString('Syncing', 'Common.sycn.Manager')
    },

    constructor: function () {
        var me = this;
        // Register the fieldsizelimitexceeded even
        Common.controller.EventBus.on('fieldsizelimitexceeded', me.fieldSizeLimitExceeded, me);

        Common.controller.EventBus.on('storesyncstart', me.onStoreSyncStart, me);
        Common.controller.EventBus.on('storesyncend', me.onStoreSyncEnd, me);
    },

    /**
     * Wraps the passed in Promise chain in a Web Central session. The session is gauranteed to be
     * closed if an error occurs.
     * Displays any errors reported by the passed in Promise chain
     * @param {Promise} promiseChain A Promise of a chain of Promises containing the sync steps to be executed
     * @returns {Promise}
     */
    doInSession: function (promiseChain, displayConnectionMessage) {

        var closeSessionAndCleanUp = function (success) {
                SyncManager.endSync();
                return Common.service.Session.end()
                    .then(function () {
                        if (success) {
                            return Promise.resolve();
                        } else {
                            return Promise.reject();
                        }
                    });
            },
            displayMessage = true;

        if (!Ext.isEmpty(displayConnectionMessage)) {
            displayMessage = displayConnectionMessage;
        }

        // Check network connection
        Mask.displayLoadingMask();
        return Network.checkNetworkConnectionAndLoadDwrScripts(displayMessage)
            .then(function (isConnected) {
                Mask.hideLoadingMask();
                if (isConnected) {
                    SyncManager.startSync();
                    return Common.service.Session.start()
                        .then(promiseChain)  // Execute the required sync steps here...
                        .then(function () {
                            return closeSessionAndCleanUp(true);
                        })
                        .then(null, function (error) {
                            Log.log(error, 'error');
                            Ext.Msg.alert('', error);
                            // Close the session if there is an error
                            return closeSessionAndCleanUp(false);
                        });
                }
            }, function() {
                Mask.hideLoadingMask();
            });

    },


    /**
     *
     * @param {String[]} validatingStoreIds An array of validating store ids to download. When empty, all
     * of the application validating stores are downloaded.
     * The common application validating table stores are always downloaded if required by the table download timestamp.
     */
    downloadValidatingTables: function (validatingStoreIds) {
        var validatingStores,
            commonAppValidatingStores,

            syncStores = function (stores) {
                var p = Promise.resolve();
                stores.forEach(function (store) {
                    p = p.then(function () {
                        return store.deleteAndImportRecords();
                    });
                });
                return p;
            };

        if (validatingStoreIds && Ext.isArray(validatingStoreIds)) {
            // Include the common application stores in the sync
            commonAppValidatingStores = Ext.global.window[Common.Application.appName].app.getCommonApplicationValidatingStores();

            validatingStores = validatingStoreIds.map(Ext.getStore);
            validatingStores = commonAppValidatingStores.concat(validatingStores);

        } else {
            // Download all validating table stores for the app
            validatingStores = SyncManager.getValidatingStores();
        }

        return syncStores(validatingStores);
    },


    syncTransactionTables: function (transactionTableStoreIds) {
        var syncStores = function (stores) {
            var p = Promise.resolve();
            stores.forEach(function (storeId) {
                p = p.then(function () {
                    return SyncManager.doSyncStore(storeId);
                });
            });
            return p;
        };

        if (Ext.isString(transactionTableStoreIds)) {
            transactionTableStoreIds = [transactionTableStoreIds];
        }

        return syncStores(transactionTableStoreIds);
    },

    doSyncStore: function (storeId) {
        return new Promise(function (resolve, reject) {
            var store = Ext.getStore(storeId),
                model = store.getModel();

            store.suspendEvents();
            model.prototype.disableEditHandling = true;

            store.syncStore().then(function () {
                store.resumeEvents(true);
                model.prototype.disableEditHandling = false;
                resolve();
            }, reject);
        });
    },

    syncMaterializedViews: function () {
        var me = this,
            materializedViews = me.getMaterializedViewStores();

        return Promise.all(materializedViews.map(me.isMaterializedViewStale.bind(me)))
            .then(function (storesArray) {
                var staleStores = [];
                // Remove null items in the stores array
                storesArray.forEach(function (store) {
                    if (store !== null) {
                        staleStores.push(store);
                    }
                });

                return me.clearTableDownloadFiltersAndLoad()
                    .then(function() {
                        return me.doSyncMaterializedViews(staleStores);
                    });
            });
    },

    doSyncMaterializedViews: function(stores) {
        var p = Promise.resolve();
        stores.forEach(function (store) {
            p = p.then(function () {
                return store.populateData();
            });
        });
        return p;
    },

    /**
     * Uploads the modified client records to the Web Central sync table
     * @param {String[]} transactionTableStoreIds An array of storeIds
     */
    uploadModifiedRecords: function (transactionTableStoreIds) {
        var syncStores = function (stores) {
            var p = Promise.resolve();
            stores.forEach(function (storeId) {
                p = p.then(function () {
                    return Ext.getStore(storeId).uploadModifiedRecords();
                });
            });
            return p;
        };

        if (Ext.isString(transactionTableStoreIds)) {
            transactionTableStoreIds = [transactionTableStoreIds];
        }

        return syncStores(transactionTableStoreIds);
    },

    /**
     * Downloads the Web Central sync table records to the client database
     * @param transactionTableStoreIds
     */
    downloadTransactionRecords: function (transactionTableStoreIds) {
        var syncStores = function (stores) {
            var p = Promise.resolve();
            stores.forEach(function (storeId) {
                p = p.then(function () {
                    return Ext.getStore(storeId).downloadTransactionRecords();
                });
            });
            return p;
        };

        if (Ext.isString(transactionTableStoreIds)) {
            transactionTableStoreIds = [transactionTableStoreIds];
        }

        return syncStores(transactionTableStoreIds);
    },


    /**
     * Downloads a table for a single validating table store. The last download time is not
     * checked. The table is always downloaded.
     * @param {String/Ext.data.Store} store The store to download
     * @returns {Promise}
     */
    downloadValidatingTable: function (store) {
        if (Ext.isString(store)) {
            store = Ext.getStore(store);
        }
        return store.deleteAndImportRecords();
    },

    /**
     * Get an array of all of the validating stores for the application.
     *
     * @return {Array} Validating stores.
     */
    // Duplicated
    getValidatingStores: function (allStores) {
        var me = this,
            validatingStores = [],
            upToDateStoreIds;

        Ext.data.StoreManager.each(function (store) {
            if (store instanceof Common.store.sync.ValidatingTableStore) {
                validatingStores.push(store);
            }
        });

        if (allStores) {
            return validatingStores;
        } else {
            upToDateStoreIds = me.getUpToDateValidatingStores(validatingStores);
            return me.getStoresToSync(validatingStores, upToDateStoreIds);
        }
    },

    //Duplicated
    getStoresToSync: function (validatingStores, upToDateStoreIds) {
        var clone = Ext.Array.clone(validatingStores),
            lnClone = validatingStores.length,
            lnId = upToDateStoreIds.length,
            i, j;

        for (i = 0; i < lnId; i++) {
            for (j = 0; j < lnClone; j++) {
                if (clone[j].getStoreId() === upToDateStoreIds[i]) {
                    clone.splice(j, 1);
                    j--;
                    lnClone--;
                }
            }
        }
        return clone;
    },

    /**
     * @private
     * @returns {Array}
     */
    //Duplicated in Common.util.SynchonizationManager
    getUpToDateValidatingStores: function () {
        var tableDownloadStore = Ext.getStore('tableDownloadStore'),
            upToDateStoreIds = [],
            thresholdDate = new Date(),
            expirationTime = this.getBackgroundDataExpirationTime(),

        // Convert expirationTime from hours to milliseconds
            thresholdUtcTime = thresholdDate.getTime() - (expirationTime * 60 * 60 * 1000);

        // The app may not have the Table Download Store defined. Check if it exists
        // before using.
        if (tableDownloadStore) {
            tableDownloadStore.each(function (record) {
                var downloadTime = record.get('downloadTime');
                if (downloadTime) {
                    if (downloadTime.getTime() > thresholdUtcTime) {
                        upToDateStoreIds.push(record.get('storeId'));
                    }
                }
            });
        }
        return upToDateStoreIds;
    },

    getBackgroundDataExpirationTime: function () {
        var appPreferences = Ext.getStore('appPreferencesStore'),
            dataExpirationRecord = appPreferences.findRecord('param_id', 'BackgroundDataExpiration'),
            paramValue = null; // 12 hours is the default

        if (dataExpirationRecord) {
            paramValue = dataExpirationRecord.get('param_value');
        }
        paramValue = paramValue === null ? 12 : paramValue;
        return parseInt(paramValue, 10);
    },

    /**
     * Returns true if any of the validating tables require downloading
     *
     */
    isValidatingTableSyncRequired: function () {
        return (this.getValidatingStores().length > 0);
    },

    /**
     * Returns an array of Stores that have a proxy type of Common.store.proxy.SqliteView
     */
    getSqliteViewStores: function () {
        var sqliteViewStores = [];

        Ext.data.StoreManager.each(function (store) {
            var proxy = store.getProxy();
            if (proxy && proxy.isSqliteViewProxy && !proxy.getUsesTransactionTable()) {
                sqliteViewStores.push(store);
            }
        });

        return sqliteViewStores;
    },

    /**
     * Loads the stores sequentially
     * @param {String[], Ext.data.Store[]} stores The stores to load. The stores array can be an array of store id's or
     * an array of Ext.data.Store objects
     * @returns {Promise}
     */
    loadStores: function (stores) {
        var me = this,
            storeLoader = function (stores) {
                var p = Promise.resolve();
                stores.forEach(function (store) {
                    p = p.then(function () {
                        return me.loadStore(store);
                    });
                });
                return p;
            };
        return storeLoader(stores);
    },

    /**
     * Loads a single store
     * @param store
     * @returns {Promise}
     */
    loadStore: function (store) {
        if (Ext.isString(store)) {
            store = Ext.getStore(store);
        }
        return new Promise(function (resolve) {
            store.load(function (records) {
                Log.log('Store loaded store: ' + store.$className, 'verbose');
                resolve(records);
            });
        });
    },

    /**
     * Loads all of the validating stores after the sync is completed.
     * Stores that use the SqliteView proxy are loaded last. This allows
     * all of the validating base tables to be created before the SqliteView s
     * stores are loaded. SqliteView stores are not loaded if the usesTransactionTable
     * property is true
     */
    loadStoresAfterSync: function () {
        var me = this,
            tableDownloadStore = Ext.getStore('tableDownloadStore'),
            validatingStores = me.getValidatingStores(true),
            sqliteViewStores = me.getSqliteViewStores(),
            storesToLoad;

        validatingStores.push(tableDownloadStore);
        storesToLoad = validatingStores.concat(sqliteViewStores);
        return me.loadStores(storesToLoad);
    },

    startSync: function () {
        this.syncIsActive = true;
        Mask.displayLoadingMask();
    },

    endSync: function () {
        var me = this;

        me.syncIsActive = false;
        Mask.hideLoadingMask();

        // The fieldSizeLimitErrors array will only have data for Android devices.
        if (me.fieldSizeLimitErrors.length > 0) {
            // Display error view.
            if (me.syncMessageView === null) {
                me.syncMessageView = Ext.create('Common.view.panel.SyncMessage');
                // Register the view close event
                me.syncMessageView.on('closemessageview', function () {
                    me.syncMessageView.hide();
                    Ext.Viewport.remove(me.syncMessageView, true);
                    me.syncMessageView = null;
                }, me);
                Ext.Viewport.add(me.syncMessageView);
            }
            me.syncMessageView.setData(me.fieldSizeLimitErrors);
            // Load the view asynchronously so it does not block any main app views from loading

            setTimeout(function () {
                me.syncMessageView.show();
            }, 300);

        }
        me.fieldSizeLimitErrors = [];
    },

    /**
     * Syncs the background data tables for the app. Called by the framework if the
     * autoBackgroundDataSync property is set to true in the application configuration.
     * @param {Function} onCompleted called when the sync operation is completed
     * @param {Object} scope The scope to execute the callback function in.
     */

    doAutoSync: function (onCompleted, scope) {
        var me = this;

        SyncManager.startSync();
        SyncManager.downloadValidatingTables()
            .then(function () {
                SynchronizationManager.endSync();
                Ext.callback(onCompleted, scope || me);
            }, function () {
                SynchronizationManager.endSync();
                Ext.callback(onCompleted, scope || me);
            });
    },

    /**
     * Handles the fieldsizelimitexceeded event. Maintains a list of fields where the data size is too
     * large to be displayed on Android devices. The Android Sqlite implementation imposes a 1MB limit
     * on the amount of data that can be selected using a Cursor. We limit the amount of data that
     * can be stored in a database field in an attempt to mitigate this error.
     * @param {String} serverTableName The database table name in the Web Central database
     * @param {String} fieldName The name of the database table field
     * @param {String} primaryKeyValues The primary key field name and value of the affected record.
     */
    fieldSizeLimitExceeded: function (serverTableName, fieldName, primaryKeyValues, fieldSize) {
        var me = this,
            primaryKeyString = '',
            recordId = serverTableName + '|' + fieldName + '|',
            sizeErrorRecordExists = function (table, field, id) {
                var i,
                    fieldSizeError;

                for (i = 0; i < me.fieldSizeLimitErrors.length; i++) {
                    fieldSizeError = me.fieldSizeLimitErrors[i];
                    if (fieldSizeError.id === id) {
                        return true;
                    }
                }
                return false;
            },
            key;

        for (key in primaryKeyValues) {
            primaryKeyString += key + ' = ' + primaryKeyValues[key] + ' ';
            recordId += key + '|' + primaryKeyValues[key] + '|';
        }

        if (!sizeErrorRecordExists(serverTableName, fieldName, recordId)) {
            me.fieldSizeLimitErrors.push({
                table: serverTableName,
                field: fieldName,
                pkeys: primaryKeyString,
                fieldSize: fieldSize,
                id: recordId
            });
        }
    },

    /**
     * Retrieves the TableDef for the store model and creates the table if it is not already created.
     * In some cases it is nescesarry to create a transaction table during the initial background
     * download if the transaction table is used in a Sqlite view.
     * @param {String} storeId The store id of the store to create the client side table for.
     */
    initializeTableForStore: function (storeId) {
        var store = Ext.getStore(storeId);

        return Common.promise.util.TableDef.getTableDefFromServer(store.serverTableName)
            .then(function (tableDef) {
                return store.updateIfNotModelAndTable(tableDef);
            });
    },

    onStoreSyncStart: function (store) {
        var me = this,
            downloadPrefix = me.messages.downloadPrefix,
            syncPrefix = me.messages.syncPrefix,
            messagePrefix = store.isValidatingTableStore ? downloadPrefix : syncPrefix;

        Log.log('Start sync for store:  ' + store.getStoreId(), 'verbose', this, arguments);
        Mask.setLoadingMessage(messagePrefix + ' ' + store.getTableDisplayName());
    },

    onStoreSyncEnd: function (store) {
        Log.log('End sync for store:  ' + store.getStoreId(), 'verbose', this, arguments);
    },

    /**
     * Gets a list of all materialized view stores used in the app.
     * @returns {Array}
     */
    getMaterializedViewStores: function () {
        var materializedViewStores = [];

        Ext.data.StoreManager.each(function (store) {
            if (store.isMaterializedView) {
                materializedViewStores.push(store);
            }
        });

        return materializedViewStores;
    },

    /**
     * Checks if the download time of the materialized view store is older than the
     * download time of any of the stores that the view is based on.
     * Returns true if the materialized view store is out of data.
     * @param store
     * @return {Promise} a Promises resolved to true if the store is stale.
     */
    isMaterializedViewStale: function (store) {
        var me = this,
            tableStoreIds = store.getTableStoreIds(),
            viewStoreId = store.getStoreId(),
            tableDownloadStore = Ext.getStore('tableDownloadStore'),
            storeFilters = [];

        // Create a filter for the tableStoreIds
        tableStoreIds.forEach(function (storeId) {
            var filter = Ext.create('Common.util.Filter', {
                property: 'storeId',
                value: storeId,
                conjunction: 'OR'
            });
            storeFilters.push(filter);
        });

        // Create the filter for the materialized view store
        storeFilters.push(Ext.create('Common.util.Filter', {
            property: 'storeId',
            value: viewStoreId,
            conjunction: 'OR'
        }));

        tableDownloadStore.clearFilter();
        tableDownloadStore.setFilters(storeFilters);

        return new Promise(function (resolve) {
            var storeDownloadRecord,
                storeDownloadTime,
                isStale = true,
                tableDownloadTimes = [];

            tableDownloadStore.load(function () {
                tableDownloadStore.clearFilter();
                storeDownloadRecord = tableDownloadStore.findRecord('storeId', viewStoreId);
                if (storeDownloadRecord) {
                    storeDownloadTime = storeDownloadRecord.get('downloadTime');
                    // Get the download times of the view table stores

                    tableStoreIds.forEach(function (storeId) {
                        var downloadTime = tableDownloadStore.findRecord('storeId', storeId);
                        tableDownloadTimes.push(downloadTime);
                    });
                    isStale = me.isViewStoreStale(storeDownloadTime, tableDownloadTimes);
                } else {
                    isStale = true;
                }

                if (isStale) {
                    resolve(store);
                } else {
                    resolve(null);
                }
            });
        });
    },

    isViewStoreStale: function (viewStoreDate, tableStoreDates) {
        var isStale = false;

        if (Ext.isEmpty(viewStoreDate)) {
            isStale = true;
        } else {
            Ext.Array.each(tableStoreDates, function (tableDate) {
                var date = tableDate.get('downloadTime');
                if (!Ext.isEmpty(date)) {
                    if (date > viewStoreDate) {
                        isStale = true;
                        return false;
                    }
                }
            });
        }

        return isStale;
    },

    /**
     * Clears any filters applied to the TableDownload store and loads the store.
     * Ensures that the store is loaded when checking table download times.
     * @returns {Promise}
     */
    clearTableDownloadFiltersAndLoad: function() {
        var tableDownloadStore = Ext.getStore('tableDownloadStore');

        return new Promise(function(resolve, reject) {
            tableDownloadStore.clearFilter();
            tableDownloadStore.load(function(records, operation, success) {
                if(success) {
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

});