Ext.define('Maintenance.controller.manager.WorkRequestActions', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            mainView: 'mainview',
            scheduleForm: 'scheduleFormPanel',
            requestDetailsForm: 'requestDetailsPanel',
            scheduleCraftspersonsForm: 'scheduleFormCraftspersons',
            assignCraftspersonForm: 'scheduleFormCraftspersons > #assignCraftspersonForm',
            scheduleToolsForm: 'scheduleFormTools',
            assignToolForm: 'scheduleFormTools > #assignToolForm',
            scheduleEstimateTradesForm: 'scheduleEstimateFormTrades',
            addTradeForm: 'scheduleEstimateFormTrades > #addTradeContainer > #addTradeForm',
            estimateForm: 'estimateFormPanel',
            estimatePartsForm: 'estimateFormParts',
            addPartForm: 'estimateFormParts > #addPartForm',
            addPurchasePartsToInventoryForm: 'addPurchasedPartsToInventory',
            estimateCostsForm: 'estimateFormCosts',
            addOtherCostForm: 'estimateFormCosts > #addOtherCostForm',
            updateForm: 'updateFormPanel',
            workRequestPanel: 'workRequestPanel',
            documentsForm: 'workRequestDocumentList',
            referenceForm: 'workRequestReferencesList',
            approveButton: 'button[itemId=approveButton]',
            rejectButton: 'button[itemId=rejectButton]',
            confirmRejectButton: 'button[itemId=confirmRejectButton]',
            confirmReturnButton: 'button[itemId=confirmReturnButton]',
            rejectRadioOptions: 'radiofield[checked=true]',
            cancelButton: 'button[itemId=cancelWorkRequestButton]',
            workRequestActionPicker: 'mainview buttonpicker[itemId=workRequestActionPicker]',
            completeSchedulingButton: 'button[itemId=completeScheduling]',
            forwardButton: 'button[itemId=forward]',
            completeEstimationButton: 'button[itemId=completeEstimation]',
            workRequestManagerList: 'workrequestListPanel workrequestManagerList',
            forwardForm: 'forwardFormPanel',//BC
            forwardWorkRequestButton: 'button[itemId=forwardWorkRequest]',//BC
            wrCraftspersonList: 'wrCraftspersonList',
            switchToAddNewCfModeButton: 'button[action=switchToAddNewCfMode]',
            estimateReferenceButton: 'toolbar > segmentedbutton[itemId=estimateSegmentedButton] > button[itemId=references]',
            scheduleReferenceButton: 'toolbar > segmentedbutton[itemId=scheduleSegmentedButton] > button[itemId=references]',
            estimateApprovedReferenceButton: 'toolbar > segmentedbutton[itemId=estimateApproveSegmentedButton] > button[itemId=references]',
            scheduleApprovedReferenceButton: 'toolbar > segmentedbutton[itemId=scheduleApproveSegmentedButton] > button[itemId=references]',
            addPurchasedPartsToInventorySaveButton: 'button[action=btnBartInfoSave]',
            addToInventoryForm: 'addPurchasedPartsToInventory > #addToInventoryForm'
        },

        control: {
            'button[action=assignCraftsperson]': {
                tap: 'onAssignCraftsperson'
            },
            'button[action=assignTool]': {
                tap: 'onAssignTool'
            },
            'button[action=addPart]': {
                tap: 'onAddPart'
            },
            //KB#3052028   Allow craftspersons to Add Purchased Parts on the mobile application
            'button[action=addPartsToInventory]': {
                tap: 'onAddPartsToInventory'
            },
            //KB#3052029 Add Parts Storage Location map to the mobile application
            //'estimateFormParts prompt[name=part_id]': {
            //    optiontap: 'onShowPartMap'
            //},
            addPurchasedPartsToInventorySaveButton: {
                tap: 'onSavePartsToInventory'
            },
            'button[action=addTrade]': {
                tap: 'onAddTrade'
            },
            'button[action=addOtherCost]': {
                tap: 'onAddOtherCost'
            },
            approveButton: {
                tap: 'onApproveButtonTapped'
            },
            rejectButton: {
                tap: 'onRejectButtonTapped'
            },
            confirmRejectButton: {
                tap: 'onConfirmRejectButtonTapped'
            },
            confirmReturnButton: {
                tap: 'onConfirmReturnButtonTapped'
            },
            cancelButton: {
                tap: 'onCancelButtonTapped'
            },
            workRequestActionPicker: {
                itemselected: 'onActionPickerItemSelected'
            },
            completeSchedulingButton: {
                tap: 'onCompleteSchedulingButtonTapped'
            },
            forwardButton: {
                tap: 'onForwardButtonTapped'
            },
            forwardWorkRequestButton: {
                tap: 'onForwardWorkRequestButtonTapped'
            },
            completeEstimationButton: {
                tap: 'onCompleteEstimationButtonTapped'
            }/*,
             'button[action=deleteWrCraftsperson]': {
             tap: 'onDeleteWrCraftsperson'
             }*/
        },

        returnTitle: LocaleManager.getLocalizedString('Return', 'Maintenance.controller.manager.WorkRequestActions'),
        cancelTitle: LocaleManager.getLocalizedString('Cancel', 'Maintenance.controller.manager.WorkRequestActions'),
        rejectTitle: LocaleManager.getLocalizedString('Reject', 'Maintenance.controller.manager.WorkRequestActions'),
        rejectMessage: LocaleManager.getLocalizedString('Please add your comments before rejecting the work request', 'Maintenance.controller.manager.WorkRequestActions'),
        rejectBackMessage: LocaleManager.getLocalizedString('The request will be automatically be sent back one step', 'Maintenance.controller.manager.WorkRequestActions'),
        completePendingStepTitle: LocaleManager.getLocalizedString('Pending workflow step', 'Maintenance.controller.manager.WorkRequestActions'),
        completePendingStepMessage: LocaleManager.getLocalizedString('Please complete the pending workflow step', 'Maintenance.controller.manager.WorkRequestActions'),
        statusChangedTitle: LocaleManager.getLocalizedString('Work Request', 'Maintenance.controller.manager.WorkRequestActions'),
        statusChangedMessage: LocaleManager.getLocalizedString('You have changed the work request. Please sync before taking any further actions on it', 'Maintenance.controller.manager.WorkRequestActions'),
        assignToMeTitle: LocaleManager.getLocalizedString('Self Assign', 'Maintenance.controller.manager.WorkRequestActions'),
        assignToMeMessage: LocaleManager.getLocalizedString('The work request is already assigned to you', 'Maintenance.controller.manager.WorkRequestActions'),
        assignToMeConfirmMessage: LocaleManager.getLocalizedString('Assign the work request to you?', 'Maintenance.controller.manager.WorkRequestActions'),
        assignToMeDoneMessage: LocaleManager.getLocalizedString('Work request assigned', 'Maintenance.controller.manager.WorkRequestActions'),
        issueInstructionMessage: LocaleManager.getLocalizedString('This action issues the request to field personnel. Once you issue the request, it cannot be cancelled; it can be completed, put on hold, or stopped.<br/><br/>Issue the work request?', 'Maintenance.controller.manager.WorkRequestActions'),
        resumeToIssueInstructionMessage: LocaleManager.getLocalizedString('Resume the work request to Issued?', 'Maintenance.controller.manager.WorkRequestActions'),
        cancelInstructionMessage: LocaleManager.getLocalizedString('This action cancels a request before any work has begun. Canceling a request ends the request workflow.<br/><br/>Cancel the work request?', 'Maintenance.controller.manager.WorkRequestActions'),
        holdInstructionMessage: LocaleManager.getLocalizedString('This action puts a request on hold while waiting for parts, the appropriate trade, or security access. You can stop or complete a request that is on hold.<br/><br/>Put on hold the work request?', 'Maintenance.controller.manager.WorkRequestActions'),
        stopInstructionMessage: LocaleManager.getLocalizedString('This action stops a request on which some work has already been performed and which may be billed. Stopping a request ends the request workflow.<br/><br/>Stop the work request?', 'Maintenance.controller.manager.WorkRequestActions'),
        completeInstructionMessage: LocaleManager.getLocalizedString('This action marks the request as Completed. A Supervisor can update labor, parts, comments, and other work details until the request is Closed.<br/><br/>Complete the work request?', 'Maintenance.controller.manager.WorkRequestActions'),
        closeInstructionMessage: LocaleManager.getLocalizedString('This action archives the request and prevents any further updates to it.<br/><br/>Close the work request?', 'Maintenance.controller.manager.WorkRequestActions'),
        completeEstimationInstructionTitle: LocaleManager.getLocalizedString('Complete Estimation', 'Maintenance.controller.manager.WorkRequestActions'),
        completeEstimationInstructionMessage: LocaleManager.getLocalizedString('Estimate requests to more accurately budget, to schedule labor, and to reserve parts. You can change your estimates until you issue the request.<br/><br/>Complete the estimation of the work request?', 'Maintenance.controller.manager.WorkRequestActions'),
        completeSchedulingInstructionTitle: LocaleManager.getLocalizedString('Complete Scheduling', 'Maintenance.controller.manager.WorkRequestActions'),
        completeSchedulingInstructionMessage: LocaleManager.getLocalizedString('Schedule requests to better plan and balance work for teams and craftspersons. You can change the schedule assignments until you issue the request.<br/><br/>Complete the scheduling of the work request?', 'Maintenance.controller.manager.WorkRequestActions'),
        forwardFormErrorTitle: LocaleManager.getLocalizedString('Forward', 'Maintenance.controller.manager.WorkRequestActions'),
        forwardFormErrorMessageNull: LocaleManager.getLocalizedString('Supervisor or Work Team Id must be completed before forwarding the request', 'Maintenance.controller.manager.WorkRequestActions'),
        forwardFormErrorMessageBoth: LocaleManager.getLocalizedString('You cannot select both Supervisor and Work Team Id before forwarding the request', 'Maintenance.controller.manager.WorkRequestActions'),
        //deleteTitle: LocaleManager.getLocalizedString('Delete', 'Maintenance.controller.manager.WorkRequestActions'),
        //deleteCraftspersonMessage: LocaleManager.getLocalizedString('Delete the craftsperson?', 'Maintenance.controller.manager.WorkRequestActions'),
        estimateTitle: LocaleManager.getLocalizedString('Estimate', 'Maintenance.controller.manager.WorkRequestActions'),
        estimateText: LocaleManager.getLocalizedString('The value entered is lesser or larger than accepted field value. Min value is ' + Constants.EstimateMinValue + ' and max value is ' + Constants.EstimateMaxValue, 'Maintenance.controller.manager.WorkRequestActions'),
        duplicateCostText: LocaleManager.getLocalizedString('Two resource records of the same type can not be added for the same day.  Please edit the existing record to reflect the correct totals.', 'Maintenance.controller.manager.WorkRequestActions'),
        samePrimaryKeysMessage: LocaleManager.getLocalizedString('There is another existing record with the same primary keys.', 'Maintenance.controller.manager.WorkRequestActions')
        //mapCannotRunOnPhoneMsg: LocaleManager.getLocalizedString('Map functionility can not run on Phone.', 'Maintenance.controller.manager.WorkRequestActions')
    },

    /**
     * Check if any existing wrcf records with same primary keys to avoid duplicate record.
     * @param fieldSet
     */
    checkSameWrcfPrimaryKeysWithExistingRecords: function (fieldSet) {
        var me = this,
            i = 0,
            isSame = false,
            cfId = fieldSet.get('cf_id').getValue(),
            dateAssigned = fieldSet.get('date_assigned').getValue(),
            timeAssigned = fieldSet.get('time_assigned').getValue(),
            existingRecords = Ext.getStore('workRequestCraftspersonsStore').getData().all;

        for (i; i < existingRecords.length; i++) {
            if (existingRecords[i].get('date_assigned').toISOString() === dateAssigned.toISOString() && existingRecords[i].get('time_assigned').toISOString() === timeAssigned.toISOString() && existingRecords[i].get('cf_id') === cfId) {
                isSame = true;
            }
        }

        if (isSame) {
            Ext.Msg.alert('', me.getSamePrimaryKeysMessage());
        }

        return isSame;
    },

    onAssignCraftsperson: function () {
        var me = this,
            fieldSet = me.getAssignCraftspersonForm().getItems(),
            wrRecord,
            record,
            currentView = me.getMainView().getNavigationBar().getCurrentView(),
            viewStack = me.getMainView().getNavigationBar().getViewStack();

        if(me.getMainView().getNavigationBar().getCurrentView().editCfRecord === null && me.checkSameWrcfPrimaryKeysWithExistingRecords(fieldSet)){
            return;
        }
        wrRecord = viewStack[viewStack.length - 2].getRecord();
        record = me.createWorkRequestCraftspersonRecordFromFieldSet(fieldSet, wrRecord);
        if (Ext.isEmpty(record.get('cf_id')) || !record.isValid()) {
            if (me.getScheduleForm()) {
                me.getScheduleForm().displayErrors(record);
            } else {
                me.getUpdateForm().displayErrors(record, currentView);
            }
        } else {
            // TODO change resources forms with 'Common.form.FormPanel' to handle errors properly
            if (me.getUpdateForm()) {
                // workaround to remove the invalid fields and the error panel
                me.getUpdateForm().displayErrors(record, currentView);
            }
            me.addWorkRequestCraftsperson(record, me.onAddDeleteCfCompleted, me);
        }
    },

    /**
     * @private
     * @param isDelete
     */
    onAddDeleteCfCompleted: function (isDelete) {
        var me = this,
            fieldSet = me.getAssignCraftspersonForm().getItems(),
            wrRecord = me.getScheduleForm() ?
                me.getScheduleForm().getRecord() : me.getUpdateForm().getRecord();

        me.updateCostsForLaborFromCraftspersons(wrRecord);

        if (isDelete) {
            me.getSwitchToAddNewCfModeButton().fireEvent('tap');
        } else {
            if (!me.getEditRecordFromCurrentView('cf')) {
                FormUtil.clearCraftspersonsForm(fieldSet);
            }
        }
    },

    /*onDeleteWrCraftsperson: function (button) {
     var me = this,
     record = button.getRecord(),
     store = Ext.getStore('workRequestCraftspersonsStore');

     Ext.Msg.confirm(me.getDeleteTitle(), me.getDeleteCraftspersonMessage(),
     function (buttonId) {
     if (buttonId === 'yes') {
     store.remove(record);
     me.onAddDeleteCfCompleted(true);
     }
     });
     },*/

    /**
     * Adds work request craftsperson(s)
     * @param record work request craftsperson record or array of records
     * @param onCompleted
     * @param scope
     */
    addWorkRequestCraftsperson: function (record, onCompleted, scope) {
        var store = Ext.getStore('workRequestCraftspersonsStore'),
            autoSync = store.getAutoSync(),
            setDisableValidation = function (record, value) {
                if (Ext.isArray(record)) {
                    Ext.Array.each(record, function (wrcfRecord) {
                        wrcfRecord.setDisableValidation(value);
                    });
                } else {
                    record.setDisableValidation(value);
                }
            },
            onSyncCompleted = function () {
                store.setAutoSync(autoSync);
                setDisableValidation(record, false);
                store.load(function () {
                    store.resumeEvents(false);
                    Ext.callback(onCompleted, scope);
                });
            };

        store.suspendEvents();
        store.setAutoSync(false);
        setDisableValidation(record, true);
        store.add(record);
        store.sync(function () {
            Ext.callback(onSyncCompleted);
        });
    },

    /**
     * Creates a WorkRequestCraftsperson model instance and fills it with data from the fieldset.
     *
     * @param fieldSet
     * @param wrRecord
     * @returns {Maintenance.model.WorkRequestCraftsperson}
     */
    createWorkRequestCraftspersonRecordFromFieldSet: function (fieldSet, wrRecord) {
        var values = {},
            startDateTimeContainer,
            endDateTimeContainer;

        values.cf_id = fieldSet.get('cf_id').getValue();
        values.date_assigned = fieldSet.get('date_assigned').getValue();
        values.time_assigned = fieldSet.get('time_assigned').getValue();
        values.hours_est = fieldSet.get('hours_est').getValue();
        values.work_type = fieldSet.get('work_type').getValue();
        values.status = fieldSet.get('status').getValue();

        values.hours_straight = fieldSet.get('hours_straight').getValue();
        values.hours_over = fieldSet.get('hours_over').getValue();
        values.hours_double = fieldSet.get('hours_double').getValue();

        startDateTimeContainer = fieldSet.get('startDateTimeContainer').getItems();
        values.date_start = fieldSet.get('date_start').getValue();
        values.time_start = startDateTimeContainer.get('time_start').getValue();

        endDateTimeContainer = fieldSet.get('endDateTimeContainer').getItems();
        values.date_end = fieldSet.get('date_end').getValue();
        values.time_end = endDateTimeContainer.get('time_end').getValue();

        values.comments = fieldSet.get('comments').getValue();

        return this.createWorkRequestCraftspersonRecord(wrRecord, values);
    },

    /**
     * Creates a WorkRequestCraftsperson model instance and fills it with given data.
     *
     * @param wrRecord
     * @param values Object containing property:value pairs, ex: {cf_id: CF ID, date_assigned: assigned date}
     * @returns {Maintenance.model.WorkRequestCraftsperson}
     */
    createWorkRequestCraftspersonRecord: function (wrRecord, values) {
        var record = this.getEditRecordFromCurrentView('cf') ? this.getEditRecordFromCurrentView('cf') : Ext.create('Maintenance.model.WorkRequestCraftsperson'),
            store = Ext.getStore('workRequestCraftspersonsStore'),
            fieldName;

        store.setAutoSync(false);
        record.set('wr_id', wrRecord.get('wr_id'));
        record.set('mob_wr_id', wrRecord.getId());
        for (fieldName in values) {
            if (values.hasOwnProperty(fieldName)) {
                record.set(fieldName, values[fieldName]);
            }
        }
        record.setChangedOnMobile();
        store.setAutoSync(true);
        return record;
    },

    onAssignTool: function () {
        var me = this,
            fieldSet = me.getAssignToolForm().getItems(),
            wrRecord, record, store,
            viewStack = me.getMainView().getNavigationBar().getViewStack(),
            onSyncCompleted = function () {
                store.setAutoSync(true);
                store.load(function () {
                    if (!me.getEditRecordFromCurrentView('tl')) {
                        FormUtil.clearToolsForm(fieldSet);
                    }

                    store.resumeEvents(false);
                });
            },
            currentView = me.getMainView().getNavigationBar().getCurrentView();
            
        wrRecord = viewStack[viewStack.length - 2].getRecord();
        record = me.createWorkRequestToolRecord(fieldSet, wrRecord);

        if (record.isValid()) {
            // TODO change resources forms with 'Common.form.FormPanel' to handle errors properly
            // workaround to remove the invalid fields and the error panel
            if (me.getUpdateForm()) {
                me.getUpdateForm().displayErrors(record, currentView);
            } else if (me.getWorkRequestPanel()) {
                me.getWorkRequestPanel().displayErrors(record, currentView);
            }

            store = Ext.getStore('workRequestToolsStore');
            store.suspendEvents();
            store.setAutoSync(false);
            store.add(record);
            store.sync(function () {
                Ext.callback(onSyncCompleted);
            });
        } else {
            if (me.getScheduleForm()) {
                me.getScheduleForm().displayErrors(record);
            } else if (me.getUpdateForm()) {
                me.getUpdateForm().displayErrors(record, currentView);
            } else if (me.getWorkRequestPanel()) {
                me.getWorkRequestPanel().displayErrors(record, currentView);
            }
        }
    },

    createWorkRequestToolRecord: function (fieldSet, wrRecord) {
        var toolId,
            //dateTimeFieldSet = fieldSet.get('dateTimeContainer').getItems(),
            dateAssigned,
            timeAssigned,
            hoursEst,
            startDateTimeContainer = fieldSet.get('startDateTimeContainer').getItems(),
            endDateTimeFieldSet = fieldSet.get('endDateTimeContainer').getItems(),
            dateStart,
            timeStart,
            dateEnd,
            timeEnd,
            hoursStraight,
            record,
            store = Ext.getStore('workRequestToolsStore'),
            getFieldValues = function () {
                toolId = fieldSet.get('tool_id').getValue();
                dateAssigned = fieldSet.get('date_assigned').getValue();
                timeAssigned = fieldSet.get('time_assigned').getValue();
                hoursEst = fieldSet.get('hours_est').getValue();
                dateStart = fieldSet.get('date_start').getValue();
                timeStart = startDateTimeContainer.get('time_start').getValue();
                dateEnd = fieldSet.get('date_end').getValue();
                timeEnd = endDateTimeFieldSet.get('time_end').getValue();
                hoursStraight = fieldSet.get('hours_straight').getValue();
            },
            setRecordValues = function () {
                record.set('wr_id', wrRecord.get('wr_id'));
                record.set('mob_wr_id', wrRecord.getId());
                record.set('tool_id', toolId);
                record.set('date_assigned', dateAssigned);
                record.set('time_assigned', timeAssigned);
                record.set('hours_est', hoursEst);
                record.set('date_start', dateStart);
                record.set('time_start', timeStart);
                record.set('date_end', dateEnd);
                record.set('time_end', timeEnd);
                record.set('hours_straight', hoursStraight);
            };

        getFieldValues();
        store.setAutoSync(false);

        record = this.getEditRecordFromCurrentView('tl') ? this.getEditRecordFromCurrentView('tl') : Ext.create('Maintenance.model.manager.WorkRequestTool');
        setRecordValues();
        record.setChangedOnMobile();

        store.setAutoSync(true);

        return record;
    },

    onAddPart: function () {
        var me = this,
            fieldSet = me.getAddPartForm().getItems(),
            record, store, isValidQty,
            viewStack = me.getMainView().getNavigationBar().getViewStack(),
            wrForm = viewStack[viewStack.length - 2],
            wrRecord = wrForm.getRecord(),
            currentView = me.getMainView().getNavigationBar().getCurrentView(),
            onSyncCompleted = function () {
                store.setAutoSync(true);
                store.load(function () {
                    if (!me.getEditRecordFromCurrentView('pt')) {
                        FormUtil.clearPartsForm(fieldSet);
                    }

                    store.resumeEvents(false);
                    me.updateCostsForParts(wrRecord, function () {
                        // refresh the resumeCostsForm
                        wrForm.setRecord(wrRecord);
                    }, me);
                });
            };

        isValidQty = me.validateQty_Est(fieldSet);
        if (!isValidQty) {
            return;
        }
        record = me.createWorkRequestPartRecord(fieldSet, wrRecord);

        if (record.isValid()) {
            store = Ext.getStore('workRequestPartsStore');
            store.suspendEvents();
            store.setAutoSync(false);
            store.add(record);
            store.sync(function () {
                Ext.callback(onSyncCompleted);
            });
        } else {
            if (me.getEstimateForm()) {
                me.getEstimateForm().displayErrors(record);
            } else {
                me.getUpdateForm().displayErrors(record, currentView);
            }
        }
    },
    /**
     * KB#3052028   Allow craftspersons to Add Purchased Parts on the mobile application.
     * when click Add Parts to Inventory button , then open the Add Part To Inventory form dialog.
     */
    onAddPartsToInventory: function () {
        var me = this,
            editView;

        editView = Ext.create('Maintenance.view.manager.AddPurchasedPartsToInventory');

        me.getMainView().push(editView);
    },
    /**
     * KB#3052029 Add Parts Storage Location map to the mobile application
     */
    
    /*
    onShowPartMap: function (partPrompt) {
        var me = this,
            searchValue;

        if (!Ext.os.is.Phone) {
            if (partPrompt) {
                partPrompt.hidePromptView();
            }
            //get text value from search text field in prompt panel.
            searchValue = partPrompt.listPanel.down('search').getValue();

            // Check if the editView exists in the DOM before creating a new one.
            // Save the mapView in a controller property.
            if(!me.mapView) {
                // Moved the config items to the AddPartMap class
                me.mapView = Ext.create('Maintenance.view.manager.AddPartMap');
                Ext.Viewport.add(me.mapView);
            }

            me.mapView.setPartCode(searchValue);
            me.mapView.show();
        } else {
            // The map view should work on both phone and tablet profiles.
            Ext.Msg.alert('', me.getMapCannotRunOnPhoneMsg());
        }

    },
    */
    onSavePartsToInventory: function () {
        var me = this,
            fieldValue = me.getAddPurchasePartsToInventoryForm().getValues(),
            onFinish = function () {
                SyncManager.endSync();
                Common.service.Session.end();
            };
        var record = me.getAddPurchasePartsToInventoryForm().getRecord();
        var partId = fieldValue.part_id;
        var storeLocId = fieldValue.pt_store_loc_id;
        var qtyOnHand = parseFloat(fieldValue.qty_on_hand);
        var costUnit = parseFloat(fieldValue.cost_unit_last);
        var acId = fieldValue.ac_id;
        if (Ext.isEmpty(acId)) {
            acId = "";
        }
        var invAction = 'Add_new';
        //Check validation of fields to be saved.
        if (!record.isValid()) {

            me.getAddPurchasePartsToInventoryForm().displayErrors(record);
            // Use else instead of returning here.
            return;
        }
        Network.checkNetworkConnectionAndLoadDwrScripts(true)
            .then(function (isConnected) {
                if (isConnected) {
                    SyncManager.startSync();
                    return Common.service.Session.start()
                        .then(function () {
                            return Common.service.workflow.Workflow.execute('AbBldgOpsBackgroundData-calculateWorkResourceValues-updatePartsAndITForMPSL', [partId, qtyOnHand, costUnit, invAction, '', storeLocId, acId]);
                        })
                        .then(function () {
                            me.getMainView().pop();
                        })
                        .then(null, function (error) {
                            Ext.Msg.alert('', error);
                            return Promise.reject();
                        })
                        .done(onFinish, onFinish);
                }
            });


    },

    // validate Quantity Estimated and Cost Estimated fields on AddPart Form
    validateQty_Est: function (fieldSet) {
        var me = this,
            qtyEstimated, partsStore, costUnitAvg,
            partIdIndex, partId, costUunitAvgRecord, costEstParts;

        qtyEstimated = fieldSet.get('qty_estimated').getValue();
        partId = fieldSet.get('part_id').getValue();
        if (!Ext.isEmpty(partId)) {

            partsStore = Ext.getStore('partsStore');
            partIdIndex = partsStore.find('part_id', partId);
            costUunitAvgRecord = partsStore.getAt(partIdIndex);
            if (costUunitAvgRecord) {
                costUnitAvg = costUunitAvgRecord.get('cost_unit_avg');
                costEstParts = costUnitAvg * qtyEstimated;

                if (( costEstParts > Constants.EstimateMaxValue) || costEstParts < Constants.EstimateMinValue) {
                    Ext.Msg.alert(me.getEstimateTitle(), me.getEstimateText());
                    return false;
                } else {
                    return true;
                }
            }
        }
        return true;
    },

    /**
     * Updates the work request(s) estimated cost for parts and the total estimated costs
     * @param {Model/Array} wrRecord
     * @param onCompleted
     * @param scope
     */
    updateCostsForParts: function (wrRecord, onCompleted, scope) {
        var me = this,
            wrRecords = Ext.isArray(wrRecord) ? wrRecord : [wrRecord],
            workRequestPartsStore = Ext.getStore('workRequestPartsStore'),
            workRequestPartsFilterArray = WorkRequestFilter.createNotEmptyFilterArray('wr_id', wrRecords, 'OR'),
            partsStore = Ext.getStore('partsStore'),
            partFilterArray;

        workRequestPartsStore.retrieveAllStoreRecords(workRequestPartsFilterArray, function (wrptRecords) {
            partFilterArray = WorkRequestFilter.createNotEmptyFilterArray('part_id', wrptRecords, 'OR');

            partsStore.retrieveAllStoreRecords(partFilterArray, function (ptRecords) {
                WorkRequestCostsUtil.updateWorkRequestCosts(WorkRequestCostsUtil.resourceTypes.part,
                    wrRecords, wrptRecords, ptRecords);

                Ext.callback(onCompleted, scope);
            }, me);
        }, me);
    },

    /**
     * Updates the work request(s) estimated cost for other costs and the total estimated costs
     * @param {Model/Array} wrRecord
     * @param onCompleted
     * @param scope
     */
    updateCostsForOtherCost: function (wrRecord, onCompleted, scope) {
        var me = this,
            wrRecords = Ext.isArray(wrRecord) ? wrRecord : [wrRecord],
            workRequestCostsStore = Ext.getStore('workRequestCostsStore'),
            workRequestCostsFilterArray = WorkRequestFilter.createNotEmptyFilterArray('wr_id', wrRecords, 'OR');

        workRequestCostsStore.retrieveAllStoreRecords(workRequestCostsFilterArray, function (wrcostsRecords) {
            WorkRequestCostsUtil.updateWorkRequestCosts(WorkRequestCostsUtil.resourceTypes.cost,
                wrRecords, wrcostsRecords, []);

            Ext.callback(onCompleted, scope);
        }, me);
    },

    /**
     * Updates the work request(s) estimated cost for Labor and the total estimated costs
     * from all craftspersons of the work request(s)
     * @param {Ext.data.Model/Array} wrRecord The Work Request record
     * @param {Function} [onCompleted] Function called when the operation is completed
     * @param {Object} [scope] The scope to execute the onCompleted callback function
     */
    updateCostsForLaborFromCraftspersons: function (wrRecord, onCompleted, scope) {
        var me = this,
            wrRecords = Ext.isArray(wrRecord) ? wrRecord : [wrRecord],
            wrCfStore = Ext.getStore('workRequestCraftspersonsStore'),
            wrCfFilterArray = WorkRequestFilter.createNotEmptyFilterArray('wr_id', wrRecords, 'OR'),
            cfStore = Ext.getStore('craftspersonStore'),
            cfFilterArray = [];

        wrCfStore.retrieveAllStoreRecords(wrCfFilterArray, function (wrcfRecords) {
            cfFilterArray = WorkRequestFilter.createNotEmptyFilterArray('cf_id', wrcfRecords, 'OR');

            cfStore.retrieveAllStoreRecords(cfFilterArray, function (cfRecords) {
                WorkRequestCostsUtil.updateWorkRequestCosts(WorkRequestCostsUtil.resourceTypes.craftsperson,
                    wrRecords, wrcfRecords, cfRecords);

                Ext.callback(onCompleted, scope);
            }, me);
        }, me);
    },

    /**
     * Updates the work request(s) estimated cost for Labor and the total estimated costs
     * if the work request(s) is not assigned to a craftsperson (no wrcf_sync records for the work request)
     * @param {Model/Array} wrRecord
     * @param onCompleted
     * @param scope
     */
    updateCostsForLaborFromTrade: function (wrRecord, onCompleted, scope) {
        var me = this,
            wrRecords = Ext.isArray(wrRecord) ? wrRecord : [wrRecord],
            wrWithNoCfRecords = [],
            getWrWithNoCf = function (wr) {
                var wrcfRecords = this,
                    wrFound = false;

                Ext.Array.each(wrcfRecords, function (wrcf) {
                    if (wr.get('wr_id') === wrcf.get('wr_id')) {
                        wrFound = true;
                    }
                });

                return !wrFound;
            },
            wrCfStore = Ext.getStore('workRequestCraftspersonsStore'),
            workRequestCfFilterArray = WorkRequestFilter.createNotEmptyFilterArray('wr_id', wrRecords, 'OR'),
            workRequestTradesStore = Ext.getStore('workRequestTradesStore'),
            wrTrFilterArray,
            trStore = Ext.getStore('tradesStore'),
            trFilterArray;

        wrCfStore.retrieveAllStoreRecords(workRequestCfFilterArray, function (wrcfRecords) {
            wrWithNoCfRecords = Ext.Array.filter(wrRecords, getWrWithNoCf, wrcfRecords);

            wrTrFilterArray = WorkRequestFilter.createNotEmptyFilterArray('wr_id', wrWithNoCfRecords, 'OR');
            workRequestTradesStore.retrieveAllStoreRecords(wrTrFilterArray, function (wrtrRecords) {
                trFilterArray = WorkRequestFilter.createNotEmptyFilterArray('tr_id', wrtrRecords, 'OR');

                trStore.retrieveAllStoreRecords(trFilterArray, function (trRecords) {
                    WorkRequestCostsUtil.updateWorkRequestCosts(WorkRequestCostsUtil.resourceTypes.trade,
                        wrWithNoCfRecords, wrtrRecords, trRecords);

                    Ext.callback(onCompleted, scope);
                }, me);
            }, me);
        }, me);
    },

    createWorkRequestPartRecord: function (fieldSet, wrRecord) {
        var partId,
            qtyEstimated,
            qtyActual,
            record,
            workRequestPartsStore = Ext.getStore('workRequestPartsStore');

        partId = fieldSet.get('part_id').getValue();
        qtyEstimated = fieldSet.get('qty_estimated').getValue();
        qtyActual = fieldSet.get('qty_actual').getValue();

        record = this.getEditRecordFromCurrentView('pt') ? this.getEditRecordFromCurrentView('pt') : Ext.create('Maintenance.model.WorkRequestPart');

        workRequestPartsStore.setAutoSync(false);

        record.set('wr_id', wrRecord.get('wr_id'));
        record.set('mob_wr_id', wrRecord.getId());
        record.set('part_id', partId);
        record.set('pt_store_loc_id', fieldSet.get('pt_store_loc_id').getValue());
        record.set('qty_estimated', !Ext.isEmpty(qtyEstimated) && Ext.isNumeric(qtyEstimated) ? qtyEstimated : 0);
        record.set('qty_actual', !Ext.isEmpty(qtyActual) && Ext.isNumeric(qtyActual) ? qtyActual : 0);

        if(Ext.isEmpty(this.getMainView().getNavigationBar().getCurrentView().editPartRecord)){
            record.set('date_assigned', new Date());
            record.set('time_assigned', new Date());
        }
        record.setChangedOnMobile();

        workRequestPartsStore.setAutoSync(true);

        return record;
    },

    onAddTrade: function () {
        var me = this,
            fieldSet = this.getAddTradeForm().getItems(),
            estimateForm = this.getEstimateForm(),
            wrRecord = estimateForm.getRecord(),
            record, store,
            onSyncCompleted = function () {
                store.setAutoSync(true);
                store.load(function () {
                    if (!me.getEditRecordFromCurrentView('tr')) {
                        FormUtil.clearTradesForm(fieldSet);
                    }
                    store.resumeEvents(false);
                    me.updateCostsForLaborFromTrade(wrRecord, function () {
                        estimateForm.setRecord(wrRecord);
                    }, me);
                });
            };

        record = me.createWorkRequestTradeRecord(fieldSet, wrRecord);

        if (record.isValid()) {
            store = Ext.getStore('workRequestTradesStore');
            store.suspendEvents();
            store.setAutoSync(false);
            store.add(record);
            store.sync(function () {
                Ext.callback(onSyncCompleted);
            });
        } else {
            this.getEstimateForm().displayErrors(record);
        }
    },

    createWorkRequestTradeRecord: function (fieldSet, wrRecord) {
        //Only from Estimate Form can be added trades
        var trId,
            hoursEst,
            record,
            workRequestTradesStore = Ext.getStore('workRequestTradesStore');

        trId = fieldSet.get('tr_id').getValue();
        hoursEst = fieldSet.get('hours_est').getValue();

        record = this.getEditRecordFromCurrentView('tr') ? this.getEditRecordFromCurrentView('tr') : Ext.create('Maintenance.model.manager.WorkRequestTrade');

        workRequestTradesStore.setAutoSync(false);
        record.set('wr_id', wrRecord.get('wr_id'));
        record.set('tr_id', trId);
        record.set('hours_est', hoursEst);
        record.setChangedOnMobile();
        workRequestTradesStore.setAutoSync(true);

        return record;
    },

    onAddOtherCost: function () {
        var me = this,
            fieldSet = this.getAddOtherCostForm().getItems(),
            viewStack = me.getMainView().getNavigationBar().getViewStack(),
            mainForm = viewStack[viewStack.length - 2],
            wrRecord = mainForm.getRecord(),
            record, store, isValid, isDuplicateCost,
            onSyncCompleted = function () {
                store.setAutoSync(true);
                store.load(function () {
                    if (!me.getEditRecordFromCurrentView('cost')) {
                        FormUtil.clearCostsForm(fieldSet);
                    }

                    store.resumeEvents(false);
                    me.updateCostsForOtherCost(wrRecord, function () {
                        // refresh the resumeCostsForm
                        if (me.getEstimateForm()) {
                            mainForm.setRecord(wrRecord);
                        } else {
                            me.getEstimateCostsForm().setRecord(wrRecord);
                        }
                    }, me);
                });
            };

        isValid = me.validateEstimatedCost(fieldSet);
        if (isValid) {
            return;
        }
        record = me.createWorkRequestCostRecord(fieldSet, wrRecord);

        //KB#3046832:check duplicate cost records before create the new one
        isDuplicateCost = me.checkDuplicateCost(record);
        if (isDuplicateCost) {
            return;
        }

        if (record.isValid()) {
            store = Ext.getStore('workRequestCostsStore');
            store.suspendEvents();
            store.setAutoSync(false);
            store.add(record);

            store.sync(function () {
                Ext.callback(onSyncCompleted);
            });
        } else {
            mainForm.displayErrors(record);
        }
    },

    // validate Estimated Costs field
    validateEstimatedCost: function (fieldSet) {
        var me = this,
            costEstimated = fieldSet.get('cost_estimated').getValue();

        if (!Ext.isEmpty(costEstimated)) {
            if (( costEstimated > Constants.EstimateMaxValue) || costEstimated < Constants.EstimateMinValue) {
                Ext.Msg.alert(me.getEstimateTitle(), me.getEstimateText());
                return true;
            }
        }
        return false;
    },

    // check deuplicate cost
    checkDuplicateCost: function (newRecord) {
        var me = this,
            workRequestCostsStore = Ext.getStore('workRequestCostsStore'),
            existingRecords = workRequestCostsStore.getData(),
            wrId = newRecord.get('wr_id'),
            otherRsType = newRecord.get('other_rs_type'),
            dateUsed = newRecord.get('date_used'),
            duplicate = false;

        //only need to check duplicate cost when adding new one
        if (!this.getEditRecordFromCurrentView('cost')) {

            existingRecords.each(function (record) {
                if (otherRsType === record.get('other_rs_type') && wrId === record.get('wr_id') && record.get('date_used').toDateString() === dateUsed.toDateString()) {
                    duplicate = true;
                }
            });

            if (duplicate) {
                Ext.Msg.alert(me.getEstimateTitle(), me.getDuplicateCostText());
            }
        }

        return duplicate;
    },

    createWorkRequestCostRecord: function (fieldSet, wrRecord) {
        var record,
            otherRsType = fieldSet.get('other_rs_type').getValue(),
            description = fieldSet.get('description').getValue(),
            qtyUnitsContainer = fieldSet.get('qtyUnitsContainer').getItems(),
            qtyUsed = qtyUnitsContainer.get('qty_used').getValue(),
            unitsUsed = qtyUnitsContainer.get('units_used').getValue(),
            costEstimated = fieldSet.get('cost_estimated').getValue(),
            costTotal = fieldSet.get('cost_total').getValue(),
            workRequestCostsStore = Ext.getStore('workRequestCostsStore');

        record = this.getEditRecordFromCurrentView('cost') ? this.getEditRecordFromCurrentView('cost') : Ext.create('Maintenance.model.WorkRequestCost');

        workRequestCostsStore.setAutoSync(false);

        record.set('wr_id', wrRecord.get('wr_id'));
        record.set('mob_wr_id', wrRecord.getId());
        record.set('other_rs_type', otherRsType);
        record.set('description', description);
        record.set('qty_used', qtyUsed);
        record.set('units_used', unitsUsed);
        record.set('cost_estimated', !Ext.isEmpty(costEstimated) && Ext.isNumeric(costEstimated) ? costEstimated : 0);
        record.set('cost_total', !Ext.isEmpty(costTotal) && Ext.isNumeric(costTotal) ? costTotal : 0);

        record.setChangedOnMobile();

        //required fields
        record.set('date_used', new Date());

        workRequestCostsStore.setAutoSync(true);

        return record;
    },

    /**
     * Approve the work request
     */
    onApproveButtonTapped: function () {
        var me = this,
            mainView = me.getMainView(),
            approveFormView = mainView.getNavigationBar().getCurrentView(),
            record = approveFormView.getRecord(),
            workRequestStore = Ext.getStore('workRequestsStore');

        workRequestStore.setAutoSync(false);
        if (approveFormView.xtype === 'approveFormPanel') {
            approveFormView.updateRecord(record);
        }

        record.setMobileStepActionChanged(me.getMobStepActionForApproveRequest(record));
        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
            NavigationUtil.navigateBack(me.getMainView());
        });
    },

    /**
     * Reject the work request
     */
    onRejectButtonTapped: function () {
        var me = this,
            mainView = me.getMainView(),
            approveFormView = mainView.getNavigationBar().getCurrentView(),
            rejectOptionView,
            record = approveFormView.getRecord(),
            workRequestStore = Ext.getStore('workRequestsStore');

        record.set('mob_step_comments', approveFormView.getValues().mob_step_comments);
        if (Ext.isEmpty(record.get('mob_step_comments'))) {
            Ext.Msg.alert(me.getRejectTitle(), me.getRejectMessage());
        } else {

            Network.checkNetworkConnectionAndDisplayMessageAsync(function (isConnected) {
                if (isConnected) {
                    rejectOptionView = Ext.create('Maintenance.view.manager.RejectOptionForm');
                    rejectOptionView.setRecord(record);
                    rejectOptionView.loaRejectOptions(record.get('wr_id'));
                    me.getMainView().push(rejectOptionView);
                } else {
                    workRequestStore.setAutoSync(false);
                    record.setMobileStepActionChanged(me.getMobStepActionForRejectRequest(record));
                    workRequestStore.sync(function () {
                        workRequestStore.setAutoSync(true);
                        Ext.Msg.alert(me.getRejectTitle(), me.getRejectBackMessage());
                        NavigationUtil.navigateBack(me.getMainView());
                    });
                }
            }, me);

        }

    },

    /**
     * Confirm Reject the work request
     */
    onConfirmRejectButtonTapped: function () {
        var me = this,
            mainView = me.getMainView(),
            rejectOptionView = mainView.getNavigationBar().getCurrentView(),
            record = rejectOptionView.getRecord(),
            workRequestStore = Ext.getStore('workRequestsStore');

        workRequestStore.setAutoSync(false);
        record.setMobileStepActionChanged(me.getMobStepActionForRejectRequest(record));
        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
            mainView.pop(2);
        });

    },


    /**
     * Confirm Return the work request
     */
    onConfirmReturnButtonTapped: function () {
        var me = this,
            mainView = me.getMainView(),
            rejectOptionView = mainView.getNavigationBar().getCurrentView(),
            record = rejectOptionView.getRecord(),
            workRequestStore = Ext.getStore('workRequestsStore');

        workRequestStore.setAutoSync(false);
        record.setMobileStepActionChanged(me.getMobStepActionForReturnRequest(record));
        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
            mainView.pop(2);
        });

    },
    /**
     * Cancel the work request
     */
    onCancelButtonTapped: function () {
        var me = this,
            workRequestRecord = me.getMainView().getNavigationBar().getCurrentView().getRecord();

        Ext.Msg.confirm(me.getCancelTitle(), me.getCancelInstructionMessage(),
            function (buttonId) {
                if (buttonId === 'yes') {
                    me.setWorkRequestStatus(workRequestRecord, 'Can', function () {
                        NavigationUtil.navigateBack(me.getMainView());
                    });
                }
            });
    },

    /**
     *
     * @param record
     */
    onActionPickerItemSelected: function (record) {
        var me = this,
            action = record.get('action'),
            step = record.get('step'),
            actionDisplayValue = record.get('text'),
            mainView = me.getMainView(),
            currentView = mainView.getNavigationBar().getCurrentView(),
            workRequestRecord = currentView.getRecord(),
            workRequestStore = Ext.getStore('workRequestsStore');
        //KB#3046265 If Work Request selected from MyWork tab, then run method from WorkRequestForms.onActionPickerItemSelectedForMyWork();
        if(currentView.xtype==="ReturnCfPanel"){
            return;
        }
        if(currentView.getDisplayMode()===Constants.MyWork){
            return;
        }

        if (!workRequestRecord) {
            Ext.Msg.alert('ERROR', 'The work request record is null');
            return;
        }

        if (me.checkStatusChangedAndDisplayMessage(workRequestRecord)) {
            return;
        }

        if (WorkRequestAction.statusChangeOnlyActions.hasOwnProperty(action)) {
            if (!me.checkPendingStepAndDisplayMessage(workRequestRecord, action)) {
                // Get the work request record
                //this.supervisorCompleteOptionsPanel = Ext.create('Maintenance.view.manager.SupervisorCompleteOptions');
                //this.getMainView().push(this.supervisorCompleteOptionsPanel);
                //alert(action)
                Ext.Msg.confirm(actionDisplayValue, me.getInstructionMessageByAction(action),
                    function (buttonId) {
                        if (buttonId === 'yes') {
                            if (action === 'complete') {
                                me.doComplete(workRequestRecord);
                            } else {
                                me.setWorkRequestStatus(workRequestRecord, WorkRequestAction.statusChangeOnlyActions[action]);
                                if (action === 'resume-issued'
                                    || action === 'hold-labor' || action === 'hold-parts' || action === 'hold-access') {

                                    if (workRequestRecord.get('status_initial') === workRequestRecord.get('status')) {
                                        // undo the status change flag
                                        workRequestStore.setAutoSync(false);
                                        workRequestRecord.setMobileStatusChanged(0);
                                        workRequestStore.sync(function () {
                                            workRequestStore.setAutoSync(true);
                                        });
                                    }
                                }
                            }
                        }
                    });
            }
        } else {
            switch (action) {
                case 'estimation':
                    me.openEstimateForm(workRequestRecord);
                    break;

                case 'approval':
                    if (step === 'Estimation Approval') {
                        me.openEstimateApproveForm(workRequestRecord, record);
                    } else if (step === 'Schedule Approval') {
                        me.openScheduleApproveForm(workRequestRecord, record);
                    } else {
                        me.openApproveForm(workRequestRecord, record);
                    }
                    break;

                case 'scheduling':
                    me.openScheduleForm(workRequestRecord);
                    break;

                case 'assignToMe':
                    me.doAssignToMe(workRequestRecord);
                    break;
                case 'linkNew':
                    me.doLinkNew(workRequestRecord);
                    break;
                case 'returnFromSupervisor':
                    me.doReturnFromSupervisor(workRequestRecord);
                    break;
                case 'forwardRequest':
                    me.openForwardForm(workRequestRecord);
                    break;
                case 'returnFromCf':
                    me.doReturnFromCf(workRequestRecord);
                    break;
                    
                // TODO case 'forward' ?? Is this really an option? In WebC is a button on the Schedule form
                // KB#3050226 add 'verification' functionality.
                case 'verification':
                    me.openVerifyForm(workRequestRecord);
                    break;
                default:
                    Ext.Msg.alert('Development', 'To be implemented');
                    break;
            }
        }
    },

    /**
     * Complete action handler.
     * @param workRequestRecord
     */
    doComplete: function (workRequestRecord) {
        var me = this,
            workRequestStore = Ext.getStore('workRequestsStore'),
            completeAction = workRequestRecord.get('is_req_supervisor') === 1 ? 'supervisorComplete' : 'cfComplete';

        if (workRequestRecord.get('is_req_supervisor') === 1) {
            if (me.checkCfAssignmentsForSupervisor()) {
                // Get the work request record
                me.supervisorCompleteOptionsPanel = Ext.create('Maintenance.view.manager.SupervisorCompleteOptions');
                me.supervisorCompleteOptionsPanel.setRecord(workRequestRecord);
                me.getMainView().push(me.supervisorCompleteOptionsPanel);
                return;
            } else {
                workRequestStore.setAutoSync(false);
                workRequestRecord.setMobileStepActionChanged(completeAction);
                workRequestStore.sync(function () {
                    workRequestStore.setAutoSync(true);
                    NavigationUtil.navigateBack(me.getMainView());
                });
            }
        } else {
            workRequestStore.setAutoSync(false);
            workRequestRecord.setMobileStepActionChanged(completeAction);
            workRequestStore.sync(function () {
                workRequestStore.setAutoSync(true);
                NavigationUtil.navigateBack(me.getMainView());
            });
        }
    },

    /**
     * Checks if all of the craftsperson records for this Work Request have labor hours populated.
     * @returns {boolean} true if all craftsperson records have labor data entered, false otherwise.
     */
    checkCfAssignmentsForSupervisor: function () {
        var craftsPersonsStore = Ext.getStore('workRequestCraftspersonsStore'),
            userProfile = Common.util.UserProfile.getUserProfile(),
            isSuperviorAssigned = false,
            isOtherCfAssigned = false,
            ln = craftsPersonsStore.getCount(),
            i;

        for (i = 0; i < ln; i++) {
            if (craftsPersonsStore.getAt(i).get('cf_id') === userProfile.cf_id && craftsPersonsStore.getAt(i).get('status') === 'Active') {
                isSuperviorAssigned = true;
            }
            if (craftsPersonsStore.getAt(i).get('cf_id') !== userProfile.cf_id && craftsPersonsStore.getAt(i).get('status') === 'Active') {
                isOtherCfAssigned = true;
            }
        }
        return isSuperviorAssigned && isOtherCfAssigned;
    },
    
    /**
     * Return work request from supervisor.
     * @param workRequestRecord
     */
    doReturnFromCf: function (workRequestRecord) {
        var me = this, returnCfForm;
        returnCfForm = Ext.create('Maintenance.view.manager.ReturnCfForm');
        returnCfForm.setRecord(workRequestRecord);
        me.getMainView().push(returnCfForm);
    },

    /**
     * Returns the confirmation message to display according to the given action
     * @param action
     * @returns {string}
     */
    getInstructionMessageByAction: function (action) {
        var me = this,
            message = '';

        switch (action) {
            case 'issue':
                message = me.getIssueInstructionMessage();
                break;

            case 'resume-issued':
                message = me.getResumeToIssueInstructionMessage();
                break;

            case 'cancel':
                message = me.getCancelInstructionMessage();
                break;

            case 'hold-parts':
            case 'hold-labor':
            case 'hold-access':
                message = me.getHoldInstructionMessage();
                break;

            case 'stop':
                message = me.getStopInstructionMessage();
                break;

            case 'complete':
                message = me.getCompleteInstructionMessage();
                break;

            case 'close':
                message = me.getCloseInstructionMessage();
                break;

            default:
                break;
        }

        return message;
    },

    /**
     *
     * @param record
     * @returns {boolean}
     */
    checkStatusChangedAndDisplayMessage: function (record) {
        var me = this,
            statusChanged = WorkRequestAction.checkStatusChanged(record);

        if (statusChanged) {
            Ext.Msg.alert(me.getStatusChangedTitle(), me.getStatusChangedMessage());
        }

        return statusChanged;
    },

    /**
     * Checks if a pending step exists. Displays message if true.
     * @param record work request record
     * @param action The action to take on the work request
     * @returns {boolean}
     */
    checkPendingStepAndDisplayMessage: function (record, action) {
        var me = this,
            hasPendingStep = WorkRequestAction.checkPendingStep(record, action);

        if (hasPendingStep) {
            Ext.Msg.alert(me.getCompletePendingStepTitle(), me.getCompletePendingStepMessage());
        }

        return hasPendingStep;
    },

    /**
     * Navigates to Schedule form view
     * @param record work request record
     */
    openScheduleForm: function (record) {
        var me = this,
        //KB#3050980 Add references store
            storeIds = ['referenceStore', 'workRequestCraftspersonsStore', 'workRequestToolsStore', 'workRequestTradesStore'],
            editView = Ext.create('Maintenance.view.manager.ScheduleForm'),
            wrIdFilter = WorkRequestFilter.createFilter('wr_id', record.get('wr_id'));

        editView.setRecord(record);
        me.getDocumentsForm().setRecord(record);

        WorkRequestFilter.filterAndLoadStores(storeIds, [wrIdFilter], function () {
            me.setReferenceButtonBadgeText(me.getScheduleReferenceButton());
            me.getMainView().push(editView);
        }, me);
    },

    /**
     * Navigates to Estimate form view
     * @param record work request record
     */
    openEstimateForm: function (record) {
        var me = this,
        //KB#3050980 Add references store
            storeIds = ['referenceStore', 'workRequestPartsStore', 'workRequestTradesStore', 'workRequestCostsStore'],
            editView = Ext.create('Maintenance.view.manager.EstimateForm'),
            wrIdFilter = WorkRequestFilter.createFilter('wr_id', record.get('wr_id'));

        editView.setRecord(record);
        me.getDocumentsForm().setRecord(record);

        WorkRequestFilter.filterAndLoadStores(storeIds, [wrIdFilter], function () {
            me.setReferenceButtonBadgeText(me.getEstimateReferenceButton());
            me.getMainView().push(editView);
        }, me);
    },

    /**
     * Set reference button badge text,beacuse to estimateForm and scheduleForm
     */
    setReferenceButtonBadgeText: function (segmentButton) {
        var store = Ext.getStore('referenceStore'),
            count = store.getCount();
        if (count > 0) {
            segmentButton.setBadgeText(count.toString());
        } else {
            segmentButton.setBadgeText('');
        }
    },

    /**
     * Complete scheduling the work request
     */
    onCompleteSchedulingButtonTapped: function () {
        var me = this,
            mainView = me.getMainView(),
            scheduleFormView = mainView.getNavigationBar().getCurrentView(),
            records,
            workRequestStore = Ext.getStore('workRequestsStore'),
            statusChanged = false;

        if (scheduleFormView.xtype === 'scheduleFormMultiplePanel') {
            // multiple selection
            records = workRequestStore.getSelectedWorkRequests();
        } else {
            // single selection
            records = [scheduleFormView.getRecord()];
        }

        Ext.Array.each(records, function (record) {
            if (me.checkStatusChangedAndDisplayMessage(record)) {
                statusChanged = true;
            }
        }, me);

        if (statusChanged) {
            return;
        }

        Ext.Msg.confirm(me.getCompleteSchedulingInstructionTitle(), me.getCompleteSchedulingInstructionMessage(),
            function (buttonId) {
                if (buttonId === 'yes') {
                    workRequestStore.setAutoSync(false);
                    Ext.Array.each(records, function (record) {
                        record.setMobileStepActionChanged('completeScheduling');
                    }, me);
                    workRequestStore.sync(function () {
                        workRequestStore.setAutoSync(true);
                    });
                }
            });
    },


    /**
     * Open forward form
     */
    openForwardForm: function (record) {
        var me = this,
            forwardFormView = Ext.create('Maintenance.view.manager.ForwardForm',{forwardIssuedRequest:true});

        if (me.checkStatusChangedAndDisplayMessage(record)) {
            return;
        }

        forwardFormView.setRecord(record);
        me.getMainView().push(forwardFormView);
    },

    /**
     * Opens the Forward pop-up to forward the work request
     */
    onForwardButtonTapped: function () {
        var me = this,
            record = me.getScheduleForm().getRecord(),
            forwardFormView = Ext.create('Maintenance.view.manager.ForwardForm');

        if (me.checkStatusChangedAndDisplayMessage(record)) {
            return;
        }

        forwardFormView.setRecord(record);
        me.getMainView().push(forwardFormView);
    },

    /**
     * Update record from Forward Form and navigate to the main view
     */
    onForwardWorkRequestButtonTapped: function () {
        var me = this,
            workRequestStore,
            mainView = me.getMainView(),
            forwardForm = mainView.getNavigationBar().getCurrentView(),
            fwdRecord = forwardForm.getRecord();
        
        if (!fwdRecord.isValid()) {
            forwardForm.displayErrors(fwdRecord);
            return;
        }
        if (Ext.isEmpty(fwdRecord.get('fwd_supervisor_virtual')) && Ext.isEmpty(fwdRecord.get('fwd_work_team_id_virtual'))) {
            Ext.Msg.alert(me.getForwardFormErrorTitle(), me.getForwardFormErrorMessageNull());
            return;
        }
        if (!Ext.isEmpty(fwdRecord.get('fwd_supervisor_virtual')) && !Ext.isEmpty(fwdRecord.get('fwd_work_team_id_virtual'))) {
            Ext.Msg.alert(me.getForwardFormErrorTitle(), me.getForwardFormErrorMessageBoth());
            return;
        }

        workRequestStore = Ext.getStore('workRequestsStore');
        workRequestStore.setAutoSync(false);
        me.forwardFormUpdateRecord(fwdRecord,forwardForm.getForwardIssuedRequest());
        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
            NavigationUtil.navigateBack(me.getMainView());
        });
    },

    /**
     * update Forward Form record with the filled in valus
     * @param fwdRecord
     * @returns {Maintenance.model.WorkRequest}
     */
    forwardFormUpdateRecord: function (fwdRecord, forwardIssuedRequests) {
        var mobStepComments, fwdSupervisor, fwdWorkTeamId;

        if (Ext.isDefined(fwdRecord.get('mob_step_comments_virtual'))) {
            mobStepComments = fwdRecord.get('mob_step_comments_virtual');
            fwdRecord.set('mob_step_comments_virtual', null); // KB 3045644 clear the virtual field
        }
        if (Ext.isDefined(fwdRecord.get('fwd_supervisor_virtual'))) {
            fwdSupervisor = fwdRecord.get('fwd_supervisor_virtual');
            fwdRecord.set('fwd_supervisor_virtual', null); // KB 3045644 clear the virtual field
        }
        if (Ext.isDefined(fwdRecord.get('fwd_work_team_id_virtual'))) {
            fwdWorkTeamId = fwdRecord.get('fwd_work_team_id_virtual');
            fwdRecord.set('fwd_work_team_id_virtual', null); // KB 3045644 clear the virtual field
        }

        if (Ext.isDefined(mobStepComments)) {
            fwdRecord.set('mob_step_comments', mobStepComments);
        }
        if (Ext.isDefined(fwdSupervisor)) {
            fwdRecord.set('fwd_supervisor', fwdSupervisor);
        }
        if (Ext.isDefined(fwdWorkTeamId)) {
            fwdRecord.set('fwd_work_team_id', fwdWorkTeamId);
        }

        if(forwardIssuedRequests){
        	fwdRecord.setMobileStepActionChanged('forwarIssueddWorkRequest');
        }else{
        	fwdRecord.setMobileStepActionChanged('forwardWorkRequest');
        }
        

        return fwdRecord;
    },

    /**
     * Complete estimation of the work request
     */
    onCompleteEstimationButtonTapped: function () {
        var me = this,
            mainView = me.getMainView(),
            estimateFormView = mainView.getNavigationBar().getCurrentView(),
            records = estimateFormView.getRecord(),
            workRequestStore = Ext.getStore('workRequestsStore'),
            statusChanged = false;

        if (estimateFormView.xtype === 'estimateFormMultiplePanel') {
            // multiple selection
            records = workRequestStore.getSelectedWorkRequests();
        } else {
            // single selection
            records = [estimateFormView.getRecord()];
        }

        Ext.Array.each(records, function (record) {
            if (me.checkStatusChangedAndDisplayMessage(record)) {
                statusChanged = true;
            }
        }, me);

        if (statusChanged) {
            return;
        }

        Ext.Msg.confirm(me.getCompleteEstimationInstructionTitle(), me.getCompleteEstimationInstructionMessage(),
            function (buttonId) {
                if (buttonId === 'yes') {
                    workRequestStore.setAutoSync(false);
                    Ext.Array.each(records, function (record) {
                        record.setMobileStepActionChanged('completeEstimation');
                    }, me);
                    workRequestStore.sync(function () {
                        workRequestStore.setAutoSync(true);
                        //NavigationUtil.navigateBack(me.getMainView());
                    });
                }
            });
    },

    /**
     * Opens the Approve form
     * @param record work request record
     * @param actionRecord
     */
    openApproveForm: function (record, actionRecord) {
        var me = this,
            editView,
            step = actionRecord.get('step'),
            actionText = actionRecord.get('text');

        editView = Ext.create('Maintenance.view.manager.ApproveForm');
        editView.setRecord(record);

        if (!Ext.isEmpty(step)) {
            editView.setTitle(actionText);
        }
        me.getMainView().push(editView);
    },

    /**
     * Opens the Estimate Approve form
     * @param record work request record
     * @param actionRecord
     */
    openEstimateApproveForm: function (record, actionRecord) {
        var me = this,
            editView,
            step = actionRecord.get('step'),
            wrIdFilter = WorkRequestFilter.createFilter('wr_id', record.get('wr_id')),
            storeIds = ['referenceStore','workRequestPartsStore', 'workRequestTradesStore', 'workRequestCostsStore'],
            actionText = actionRecord.get('text');

        editView = Ext.create('Maintenance.view.manager.EstimateApproveForm');
        editView.setRecord(record);

        if (!Ext.isEmpty(step)) {
            editView.setTitle(actionText);
        }

        me.getDocumentsForm().setRecord(record);

        WorkRequestFilter.filterAndLoadStores(storeIds, [wrIdFilter], function () {
            me.setReferenceButtonBadgeText(me.getEstimateApprovedReferenceButton());
            me.getMainView().push(editView);
        }, me);
    },

    /**
     * Opens the Schedule Approve form
     * @param record work request record
     * @param actionRecord
     */
    openScheduleApproveForm: function (record, actionRecord) {
        var me = this,
            editView,
            wrIdFilter = WorkRequestFilter.createFilter('wr_id', record.get('wr_id')),
            storeIds = ['referenceStore','workRequestCraftspersonsStore', 'workRequestToolsStore', 'workRequestTradesStore'],
            step = actionRecord.get('step'),
            actionText = actionRecord.get('text');

        editView = Ext.create('Maintenance.view.manager.ScheduleApproveForm');
        editView.setRecord(record);
        me.getDocumentsForm().setRecord(record);

        if (!Ext.isEmpty(step)) {
            editView.setTitle(actionText);
        }

        WorkRequestFilter.filterAndLoadStores(storeIds, [wrIdFilter], function () {
            me.setReferenceButtonBadgeText(me.getScheduleApprovedReferenceButton());
            me.getMainView().push(editView);
        }, me);
    },

    /**
     * Assigns the work request to the user (user's craftsperson id) and sets the WR status to Issued
     * @param wrRecord
     */
    doAssignToMe: function (wrRecord) {
        var me = this,
            workRequestCraftspersonsStore,
            wrId = wrRecord.get('wr_id'),
            wrIdFilter = Ext.create('Common.util.SqlFilter', {
                sql: "(status = 'Active' and wr_id = " + wrId + ')'
            }),
            userProfile = Common.util.UserProfile.getUserProfile(),
            cfId = userProfile.cf_id,
            newCfRecord,
            assignToMeTitle = me.getAssignToMeTitle();


        if (me.checkPendingStepAndDisplayMessage(wrRecord, 'assignToMe')) {
            return;
        }

        workRequestCraftspersonsStore = Ext.getStore('workRequestCraftspersonsStore');
        workRequestCraftspersonsStore.retrieveRecord(wrIdFilter, function (cfRecord) {
            if (cfRecord) {
                Ext.Msg.alert(assignToMeTitle, me.getAssignToMeMessage());
            } else {
                Ext.Msg.confirm(assignToMeTitle, me.getAssignToMeConfirmMessage(),
                    function (buttonId) {
                        var workRequestStore = Ext.getStore('workRequestsStore'),
                            autoSync = workRequestStore.getAutoSync();
                        if (buttonId === 'yes') {
                            // Turn off auto sync
                            workRequestStore.setAutoSync(false);
                            newCfRecord = me.createWorkRequestCraftspersonRecord(wrRecord, {cf_id: cfId});
                            me.addWorkRequestCraftsperson(newCfRecord, function () {
                                me.updateCostsForLaborFromCraftspersons(wrRecord, function () {
                                    // setWorkRequestSelfAssignStepAction syncs the WorkRequest store
                                    me.setWorkRequestSelfAssignStepAction(wrRecord, function() {
                                        // Auto sync should be set on in the
                                        workRequestStore.setAutoSync(autoSync);
                                        Ext.Msg.alert(assignToMeTitle, me.getAssignToMeDoneMessage());
                                    }, me);
                                }, me); // TODO ? the est_hours = zero; should open a pop-up to fill in hours?
                            }, me);
                        }
                    });
            }
        }, me);
    },

    /**
     * Create a new work request and linked to current work request.
     * @param wrRecord
     */
    doLinkNew: function (wrRecord) {
        var navigationController = this.getApplication().getController('Maintenance.controller.WorkRequestNavigation'),
            addForm,
            copyValues = {},
            mainView = this.getMainView();
        addForm = navigationController.displayAddPanel(mainView);
        addForm.setIsLinkNewForm(true);
        addForm.showCreateRelatedRequestTitle();
        copyValues.bl_id = wrRecord.get('bl_id');
        copyValues.fl_id = wrRecord.get('fl_id');
        copyValues.rm_id = wrRecord.get('rm_id');
        copyValues.location = wrRecord.get('location');
        copyValues.prob_type = wrRecord.get('prob_type');
        copyValues.eq_id = wrRecord.get('eq_id');
        copyValues.parent_wr_id = wrRecord.get('wr_id');
        addForm.setValues(copyValues);
    },

    /**
     * Return work request from supervisor.
     * @param record
     */
    doReturnFromSupervisor: function (record) {
        var me = this,
            workRequestStore,
            returnOptionForm;

        Network.checkNetworkConnectionAndDisplayMessageAsync(function (isConnected) {
            if (isConnected) {
                returnOptionForm = Ext.create('Maintenance.view.manager.ReturnOptionForm');
                returnOptionForm.setRecord(record);
                returnOptionForm.loaReturnOptions(record.get('wr_id'));
                me.getMainView().push(returnOptionForm);
            } else {
                workRequestStore = Ext.getStore('workRequestsStore');
                workRequestStore.setAutoSync(false);
                record.setMobileStepActionChanged(me.getMobStepActionForReturnRequest(record));
                workRequestStore.sync(function () {
                    workRequestStore.setAutoSync(true);
                    Ext.Msg.alert(me.getReturnTitle(), me.getRejectBackMessage());
                    NavigationUtil.navigateBack(me.getMainView());
                });
            }
        }, me);
    },

    /**
     * Sets the selfAssignWorkRequest step action and the 'I' status to the work request(s).
     * @param {Common.data.Model/Array} wrRecords Record object or array of record objects
     * @param [onCompleted] onCompleted Callback
     * @param [scope] scope The scope used to execute the Callback function onCompleted
     */
    setWorkRequestSelfAssignStepAction: function (wrRecords, onCompleted, scope) {
        var me = this,
            records = Ext.isArray(wrRecords) ? wrRecords : [wrRecords];

        Ext.each(records, function (record) {
            record.setMobileStepActionChanged('selfAssignWorkRequest');
        });

        me.setWorkRequestStatus(records, 'I', onCompleted, scope);
    },

    /**
     *
     * Sets the status of the work request(s).
     * @param {Common.data.Model/Array} records Record object or array of record objects
     * @param status
     * @param [onCompleted] onCompleted Callback
     * @param [scope] scope The scope used to execute the Callback function onCompleted
     */
    setWorkRequestStatus: function (records, status, onCompleted, scope) {
        var workRequestStore = Ext.getStore('workRequestsStore'),
            wrRecords = Ext.isArray(records) ? records : [records];

        workRequestStore.setAutoSync(false);

        Ext.each(wrRecords, function (record) {
            record.set('status', status);
            record.setMobileStatusChanged();
        });

        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
            Ext.callback(onCompleted, scope);
        });
    },

    getMobStepActionForApproveRequest: function (workRequestRecord) {
        var mobStepAction = 'approve',
            step = workRequestRecord.get('step');

        switch (workRequestRecord.get('step_type')) {
            case 'approval':
                if (step === 'Manager Approval') {
                    mobStepAction = 'approveManager';
                } else if (step === 'Estimation Approval') {
                    mobStepAction = 'approveEstimate';
                } else if (step === 'Schedule Approval') {
                    mobStepAction = 'approveSchedule';
                }
                break;

            default:
                break;
        }

        return mobStepAction;
    },

    getMobStepActionForRejectRequest: function (workRequestRecord) {
        var mobStepAction = 'reject',
            selectedRejectOption = -1,
            rejectOptions = this.getRejectRadioOptions(),
            step = workRequestRecord.get('step');

        switch (workRequestRecord.get('step_type')) {
            case 'approval':
                if (step === 'Manager Approval') {
                    mobStepAction = 'rejectManager';
                } else if (step === 'Estimation Approval') {
                    mobStepAction = 'rejectEstimate';
                } else if (step === 'Schedule Approval') {
                    mobStepAction = 'rejectSchedule';
                }
                break;

            default:
                break;
        }

        if (rejectOptions) {
            selectedRejectOption = rejectOptions.getValue();
        }

        mobStepAction += '|' + selectedRejectOption;

        return mobStepAction;
    },

    getMobStepActionForReturnRequest: function (workRequestRecord) {
        var mobStepAction = 'return',
            selectedReturnOption = '',
            rejectOptions = this.getRejectRadioOptions();

        if (rejectOptions) {
            selectedReturnOption = rejectOptions.getValue();
            mobStepAction += '|' + selectedReturnOption;
        }
        return mobStepAction;
    },

    getEditRecordFromCurrentView: function (type) {
        var editRecord = null;

        switch (type) {
            case 'pt':
                editRecord = this.getMainView().getNavigationBar().getCurrentView().editPartRecord;
                break;
            case 'tr':
                editRecord = this.getMainView().getNavigationBar().getCurrentView().editTradeRecord;
                break;
            case 'cost':
                editRecord = this.getMainView().getNavigationBar().getCurrentView().editCostRecord;
                break;
            case 'cf':
                editRecord = this.getMainView().getNavigationBar().getCurrentView().editCfRecord;
                break;
            case 'tl':
                editRecord = this.getMainView().getNavigationBar().getCurrentView().editTlRecord;
                break;
            default:
                break;
        }

        return editRecord;
    },

    openVerifyForm: function(record){
        var me = this,
            verifyForm = Ext.create('Maintenance.view.manager.VerifyForm');

        if (me.checkStatusChangedAndDisplayMessage(record)) {
            return;
        }

        verifyForm.setRecord(record);
        me.getMainView().push(verifyForm);
    }
});