/**
 * Contains common synchronization functions.
 *
 * @author Jeff Martin
 * @since 21.1
 * @singleton
 */
Ext.define('Common.util.SynchronizationManager', {
    alternateClassName: [ 'SynchronizationManager' ],
    requires: [
        'Common.util.Mask',
        'Common.controller.EventBus',
        'Common.view.panel.SyncMessage'
    ],
    mixins: ['Ext.mixin.Observable'],
    singleton: true,

    appName: '',

    cancelSync: false,

    syncMessageView: null,

    /**
     * @property syncIsActive true when a sync is in progress
     */
    syncIsActive: false,

    fieldSizeLimitErrors: [],

    constructor: function () {
        var me = this;

        // The exception event is fired if an exception is caught by the global exception handler.
        me.on('exception', function () {
            me.cancelSync = true;
        }, me);

        // Register the fieldsizelimitexceeded even
        Common.controller.EventBus.on('fieldsizelimitexceeded', this.fieldSizeLimitExceeded, this);


    },

    /**
     * Synchronizes the transaction table or tables.
     *
     * @param {Array/String} transactionTableStoreIds The store ids of the stores to synchronize
     * @param {Function} completedCallback Called when all of the transaction tables have completed synchronization
     * @param {Object} [scope] The scope used to execute the completedCallback function.
     */
    syncTransactionTables: function (transactionTableStoreIds, completedCallback, scope) {
        var me = this,
            syncStores;

        if (Ext.isArray(transactionTableStoreIds)) {
            syncStores = transactionTableStoreIds;
        } else {
            syncStores = [ transactionTableStoreIds ];
        }

        me.cancelSync = false;

        // Synchronize each of the transaction tables
        // The following steps are performed by the synchronization operation on
        // each of the transaction tables:
        // 1. Records are retrieved from the mobile database where the mob_is_changed
        // field is equal to 1
        // 2. The transaction table definition in the mobile database is compared
        // with the table definition from the server side TableDef object. The
        // mobile database definition is modified if it does not match the server
        // side table definition.
        // 3. The changed records are 'checked in' to the WebCentral server database
        // 4. Records in the WebCentral database that are assigned to the current device
        // owner are 'checked out' from the server database and transferred to the
        // mobile database.

        me.doSync(syncStores, 0, function (success, isCancelled) {
            Ext.callback(completedCallback, scope || me, [success, isCancelled]);
        }, scope);
    },

    doSync: function (syncStores, index, onCompleted, scope) {
        var me = this,
            storeIndex = index,
            store,
            model;

        // Check if the sync is cancelled
        if (me.cancelSync) {
            Ext.callback(onCompleted, scope || me, [true, true]);
        } else if (storeIndex === syncStores.length) {
            Ext.callback(onCompleted, scope || me, [true, me.cancelSync]);
        } else {
            store = Ext.getStore(syncStores[storeIndex]);
            model = store.getModel();
            storeIndex += 1;
            store.suspendEvents();
            model.prototype.disableEditHandling = true;

            store.synchronize(function (result) {
                var errorMsgTitle;

                if (result.success) {
                    store.resumeEvents(true);
                    model.prototype.disableEditHandling = false;
                    me.doSync(syncStores, storeIndex, onCompleted, scope);
                } else {
                    // Display error message and stop the sync
                    //errorMsg = ExceptionTranslator.extractMessage(result.exception);
                    errorMsgTitle = LocaleManager.getLocalizedString('Error', 'Common.util.SynchronizationManager');
                    Ext.Msg.alert(errorMsgTitle, result.exception);
                    Ext.callback(onCompleted, scope || me, [false, me.cancelSync]);
                }
            }, me);
        }
    },

    //********* Validating Tables  **************//

    /**
     * Downloads the validating data. Downloads all stores that are type Validating Table store.
     * @param {String} appName The name of the application
     * @param {Boolean} alwaysDownload True to always download the validating data regardless of the
     * last download timestamp.
     * @param {Function} onCompleted callback function called when the download is completed.
     * @param {Object} scope The scope to execute the callback function in.
     * TODO: appName and alwaysDownload are no longer used.
     */

    downloadValidatingTables: function (appName, alwaysDownload, onCompleted, scope) {
        var me = this,
            stores = me.getValidatingStores();

       me.downloadValidatingTablesForStores(stores, onCompleted, scope);
    },

    /**
     * Downloads the validating data for specific stores.
     * @param {Array} stores The list of store names
     * @param {Function} onCompleted callback function called when the download is completed.
     * @param {Object} scope The scope to execute the callback function in.
     */

    downloadValidatingTablesForStores: function (stores, onCompleted, scope) {
        var me = this,
            loadingMessage = LocaleManager.getLocalizedString('Downloading Background Data',
                'Common.util.SynchronizationManager');

        // Check if there are any tables to download
        if (stores.length === 0) {
            Ext.callback(onCompleted, scope || me, [false]);
        } else {
            // Reset the cancelSync flag
            me.cancelSync = false;

            me.setUserStoreRestriction();
            Mask.setLoadingMessage(loadingMessage);

            me.doValidatingSync(stores, 0, function (isCancelled) {
                if (isCancelled) {
                    Ext.callback(onCompleted, scope || me, [isCancelled]);
                } else {
                    me.loadStoresAfterSync(function () {
                        Ext.callback(onCompleted, scope || me, [isCancelled]);
                    }, me);
                }
            }, me);
        }
    },

    doValidatingSync: function (validatingStores, index, onCompleted, scope) {
        var me = this,
            store = Ext.getStore(validatingStores[index]);

        if (validatingStores.length === 0 || me.cancelSync) {
            Ext.callback(onCompleted, scope || me, [false]);
        } else {
            store.suspendEvents();
            store.clearAndImportRecords(function (success) {
                store.resumeEvents(true);
                index += 1;
                if (index === validatingStores.length || (success === false)) {
                    Ext.callback(onCompleted, scope || me, [false]);
                } else {
                    me.doValidatingSync(validatingStores, index, onCompleted, scope);
                }
            }, me);
        }
    },

    /**
     * Returns true if any of the validating tables require downloading
     *
     */
    isValidatingTableSyncRequired: function () {
        return (this.getValidatingStores().length > 0);
    },

    /**
     * Get an array of all of the validating stores for the application.
     *
     * @return {Array} Validating stores.
     */
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
     * Loads the supplied lists of stores
     * @private
     * @param stores
     * @param onCompleted
     * @param scope
     */
    loadStores: function (stores, onCompleted, scope) {
        var me = this,
            numberOfStores = stores.length,
            numberOfStoresLoaded = 0,
            checkIfComplete = function () {
                numberOfStoresLoaded += 1;
                if (numberOfStores === numberOfStoresLoaded) {
                    Ext.callback(onCompleted, scope || me);
                }
            };

        if (numberOfStores === 0) {
            Ext.callback(onCompleted, scope || me);
        } else {
            Ext.each(stores, function (store) {
                var isPagingDisabled = store.getDisablePaging();
                if (!isPagingDisabled) {
                    store.loadPage(1, checkIfComplete, me);
                } else {
                    store.load(checkIfComplete, me);
                }
            }, me);
        }
    },

    /**
     * Loads the stores identified by the store ids in sequence.
     * @param {String[]} storeIds The storeIds of the stores to load
     * @param {Function} onCompleted Function executed when all of the stores have been loaded
     * @param {Object} [scope] The scope to execute the callback function
     */
    loadStoresInSequence: function(storeIds, onCompleted, scope) {
        var me = this,
            localStoreIds = Ext.Array.clone(storeIds); // Clone the storeId array since we change the contents of the array

        if(Ext.isEmpty(localStoreIds) || storeIds.length === 0) {
            Ext.callback(onCompleted, scope || me);
        } else {
            Ext.getStore(localStoreIds[0]).load(function() {
                localStoreIds.shift();
                me.loadStoresInSequence(localStoreIds, onCompleted);
            }, me);
        }
    },

    /**
     * Loads all of the validating stores after the sync is completed.
     * Stores that use the SqliteView proxy are loaded last. This allows
     * all of the validating base tables to be created before the SqliteView s
     * stores are loaded. SqliteView stores are not loaded if the usesTransactionTable
     * property is true
     */
    loadStoresAfterSync: function (onCompleted, scope) {
        var me = this,
            tableDownloadStore = Ext.getStore('tableDownloadStore'),
            validatingStores = me.getValidatingStores(true),
            sqliteViewStores = me.getSqliteViewStores(),
            storesToLoad;

        validatingStores.push(tableDownloadStore);
        storesToLoad = validatingStores.concat(sqliteViewStores);
        me.loadStores(storesToLoad, onCompleted, scope);
    },

    /**
     * @deprecated
     * The TableDefs are now synced in the Sync stores.
     */
    syncTableDefsStore: function () {
        Ext.getStore('tableDefsStore').sync();
    },


    setUserStoreRestriction: function () {
        // Set restriction on Users store
        var usersStore = Ext.getStore('usersStore');
        if (usersStore) {
            usersStore.setRestriction({
                tableName: 'afm_users',
                fieldName: 'user_name',
                operation: 'EQUALS',
                value: ConfigFileManager.username
            });
        }
    },

    /**
     * Syncs the background data tables for the app. Called by the framework if the
     * autoBackgroundDataSync property is set to true in the application configuration.
     * @param {Function} onCompleted called when the sync operation is completed
     * @param {Object} scope The scope to execute the callback function in.
     */

    doAutoSync: function (onCompleted, scope) {
        var me = this;

        //<debug>
        if (arguments.length > 2) {
            Ext.Logger.warn('The appName parameter has been removed from the function signature in 21.3');
        }
        //</debug>

        SynchronizationManager.startSync();
        SynchronizationManager.downloadValidatingTables('', true, function () {
            SynchronizationManager.endSync();
            Ext.callback(onCompleted, scope || me);
        }, me);
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
        if(me.fieldSizeLimitErrors.length > 0) {
            // Display error view.
            if(me.syncMessageView === null) {
                me.syncMessageView = Ext.create('Common.view.panel.SyncMessage');
                // Register the view close event
                me.syncMessageView.on('closemessageview', function() {
                    me.syncMessageView.hide();
                    Ext.Viewport.remove(me.syncMessageView, true);
                    me.syncMessageView = null;
                }, me);
                Ext.Viewport.add(me.syncMessageView);
            }
            me.syncMessageView.setData(me.fieldSizeLimitErrors);
            // Load the view asynchronously so it does not block any main app views from loading

            setTimeout(function() {
                me.syncMessageView.show();
            }, 300);

        }
        me.fieldSizeLimitErrors = [];
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
    fieldSizeLimitExceeded:function(serverTableName, fieldName, primaryKeyValues, fieldSize) {
        var me = this,
            primaryKeyString = '',
            recordId = serverTableName + '|' + fieldName + '|',
            sizeErrorRecordExists = function(table, field, id) {
                var i,
                    fieldSizeError;

                for (i = 0; i < me.fieldSizeLimitErrors.length; i++) {
                    fieldSizeError = me.fieldSizeLimitErrors[i];
                    if(fieldSizeError.id === id) {
                        return true;
                    }
                }
                return false;
            },
            key;

        for(key in primaryKeyValues) {
            primaryKeyString += key + ' = ' + primaryKeyValues[key] + ' ';
            recordId += key + '|' + primaryKeyValues[key] + '|';
        }

        if(!sizeErrorRecordExists(serverTableName, fieldName, recordId)) {
            me.fieldSizeLimitErrors.push({table: serverTableName, field: fieldName, pkeys: primaryKeyString, fieldSize: fieldSize, id: recordId  });
        }
    }

});