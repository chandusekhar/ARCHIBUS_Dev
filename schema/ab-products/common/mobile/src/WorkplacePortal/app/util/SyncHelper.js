Ext.define('WorkplacePortal.util.SyncHelper', {

    requires: [
        'Common.service.Session',
        'Common.sync.Manager',
        'Space.SpaceDownload'
    ],

    singleton: true,

    activityType: '',

    syncServiceDeskRequestsMessage: LocaleManager.getLocalizedString('Syncing Service Desk Requests', 'WorkplacePortal.util.SyncHelper'),
    updateMessage: LocaleManager.getLocalizedString('Updating Service Desk Requests', 'WorkplacePortal.util.SyncHelper'),
    syncMessage: LocaleManager.getLocalizedString('Syncing', 'WorkplacePortal.util.SyncHelper'),
    errorMessageTitle: LocaleManager.getLocalizedString('Error', 'WorkplacePortal.util.SyncHelper'),

    onSyncValidatingTables: function (stores, onCompleted, scope) {
        var me = this,
            displayViewMessage = LocaleManager.getLocalizedString('Refreshing Views', 'WorkplacePortal.util.SyncHelper'),
            returnFn = function () {
                Mask.hideLoadingMask();
                Ext.callback(onCompleted, scope || me);
            };

        var syncPromiseChain = function () {
            return SyncManager.downloadValidatingTables(stores);
        };

        var viewStores = [Ext.getStore('tableDownloadStore'), Ext.getStore('userReservationRoomsStore'),
            Ext.getStore('hotelingBookingsStore')];

        var storesToRefresh = stores.concat(viewStores);

        // Prevent concurrent sync actions from being fired
        if (SyncManager.syncIsActive) {
            return;
        }

        SyncManager.doInSession(syncPromiseChain)
            .then(function () {
                Mask.displayLoadingMask(displayViewMessage);
                return SyncManager.loadStores(storesToRefresh);
            })
            .then(returnFn, returnFn);
    },

    loadServiceDeskStoreAfterSync: function () {
        var me = this,
            serviceDeskRequestsStore = Ext.getStore('serviceDeskRequestsStore');

        if (!Ext.isEmpty(me.activityType)) {
            serviceDeskRequestsStore.filter('activity_type', me.activityType);
        }

        return SyncManager.loadStore(serviceDeskRequestsStore);
    },

    /**
     * Executes the server side workflow rules
     */
    executeWorkFlowRules: function () {
        var me = this;
        return Common.service.workflow.Workflow.execute('AbWorkplacePortal-WorkplacePortalMobileService-syncServiceDeskRequests',
            [ConfigFileManager.username, ConfigFileManager.employeeId, me.activityType], Network.SERVICE_TIMEOUT);
    },

    /**
     * Starts the synchronization process. Loads the DWR scripts if they have not been loaded.
     */
    syncServiceDeskRequests: function (activityType, onCompleted, scope) {
        var me = this,
            returnFn = function () {
                Ext.callback(onCompleted, scope || me);
            };

        var syncPromiseChain = function () {
            return SyncManager.downloadValidatingTables()
                .then(function() {
                    return SyncManager.syncMaterializedViews();
                })
                .then(function () {
                    return SyncManager.uploadModifiedRecords('serviceDeskRequestsStore');
                })
                .then(function () {
                    return me.executeWorkFlowRules();
                })
                .then(function () {
                    return SyncManager.downloadTransactionRecords('serviceDeskRequestsStore');
                })
                .then(function () {
                    return me.loadServiceDeskStoreAfterSync();
                })
                .then(function () {
                    return SyncManager.loadStores(SyncManager.getValidatingStores(true));
                })
                .then(function () {
                    // Load the SiteDrawings store to ensure the table is created before saving drawings.
                    return SyncManager.loadStore('siteDrawings');
                })
                .then(function () {
                    return Space.SpaceDownload.downloadSiteDrawings();
                });
        };

        me.activityType = (Ext.isEmpty(activityType) ? '' : activityType);
        me.setEmployeeIdRestriction('reservationsStore', 'reserve', 'user_requested_by');

        SyncManager.doInSession(syncPromiseChain)
            .then(returnFn, returnFn);

    },

    setEmployeeIdRestriction: function (storeName, tableName, fieldName) {
        var store = Ext.getStore(storeName);

        store.setRestriction([
            {
                tableName: tableName,
                fieldName: fieldName,
                operation: 'EQUALS',
                value: ConfigFileManager.employeeId
            }
        ]);
    }
});