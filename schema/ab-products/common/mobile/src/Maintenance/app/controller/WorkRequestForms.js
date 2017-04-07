Ext.define('Maintenance.controller.WorkRequestForms', {
    extend: 'Ext.app.Controller',

    requires: ['Common.Session', 'Maintenance.view.overlay.HoldAction'],

    config: {
        refs: {
            mainView: 'mainview',
            workRequestEditPanel: 'workRequestPanel',
            actionPanelButton: 'holdActionPanel > button',
            returnCfPanel: 'ReturnCfPanel',
            confirmReturnCfButton: 'button[itemId=confirmReturnCfButton]',
            confirmComplete: 'button[itemId=confirmCompleteButton]',
            completeRadioOptions: 'radiofield[checked=true]',
            cancelButton: 'button[action=workRequestCancel]',
            quickCompleteView: 'quickCompletePanel',
            workRequestActionPicker: 'mainview buttonpicker[itemId=workRequestActionPicker]',
            //KB#3050226 Add verify functionality.
            verifyForm: 'verifyform',
            verifyConfirmButton: 'button[itemId=confirmVerfifyWorkRequest]',
            verfifyInCompleteButton:'button[itemId=returnIncompleteWorkRequest]'
        },
        control: {
            confirmReturnCfButton: {
                tap: 'onConfirmReturnCfButtonTapped'
            },
            confirmComplete: {
                tap: 'onConfirmCompleteButtonTapped'
            },
            cancelButton: {
                tap: 'onCancelButtonTapped'
            },
            actionPanelButton: {
                tap: 'onHoldActionButtonTapped'
            },
            'button[action=quickCompleteCancel]': {
                tap: 'onQuickCompleteCancel'
            },
            quickCompleteView: {
                'quickcompletesave': 'onQuickCompleteSave',
                'remove': 'onQuickCompleteItemRemoved'
            },
            workRequestActionPicker: {
                itemselected: 'onActionPickerItemSelectedForMyWork'
            },
            verifyConfirmButton:{
                tap:'onConfirmVerifyButtonTapped'
            },
            verfifyInCompleteButton:{
                tap:'onVerifyIncompleteButtonTapped'
            }
        },

        returnCommentNotEmptyMessage: LocaleManager.getLocalizedString(
            'Please input the comments first',
            'Maintenance.controller.WorkRequestForms'),

        workRequestCompleteActionTitle: LocaleManager.getLocalizedString(
            'Complete',
            'Maintenance.controller.WorkRequestForms'),
        workRequestCompleteActionMessage: LocaleManager.getLocalizedString(
            'This action marks your assignment as Completed. Supervisors can update labor, parts, comments, and other work details until the request is Closed.<br>Complete your assignment?',
            'Maintenance.controller.WorkRequestForms'),

        workRequestCancelActionTitle: LocaleManager.getLocalizedString(
            'Cancel',
            'Maintenance.controller.WorkRequestForms'),
        workRequestCancelActionMessage: LocaleManager.getLocalizedString(
            'This action cancels a request before any work has begun. Canceling a request ends the request workflow.<br/><br/>Cancel the work request?',
            'Maintenance.controller.WorkRequestForms'),
        workRequestCompletedMessage: LocaleManager.getLocalizedString(
            'The Work Request status is Completed.<br>The status cannot be modified.',
            'Maintenance.controller.WorkRequestForms'),
        workRequestCompletedTitle: LocaleManager.getLocalizedString('Status', 'Maintenance.controller.WorkRequestForms'),

        craftsPersonLaborTitle: LocaleManager.getLocalizedString('Craftsperson Labor',
            'Maintenance.controller.WorkRequestForms'),

        craftsPersonLaborMessage: LocaleManager.getLocalizedString(
            'One or more craftsperson entries are missing labor hours<br>Do you want to Complete the Work Request?',
            'Maintenance.controller.WorkRequestForms')

    },

    onReturnCfButtonTapped: function () {
        // Get the work request record
        var me = this,
            returnCfForm,
            workRequestPanel = me.getMainView().getNavigationBar().getCurrentView(),
            workRequestRecord = workRequestPanel.getRecord();
        returnCfForm = Ext.create('Maintenance.view.manager.ReturnCfForm');
        returnCfForm.setRecord(workRequestRecord);
        me.getMainView().push(returnCfForm);
    },


    onConfirmReturnCfButtonTapped: function () {
        // Get the work request record
        var me = this,
            returnCfForm = me.getReturnCfPanel(),
            workRequestStore = Ext.getStore('workRequestsStore'),
            record = returnCfForm.getRecord(),
            comments = record.get('mob_step_comments'),
            errorMessages = [];

        returnCfForm.removeErrorPanelIfExists();
        if (!comments) {
            errorMessages.push({fieldName: 'mob_step_comments', errorMessage: me.getReturnCommentNotEmptyMessage()});
            if (errorMessages.length > 0) {
                returnCfForm.removeErrorPanelIfExists();

                returnCfForm.insert(0, {
                    xtype: 'errorpanel',
                    errorMessages: errorMessages
                });
            }

            return;
        }

        workRequestStore.setAutoSync(false);
        record.setMobileStepActionChanged('returnCf');
        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
            NavigationUtil.navigateBack(me.getMainView());
        });

    },

    onCompleteButtonTapped: function () {

        // Get the work request record
        var me = this,
            workRequestPanel = me.getMainView().getNavigationBar().getCurrentView(),
            workRequestRecord = workRequestPanel.getRecord(),
            workRequestStore = Ext.getStore('workRequestsStore'),
            completeAction = workRequestRecord.get('is_req_supervisor') === 1 ? 'supervisorComplete' : 'cfComplete',
            profile = me.getApplication().getCurrentProfile().getNamespace();

        Ext.Msg.confirm(me.getWorkRequestCompleteActionTitle(), me.getWorkRequestCompleteActionMessage(),
            function (buttonId) {
                if (buttonId === 'yes') {

                    if (workRequestRecord.get('is_req_supervisor') === 1) {
                        if (me.checkCfAssignmentsForSupervisor()) {
                            // Get the work request record
                            me.supervisorCompleteOptionsPanel = Ext.create('Maintenance.view.manager.SupervisorCompleteOptions');
                            me.supervisorCompleteOptionsPanel.setRecord(workRequestRecord);
                            me.getMainView().push(me.supervisorCompleteOptionsPanel);
                            return;
                        }
                    }

                    // Check current craftsperson store
                    var record = me.checkCraftspersonRecords();
                    var isLaborComplete = true;//me.checkCraftspersonHours();
                    if (record !== null) {
                        // Display quick complete form.
                        me.quickCompletePanel = Ext.create('Maintenance.view.' + profile + '.QuickComplete');
                        Ext.Viewport.add(me.quickCompletePanel);
                        me.quickCompletePanel.setRecord(record);
                        me.quickCompletePanel.setWorkRequestRecord(workRequestRecord);
                        me.quickCompletePanel.show();
                    } else {
                        // Check if the labor hours are populated before saving
                        if (isLaborComplete) {
                            //me.setStatusField('Com');
                            workRequestStore.setAutoSync(false);
                            workRequestRecord.setMobileStepActionChanged(completeAction);
                            workRequestStore.sync(function () {
                                workRequestStore.setAutoSync(true);
                                NavigationUtil.navigateBack(me.getMainView());
                            });
                            //me.saveWorkRequestRecord();
                        } else {
                            Ext.Msg.confirm(me.getCraftsPersonLaborTitle(), me.getCraftsPersonLaborMessage(),
                                function (buttonId) {
                                    if (buttonId === 'yes') {
                                        //me.setStatusField('Com');
                                        //me.saveWorkRequestRecord();

                                        workRequestStore.setAutoSync(false);
                                        workRequestRecord.setMobileStepActionChanged(completeAction);
                                        workRequestStore.sync(function () {
                                            workRequestStore.setAutoSync(true);
                                            NavigationUtil.navigateBack(me.getMainView());
                                        });
                                    }
                                });
                        }
                    }
                }
            });
    },

    onConfirmCompleteButtonTapped: function () {
        // Get the work request record
        var me = this,
            workRequestStore = Ext.getStore('workRequestsStore'),
            wrRecords = me.getMainView().getNavigationBar().getCurrentView().getWrRecords(),
            workRequestRecord = me.getMainView().getNavigationBar().getCurrentView().getRecord(),
            completeAction = me.getCompleteRadioOptions().getValue();

        workRequestStore.setAutoSync(false);
        if (Ext.isEmpty(wrRecords)) {
            workRequestRecord.setMobileStepActionChanged(completeAction);
        } else {
            for (var i = 0; i < wrRecords.length; i++) {
                wrRecords[i].setMobileStepActionChanged(completeAction);
            }
        }
        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
            me.getMainView().reset();
        });
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

    onLinkNewButtonTapped: function () {
        var navigationController = this.getApplication().getController('Maintenance.controller.WorkRequestNavigation'),
            addForm,
            copyValues = {},
            mainView = this.getMainView(),
            wrRecord = mainView.getNavigationBar().getCurrentView().getRecord();

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

    onCancelButtonTapped: function (record) {
        var me = this;
        Ext.Msg.confirm(me.getWorkRequestCancelActionTitle(), me.getWorkRequestCancelActionMessage(),
            function (buttonId) {
                if (buttonId === 'yes') {
                    me.setStatusField('Can');
                    me.saveWorkRequestRecord(function () {
                        NavigationUtil.navigateBack(me.getMainView());
                    });
                }
            });
    },

    checkCraftspersonRecords: function () {
        var store = Ext.getStore('workRequestCraftspersonsStore'),
            record, totalHours;

        if (store.getCount() === 1) {
            // Check labor hours
            record = store.getAt(0);
            totalHours = record.getTotalHours();
            if (totalHours === 0) {
                return record;
            }
        }
        return null;
    },

    /**
     * Checks if all of the craftsperson records for this Work Request have labor hours populated.
     * @returns {boolean} true if all craftsperson records have labor data entered, false otherwise.
     */
    checkCraftspersonHours: function () {
        var craftsPersonsStore = Ext.getStore('workRequestCraftspersonsStore'),
            ln = craftsPersonsStore.getCount(),
            i;

        for (i = 0; i < ln; i++) {
            if (craftsPersonsStore.getAt(i).getTotalHours() === 0) {
                return false;
            }
        }
        return true;
    },

    onQuickCompleteSave: function (cfRecord) {
        // Check if the cf record is valid
        var me = this,
	        workRequestPanel = me.getWorkRequestEditPanel(),
	        workRequestRecord = workRequestPanel.getRecord(),
	        workRequestStore = Ext.getStore('workRequestsStore'),
            completeAction = workRequestRecord.get('is_req_supervisor') === 1 ? 'supervisorComplete' : 'cfComplete',
            craftspersonRecord;

        if (cfRecord.isValid()) {
            //craftspersonStore = Ext.getStore('workRequestCraftspersonsStore');
            craftspersonRecord = me.quickCompletePanel.getRecord();
            craftspersonRecord.set('mob_is_changed', 1);
            workRequestStore.setAutoSync(false);
            workRequestRecord.setMobileStepActionChanged(completeAction);
            workRequestStore.sync(function () {
                workRequestStore.setAutoSync(true);
                NavigationUtil.navigateBack(me.getMainView());
            });
        } else {
            me.quickCompletePanel.displayErrors(cfRecord);
            if (!Ext.os.is.Phone) {
                me.quickCompletePanel.setHeight(420);
            }
            return;
        }
        me.quickCompletePanel.destroy();
    },

    onQuickCompleteCancel: function () {
        var cfRecord,
            craftspersonStore = Ext.getStore('workRequestCraftspersonsStore');

        if (this.quickCompletePanel) {
            // Set the hour values back to 0 if they were set
            craftspersonStore.setAutoSync(false);
            cfRecord = this.quickCompletePanel.getRecord();
            cfRecord.set('hours_straight', 0);
            cfRecord.set('hours_over', 0);
            cfRecord.set('hours_double', 0);
            craftspersonStore.sync(function () {
                craftspersonStore.setAutoSync(true);
            });
            this.quickCompletePanel.destroy();
        }
    },

    onQuickCompleteItemRemoved: function (panel) {
        if (!Ext.os.is.Phone) {
            panel.setHeight(300);
        }
    },

    setStatusField: function (status) {
        var view = this.getMainView().getNavigationBar().getCurrentView(),
            record = view.getRecord(),
            workRequestStore = Ext.getStore('workRequestsStore');

        workRequestStore.setAutoSync(false);
        record.set('status', status);
        record.setMobileStatusChanged(record.get('status_initial') !== record.get('status') ? 1 : 0);
        view.setValues({
            'status': status
        });
        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
        });
    },

    saveWorkRequestRecord: function (onCompleted, scope) {
        var workRequestRecord = this.getMainView().getNavigationBar().getCurrentView().getRecord(),
            status = workRequestRecord.get('status'),
            workRequestStore = Ext.getStore('workRequestsStore');

        workRequestStore.setAutoSync(false);
        workRequestRecord.setMobileStatusChanged(workRequestRecord.get('status_initial') !== workRequestRecord.get('status') ? 1 : 0);
        workRequestRecord.set('mob_pending_action', status);
        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
            Ext.callback(onCompleted, scope);
        });
    },

    /**
     *
     * @param actionId
     */
    onHoldActionsPicterSelected: function (actionId) {
        var me = this,
            itemId = actionId,
            status,
            workRequestRecord = me.getMainView().getNavigationBar().getCurrentView().getRecord(),
            isStatusAlreadyModified = workRequestRecord.mobileStatusStepChanged(),
            resetFlagIfResumeToIssued = function () {
                var workRequestStore = Ext.getStore('workRequestsStore');
                if (itemId === 'resumeToIssued' && isStatusAlreadyModified) {
                    // undo the status change flag
                    workRequestStore.setAutoSync(false);
                    workRequestRecord.setMobileStatusChanged(0);
                    workRequestStore.sync(function () {
                        workRequestStore.setAutoSync(true);
                    });
                }
            };

        switch (itemId) {
            case 'hold-parts':
                status = 'HP';
                break;

            case 'hold-labor':
                status = 'HL';
                break;
            case 'hold-access':
                status = 'HA';
                break;
            case 'resume-issued':
                status = 'I';
                break;
        }

        if (status) {
            this.setStatusField(status);
        }
        this.saveWorkRequestRecord(resetFlagIfResumeToIssued, me);
    },

    /**
     * Action Picker item of MyWork Tab select event listener.
     * @param record WorkRequest action store record.
     */
    onActionPickerItemSelectedForMyWork: function(record){
        var me = this,
            action = record.get('action'),
            actionDisplayValue = record.get('text'),
            mainView = me.getMainView(),
            currentView = mainView.getNavigationBar().getCurrentView(),
            actionType;
        if(currentView.xtype!==mainView.xtype){
            if(currentView.getDisplayMode()===Constants.MyWork){
                switch (action) {

                    case "hold-labor":
                        actionType="OnHold";
                        break;
                    case "hold-parts":
                        actionType="OnHold";
                        break;
                    case "hold-access":
                        actionType="OnHold";
                        break;
                    case "resume-issued":
                        actionType="OnHold";
                        break;

                    case "complete":
                        actionType="Complete";
                        break;

                    case "linkNew":
                        actionType="LinkNew";
                        break;
                    case "returnFromCf":
                        actionType="ReturnFromCf";
                        break;
                }
                if(actionType==="OnHold"){
                    me.onHoldActionsPicterSelected(action);
                }
                if(actionType==="Complete"){
                    me.onCompleteButtonTapped();
                }
                if(actionType==="LinkNew"){
                    me.onLinkNewButtonTapped();
                }
                if(actionType==="ReturnFromCf"){
                    me.onReturnCfButtonTapped();
                }

            }
        }

    },

    onConfirmVerifyButtonTapped: function () {
        // Get the work request record
        var me = this,
            verifyForm = me.getVerifyForm(),
            workRequestStore = Ext.getStore('workRequestsStore'),
            record = verifyForm.getRecord(),
            comments = record.get('mob_step_comments'),
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
        record.setMobileStepActionChanged('verify');
        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
            NavigationUtil.navigateBack(me.getMainView());
        });

    },

    onVerifyIncompleteButtonTapped: function(){
        // Get the work request record
        var me = this,
            verifyForm = me.getVerifyForm(),
            workRequestStore = Ext.getStore('workRequestsStore'),
            record = verifyForm.getRecord();

        workRequestStore.setAutoSync(false);
        record.setMobileStepActionChanged('verifyIncomplete');
        workRequestStore.sync(function () {
            workRequestStore.setAutoSync(true);
            NavigationUtil.navigateBack(me.getMainView());
        });
    }
});