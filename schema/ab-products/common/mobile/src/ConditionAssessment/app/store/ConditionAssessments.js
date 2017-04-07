/**
 * Encapsulates the Condition Assessment records.
 *
 * @author Cristina Reghina
 * @since 21.2
 */

Ext.define('ConditionAssessment.store.ConditionAssessments', {
    extend: 'Common.store.sync.PagedSyncStore',
    requires: 'ConditionAssessment.model.ConditionAssessment',

    serverTableName: 'activity_log_sync',
    serverFieldNames: [
        'activity_log_id',
        'project_id',
        'site_id',
        'bl_id',
        'fl_id',
        'rm_id',
        'location',
        'description',
        'eq_id',
        'activity_type',
        'assessed_by',
        'rec_action',
        'completed_by',
        'verified_by',
        'mob_locked_by',
        'mob_is_changed',
        'doc',
        'doc1',
        'doc2',
        'doc3',
        'doc4',
        'date_verified',
        'date_assessed',
        'csi_id',
        'cost_to_replace',
        'cost_est_cap',
        'cost_estimated',
        'cost_act_cap',
        'cond_value',
        'cond_priority',
        'sust_priority',
        'questionnaire_id',
        'act_quest',
		'cost_fim', 
		'cost_annual_save', 
		'uc_fim',
        'auto_number'
    ],

    inventoryKeyNames: ['activity_log_id'],

    config: {
        model: 'ConditionAssessment.model.ConditionAssessment',
        storeId: 'conditionAssessmentsStore',
        enableAutoLoad: true,
        remoteFilter: true,
        remoteSort: true,
        autoSync: true,

        // Properties for the On Demand Download function. The Condition Assessment app can be configured to download
        // documents on demand.
        // Set the includeDocumentDataInSync property to false to enable the On Demand Document download feature.
        includeDocumentDataInSync: true,
        documentTable: 'activity_log',
        documentTablePrimaryKeyFields: ['activity_log_id'],

        sorters: [
            {
                property: 'site_id',
                direction: 'ASC'
            },
            {
                property: 'bl_id',
                direction: 'ASC'
            },
            {
                property: 'fl_id',
                direction: 'ASC'
            },
            {
                property: 'rm_id',
                direction: 'ASC'
            },
            {
                property: 'eq_id',
                direction: 'ASC'
            },
            {
                property: 'location',
                direction: 'ASC'
            },
            {
                property: 'description',
                direction: 'ASC'
            }
        ],

        proxy: {
            type: 'Sqlite'
        },

        syncRecordsPageSize: 1000,

        tableDisplayName: LocaleManager.getLocalizedString('Assessments', 'ConditionAssessment.store.ConditionAssessments'),

        timestampDownload: true
    },

    downloadTransactionRecords: function () {
        var me = this,
            proxy = me.getProxy(),
            table = proxy.getTable(),
            useTimestampSync = me.getTimestampDownload(),
            resetFlag = 0;

        Common.controller.EventBus.fireStoreSyncStart(me);
        me.disableStoreEvents();

        return Promise.resolve()
            .then(function() {
                return me.getConditonAssessmentDownloadResetFlag();
            })
            .then(function (downloadResetFlag) {
                resetFlag = downloadResetFlag;
                return MobileSyncServiceAdapter.retrieveLastTableDownloadTime(table);
            })
            .then(function (timestamp) {
                me.lastModifiedTimestamp = resetFlag === 1 ? 0 : timestamp;
                console.log('lastModifiedTimestamp ' + timestamp);
                if (timestamp === 0 || !useTimestampSync) {
                    me.setDeleteAllRecordsOnSync(true);
                    return me.deleteAllRecordsFromTable(table, true);
                } else {
                    me.setDeleteAllRecordsOnSync(false);
                }
            })
            .then(function () {
                return me.importRecords(me.lastModifiedTimestamp);
            })
            .then(function () {
                return me.retrieveRecordsToDelete(me.lastModifiedTimestamp);
            })
            .then(function (deletedRecords) {
                return me.deleteRecords(deletedRecords, table, me.inventoryKeyNames);
            })
            .then(function () {
                return me.enableStoreEvents();
            })
            .then(function () {
                return MobileSyncServiceAdapter.recordLastTableDownloadTime(table, me.serverTableName);
            })
            .then(function () {
                Common.controller.EventBus.fireStoreSyncEnd(me);
            })
            .then(null, function (error) {
                // Enable the store events in case of error. Pass the error message to the calling Promise
                return me.enableStoreEvents(error);
            });
    },

    getConditonAssessmentDownloadResetFlag: function () {
        var me = this;
        return new Promise(function (resolve, reject) {
            var tableDownloadStore = Ext.getStore('tableDownloadStore');
            tableDownloadStore.load({
                callback: function (records, operation, success) {
                    var downloadRecord,
                        resetFlag = 0;
                    if (success) {
                        downloadRecord = tableDownloadStore.findRecord('storeId', 'conditionAssessmentsStore');
                        if (downloadRecord) {
                            resetFlag = downloadRecord.get('reset');
                        } else {
                            resetFlag = 1;
                        }
                        resolve(resetFlag);
                    } else {
                        reject('Error loading TableDownload store');
                    }
                },
                scope: me
            });
        });
    }

});