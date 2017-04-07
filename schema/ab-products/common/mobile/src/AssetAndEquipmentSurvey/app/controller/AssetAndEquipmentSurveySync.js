Ext.define('AssetAndEquipmentSurvey.controller.AssetAndEquipmentSurveySync', {
    extend: 'Ext.app.Controller',

    requires: [
        'Common.sync.Manager',
        'Common.service.drawing.Drawing',
        'Common.service.workflow.Workflow',
        'Floorplan.util.Floorplan'
    ],

    config: {
        refs: {
            taskContainer: 'taskContainer',
            taskListView: 'taskListPanel',
            completeSurveyButton: 'button[action=completeEquipmentSurvey]',
            addSurveyTaskButton: 'button[action=addSurveyTask]',
            mainView: 'main'
        },
        control: {
            'button[action=syncSurvey]': {
                tap: 'onSyncSurveys'
            },
            'button[action=syncSurveyItems]': {
                tap: function () {
                    this.onSyncSurveys(true);
                }
            },
            completeSurveyButton: {
                tap: 'onCompleteSurvey'
            }
        },

        completeSurveyMessage: LocaleManager.getLocalizedString('By marking the survey as Complete, you inform the supervisor that you are done with this survey, that they can review your changes, apply them, and then archive the survey.<br><br>You cannot make further changes after you mark the survey as Complete.<br><br>Proceed?',
            'AssetAndEquipmentSurvey.controller.AssetAndEquipmentSurveySync')
    },

    /**
     * Sets the download restriction. Download surveys for the device employee with ISSUED status
     * @private
     */
    setSurveyRestriction: function () {
        var surveyStore = Ext.getStore('surveysStore');
        surveyStore.setRestriction([
            {
                tableName: 'survey',
                fieldName: 'em_id',
                operation: 'EQUALS',
                value: ConfigFileManager.employeeId
            },
            {
                tableName: 'survey',
                fieldName: 'status',
                operation: 'EQUALS',
                value: 'Issued'
            }
        ]);
    },

    /**
     * Syncs only the stale background tables.
     * @param onCompleted
     * @param scope
     */
    doAutoBackgroundSync: function (onCompleted, scope) {
        var me = this;

        if (SyncManager.isValidatingTableSyncRequired()) {
            me.syncDataAndDownloadFloorPlans(onCompleted, scope);
        } else {
            Ext.callback(onCompleted, scope || me, [], 0);
        }
    },

    syncDataAndDownloadFloorPlans: function (onCompleted, scope) {
        var me = this,
            returnFn = function () {
                Ext.callback(onCompleted, scope);
            };

        var syncPromiseChain = function () {
            return SyncManager.downloadValidatingTables()
                .then(function () {
                    return me.syncSurveyTableAndPreferences();
                })
                .then(function () {
                    return SyncManager.syncTransactionTables('surveyTasksStore');
                })
                .then(function () {
                    Mask.hideLoadingMask();
                    return me.downloadFloorPlans();
                });

        };

        // Prevent concurrent sync actions from being fired
        if (SyncManager.syncIsActive) {
            return;
        }

        SyncManager.doInSession(syncPromiseChain, false)
            .then(returnFn, returnFn);
    },


    syncSurveyTableAndPreferences: function () {
        var me = this;
        me.setSurveyRestriction();
        return SyncManager.downloadValidatingTables(['surveysStore', 'appPreferencesStore'])
            .then(function () {
                return SyncManager.loadStores(['surveysStore', 'appPreferencesStore']);
            });
    },

    loadStore: function (store) {
        if (Ext.isString(store)) {
            store = Ext.getStore(store);
        }
        return new Promise(function (resolve) {
            store.load(resolve);
        });
    },

    downloadFloorPlans: function () {
        var me = this;

        return me.getTaskFloorCodes()
            .then(function (floorCodes) {
                return me.downloadTaskFloorPlans(floorCodes);
            });

    },

    getTaskFloorCodes: function () {
        var me = this,
            taskFloorStore = Ext.getStore('taskFloorsStore'),
            floorCodes;

        return taskFloorStore.retrieveAllRecords([])
            .then(function (records) {
                floorCodes = Ext.Array.map(records, function (record) {
                    return {
                        bl_id: record.get('bl_id'),
                        fl_id: record.get('fl_id')
                    };
                }, me);
                return Promise.resolve(floorCodes);
            });

    },

    downloadTaskFloorPlans: function (floorCodes) {
        var highlightParameters = [
            {
                view_file: 'ab-eq-survey-eqauditxrm.axvw',
                hs_ds: 'abEqSurveyEqauditxRmHighlight',
                label_ds: 'abEqSurveyEqauditxRmLabel',
                label_clr: 'gray',
                label_ht: '0.90'
            }
        ];

        var p = Promise.resolve();
        floorCodes.forEach(function (code) {
            p = p.then(function () {
                return Common.service.drawing.Drawing.retrieveSvgFromServer(code, null, highlightParameters);
            }).then(function (svgData) {
                return Floorplan.util.Floorplan.saveFloorPlan(code.bl_id, code.fl_id, 'TaskFloorPlan', svgData);
            });
        });
        return p;

    },


    /**
     * Sets the Task.survey_complete field to true
     * The survey_complete field is used by the Mobile Client to indicate that the
     * survey task record is completed.
     * Completed survey records will be removed from the device during the next sync.
     * @param {String} surveyId The id of the selected Survey
     * @param {Function} onCompleted Called when the operation is complete
     * @param {Object} scope The scope to execute the onCompleted callback
     */
    setTaskStatusToComplete: function (surveyId, onCompleted, scope) {
        var me = this,
            surveyTaskStore = Ext.getStore('surveyTasksStore');

        surveyTaskStore.clearFilter();
        surveyTaskStore.filter('survey_id', surveyId);
        surveyTaskStore.setDisablePaging(true);
        surveyTaskStore.load(function (records) {
            surveyTaskStore.setAutoSync(false);
            Ext.each(records, function (record) {
                record.disableEditHandling = true;
                record.set('survey_complete', true);
                record.set('mob_is_changed', 0);
                record.disableEditHandling = false;
            });
            surveyTaskStore.sync(function () {
                surveyTaskStore.setAutoSync(true);
                surveyTaskStore.loadPage(1, function () {
                    Ext.callback(onCompleted, scope || me);
                });
            });
        });
    },

    /**
     * Synchronizes any updated survey tasks, sets the survey status to Completed and synchronizes back to mobile which removes the survey from the list.
     *
     * If the sync back to mobile after changes on sever side doesn't succeed, then set the Task survey_complete field to true.
     * The survey_complete field is a client-side only field and is used to let the client know the tasks are completed and should not be modified.
     */
    onCompleteSurvey: function () {
        var me = this,
            taskContainer = me.getTaskContainer(),
            surveyId = taskContainer.getSurveyId(),
            surveyStore = Ext.getStore('surveysStore'),
            message = me.getCompleteSurveyMessage(),
            completeSurveyTitle = LocaleManager.getLocalizedString('Complete Survey', 'AssetAndEquipmentSurvey.controller.AssetAndEquipmentSurveySync');

        var syncPromiseChain = function () {
            return SyncManager.uploadModifiedRecords('surveyTasksStore')
                .then(function () {
                    return me.executeMarkSurveyCompleted(surveyId);
                })
                .then(function () {
                    return me.syncSurveyTableAndPreferences();
                })
                .then(function () {
                    return SyncManager.downloadTransactionRecords('surveyTasksStore');
                });
        };

        Network.checkNetworkConnectionAndDisplayMessage()
            .then(function (isConnected) {
                if (isConnected) {
                    Ext.Msg.confirm(completeSurveyTitle, message, function (buttonId) {
                        if (buttonId === 'yes') {
                            SyncManager.doInSession(syncPromiseChain, false)
                                .then(function () {
                                    me.getMainView().pop();
                                }, function () {
                                    me.setTaskStatusToComplete(surveyId, function () {
                                        taskContainer.getRecord().set('status', 'Complete');
                                        surveyStore.sync();
                                        me.setButtonsAfterCompleteSurvey();
                                    });
                                });

                        }
                    });
                }
            });

    },

    /**
     * Execute the Mark Survey Completed Workflow rule.
     * @param surveyId
     */
    executeMarkSurveyCompleted: function (surveyId) {
        var errorMsgTitle = LocaleManager.getLocalizedString('Error', 'AssetAndEquipmentSurvey.controller.AssetAndEquipmentSurveySync'),
            errorMsg = LocaleManager.getLocalizedString('Error Completing Survey', 'AssetAndEquipmentSurvey.controller.AssetAndEquipmentSurveySync');

        return new Promise(function (resolve, reject) {
            Common.service.workflow.Workflow.execute('AbAssetManagement-AssetMobileService-markSurveyCompleted', [surveyId])
                .then(resolve, function (error) {
                    reject(errorMsgTitle, errorMsg + ' ' + error);
                });
        });

    },

    setButtonsAfterCompleteSurvey: function () {
        this.getCompleteSurveyButton().setHidden(true);
        this.getAddSurveyTaskButton().setHidden(true);
    },

    /**
     * Handle sync from task items list by syncing and filtering by survey id.
     */
    syncSurveyItems: function () {
        var me = this,
            taskListView = me.getTaskListView(),
            surveyId;

        me.syncDataAndDownloadFloorPlans(function () {
            if (taskListView) {
                surveyId = taskListView.getSurveyId();
                AssetAndEquipmentSurvey.util.Filter.filterTaskList(surveyId);
            }
        }, me);
    },

    /**
     * Prevent simultaneous sync actions
     */
    onSyncSurveys: (function () {
        var isTapped = false;
        return function (syncSurveyItems) {
            if (!isTapped) {
                isTapped = true;
                if (syncSurveyItems) {
                    this.syncSurveyItems();
                } else {
                    this.syncDataAndDownloadFloorPlans();
                }
                setTimeout(function () {
                    isTapped = false;
                }, 500);
            }
        };
    })()
});