Ext.define('SpaceOccupancy.controller.Survey', {

    extend: 'Ext.app.Controller',

    xtype: 'surveyController',

    requires: [
        'Common.util.ConfigFileManager',
        'Common.util.SynchronizationManager',
        'Common.service.workflow.Workflow'
    ],

    userAuthorization: {
        survey: true,
        surveyPost: true
    },

    config: {
        refs: {
            mainView: 'mainview',
            floorPlanView: 'floorPlanPanel',
            startSurveyView: 'startSurveyPanel',
            planTypeButtonPicker: 'mainview buttonpicker[itemId=planTypePicker]',
            surveyActionButtonPicker: 'mainview buttonpicker[itemId=surveyActionPicker]',
            syncSurveyButton: 'toolbarbutton[action=syncSurvey]',
            progressBarPanel: 'progressbarpanel',
            redlineButton: 'button[action=openRedline]',
            floorPlanSearchField: 'floorPlanPanel search',
            roomsList: 'roomslist',
            downloadActionPicker: 'mainview buttonpicker[itemId=downloadActionPicker]',

            // used in SpaceFloorPlan
            floorPlanTitleBar: 'floorPlanPanel > titlebar'
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

        closeSurveyTansMessage: LocaleManager.getLocalizedString('The system will update the inventory based on standard Web Central Workspace Transaction processes.<br>Proceed?',
            'SpaceOccupancy.controller.Survey'),
        closeSurveyMessage: LocaleManager.getLocalizedString('The system will update the inventory.<br>Proceed?',
            'SpaceOccupancy.controller.Survey'),
        noActiveSurveyToSyncMessage: LocaleManager.getLocalizedString('There is no active Survey to Sync',
            'SpaceBook.controller.Survey'),

        startSurveyText: LocaleManager.getLocalizedString('Start Survey', 'SpaceOccupancy.controller.Survey'),
        closeSurveyText: LocaleManager.getLocalizedString('Close Survey', 'SpaceOccupancy.controller.Survey'),
        updatePlanTypesText: LocaleManager.getLocalizedString('Update Floor Plans', 'SpaceOccupancy.controller.Survey'),
        syncSurveyText: LocaleManager.getLocalizedString('Sync Survey', 'SpaceOccupancy.controller.Survey'),
        addToSurveyText: LocaleManager.getLocalizedString('Add to Survey', 'SpaceOccupancy.controller.Survey'),
        surveyText: LocaleManager.getLocalizedString('Survey', 'SpaceBook.controller.Survey'),
        errorTitle: LocaleManager.getLocalizedString('Error', 'SpaceOccupancy.controller.Survey')
    },

    workspaceTransactionsEnabledstoreIds: ['spaceSurveysStore', 'occupancyRoomSurveyStore', 'employeesSyncStore', 'roomPctsStore'],
    workspaceTransactionsDisabledstoreIds: ['spaceSurveysStore', 'occupancyRoomSurveyStore', 'employeesSyncStore'],

    onActionPickerItemSelected: function (record) {
        var action = record.get('action');

        switch (action) {
            case 'start':
                this.displayStartSurvey();
                break;

            case 'close':
                this.closeSurvey();
                break;

            case 'add':
                this.addToSurvey();
                break;
        }
    },

    setSurveyButtonVisibility: function () {
        var floorPlanRecord = this.getFloorPlanView().getRecord(),
            planType = Space.SpaceSurvey.getPressedPlanTypeButtonPlanType(this.getPlanTypeButtonPicker());

        Space.SpaceSurvey.setSurveyButtonVisibility(floorPlanRecord, planType, this.userAuthorization, this);

        // if current view is floor plan the Redline button need to be hidden on close or complete survey
        // from Navigation controller Redline button's visibility is set on view change
        if ('floorPlanPanel' === this.getMainView().getNavigationBar().getCurrentView().xtype && SurveyState.getSurveyState().isSurveyActive) {
            this.getRedlineButton().setHidden(false);
        } else {
            this.getRedlineButton().setHidden(true);
        }
    },

    displayStartSurvey: function () {
        Space.SpaceSurvey.displayStartSurvey(this);
    },

    /**
     * Starts the space survey.
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
            workspaceTransactionsEnabled,
            storeIds = [],
            floorCodes;

        if (!surveyRecord.isValid()) {
            view.displayErrors(surveyRecord);
            return;
        }

        workspaceTransactionsEnabled = SpaceOccupancy.util.Ui.isWorkspaceTransactionsEnabled();

        storeIds = workspaceTransactionsEnabled ? me.workspaceTransactionsEnabledstoreIds : me.workspaceTransactionsDisabledstoreIds;

        var syncPromiseChain = function () {
            Mask.setLoadingMessage(me.getStartSurveyText());

            return me.saveSpaceSurvey(view)
                .then(function () {
                    // save the survey table in the sync table
                    return SyncManager.syncTransactionTables(['spaceSurveysStore']);
                })
                .then(function () {
                    SurveyState.setSurveyState(surveyId, true, {
                        bl_id: blId,
                        fl_id: flId
                    }, workspaceTransactionsEnabled, 0, SpaceOccupancy.util.Ui.getCurrentDateValueFormatted());

                    return me.executeCopyRoomsToTable(surveyId, userName, blId, flId);
                })
                .then(function () {
                    Space.SpaceSurvey.filterStoresBySurveyId(storeIds, surveyId);
                    return (SyncManager.syncTransactionTables(storeIds));
                })
                .then(function () {
                    return me.loadSurveyStoresAfterSync();
                })
                .then(function () {
                    floorCodes = SurveyState.getFloorCodes();
                    me.getMainView().pop();
                    return me.downloadFloorPlans(floorCodes);
                })
                .then(function () {
                    return new Promise(function (resolve) {
                        floorPlanView.zoomExtents();

                        SpaceOccupancy.util.Ui.setActionPicker(me.getDownloadActionPicker());

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
     * Save the Space Survey data.
     *
     * @param view
     * @return Promise object
     */
    saveSpaceSurvey: function (view) {
        return Space.SpaceSurvey.saveSpaceSurvey(view, 'Occupancy');
    },

    /**
     * Executes the workflow rule that copies the room records from the rm table to the surveyrm_sync
     * table
     * @param surveyId
     * @param userName
     * @param blId
     * @param flId
     */
    executeCopyRoomsToTable: function (surveyId, userName, blId, flId) {
        var me = this,
            resultObj,
            errorMsg = LocaleManager.getLocalizedString('Error copying room and room transaction records', 'SpaceOccupancy.controller.Survey'),
            emDocWarning = LocaleManager.getLocalizedString('Photos for the following employees could not be saved on the device: {0}', 'SpaceOccupancy.controller.Survey');

        return new Promise(function (resolve, reject) {
            Common.service.workflow.Workflow.execute('AbSpaceRoomInventoryBAR-SpaceOccupancyMobileService-copyRmEmAndRmpctToSyncTable',
                [surveyId, userName, blId, flId])
                .then(function (result) {
                    //display warnings, if any
                    if (result && !Ext.isEmpty(result.jsonExpression)) {
                        resultObj = Ext.JSON.decode(result.jsonExpression);
                        if (resultObj.emIdsWithDocIssues) {
                            Ext.Msg.alert('', Ext.String.format(emDocWarning, resultObj.emIdsWithDocIssues));
                        }
                    }
                    resolve();
                }, function (error) {
                    reject(me.getErrorTitle(), errorMsg + ' ' + error);
                });
        });
    },

    /**
     * Syncs the SpaceSurvey, RoomSurvey, RoomPcts and Employees tables with the server.
     * Saves and restores the modified room highlight flags.
     */
    onSyncRoomSurvey: function () {
        var me = this,
            storeIds,
            floorCodes,
            syncPromiseChain;

        storeIds = SurveyState.getWorkspaceTransactionsEnabled() ? this.workspaceTransactionsEnabledstoreIds : this.workspaceTransactionsDisabledstoreIds;

        syncPromiseChain = function () {
            Mask.setLoadingMessage(me.getSyncSurveyText());

            return (SyncManager.syncTransactionTables(storeIds))
                .then(function () {
                    return me.loadSurveyStoresAfterSync();
                })
                .then(function () {
                    floorCodes = SurveyState.getFloorCodes();
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

    /**
     * Syncs the Survey, Room Survey and Room Transaction records.
     * Applies the changes directly to the rm and rmpct table.
     */
    closeSurvey: function () {
        var me = this,
            surveyState = SurveyState.getSurveyState(),
            surveyId = surveyState.surveyId,
            closeSurveyMessage = SurveyState.getWorkspaceTransactionsEnabled() ? me.getCloseSurveyTansMessage() : me.getCloseSurveyMessage();

        if (!surveyState.isSurveyActive) {
            Ext.Msg.alert(me.getSurveyText(), me.getNoActiveSurveyToSyncMessage());
            return;
        }
        // Prompt the user before closing the survey
        Ext.Msg.confirm(me.getCloseSurveyText(), closeSurveyMessage, function (response) {
            if (response === 'yes') {
                me.doCloseSurvey(surveyId);
            }
        });
    },

    doCloseSurvey: function (surveyId) {
        var me = this,
            storeIds,
            floorCodes,
            syncPromiseChain;

        storeIds = SurveyState.getWorkspaceTransactionsEnabled() ? this.workspaceTransactionsEnabledstoreIds : this.workspaceTransactionsDisabledstoreIds;

        syncPromiseChain = function () {
            Mask.displayLoadingMask(me.getCloseSurveyText());
            return (SyncManager.syncTransactionTables(storeIds))
                .then(function () {
                    return me.executeCloseSurvey(surveyId);
                })
                .then(function () {
                    Space.SpaceSurvey.filterStoresBySurveyId(storeIds, '');
                    return me.loadSurveyStoresAfterSync();
                })
                .then(function () {
                    //obtain the floor codes before resetting the survey
                    floorCodes = SurveyState.getFloorCodes();
                    SurveyState.resetSurveyState();
                    return me.downloadFloorPlans(floorCodes);
                })
                .then(function () {
                    return new Promise(function (resolve) {
                        me.setSurveyButtonVisibility();

                        SpaceOccupancy.util.Ui.setActionPicker(me.getDownloadActionPicker());

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

    executeCloseSurvey: function (surveyId) {
        var me = this,
            errorMsg = LocaleManager.getLocalizedString('Error Closing the Survey', 'SpaceOccupancy.controller.Survey'),
            warningMsg = "",
            resultObj,
            pctSpaceTotalsMsg = LocaleManager.getLocalizedString('The Percentage of Space values for the workspace transaction records for current date range do not add up to 100% for some rooms and they need to be adjusted in Web Central.', 'SpaceOccupancy.controller.Survey');
        //KB3044900 - remove alert message about the transaction records contain different primary room attributes
        //primaryAttributesMsg = LocaleManager.getLocalizedString('There exists workspace transaction records that contain different primary room attributes: {0}.', 'SpaceOccupancy.controller.Survey'),

        return new Promise(function (resolve, reject) {
            Common.service.workflow.Workflow.execute('AbSpaceRoomInventoryBAR-SpaceOccupancyMobileService-closeSurvey', [surveyId, ConfigFileManager.username])
                .then(function (result) {
                    //display warnings, if any
                    if (result && !Ext.isEmpty(result.jsonExpression)) {
                        resultObj = Ext.JSON.decode(result.jsonExpression);
                        //KB3044845 - remove the alert message when transaction is disabled
                        if (!resultObj.correctPctSpaceTotals && SurveyState.getWorkspaceTransactionsEnabled()) {
                            warningMsg = pctSpaceTotalsMsg;
                        }
                        if (!Ext.isEmpty(warningMsg)) {
                            Ext.Msg.alert('', warningMsg);
                        }
                    }

                    resolve();
                }, function (error) {
                    reject(me.getErrorTitle(), errorMsg + ' ' + error);
                });
        });
    },

    /**
     * Adds room records to an open survey
     */
    addToSurvey: function () {
        var me = this, floorPlanView = this.getFloorPlanView(),
            floorPlanRecord = floorPlanView.getRecord(),
            blId = floorPlanRecord.get('bl_id'),
            flId = floorPlanRecord.get('fl_id'),
            surveyState = SurveyState.getSurveyState(),
            userName = ConfigFileManager.username,
            storeIds,
            floorCodes;

        storeIds = SurveyState.getWorkspaceTransactionsEnabled() ? this.workspaceTransactionsEnabledstoreIds : this.workspaceTransactionsDisabledstoreIds;

        var syncPromiseChain = function () {
            Mask.setLoadingMessage(me.getAddToSurveyText());
            return me.executeCopyRoomsToTable(surveyState.surveyId, userName, blId, flId)
                .then(function () {
                    // Sync the added room records
                    return (SyncManager.syncTransactionTables(storeIds));
                })
                .then(function () {
                    SurveyState.addFloorCode({
                        bl_id: blId,
                        fl_id: flId
                    });
                    floorCodes = SurveyState.getFloorCodes();
                    return me.loadSurveyStoresAfterSync();
                })
                .then(function () {
                    return me.downloadFloorPlans(floorCodes);
                })
                .then(function () {
                    return new Promise(function (resolve) {
                        me.setSurveyButtonVisibility();
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

    loadSurveyStoresAfterSync: function () {
        var me = this,
            floorPlanView = this.getFloorPlanView(),
            floorPlanRecord = floorPlanView.getRecord(),
            blId = floorPlanRecord.get('bl_id'),
            flId = floorPlanRecord.get('fl_id'),
            surveyState = SurveyState.getSurveyState(),
            surveyId = surveyState.surveyId;

        return SyncManager.loadStore('spaceSurveysStore')
            .then(function () {
                return Space.SpaceSurvey.setFiltersAndLoadStore('occupancyRoomSurveyStore', surveyId, blId, flId);
            })
            .then(function () {
                return new Promise(function (resolve) {
                    // updateRoomListSearch
                    Space.Space.onSearch(me.getFloorPlanSearchField(), 'occupancyRoomSurveyStore',
                        ['rm_id', 'name'], me.getRoomsList(), function () {
                            resolve();
                        }, me);
                });
            })
            .then(function () {
                return Space.SpaceSurvey.setFiltersAndLoadStore('employeesSyncStore', surveyId);
            })
            .then(function () {
                return Space.SpaceSurvey.setFiltersAndLoadStore('roomPctsStore', surveyId, blId, flId);
            });
    },

    /**
     * Displays the progress bar after the Survey is closed
     * The progress bar is displayed by the Download controller
     * @param maxValue
     */
    displayProgressBar: function (maxValue) {
        Space.SpaceDownload.displayProgressBar(maxValue);
    },

    downloadFloorPlans: function (floorCodes) {
        var me = this,
            floorPlanView = me.getFloorPlanView(),
            floorRecord = floorPlanView.getRecord(),
            blId = floorRecord.get('bl_id'),
            flId = floorRecord.get('fl_id'),
            planTypeRecord = Space.SpaceFloorPlan.getPlanTypeRecord(me.getPlanTypeButtonPicker()),
            planType,
            surveyId = SurveyState.getSurveyState().surveyId,
            planTypes = SpaceOccupancy.util.Ui.getPlanTypes(),
            incrementProgressBarFn = function () {
                me.getProgressBarPanel().increment();
            };

        return new Promise(function (resolve) {
            if (planTypes && planTypes.length > 0) {
                me.displayProgressBar(floorCodes.length);
                return Floorplan.util.Floorplan.getDrawingsForFloors(floorCodes, planTypes, incrementProgressBarFn)
                    .then(function () {
                        Mask.displayLoadingMask(me.getUpdatePlanTypesText());
                        if (planTypeRecord) {
                            planType = planTypeRecord.get('plan_type');
                        }
                        return Floorplan.util.Drawing.readDrawingFromStorageOrRetrieveIfNot(blId, flId, planType, [], function (svgData) {
                            if (!Ext.isEmpty(svgData)) {
                                Space.SpaceFloorPlan.doProcessSvgData(svgData, floorPlanView);
                            }
                            // KB3049890: refresh plan after downloading drawings to display correct labels
                            Space.SpaceFloorPlan.onChangePlanType(floorPlanView, planTypeRecord, surveyId, function () {
                                resolve();
                            }, me);
                        }, me);
                    });
            } else {
                resolve();
            }
        });
    }
});