Ext.define('IncidentReporting.controller.IncidentSync', {
    extend: 'Ext.app.Controller',

    requires: [
        'Common.service.workflow.Workflow',
        'Common.promise.util.TableDef',
        'Common.sync.Manager',
        'Common.service.Session'
    ],

    config: {
        control: {
            'button[action=syncIncident]': {
                tap: 'onSyncIncident'
            }
        },

        transactionTableStoreIds: [
            'incidentsStore',
            'incidentWitnessesStore',
            'documentsStore'
        ],

        syncMessage: LocaleManager.getLocalizedString('Syncing Incidents', 'IncidentReporting.controller.IncidentSync')
    },

    /**
     * Downloads the validating tables when the app is started
     * @param {Function} onCompleted The function executed when the background data download is completed
     * @param {Object} scope The scope to execute the callback
     */
    downloadBackgroundData: function (onCompleted, scope) {
        var me = this,
            returnFn = onCompleted.bind(scope);

        // Define the sync actions
        var syncPromiseChain = function () {
            if (SyncManager.isValidatingTableSyncRequired()) {
                return SyncManager.downloadValidatingTables()
                    .then(function () {
                        return me.getTableDefsInSequence(['incidentsStore', 'incidentWitnessesStore', 'documentsStore']);
                    });
            } else {
                return Promise.resolve();
            }
        };

        // Execute the sync
        SyncManager.doInSession(syncPromiseChain, false)
            .then(returnFn, returnFn);

    },

    doSyncIncident: function () {
        var me = this,
            transactionTables = me.getTransactionTableStoreIds();

        var syncPromiseChain = function () {
            return SyncManager.downloadValidatingTables()
                .then(SyncManager.uploadModifiedRecords.bind(me, transactionTables))
                .then(function () {
                    Mask.setLoadingMessage(me.getSyncMessage());
                    return me.executeWorkFlowRules();
                })
                .then(SyncManager.downloadTransactionRecords.bind(me, transactionTables));
        };

        // Prevent concurrent sync actions
        if (SyncManager.syncIsActive) {
            return;
        }

        // Execute the sync
        SyncManager.doInSession(syncPromiseChain)
            .then(function () {
                return SyncManager.loadStores(me.getTransactionTableStoreIds());
            })
            .then(function () {
                // Load the incidents store seperately to force a refresh on Android devices
                return SyncManager.loadStore('incidentsStore');
            });
    },

    executeWorkFlowRules: function () {
        return Common.service.workflow.Workflow.execute('AbRiskEHS-EHSMobileService-syncWorkData', [ConfigFileManager.username], Network.SERVICE_TIMEOUT);
    },

    /**
     * @private
     * @param storeIds
     */
    getTableDefsInSequence: function (storeIds) {
        var p = Promise.resolve();
        storeIds.forEach(function (storeId) {
            var store = Ext.getStore(storeId);
            p = p.then(function () {
                return Common.promise.util.TableDef.getTableDefFromServer(store.serverTableName)
                    .then(function (tableDef) {
                        return store.updateIfNotModelAndTable(tableDef);
                    });
            });

        });
        return p;
    },

    /**
     * Prevent multiple taps of the Sync button
     * @private
     */
    onSyncIncident: (function () {
        var isTapped = false;
        return function () {
            if (!isTapped) {
                isTapped = true;
                this.doSyncIncident();
                setTimeout(function () {
                    isTapped = false;
                }, 500);
            }
        };
    })()


});
