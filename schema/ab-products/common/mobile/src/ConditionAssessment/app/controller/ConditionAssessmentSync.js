Ext.define('ConditionAssessment.controller.ConditionAssessmentSync', {
    extend: 'Ext.app.Controller',

    requires: [
        'Common.sync.Manager',
        'Common.service.workflow.Workflow'
    ],

    config: {
        control: {
            'button[action=syncConditionAssessment]': {
                tap: 'onSyncConditionAssessmentItems'
            }
        },

        syncMessage: LocaleManager.getLocalizedString('Syncing Assessment items', 'ConditionAssessment.controller.ConditionAssessmentSync'),
        updateMessage: LocaleManager.getLocalizedString('Updating Assessment items', 'ConditionAssessment.controller.ConditionAssessmentSync'),
        errorMessageTitle: LocaleManager.getLocalizedString('Error', 'ConditionAssessment.controller.ConditionAssessmentSync')
    },

    syncConditionAssessmentItems: function () {
        var me = this;

        var syncPromiseChain = function () {
            return me.resetProjectsDownloadFlag()
                .then(function () {
                    return me.downloadBackgroundData();
                })
                .then(function () {
                    return SyncManager.loadStores(SyncManager.getValidatingStores(true));
                })
                .then(function () {
                    return SyncManager.uploadModifiedRecords('conditionAssessmentsStore');
                })
                .then(function () {
                    Mask.setLoadingMessage(me.getUpdateMessage());
                    return me.executeWorkFlowRules();
                })
                .then(function () {
                    return SyncManager.downloadTransactionRecords('conditionAssessmentsStore');
                })
                .then(function() {
                    return me.updateConditionAssessmentDownloadTime();
                })
                .then(function () {
                    return me.loadStores();
                })
                .then(function () {
                    // download only equipment items corresponding to downloaded assessments (KB 3051396)
                    return me.downloadBackgroundEquipmentData();
                });
        };

        // Prevent concurrent sync actions from being fired
        if (SyncManager.syncIsActive) {
            return;
        }

        SyncManager.doInSession(syncPromiseChain);

    },

    /**
     * Download all validating stores except equipment store.
     * @returns {Promise}
     */
    downloadBackgroundData: function () {
        var storeIds = SyncManager.getValidatingStores();

        // download equipment items after downloading the assessments (KB 3051396)
        storeIds = Ext.Array.remove(storeIds, Ext.getStore('equipmentsStore'));

        return SyncManager.downloadValidatingTables(storeIds);
    },

    /**
     * Download equipment data filtered by assessments data.
     * @returns {Promise}
     */
    downloadBackgroundEquipmentData: function () {
        var conditionAssessmentsStore = Ext.getStore('conditionAssessmentsStore'),
            equipmentsStore = Ext.getStore('equipmentsStore'),
            restrictions = [],
            eqIdNotNullFilter;

        eqIdNotNullFilter = Ext.create('Common.util.Filter', {
            property: 'eq_id',
            value: null,
            isEqual: false,
            matchIsNullValue: true
        });

        return conditionAssessmentsStore.retrieveAllRecords([eqIdNotNullFilter])
            .then(function (records) {
                Ext.each(records, function (assessmentRecord) {
                    if (assessmentRecord.get('eq_id')) {
                        restrictions.push({
                            tableName: 'eq',
                            fieldName: 'eq_id',
                            operation: 'EQUALS',
                            value: assessmentRecord.get('eq_id'),
                            relativeOperation: 'OR'
                        });
                    }
                });

                equipmentsStore.setRestriction(restrictions);
                return SyncManager.downloadValidatingTables(['equipmentsStore']);
            });
    },

    /**
     * Loads the transaction stores when the synchronization is complete.
     */
    loadStores: function () {
        var storeIds = [
            'conditionAssessmentsStore',
            'assessmentProjectsStore',
            'assessmentSitesStore',
            'assessmentBuildingsStore',
            'assessmentFloorsStore',
            'assessmentRoomsStore',
            'projectFloorsStore',
            'projectFloorRoomsStore'
        ];

        return SyncManager.loadStores(storeIds);
    },

    /**
     * Delete record for Project table from TableDownload, in order to download all projects.
     * @returns {*}
     */
    resetProjectsDownloadFlag: function () {
        var downloadStore = Ext.getStore('tableDownloadStore'),
            filters = [];

        filters.push(Ext.create('Common.util.Filter', {
            property: 'storeId',
            value: 'projectsStore',
            exactMatch: true
        }));

        return downloadStore.retrieveAllRecords(filters)
            .then(function (records) {
                if (records && records.length > 0) {
                    downloadStore.remove(records[0]);
                    return downloadStore.sync();
                }
            });
    },

    /**
     * Executes the server side workflow rules
     */
    executeWorkFlowRules: function () {
        var assessmentStore = Ext.getStore('conditionAssessmentsStore'),
            useTimestampDownload = assessmentStore.getTimestampDownload(),
            doFullSync = true;

        return MobileSyncServiceAdapter.retrieveLastTableDownloadTime('ConditionAssessment')
            .then(function(timestamp) {
                if(timestamp !== null && timestamp > 0 && useTimestampDownload) {
                    doFullSync = false;
                }
                 return Common.service.workflow.Workflow.execute('AbCapitalPlanningCA-AssessmentMobileService-syncWorkData', [ConfigFileManager.username, doFullSync], Network.SERVICE_TIMEOUT);
            });
    },

    /**
     * Records the download time of the Condition Assessment table.
     * @returns {Promise}
     */
    updateConditionAssessmentDownloadTime: function() {
        return new Promise(function (resolve) {
            var storeId = 'conditionAssessmentsStore',
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
    },

    

    /**
     * Prevents multiple fast taps from triggering simultaneous sync actions.
     */
    onSyncConditionAssessmentItems: (function () {
        var isTapped = false;
        return function () {
            if (!isTapped) {
                isTapped = true;
                this.syncConditionAssessmentItems();
                setTimeout(function () {
                    isTapped = false;
                }, 500);
            }
        };
    })()
});