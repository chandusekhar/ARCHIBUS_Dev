Ext.define('SpaceOccupancy.controller.Navigation', {
    extend: 'Space.controller.Navigation',

    requires: [
        'Space.view.report.Configuration',
        'Common.view.report.Detail',
        'Common.sync.Manager'
    ],

    config: {
        refs: {
            mainView: 'mainview',
            roomsList: 'roomslist',
            surveyPanel: 'spaceOccupRoomSurveyPanel',
            workspaceTransBtn: 'segmentedbutton #workspaceTransBtn',
            employeeList: 'spaceOccupRoomSurveyPanel employeeList',
            departmentList: 'spaceOccupRoomSurveyPanel departmentList',
            categoryList: 'spaceOccupRoomSurveyPanel categoryList',
            employeePromptListPanel: 'employeePromptList',
            roomSurveyPromptListPanel: 'roomSurveyPromptList',
            transactionList: 'transactionList',
            editTrans: 'transactionEdit',
            editTransactionForm: 'transactionEdit transactionForm',
            employeeEdit: 'employeeEdit',
            planTypeButtonPicker: 'mainview buttonpicker[itemId=planTypePicker]',
            surveyActionButtonPicker: 'mainview buttonpicker[itemId=surveyActionPicker]',
            homeButton: 'button[action=goToHomePage]',
            appsButton: 'button[action=backToAppLauncher]',
            downloadDataButton: 'button[itemId=downloadData]',
            downloadActionPicker: 'mainview buttonpicker[itemId=downloadActionPicker]',
            completeRoomSurveyButton: 'button[action=completeRoomSurvey]',
            roomCapacityField: 'spaceOccupRoomSurveyPanel roomForm localizedspinnerfield[name="cap_em"]',
            divisionField: 'spaceOccupRoomSurveyPanel roomForm divisionPrompt',
            categoryField: 'spaceOccupRoomSurveyPanel roomForm roomCategoryPrompt',
            transactionDivisionField: 'transactionEdit transactionForm divisionPrompt',
            transactionCategoryField: 'transactionEdit transactionForm roomCategoryPrompt',
            employeeDivisionField: 'employeeEdit divisionPrompt',
            carousel: 'swipecarousel',
            redlineButton: 'button[action=openRedline]',
            emPromptSearchField: 'employeePromptList search',
            floorPlanTitleBar: 'floorPlanPanel > titlebar',

            // used in NavigationHelper
            floorPlanSearchField: 'floorPlanPanel search'
        },

        control: {
            mainView: {
                pop: 'onViewPopped',
                push: 'onViewPushed'
            },
            floorListView: {
                listitemtap: 'onFloorListTapped'
            },
            workspaceTransBtn: {
                tap: 'onWorkspaceTransactionsBtnTap'
            },
            surveyPanel: {
                show: 'onShowSurveyPanel'
            },
            employeeList: {
                itemtap: 'onTransactionSublistTap'
            },
            departmentList: {
                itemtap: 'onTransactionSublistTap'
            },
            categoryList: {
                itemtap: 'onTransactionSublistTap'
            },
            transactionList: {
                show: 'onShowTransactionList',
                itemtap: 'onTransactionSublistTap'
            },
            editTrans: {
                destroy: function () {
                    this.setDisableTransactionListTapEvent(false);
                }
            },
            employeeEdit: {
                destroy: function () {
                    var me = this,
                        roomRecord = me.getSurveyPanel().getRecord(),
                        currentView = me.getMainView().getNavigationBar().getCurrentView();

                    if (currentView.xtype === 'roomcarousel') {
                        SpaceOccupancy.util.Filters.filterTransactionSublist(roomRecord, 'em', function () {
                            me.setDisableTransactionListTapEvent(false);
                        });
                    }
                }
            },
            'button[action=displayRoomInfo]': {
                tap: 'onDisplayRoomInfo'
            },
            'button[action=displayEmployeeInfo]': {
                tap: 'onDisplayEmployeesInfo'
            },
            'button[action=displayTransactionInfo]': {
                tap: 'onDisplayTransactionInfo'
            },
            progressbarpanel: {
                cancel: function () {
                    Space.SpaceDownload.onCancelProgress();
                },
                complete: function () {
                    Space.SpaceDownload.onCompleteProgress();
                }
            },
            completeRoomSurveyButton: {
                tap: 'onCompleteRoomSurvey'
            },
            'button[action=addEmTrans]': {
                tap: 'addEmTransaction'
            },
            'button[action=createEm]': {
                tap: 'createEm'
            },
            'button[action=addDvTrans]': {
                tap: function () {
                    var roomRecord = this.getCarousel().getDisplayedView().getRecord(),
                        list = this.getDepartmentList();
                    SpaceOccupancy.util.NavigationHelper.showEditTransactionForm(list, roomRecord, true, this);
                }
            },
            'button[action=addCatTrans]': {
                tap: function () {
                    var roomRecord = this.getCarousel().getDisplayedView().getRecord(),
                        list = this.getCategoryList();
                    SpaceOccupancy.util.NavigationHelper.showEditTransactionForm(list, roomRecord, true, this);
                }
            },
            'button[action=addTransaction]': {
                tap: function () {
                    var roomRecord = this.getCarousel().getDisplayedView().getRecord(),
                        list = this.getTransactionList();
                    SpaceOccupancy.util.NavigationHelper.showEditTransactionForm(list, roomRecord, true, this);
                }
            },
            'button[action=doneEmployeeEdit]': {
                tap: 'onDoneEmployeeEdit'
            },

            'button[action=saveTransaction]': {
                tap: 'onSaveTransaction'
            },

            employeePromptListPanel: {
                itemtap: 'addEmployeeFromPromptList'
            },
            'image[action=deleteEm]': {
                tap: 'onDeleteEmployee'
            },
            'image[action=deleteDv]': {
                tap: 'onDeleteDepartmentOrCategory'
            },
            'image[action=deleteCat]': {
                tap: 'onDeleteDepartmentOrCategory'
            },
            'image[action=deleteTrans]': {
                tap: 'onDeleteTransaction'
            },
            roomCapacityField: {
                spin: function () {
                    this.onRoomCapacityUpdate(true);
                },
                change: function () {
                    this.onRoomCapacityUpdate(false);
                },
                keyup: function () {
                    this.setRoomCapacityInEditMode(true);
                },
                clearicontap: function () {
                    this.setRoomCapacityInEditMode(true);
                }
            },
            divisionField: {
                clearicontap: function () {
                    var roomSurveyStore = Ext.getStore('occupancyRoomSurveyStore');
                    SpaceOccupancy.util.NavigationHelper.onPromptClearIconTap(roomSurveyStore, this.getCarousel().getDisplayedView(), ['dv_id', 'dp_id']);
                }
            },
            categoryField: {
                clearicontap: function () {
                    var roomSurveyStore = Ext.getStore('occupancyRoomSurveyStore');
                    SpaceOccupancy.util.NavigationHelper.onPromptClearIconTap(roomSurveyStore, this.getCarousel().getDisplayedView(), ['rm_cat', 'rm_type']);
                }
            },
            transactionDivisionField: {
                clearicontap: function () {
                    var roomPctsStore = Ext.getStore('roomPctsStore');
                    SpaceOccupancy.util.NavigationHelper.onPromptClearIconTap(roomPctsStore, this.getEditTransactionForm(), ['dv_id', 'dp_id']);
                }
            },
            transactionCategoryField: {
                clearicontap: function () {
                    var roomPctsStore = Ext.getStore('roomPctsStore');
                    SpaceOccupancy.util.NavigationHelper.onPromptClearIconTap(roomPctsStore, this.getEditTransactionForm(), ['rm_cat', 'rm_type']);
                }
            },
            employeeDivisionField: {
                clearicontap: function () {
                    var employeesSyncStore = Ext.getStore('employeesSyncStore');
                    SpaceOccupancy.util.NavigationHelper.onPromptClearIconTap(employeesSyncStore, this.getEmployeeEdit(), ['dv_id', 'dp_id']);
                }
            },
            carousel: {
                viewischanging: 'onRoomSurveyViewChange'
            },
            emPromptSearchField: {
                searchkeyup: function (value) {
                    SpaceOccupancy.util.Filters.onApplyEmPromptFilter(value);
                },
                searchclearicontap: function () {
                    SpaceOccupancy.util.Filters.onClearEmPromptFilter();
                }
            },

            downloadActionPicker: {
                itemselected: 'selectActionListItem'
            }
        },

        errorTitle: LocaleManager.getLocalizedString('Error', 'SpaceOccupancy.controller.Navigation'),

        deleteEmTitle: LocaleManager.getLocalizedString('Delete employee location',
            'SpaceOccupancy.controller.Navigation'),

        deleteEmMessage: LocaleManager.getLocalizedString('Are you sure you want to delete this employee from this room?',
            'SpaceOccupancy.controller.Navigation'),

        deleteDpCatTitle: LocaleManager.getLocalizedString('Delete',
            'SpaceOccupancy.controller.Navigation'),

        deleteDpCatMessage: LocaleManager.getLocalizedString('Are you sure you want to delete this transaction?',
            'SpaceOccupancy.controller.Navigation'),

        noEmText: LocaleManager.getLocalizedString('There is no employee assigned to this room.',
            'SpaceOccupancy.controller.Navigation'),

        noEmPreSurveyText: LocaleManager.getLocalizedString('Pre-survey employee information is not available for this room.',
            'SpaceOccupancy.controller.Navigation'),

        noTransactionText: LocaleManager.getLocalizedString('There is no transaction for this room.',
            'SpaceOccupancy.controller.Navigation'),

        moveEmTitle: LocaleManager.getLocalizedString('Different employee location.',
            'SpaceOccupancy.controller.Navigation'),

        moveEmMessage: LocaleManager.getLocalizedString('This employee is currently assigned to building {0}, floor {1} and room {2}. Do you want to move this employee to the new location?',
            'SpaceOccupancy.controller.Navigation'),

        useAboveFormMessage: LocaleManager.getLocalizedString('Use the form above to edit primary room information.', 'SpaceOccupancy.controller.Navigation'),

        //for sites, buildings and floors lists
        disableListTapEvent: false,

        //for transaction lists
        disableTransactionListTapEvent: false,

        roomCapacityInEditMode: false
    },

    /**
     * Display existing survey in drop down menu.
     */
    launch: function () {
        SpaceOccupancy.util.Ui.setActionPicker(this.getDownloadActionPicker());
    },

    onFloorListTapped: function (list, index, target, record) {
        var me = this,
            blId = record.get('bl_id'),
            flId = record.get('fl_id');

        list.setEditViewClass('Space.view.FloorPlan');

        me.getPlanTypeButtonPicker().setStore('spaceOccupancyPlanTypes');
        SpaceOccupancy.util.Filters.filterPlanTypes(function () {
            //onViewPushed the highlight is updated and the permanent filter is set
            Space.Space.setPermanentFilterForFields(['bl_id', 'fl_id'], [blId, flId], 'roomsStore', [], function () {
                me.displayUpdatePanel(list, record);
                me.getRoomsList().refresh();
            }, me);
        }, me);
    },

    onViewPopped: function (navView) {
        var navBar = this.getNavigationBar(),
            currentView = navBar.getCurrentView();

        this.callParent(arguments);

        if (currentView.xtype === 'floorPlanPanel') {
            this.updateFloorPlanViewTitle(currentView);
        }

        this.onDisplayView(navView, currentView);

        if (currentView.xtype === 'roomcarousel') {
            this.refreshRoomSurveyPanel();
        }
    },

    refreshRoomSurveyPanel: function () {
        var roomSurveyPanel = this.getSurveyPanel(),
            index,
            roomCarousel,
            roomSurveyRecord;

        this.onShowSurveyPanel(roomSurveyPanel);

        roomCarousel = this.getCarousel();
        index = roomCarousel.getViewIndex();
        roomSurveyRecord = Ext.getStore('occupancyRoomSurveyStore').getAt(index);
        SpaceOccupancy.util.Filters.applyFiltersOnRoomSurveyPanel(roomCarousel.getDisplayedView(), roomSurveyRecord);
    },

    onViewPushed: function (navView, view) {
        this.onDisplayView(navView, view);
    },

    //subfunction for onViewPopped and onViewPushed
    onDisplayView: function (navView, view) {
        var navBar = navView.getNavigationBar(),
            saveButton = navBar.getSaveButton(),
            addButton = navBar.getAddButton(),
            record;

        if (view.xtype === 'floorPlanPanel') {
            this.getApplication().getController('SpaceOccupancy.controller.Survey').setSurveyButtonVisibility();
            SpaceOccupancy.util.NavigationHelper.updateRoomHighlight(view, this);
        }

        this.showHidePlanTypeButton(view);

        this.getSurveyActionButtonPicker().setHidden(view.xtype !== 'floorPlanPanel');

        this.getRedlineButton().setHidden(!(view.xtype === 'floorPlanPanel'
            || view.xtype === 'roomcarousel') || !SurveyState.getSurveyState().isSurveyActive);

        this.getHomeButton().setHidden(view.xtype === 'mainview' || view.xtype === 'sitePanel');
        this.getAppsButton().setHidden(view.xtype !== 'mainview');
        this.getDownloadDataButton().setHidden(view.xtype !== 'mainview');
        this.getDownloadActionPicker().setHidden(view.xtype !== 'mainview' && view.xtype !== 'sitePanel' && view.xtype !== 'floorsListPanel');

        if (view.xtype === 'transactionList') {
            //apply filter on transaction list store
            record = this.getCarousel().getDisplayedView().getRecord();
            if (record) {
                SpaceOccupancy.util.Filters.filterTransactionsListStore(record.get('survey_id'), record.get('bl_id'),
                    record.get('fl_id'), record.get('rm_id'));
            }
        } else if (view.xtype === 'employeeEdit') {
            //show add button
            addButton.setHidden(view.getIsCreateView());
        } else {
            //show add button
            addButton.setHidden(true);
        }

        if (view.xtype === 'transactionEdit' || view.xtype === 'employeeEdit') {
            saveButton.setHidden(!view.getIsCreateView());
        } else {
            saveButton.setHidden(true);
        }
    },

    showHidePlanTypeButton: function (view) {
        var selectedFloorPlanViewTab;

        if (view.xtype === 'floorPlanPanel') {
            selectedFloorPlanViewTab = view.down('segmentedbutton').getPressedButtons()[0].getItemId();
            this.getPlanTypeButtonPicker().setHidden(selectedFloorPlanViewTab === 'roomList');
        } else {
            this.getPlanTypeButtonPicker().setHidden(true);
        }
    },

    updateFloorPlanViewTitle:function(view){
        var selectedFloorPlanViewTab,
            planTypeRecord;

        selectedFloorPlanViewTab = view.down('segmentedbutton').getPressedButtons()[0].getItemId();
        if(selectedFloorPlanViewTab === 'roomList'){
            Space.SpaceFloorPlan.showPlanTypeInTitle(this.getFloorPlanTitleBar(), null, false);
        }else{
            planTypeRecord = Space.SpaceFloorPlan.getPlanTypeRecord(this.getPlanTypeButtonPicker());
            Space.SpaceFloorPlan.showPlanTypeInTitle(this.getFloorPlanTitleBar(), planTypeRecord, true);
        }
    },

    /**
     * @override
     */
    displayUpdatePanel: function (view, record) {
        // Views are created when displayed and destroyed when
        // removed from the navigation view.
        var editView = view.getEditViewClass(),
            updateView = Ext.create(editView);


        if (updateView.isNavigationList) {
            if (typeof updateView.setParentId === 'function') {
                if (updateView.xtype === 'sitePanel') {
                    updateView.setParentId(record.get('site_id'));
                }
                if (updateView.xtype === 'floorsListPanel') {
                    updateView.setParentId(record.get('bl_id'));
                }
            }
        } else if (updateView.isFloorPlanPanel) {
            // Retrieve drawing data for the selected floor
            this.setDefaultPlanTypeRecord();
            Space.SpaceFloorPlan.loadFloorPlanData(updateView, record, this.getPlanTypeButtonPicker(), false);
        } else {
            updateView.setRecord(record);
        }

        this.getMainView().push(updateView);
    },

    setDefaultPlanTypeRecord: function () {
        var planTypeStore = Ext.getStore('planTypes'),
            spaceOccupancyPlanTypes = Ext.getStore('spaceOccupancyPlanTypes'),
            planTypeRecord,
            planType;

        if (spaceOccupancyPlanTypes && spaceOccupancyPlanTypes.getData().length > 0) {
            planType = spaceOccupancyPlanTypes.getData().get(0).get('plan_type');
            if (planType) {
                planTypeRecord = planTypeStore.findRecord('plan_type', planType);
                this.getPlanTypeButtonPicker().setValue(planTypeRecord);
            }
        }
    },

    /**
     * @override
     */
    displayAddPanel: function (currentView) {
        var me = this,
            transactionRecord,
            roomSurveyRecord = me.getSurveyPanel().getRecord(),
            form;

        if (currentView.xtype === 'transactionList') {
            me.callParent(arguments);
            transactionRecord = SpaceOccupancy.util.Ui.createTransactionRecord(roomSurveyRecord);
            form = this.getEditTrans();
            form.setRecord(transactionRecord);
        } else {
            me.callParent(arguments);
        }
    },

    /**
     * Override the function from class Common.controller.NavigationController.
     */
    saveEditPanel: function (currentView) {
        var me = this;

        if (currentView.xtype === 'transactionEdit' || currentView.xtype === 'transactioncarousel') {
            SpaceOccupancy.util.NavigationHelper.saveTransactionEditForm(currentView, me);
        } else {
            SpaceOccupancy.util.NavigationHelper.saveEditForm(currentView, function () {
                if (currentView.getIsCreateView()) {
                    Ext.Viewport.remove(currentView);
                } else {
                    me.getMainView().pop();
                }
            }, me);
        }
    },

    /**
     * Return the user to the previous screen auto-saving any edits.
     */
    onDoneEmployeeEdit: function () {
        var form = this.getEmployeeEdit();

        this.saveEditPanel(form);
    },

    /**
     * Return the user to the previous screen auto-saving any edits.
     */
    onSaveTransaction: function () {
        this.saveEditPanel(this.getMainView().getNavigationBar().getCurrentView());
    },

    onShowSurveyPanel: function () {
        var currentView = this.getMainView().getNavigationBar().getCurrentView(),
            divisionPrompt = currentView.query('divisionPrompt')[0],
            roomCategoryPrompt = currentView.query('roomCategoryPrompt')[0],
            departmentsStore = Ext.getStore('departmentsStore'),
            roomTypesStore = Ext.getStore('roomTypesStore');

        if (SurveyState.getWorkspaceTransactionsEnabled()) {
            this.setDisableTransactionListTapEvent(false);
        } else {
            this.setDisableTransactionListTapEvent(false);
        }

        // KB3046838 - department and room type prompt fields remained filtered because they are used also in Edit Employee panel or Edit Transaction panel.
        if (divisionPrompt) {
            if (Ext.isEmpty(divisionPrompt.getValue())) {
                departmentsStore.clearFilter();
                departmentsStore.loadPage(1);
            } else {
                divisionPrompt.setChildFilter(divisionPrompt.getValue());
            }
        }
        if (roomCategoryPrompt) {
            if (Ext.isEmpty(roomCategoryPrompt.getValue())) {
                roomTypesStore.clearFilter();
                roomTypesStore.loadPage(1);
            } else {
                roomCategoryPrompt.setChildFilter(roomCategoryPrompt.getValue());
            }
        }
    },

    onTransactionSublistTap: function (list, index, target, record, e) {
        var isListTapEventDisabled = this.getDisableTransactionListTapEvent();

        if (isListTapEventDisabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
        } else {
            this.setDisableTransactionListTapEvent(true);
        }

        if (record instanceof SpaceOccupancy.model.EmployeeList) {
            if (record.get('primary_em') === '1') {
                SpaceOccupancy.util.NavigationHelper.showEditEmpoyeeForm(record, false, this);
            } else {
                SpaceOccupancy.util.NavigationHelper.showEditTransactionForm(list, record, false, this);
            }
        } else if (record instanceof SpaceOccupancy.model.DepartmentList || record instanceof SpaceOccupancy.model.CategoryList) {
            if (record.get('primary_rm') === '1') {
                // Tap on primary dp/cat list item will display a message
                Ext.Msg.alert('', this.getUseAboveFormMessage());
                this.setDisableTransactionListTapEvent(false);
            } else {
                SpaceOccupancy.util.NavigationHelper.showEditTransactionForm(list, record, false, this);
            }
        } else {
            SpaceOccupancy.util.NavigationHelper.showEditTransactionForm(list, record, false, this);
        }
    },

    onShowTransactionList: function () {
        //set title
        var record = this.getSurveyPanel().getRecord(),
            roomPctsStore = Ext.getStore('roomPctsStore'),
            totalPct = 0,
            i;

        if (record) {
            SpaceOccupancy.util.Ui.displayRoomTitle(this.getTransactionList(), record);
        }

        roomPctsStore.load(function (records) {
            for (i = 0; i < records.length; i++) {
                totalPct += records[i].get('pct_space');
            }
            totalPct = Math.round(totalPct * 100) / 100;

            SpaceOccupancy.util.NavigationHelper.showListHeaderWithEvenBtn(totalPct);
        }, this);

    },

    onDisplayRoomInfo: function () {
        var me = this,
            roomSurveyRecord = me.getSurveyPanel().getRecord(),
            roomLocations = roomSurveyRecord.getLocationFields(),
            store = Ext.getStore('roomsReportStore'),
            filterArray,
            reportConfig = Space.view.report.Configuration.getRoomReportConfig();

        filterArray = Space.Space.getFilterArray(roomLocations.bl_id, roomLocations.fl_id, roomLocations.rm_id);

        store.retrieveRecord(filterArray, function (record) {
            var config = {},
                detailView;

            Ext.apply(config, {record: record}, reportConfig);

            detailView = Ext.create('Common.view.report.Detail', config);
            detailView.show();
        }, me);
    },

    onDisplayEmployeesInfo: function () {
        var me = this,
            roomSurveyRecord = me.getSurveyPanel().getRecord(),
            employeesStore = Ext.getStore('employeesReportStore'),
            filterArray,
            emFilterArray = [],
            employeeListStore = Ext.getStore('employeeListStore'),
            reportConfig = Space.view.report.Configuration.getEmployeeReportConfiguration(),
            detailView = Ext.create('Common.view.report.Detail', reportConfig);

        detailView.setStore('employeesReportStore');
        filterArray = SpaceOccupancy.util.Filters.getSurveyLocationFilterArray(roomSurveyRecord);

        employeeListStore.retrieveAllStoreRecords(filterArray, function (records) {
            if (records && records.length > 0) {
                emFilterArray = me.getEmployeesFilterArray(records);
                employeesStore.clearFilter();
                employeesStore.setDisablePaging(true);
                employeesStore.setFilters(emFilterArray);
                employeesStore.load(function () {
                    employeesStore.setDisablePaging(false);
                    detailView.show();
                }, me);
            } else {
                Ext.Msg.alert('', me.getNoEmText());
            }
        }, me);
    },

    getEmployeesFilterArray: function (records) {
        var emFilter,
            emFilterValue,
            subFilterArray = [],
            emFilterArray = [],
            i;

        emFilter = Ext.create('Common.util.Filter', {
            property: 'dummyProperty',
            value: 'dummyValue',
            conjunction: 'AND',
            exactMatch: true
        });
        for (i = 0; i < records.length; i++) {
            emFilterValue = {
                property: 'em_id',
                value: records[i].get('em_id'),
                conjunction: 'OR'
            };
            subFilterArray.push(emFilterValue);
        }

        emFilter.setSubFilter(subFilterArray);
        emFilterArray.push(emFilter);

        return emFilterArray;
    },

    onDisplayTransactionInfo: function () {
        var me = this,
            roomPctsStore = Ext.getStore('roomPctsStore'),
            report;

        if (roomPctsStore.getCount() > 0) {
            report = Ext.create('SpaceOccupancy.view.TransactionsReport');
            Ext.Viewport.add(report);
            report.show();
        } else {
            Ext.Msg.alert(me.getErrorTitle(), me.getNoTransactionText());
        }
    },

    onCompleteRoomSurvey: function () {
        var roomSurveyView = this.getCarousel().getDisplayedView().down('roomForm'),
            roomSurveyRecord = roomSurveyView.getRecord(),
            currentDate = SpaceOccupancy.util.Ui.getCurrentDateValue();

        roomSurveyRecord.set('date_last_surveyed', currentDate);

        this.saveEditPanel(roomSurveyView);
    },

    onDeleteEmployee: function (button) {
        var me = this,
            record = button.getRecord(),
            list = me.getEmployeeList();

        me.setDisableTransactionListTapEvent(true);

        Ext.Msg.confirm(me.getDeleteEmTitle(), me.getDeleteEmMessage(),
            function (buttonId) {
                if (buttonId === 'yes') {
                    if (record.get('primary_em') === '1') {
                        SpaceOccupancy.util.NavigationHelper.deletePrimaryEm(record, function () {
                            me.setDisableTransactionListTapEvent(false);
                        }, me);
                    } else {
                        SpaceOccupancy.util.NavigationHelper.showEditTransactionForm(list, record, false, me);
                        me.setDisableTransactionListTapEvent(false);
                    }
                } else {
                    me.setDisableTransactionListTapEvent(false);
                }
            }
        );
    },

    onDeleteDepartmentOrCategory: function (button) {
        var me = this,
            record = button.getRecord();

        me.setDisableTransactionListTapEvent(true);

        //Tap on delete primary dp/cat list item will display a message
        if (record.get('primary_rm') === '1') {
            Ext.Msg.alert('', this.getUseAboveFormMessage());
            me.setDisableTransactionListTapEvent(false);
        }

        Ext.Msg.confirm(me.getDeleteDpCatTitle(), me.getDeleteDpCatMessage(),
            function (buttonId) {
                if (buttonId === 'yes') {

                    SpaceOccupancy.util.NavigationHelper.deleteTransaction(record, me, function () {
                        SyncManager.loadStores(['departmentListStore', 'categoryListStore'], function () {
                            me.setDisableTransactionListTapEvent(false);
                        }, me);
                    }, me);
                } else {
                    me.setDisableTransactionListTapEvent(false);
                }
            }
        );
    },

    /**
     * 1.    Add an existing employee to a space
     a.    Select the "+" on the title bar of the Survey Employees Form
     b.    If space transactions disabled, invoke the Select Employee popup and select an employee,
     update em record (primary is the only option)
     c.    If space transactions are enabled, prompt the user if the space assignment is Primary,
     if Primary, then invoke the Select Employee popup form and select an employee, update em record;
     if non-primary, invoke the space Transactions edit form with bl, fl, rm populated, the start date set as current,
     both primary values set to no, and they are non-editable.
     */
    addEmTransaction: function () {
        var me = this,
            roomSurveyRecord = me.getCarousel().getDisplayedView().getRecord(),
            list = this.getDepartmentList(),
            employeesSyncStore = Ext.getStore('employeesSyncStore'),
            filterArray,
            view,
            roomRecord,
            buttons,

            displayEmPromptListFn = function () {
                filterArray = [];
                roomRecord = me.getSurveyPanel().getRecord();
                filterArray.push(SpaceOccupancy.util.Filters.getFilter('survey_id', roomRecord.get('survey_id')));
                employeesSyncStore.clearFilter();
                employeesSyncStore.setFilters(filterArray);
                employeesSyncStore.load(function () {
                    if (me.getEmployeePromptListPanel()) {
                        me.getEmployeePromptListPanel().show();
                    } else {
                        view = Ext.create('SpaceOccupancy.view.EmployeePromptList');
                        me.getMainView().push(view);
                    }
                }, me);
            };

        if (SurveyState.getWorkspaceTransactionsEnabled()) {
            buttons = [
                {
                    text: LocaleManager.getLocalizedString('Primary', 'SpaceOccupancy.controller.Navigation'),
                    itemId: 'primary'
                },
                {
                    text: LocaleManager.getLocalizedString('Non-Primary', 'SpaceOccupancy.controller.Navigation'),
                    itemId: 'non-primary'
                },
                {
                    text: LocaleManager.getLocalizedString('Cancel', 'SpaceOccupancy.controller.Navigation'),
                    itemId: 'cancel'
                }
            ];
            Ext.Msg.show({
                title: '',
                message: LocaleManager.getLocalizedString('For the employee you are about to work with, is this their primary or non-primary location?',
                    'SpaceOccupancy.controller.Navigation'),
                buttons: buttons,
                promptConfig: false,
                fn: function (buttonId) {
                    if (buttonId === 'primary') {
                        displayEmPromptListFn();
                    } else if (buttonId === 'non-primary') {
                        SpaceOccupancy.util.NavigationHelper.showEditTransactionForm(list, roomSurveyRecord, true, this);
                    }
                },
                scope: me
            });
        } else {
            displayEmPromptListFn();
        }
    },

    addEmployeeFromPromptList: function (list, index, target, record, e) {
        var me = this,
            employeesStore = Ext.getStore('employeesSyncStore'),
            employeeListStore = Ext.getStore('employeeListStore'),
            roomRecord = me.getCarousel().getDisplayedView().getRecord(),
            autoSync = employeesStore.getAutoSync(),
            currentLocationMsg = me.getMoveEmMessage(),
            setEmLocationFn = function () {
                employeesStore.setAutoSync(false);
                record.set('bl_id', roomRecord.get('bl_id'));
                record.set('fl_id', roomRecord.get('fl_id'));
                record.set('rm_id', roomRecord.get('rm_id'));
                employeesStore.add(record);
                employeesStore.sync(function () {
                    employeesStore.setAutoSync(autoSync);
                    employeeListStore.load(function (records) {
                        // update the number of records in the em list title
                        SpaceOccupancy.util.Filters.setListViewTitle('em', records.length);
                        me.getMainView().pop();
                    });
                });
            };

        e.preventDefault();
        e.stopPropagation();

        if (record) {
            if (record.get('bl_id') &&
                (record.get('bl_id') !== roomRecord.get('bl_id') ||
                record.get('fl_id') !== roomRecord.get('fl_id') ||
                record.get('rm_id') !== roomRecord.get('rm_id'))) {
                currentLocationMsg = currentLocationMsg.replace('{0}', record.get('bl_id'));
                currentLocationMsg = currentLocationMsg.replace('{1}', record.get('fl_id'));
                currentLocationMsg = currentLocationMsg.replace('{2}', record.get('rm_id'));
                Ext.Msg.confirm(this.getMoveEmTitle(), currentLocationMsg,
                    function (buttonId) {
                        if (buttonId === 'yes') {
                            Ext.callback(setEmLocationFn, me);
                        }
                    }
                );
            } else {
                Ext.callback(setEmLocationFn, me);
            }
        }

        // avoid calling also Common.control.field.Prompt#onListTap
        return false;
    },

    createEm: function () {
        var me = this,
            roomRecord = me.getCarousel().getDisplayedView().getRecord(),
            employeeSurveyRecord = SpaceOccupancy.util.Ui.createEmployeeSurveyRecord(roomRecord),
            title = LocaleManager.getLocalizedString('New Employee', 'SpaceOccupancy.controller.Navigation'),
            message = LocaleManager.getLocalizedString('This action will add a new employee to the employee table. Do you want to continue?', 'SpaceOccupancy.controller.Navigation');

        Ext.Msg.confirm(title, message,
            function (buttonId) {
                if (buttonId === 'yes') {
                    SpaceOccupancy.util.NavigationHelper.showEditEmpoyeeForm(employeeSurveyRecord, true, me);
                }
            });
    },

    onWorkspaceTransactionsBtnTap: function () {
        var panel = Ext.create('SpaceOccupancy.view.TransactionList');
        this.getMainView().push(panel);
    },

    onRoomSurveyViewChange: function (nextView, record, carousel) {
        var currentNavView = this.getMainView().getNavigationBar().getCurrentView();

        // don't call filters for survey panel when leaving the page by returnig to floor plan
        if (carousel instanceof SpaceOccupancy.view.RoomCarousel && currentNavView.xtype === 'roomcarousel') {
            SpaceOccupancy.util.Filters.applyFiltersOnRoomSurveyPanel(carousel.getDisplayedView(), record);
        }
    },

    /**
     * Handle room capacity field value update.
     - when user taps on the + and - buttons he will see the message
     - when user taps on the clearicon he will see the message if the value changed
     - when user writes a value he will see the message if the value changed.
     * @param usedSpin boolean flag to indicate that + or - buttons were used for changing the value
     */
    onRoomCapacityUpdate: function (usedSpin) {
        var message = LocaleManager.getLocalizedString('The Reconcile Workspace Transactions action must be run on Web Central.',
            'SpaceOccupancy.controller.Navigation');

        if (usedSpin || this.getRoomCapacityInEditMode()) {
            Ext.Msg.alert('', message);
            this.setRoomCapacityInEditMode(false);
        }
    },

    selectActionListItem: function (value) {
        var me = this,
            surveyFloors,
            list,
            store,
            blId,
            flId,
            filters = [],
            currentView = this.getMainView().getNavigationBar().getCurrentView();

        if (value.get('action') === 'goToSurvey') {
            surveyFloors = SurveyState.getFloorCodes();

            if (surveyFloors.length > 1) {
                // verify if floors list is already displayed
                if (currentView && currentView.xtype === 'floorsListPanel') {
                    return;
                }

                list = this.getBuildingList();
                if (Ext.isEmpty(list)) {
                    list = Ext.create('Space.view.BuildingList');
                }
                store = list.getStore();
                filters.push(SpaceOccupancy.util.Filters.getFilter('bl_id', surveyFloors[0].bl_id));
                store.retrieveRecord(filters, function (buildingRecord) {
                    if (buildingRecord.get('bl_id')) {
                        Space.Space.setPermanentFilterForFields(['bl_id'], [buildingRecord.get('bl_id')], 'spaceBookFloors', [], function () {
                            me.displayUpdatePanel(list, buildingRecord);
                        }, me);
                    } else {
                        me.displayUpdatePanel(list, buildingRecord);
                    }
                }, me);
            } else {
                list = this.getFloorListView();
                if (Ext.isEmpty(list)) {
                    list = Ext.create('Space.view.FloorList');
                }
                store = list.getStore();

                list.setEditViewClass('Space.view.FloorPlan');
                me.getPlanTypeButtonPicker().setStore('spaceOccupancyPlanTypes');

                filters.push(SpaceOccupancy.util.Filters.getFilter('bl_id', surveyFloors[0].bl_id));
                filters.push(SpaceOccupancy.util.Filters.getFilter('fl_id', surveyFloors[0].fl_id));
                store.retrieveRecord(filters, function (floorRecord) {
                    blId = floorRecord.get('bl_id');
                    flId = floorRecord.get('fl_id');
                    SpaceOccupancy.util.Filters.filterPlanTypes(function () {
                        //onViewPushed the highlight is updated and the permanent filter is set
                        Space.Space.setPermanentFilterForFields(['bl_id', 'fl_id'], [blId, flId], 'roomsStore', [], function () {
                            me.displayUpdatePanel(list, floorRecord);
                            me.getRoomsList().refresh();
                        }, me);
                    }, me);
                }, me);
            }
        }
    }
});