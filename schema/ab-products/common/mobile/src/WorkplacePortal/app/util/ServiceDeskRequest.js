Ext.define('WorkplacePortal.util.ServiceDeskRequest', {
    singleton: true,

    submitServiceDeskRequestMessage: LocaleManager.getLocalizedString('Submitting the Request', 'WorkplacePortal.util.ServiceDeskRequest'),
    errorMessageTitle: LocaleManager.getLocalizedString('Error', 'WorkplacePortal.util.ServiceDeskRequest'),

    /**
     * Handle tap on Submit button in Service Desk Request Form.
     */
    onSubmitServiceDeskRequest: function (serviceDeskRequestFormPanel) {
        var me = this,
            record = serviceDeskRequestFormPanel.getRecord(),
            activityType = record.get('activity_type'),
            activityLogId,
            resultObject;

        if (!record.isValid()) {
            serviceDeskRequestFormPanel.displayErrors(record);
        } else {
            me.createAndSubmitServiceDeskRequest(record, function (success, result) {
                if (success) {
                    resultObject = JSON.parse(result.jsonExpression);
                    activityLogId = resultObject.activity_log_id;
                    WorkplacePortal.util.SyncHelper.syncServiceDeskRequests(activityType, function () {
                        me.copyDocFieldsToNewRequest(activityLogId, record).
                        then(function () {
                            Ext.Viewport.remove(serviceDeskRequestFormPanel);
                        });
                    }, me);
                }
            }, me);
        }
    },

    createAndSubmitServiceDeskRequest: function (submitRecord, onCompleted, scope) {
        var workflowMethodId = 'AbWorkplacePortal-WorkplacePortalMobileService-createAndSubmitServiceDeskRequest',
            userName = ConfigFileManager.username,
            requestParameters = WorkplacePortal.util.WorkflowRules.getParametersForRequest(submitRecord);

        WorkplacePortal.util.WorkflowRules.callWorkflowMethod(workflowMethodId, [userName, requestParameters],
            this.submitServiceDeskRequestMessage, 'submitServiceDeskRequest', '', onCompleted, scope);
    },

    copyDocFieldsToNewRequest: function (activityLogId, record) {
        var me = this,
            serviceDeskRequestsStoreId = 'serviceDeskRequestsStore',
            serviceDeskRequestsStore = Ext.getStore(serviceDeskRequestsStoreId),
            autoSync = serviceDeskRequestsStore.getAutoSync(),
            filters = [],
            docFields = ['doc1', 'doc2', 'doc3', 'doc4'];

        filters.push(WorkplacePortal.util.Filter.getFilterForField('activity_log_id', activityLogId));

        return new Promise(function (resolve, reject) {
            serviceDeskRequestsStore.retrieveRecord(filters, function (retrievedRecord) {

                serviceDeskRequestsStore.setAutoSync(false);

                Ext.each(docFields, function (docField) {
                    if(!Ext.isEmpty(record.get(docField))){
                        retrievedRecord.set(docField, record.get(docField));
                        retrievedRecord.set(docField + '_contents', record.get(docField + '_contents'));
                        retrievedRecord.set(docField + '_isnew', record.get(docField + '_isnew'));
                        retrievedRecord.set(docField + '_file', record.get(docField + '_file'));
                    }
                });

                serviceDeskRequestsStore.add(retrievedRecord);
                serviceDeskRequestsStore.sync(function(){
                    serviceDeskRequestsStore.setAutoSync(autoSync);
                    Network.checkNetworkConnectionAndLoadDwrScripts(true)
                        .then(function (isConnected) {
                            if (isConnected) {
                                SyncManager.startSync();
                                Common.service.Session.start()
                                    .then(function () {
                                        return SyncManager.syncTransactionTables(serviceDeskRequestsStoreId);
                                    })
                                    .then(function () {
                                        return WorkplacePortal.util.SyncHelper.executeWorkFlowRules();
                                    })
                                    .then(function () {
                                        return SyncManager.syncTransactionTables(serviceDeskRequestsStoreId);
                                    })
                                    .then(function () {
                                        return WorkplacePortal.util.SyncHelper.loadServiceDeskStoreAfterSync();
                                    })
                                    .then(function () {
                                        SyncManager.endSync();
                                        Common.service.Session.end();
                                        resolve();
                                    }, reject);
                            }
                        }, function (error) {
                            reject(error);
                        });
                });


            }, me);
        });
    }
});