/**
 * Holds functions for handling the actions on the work requests
 *
 * @author Cristina Moldovan
 * @since 21.3
 */
Ext.define('Maintenance.util.WorkRequestAction', {
    alternateClassName: ['WorkRequestAction'],

    singleton: true,

    statusChangeOnlyActions: {
        'issue': 'I', 'resume-issued': 'I', 'cancel': 'Can',
        'hold-parts': 'HP', 'hold-labor': 'HL', 'hold-access': 'HA',
        'stop': 'S', 'complete': 'Com', 'close': 'Clo'
    },

    /**
     * Filters the work request actions store according to the work request records.
     * For multiple records passed, filters by the valid actions for all records.
     *
     * @param {Array} workRequestRecords
     * @param multipleSelection multiple work requests selection? true/false
     * @param onCompleted
     * @param listType workRequestManagerList's displayMode property
     * @param scope
     */
    filterWorkRequestActions: function (workRequestRecords, multipleSelection, listType, onCompleted, scope) {
        var me = this,
            roleName = ApplicationParameters.getUserRoleName(),
            filterArray = [],
            workRequestFilterArray = [],
            workRequestActionsStore = Ext.getStore('workRequestActionsStore'),
            i,
            filterByFunction = function (record) {
                for (i = 0; i < filterArray.length; i++) {
                    if (typeof filterArray[i] === 'string') {
                        if (record.get('action') === filterArray[i]) {
                            return true;
                        }
                    } else {
                        if (record.get('action') === filterArray[i].action && record.get('step') === filterArray[i].step) {
                            return true;
                        }
                    }
                }

                return false;
            };

        Ext.Array.each(workRequestRecords, function (workRequestRecord) {
            if (roleName === 'supervisor') {
                workRequestFilterArray = me.getActionsFilterForSupervisor(workRequestRecord, multipleSelection);
            } else if (roleName === 'craftsperson') {
                workRequestFilterArray = me.getActionsFilterForCraftsperson(workRequestRecord, multipleSelection);
            } else {
                workRequestFilterArray = me.getActionsFilterForOtherRoles(workRequestRecord, multipleSelection);
            }
            if (Ext.Array.indexOf(workRequestRecords, workRequestRecord) === 0) {
                filterArray = workRequestFilterArray;
            } else {
                // Removes from filter array the actions that are not in the work request filter array
                // (Ext.Array.intersect does not work)
                filterArray = me.removeNotCommonActions(filterArray, workRequestFilterArray);
            }
        });


        if (workRequestRecords.length > 0) {
            // for multiple selection from Issued/Completed tab, add the Update action to allow navigation to the update form
            if (multipleSelection
                && (listType === Constants.Issued || listType === Constants.Completed)) {
                me.pushActionFilter(filterArray, 'update', null, multipleSelection);
            }
        }
      
        if (Ext.isEmpty(filterArray)) {
            // set dummy filter to return zero records
            filterArray.push('dummyValue');
        }

        workRequestActionsStore.clearFilter();
        //workRequestActionsStore.setFilters(filterArray); does AND; we need OR
        workRequestActionsStore.filterBy(filterByFunction);
        workRequestActionsStore.loadPage(1, function () {
            Ext.callback(onCompleted, scope || me);
        }, scope);
    },

    /**
     * #KB3046265
     * Filter work request actions for MyWork Tab. set same UI for MyWork with Issued.
     * @param {Array} workRequestRecords
     * @param onCompleted
     * @param listType workRequestManagerList's displayMode property
     * @param scope
     */
    filterWorkRequestActionsForMyWork: function(workRequestRecord, listType, onCompleted, scope){
        var me = this,
            filterArray = [],
            workRequestActionsStore = Ext.getStore('workRequestActionsStore'),
            i,
            filterByFunction = function (record) {
                for (i = 0; i < filterArray.length; i++) {
                    if (typeof filterArray[i] === 'string') {
                        if (record.get('action') === filterArray[i]) {
                            return true;
                        }
                    }
                }

                return false;
            };

        if(listType==="MyWork"){

            filterArray=me.getFilterArrayForMyWork(workRequestRecord,false);
            workRequestActionsStore.clearFilter();
            //workRequestActionsStore.setFilters(filterArray); does AND; we need OR
            workRequestActionsStore.filterBy(filterByFunction);
            workRequestActionsStore.loadPage(1, function () {
                Ext.callback(onCompleted, scope || me);
            }, scope);
        }
    },
    /**
     * Get filter array for my work tab
     * @param workRequestRecord selected workRequest record.
     * @param multipleSelection  multipleSelection multiple work requests selection? true/false
     * @returns {Array}
     */
    getFilterArrayForMyWork: function(workRequestRecord, multipleSelection){
        var me = this,
            currentStatus = workRequestRecord.get('status'),
            isRequestSupervisor = workRequestRecord.get('is_req_supervisor'),
            filterArray = [],
            myWorkFilterFunction = function () {
                me.pushActionFilter(filterArray, 'hold-parts', workRequestRecord, multipleSelection);
                me.pushActionFilter(filterArray, 'hold-labor', workRequestRecord, multipleSelection);
                me.pushActionFilter(filterArray, 'hold-access', workRequestRecord, multipleSelection);
                me.pushActionFilter(filterArray, 'resume-issued', workRequestRecord, multipleSelection);
                me.pushActionFilter(filterArray, 'complete', workRequestRecord, multipleSelection);
                var wrId=workRequestRecord.get('wr_id');
                if(!Ext.isEmpty(wrId)){
                    me.pushActionFilter(filterArray, 'linkNew', workRequestRecord, multipleSelection);
                }

                if (ApplicationParameters.canCraftspersonReturnWorkRequest) {
                    me.pushActionFilter(filterArray, 'returnFromCf', workRequestRecord, multipleSelection);
                }

            };

        myWorkFilterFunction();

        return filterArray;
    },

    /**
     * Removes from the filter array the actions that are not in the work request filter array.
     *
     * @param filterArray
     * @param workRequestFilterArray
     * @returns {boolean}
     */
    removeNotCommonActions: function (filterArray, workRequestFilterArray) {
        var toRemove = [];

        if (Ext.isEmpty(workRequestFilterArray)) {
            filterArray = [];
        } else {
            Ext.Array.each(filterArray, function (filter) {
                var contained = false;

                Ext.Array.each(workRequestFilterArray, function (workRequestFilter) {
                    if (typeof filter === 'string') {
                        if (workRequestFilter === filter) {
                            contained = true;
                        }
                    } else {
                        if (typeof workRequestFilter !== 'string'
                            && workRequestFilter.action === filter.action
                            && (workRequestFilter.step === filter.step || (filter.step === 'Edit and Approve' && workRequestFilter.step === 'Manager Approval')
                            || (workRequestFilter.step === 'Edit and Approve' && filter.step === 'Manager Approval'))) {
                            contained = true;
                        }
                    }
                });

                if (!contained) {
                    toRemove.push(filter);
                }
            });

            filterArray = Ext.Array.difference(filterArray, toRemove);
        }

        return filterArray;
    },

    /**
     *
     * @private
     * @param workRequestRecord
     * @param multipleSelection multiple work requests selection? true/false
     * @returns {Array}
     */
    getActionsFilterForSupervisor: function (workRequestRecord, multipleSelection) {
        var me = this,
            stepType = workRequestRecord.get('step_type'),
            status = workRequestRecord.get('status_initial'),
            currentStatus = workRequestRecord.get('status'),
            isRequestSupervisor = workRequestRecord.get('is_req_supervisor'),
            filterArray = [],
            approvedFilterFunction = function () {
                me.pushActionFilter(filterArray, 'estimation', workRequestRecord, multipleSelection);
                me.pushActionFilter(filterArray, 'scheduling', workRequestRecord, multipleSelection);
                me.pushActionFilter(filterArray, 'issue', workRequestRecord, multipleSelection);
                me.pushActionFilter(filterArray, 'cancel', workRequestRecord, multipleSelection);
                if (!multipleSelection) {
                    me.pushActionFilter(filterArray, 'linkNew', workRequestRecord, multipleSelection);
                    me.pushActionFilter(filterArray, 'returnFromSupervisor', workRequestRecord, multipleSelection);
                }


                me.pushStepTypeActionFilter(filterArray, workRequestRecord, multipleSelection,
                    stepType !== 'estimation' && stepType !== 'scheduling');

            },
            issuedFilterFunction = function () {
                me.pushActionFilter(filterArray, 'hold-parts', workRequestRecord, multipleSelection);
                me.pushActionFilter(filterArray, 'hold-labor', workRequestRecord, multipleSelection);
                me.pushActionFilter(filterArray, 'hold-access', workRequestRecord, multipleSelection);
                // only set Resume to Issued if the current status of the WR is On Hold
                if (currentStatus === 'HL' || currentStatus === 'HA' || currentStatus === 'HP') {
                    me.pushActionFilter(filterArray, 'resume-issued', workRequestRecord, multipleSelection);
                }
                me.pushActionFilter(filterArray, 'stop', workRequestRecord, multipleSelection);
                me.pushActionFilter(filterArray, 'complete', workRequestRecord, multipleSelection);
                if (!multipleSelection) {
                    me.pushActionFilter(filterArray, 'linkNew', workRequestRecord, multipleSelection);
                    me.pushActionFilter(filterArray, 'returnFromSupervisor', workRequestRecord, multipleSelection);
                }

                me.pushActionFilter(filterArray, 'forwardRequest', workRequestRecord, multipleSelection);
                me.pushStepTypeActionFilter(filterArray, workRequestRecord, multipleSelection);
            },
            holdFilterFunction = function () {
                // KB 3045410 allow 'On Hold' and 'Resume To Issued' actions for Supervisor and CF
                if (currentStatus === 'I') {
                    me.pushActionFilter(filterArray, 'hold-parts', workRequestRecord, multipleSelection);
                    me.pushActionFilter(filterArray, 'hold-labor', workRequestRecord, multipleSelection);
                    me.pushActionFilter(filterArray, 'hold-access', workRequestRecord, multipleSelection);
                } else if (currentStatus === 'HA' || currentStatus === 'HL' || currentStatus === 'HP') {
                    me.pushActionFilter(filterArray, 'resume-issued', workRequestRecord, multipleSelection);
                }
                me.pushActionFilter(filterArray, 'complete', workRequestRecord, multipleSelection);
                if (!multipleSelection) {
                    me.pushActionFilter(filterArray, 'linkNew', workRequestRecord, multipleSelection);
                    me.pushActionFilter(filterArray, 'returnFromSupervisor', workRequestRecord, multipleSelection);
                }

                me.pushStepTypeActionFilter(filterArray, workRequestRecord, multipleSelection);
            };

        if (!isRequestSupervisor) {

            me.pushStepTypeActionFilter(filterArray, workRequestRecord, multipleSelection, true);

        } else {
            if (status === 'R') {

                me.pushStepTypeActionFilter(filterArray, workRequestRecord, multipleSelection);

            } else if (status === 'AA') {

                approvedFilterFunction();

            } else if (status === 'I') {

                issuedFilterFunction();

            } else if (status === 'HA' || status === 'HL' || status === 'HP') {

                holdFilterFunction();

            } else if (status === 'Com') {
                me.pushActionFilter(filterArray, 'close', workRequestRecord, multipleSelection);
                if (!multipleSelection) {
                    me.pushActionFilter(filterArray, 'linkNew', workRequestRecord, multipleSelection);
                    me.pushActionFilter(filterArray, 'returnFromSupervisor', workRequestRecord, multipleSelection);
                }
                me.pushStepTypeActionFilter(filterArray, workRequestRecord, multipleSelection);
            }
        }

        return filterArray;
    },

    /**
     *
     * @private
     * @param workRequestRecord
     * @param multipleSelection multiple work requests selection? true/false
     * @returns {Array}
     */
    getActionsFilterForCraftsperson: function (workRequestRecord, multipleSelection) {
        var me = this,
            status = workRequestRecord.get('status_initial'),
            currentStatus = workRequestRecord.get('status'),
            isRequestCraftsperson = workRequestRecord.get('is_req_craftsperson'),
            isWtSelfAssign = workRequestRecord.get('is_wt_self_assign'),
            filterArray = [],
            issuedOrOnHold = (status === 'I' || status === 'HA' || status === 'HL' || status === 'HP'),
            holdAndIssuedFilterFunction = function () {
                // KB 3045410 allow 'On Hold' and 'Resume To Issued' actions for Supervisor and CF
                if (currentStatus === 'I') {
                    me.pushActionFilter(filterArray, 'hold-parts', workRequestRecord, multipleSelection);
                    me.pushActionFilter(filterArray, 'hold-labor', workRequestRecord, multipleSelection);
                    me.pushActionFilter(filterArray, 'hold-access', workRequestRecord, multipleSelection);
                    if (!multipleSelection) {
                        me.pushActionFilter(filterArray, 'linkNew', workRequestRecord, multipleSelection);
                    }

                    if (ApplicationParameters.canCraftspersonReturnWorkRequest) {
                        me.pushActionFilter(filterArray, 'returnFromCf', workRequestRecord, multipleSelection);
                    }
                    
                } else if (currentStatus === 'HA' || currentStatus === 'HL' || currentStatus === 'HP') {
                    me.pushActionFilter(filterArray, 'resume-issued', workRequestRecord, multipleSelection);
                }

                // KB 3045099 show Complete action for CF
                me.pushActionFilter(filterArray, 'complete', workRequestRecord, multipleSelection);

                me.pushStepTypeActionFilter(filterArray, workRequestRecord, multipleSelection);
            };

        if (isRequestCraftsperson) {
            if (issuedOrOnHold) {
                holdAndIssuedFilterFunction();
            }

            me.pushStepTypeActionFilter(filterArray, workRequestRecord, multipleSelection);

        } else {
            if (status === 'AA') {

                if (isWtSelfAssign) {
                    me.pushActionFilter(filterArray, 'assignToMe', workRequestRecord, multipleSelection);
                }

                me.pushStepTypeActionFilter(filterArray, workRequestRecord, multipleSelection);

            } else if (issuedOrOnHold) {

                // KB 3045099 show Complete action for CF
                me.pushActionFilter(filterArray, 'complete', workRequestRecord, multipleSelection);

            } else {

                me.pushStepTypeActionFilter(filterArray, workRequestRecord, multipleSelection);

            }
        }

        return filterArray;
    },

    /**
     *
     * @private
     * @param workRequestRecord
     * @param multipleSelection multiple work requests selection? true/false
     * @returns {Array}
     */
    getActionsFilterForOtherRoles: function (workRequestRecord, multipleSelection) {
        var me = this,
            filterArray = [];

        me.pushStepTypeActionFilter(filterArray, workRequestRecord, multipleSelection);

        return filterArray;
    },

    /**
     * Creates a filter for the step action.
     *
     * @private
     * @param workRequestRecord
     * @returns {String/Object} Object example: {action: 'approval', step: step}
     */
    getStepTypeActionFilter: function (workRequestRecord) {
        var stepType = workRequestRecord.get('step_type'),
            step = workRequestRecord.get('step'),
            filter = '';

        if (!Ext.isEmpty(stepType)) {
            if (stepType === 'review' || stepType === 'approval') {
                filter = {action: 'approval', step: step};
            } else {
                filter = stepType;
            }
        }

        return filter;
    },

    /**
     *
     * @private
     * @param filterArray
     * @param workRequestRecord
     * @param multipleSelection multiple work requests selection? true/false
     * @param [push] true/false/undefined
     */
    pushStepTypeActionFilter: function (filterArray, workRequestRecord, multipleSelection, push) {
        var me = this,
            stepType = workRequestRecord.get('step_type'),
            actionFilter;

        if (!Ext.isEmpty(stepType) && push !== false) {
            actionFilter = me.getStepTypeActionFilter(workRequestRecord);
            me.pushActionFilter(filterArray, actionFilter, workRequestRecord, multipleSelection);
        }
    },


    /**
     *
     * @private
     * @param filterArray
     * @param {String/Object} actionFilter
     * @param workRequestRecord
     * @param multipleSelection
     */
    pushActionFilter: function (filterArray, actionFilter, workRequestRecord, multipleSelection) {
        var me = this,
            action = (typeof actionFilter === 'string' ? actionFilter : actionFilter.action);

        if (multipleSelection && workRequestRecord) {
            if (!me.checkStatusChanged(workRequestRecord)
                && !((me.statusChangeOnlyActions.hasOwnProperty(action)
                || action === 'assignToMe')
                && me.checkPendingStep(workRequestRecord, action))) {

                filterArray.push(actionFilter);
            }
        } else {
            filterArray.push(actionFilter);
        }
    },

    /**
     * Returns true if the the work request status has changed.
     * Exception: returns false for work requests in initial status 'I'
     * // KB 3045410 allow 'On Hold' and 'Resume To Issued' actions for Supervisor and CF
     * @param record work request record
     * @returns {boolean}
     */
    checkStatusChanged: function (record) {
        var status = record.get('status_initial');

        if (record.mobileStatusStepChanged()) {
            return !(status === 'I'
            || status === 'HL' || status === 'HA' || status === 'HP');
        }

        return false;
    },

    /**
     * Checks if a pending step exists.
     * @param record work request record
     * @param action The action to take on the work request
     * @returns {boolean}
     */
    checkPendingStep: function (record, action) {
        var stepStatus = record.get('step_status'),
            actions = ['issue', 'assignToMe', 'hold-parts', 'hold-labor', 'hold-access',
                'stop', 'complete', 'close'];

        return !!(!Ext.isEmpty(stepStatus) && stepStatus === 'waiting'
        && Ext.Array.contains(actions, action));
    },

    /**
     * Load related work reuqests
     *
     *  @param view The edit view
     *  @param wrId The work request code
     */
    loadRelatedRequests: function (view, wrId) {
        var me = view,
            i,
            workRequestsStore = Ext.getStore('workRequestsStore'),
            tapRelatedRequest = function (tapObject) {
                //KB#3050980  Filter and load reference store
                var storeIds = ['workRequestsStore','workRequestCraftspersonsStore', 'workRequestPartsStore', 'workRequestToolsStore',
                        'workRequestCostsStore'],
                    wrId = parseInt(tapObject.getValue(), 10),
                    editView,
                    wrIdFilter = WorkRequestFilter.createFilter('wr_id', wrId);

                workRequestsStore.retrieveRecord([wrIdFilter], function (record) {
                    editView = WorkRequestAction.createRelatedRequestEditView(record);
                    Network.checkNetworkConnectionAndDisplayMessageAsync(function (isConnected) {
                        if (isConnected) {
                            WorkRequestAction.loadRelatedRequests(editView, wrId);
                        }
                    }, me);

                    Promise.all(storeIds.map(function (storeId) {
                        WorkRequestFilter.filterAndLoadStores([storeId], [wrIdFilter]);
                    }))
                        .then(function () {
                            return  WorkRequestFilter.filterAndLoadStores(['referenceStore'], [wrIdFilter]);
                        }) .then(function () {
                            me.parent.down('workrequestListPanel').setDisplayMode(editView.getDisplayMode());
                            me.parent.push(editView);
                            editView.setRecord(record);
                        });
                });
            },
            relatedRequests = [];

        Workflow.callMethodAsync('AbBldgOpsOnDemandWork-WorkRequestService-getRelatedWorkRequests',
            [wrId], Network.SERVICE_TIMEOUT, function (success, errorMessage, result) {
                if (!success) {
                    if (Ext.isEmpty(errorMessage) && !Ext.isEmpty(result.message)) {
                        errorMessage = result.message;
                    }
                    Ext.Msg.alert(me.errorMessageTitle, errorMessage);
                } else {
                    relatedRequests = JSON.parse(result.jsonExpression);
                    if (!Ext.isEmpty(relatedRequests)) {
                        for (i = 0; i < relatedRequests.length; i++) {
                            me.add({
                                xtype: 'input',
                                name: 'related_request_ids',
                                readOnly: true,
                                value: relatedRequests[i],
                                listeners: {inputtap: tapRelatedRequest}
                            });
                        }
                    }
                }
            }, me);
    },


    /**
     * Create related request edit view.
     * @param record work request record
     * @returns {View}
     */
    createRelatedRequestEditView: function (record) {
        var editView = null, displayMode;
        if (record.get('request_type') === 2) {
            displayMode = Constants.MyRequests;
            editView = Ext.create(Ext.os.is.Phone ? 'Maintenance.view.phone.WorkRequestEdit'
                    : 'Maintenance.view.tablet.WorkRequestEdit',
                {displayMode: displayMode, isRelatedRequest: true});
        } else if (record.get('status') === 'R' && (record.get('step_type') === 'review' || record.get('step_type') === 'approval')) {
            displayMode = Constants.Requested;
            editView = Ext.create('Maintenance.view.manager.ApproveForm',
                {displayMode: displayMode, isRelatedRequest: true});
        } else if (record.get('is_req_supervisor') === 1 || record.get('step_type') === 'estimation'
            || record.get('step_type') === 'scheduling'|| record.get('step_type') === 'approval'
            || record.get('step_type') === 'verification') {
            if (record.get('status') === 'AA') {
                displayMode = Constants.Approved;
            } else if (record.get('status') === 'Com') {
                displayMode = Constants.Completed;
            } else {
                displayMode = Constants.Issued;
            }
            editView = Ext.create('Maintenance.view.manager.UpdateForm',
                {displayMode: displayMode, isRelatedRequest: true});
        } else if (record.get('is_req_craftsperson') === 1) {
            displayMode = Constants.MyWork;
            editView = Ext.create(Ext.os.is.Phone ? 'Maintenance.view.phone.WorkRequestEdit'
                    : 'Maintenance.view.tablet.WorkRequestEdit',
                {displayMode: displayMode, isRelatedRequest: true});
        }else if (record.get('status') === 'AA' && record.get('requestor') !== UserProfile.getUserProfile().em_id) {
            displayMode = Constants.Approved;
            editView = Ext.create('Maintenance.view.manager.UpdateForm',
                {displayMode: displayMode, isRelatedRequest: true});
        }  else {
            displayMode = Constants.MyRequests;
            editView = Ext.create(Ext.os.is.Phone ? 'Maintenance.view.phone.WorkRequestEdit'
                    : 'Maintenance.view.tablet.WorkRequestEdit',
                {displayMode: displayMode, isRelatedRequest: true});
        }

        editView.setRecord(record);
        WorkRequestAction.filterWorkRequestActions([record], false, displayMode);
        //KB#3046265 Change button in MyWork Tab to Action picker, keep same UI style with Issue tab view.
        if(displayMode===Constants.MyWork){
            WorkRequestAction.filterWorkRequestActionsForMyWork(record, displayMode);
        }

        return editView;
    }
});