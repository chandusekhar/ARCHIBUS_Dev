/**
 * Holds navigation functions
 *
 * @author Cristina Reghina
 * @since 21.3
 */
Ext.define('Maintenance.util.NavigationUtil', {
    alternateClassName: ['NavigationUtil'],

    singleton: true,

    showHideToolbarButtons: function (mainView, view) {
        var me = this;

        me.showHideAddButton(mainView, view);
        me.showHideSaveButton(mainView, view);
        me.showHideWorkRequestActionPicker(mainView, view);
        me.enableDisableApproveFormButtons(mainView, view);
        me.showHideCompleteSchedulingButton(mainView, view);
        me.showHideCompleteEstimationButton(mainView, view);
        me.enableDisableForwardFormButton(mainView, view);
        me.showHideWorkRequestViewButtons(mainView, view);
        //Add go home button.
        me.showHideGoHomeButton(mainView,view);
        //KB#3052987 Add puchased parts button to MyWork parts list tab.
        me.showHideAddPurchasePartsButton(mainView,view);
    },

    setEditableFieldsOfUpdateForm: function (mainView, view) {
        var me = this;

        me.setEditableFieldsOfMyWorkTabUpdateForm(mainView, view);
        me.setEditableFieldsOfMyRequestTabUpdateForm(mainView, view);
        me.setEditableFieldsOfRequestedTabUpdateForm(mainView, view);
        me.setEditableFieldsOfApprovedTabUpdateForm(mainView, view);
        me.setEditableFieldsOfIssuedTabUpdateForm(mainView, view);
    },

    setEditableFieldsOfMyWorkTabUpdateForm: function (mainView, view) {
        if (this.isWorkRequestEditView(view) && view.getDisplayMode() === Constants.MyWork) {
            view.query('[name=requestor]')[0].setReadOnly(true);
            view.down('problemtypefield').setReadOnly(false);
            view.query('field[name=bl_id]')[0].setReadOnly(false);
        }
    },

    setEditableFieldsOfMyRequestTabUpdateForm: function (mainView, view) {
        if (this.isWorkRequestEditView(view) && view.getDisplayMode() === Constants.MyRequests) {
            view.query('[name=requestor]')[0].setReadOnly(true);
            view.query('field[name=fl_id]')[0].setReadOnly(true);
            view.query('field[name=rm_id]')[0].setReadOnly(true);
            view.query('field[name=eq_id]')[0].setReadOnly(true);
        }
    },

    setEditableFieldsOfRequestedTabUpdateForm: function (mainView, view) {
        if (view.xtype === 'approveFormPanel' && view.getDisplayMode() === Constants.Requested) {
            view.query('[name=bl_id]')[0].setReadOnly(false);
            view.query('field[name=description]')[0].setReadOnly(false);
        }
    },

    setEditableFieldsOfApprovedTabUpdateForm: function (mainView, view) {
        if (view.xtype === 'updateFormPanel' && view.getDisplayMode() === Constants.Approved && ApplicationParameters.canCraftspersonChangeWorkRequest) {
            view.query('[name=bl_id]')[0].setReadOnly(false);
            view.query('[name=fl_id]')[0].setReadOnly(false);
            view.query('[name=rm_id]')[0].setReadOnly(false);
            view.query('[name=location]')[0].setReadOnly(false);
            view.down('problemtypefield').setReadOnly(false);
            view.query('field[name=description]')[0].setReadOnly(false);
            view.query('field[name=eq_id]')[0].setReadOnly(false);
        }
    },

    setEditableFieldsOfIssuedTabUpdateForm: function (mainView, view) {
        if (view.xtype === 'updateFormPanel' && view.getDisplayMode() === Constants.Issued && ApplicationParameters.canCraftspersonChangeWorkRequest) {
            view.query('[name=bl_id]')[0].setReadOnly(false);
            view.query('[name=fl_id]')[0].setReadOnly(false);
            view.query('[name=rm_id]')[0].setReadOnly(false);
            view.query('[name=location]')[0].setReadOnly(false);
            view.down('problemtypefield').setReadOnly(false);
            view.query('field[name=description]')[0].setReadOnly(false);
            view.query('field[name=eq_id]')[0].setReadOnly(false);
        }
    },


    /**
     *
     * @private
     * @param mainView
     * @param view
     */
    showHideSaveButton: function (mainView, view) {
        var navBar = mainView.getNavigationBar(),
            saveButton = navBar.getSaveButton();

        if (this.isWorkRequestEditView(view)
            || view.xtype === 'workRequestCraftspersonEditPanel'
            || view.xtype === 'workRequestPartEditPanel'
            || view.xtype === 'workRequestCostItem') {
            saveButton.setHidden(!view.getIsCreateView());
        }

        if (view.xtype === 'approveFormPanel'
            || view.xtype === 'updateFormPanel'
            || view.xtype === 'scheduleFormPanel'
            || view.xtype === 'estimateFormPanel'
            || view.xtype === 'forwardFormMultiplePanel'
			|| view.xtype === 'ReturnCfFormMultiple'
            || view.xtype === 'verifymultipleform'
            || view.xtype === 'addPurchasedPartsToInventory') {
            saveButton.setHidden(true);
        }
    },

    /**
     *
     * @private
     * @param mainView
     * @param view
     */
    showHideAddButton: function (mainView, view) {
        var navBar = mainView.getNavigationBar(),
            displayMode = mainView.down('workrequestListPanel').getDisplayMode(),
            addButton = navBar.getAddButton(),
            workRequestsStore = Ext.getStore('workRequestsStore'),
            wrRecord;

        if (this.isMainView(view)) {
            // in main view, there is no push/pop, so we need to handle display of Add button
            addButton.setHidden(displayMode !== Constants.MyWork
                && displayMode !== Constants.MyRequests);
        } else if (displayMode !== Constants.MyWork
            && displayMode !== Constants.MyRequests) {
            /* on push&pop view, the framework handles the display of Add button;
             * we add control to not display Add button on list views of coming from manager tabs (other than My Work and My requests)
             */
            addButton.setHidden(true);
        } else if (displayMode === Constants.MyWork && view.xtype === 'workRequestCraftspersonListPanel') {
            /**
             * After the WR was issued,
             * only Supervisor can add craftspersons,
             * KB 3045524 or CF's substitute can add labor for himself
             */
            wrRecord = workRequestsStore.findRecord('wr_id', view.getViewIds().workRequestId);
            if ((ApplicationParameters.getUserRoleName() !== 'supervisor'
                && wrRecord && wrRecord.get('is_req_craftsperson') !== 1) || (wrRecord.get('is_req_supervisor') === 0 && wrRecord.get('is_req_craftsperson') === 1 && !ApplicationParameters.isCraftspersonPlanner) ) {

                addButton.setHidden(true);
            }
        }
    },

    /**
     *
     * @param mainView
     * @param approveFormView
     */
    enableDisableApproveFormButtons: function (mainView, approveFormView) {
        var record,
            approveButton,
            rejectButton,
            possibleActions = Ext.getStore('workRequestActionsStore').getCount();

        if (!mainView || !approveFormView) {
            return;
        }

        if (approveFormView.xtype === 'approveFormPanel') {
            record = approveFormView.getRecord();
            approveButton = mainView.down('button[itemId=approveButton]');
            rejectButton = mainView.down('button[itemId=rejectButton]');

            if (!approveButton) {
                return;
            }

            if (possibleActions === 0 || record.mobileStatusStepChanged()) {
                //approveButton.setDisabled(true);
                //rejectButton.setDisabled(true);
                approveButton.hide();
                rejectButton.hide();
            } else {
                //approveButton.setDisabled(false);
                //rejectButton.setDisabled(false);
                approveButton.show();
                rejectButton.show();
            }
        }
    },

    /**
     * disable the Forward Button from the schedule view
     * if the record has already been forwarded
     *
     * @param mainView
     * @param scheduleFormView
     */

    enableDisableForwardFormButton: function (mainView, scheduleFormView) {
        var record,
            selectedRecords,
            forwardButton;

        if (!mainView || !scheduleFormView) {
            return;
        }

        if(!Ext.isEmpty(forwardButton)){
            if (scheduleFormView.xtype === 'scheduleFormPanel') {
                record = scheduleFormView.getRecord();
                forwardButton = mainView.down('button[itemId=forward]');


                if (record.mobileStatusStepChanged()) {
                    forwardButton.setDisabled(true);
                } else {
                    forwardButton.setDisabled(false);
                }
            }


            if (scheduleFormView.xtype === 'scheduleFormMultiplePanel') {

                selectedRecords = Ext.getStore('workRequestsStore').getSelectedWorkRequests();
                forwardButton = mainView.down('button[itemId=forwardMultipleButton]');

                Ext.Array.each(selectedRecords, function (selectedRecord) {
                    if (selectedRecord.mobileStatusStepChanged()) {
                        forwardButton.setDisabled(true);
                    } else {
                        forwardButton.setDisabled(false);
                    }
                });

            }
        }
    },


    /**
     *
     * @private
     * @param mainView
     * @param view
     */
    showHideWorkRequestActionPicker: function (mainView, view) {
        var workRequestActionPicker = mainView.down('buttonpicker[itemId=workRequestActionPicker]');

        if (view.xtype === 'updateFormPanel'||((view.xtype==='phoneWorkRequestPanel'||view.xtype==='tabletWorkRequestPanel')&&view.getDisplayMode()===Constants.MyWork)) {
            workRequestActionPicker.setHidden(Ext.getStore('workRequestActionsStore').getCount() === 0);
        } else {
            workRequestActionPicker.setHidden(true);
        }
    },

    /**
     * Returns true if the view is a Work Request view.
     * A view is a Work Request view if the views xtype is
     * workRequestPanel or tabletWorkRequestPanel
     * @param view
     */
    isWorkRequestEditView: function (view) {
        return view.xtype === 'workRequestPanel'
            || view.xtype === 'tabletWorkRequestPanel'
            || view.xtype === 'phoneWorkRequestPanel';
    },

    /**
     * Returns true if the view is the main view (xtype is tabletMainview or phoneMainView)
     * @param view
     */
    isMainView: function (view) {
        return view.xtype === 'tabletMainview' || view.xtype === 'phoneMainview';
    },

    //By default all fields in RequestDetails view are hidden and read-only
    showFields: function (form, visibleFields, editableFields) {
        var fields, fieldName;

        if (!visibleFields) {
            visibleFields = [];
        }
        if (!editableFields) {
            editableFields = [];
        }

        fields = form.query('field');
        Ext.each(fields, function (field) {
            fieldName = field.getName();
            if (visibleFields.indexOf(fieldName) >= 0) {
                field.setHidden(false);
            }
            if (editableFields.indexOf(fieldName) >= 0) {
                field.setReadOnly(false);
            }
        });
    },

    showButtons: function (form, visibleButtons) {
        var buttons, buttonId;

        if (!visibleButtons) {
            return;
        }

        buttons = form.query('button');
        Ext.each(buttons, function (button) {
            buttonId = button.getItemId();
            if (visibleButtons.indexOf(buttonId) >= 0) {
                button.setHidden(false);
            }
        });
    },

    showItemsByItemId: function (form, visibleItemIds) {
        var items;

        if (!visibleItemIds) {
            visibleItemIds = [];
        }

        Ext.each(visibleItemIds, function (visibleItemId) {
            items = form.query('[itemId=' + visibleItemId + ']');
            Ext.Array.each(items, function (item) {
                item.setHidden(false);
            });
        });
    },

    /**
     * Goes back to the previous view by triggering the tap event on the Back button
     * @param mainView
     */
    navigateBack: function (mainView) {
        var backButton = mainView.getNavigationBar().getBackButton();

        backButton.fireEvent('tap');
    },

    /**
     *
     * @param mainView
     * @param scheduleFormView
     */
    showHideCompleteSchedulingButton: function (mainView, scheduleFormView) {
        var me = this,
            record,
            completeSchedulingButton,
            selectedWorkRequests,
            schedulingStep;

        if (!mainView || !scheduleFormView) {
            return;
        }

        completeSchedulingButton = mainView.down('button[itemId=completeScheduling]');

        if(!Ext.isEmpty(completeSchedulingButton)){
            if (scheduleFormView.xtype === 'scheduleFormPanel') {
                record = scheduleFormView.getRecord();
                completeSchedulingButton.setHidden(record.get('step_type') !== 'scheduling');
            } else if (scheduleFormView.xtype === 'scheduleFormMultiplePanel') {
                selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests();
                schedulingStep = !Ext.isEmpty(selectedWorkRequests);

                Ext.Array.each(selectedWorkRequests, function (record) {
                    if (record.get('step_type') !== 'scheduling') {
                        schedulingStep = false;
                    }
                }, me);

                completeSchedulingButton.setHidden(!schedulingStep);
            }
        }


    },

    /**
     *
     * @param mainView
     * @param estimateFormView
     */
    showHideCompleteEstimationButton: function (mainView, estimateFormView) {
        var me = this,
            record,
            completeEstimationButton,
            selectedWorkRequests,
            estimationStep;

        if (!mainView || !estimateFormView) {
            return;
        }

        completeEstimationButton = mainView.down('button[itemId=completeEstimation]');

        if(!Ext.isEmpty(completeEstimationButton)){
            if (estimateFormView.xtype === 'estimateFormPanel') {
                record = estimateFormView.getRecord();
                completeEstimationButton.setHidden(record.get('step_type') !== 'estimation');

            } else if (estimateFormView.xtype === 'estimateFormMultiplePanel') {

                selectedWorkRequests = Ext.getStore('workRequestsStore').getSelectedWorkRequests();
                estimationStep = !Ext.isEmpty(selectedWorkRequests);

                Ext.Array.each(selectedWorkRequests, function (record) {
                    if (record.get('step_type') !== 'estimation') {
                        estimationStep = false;
                    }
                }, me);

                completeEstimationButton.setHidden(!estimationStep);
            }
        }
    },

    /**
     * Shows or hides buttons (Hold, Complete etc.) on the Work Request edit view.
     * @param mainView
     * @param view
     */
    showHideWorkRequestViewButtons: function (mainView, view) {
        var me = this,
            workRequestListView = mainView.down('workrequestListPanel'),
            canncelButton = mainView.down('button[action=workRequestCancel]'),
            hideButton = true;

        if (!me.isWorkRequestEditView(view)) {
            return;
        }

        hideButton = (view.getDisplayMode() === Constants.MyRequests);
        if(!Ext.isEmpty(canncelButton)){
            if (view.getRecord() === null) {
                canncelButton.setHidden(true);
            } else {
                if (view.getRecord().get('status') === 'HA' || view.getRecord().get('status') === 'HP'
                    || view.getRecord().get('status') === 'HL' || view.getRecord().get('status') === 'I'
                    || view.getRecord().get('status') === 'Com' || view.getRecord().get('status') === 'Can'
                    || view.getRecord().get('status') === 'Clo') {
                    canncelButton.setHidden(true);
                }

                if (view.getRecord().get('wr_id') === null) {
                    canncelButton.setHidden(true);
                }
                
                if (view.getRecord().get('request_type') === 2) {
                    canncelButton.setHidden(true);
                }
            }
        }
    },
    /**
     * show go home button.
     * @param mainView
     * @param view
     */
    showHideGoHomeButton: function(mainView,view){
        var me=this,
            goHomeButton=mainView.down('button[action=goToHomePage]'),
            hideButton=true;

        var selectedRecords = Ext.getStore('workRequestsStore').getSelectedWorkRequests();

        hideButton=(view.xtype==='phoneMainview'||view.xtype==='tabletMainview'||view.xtype==='phoneWorkRequestPanel'||view.xtype==='tabletWorkRequestPanel'
        ||view.xtype==='updateFormPanel'||view.xtype==='approveFormPanel')?true:false;

        if(selectedRecords.length > 0){
            if(view.xtype==='scheduleFormMultiplePanel'||view.xtype==='estimateFormMultiplePanel'||view.xtype==='updateFormMultiplePanel'||view.xtype==='forwardFormMultiplePanel'){
                hideButton=true;
            }
        }
        //using setTimeout function to fix issue that home button can not display in Document tab view.
        if(view.xtype==='workRequestDocumentList'){
            setTimeout(function () {
                if(!Ext.isEmpty(goHomeButton)){
                    goHomeButton.setHidden(hideButton);
                }
            },100);
        }else{
            if(!Ext.isEmpty(goHomeButton)){
                goHomeButton.setHidden(hideButton);
            }
        }


    },
    /**
     * KB#3052987
     * show purchased parts button to MyWork parts list tab.
     * @param mainView
     * @param view
     */
    showHideAddPurchasePartsButton: function(mainView,view){
        var me=this,
            addPurchasedPartsButton=mainView.down('button[action=addPartsToInventory]'),
            hideButton=true;

        hideButton=view.xtype==='workRequestPartListPanel'?false:true;
        if(!Ext.isEmpty(addPurchasedPartsButton)){
            addPurchasedPartsButton.setHidden(hideButton);
        }

    }
});