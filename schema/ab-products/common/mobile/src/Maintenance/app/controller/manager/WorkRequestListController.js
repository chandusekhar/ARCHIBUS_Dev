/**
 * This class controls behaviour of the work request list view {@link Maintenance.view.WorkRequestList},
 * for both embedded sub-lists: list and {@link Maintenance.view.manager.WorkRequestManagerList}
 */
Ext.define('Maintenance.controller.manager.WorkRequestListController', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            mainView: 'mainview',
            workRequestList: 'workrequestListPanel',
            workRequestManagerList: 'workrequestListPanel workrequestManagerList',
            dropDownButton: 'workrequestListPanel > toolbar[docked=bottom] > buttonpicker',
            myWorkToolbar: 'workrequestListPanel toolbar[itemId=myWorkToolbar]',
            scheduleSegmentedButton: 'toolbar > segmentedbutton[itemId=scheduleSegmentedButton]',
            scheduleForm: 'scheduleForm',
            scheduleRequestDetailsForm: 'scheduleFormPanel > requestDetailsPanel',
            scheduleEstimateTradesForm: 'scheduleEstimateFormTrades',
            scheduleCraftspersonsForm: 'scheduleFormCraftspersons',
            scheduleToolsForm: 'scheduleFormTools',
            workRequestPanel: 'workRequestPanel',
            updateForm: 'updateFormPanel',
            documentsForm: 'workRequestDocumentList',
            //KB#3050980 References List Form
            referencesForm: 'workRequestReferencesList',
            estimateSegmentedButton: 'toolbar > segmentedbutton[itemId=estimateSegmentedButton]',
            estimateRequestDetailsForm: 'estimateFormPanel > requestDetailsPanel',
            estimateApprovedRequestDetailsForm:'estimateApproveFormPanel > requestDetailsPanel',
            scheduleApprovedRequestDetailsForm: 'scheduleApproveFormPanel > requestDetailsPanel',
            estimatePartsForm: 'estimateFormParts',
            estimateCostsForm: 'estimateFormCosts',
            estimatePartsList: 'estimateFormParts>list',
            estimateTradesList: 'scheduleEstimateFormTrades>list',
            estimateCostsList: 'estimateFormCosts>list',
            estimateCfList: 'scheduleFormCraftspersons>list',
            estimateToolList: 'scheduleFormTools>list',
            estimateApproveSegmentedButton: 'toolbar > segmentedbutton[itemId=estimateApproveSegmentedButton]',
            scheduleApproveSegmentedButton: 'toolbar > segmentedbutton[itemId=scheduleApproveSegmentedButton]',
            switchToAddNewPartModeButton: 'button[action=switchToAddNewPartMode]',
            switchToAddNewTradeModeButton: 'button[action=switchToAddNewTradeMode]',
            switchToAddNewCostModeButton: 'button[action=switchToAddNewCostMode]',
            switchToAddNewCfModeButton: 'button[action=switchToAddNewCfMode]',
            switchToAddNewToolModeButton: 'button[action=switchToAddNewToolMode]',
            copyCraftspersonButton: 'button[action=copyCraftsperson]',
            workRequestCheckboxAll: 'checkboxfield[name=workRequestCheckboxAll]',
            workRequestCheckbox: 'checkboxfield[name=workRequestCheckbox]',
            workRequestActionPicker: 'buttonpicker[itemId=workRequestActionPicker]',
            updateSegmentedButton: 'toolbar > segmentedbutton[itemId=updateSegmentedButton]'
        },

        control: {
            dropDownButton: {
                itemselected: 'onDropDownButtonItemSelected'
            },
            workRequestManagerList: {
                itemsingletap: 'onWorkRequestManagerListTapped',
                select: 'onWorkRequestManagerListSelect'
            },
            'workRequestFilterPanel': {
                clearFilter: 'onClearFilterForm',
                applyFilter: 'onApplyWorkRequestsFilter'
            },
            scheduleSegmentedButton: {
                toggle: 'onScheduleSegmentedButtonToggled'
            },
            estimateSegmentedButton: {
                toggle: 'onEstimateSegmentedButtonToggled'
            },
            estimateApproveSegmentedButton: {
                toggle: 'onEstimateApproveSegmentedButtonToggled'
            },
            scheduleApproveSegmentedButton: {
                toggle: 'onScheduleApproveSegmentedButtonToggled'
            },
            updateSegmentedButton: {
                toggle: 'onUpdateSegmentedButtonToggled'
            },
            workRequestCheckbox: {
                check: 'onWorkRequestCheckboxChanged',
                uncheck: 'onWorkRequestCheckboxChanged'
            },
            workRequestCheckboxAll: {
                check: 'onWorkRequestCheckboxAllChanged',
                uncheck: 'onWorkRequestCheckboxAllChanged'
            },
            estimatePartsList: {
                itemsingletap: 'onPartListItemTapped'
            },
            estimateTradesList: {
                itemsingletap: 'onTradeListItemTapped'
            },
            estimateCostsList: {
                itemsingletap: 'onCostListItemTapped'
            },
            estimateCfList: {
                itemsingletap: 'onCfListItemSingleTapped',
            },
            estimateToolList: {
                itemsingletap: 'onToolListItemTapped'
            },
            switchToAddNewPartModeButton: {
                tap: 'onSwitchToAddNewPartMode'
            },
            switchToAddNewTradeModeButton: {
                tap: 'onSwitchToAddNewTradeMode'
            },
            switchToAddNewCostModeButton: {
                tap: 'onSwitchToAddNewCostMode'
            },
            switchToAddNewCfModeButton: {
                tap: 'onSwitchToAddNewCfMode'
            },
            switchToAddNewToolModeButton: {
                tap: 'onSwitchToAddNewToolMode'
            },
            copyCraftspersonButton: {
                tap: 'onCopyCraftsperson'
            }
        }
    },

    /**
     *
     * @param record
     */
    onDropDownButtonItemSelected: function (record) {
        var value = record.get('value');

        WorkRequestListUtil.filterAndShowWorkRequestList(this.getMainView(), value, []);
    },

    /**
     * Handles tap on work request list item.
     * @param view
     * @param index
     * @param target
     * @param record
     */
    onWorkRequestManagerListTapped: function (view, index, target, record) {
        var me = this,
            displayMode = view.getParent().getDisplayMode();

        if (displayMode === Constants.Requested) {
            WorkRequestAction.filterWorkRequestActions([record], false, displayMode, function () {
                me.openApproveForm(record, displayMode);
            }, me);
        } else if (displayMode === Constants.Approved || displayMode === Constants.Issued
            || displayMode === Constants.Completed) {
            WorkRequestAction.filterWorkRequestActions([record], false, displayMode, function () {
                me.openUpdateForm(record, displayMode);
            }, me);
        }
        //KB#3046265 Change button in MyWork Tab to Action picker, keep same UI style with Issue tab view.
        if(displayMode===Constants.MyWork){
            WorkRequestAction.filterWorkRequestActionsForMyWork(record, displayMode);
        }
    },

    /**
     * If disable selection was set, do not continue with selection of the list item
     * @param list
     * @returns {boolean}
     */
    onWorkRequestManagerListSelect: function (list) {
        if (list.getDisableSelection()) {
            list.setDisableSelection(false);
            return false;
        }

        return true;
    },

    /**
     * Opens the Approve form
     * @param record work request record
     */
    openApproveForm: function (record, displayMode) {
        var me = this,
            storeId = ['referenceStore'],
            editView,
            ignoreFieldChangeEvents = true,
            wrIdFilter = WorkRequestFilter.createFilter('wr_id', record.get('wr_id'));

        if (record.mobileStatusStepChanged()) {
            ignoreFieldChangeEvents = false;
        }
        editView = Ext.create('Maintenance.view.manager.ApproveForm', {
            displayMode: displayMode,
            ignoreFieldChangeEvents: ignoreFieldChangeEvents
        });
        editView.setRecord(record);

        Network.checkNetworkConnectionAndDisplayMessageAsync(function (isConnected) {
            if (isConnected) {
                WorkRequestAction.loadRelatedRequests(editView, record.get('wr_id'));
            }
        }, me);

        //fix kb 3047040, the mask won't keep the users from taking other actions
        WorkRequestFilter.filterAndLoadStores(storeId, [wrIdFilter], function () {
            me.getMainView().push(editView);
        }, me);
    },

    /**
     * Navigates to Update form view.
     * @param record work request record
     * @param displayMode display mode
     */
    openUpdateForm: function (record, displayMode) {
        var me = this,
        //KB#3050980 Add WorkRequest reference store to stores array.
            storeIds = ['workRequestCraftspersonsStore', 'workRequestPartsStore', 'workRequestToolsStore',
                'workRequestCostsStore', 'referenceStore'],
            editView = Ext.create('Maintenance.view.manager.UpdateForm',
                {displayMode: displayMode}),
            wrIdFilter = WorkRequestFilter.createFilter('wr_id', record.get('wr_id'));

        Network.checkNetworkConnectionAndDisplayMessageAsync(function (isConnected) {
            if (isConnected) {
                WorkRequestAction.loadRelatedRequests(editView, record.get('wr_id'));
            }
        }, me);

        WorkRequestFilter.filterAndLoadStores(storeIds, [wrIdFilter], function () {
            me.getMainView().push(editView);
            editView.setRecord(record);
        }, me);
    },

    /**
     * Resets field values to their default
     */
    onClearFilterForm: function () {
        var me = this,
            filterView = me.getMainView().getNavigationBar().getCurrentView();

        filterView.reset();
    },

    /**
     * Applies the filter to the work request store and closes the Filter view
     */
    onApplyWorkRequestsFilter: function () {
        var me = this,
            navigationBar = me.getMainView().getNavigationBar(),
            filterValues = navigationBar.getCurrentView().getValues();

        WorkRequestFilter.createUserRestriction(filterValues);
        WorkRequestFilter.applyWorkRequestListFilter(WorkRequestFilter.listType, WorkRequestFilter.additionalFilterArray, function () {
            NavigationUtil.navigateBack(me.getMainView());
        }, me);
    },

    /**
     * Handles toggle segmented button in Schedule Form.
     * @param segmentedButton
     * @param button
     * @param isPressed
     */
    onScheduleSegmentedButtonToggled: function (segmentedButton, button, isPressed) {
        var itemId = button.getItemId();
        if (isPressed) {
            this.getScheduleEstimateTradesForm().setHidden(itemId !== 'trades');

            //kb#3045598
            //if (itemId === 'trades') {
            //   this.getScheduleEstimateTradesForm().getItems().get('addTradeContainer').setHidden(true);
            //}

            this.getScheduleCraftspersonsForm().setHidden(itemId !== 'craftspersons');
            this.getScheduleToolsForm().setHidden(itemId !== 'tools');
            if (this.getDocumentsForm()) {
                this.getDocumentsForm().setHidden(itemId !== 'documents');
            }
            //KB#3050980 Show references document form
            if (this.getReferencesForm()) {
                this.getReferencesForm().setHidden(itemId !== 'references');
            }
            if (this.getScheduleRequestDetailsForm()) {
                //KB#3050980 If item is 'references' or 'documents',hidden schedule request detail form
                this.getScheduleRequestDetailsForm().setHidden((itemId === 'documents') || (itemId === 'references'));
            }
        }
    },

    /**
     * Handles toggle segmented button in Estimate Form.
     * @param segmentedButton
     * @param button
     * @param isPressed
     */
    onEstimateSegmentedButtonToggled: function (segmentedButton, button, isPressed) {
        var itemId = button.getItemId();
        if (isPressed) {
            this.getScheduleEstimateTradesForm().setHidden(itemId !== 'trades');

            //kb#3045598
            if (itemId === 'trades') {
                this.getScheduleEstimateTradesForm().getItems().get('addTradeContainer').setHidden(false);
            }

            this.getEstimatePartsForm().setHidden(itemId !== 'parts');
            this.getEstimateCostsForm().setHidden(itemId !== 'costs');
            if (this.getDocumentsForm()) {
                this.getDocumentsForm().setHidden(itemId !== 'documents');
            }

            //KB#3050980 Show references document form
            if (this.getReferencesForm()) {
                this.getReferencesForm().setHidden(itemId !== 'references');
            }
            if (this.getEstimateRequestDetailsForm()) {
                //KB#3050980 If item is 'references' or 'documents',hidden estimate request detail form
                this.getEstimateRequestDetailsForm().setHidden((itemId === 'documents') || (itemId === 'references'));
            }
        }
    },

    /**
     * Handles toggle segmented button in Approve Form for estimation.
     * @param segmentedButton
     * @param button
     * @param isPressed
     */
    onEstimateApproveSegmentedButtonToggled: function (segmentedButton, button, isPressed) {
        var me = this,
            tradesForm = me.getScheduleEstimateTradesForm(),
            partsForm = me.getEstimatePartsForm(),
            costsForm = me.getEstimateCostsForm(),
            documentForm = me.getDocumentsForm(),
            referenceForm=me.getReferencesForm(),
            requestDetailsForm = me.getEstimateApprovedRequestDetailsForm(),
            itemId = button.getItemId();

        if (isPressed) {

            tradesForm.setHidden(itemId !== 'trades');
            partsForm.setHidden(itemId !== 'parts');
            costsForm.setHidden(itemId !== 'costs');

            switch (itemId) {
                case 'trades':
                    tradesForm.getItems().get('addTradeContainer').setHidden(true);
                    break;
                case 'parts':
                    partsForm.getItems().get('addPartForm').setHidden(true);
                    partsForm.getItems().get('addPartToolBar').setHidden(true);
                    break;
                case 'costs':
                    costsForm.getItems().get('addOtherCostForm').setHidden(true);
                    costsForm.getItems().get('addCostToolBar').setHidden(true);
                    break;
            }

            if (documentForm) {
                documentForm.setHidden(itemId !== 'documents');
            }
            //KB#3050980 Show references document form
            if(referenceForm){
                this.getReferencesForm().setHidden(itemId !== 'references');
            }

            if (requestDetailsForm) {
                requestDetailsForm.setHidden((itemId === 'documents')||(itemId === 'references'));
            }
        }
    },

    /**
     * Handles toggle segmented button in Approve Form for schedule.
     * @param segmentedButton
     * @param button
     * @param isPressed
     */
    onScheduleApproveSegmentedButtonToggled: function (segmentedButton, button, isPressed) {
        var me = this,
            tradesForm = me.getScheduleEstimateTradesForm(),
            craftpersonsForm = me.getScheduleCraftspersonsForm(),
            toolsForm = me.getScheduleToolsForm(),
            documentForm = me.getDocumentsForm(),
            referenceForm=me.getReferencesForm(),
            requestDetailsForm = me.getScheduleApprovedRequestDetailsForm(),
            itemId = button.getItemId();

        if (isPressed) {

            tradesForm.setHidden(itemId !== 'trades');
            craftpersonsForm.setHidden(itemId !== 'craftspersons');
            toolsForm.setHidden(itemId !== 'tools');

            switch (itemId) {
                case 'trades':
                    tradesForm.getItems().get('addTradeContainer').setHidden(true);
                    break;
                case 'craftspersons':
                    craftpersonsForm.getItems().get('assignCraftspersonForm').setHidden(true);
                    craftpersonsForm.getItems().get('assignCraftspersonToolBar').setHidden(true);
                    break;
                case 'tools':
                    toolsForm.getItems().get('assignToolForm').setHidden(true);
                    toolsForm.getItems().get('assignToolToolBar').setHidden(true);
                    break;
            }

            if (documentForm) {
                documentForm.setHidden(itemId !== 'documents');
            }

            //KB#3050980 Show references document form
            if(referenceForm){
                this.getReferencesForm().setHidden(itemId !== 'references');
            }

            if (requestDetailsForm) {
                requestDetailsForm.setHidden((itemId === 'documents')||(itemId === 'references'));
            }
        }
    },

    /**
     * Handles toggle segmented button in Update Multiple Form.
     * @param segmentedButton
     * @param button
     * @param isPressed
     */
    onUpdateSegmentedButtonToggled: function (segmentedButton, button, isPressed) {
        var itemId = button.getItemId();
        if (isPressed) {
            this.getScheduleCraftspersonsForm().setHidden(itemId !== 'craftspersons');
            this.getEstimatePartsForm().setHidden(itemId !== 'parts');
            this.getScheduleToolsForm().setHidden(itemId !== 'tools');
            this.getEstimateCostsForm().setHidden(itemId !== 'costs');
        }
    },

    /**
     * Handles check and uncheck events, and checks/unchecks the workRequestCheckboxAll checkbox correspondingly
     * @param checkboxField
     */
    onWorkRequestCheckboxChanged: function (checkboxField, e) {
        var me = this,
            checked = checkboxField.getChecked(),
            workRequestList = me.getWorkRequestList(),
            workRequestManagerList = me.getWorkRequestManagerList(),
            workRequestCheckboxAll = me.getWorkRequestCheckboxAll(),
            workRequestCheckboxes = workRequestManagerList.query('checkboxfield[name=workRequestCheckbox]'),
            workRequestActionPicker = me.getWorkRequestActionPicker(),
            workRequestActionsStore = Ext.getStore('workRequestActionsStore'),
            workRequestsStore = Ext.getStore('workRequestsStore');
        
        if(me.getMainView().getNavigationBar().getCurrentView().xtype !== me.getMainView().xtype){
        	return;
        }

        // Stop the Check event to prevent the list item from being selected
        // This function is called from other numerous locations. These calls may not include the e event
        // parameter
        if (e && Ext.isFunction(e.stopEvent)) {
            e.stopEvent();
            e.stopPropagation();
        }

        // when tap on the checkbox, disable the list item selection (work requests list)
        workRequestManagerList.setDisableSelection(true);

        if (checked === true) {
            workRequestsStore.getSelectedWorkRequests().push(checkboxField.getRecord());
            if (workRequestsStore.getSelectedWorkRequests().length === workRequestCheckboxes.length) {
                workRequestCheckboxAll.eventsSuspended = true; // workaround; suspendEvents() does not work
                workRequestCheckboxAll.check();
                workRequestCheckboxAll.eventsSuspended = false;
            }
        } else {
            Ext.Array.remove(workRequestsStore.getSelectedWorkRequests(), checkboxField.getRecord());
            workRequestCheckboxAll.eventsSuspended = true; // workaround; suspendEvents() does not work
            workRequestCheckboxAll.uncheck();
            workRequestCheckboxAll.eventsSuspended = false;
        }


        WorkRequestAction.filterWorkRequestActions(workRequestsStore.getSelectedWorkRequests(), true,
            workRequestList.getDisplayMode(), function () {
                var hasActions = workRequestActionsStore.getCount() > 0;

                // enable/disable the Actions list button
                if (hasActions) {
                    workRequestActionPicker.setHidden(false);
                    workRequestActionPicker.setDisabled(false);
                } else {
                    workRequestActionPicker.setHidden(true);
                }
            }, me);
    },

    /**
     * Checks/unchecks all the checkboxes of the work request list ("workRequestCheckbox" checkboxes)
     * @param checkboxField
     */
    onWorkRequestCheckboxAllChanged: function (checkboxField) {
        var me = this,
            checked = checkboxField.getChecked(),
            workRequestManagerList = me.getWorkRequestManagerList(),
            workRequestCheckboxes = workRequestManagerList.query('checkboxfield[name=workRequestCheckbox]');

        if (checkboxField.eventsSuspended) {
            return;
        }

        Ext.getStore('workRequestsStore').setSelectedWorkRequests([]);

        Ext.Array.each(workRequestCheckboxes, function (checkbox) {
            if (checked) {
                WorkRequestListUtil.changeCheckboxFieldAndFireEvent(checkbox, true);
            } else {
                WorkRequestListUtil.changeCheckboxFieldAndFireEvent(checkbox, false);
            }
        });

        workRequestManagerList.setDisableSelection(false);
    },

    /**
     * Handles tap on work request part list item.
     * @param view
     * @param index
     * @param target
     * @param record
     */
    onPartListItemTapped: function (view, index, target, record) {
        var me = this,
            form = this.getEstimatePartsForm(),
            fieldSet = form.down('#addPartForm').getItems();

        fieldSet.get('part_id').setValue(record.get('part_id'));
        fieldSet.get('pt_store_loc_id').setValue(record.get('pt_store_loc_id'));
        fieldSet.get('qty_estimated').setValue(record.get('qty_estimated'));
        fieldSet.get('qty_actual').setValue(record.get('qty_actual'));

        FormUtil.setPartPrimaryKeyReadOnly(form, true);

        form.down('#part_titlebar_title').setTitle(LocaleManager.getLocalizedString('Edit Part', 'Maintenance.controller.manager.WorkRequestListController'));

        me.getMainView().getNavigationBar().getCurrentView().editPartRecord = record;
    },

    /**
     * Handles tap on + button for Add new part assignment.
     */
    onSwitchToAddNewPartMode: function () {
        var me = this,
            form = this.getEstimatePartsForm(),
            fieldSet = form.down('#addPartForm').getItems();

        FormUtil.clearPartsForm(fieldSet);

        FormUtil.setPartPrimaryKeyReadOnly(form, false);

        //KB#3052670  Make storage location field read only in Issued status and after status, even Adding new actual used parts in Mobile
        var listType=WorkRequestFilter.listType;
        if(listType==="Issued"||listType==="Completed"){
            form.down('field[name=pt_store_loc_id]').setReadOnly(true);
        }

        form.down('#part_titlebar_title').setTitle(LocaleManager.getLocalizedString('Add Part', 'Maintenance.controller.manager.WorkRequestListController'));

        me.getMainView().getNavigationBar().getCurrentView().editPartRecord = null;
    },

    /**
     * Handles tap on work request trade list item.
     * @param view
     * @param index
     * @param target
     * @param record
     */
    onTradeListItemTapped: function (view, index, target, record) {
        var me = this,
            form = this.getScheduleEstimateTradesForm(),
            fieldSet = form.down('#addTradeForm').items;
        fieldSet.get('tr_id').setValue(record.get('tr_id'));
        fieldSet.get('hours_est').setValue(record.data.hours_est);

        FormUtil.setTradePrimaryKeyReadOnly(form, true);

        form.down('#trade_titlebar_title').setTitle(LocaleManager.getLocalizedString('Edit Trade', 'Maintenance.controller.manager.WorkRequestListController'));

        me.getMainView().getNavigationBar().getCurrentView().editTradeRecord = record;
    },

    /**
     * Handles tap on + button for Add new trade assignment.
     */
    onSwitchToAddNewTradeMode: function () {
        var me = this,
            form = this.getScheduleEstimateTradesForm(),
            fieldSet = form.down('#addTradeForm').items;

        FormUtil.clearTradesForm(fieldSet);
        FormUtil.setTradePrimaryKeyReadOnly(form, false);

        form.down('#trade_titlebar_title').setTitle(LocaleManager.getLocalizedString('Add Trade', 'Maintenance.controller.manager.WorkRequestListController'));

        me.getMainView().getNavigationBar().getCurrentView().editTradeRecord = null;
    },

    /**
     * Handles tap on work request Cost list item.
     * @param view
     * @param index
     * @param target
     * @param record
     */
    onCostListItemTapped: function (view, index, target, record) {
        var me = this,
            form = this.getEstimateCostsForm(),
            fieldSet = form.down('#addOtherCostForm').items;

        fieldSet.get('other_rs_type').setValue(record.get('other_rs_type'));
        fieldSet.get('description').setValue(record.get('description'));
        fieldSet.get('qtyUnitsContainer').items.get('qty_used').setValue(record.get('qty_used'));
        fieldSet.get('qtyUnitsContainer').items.get('units_used').setValue(record.get('units_used'));
        fieldSet.get('cost_estimated').setValue(record.get('cost_estimated'));
        fieldSet.get('cost_total').setValue(record.get('cost_total'));

        FormUtil.setCostPrimaryKeyReadOnly(form, true);

        form.down('#cost_titlebar_title').setTitle(LocaleManager.getLocalizedString('Edit Other Cost', 'Maintenance.controller.manager.WorkRequestListController'));

        me.getMainView().getNavigationBar().getCurrentView().editCostRecord = record;
    },

    /**
     * Handles tap on + button for Add new cost assignment.
     */
    onSwitchToAddNewCostMode: function () {
        var me = this,
            form = me.getEstimateCostsForm(),
            fieldSet = form.down('#addOtherCostForm').items;

        FormUtil.clearCostsForm(fieldSet);
        FormUtil.setCostPrimaryKeyReadOnly(form, false);

        form.down('#cost_titlebar_title').setTitle(LocaleManager.getLocalizedString('Add Other Cost', 'Maintenance.controller.manager.WorkRequestListController'));

        me.getMainView().getNavigationBar().getCurrentView().editCostRecord = null;
    },

    retrieveWrRecord: function (form, record) {
        var wrId,
            selectedWRs,
            i;
        if (!form.getMultipleSelection()) {
            return form.getWrRecord();
        } else {
            wrId = record.get('wr_id');
            selectedWRs = Ext.getStore('workRequestsStore').getSelectedWorkRequests();
            for (i = 0; i < selectedWRs.length; i++) {
                if (selectedWRs[i].get('wr_id') === wrId) {
                    return selectedWRs[i];
                }
            }

            return null;
        }
    },

    /**
     * copy current row as a new record.
     * @param view
     * @param index
     * @param target
     * @param record
     */
    onCopyCraftsperson: function () {
        var me = this,
            form = me.getScheduleCraftspersonsForm(),
            editCfRecord = me.getMainView().getNavigationBar().getCurrentView().editCfRecord,
            fieldSet = form.down('#assignCraftspersonForm').items;

        FormUtil.clearCraftspersonsForm(fieldSet);
        fieldSet.get('cf_id').setReadOnly(false);
        fieldSet.get('date_assigned').setReadOnly(false);
        fieldSet.get('time_assigned').setReadOnly(false);
        fieldSet.get('cf_id').setValue(editCfRecord.get('cf_id'));
        fieldSet.get('date_assigned').setValue(editCfRecord.get('date_assigned'));
        fieldSet.get('time_assigned').setValue(editCfRecord.get('time_assigned'));
        fieldSet.get('hours_est').setValue(editCfRecord.get('hours_est'));
        fieldSet.get('work_type').setValue(editCfRecord.get('work_type'));
        me.getMainView().getNavigationBar().getCurrentView().editCfRecord = null;
        me.getCopyCraftspersonButton().setHidden(true);
    },

    /**
     * Handles tap on work request cf list item.
     * @param view
     * @param index
     * @param target
     * @param record
     */
    onCfListItemSingleTapped: function (view, index, target, record, e) {
        var me = this,
            statusEnumList,
            newOptionListWithoutReturned = [],
            form = me.getScheduleCraftspersonsForm(),
            issuedOrCompletedList = (WorkRequestFilter.listType === Constants.Issued
            || WorkRequestFilter.listType === Constants.Completed),
            wrRecord = me.retrieveWrRecord(form, record),
            userProfile = Common.util.UserProfile.getUserProfile(),
            fieldSet = form.down('#assignCraftspersonForm').items,
            setFieldSetValues = function () {
                fieldSet.get('cf_id').setValue(record.get('cf_id'));
                fieldSet.get('date_assigned').setValue(record.get('date_assigned'));
                fieldSet.get('time_assigned').setValue(record.get('time_assigned'));

                fieldSet.get('hours_est').setValue(record.get('hours_est'));

                fieldSet.get('work_type').setValue(record.get('work_type'));
                fieldSet.get('status').setValue(record.get('status'));

                fieldSet.get('date_start').setValue(record.get('date_start'));
                fieldSet.get('startDateTimeContainer').items.get('time_start').setValue(record.get('time_start'));

                fieldSet.get('date_end').setValue(record.get('date_end'));
                fieldSet.get('endDateTimeContainer').items.get('time_end').setValue(record.get('time_end'));

                fieldSet.get('hours_straight').setValue(record.get('hours_straight'));
                fieldSet.get('hours_over').setValue(record.get('hours_over'));
                fieldSet.get('hours_double').setValue(record.get('hours_double'));
                fieldSet.get('comments').setValue(record.get('comments'));
            },
            notUserRecord;

        if (view.getDisableSelection()) {
            view.setDisableSelection(false);
            return;
        }

        setFieldSetValues();

        if (FormUtil.userCanEditResourcesAfterIssued()) {
            if (issuedOrCompletedList && ApplicationParameters.getUserRoleName() !== 'supervisor'
                && wrRecord && wrRecord.get('is_req_craftsperson') === 1) {

                notUserRecord = userProfile.cf_id !== record.get('cf_id');

                Ext.each(form.query('field'), function (field) {
                    if (Ext.Array.contains(form.editableFields, field.getName())) {
                        field.setReadOnly(userProfile.cf_id !== record.get('cf_id'));
                    }
                });

                form.down('button[itemId=startWorkButton]').setDisabled(notUserRecord);
                form.down('button[itemId=stopWorkButton]').setDisabled(notUserRecord);
                form.down('button[action=assignCraftsperson]').setHidden(notUserRecord);
            } else {
                form.down('button[action=assignCraftsperson]').setHidden(false);
            }
        }

        FormUtil.setCfPrimaryKeyReadOnly(form, true);

        me.getMainView().getNavigationBar().getCurrentView().editCfRecord = record;

        if (me.getMainView().getNavigationBar().getCurrentView().xtype === 'scheduleFormPanel'
            || me.getMainView().getNavigationBar().getCurrentView().xtype === 'scheduleFormMultiplePanel') {
            me.getCopyCraftspersonButton().setHidden(false);
        }

        form.query('selectfield[name=status]')[0].setReadOnly(false);
        if (record.get('status') === 'Returned') {
            statusEnumList = TableDef.getEnumeratedList('wrcf_sync', 'status');
			if (record.get('hours_straight') > 0 || record.get('hours_double') > 0 || record.get('hours_over') > 0) {
                for (var i = 0; i < statusEnumList.length; i++) {
                    if (statusEnumList[i].objectValue !== 'Active') {
                        newOptionListWithoutReturned.push(statusEnumList[i]);
                    }
                }
                if (newOptionListWithoutReturned && newOptionListWithoutReturned.length > 0) {
                    form.query('selectfield[name=status]')[0].setOptions(newOptionListWithoutReturned);
                }
            }else{
                if (statusEnumList && statusEnumList.length > 0) {
                    form.query('selectfield[name=status]')[0].setOptions(statusEnumList);
                }
            }

        } else {
            statusEnumList = TableDef.getEnumeratedList('wrcf_sync', 'status');
            for (var i = 0; i < statusEnumList.length; i++) {
                if (statusEnumList[i].objectValue !== 'Returned') {
                    newOptionListWithoutReturned.push(statusEnumList[i]);
                }
            }
            if (newOptionListWithoutReturned && newOptionListWithoutReturned.length > 0) {
                form.query('selectfield[name=status]')[0].setOptions(newOptionListWithoutReturned);
            }

            if (record.get('status') === 'Complete') {
                if (record.get('hours_straight') > 0 || record.get('hours_double') > 0 || record.get('hours_over') > 0) {
                    form.query('selectfield[name=status]')[0].setReadOnly(true);
                } else {
                    form.query('selectfield[name=status]')[0].setReadOnly(false);
                }
            }
        }

        if (wrRecord && (wrRecord.get('status') === 'Com' || wrRecord.get('status') === 'S')) {
            form.query('selectfield[name=status]')[0].setReadOnly(true);
        }
        
        //Clear validation message
        var currentView = me.getMainView().getNavigationBar().getCurrentView();
        if(me.getUpdateForm()){
            me.getUpdateForm().displayErrors(record, currentView);
        }
    },

    /**
     * Handles tap on + button for Add new cf assignment.
     */
    onSwitchToAddNewCfMode: function () {
        var me = this,
            form = me.getScheduleCraftspersonsForm(),
            fieldSet = form.down('#assignCraftspersonForm').items,
            wrRecord = form.getWrRecord(),
            userProfile = Common.util.UserProfile.getUserProfile(),
            cfIdField = form.down('field[name=cf_id]'),
            issuedOrCompletedList = (WorkRequestFilter.listType === Constants.Issued
            || WorkRequestFilter.listType === Constants.Completed);

        if(form.getMultipleSelection()){
            wrRecord = Ext.getStore('workRequestsStore').getSelectedWorkRequests()[0];
        }
        FormUtil.clearCraftspersonsForm(fieldSet);
        Ext.each(form.query('field'), function (field) {
            field.setReadOnly(false);
        });
        form.down('button[itemId=startWorkButton]').setDisabled(false);
        form.down('button[itemId=stopWorkButton]').setDisabled(false);
        form.query('selectfield[name=status]')[0].setReadOnly(false);
        form.down('button[action=assignCraftsperson]').setHidden(false);
        //KB#3051620 Planner: Craftsperson Code field should be editable in Issued form/Assign Craftsperson form.
        if (issuedOrCompletedList && ApplicationParameters.getUserRoleName() !== 'supervisor'&&(!ApplicationParameters.isCraftspersonPlanner)
            && ((wrRecord && wrRecord.get('is_req_craftsperson') === 1) || form.getMultipleSelection())) {

            cfIdField.setValue(userProfile.cf_id);
            FormUtil.setFieldsReadOnly(form, ['cf_id'], true);
            FormUtil.setCfPrimaryKeyReadOnly(form, true);
        } else {
            if (wrRecord && wrRecord.get('is_req_supervisor') === 0 && !ApplicationParameters.isCraftspersonPlanner) {
                Ext.each(form.query('field'), function (field) {
                    if (Ext.Array.contains(form.editableFields, field.getName())) {
                        field.setReadOnly(true);
                    }
                });
            }else{
                //KB3053112 - current user is only a planner, then only enable field cf_id , work type, the other fields should be readonly
                if(wrRecord && wrRecord.get('is_req_supervisor') === 0){
                    Ext.each(form.query('field'), function (field) {
                        field.setReadOnly(true);
                    });

                    form.down('button[itemId=startWorkButton]').setDisabled(true);
                    form.down('button[itemId=stopWorkButton]').setDisabled(true);
                    FormUtil.setFieldsReadOnly(form, ['cf_id','work_type'], false);
                }
            }

            FormUtil.setCfPrimaryKeyReadOnly(form, false);
            if(issuedOrCompletedList){
                FormUtil.setFieldsReadOnly(form, ['date_assigned', 'time_assigned'], true);
            }
        }

        me.getCopyCraftspersonButton().setHidden(true);
        me.getMainView().getNavigationBar().getCurrentView().editCfRecord = null;
    },

    /**
     * Handles tap on work request tool list item.
     * @param view
     * @param index
     * @param target
     * @param record
     */
    onToolListItemTapped: function (view, index, target, record) {
        var me = this,
            form = this.getScheduleToolsForm(),
            fieldSet = form.down('#assignToolForm').items;

        fieldSet.get('tool_id').setValue(record.get('tool_id'));

        fieldSet.get('date_assigned').setValue(record.get('date_assigned'));
        fieldSet.get('time_assigned').setValue(record.get('time_assigned'));

        fieldSet.get('hours_est').setValue(record.get('hours_est'));

        //fieldSet.get('startDateTimeContainer').items.get('date_start').setValue(record.get('date_start'));
        fieldSet.get('date_start').setValue(record.get('date_start'));
        fieldSet.get('startDateTimeContainer').items.get('time_start').setValue(record.get('time_start'));

        fieldSet.get('date_end').setValue(record.get('date_end'));
        fieldSet.get('endDateTimeContainer').items.get('time_end').setValue(record.get('time_end'));

        fieldSet.get('hours_straight').setValue(record.get('hours_straight'));

        FormUtil.setToolPrimaryKeyReadOnly(form, true);
        me.getMainView().getNavigationBar().getCurrentView().editTlRecord = record;

        //Clear validation message
        var currentView = me.getMainView().getNavigationBar().getCurrentView();
        if(me.getUpdateForm()){
            me.getUpdateForm().displayErrors(record, currentView);
        }
        if(me.getWorkRequestPanel()){
            me.getWorkRequestPanel().displayErrors(record, currentView);
        }

    },

    /**
     * Handles tap on + button for Add new tool assignment.
     */
    onSwitchToAddNewToolMode: function () {
        var me = this,
            form = me.getScheduleToolsForm(),
            issuedOrCompletedList = (WorkRequestFilter.listType === Constants.Issued
            || WorkRequestFilter.listType === Constants.Completed|| WorkRequestFilter.listType === Constants.MyWork),
            fieldSet = form.down('#assignToolForm').items;

        FormUtil.clearToolsForm(fieldSet);
        FormUtil.setToolPrimaryKeyReadOnly(form, false);
        if(issuedOrCompletedList){
            FormUtil.setFieldsReadOnly(form, ['date_assigned', 'time_assigned'], true);
        }

        me.getMainView().getNavigationBar().getCurrentView().editTlRecord = null;
    }
});
