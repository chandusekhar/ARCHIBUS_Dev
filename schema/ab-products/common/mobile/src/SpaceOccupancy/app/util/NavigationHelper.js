Ext.define('SpaceOccupancy.util.NavigationHelper', {
    singleton: true,

    /**
     * Update the highlight: highlight rooms that have date_last_surveyed and update room list by search criteria.
     */
    updateRoomHighlight: function (currentView, navigationScope) {
        var floorPlanView = navigationScope.getFloorPlanView(),
            activePlanType = floorPlanView.getPlanType(),
            surveyState = SurveyState.getSurveyState(),
            surveyId = surveyState.surveyId,
            floorPlanRecord = floorPlanView.getRecord(),
            blId = floorPlanRecord.get('bl_id'),
            flId = floorPlanRecord.get('fl_id'),
            roomSurveyStore = floorPlanView.query('roomslist')[0].getStore();

        if (activePlanType === SpaceOccupancy.util.Ui.getSurveyPlanType()) {
            SpaceOccupancy.util.RoomHighlight.updateSurveyPlanHighlights(surveyId, currentView.getRecord(), roomSurveyStore);
        }

        // load store filtered by surveyId needed for room list
        Space.SpaceSurvey.loadRoomSurveyStore('occupancyRoomSurveyStore', surveyId, blId, flId, function () {
            // updateRoomListSearch
            if (navigationScope.getFloorPlanSearchField()) {
                Space.Space.onSearch(navigationScope.getFloorPlanSearchField(), 'occupancyRoomSurveyStore',
                    ['rm_id', 'name']);
            }
        }, navigationScope);
    },

    /**
     * Update the badge for Workspace Transactions button. The button is displayed in the same screen with
     * the employee list for which a different restriction is applied on the the same store and the badge value
     * should not change when the restriction for the employee list is applied.
     */
    setWorspaceTransactionButtonBadge: function (worspaceTransactionButton, record, callbackFn, scope) {
        var me = scope || this,
            roomPctsStore = Ext.getStore('roomPctsStore');

        SpaceOccupancy.util.Filters.filterTransactionsListStore(record.get('survey_id'), record.get('bl_id'),
            record.get('fl_id'), record.get('rm_id'), function () {
                var transCount = roomPctsStore.getCount();
                if (worspaceTransactionButton) {
                    worspaceTransactionButton.setBadgeText(transCount.toString());
                }

                if (typeof callbackFn === 'function') {
                    callbackFn.call(me);
                }
            }, me);
    },

    saveTransactionEditForm: function (currentView, navigationScope) {
        var me = this,
            record = currentView.getRecord(),
            isCreateView,
            store,
            editTransactionView = navigationScope.getEditTrans();

        if (Ext.isEmpty(currentView.isCreateView)) {
            isCreateView = record.phantom;
        } else {
            isCreateView = currentView.isCreateView;
        }
        store = Ext.getStore(editTransactionView.getStoreId());

        if (record.isValid()) {
            me.saveTransactionRecord(record, store, isCreateView, navigationScope);
        } else {
            editTransactionView.displayErrors(record);
        }
    },

    /**
     * Save a new or a modified transaction record.
     */
    saveTransactionRecord: function (record, store, isCreateView, navigationScope) {
        var id,
            roomPctsStore = Ext.getStore('roomPctsStore'),
            autoSync = roomPctsStore.getAutoSync();

        record.setChangedOnMobile();
        if (isCreateView) {
            id = SurveyState.getNewTransactionId() + 1;
            record.set('pct_id', 'MID-' + id);
            SurveyState.setNewTransactionId(id);
        }

        roomPctsStore.setAutoSync(false);
        roomPctsStore.add(record);
        roomPctsStore.sync(function () {
            roomPctsStore.setAutoSync(autoSync);
            if (isCreateView) {
                Ext.Viewport.remove(navigationScope.getEditTrans());
                navigationScope.refreshRoomSurveyPanel();
            } else {
                navigationScope.getMainView().pop();
            }

        });
    },

    saveEditForm: function (form, callbackFn, scope) {
        var me = this,
            record = form.getRecord(),
            store = Ext.getStore(form.getStoreId()),
            autoSync = store.getAutoSync(),
            filterArray = [],
            errorTitle = LocaleManager.getLocalizedString('Duplicate record', 'SpaceOccupancy.util.NavigationHelper'),
            errorMessage = LocaleManager.getLocalizedString("A record with the same Employee Name already exists.",
                'SpaceOccupancy.util.NavigationHelper'),
            emIdFilter = new Ext.util.Filter({
                property: 'em_id',
                value: record.get('em_id')
            }),
            addRecord = function () {
                record.setChangedOnMobile();
                //KB3044880 - set autoSync to false to avoid issue in devices.
                store.setAutoSync(false);
                store.add(record);
                store.sync(function () {
                    store.setAutoSync(autoSync);
                    filterArray.push(SpaceOccupancy.util.Filters.getFilter('survey_id', record.get('survey_id')));
                    store.clearFilter();
                    store.setFilters(filterArray);
                    store.loadPage(1, callbackFn, scope || me);
                });
            };

        // Check validation
        if (record.isValid()) {
            // KB3045974 - check duplicates for new employee records
            if (form.xtype === 'employeeEdit' && record.phantom) {
                store.retrieveAllStoreRecords(emIdFilter, function (records) {
                    if (records.length > 0) {
                        Ext.Msg.alert(errorTitle, errorMessage);
                    } else {
                        addRecord();
                    }
                });
            } else {
                addRecord();
            }
        } else {
            form.displayErrors(record);
        }
    },

    /**
     * Set null values for employee fields bl_id, fl_id and rm_id.
     * @param record EmployeeList record
     * @param callbackFn callback function
     * @param scope scope for executing callback function
     */
    deletePrimaryEm: function (record, callbackFn, scope) {
        var me = this,
            filterArray = [],
            store = Ext.getStore('employeesSyncStore'),
            autoSync = store.getAutoSync(),
            employeeListStore = Ext.getStore('employeeListStore');

        filterArray.push(SpaceOccupancy.util.Filters.getFilter('em_id', record.get('em_id')));

        store.retrieveRecord(filterArray, function (emRecord) {
            emRecord.set('bl_id', '');
            emRecord.set('fl_id', '');
            emRecord.set('rm_id', '');
            store.setAutoSync(false);
            store.add(emRecord);
            store.sync(function () {
                store.setAutoSync(autoSync);
                employeeListStore.load(function () {
                    Ext.callback(callbackFn, scope || me);
                }, me);
            }, me);
        }, me);
    },

    /**
     * Set end date to workspace transaction.
     */
    deleteTransaction: function (record, navigationScope, callbackFn, fnScope) {
        var me = this,
            filterArray = [],
            store = Ext.getStore('roomPctsStore'),
            currentDate,
            errorTitle = LocaleManager.getLocalizedString('Error', 'SpaceOccupancy.util.NavigationHelper'),
            errorMessage = LocaleManager.getLocalizedString("Can't delete this record in this view. Please delete the record from the room or employee survey forms or from Web Central.",
                'SpaceOccupancy.util.NavigationHelper');

        filterArray.push(SpaceOccupancy.util.Filters.getFilter('pct_id', record.get('pct_id')));

        store.retrieveRecord(filterArray, function (recordToDelete) {
            if (recordToDelete && recordToDelete.get('primary_rm') === 0 && recordToDelete.get('primary_em') === 0) {
                currentDate = SpaceOccupancy.util.Ui.getCurrentDateValue();
                recordToDelete.setProxy(store.getProxy());
                recordToDelete.set({'date_end': currentDate});
                recordToDelete.set({'mob_is_changed': 1});
                recordToDelete.save(callbackFn, fnScope || me);
            } else {
                Ext.Msg.alert(errorTitle, errorMessage);
            }
        }, navigationScope);
    },

    /**
     * Display the edit transaction view for adding a new transaction or populated with an existing record.
     */
    showEditTransactionForm: function (list, record, isNewRecord, navigationScope) {
        var me = this,
            pctId,
            transactionRecord,
            roomPctsStore = Ext.getStore('roomPctsStore'),
            editTransView,
            titlebar,
            mainView = navigationScope.getMainView();

        if (isNewRecord) {
            editTransView = navigationScope.getModalAddPanel(list);

            titlebar = editTransView.down('titlebar');
            titlebar.add(Ext.create('Common.control.button.Toolbar', {
                iconCls: 'add',
                action: 'createEm',
                displayOn: 'all',
                align: 'right'
            }));

            transactionRecord = SpaceOccupancy.util.Ui.createTransactionRecord(record);
            editTransView.setRecord(transactionRecord);

            Ext.Viewport.add(editTransView);
            editTransView.show();

            // refresh room survey view for updating lists and button badge
            navigationScope.onDisplayView(mainView, editTransView);

        } else {
            editTransView = Ext.create('SpaceOccupancy.view.TransactionCarousel', {
                isCreateView: isNewRecord
            }, navigationScope || me);

            if (record instanceof SpaceOccupancy.model.RoomPct) {
                //tap on transactions list item
                transactionRecord = record;
            } else {
                //tap on employee, department or category list item
                pctId = record.get('pct_id');
                transactionRecord = roomPctsStore.findRecord('pct_id', pctId);
            }

            editTransView.setRecord(transactionRecord);
            mainView.push(editTransView);
        }

    },

    /**
     * Display the edit employee view.
     */
    showEditEmpoyeeForm: function (record, isNewRecord, navigationScope) {
        var me = this,
            emId,
            filterArray = [],
            employeesSyncStore = Ext.getStore('employeesSyncStore'),
            editTransView,
            mainView = navigationScope.getMainView(),
            currentView;

        //filter employee store for carousel
        filterArray = Space.Space.getFilterArray(record.get('bl_id'), record.get('fl_id'), record.get('rm_id'), SurveyState.getSurveyState().surveyId);
        employeesSyncStore.setFilters(filterArray);

        employeesSyncStore.load(function () {
            if (isNewRecord) {
                currentView = navigationScope.getEmployeeList();
                currentView.config.addViewClass = 'SpaceOccupancy.view.EmployeeEdit';
                editTransView = navigationScope.getModalAddPanel(currentView);

                editTransView.setRecord(record);
                Ext.Viewport.add(editTransView);
                editTransView.show();
            } else {
                editTransView = Ext.create('SpaceOccupancy.view.EmployeeCarousel', {
                    isCreateView: isNewRecord
                }, navigationScope || me);

                emId = record.get('em_id');
                filterArray = [];
                filterArray.push(SpaceOccupancy.util.Filters.getFilter('em_id', emId));

                employeesSyncStore.retrieveRecord(filterArray, function (employeeRecord) {
                    editTransView.setRecord(employeeRecord);
                    mainView.push(editTransView);
                }, me);
            }

        }, me);
    },

    /**
     * Set the transactions list header with Even button.
     */
    showListHeaderWithEvenBtn: function (totalPct) {
        var transactionInfoElement, newHtmlText;

        transactionInfoElement = Ext.ComponentQuery.query('[xtype=transactionListHeader]')[0].getTransactionInfo();
        if (Ext.os.is.Phone) {
            newHtmlText = ['<div class="prompt-list-hbox total-list-header">',
                '<h1 style="width:25%;text-align:right">' + LocaleManager.getLocalizedString('Total', 'SpaceOccupancy.util.NavigationHelper') + '</h1>',
                '<h1 style="width:20%;text-align:center">',
                totalPct,
                ' ' + LocaleManager.getLocalizedString('%', 'SpaceOccupancy.util.NavigationHelper') + ' </h1>',
                '<div class="button-item" id="evenButton" onClick="SpaceOccupancy.util.NavigationHelper.evenButtonTap();"><span class="x-button-label">',
                LocaleManager.getLocalizedString('Even %', 'SpaceOccupancy.util.NavigationHelper') + '</span></div></div>',

                '<div class="prompt-list-hbox">',
                '<h1 style="width:25%;text-align:right;"> ' + LocaleManager.getLocalizedString('Transaction #', 'SpaceOccupancy.util.NavigationHelper') + ' </h1>',
                '<h1 style="width:20%;text-align:center;">' + LocaleManager.getLocalizedString('%', 'SpaceOccupancy.util.NavigationHelper') + '</h1>',
                '<h1 style="width:55%;text-align:left;"> ' + LocaleManager.getLocalizedString('Division/ Department', 'SpaceOccupancy.util.NavigationHelper') + '<br />',
                LocaleManager.getLocalizedString('Category/ Type', 'SpaceOccupancy.util.NavigationHelper') + '<br />',
                LocaleManager.getLocalizedString('Employee', 'SpaceOccupancy.util.NavigationHelper') + '</h1>',
                '</div>'
            ].join('');
        } else {
            newHtmlText = ['<div class="prompt-list-hbox total-list-header">',
                '<h1 style="width:10%;text-align:right">' + LocaleManager.getLocalizedString('Total', 'SpaceOccupancy.util.NavigationHelper') + '</h1>',
                '<h1 style="width:10%;text-align:center">',
                totalPct,
                ' ' + LocaleManager.getLocalizedString('%', 'SpaceOccupancy.util.NavigationHelper') + ' </h1>',
                '<div class="button-item" id="evenButton" onClick="SpaceOccupancy.util.NavigationHelper.evenButtonTap();"><span class="x-button-label">',
                LocaleManager.getLocalizedString('Even %', 'SpaceOccupancy.util.NavigationHelper') + '</span></div></div>',

                '<br /><div class="prompt-list-hbox" style="padding: 0 1.5em;">',
                '<h1 style="width:10%;text-align:right;"> ' + LocaleManager.getLocalizedString('Transaction #', 'SpaceOccupancy.util.NavigationHelper') + ' </h1>',
                '<h1 style="width:10%;text-align:center;">' + LocaleManager.getLocalizedString('%', 'SpaceOccupancy.util.NavigationHelper') + '</h1>',
                '<h1 style="width:40%;text-align:left;"> ' + LocaleManager.getLocalizedString('Division/ Department', 'SpaceOccupancy.util.NavigationHelper') + '<br />',
                LocaleManager.getLocalizedString('Category/ Type', 'SpaceOccupancy.util.NavigationHelper') + '</h1>',
                '<h1 style="width:40%;text-align:left;">' + LocaleManager.getLocalizedString('Employee', 'SpaceOccupancy.util.NavigationHelper') + '</h1>',
                '</div>'
            ].join('');
        }

        transactionInfoElement.setHtml(newHtmlText);
    },

    /**
     * Handle Even button tap.
     */
    evenButtonTap: function () {
        var me = this,
            roomPctsStore = Ext.getStore('roomPctsStore');

        if (roomPctsStore.getAllCount() > 0) {
            //store is already filtered for display in the list
            roomPctsStore.load(function (records) {
                me.updateRecordsWithEvenPercentages(records, me);
            }, me);
        }
    },

    /**
     * Calculate and set even percentages values for records.
     */
    //sub-function of evenButtonTap
    updateRecordsWithEvenPercentages: function (records, scope) {
        var me = Ext.isEmpty(scope) ? this : scope,
            len = records.length, value,
            splitPct = Math.round(100 / len * 100) / 100,
            exactSplit = (splitPct * len === 100),
            fixedDifference = exactSplit,
            difference = 100 - splitPct * len;

        Ext.each(records, function (record) {
            if (!fixedDifference) {
                value = Math.round((splitPct + difference) * 100) / 100;
                record.set('pct_space', value);
                fixedDifference = true;
            } else {
                record.set('pct_space', splitPct);
            }
            me.updateTotalPct(records);
        });
    },

    /**
     * Calculate and display the total of percentages.
     */
    updateTotalPct: function (records) {
        var totalPct = 0,
            i;
        for (i = 0; i < records.length; i++) {
            totalPct += records[i].get('pct_space');
        }
        totalPct = Math.round(totalPct * 100) / 100;
        this.showListHeaderWithEvenBtn(totalPct);
    },

    onPromptClearIconTap: function (store, form, fields) {
        var autoSync = store.getAutoSync(),
            record = form.getRecord(),
            i;

        if (record) {
            store.setAutoSync(false);
            for (i = 0; i < fields.length; i++) {
                record.set(fields[i], '');
            }
            store.setAutoSync(autoSync);
            form.setRecord(record);
        }
    }

});