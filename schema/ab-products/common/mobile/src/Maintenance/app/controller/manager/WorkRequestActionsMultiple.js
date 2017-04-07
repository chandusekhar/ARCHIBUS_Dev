Ext.define('Maintenance.controller.manager.WorkRequestActionsMultiple', {
    extend: 'Maintenance.controller.manager.WorkRequestActions',

    config: {
        refs: {
            workRequestListView: 'workrequestListPanel',
            myWorkToolbar: 'workrequestListPanel toolbar[itemId=myWorkToolbar]',
            estimateFormMultiple: 'estimateFormMultiplePanel',
            forwardFormMultiple: 'forwardFormMultiplePanel',
            scheduleFormMultiple: 'scheduleFormMultiplePanel',
            updateFormMultiple: 'updateFormMultiplePanel',
            approveMultipleButton: 'button[itemId=approveMultipleButton]',
            rejectMultipleButton: 'button[itemId=rejectMultipleButton]',
            forwardMultipleButton: 'button[itemId=forwardMultipleButton]',
            confirmReturnCfMultipleButton: 'button[itemId=confirmReturnCfMultipleButton]',
            forwardMultipleRequestsButton: 'button[itemId=forwardMultipleRequestsButton]',
            verifyMultiple:'verifymultipleform',
            verfifyMultipleWorkRequestsButton: 'button[itemId=confirmVerfifyMultipleWorkRequests]',
            inCompleteMultipleWorkRequestsButton: 'button[itemId=returnIncompleteMultipleWorkRequests]'

        },

        control: {
            approveMultipleButton: {
                tap: 'onApproveMultipleButtonTapped'
            },
            rejectMultipleButton: {
                tap: 'onRejectMultipleButtonTapped'
            },
            'button[action=removeWrFromSelection]': {
                tap: 'onRemoveWrFromSelection'
            },
            forwardMultipleButton: {
                tap: 'onForwardMultipleButtonTapped'
            },
            forwardMultipleRequestsButton: {
                tap: 'onForwardMultipleRequestsButtonTapped'
            },
            confirmReturnCfMultipleButton: {
                tap: 'onConfirmReturnCfMultipleButton'
            },
            verfifyMultipleWorkRequestsButton: {
                tap: 'onConfirmVerifyMultipleWRsButtonTapped'
            },
            inCompleteMultipleWorkRequestsButton: {
                tap: 'onIncompleteMultipleWRsButtonTapped'
            }
        },

        assignToMeDoneMessageMultiple: LocaleManager.getLocalizedString('Work requests assigned', 'Maintenance.controller.manager.WorkRequestActions'),
        returnCommentNotEmptyMessage: LocaleManager.getLocalizedString(
                'Please input the comments first',
                'Maintenance.controller.manager.WorkRequestActionsMultiple'),
    },

    /**
     * Handles action select for work request multiple selection
     * @override
     * @param record
     */
    onActionPickerItemSelected: function (record) {
        var me = this,
            mainView = me.getMainView(),
            currentView = mainView.getNavigationBar().getCurrentView(),
            action = record.get('action'),
            actionDisplayValue = record.get('text'),
            selectedWorkRequests,
            listType,
            view;

        // if single selection, call the single selection method
        if (!NavigationUtil.isMainView(currentView)) {
            me.callParent(arguments);
            return;
        }

        listType = me.getWorkRequestListView().getDisplayMode();
        selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests();

        if (WorkRequestAction.statusChangeOnlyActions.hasOwnProperty(action)) {
            Ext.Msg.confirm(actionDisplayValue, me.getInstructionMessageByAction(action),
                function (buttonId) {
                    if (buttonId === 'yes') {
                        me.setWorkRequestStatuses(selectedWorkRequests, action, function () {
                            WorkRequestListUtil.showHideMyWorkToolbarItems(me.getMyWorkToolbar(), listType);
                        }, me);
                    }
                });
        } else {
            switch (action) {
                case 'estimation':
                    me.openEstimateFormMultiple();
                    break;

                case 'approval':
                    view = Ext.create('Maintenance.view.manager.ApproveFormMultiple',
                        {record: record});
                    me.getMainView().push(view);
                    break;

                case 'scheduling':
                    me.openScheduleFormMultiple();
                    break;

                case 'assignToMe':
                    me.doAssignToMeMultiple();
                    break;

                case 'update':
                    me.openUpdateFormMultiple(listType);
                    break;
                case 'forwardRequest':
                    me.forwardIssuedRequestFormMultiple();
                    break;
                case 'returnFromCf':
                    me.doReturnFromCfMultiple();
                    break;

                // TODO case 'forward' ?? Is this really an option? In WebC is a button on the Schedule form
                // KB#3050226 add 'verification' functionality.
                case 'verification':
                    me.openVerifyFormMultiple();
                    break;
                default:
                    Ext.Msg.alert('Development', 'To be implemented');
                    break;
            }
        }
    },
    
    /**
     * Open Return from cf form
     */
    doReturnFromCfMultiple: function () {
        var me = this,
            statusChanged = false,
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests(),
            storeIds = ['workRequestsStore'],
            editView = Ext.create('Maintenance.view.manager.ReturnCfFormMultiple'),
            wrIdFilterArray = WorkRequestFilter.createNotEmptyFilterArray('wr_id', selectedWorkRequests, 'OR');

        Ext.Array.each(selectedWorkRequests, function (record) {
            if (me.checkStatusChangedAndDisplayMessage(record)) {
                statusChanged = true;
            }
        }, me);

        if (statusChanged) {
            return;
        }
        WorkRequestFilter.filterAndLoadStores(storeIds, wrIdFilterArray, function () {
            me.getMainView().push(editView);
        }, me);
    },
    
    /**
     * Open forward form
     */
    forwardIssuedRequestFormMultiple: function () {
        var me = this,
            statusChanged = false,
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests(),
            storeIds = ['workRequestsStore'],
            editView = Ext.create('Maintenance.view.manager.ForwardFormMultiple', {forwardIssuedRequest:true}),
            wrIdFilterArray = WorkRequestFilter.createNotEmptyFilterArray('wr_id', selectedWorkRequests, 'OR');

        Ext.Array.each(selectedWorkRequests, function (record) {
            if (me.checkStatusChangedAndDisplayMessage(record)) {
                statusChanged = true;
            }
        }, me);

        if (statusChanged) {
            return;
        }
        WorkRequestFilter.filterAndLoadStores(storeIds, wrIdFilterArray, function () {
            me.getMainView().push(editView);
        }, me);
    },

    /**
     * Sets the status of the work requests.
     * For the resume-issued action, sets the mobile status change flag back to false
     * @param selectedWorkRequests
     * @param action
     * @param [onCompleted] onCompleted Callback
     * @param [scope] scope The scope used to execute the Callback function onCompleted
     */
    setWorkRequestStatuses: function (selectedWorkRequests, action, onCompleted, scope) {
        var me = this,
            workRequestStore = Ext.getStore('workRequestsStore');
        
        if(action === 'complete'){
    		me.doCompleteMutiple(selectedWorkRequests);
    	}else{
    		me.setWorkRequestStatus(selectedWorkRequests, WorkRequestAction.statusChangeOnlyActions[action], function () {
                if (action === 'resume-issued'
                    || action === 'hold-labor' || action === 'hold-parts' || action === 'hold-access') {

                    // undo the status change flag
                    workRequestStore.setAutoSync(false);
                    Ext.each(selectedWorkRequests, function (record) {
                        if (record.get('status_initial') === record.get('status')) {
                            record.setMobileStatusChanged(0);
                        }
                    });
                    workRequestStore.sync(function () {
                        workRequestStore.setAutoSync(true);
                        Ext.callback(onCompleted, scope);
                    });
                } else {
                    Ext.callback(onCompleted, scope);
                }
            }, me);
    	}        
    },
    
    /**
     * Complete action handler.
     * @param workRequestRecord
     */
    doCompleteMutiple: function (selectedWorkRequests) {
        var me = this,
            wrIdFilterArray = [],
            userProfile = Common.util.UserProfile.getUserProfile(),
            workRequestCraftspersonsStore = Ext.getStore('workRequestCraftspersonsStore'),
            workRequestStore = Ext.getStore('workRequestsStore');

        for (var j = 0; j < selectedWorkRequests.length; j++) {
            wrIdFilterArray.push( WorkRequestFilter.createFilter('wr_id', selectedWorkRequests[j].get('wr_id'),'OR','false'));
        }

        workRequestCraftspersonsStore.retrieveAllStoreRecords(wrIdFilterArray, function (wrcfRecords) {
            var isSuperviorAssigned = false,
                isOtherCfAssigned = false,
                isShowCompleteOptionForm = false;
            for (var j = 0; j < selectedWorkRequests.length; j++) {
                for (var i = 0; i < wrcfRecords.length; i++) {
                    if (wrcfRecords[i].get('status') === 'Active' && wrcfRecords[i].get('cf_id') === userProfile.cf_id && wrcfRecords[i].get('wr_id') === selectedWorkRequests[j].get('wr_id')) {
                        isSuperviorAssigned = true;
                    }
                    if (wrcfRecords[i].get('status') === 'Active' && wrcfRecords[i].get('cf_id') !== userProfile.cf_id && wrcfRecords[i].get('wr_id') === selectedWorkRequests[j].get('wr_id')) {
                        isOtherCfAssigned = true;
                    }
                }
                if (isSuperviorAssigned && isOtherCfAssigned) {
                    isShowCompleteOptionForm = true;
                }
            }

            if(isShowCompleteOptionForm){
                me.supervisorCompleteOptionsPanel = Ext.create('Maintenance.view.manager.SupervisorCompleteOptions');
                me.supervisorCompleteOptionsPanel.setWrRecords(selectedWorkRequests);
                me.getMainView().push(me.supervisorCompleteOptionsPanel);
            }else{
                workRequestStore.setAutoSync(false);
                Ext.each(selectedWorkRequests, function (workRequestRecord) {
                    workRequestRecord.setMobileStepActionChanged(workRequestRecord.get('is_req_supervisor') === 1 ? 'supervisorComplete' : 'cfComplete');
                });

                workRequestStore.sync(function () {
                    workRequestStore.setAutoSync(true);
                });
            }

        }, me);

    },

    /**
     * Approve multiple work requests
     */
    onApproveMultipleButtonTapped: function () {
        var me = this,
            mainView = me.getMainView(),
            approveFormView = mainView.getNavigationBar().getCurrentView(),
            comments = approveFormView.getItems().items[0].getValue(),
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests(),
            workRequestStore = Ext.getStore('workRequestsStore');

        workRequestStore.setAutoSync(false);
        Ext.Array.each(selectedWorkRequests, function (selectedWorkRequest) {
            selectedWorkRequest.set('mob_step_comments', comments);
            selectedWorkRequest.setMobileStepActionChanged(me.getMobStepActionForApproveRequest(selectedWorkRequest));
        });
        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
            NavigationUtil.navigateBack(me.getMainView());
        });
    },

    /**
     * Reject multiple work requests
     */
    onRejectMultipleButtonTapped: function () {
        var me = this,
            mainView = me.getMainView(),
            approveFormView = mainView.getNavigationBar().getCurrentView(),
            comments = approveFormView.getItems().items[0].getValue(),
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests(),
            workRequestStore = Ext.getStore('workRequestsStore');

        if (Ext.isEmpty(comments)) {
            Ext.Msg.alert(me.getRejectTitle(), me.getRejectMessage());
            return;
        }

        workRequestStore.setAutoSync(false);
        Ext.Array.each(selectedWorkRequests, function (selectedWorkRequest) {
            selectedWorkRequest.set('mob_step_comments', comments);
            selectedWorkRequest.setMobileStepActionChanged(me.getMobStepActionForRejectRequest(selectedWorkRequest));
        });
        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
            NavigationUtil.navigateBack(me.getMainView());
        });
    },


    onForwardMultipleButtonTapped: function () {

        var me = this,
            statusChanged = false,
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests(),
            storeIds = ['workRequestsStore'],
            editView = Ext.create('Maintenance.view.manager.ForwardFormMultiple'),
            wrIdFilterArray = WorkRequestFilter.createNotEmptyFilterArray('wr_id', selectedWorkRequests, 'OR');

        Ext.Array.each(selectedWorkRequests, function (record) {
            if (me.checkStatusChangedAndDisplayMessage(record)) {
                statusChanged = true;
            }
        }, me);

        if (statusChanged) {
            return;
        }
        WorkRequestFilter.filterAndLoadStores(storeIds, wrIdFilterArray, function () {
            me.getMainView().push(editView);
        }, me);

    },

    /**
     * Navigates to Multiple Estimate form view
     */
    openEstimateFormMultiple: function () {
        var me = this,
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests(),
            storeIds = ['workRequestsStore', 'workRequestPartsStore', 'workRequestTradesStore', 'workRequestCostsStore'],
            editView = Ext.create('Maintenance.view.manager.EstimateFormMultiple'),
            wrIdFilterArray = WorkRequestFilter.createNotEmptyFilterArray('wr_id', selectedWorkRequests, 'OR');

        editView.setRecord(Ext.create(editView.getModel())); // set dummy record, for validations
        WorkRequestFilter.filterAndLoadStores(storeIds, wrIdFilterArray, function () {
            me.getEstimateCostsForm().setResumeCostsFormFromSelectedRequests();
            me.getMainView().push(editView);
        }, me);
    },

    /**
     * Navigates to Multiple Schedule form view
     */
    openScheduleFormMultiple: function () {
        var me = this,
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests(),
            storeIds = ['workRequestsStore', 'workRequestCraftspersonsStore', 'workRequestToolsStore', 'workRequestTradesStore'],
            editView = Ext.create('Maintenance.view.manager.ScheduleFormMultiple'),
            wrIdFilterArray = WorkRequestFilter.createNotEmptyFilterArray('wr_id', selectedWorkRequests, 'OR');

        editView.setRecord(Ext.create(editView.getModel())); // set dummy record, for validations
        WorkRequestFilter.filterAndLoadStores(storeIds, wrIdFilterArray, function () {
            me.getMainView().push(editView);
        }, me);
    },

    /**
     * Removes the work request record from the selected work requests list
     * and updates the filters.
     * @param deleteButton
     */
    onRemoveWrFromSelection: function (deleteButton) {
        var me = this,
            currentView = me.getMainView().getNavigationBar().getCurrentView(),
            workRequestsStore = Ext.getStore('workRequestsStore'),
            storeIds = [],
            wrIdFilterArray,
            record = deleteButton.getRecord();

        if (currentView.xtype === 'scheduleFormMultiplePanel') {
            storeIds = ['workRequestsStore', 'workRequestCraftspersonsStore', 'workRequestToolsStore', 'workRequestTradesStore'];
        } else if (currentView.xtype === 'estimateFormMultiplePanel') {
            storeIds = ['workRequestsStore', 'workRequestPartsStore', 'workRequestTradesStore', 'workRequestCostsStore'];
        } else if (currentView.xtype === 'updateFormMultiplePanel') {
            storeIds = ['workRequestsStore', 'workRequestCraftspersonsStore', 'workRequestPartsStore', 'workRequestToolsStore'];
        } else if (currentView.xtype === 'scheduleFormMultiplePanel'||currentView.xtype==='verifymultipleform'
        	   ||currentView.xtype==='ReturnCfFormMultiple'||currentView.xtype==='forwardFormMultiplePanel') {
            storeIds = ['workRequestsStore'];
        }

        Ext.Array.remove(workRequestsStore.getSelectedWorkRequests(), record);
        wrIdFilterArray = WorkRequestFilter.createNotEmptyFilterArray('wr_id', workRequestsStore.getSelectedWorkRequests(), 'OR');
        WorkRequestFilter.filterAndLoadStores(storeIds, wrIdFilterArray);
    },

    /**
     * Assigns the craftsperson to the selected work requests
     * @override
     */
    onAssignCraftsperson: function () {
        var me = this,
            multipleFormView = me.getScheduleFormMultiple() || me.getUpdateFormMultiple(),
            fieldSet = me.getAssignCraftspersonForm().getItems(),
            selectedWorkRequests,
            wrCfRecords = [],
            record;

        if (!multipleFormView) {
            // single selection
            me.callParent();
            return;
        }

        if(me.getMainView().getNavigationBar().getCurrentView().editCfRecord === null && me.checkSameWrcfPrimaryKeysWithExistingRecords(fieldSet)){
            return;
        }

        selectedWorkRequests = me.getSelectedWorkRequestsForCurrentResource('cf');

        if (!Ext.isEmpty(selectedWorkRequests)) {
            record = me.createWorkRequestCraftspersonRecordFromFieldSet(fieldSet, selectedWorkRequests[0]);
            if (Ext.isEmpty(record.get('cf_id')) || !record.isValid()) {
                multipleFormView.displayErrors(record, me.getAssignCraftspersonForm());
                return;
            }
        }

        Ext.Array.each(selectedWorkRequests, function (wrRecord) {
            wrCfRecords.push(me.createWorkRequestCraftspersonRecordFromFieldSet(fieldSet, wrRecord));
        });

        me.addWorkRequestCraftsperson(wrCfRecords, me.onAddDeleteCfCompletedMultiple, me);
    },

    /**
     * Returns the selected work requests
     * or the selected work request for the selected resource (e.g. craftsperson), if there is one selected in the resource form
     * @param resource
     */
    getSelectedWorkRequestsForCurrentResource: function (resource) {
        var me = this,
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests(),
            currentResourceRecord = me.getEditRecordFromCurrentView(resource);

        if (currentResourceRecord) {
            selectedWorkRequests = Ext.Array.filter(selectedWorkRequests, function (wrRecord) {
                return wrRecord.get('wr_id') === currentResourceRecord.get('wr_id');
            }, me);
        }

        return selectedWorkRequests;
    },

    /**
     * @private
     * @param isDelete
     */
    onAddDeleteCfCompletedMultiple: function (isDelete) {
        var me = this,
            fieldSet = me.getAssignCraftspersonForm().getItems(),
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests();

        me.updateCostsForLaborFromCraftspersons(selectedWorkRequests, function () {
            // refresh the resumeCostsForm
            if (me.getEstimateCostsForm()) {
                me.getEstimateCostsForm().setResumeCostsFormFromSelectedRequests();
            }
            if (isDelete) {
                me.getSwitchToAddNewCfModeButton().fireEvent('tap');
            } else {
                if (!me.getEditRecordFromCurrentView('cf')) {
                    FormUtil.clearCraftspersonsForm(fieldSet);
                }
            }
        }, me);
    },

    /*onDeleteWrCraftsperson: function (button) {
     var me = this,
     record = button.getRecord(),
     store = Ext.getStore('workRequestCraftspersonsStore'),
     multipleFormView = me.getScheduleFormMultiple() || me.getUpdateFormMultiple(),
     wrCraftspersonList = me.getWrCraftspersonList();

     // when tap on the checkbox, disable the list item selection (work requests list)
     wrCraftspersonList.setDisableSelection(true);

     if (!multipleFormView) {
     // single selection
     me.callParent(arguments);
     return;
     }

     Ext.Msg.confirm(me.getDeleteTitle(), me.getDeleteCraftspersonMessage(),
     function (buttonId) {
     if (buttonId === 'yes') {
     store.remove(record);

     me.onAddDeleteCfCompletedMultiple(true);
     }
     });
     },*/

    onForwardMultipleRequestsButtonTapped: function () {
        var me = this,
            mainView = me.getMainView(),
            forwardFormMultipleView = mainView.getNavigationBar().getCurrentView(),
            fwdSupervisorVirtualField = forwardFormMultipleView.down('[itemId=selectSupervisor]'),
            fwdWorkteamIdVirtualField = forwardFormMultipleView.down('[itemId=selectWorkTeam]'),
            mobStepCommentsVirtualField = forwardFormMultipleView.down('[itemId=selectMobStepComments]'),
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests(),
            workRequestStore = Ext.getStore('workRequestsStore');

        if (Ext.isEmpty(fwdSupervisorVirtualField.getValue()) && Ext.isEmpty(fwdWorkteamIdVirtualField.getValue())) {
            Ext.Msg.alert(me.getForwardFormErrorTitle(), me.getForwardFormErrorMessageNull());
            return;
        }
        if (!Ext.isEmpty(fwdSupervisorVirtualField.getValue()) && !Ext.isEmpty(fwdWorkteamIdVirtualField.getValue())) {
            Ext.Msg.alert(me.getForwardFormErrorTitle(), me.getForwardFormErrorMessageBoth());
            return;
        }

        workRequestStore.setAutoSync(false);
        Ext.Array.each(selectedWorkRequests, function (selectedWorkRequest) {
            selectedWorkRequest.set('mob_step_comments', mobStepCommentsVirtualField.getValue());
            selectedWorkRequest.set('fwd_supervisor', fwdSupervisorVirtualField.getValue());
            selectedWorkRequest.set('fwd_work_team_id', fwdWorkteamIdVirtualField.getValue());
            selectedWorkRequest.setMobileStepActionChanged('forwardWorkRequest');
            
            if(forwardFormMultipleView.getForwardIssuedRequest()){
            	selectedWorkRequest.setMobileStepActionChanged('forwarIssueddWorkRequest');
            }else{
            	selectedWorkRequest.setMobileStepActionChanged('forwardWorkRequest');
            }
        });

        // KB 3045644 clear the virtual fields
        fwdSupervisorVirtualField.setValue('');
        fwdWorkteamIdVirtualField.setValue('');
        mobStepCommentsVirtualField.setValue('');

        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
            NavigationUtil.navigateBack(me.getMainView());
        });
    },
    
    onConfirmReturnCfMultipleButton: function () {
        var me = this,
        mainView = me.getMainView(),
        returnCfFormMultipleView = mainView.getNavigationBar().getCurrentView(),
        mobStepCommentsVirtualField = returnCfFormMultipleView.down('[itemId=selectMobStepComments]'),
        selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests(),
        errorMessages = [];
        workRequestStore = Ext.getStore('workRequestsStore');

        returnCfFormMultipleView.removeErrorPanelIfExists();
        if (!mobStepCommentsVirtualField.getValue()) {
            errorMessages.push({fieldName: 'mob_step_comments', errorMessage: me.getReturnCommentNotEmptyMessage()});
            if (errorMessages.length > 0) {
            	returnCfFormMultipleView.removeErrorPanelIfExists();

                returnCfFormMultipleView.insert(0, {
                    xtype: 'errorpanel',
                    errorMessages: errorMessages
                });
            }

            return;
        }
        
	    workRequestStore.setAutoSync(false);
	    Ext.Array.each(selectedWorkRequests, function (selectedWorkRequest) {
	        selectedWorkRequest.set('mob_step_comments', mobStepCommentsVirtualField.getValue());
	        selectedWorkRequest.setMobileStepActionChanged('returnCf');
	        
	    });
	
	    mobStepCommentsVirtualField.setValue('');
	
	    workRequestStore.sync(function () {
	        workRequestStore.setAutoSync(true);
	        NavigationUtil.navigateBack(me.getMainView());
	    });
    },

    /**
     * Assigns the work requests to the user (user's craftsperson id) and sets the WR status to Issued
     */
    doAssignToMeMultiple: function () {
        var me = this,
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests(),
            userProfile = Common.util.UserProfile.getUserProfile(),
            cfId = userProfile.cf_id,
            workRequestStore = Ext.getStore('workRequestsStore');
            wrCfRecords = [];

        Ext.Msg.confirm(me.getAssignToMeTitle(), me.getAssignToMeConfirmMessage(),
            function (buttonId) {
                if (buttonId === 'yes') {

                	workRequestStore.setAutoSync(false);
                    Ext.Array.each(selectedWorkRequests, function (wrRecord) {
                        wrCfRecords.push(me.createWorkRequestCraftspersonRecord(wrRecord, {cf_id: cfId}));
                    });

                    me.addWorkRequestCraftsperson(wrCfRecords, function () {
                        me.updateCostsForLaborFromCraftspersons(selectedWorkRequests, function () {
                            me.setWorkRequestSelfAssignStepAction(selectedWorkRequests, function () {
                            	workRequestStore.sync(function () {
                        	        workRequestStore.setAutoSync(true);
                        	    });
                                WorkRequestListUtil.filterAndShowWorkRequestList(me.getMainView(), WorkRequestFilter.listType, WorkRequestFilter.additionalFilterArray);
                                Ext.Msg.alert(me.getAssignToMeTitle(), me.getAssignToMeDoneMessageMultiple());
                            }, me);
                        }, me);
                    }, me);
                }
            });
    },

    /**
     * Assigns the tools to the selected work requests
     * @override
     */
    onAssignTool: function () {
        var me = this,
            multipleFormView = me.getScheduleFormMultiple() || me.getUpdateFormMultiple(),
            fieldSet = me.getAssignToolForm().getItems(),
            selectedWorkRequests,
            store,
            wrtlRecords = [],
            onSyncCompleted = function () {
                store.setAutoSync(true);
                store.load(function () {
                    if (!me.getEditRecordFromCurrentView('tl')) {
                        FormUtil.clearToolsForm(fieldSet);
                    }
                    store.resumeEvents(false);
                });
            },
            record;

        if (!multipleFormView) {
            // single selection
            me.callParent();
            return;
        }

        selectedWorkRequests = me.getSelectedWorkRequestsForCurrentResource('tl');
        if (!Ext.isEmpty(selectedWorkRequests)) {
            record = me.createWorkRequestToolRecord(fieldSet, selectedWorkRequests[0]);
            if (!record.isValid()) {
                multipleFormView.displayErrors(record, me.getAssignToolForm());
                return;
            }
        }

        Ext.Array.each(selectedWorkRequests, function (wrRecord) {
            wrtlRecords.push(me.createWorkRequestToolRecord(fieldSet, wrRecord));
        });

        store = Ext.getStore('workRequestToolsStore');
        store.suspendEvents();
        store.setAutoSync(false);
        store.add(wrtlRecords);
        store.sync(function () {
            Ext.callback(onSyncCompleted);
        });
    },

    /**
     * Adds part to the work requests
     * @override
     */
    onAddPart: function () {
        var me = this,
            multipleFormView = me.getEstimateFormMultiple() || me.getUpdateFormMultiple(),
            fieldSet = this.getAddPartForm().getItems(),
            selectedWorkRequests,
            store,
            wrptRecords = [], isValid,
            onSyncCompleted = function () {
                store.setAutoSync(true);
                store.load(function () {
                    if (!me.getEditRecordFromCurrentView('pt')) {
                        FormUtil.clearPartsForm(fieldSet);
                    }
                    store.resumeEvents(false);
                    me.updateCostsForParts(selectedWorkRequests, function () {
                        // refresh the resumeCostsForm
                        if (me.getEstimateCostsForm()) {
                            me.getEstimateCostsForm().setResumeCostsFormFromSelectedRequests();
                        }
                    }, me);
                });
            },
            record;

        if (!multipleFormView) {
            // single selection
            me.callParent();
            return;
        }

        selectedWorkRequests = me.getSelectedWorkRequestsForCurrentResource('pt');
        isValid = me.validateQty_Est(fieldSet);
        if (!isValid) {
            return;
        }
        if (!Ext.isEmpty(selectedWorkRequests)) {
            record = me.createWorkRequestPartRecord(fieldSet, selectedWorkRequests[0]);
            if (!record.isValid()) {
                multipleFormView.displayErrors(record);
                return;
            }
        }

        Ext.Array.each(selectedWorkRequests, function (wrRecord) {
            wrptRecords.push(me.createWorkRequestPartRecord(fieldSet, wrRecord));
        });

        store = Ext.getStore('workRequestPartsStore');
        store.suspendEvents();
        store.setAutoSync(false);
        store.add(wrptRecords);
        store.sync(function () {
            Ext.callback(onSyncCompleted);
        });
    },

    /**
     * Adds trade to the work requests
     * @override
     */
    onAddTrade: function () {
        var me = this,
            estimateFormMultiple = me.getEstimateFormMultiple(),
            fieldSet = me.getAddTradeForm().getItems(),
            selectedWorkRequests,
            store,
            wrtrRecords = [],
            onSyncCompleted = function () {
                store.setAutoSync(true);
                store.load(function () {
                    if (!me.getEditRecordFromCurrentView('tr')) {
                        FormUtil.clearTradesForm(fieldSet);
                    }
                    store.resumeEvents(false);
                    me.updateCostsForLaborFromTrade(selectedWorkRequests, function () {
                        // refresh the resumeCostsForm
                        me.getEstimateCostsForm().setResumeCostsFormFromSelectedRequests();
                    }, me);
                });
            },
            record;


        if (!estimateFormMultiple) {
            // single selection
            me.callParent();
            return;
        }

        selectedWorkRequests = me.getSelectedWorkRequestsForCurrentResource('tr');

        if (!Ext.isEmpty(selectedWorkRequests)) {
            record = me.createWorkRequestTradeRecord(fieldSet, selectedWorkRequests[0]);
            if (!record.isValid()) {
                estimateFormMultiple.displayErrors(record);
                return;
            }
        }

        Ext.Array.each(selectedWorkRequests, function (wrRecord) {
            wrtrRecords.push(me.createWorkRequestTradeRecord(fieldSet, wrRecord));
        });

        store = Ext.getStore('workRequestTradesStore');
        store.suspendEvents();
        store.setAutoSync(false);
        store.add(wrtrRecords);
        store.sync(function () {
            Ext.callback(onSyncCompleted);
        });
    },

    /**
     * Adds other costs to the work requests
     * @override
     */
    onAddOtherCost: function () {
        var me = this,
            mainFormMultiple = me.getEstimateFormMultiple() || me.getUpdateFormMultiple(),
            fieldSet = this.getAddOtherCostForm().getItems(),
            selectedWorkRequests,
            store, isValid,
            wrotherRecords = [],
            onSyncCompleted = function () {
                store.setAutoSync(true);
                store.load(function () {
                    if (!me.getEditRecordFromCurrentView('cost')) {
                        FormUtil.clearCostsForm(fieldSet);
                    }
                    store.resumeEvents(false);
                    me.updateCostsForOtherCost(selectedWorkRequests, function () {
                        // refresh the resumeCostsForm
                        me.getEstimateCostsForm().setResumeCostsFormFromSelectedRequests();
                    }, me);
                });
            },
            record;

        if (!mainFormMultiple) {
            // single selection
            me.callParent();
            return;
        }

        selectedWorkRequests = me.getSelectedWorkRequestsForCurrentResource('cost');
        isValid = me.validateEstimatedCost(fieldSet);
        if (isValid) {
            return;
        }
        if (!Ext.isEmpty(selectedWorkRequests)) {
            record = me.createWorkRequestCostRecord(fieldSet, selectedWorkRequests[0]);
            if (!record.isValid()) {
                mainFormMultiple.displayErrors(record);
                return;
            }
        }

        Ext.Array.each(selectedWorkRequests, function (wrRecord) {
            wrotherRecords.push(me.createWorkRequestCostRecord(fieldSet, wrRecord));
        });

        store = Ext.getStore('workRequestCostsStore');
        store.suspendEvents();
        store.setAutoSync(false);
        store.add(wrotherRecords);
        store.sync(function () {
            Ext.callback(onSyncCompleted);
        });
    },

    /**
     * Navigates to Update Multiple form view.
     * @param displayMode display mode of the work request list
     */
    openUpdateFormMultiple: function (displayMode) {
        var me = this,
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests(),
            storeIds = ['workRequestsStore', 'workRequestCraftspersonsStore', 'workRequestPartsStore',
                'workRequestToolsStore', 'workRequestCostsStore'],
            editView = Ext.create('Maintenance.view.manager.UpdateFormMultiple',
                {displayMode: displayMode}),
            wrIdFilterArray = WorkRequestFilter.createNotEmptyFilterArray('wr_id', selectedWorkRequests, 'OR');

        editView.setRecord(Ext.create(editView.getModel())); // set dummy record, for validations

        WorkRequestFilter.filterAndLoadStores(storeIds, wrIdFilterArray, function () {
            me.getEstimateCostsForm().setResumeCostsFormFromSelectedRequests();
            me.getMainView().push(editView);
        }, me);
    },

    openVerifyFormMultiple: function(){
        var me = this,
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests(),
            storeIds = ['workRequestsStore'],
            editView = Ext.create('Maintenance.view.manager.VerifyFormMultiple'),
            wrIdFilterArray = WorkRequestFilter.createNotEmptyFilterArray('wr_id', selectedWorkRequests, 'OR');

        editView.setRecord(Ext.create(editView.getModel())); // set dummy record, for validations
        WorkRequestFilter.filterAndLoadStores(storeIds, wrIdFilterArray, function () {
            me.getMainView().push(editView);
        }, me);
    },

    onConfirmVerifyMultipleWRsButtonTapped: function(){
        var me = this,
            verifyForm = me.getVerifyMultiple(),
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests(),
            workRequestStore = Ext.getStore('workRequestsStore'),
            comments = verifyForm.down('[itemId=selectMobStepComments]').getValue(),
            errorMessages = [];

        verifyForm.removeErrorPanelIfExists();
        if (!comments) {
            errorMessages.push({fieldName: 'mob_step_comments', errorMessage: me.getReturnCommentNotEmptyMessage()});
            if (errorMessages.length > 0) {
                verifyForm.removeErrorPanelIfExists();

                verifyForm.insert(0, {
                    xtype: 'errorpanel',
                    errorMessages: errorMessages
                });
            }

            return;
        }

        workRequestStore.setAutoSync(false);
        Ext.Array.each(selectedWorkRequests, function (record) {
            record.set('mob_step_comments',comments);
            record.setMobileStepActionChanged('verify');
        });

        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
            NavigationUtil.navigateBack(me.getMainView());
        });
    },

    onIncompleteMultipleWRsButtonTapped: function(){
        var me = this,
            verifyForm = me.getVerifyMultiple(),
            selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests(),
            workRequestStore = Ext.getStore('workRequestsStore'),
            comments = verifyForm.down('[itemId=selectMobStepComments]').getValue();

        workRequestStore.setAutoSync(false);
        Ext.Array.each(selectedWorkRequests, function (record) {
            record.set('mob_step_comments',comments);
            record.setMobileStepActionChanged('verifyIncomplete');
        });

        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
            NavigationUtil.navigateBack(me.getMainView());
        });
    }
});