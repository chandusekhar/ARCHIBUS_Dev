Ext.define('IncidentReporting.controller.IncidentNavigation', {
    extend: 'Common.controller.NavigationController',

    config: {
        refs: {
            mainView: 'main',
            generalView: 'generalcard',
            witnessView: 'witnesscard',
            incidentList: 'incidentListPanel',
            witnessList: 'witnessListPanel',
            detailsViewButtonPicker: 'generalcard buttonpicker',
            generalViewFieldSet: 'generalcard #generalFieldSet',
            dropDownButton: 'main buttonpicker[itemId=dropDownActions]',
            homeButton: 'button[action=goToHomePage]',
            emIdAffectedField: 'generalcard incidentEmployeePrompt[name=em_id_affected]',
            contactField: 'generalcard contactPrompt',
            nonEmNameField: 'generalcard commontextfield[name=non_em_name]',
            nonEmInfoField: 'generalcard commontextareafield[name=non_em_info]',
            generalInstructionLabel: 'generalcard label[itemId=generalInstructionLabel]',
            witnessTypeField: 'witnesscard selectlistfield[name=witness_type]',
            witnessEmField: 'witnesscard incidentEmployeePrompt',
            witnessContactField: 'witnesscard contactPrompt',
            witnessNonEmField: 'witnesscard commontextfield[name=non_em_name]',
            witnessNonEmInfoField: 'witnesscard commontextareafield[name=non_em_info]',
            witnessInstructionLabel: 'witnesscard label[itemId=witnessInstructionLabel]'
        },

        control: {
            mainView: {
                push: 'onViewPushed',
                pop: 'onViewPopped'
            },
            detailsViewButtonPicker: {
                itemselected: function (record) {
                    this.onSelectDetailsView(record);
                },
                tap: function () {
                    this.setDetailListBadges();
                }
            },
            generalcard: {
                show: 'onShowGeneralView'
            },
            'button[action=copyIncident]': {
                tap: 'onCopyIncident'
            },
            'button[action=deleteIncident]': {
                tap: 'onDeleteIncident'
            },
            'button[action=deleteWitness]': {
                tap: 'onDeleteWitness'
            },
            'button[action=copyEmLocation]': {
                tap: 'onCopyEmLocation'
            },
            incidentList: {
                itemsingletap: 'onIncidentListTapped',
                show: function () {
                    var store = Ext.getStore('incidentsStore');
                    this.setDisableListTapEvent(false);
                    store.loadPage(1);
                }
            },
            witnessList: {
                itemsingletap: 'onWitnessListTapped',
                show: function () {
                    var store = Ext.getStore('incidentWitnessesStore');
                    this.setDisableListTapEvent(false);
                    store.loadPage(1);
                }
            },
            dropDownButton: {
                itemselected: 'onDropDownActionSelected'
            },
            homeButton: {
                tap: 'onGoToHomePage'
            },
            emIdAffectedField: {
                change: 'onChangeAffectedEm'
            },
            contactField: {
                change: 'onChangeContact'
            },
            nonEmNameField: {
                change: 'onChangeNonEm'
            },
            nonEmInfoField: {
                change: 'onChangeNonEm'
            },
            witnessTypeField: {
                change: 'onChangeWitnessType'
            },
            witnessContactField: {
                change: 'onChangeWitnessContact'
            },
            witnessNonEmField: {
                change: 'onChangeWitnessNonEm'
            },
            witnessNonEmInfoField: {
                change: 'onChangeWitnessNonEm'
            }
        },

        disableListTapEvent: false,
        incidentSavedMessage: LocaleManager.getLocalizedString('The incident was saved',
            'IncidentReporting.controller.IncidentNavigation'),
        selectOneFieldMessage: LocaleManager.getLocalizedString('One and only one of these fields is mandatory:<br />Affected Employee, Non-Emp. Contact Code or Affected Non-Emp. Name.', 'IncidentReporting.controller.IncidentNavigation'),
        clearAffectedEmMesssage: LocaleManager.getLocalizedString('To report this incident for an affected non-employee, clear the field Affected Employee.', 'IncidentReporting.controller.IncidentNavigation'),
        clearContactMesssage: LocaleManager.getLocalizedString('To report this incident for different type of affected person, clear the field Non-Emp. Contact Code.', 'IncidentReporting.controller.IncidentNavigation'),
        clearNonEmMesssage: LocaleManager.getLocalizedString('To report this incident for different type of affected person, clear the fields Affected Non-Emp. Name and Affected Non-Emp. Contact Inf.', 'IncidentReporting.controller.IncidentNavigation'),
        clearNonEmWitnessMessage: LocaleManager.getLocalizedString('Fill in either Non-Emp. Contact Code or Non-Emp. Witness Name. Use Non-Emp. Witness Name if the witness is not in the Contacts list.', 'IncidentReporting.controller.IncidentNavigation'),
        clearWitnessContactMessage: LocaleManager.getLocalizedString('Clear the field Non-Emp. Contact Code to replace it with a Non-Employee Witness Name that is not in the Contacts list.', 'IncidentReporting.controller.IncidentNavigation'),
        clearWitnessNonEmMessage: LocaleManager.getLocalizedString('Clear the field Non-Emp. Witness Name and Non-Emp. Witness Contact Inf. to replace it with an existing Non-Employee Contact.', 'IncidentReporting.controller.IncidentNavigation')
    },


    onViewPushed: function (mainView, pushedView) {
        var navBar = this.getNavigationBar(),
            saveButton = navBar.getSaveButton(),
            dropDownButton = this.getDropDownButton();

        if (pushedView.xtype === 'witnessListPanel') {
            navBar.updateShowSaveButton(false);
        }

        if (dropDownButton) {
            dropDownButton.setHidden(pushedView.xtype !== 'locationcard');
        }

        saveButton.setHidden(true);

        this.getHomeButton().setHidden(pushedView.xtype === 'main' || pushedView.xtype === 'generalcard');
    },

    onViewPopped: function () {
        var navBar = this.getNavigationBar(),
            saveButton = navBar.getSaveButton(),
            currentView = navBar.getCurrentView(),
            dropDownButton = this.getDropDownButton();

        this.callParent(arguments);

        saveButton.setHidden(true);

        if (currentView.xtype === 'witnessListPanel') {
            navBar.updateShowSaveButton(false);
        }

        if (dropDownButton) {
            dropDownButton.setHidden(currentView.xtype !== 'locationcard');
        }

        this.getHomeButton().setHidden(currentView.xtype === 'main' || currentView.xtype === 'generalcard');
    },

    onGoToHomePage: function () {
        this.getMainView().reset();
    },

    onSelectDetailsView: function (record) {
        var viewName = record.get('view_name'),
            view,
            incidentRecord = this.getGeneralView().getRecord();

        if (viewName === 'Documents') {
            view = Ext.create('IncidentReporting.view.Documents', {
                record: incidentRecord
            });
        } else {
            view = this.getViewToDisplay(viewName, incidentRecord);
        }

        if (view) {
            if (view.$className === 'IncidentReporting.view.Witness') {
                Ext.Viewport.add(view);
                view.show();
            } else {
                this.getMainView().push(view);
            }
        }
    },

    getViewToDisplay: function (viewName, record) {
        var fullViewName = 'IncidentReporting.view.' + viewName,
            view, storeCount, storeRecordCounts,
            mobIncidentId = record.get('mob_incident_id'),
            navBar = this.getNavigationBar(),
            currentView = navBar.getCurrentView();

        if (viewName === 'Witness') {
            storeRecordCounts = this.getRecordCounts(record);
            storeCount = storeRecordCounts.witnessesCount;

            if (storeCount > 0) {
                view = Ext.create('IncidentReporting.view.WitnessList', {
                    mobIncidentId: mobIncidentId
                });
            } else {
                view = this.getModalAddPanel(currentView);

                record = Ext.create('IncidentReporting.model.IncidentWitness');
                record.set('mob_incident_id', mobIncidentId);
                record.set('witness_type', 'Employee');

                view.setRecord(record);
            }
        } else {
            view = Ext.create(fullViewName, {
                isCreateView: true
            });
            view.setRecord(record);
        }

        return view;
    },

    onIncidentListTapped: function (list, index, target, record) {
        var isListTapEventDisabled = this.getDisableListTapEvent();
        if (isListTapEventDisabled) {
            return;
        }
        this.displayUpdatePanel(list, record);
    },

    onWitnessListTapped: function (list, index, target, record) {
        var isListTapEventDisabled = this.getDisableListTapEvent();
        if (isListTapEventDisabled) {
            return;
        }
        this.displayUpdatePanel(list, record);
    },

    /**
     * @override
     *
     * @param {Common.view.navigation.EditBase/Common.view.navigation.ListBase} currentView
     * The currently displayed view.
     */
    saveEditPanel: function (currentView) {
        var me = this,
            userProfile = Common.util.UserProfile.getUserProfile(),
            store = Ext.getStore(currentView.getStoreId()),
            record = currentView.getRecord();

        // Check validation
        if (record.isValid()) {
            if (currentView.xtype === 'generalcard') {
                //save new incident
                me.isDistinctEmployee(record, store, function () {
                    record.set('recorded_by', userProfile.em_id);
                    if (record.get('mob_incident_id') === null) {
                        //calculate and set the value for mob_incident_id
                        IncidentReporting.util.Ui.calculateNextMobId(store, 'mob_incident_id', function (calculatedId) {
                            record.set('mob_incident_id', calculatedId);
                            me.addRecordToStore(currentView, record, store);
                        }, me);
                    } else {
                        me.addRecordToStore(currentView, record, store);
                    }
                }, me);
            } else {
                //save new witness
                me.addRecordToStore(currentView, record, store);
            }
        } else {
            currentView.displayErrors(record);
        }
    },

    addRecordToStore: function (view, record, store) {
        var me = this,
            newRecord, currentParentId;

        //set the parent_incident_id for parent incidents
        if (view.xtype === 'generalcard') {
            currentParentId = record.get('parent_incident_id');
            if (Ext.isEmpty(currentParentId) || currentParentId === 0) {
                record.set('parent_incident_id', record.get('mob_incident_id'));
            }
        }

        record.setChangedOnMobile();
        store.setAutoSync(false);

        newRecord = store.add(record);

        store.sync(function () {
            store.setAutoSync(true);
            store.load(function () {
                Ext.callback(me.onAddRecordCompleted, me, [view, store, newRecord[0]]);
            });
        });
    },

    onAddRecordCompleted: function (view, store, newRecord) {
        var me = this;

        if (view.xtype === 'generalcard') {
            me.filterChildStoresInSequence(newRecord.get('mob_incident_id'), ['incidentWitnessesStore', 'documentsStore'], function () {
                me.displaySavedMessage();
                view.setIsCreateView(false);
                me.getDetailsViewButtonPicker().setHidden(false);

                Ext.Viewport.remove(view);
                me.setLastPushedView('');
                me.setDisableListTapEvent(false);
                this.displayUpdatePanel(this.getIncidentList(), newRecord);
            }, me);
        } else {
            Ext.Viewport.remove(view);
            me.setDisableListTapEvent(false);
            me.setLastPushedView('');
        }
    },

    displaySavedMessage: function () {
        var generalFieldSet = this.getGeneralViewFieldSet(),
            title = this.getIncidentSavedMessage();
        if (generalFieldSet) {
            generalFieldSet.setTitle(title);
            window.setTimeout(function () {
                generalFieldSet.setTitle('');
            }, 2000);
        }
    },

    /**
     * Displays an alert message if the same employee, date, time and type of incident are selected.
     * @param {Ext.data.Model} record
     * @param store
     * @param callbackFn
     * @param scope
     */
    isDistinctEmployee: function (record, store, callbackFn, scope) {
        var me = this,
            filterArray,
            saveSameEmployeeTitle = LocaleManager.getLocalizedString('Same affected person',
                'IncidentReporting.controller.IncidentNavigation'),
            saveSameEmployeeMessage = LocaleManager.getLocalizedString('The same affected person was already saved for a similar incident. Proceed?',
                'IncidentReporting.controller.IncidentNavigation');

        filterArray = me.getDistinctEmployeeFilter(record);

        store.retrieveAllStoreRecords(filterArray, function (records) {
            if (records && records.length > 0) {
                Ext.Msg.confirm(saveSameEmployeeTitle, saveSameEmployeeMessage, function (buttonId) {
                    if (buttonId === 'yes') {
                        Ext.callback(callbackFn, scope || me);
                    }
                });
            } else {
                Ext.callback(callbackFn, scope || me);
            }
        });
    },

    getDistinctEmployeeFilter: function (record) {
        var filterArray = [],
            fieldNames = ['em_id_affected', 'contact_id', 'non_em_name', 'time_incident', 'incident_type'],
            i, formattedDateValue;

        for (i = 0; i < fieldNames.length; i++) {
            this.addFilterForField(fieldNames[i], record.get(fieldNames[i]), filterArray);
        }

        formattedDateValue = Ext.Date.format(record.get('date_incident'), 'Y-m-d H:i:s.u');
        this.addFilterForField('date_incident', formattedDateValue, filterArray);

        return filterArray;
    },

    /**
     * Add filter to filter array for the specified field with the specofied value.
     */
    addFilterForField: function (fieldId, value, filterArray) {
        var filter;

        if (value) {
            filter = Ext.create('Common.util.Filter', {
                property: fieldId,
                value: value,
                conjunction: 'AND',
                exactMatch: true
            });
            filterArray.push(filter);
        }
    },

    /**
     * Overide the Common.view.NavigationController displayUpdatePanel function so we can get the
     * selected incident_id value and filter the child stores.
     *
     * @override
     * @param view
     * @param record
     */
    displayUpdatePanel: function (view, record) {
        var me = this,
            editView = view.getEditViewClass(),
            updateView = Ext.create(editView),
            mobIncidentId = record.get('mob_incident_id'),
            setUpdateView = function () {
                updateView.setRecord(record);
                me.getMainView().push(updateView);
            };

        me.setLastPushedView(updateView.$className);
        // Filter the child stores if we are at the incident list.
        if (view.isIncidentList) {
            // We are using a remote filter so we have to wait for
            // the stores to load before pushing the view.
            me.filterChildStoresInSequence(mobIncidentId, ['incidentWitnessesStore', 'documentsStore'], function () {
                setUpdateView();
            }, me);
        } else {
            setUpdateView();
        }
    },

    filterChildStoresInSequence: function (mobIncidentId, storeIds, callbackFn, scope) {
        var me = this,
            store;

        if (Ext.isEmpty(storeIds) || storeIds.length === 0) {
            Ext.callback(callbackFn, scope || me);
        } else {
            store = Ext.getStore(storeIds[0]);
            store.filter('mob_incident_id', mobIncidentId);
            store.load(function () {
                storeIds.shift();
                me.filterChildStoresInSequence(mobIncidentId, storeIds, callbackFn, scope);
            }, me);
        }
    },

    /**
     * override
     */
    displayAddPanel: function (currentView) {
        var view = this.getModalAddPanel(currentView),
            record, mobIncidentId;

        // If the add panel is launched from the child witness
        // need to set the incident_id value for the new view.
        if (currentView.xtype === 'witnessListPanel') {
            mobIncidentId = currentView.getMobIncidentId();
            record = view.getRecord();
            record.set('mob_incident_id', mobIncidentId);
            record.set('witness_type', 'Employee');

            view.setMobIncidentId(mobIncidentId);
        }

        Ext.Viewport.add(view);
        view.show();
    },

    onShowGeneralView: function (view) {
        var record = view.getRecord();
        if (record.get('mob_incident_id')) {
            this.getDetailsViewButtonPicker().setHidden(false);
        } else {
            this.getDetailsViewButtonPicker().setHidden(true);
        }

    },

    onDeleteWitness: function () {
        var me = this,
            witnessPanel = me.getWitnessView(),
            witnessesStore = Ext.getStore('incidentWitnessesStore'),
            mobileWitnessId = witnessPanel.getRecord().getId(),
            record,
            deleteWitnessTitle = LocaleManager.getLocalizedString('Delete Witness',
                'IncidentReporting.controller.IncidentNavigation'),
            message = LocaleManager.getLocalizedString('Are you sure you want to delete this witness?',
                'IncidentReporting.controller.IncidentNavigation');

        Ext.Msg.confirm(deleteWitnessTitle, message, function (buttonId) {
            if (buttonId === 'yes') {
                witnessesStore.setDisablePaging(true);
                witnessesStore.load(function () {
                    witnessesStore.setDisablePaging(false);
                    record = witnessesStore.findRecord('id', mobileWitnessId);
                    witnessesStore.remove(record);
                    witnessesStore.sync(function () {
                        me.getMainView().pop();
                    }, me);
                });
            }
        });
    },

    onCopyIncident: function (button) {
        var me = this,
            listRecord = button.getRecord(),
            view,
            cancelButton;

        me.setDisableListTapEvent(true);

        view = me.getModalAddPanel(me.getIncidentList());

        cancelButton = view.down('#cancelButton');
        if (cancelButton) {
            cancelButton.addListener('tap', function () {
                me.setDisableListTapEvent(false);
            });
        }

        me.setLastPushedView(view.$className);

        view.setParentRecord(listRecord);

        Ext.Viewport.add(view);
        view.show();
    },

    onDeleteIncident: function (button) {
        var me = this, mobIncidentId,
            listRecord = button.getRecord(),
            deleteIncidentTitle = LocaleManager.getLocalizedString('Delete Incident',
                'IncidentReporting.controller.IncidentNavigation'),
            message = LocaleManager.getLocalizedString('Are you sure you want to delete this incident?',
                'IncidentReporting.controller.IncidentNavigation');

        me.setDisableListTapEvent(true);

        Ext.Msg.confirm(deleteIncidentTitle, message, function (buttonId) {
            if (buttonId === 'yes') {
                mobIncidentId = listRecord.get('mob_incident_id');

                //delete all witnesses and all documents
                me.deleteAllChildRecords(mobIncidentId, ['incidentWitnessesStore', 'documentsStore'], function () {
                    //delete the incident
                    me.doDeleteIncident(mobIncidentId, function () {
                        me.setDisableListTapEvent(false);
                    }, me);
                }, me);
            } else {
                me.setDisableListTapEvent(false);
            }
        });
    },

    //subfunction of onDeleteIncident
    /*
     Removes from the child stores all the records for the specified mobile incident id.
     */
    deleteAllChildRecords: function (mobIncidentId, storeIds, callbackFn, scope) {
        var me = this,
            store,
            onStoreSync = function () {
                storeIds.shift();
                me.deleteAllChildRecords(mobIncidentId, storeIds, callbackFn, scope);
            };

        if (Ext.isEmpty(storeIds) || storeIds.length === 0) {
            Ext.callback(callbackFn, scope || me);
        } else {
            store = Ext.getStore(storeIds[0]);
            store.clearFilter();
            store.filter('mob_incident_id', mobIncidentId);
            store.setDisablePaging(true);
            store.load(function (records) {
                store.setDisablePaging(false);
                store.remove(records);

                // function remove calls sync if store has autoSync=true
                if (store.getAutoSync()) {
                    onStoreSync();
                } else {
                    store.sync(function () {
                        Ext.callback(onStoreSync, me);
                    });
                }
            });
        }
    },

    //subfunction of onDeleteIncident
    /*
     Removes from incidents store the records for the specified mobile incident id.
     */
    doDeleteIncident: function (mobIncidentId, callbackFn, scope) {
        var me = this,
            incidentFilterArray = [],
            incidentsStore = Ext.getStore('incidentsStore');

        me.addFilterForField('mob_incident_id', mobIncidentId, incidentFilterArray);
        incidentsStore.suspendEvents();
        incidentsStore.retrieveRecord(incidentFilterArray, function (incidentRecord) {
            incidentsStore.remove(incidentRecord);
            incidentsStore.sync(function () {
                incidentsStore.load(function () {
                    incidentsStore.resumeEvents(true);
                    Ext.callback(callbackFn, scope || me);
                }, me);
            }, me);
        }, me);
    },

    onDropDownActionSelected: function (record) {
        var me = this,
            navBar = me.getNavigationBar(),
            currentView = navBar.getCurrentView(),
            fieldSet = currentView.getItems().get('locationFieldSet').getItems(),
            incidentRecord = currentView.getRecord(),
            emType, emId,
            errorTitle = LocaleManager.getLocalizedString('Reporter unavailable', 'IncidentReporting.controller.IncidentNavigation'),
            errorMessage = LocaleManager.getLocalizedString("Please first fill the 'Reported By' field.", "IncidentReporting.controller.IncidentNavigation");

        emType = record.get('action') === 'emLoc' ? 'em_id_affected' : 'reported_by';
        emId = incidentRecord.get(emType);

        if (emId) {
            me.setEmLocation(emId, fieldSet, currentView);
        } else if (emType === 'reported_by') {
            Ext.Msg.alert(errorTitle, errorMessage);
        }
    },

    setEmLocation: function (emId, fieldSet) {
        var me = this, emStore, blId,
            emFilterArray = [],
            errorTitle = LocaleManager.getLocalizedString('Location not defined', 'IncidentReporting.controller.IncidentNavigation'),
            errorMessage = LocaleManager.getLocalizedString("Employee {0} doesn't have a location defined.", "IncidentReporting.controller.IncidentNavigation");

        emStore = Ext.getStore('employeesStore');
        me.addFilterForField('em_id', emId, emFilterArray);
        emStore.retrieveRecord(emFilterArray, function (emRecord) {
            if (emRecord) {
                blId = emRecord.get('bl_id');
                if (blId) {
                    me.setBuildingLocation(blId, fieldSet, emRecord);
                } else {
                    Ext.Msg.alert(errorTitle, errorMessage.replace('{0}', emId));
                }
            }
        }, me);
    },

    setBuildingLocation: function (blId, fieldSet, emRecord) {
        var blStore, i,
            blFilterArray = [],
            blFieldNames = ['site_id', 'pr_id', 'bl_id'],
            emLocationFieldNames = ['fl_id', 'rm_id'];

        blStore = Ext.getStore('buildingsStore');
        this.addFilterForField('bl_id', blId, blFilterArray);
        blStore.retrieveRecord(blFilterArray, function (blRecord) {
            if (blRecord) {
                for (i = 0; i < blFieldNames.length; i++) {
                    fieldSet.get(blFieldNames[i]).setValue(blRecord.get(blFieldNames[i]));
                }
                for (i = 0; i < emLocationFieldNames.length; i++) {
                    fieldSet.get(emLocationFieldNames[i]).setValue(emRecord.get(emLocationFieldNames[i]));
                }
            }
        }, this);
    },

    getRecordCounts: function (record) {
        var incidentWitnessesStore = Ext.getStore('incidentWitnessesStore'),
            documentsStore = Ext.getStore('documentsStore');

        return {
            witnessesCount: record ? incidentWitnessesStore.getCount() : 0,
            documentsCount: record ? documentsStore.getCount() : 0
        };
    },

    setDetailListBadges: function () {
        var incidentRecord = this.getGeneralView().getRecord(),
            recordCounts = this.getRecordCounts(incidentRecord),
            detailButtonsStore = Ext.getStore('detailButtonsStore'),
            witnessRecord, documentsRecord;

        detailButtonsStore.load(function () {
            witnessRecord = detailButtonsStore.findRecord('view_name', 'Witness');
            witnessRecord.set('badge_value', recordCounts.witnessesCount);
            documentsRecord = detailButtonsStore.findRecord('view_name', 'Documents');
            documentsRecord.set('badge_value', recordCounts.documentsCount);
        });
    },

    onChangeAffectedEm: function (field, newValue) {
        this.getContactField().setHidden(!Ext.isEmpty(newValue));
        this.getNonEmNameField().setHidden(!Ext.isEmpty(newValue));
        this.getNonEmInfoField().setHidden(!Ext.isEmpty(newValue));

        if (Ext.isEmpty(newValue)) {
            this.getGeneralInstructionLabel().setHtml(this.getSelectOneFieldMessage());
            field.setRequired(false);
        } else {
            this.getGeneralInstructionLabel().setHtml(this.getClearAffectedEmMesssage());
            field.setRequired(true);
        }
    },

    onChangeContact: function (field, newValue) {
        this.getEmIdAffectedField().setHidden(!Ext.isEmpty(newValue));
        this.getNonEmNameField().setHidden(!Ext.isEmpty(newValue));
        this.getNonEmInfoField().setHidden(!Ext.isEmpty(newValue));

        if (Ext.isEmpty(newValue)) {
            this.getGeneralInstructionLabel().setHtml(this.getSelectOneFieldMessage());
            field.setRequired(false);
        } else {
            this.getGeneralInstructionLabel().setHtml(this.getClearContactMesssage());
            field.setRequired(true);
        }
    },

    onChangeNonEm: function () {
        var showNonEm = !Ext.isEmpty(this.getNonEmNameField().getValue()) || !Ext.isEmpty(this.getNonEmInfoField().getValue());

        this.getEmIdAffectedField().setHidden(showNonEm);
        this.getContactField().setHidden(showNonEm);

        if (showNonEm) {
            this.getGeneralInstructionLabel().setHtml(this.getClearNonEmMesssage());
            this.getNonEmNameField().setRequired(true);
        } else {
            this.getGeneralInstructionLabel().setHtml(this.getSelectOneFieldMessage());
            this.getNonEmNameField().setRequired(false);
        }
    },

    onChangeWitnessType: function (field, value) {
        this.getWitnessEmField().setRequired(value === 'Employee');

        if (value === 'Employee') {
            this.getWitnessContactField().setValue('');
            this.getWitnessNonEmField().setValue('');
            this.getWitnessNonEmInfoField().setValue('');
            this.getWitnessInstructionLabel().setHtml('');
        } else {
            this.getWitnessEmField().setValue('');
            this.getWitnessInstructionLabel().setHtml(this.getClearNonEmWitnessMessage());
        }

        this.getWitnessEmField().setHidden(value !== 'Employee');
        this.getWitnessContactField().setHidden(value === 'Employee');
        this.getWitnessNonEmField().setHidden(value === 'Employee');
        this.getWitnessNonEmInfoField().setHidden(value === 'Employee');
    },

    onChangeWitnessContact: function (field, newValue) {
        this.getWitnessNonEmField().setHidden(!Ext.isEmpty(newValue));
        this.getWitnessNonEmInfoField().setHidden(!Ext.isEmpty(newValue));

        field.setRequired(!Ext.isEmpty(newValue));

        if (Ext.isEmpty(newValue)) {
            this.getWitnessInstructionLabel().setHtml(this.getClearNonEmWitnessMessage());
        } else {
            this.getWitnessInstructionLabel().setHtml(this.getClearWitnessContactMessage());
        }
    },

    onChangeWitnessNonEm: function () {
        var showNonEm = !Ext.isEmpty(this.getWitnessNonEmField().getValue()) || !Ext.isEmpty(this.getWitnessNonEmInfoField().getValue());

        this.getWitnessContactField().setHidden(showNonEm);

        if (showNonEm) {
            this.getWitnessInstructionLabel().setHtml(this.getClearWitnessNonEmMessage());
            this.getWitnessNonEmField().setRequired(true);
        } else {
            this.getWitnessInstructionLabel().setHtml(this.getClearNonEmWitnessMessage());
            this.getWitnessNonEmField().setRequired(false);
        }
    }

});