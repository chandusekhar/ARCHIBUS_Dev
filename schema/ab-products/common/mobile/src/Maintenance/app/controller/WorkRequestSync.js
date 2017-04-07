Ext.define('Maintenance.controller.WorkRequestSync', {
    extend: 'Ext.app.Controller',

    requires: [
        'Common.util.SynchronizationManager',
        'Common.util.Mask',
        'Common.service.workflow.Workflow',
        'Common.sync.Manager'
    ],

    config: {
        refs: {
            mainView: 'mainview'
        },
        control: {
            'button[action=syncWorkRequest]': {
                tap: 'onStartSyncWorkRequest'
            }
        },


        transactionTableStoreIds: [
            'workRequestsStore',
            'workRequestPartsStore',
            'workRequestCostsStore',
            'workRequestCraftspersonsStore',
            'workRequestToolsStore',
            'workRequestTradesStore',
            //KB#3050980 Add References Store Id to Sync
            'referenceStore'
        ],


        updateMessage: LocaleManager.getLocalizedString('Updating Work Requests', 'Maintenance.controller.WorkRequestSync'),
        infoMessageTitle: LocaleManager.getLocalizedString('Info', 'Maintenance.controller.WorkRequestSync')

    },

    /**
     * Starts the download of background data
     * @param onCompleted
     * @param scope
     */
    onStartSyncBackgroundData: function (onCompleted, scope) {
        var me = this;

        // Define the steps to perform for the background sync
        var syncPromiseChain = function () {
            return SyncManager.initializeTableForStore('workRequestsStore')
                .then(function () {
                    return me.getCurrentUserRoleName();
                })
                .then(function (result) {
                    ApplicationParameters.setUserRoleName(result.message);
                    return SyncManager.downloadValidatingTables();
                })
                .then(SyncManager.loadStoresAfterSync.bind(SyncManager))
                .then(me.syncWorkRequestsOnStart.bind(me));
        };

        SyncManager.doInSession(syncPromiseChain, false)
            .then(onCompleted.bind(scope), onCompleted.bind(scope));

    },

    syncWorkRequestsOnStart: function () {
        var me = this,
            transactionTableStoreIds = me.getTransactionTableStoreIds();

        return me.loadWorkRequestStore()
            .then(function (records) {
                if (records.length > 0) {
                    return Promise.resolve();
                } else {
                    return SyncManager.uploadModifiedRecords(transactionTableStoreIds)
                        .then(function () {
                            Mask.setLoadingMessage(me.getUpdateMessage());
                            return me.executeWorkflowRules();
                        })
                        .then(function (result) {
                            if (!Ext.isEmpty(result.message)) {
                                Ext.Msg.alert(me.getInfoMessageTitle(), result.message);
                            }
                            return SyncManager.downloadTransactionRecords(transactionTableStoreIds);
                        })
                        .then(function () {
                            return SyncManager.loadStores(transactionTableStoreIds);
                        });
                }
            });
    },

    /**
     * Starts the synchronization process. Loads the DWR scripts if they have not been loaded.
     */
    syncWorkRequest: function () {
        var me = this,
            transactionTableStoreIds = me.getTransactionTableStoreIds();

        // The workRequestsStore is loaded by the syncCompleted function. We remove the workRequestsStore
        // from the stores that are loaded when the sync completes.
        var transactionStoreCopy = Ext.clone(transactionTableStoreIds),
            transactionStoresWithoutWorkRequest = Ext.Array.remove(transactionStoreCopy, 'workRequestsStore');

        var syncPromiseChain = function () {
            return SyncManager.downloadValidatingTables()
                .then(function () {
                    return SyncManager.uploadModifiedRecords(transactionTableStoreIds);
                })
                .then(function () {
                    Mask.setLoadingMessage(me.getUpdateMessage());
                    return me.executeWorkflowRules();
                })
                .then(function (result) {
                    if (!Ext.isEmpty(result.message)) {
                        Ext.Msg.alert(me.getInfoMessageTitle(), result.message);
                    }
                    return SyncManager.downloadTransactionRecords(transactionTableStoreIds);
                })
                .then(function () {
                    return SyncManager.loadStores(transactionStoresWithoutWorkRequest);
                })
                .then(function () {
                    return me.syncCompleted();
                });
        };


        // Prevent concurrent sync actions from being fired
        if (SyncManager.syncIsActive) {
            return;
        }

        SyncManager.doInSession(syncPromiseChain);
    },

    /**
     * Loads the transaction stores when the synchronization is complete.
     * @return {Promise} Returns a Promise object that is resolved when the transaction table stores have been loaded.
     */
    syncCompleted: function () {
        var me = this,
            workRequestListView = me.getMainView().down('workrequestListPanel');

        WorkRequestListUtil.initDropDownButtonsAndWorkRequestList(me.getMainView(), workRequestListView.getDisplayMode());
    },

    /**
     * Executes the server side workflow rules
     */
    executeWorkflowRules: function () {
        var userName = ConfigFileManager.username,
            userProfile = UserProfile.getUserProfile(),
            cfId = userProfile.cf_id || '';

        return Workflow.execute('AbBldgOpsHelpDesk-MaintenanceMobileService-syncWorkData', [userName, cfId]);
    },

    /**
     * Calls the AbBldgOpsOnDemandWork-WorkRequestService-getCurrentUserRoleName WFR to get user's role
     * @return
     */
    getCurrentUserRoleName: function () {
        return Workflow.execute('AbBldgOpsOnDemandWork-WorkRequestService-getCurrentUserRoleName', []);
    },

    /**
     * Prevent simultaneous sync actions if sync button is double tapped
     */
    onStartSyncWorkRequest: (function () {
        var isTapped = false;
        return function () {
            if (!isTapped) {
                isTapped = true;
                this.syncWorkRequest();
                setTimeout(function () {
                    isTapped = false;
                }, 500);
            }
        };
    })(),

    loadWorkRequestStore: function() {
        var store = Ext.getStore('workRequestsStore');
        return new Promise(function(resolve, reject) {
            store.suspendEvents();
            store.load({
                callback: function(records, operation, success) {
                    store.resumeEvents(true);
                    if(success) {
                        resolve(records);
                    } else {
                        reject('Error loading Work Request store');
                    }
                },
                scope: this
            });
        });
    }
});
