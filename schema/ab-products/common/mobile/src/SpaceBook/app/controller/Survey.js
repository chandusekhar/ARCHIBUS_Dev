Ext.define('SpaceBook.controller.Survey', {

    extend: 'Ext.app.Controller',

    xtype: 'surveyController',

    requires: [
        'Common.util.ConfigFileManager',
        'Common.sync.Manager',
        'Common.service.workflow.Workflow',
        'Floorplan.util.Drawing',
        'Floorplan.util.Floorplan'
    ],

    userAuthorization: {
        survey: false,
        surveyPost: false
    },

    storeIds: ['spaceSurveysStore', 'roomSurveyStore'],

    config: {
        refs: {
            mainView: 'mainview',
            startSurveyView: 'startSurveyPanel',
            floorPlanView: 'floorPlanPanel',
            roomsList: 'roomslist',
            surveyActionButtonPicker: 'mainview buttonpicker[itemId=surveyActionPicker]',
            syncSurveyButton: 'toolbarbutton[action=syncSurvey]',
            progressBarPanel: 'progressbarpanel',
            planTypeButtonPicker: 'mainview buttonpicker[itemId=planTypePicker]',
            redlineButton: 'button[action=openRedline]',
            downloadActionPicker: 'mainview buttonpicker[itemId=downloadActionPicker]',

            // required by function updateRoomHighlight
            floorPlanSearchField: 'floorPlanPanel search'
        },
        control: {
            surveyActionButtonPicker: {
                itemselected: 'onActionPickerItemSelected'
            },
            startSurveyView: {
                surveybuttontap: 'onStartSpaceSurvey'
            },
            syncSurveyButton: {
                tap: 'onSyncRoomSurvey'
            }
        },

        completeSurveyMessage: LocaleManager.getLocalizedString('This action will complete the survey and submit changes to your supervisor for review. Even if you have made no changes, you can complete the survey to exit the app&rsquo;s survey mode.<br>Proceed?',
            'SpaceBook.controller.Survey'),

        closeSurveyMessage: LocaleManager.getLocalizedString('This action uploads this survey&rsquo;s data and updates the server-side inventory database, provided you have the security rights to do so.<br>Proceed?',
            'SpaceBook.controller.Survey'),

        noActiveSurveyMessage: LocaleManager.getLocalizedString('There is not an active Survey to complete.',
            'SpaceBook.controller.Survey'),
        noActiveSurveyToSyncMessage: LocaleManager.getLocalizedString('There is no active Survey to Sync',
            'SpaceBook.controller.Survey'),

        startSurveyText: LocaleManager.getLocalizedString('Start Survey', 'SpaceBook.controller.Survey'),
        closeSurveyText: LocaleManager.getLocalizedString('Close Survey', 'SpaceBook.controller.Survey'),
        updatePlanTypesText: LocaleManager.getLocalizedString('Update Floor Plans', 'SpaceBook.controller.Survey'),
        syncSurveyText: LocaleManager.getLocalizedString('Sync Survey', 'SpaceBook.controller.Survey'),
        surveyText: LocaleManager.getLocalizedString('Survey', 'SpaceBook.controller.Survey'),
        completeSurveyText: LocaleManager.getLocalizedString('Complete Survey', 'SpaceBook.controller.Survey'),
        completingSurveyText: LocaleManager.getLocalizedString('Completing Survey', 'SpaceBook.controller.Survey'),
        addToSurveyText: LocaleManager.getLocalizedString('Add to Survey', 'SpaceBook.controller.Survey'),
        errorTitle: LocaleManager.getLocalizedString('Error', 'SpaceBook.controller.Survey')

    },

    onActionPickerItemSelected: function (record) {
        var action = record.get('action');

        switch (action) {
            case 'start':
                this.displayStartSurvey();
                break;

            case 'complete':
                this.completeSurvey();
                break;

            case 'close':
                this.closeSurvey();
                break;

            case 'add':
                this.addToSurvey();
                break;
        }
    },

    displayStartSurvey: function () {
        Space.SpaceSurvey.displayStartSurvey(this);
    },

    /**
     * Starts the space survey
     */
    onStartSpaceSurvey: function (view) {
        var me = this,
            surveyRecord = view.getRecord(),
            surveyId = surveyRecord.get('survey_id'),
            floorPlanView = me.getFloorPlanView(),
            floorPlanRecord = floorPlanView.getRecord(),
            blId = floorPlanRecord.get('bl_id'),
            flId = floorPlanRecord.get('fl_id'),
            userName = ConfigFileManager.username,
            syncPromiseChain;

        if (!surveyRecord.isValid()) {
            view.displayErrors(surveyRecord);
            return;
        }

        syncPromiseChain = function () {
            Mask.setLoadingMessage(me.getStartSurveyText());

            return me.saveSpaceSurvey(view)
                .then(function () {
                    // save the survey table in the sync table
                    return SyncManager.syncTransactionTables(['spaceSurveysStore']);
                })
                .then(function () {
                    return me.executeCopyRoomsToTable(surveyId, userName, blId, flId);
                })
                .then(function () {
                    Space.SpaceSurvey.filterStoresBySurveyId(me.storeIds, surveyId);
                    return SyncManager.syncTransactionTables(me.storeIds);
                })
                .then(function () {
                    SurveyState.setSurveyState(surveyId, true, {
                        bl_id: blId,
                        fl_id: flId
                    });
                    me.userAuthorization = SpaceBook.util.Ui.getUserAppAuthorization();

                    Space.Space.setPermanentFiltersWithoutLoad(['bl_id', 'fl_id', 'survey_id'], [blId, flId, surveyId],
                        'roomSurveyStore');
                    return SyncManager.loadStores(['roomSurveyStore']);
                });
        };

        Network.checkNetworkConnectionAndDisplayMessage()
            .then(function (isConnected) {
                if (isConnected) {
                    SyncManager.doInSession(syncPromiseChain, false)
                        .then(function () {
                            SpaceBook.util.Ui.setActionPicker(me.getDownloadActionPicker());
                            me.getMainView().pop();
                        });
                }
            });
    },

    /**
     * Save the Space Survey data
     *
     * @param view
     * @return Promise after sync
     */
    saveSpaceSurvey: function (view) {
        return Space.SpaceSurvey.saveSpaceSurvey(view, 'SpaceBook');
    },

    /**
     * Executes the workflow rule that copies the room records from the rm table to the surveyrm_sync
     * table
     * @param surveyId
     * @param userName
     * @param blId
     * @param flId
     * @return Promise
     */
    executeCopyRoomsToTable: function (surveyId, userName, blId, flId) {
        var me = this,
            errorMsg = LocaleManager.getLocalizedString('Error copying room records', 'SpaceBook.controller.Survey');

        return new Promise(function (resolve, reject) {
            Common.service.workflow.Workflow.execute('AbSpaceRoomInventoryBAR-SpaceMobileService-copyRoomsToSyncTable',
                [surveyId, userName, blId, flId])
                .then(resolve, function (error) {
                    reject(me.getErrorTitle(), errorMsg + ' ' + error);
                });
        });
    },

    /**
     * Syncs the SpaceSurvey and RoomSurvey tables with the server.
     * Saves and restores the modified room highlight flags.
     */
    onSyncRoomSurvey: function () {
        var me = this,
            floorPlanView = me.getFloorPlanView(),
            floorPlanRecord = floorPlanView.getRecord(),
            blId = floorPlanRecord.get('bl_id'),
            flId = floorPlanRecord.get('fl_id'),
            surveyState = SurveyState.getSurveyState(),
            surveyId = surveyState.surveyId,

            syncPromiseChain = function () {
                return SyncManager.syncTransactionTables(me.storeIds)
                    .then(function () {
                        Space.Space.setPermanentFiltersWithoutLoad(['bl_id', 'fl_id', 'survey_id'], [blId, flId, surveyId],
                            'roomSurveyStore');
                        return SyncManager.loadStores(['roomSurveyStore']);
                    });
            };

        // Prevent concurrent sync actions from being fired
        if (SyncManager.syncIsActive) {
            return;
        }

        SyncManager.doInSession(syncPromiseChain);
    },

    /**
     * Sets the status of all Room Survey records to completed.
     */
    completeSurvey: function () {
        var me = this,
            surveyState = SurveyState.getSurveyState(),
            completeSurveyMessage = me.getCompleteSurveyMessage();

        if (!surveyState.isSurveyActive) {
            Ext.Msg.alert(me.getSurveyText(), me.getNoActiveSurveyMessage());
        } else {
            // Prompt the user to verify completion.
            Ext.Msg.confirm(me.getCompleteSurveyText(), completeSurveyMessage, function (response) {
                if (response === 'yes') {
                    me.doCompleteSurvey(surveyState.surveyId);
                }
            });
        }
    },

    doCompleteSurvey: function (surveyId) {
        var me = this,
            floorPlanView = me.getFloorPlanView(),

            syncPromiseChain = function () {
                Mask.displayLoadingMask(me.getCompletingSurveyText());
                return me.markSurveyComplete(surveyId)
                    .then(function () {
                        return me.completeRoomSurveyRecords(surveyId);
                    })
                    .then(function () {
                        return me.refreshWhenSurveyIsDone();
                    })
                    .then(function () {
                        return new Promise(function (resolve) {
                            SpaceBook.util.Ui.updateRoomHighlight(floorPlanView, me);
                            SpaceBook.util.Ui.setActionPicker(me.getDownloadActionPicker());
                            resolve();
                        });
                    });
            };

        Network.checkNetworkConnectionAndDisplayMessage()
            .then(function (isConnected) {
                if (isConnected) {
                    SyncManager.doInSession(syncPromiseChain);
                }
            });

    },

    /**
     * Sets the Survey status to Completed.
     * @param surveyId {String} The id of the Survey record
     * @return Promise object
     */
    markSurveyComplete: function (surveyId) {
        var me = this,
            storeId = 'spaceSurveysStore',
            surveyStore = Ext.getStore(storeId),
            filterArray = me.getSurveyIdFilterArray(surveyId),
            record;

        surveyStore.filter(filterArray);
        return new Promise(function (resolve) {
            surveyStore.load(function (records) {
                if (!Ext.isEmpty(records)) {
                    record = records[0];
                    record.set('status', 'Completed');
                    record.set('mob_is_changed', 1);
                    record.set('survey_date', new Date());
                    surveyStore.sync(function () {
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        });
    },

    /**
     *
     * Sets the status of all room survey records to completed.
     * Sets the mob_is_changed field.
     * Writes the changes to the mobile database
     *
     * @param {String} surveyId survey code
     * @return Promise object
     * @private
     */
    completeRoomSurveyRecords: function (surveyId) {
        var me = this,
            roomSurveyStore = Ext.getStore('roomSurveyStore'),
            filterArray = me.getSurveyIdFilterArray(surveyId);

        roomSurveyStore.setDisablePaging(true);
        roomSurveyStore.filter(filterArray);
        return new Promise(function (resolve) {
            roomSurveyStore.load(function (records) {
                Ext.each(records, function (record) {
                    record.set('status', 'Completed');
                    record.set('mob_is_changed', 1);
                });

                roomSurveyStore.setDisablePaging(false);
                resolve();
            });
        });
    },

    refreshWhenSurveyIsDone: function () {
        var me = this;

        SurveyState.resetSurveyState();
        Space.SpaceSurvey.filterStoresBySurveyId(me.storeIds, '');

        return SyncManager.syncTransactionTables(me.storeIds)
            .then(function () {
                me.loadSurveyStoresAfterSync();
            })
            .then(function () {
                return new Promise(function (resolve) {
                    SpaceBook.util.Ui.setSurveyButtonVisibility(me);

                    // if current view is floor plan the Redline button need to be hidden on close or complete survey
                    // from Navigation controller Redline button's visibility is set on view change
                    if ('floorPlanPanel' === me.getMainView().getNavigationBar().getCurrentView().xtype && SurveyState.getSurveyState().isSurveyActive) {
                        me.getRedlineButton().setHidden(false);
                    } else {
                        me.getRedlineButton().setHidden(true);
                    }

                    resolve();
                });
            });
    },

    loadSurveyStoresAfterSync: function () {
        var spaceSurveyStore = Ext.getStore('spaceSurveysStore'),
            floorPlanView = this.getFloorPlanView(),
            floorPlanRecord = floorPlanView.getRecord(),
            blId = floorPlanRecord.get('bl_id'),
            flId = floorPlanRecord.get('fl_id'),
            surveyState = SurveyState.getSurveyState(),
            surveyId = surveyState.surveyId,
            filterArray = this.getSurveyIdFilterArray(surveyId);

        spaceSurveyStore.filter(filterArray);

        Space.Space.setPermanentFiltersWithoutLoad(['bl_id', 'fl_id', 'survey_id'], [blId, flId, surveyId],
            'roomSurveyStore');
        return SyncManager.loadStores(this.storeIds);
    },

    getSurveyIdFilterArray: function (surveyId) {
        return [
            Ext.create('Common.util.Filter', {
                property: 'survey_id',
                value: surveyId,
                exactMatch: true
            })
        ];
    },

    /**
     * Syncs the Survey and Room Survey records. Applies the changes directly to the rm table.
     */
    closeSurvey: function () {
        var me = this,
            surveyState = SurveyState.getSurveyState(),
            surveyId = surveyState.surveyId,
            closeSurveyMessage = me.getCloseSurveyMessage();

        if (!surveyState.isSurveyActive) {
            Ext.Msg.alert(me.getSurveyText(), me.getNoActiveSurveyToSyncMessage());
        } else {
            // Prompt the user before closing the survey
            Ext.Msg.confirm(me.getCloseSurveyText(), closeSurveyMessage, function (response) {
                if (response === 'yes') {
                    me.doCloseSurvey(surveyId);
                }
            });
        }
    },

    doCloseSurvey: function (surveyId) {
        var me = this,
            floorCodes,

            syncPromiseChain = function () {
                Mask.displayLoadingMask(me.getCloseSurveyText());
                return (SyncManager.syncTransactionTables(me.storeIds))
                    .then(function () {
                        return me.executeCloseSurveyTable(surveyId);
                    })
                    .then(function () {
                        // Get the floor ids from the SurveyState before resetting it
                        floorCodes = SurveyState.getFloorCodes();
                        return me.refreshWhenSurveyIsDone();
                    })
                    .then(function () {
                        SpaceBook.util.Ui.setActionPicker(me.getDownloadActionPicker());
                        return me.downloadFloorPlans(floorCodes);
                    });
            };

        Network.checkNetworkConnectionAndDisplayMessage()
            .then(function (isConnected) {
                if (isConnected) {
                    SyncManager.doInSession(syncPromiseChain);
                }
            });

    },

    executeCloseSurveyTable: function (surveyId) {
        var me = this,
            generalErrorMsg = LocaleManager.getLocalizedString('Error Closing the Survey', 'SpaceBook.controller.Survey'),
            errorMsg = LocaleManager.getLocalizedString('Error Closing the Survey, failed to synchronize {0} records', 'SpaceBook.controller.Survey'),
            resultObj;

        return new Promise(function (resolve, reject) {
            Common.service.workflow.Workflow.execute('AbSpaceRoomInventoryBAR-SpaceMobileService-closeSurveyTable', [surveyId])
                .then(function (result) {
                    if (result && !Ext.isEmpty(result.jsonExpression)) {
                        resultObj = Ext.JSON.decode(result.jsonExpression);
                        if (resultObj.numberOfFailedRecords === 0) {
                            resolve();
                        } else {
                            reject(me.getErrorTitle(), Ext.String.format(errorMsg, resultObj.numberOfFailedRecords));
                        }
                    }
                }, function (error) {
                    reject(me.getErrorTitle(), generalErrorMsg + ' ' + error);
                });
        });
    },

    /**
     * Downloads the floors when the Survey is Closed. Updates the floor plans with any changes made
     * in the survey.
     * @param {String[]} floorCodes The floor codes of the floor to download
     */
    downloadFloorPlans: function (floorCodes) {
        var me = this,
            activePlanTypes = Floorplan.util.Drawing.getPlanTypesForApp('spaceBookPlanTypes'),
            floorPlanView = me.getFloorPlanView(),
            floorRecord = floorPlanView.getRecord(),
            blId = floorRecord.get('bl_id'),
            flId = floorRecord.get('fl_id'),
            planTypeRecord = Space.SpaceFloorPlan.getPlanTypeRecord(me.getPlanTypeButtonPicker()),
            planType = planTypeRecord.get('plan_type');

        return new Promise(function (resolve) {
            if (activePlanTypes && activePlanTypes.length > 0) {
                return Floorplan.util.Floorplan.getDrawingsForFloors(floorCodes, activePlanTypes, null)
                    .then(function () {
                        return Floorplan.util.Drawing.readDrawingFromStorageOrRetrieveIfNot(blId, flId, planType, [], function (svgData) {
                            if (svgData !== '') {
                                Space.SpaceFloorPlan.doProcessSvgData(svgData, floorPlanView);
                            }
                            resolve();
                        }, me);
                    });
            } else {
                resolve();
            }
        });
    },

    /**
     * Adds room records to an open survey
     */
    addToSurvey: function () {
        var me = this,
            floorPlanView = me.getFloorPlanView(),
            floorPlanRecord = floorPlanView.getRecord(),
            blId = floorPlanRecord.get('bl_id'),
            flId = floorPlanRecord.get('fl_id'),
            surveyState = SurveyState.getSurveyState(),
            surveyId = surveyState.surveyId,
            userName = ConfigFileManager.username,

            syncPromiseChain = function () {
                Mask.setLoadingMessage(me.getAddToSurveyText());
                return me.executeCopyRoomsToTable(surveyState.surveyId, userName, blId, flId)
                    .then(function () {
                        // Sync the added room records
                        return (SyncManager.syncTransactionTables('roomSurveyStore'));
                    })
                    .then(function () {
                        SurveyState.addFloorCode({
                            bl_id: blId,
                            fl_id: flId
                        });

                        Space.Space.setPermanentFiltersWithoutLoad(['bl_id', 'fl_id', 'survey_id'], [blId, flId, surveyId],
                            'roomSurveyStore');
                        return SyncManager.loadStores(['roomSurveyStore']);
                    })
                    .then(function () {
                        return new Promise(function (resolve) {
                            SpaceBook.util.Ui.setSurveyButtonVisibility(me);
                            resolve();
                        });

                    });
            };

        Network.checkNetworkConnectionAndDisplayMessage()
            .then(function (isConnected) {
                if (isConnected) {
                    SyncManager.doInSession(syncPromiseChain);
                }
            });
    },

    /**
     * Displays the progress bar after the Survey is closed
     * The progress bar is displayed by the Download controller
     * @param maxValue
     */
    displayProgressBar: function (maxValue) {
        Space.SpaceDownload.displayProgressBar(maxValue);
    }
});