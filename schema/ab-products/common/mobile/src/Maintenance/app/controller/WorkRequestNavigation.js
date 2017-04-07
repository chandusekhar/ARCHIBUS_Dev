Ext.define('Maintenance.controller.WorkRequestNavigation', {
    extend: 'Common.controller.NavigationController',
    requires: 'Ext.SegmentedButton',

    config: {
        refs: {
            mainView: 'mainview',
            segmentedButton: 'workRequestPanel > toolbar[docked=bottom] > viewselector',
            dropDownButton: 'workrequestListPanel > toolbar[docked=bottom] > buttonpicker', // 21.3
            workRequestView: 'workRequestPanel',
            photoPanel: 'workRequestPhotoPanel',
            workRequestListView: 'workrequestListPanel',
            workRequestList: 'workrequestListPanel list',
            workRequestManagerList: 'workrequestListPanel workrequestManagerList', //21.3
            myWorkToolbar: 'workrequestListPanel toolbar[itemId=myWorkToolbar]',
            //workRequestSearchField: 'workrequestListPanel barcodefield[name=workRequestSearch]',
            workRequestSearchField: 'workrequestListPanel search[name=workRequestSearch]',
            sortField: 'selectfield[name=sortWorkRequests]',
            workRequestFilterButton: 'workrequestListPanel button[name=workRequestFilterButton]', // 21.3
            siteMap: 'siteMapPanel',
            craftspersonList: 'workRequestCraftspersonListPanel list',
            costsList: 'workRequestCostPanel list',
            //buttons referenced in Maintenance.util.NavigationUtil
            homeButton: 'button[action=goToHomePage]',
        },

        control: {
            mainView: {
                push: 'onViewPushed'
            },
            workRequestSearchField: {
                //keyup: function (searchField) {
                //    this.onSearch(searchField, 'workRequestsStore',
                //        ['wr_id', 'mob_wr_id', 'bl_id', 'fl_id', 'rm_id', 'prob_type', 'eq_id', 'name', 'address1', 'address2', 'dv_id', 'dp_id']);
                //},
                searchkeyup: function (value) {
                    this.onSearch(value, 'workRequestsStore',
                        ['wr_id', 'mob_wr_id', 'bl_id', 'fl_id', 'rm_id', 'prob_type', 'eq_id', 'name', 'address1', 'address2', 'dv_id', 'dp_id'], false);
                },
                searchclearicontap: function () {
                    WorkRequestFilter.applyWorkRequestListFilter(WorkRequestFilter.listType);
                },
                scancomplete: function (scanResult) {
                    this.onSearch(scanResult, 'workRequestsStore',
                        ['wr_id', 'mob_wr_id', 'bl_id', 'fl_id', 'rm_id', 'prob_type', 'eq_id', 'name', 'address1', 'address2', 'dv_id', 'dp_id'], true);
                }
            },
            sortField: {
                change: 'onApplySort'
            },
            workRequestFilterButton: {
                tap: 'onWorkRequestFilterButtonTapped'
            },
            'button[action=locateWorkRequest]': {
                tap: 'onLocateWorkRequest'
            },
            homeButton: {
                tap: 'onGoToHomePage'
            }
        },

        userAccountMessage: LocaleManager.getLocalizedString('Your account does not have Craftsperson access. Submit Work Requests using the My Request tab.',
            'Maintenance.controller.WorkRequestNavigation'),

        userAccountTitle: LocaleManager.getLocalizedString('User Account', 'Maintenance.controller.WorkRequestNavigation'),

        locateRoomTitle: LocaleManager.getLocalizedString('Locate Room', 'Maintenance.controller.FloorPlan'),
        locateRoomMessage: LocaleManager.getLocalizedString('The work request is not assigned to a room and therefore cannot be located.', 'Maintenance.controller.FloorPlan')
    },

    /**
     * The store ids of each of the work request child stores. Storing these values makes manipulating
     * the stores easier.
     */
    childStoreIds: ['workRequestPartsStore', 'workRequestCraftspersonsStore', 'workRequestCostsStore', 'workRequestToolsStore', 'referenceStore'],

    launch: function () {
        var me = this;
        me.initWorkRequestList()
            .then(function () {
                me.initAfterStoresAreLoaded();
            });
    },

    initWorkRequestList: function () {
        var me = this,
            storeIds = ['craftspersonStore', 'workTeamsStore', 'craftspersonWorkTeamsStore'];

        return Promise.all(storeIds.map(me.loadStore));
    },

    /**
     * After stores are loaded, initialize the work request list view
     */
    initAfterStoresAreLoaded: function () {
        var me = this;

        ApplicationParameters.setCraftspersonParameters(function () {
            me.onWorkRequestListInitialized();
        }, me);
    },

    /**
     * Overide the Common.view.NavigationController displayUpdatePanel function so we can get the
     * selected wr_id value and filter the child stores.
     *
     * @override
     * @param view
     * @param record
     */
    displayUpdatePanel: function (view, record) {
        var me = this,
            editView = view.getEditViewClass(),
            updateView,
            fields,
            wrId = record.get('wr_id'),
            mobileWrId = record.get('mob_wr_id'),
            mobileId = record.getId();

        if (view.xtype === 'workrequestListPanel'
            && view.getDisplayMode() !== Constants.MyWork && view.getDisplayMode() !== Constants.MyRequests) {
            return;
        }

        updateView = Ext.create(editView, {displayMode: view.getDisplayMode ? view.getDisplayMode() : ''});

        // Filter the child stores if the current view is the Work Request list view.
        if (view.isWorkRequestList) {

            // Hide the segmented buttons if this is a Service Request
            if (updateView.getIsCreateView() || view.getDisplayMode() !== Constants.MyWork) {
                me.getSegmentedButton().getComponent('sgbtnCraftPersons').hide();
                me.getSegmentedButton().getComponent('sgbtnParts').hide();
                me.getSegmentedButton().getComponent('sgbtnCosts').hide();
                me.getSegmentedButton().getComponent('sgbtnTools').hide();
            }

            updateView.setViewIds({
                workRequestId: wrId,
                mobileId: mobileId
            });

            if (wrId) {
                Network.checkNetworkConnectionAndDisplayMessageAsync(function (isConnected) {
                    if (isConnected) {
                        WorkRequestAction.loadRelatedRequests(updateView, wrId);
                    }
                }, me);
            }

            // Filter child stores.
            me.filterChildStores(mobileId)
                .then(function () {
                    me.pushView(record, updateView);
                    //related work request and PM cannot access this request directly, set all field read-only
                    if (record.get('request_type') === 2 || record.get('prob_type') === 'PREVENTIVE MAINT') {
                        fields = updateView.query('field');
                        Ext.each(fields, function (field) {
                            field.setReadOnly(true);
                        });
                    }
                });
        } else {
            updateView.setViewIds({
                workRequestId: wrId,
                mobileId: mobileWrId
            });
            me.pushView(record, updateView);
        }
    },

    pushView: function (record, view) {
        view.setRecord(record);
        this.getMainView().push(view);
    },

    onViewPushed: function (mainView, pushedView) {
        this.callParent(arguments);
        NavigationUtil.showHideToolbarButtons(mainView, pushedView);
        if ((NavigationUtil.isWorkRequestEditView(pushedView) || pushedView.xtype === 'updateFormPanel' || pushedView.xtype === 'approveFormPanel') && !pushedView.getIsCreateView()) {
            NavigationUtil.setEditableFieldsOfUpdateForm(mainView, pushedView);
        }
    },

    onViewPopped: function (navView, poppedView) {
        var me = this,
            currentView = navView.getNavigationBar().getCurrentView(),
            record = currentView.getRecord(),
            floorPlanController = me.getApplication().getController('Maintenance.controller.FloorPlan'),
            listType = me.getWorkRequestListView().getDisplayMode(),
            refreshWorkRequestList = function () {
                if ((poppedView.xtype === 'updateFormPanel' || poppedView.xtype === 'updateFormMultiplePanel'
                    || poppedView.xtype === 'approveFormPanel' || poppedView.xtype === 'approveFormMultiplePanel'
                    || poppedView.xtype === 'estimateFormMultiplePanel'
                    || poppedView.xtype === 'ReturnCfFormMultiple' || poppedView.xtype === 'forwardFormMultiplePanel'
                    || poppedView.xtype === 'scheduleFormMultiplePanel' || poppedView.xtype === 'verifymultipleform')
                    && me.getWorkRequestManagerList()) {

                    WorkRequestListUtil.filterAndShowWorkRequestList(me.getMainView(), WorkRequestFilter.listType, WorkRequestFilter.additionalFilterArray);
                }
            };

        if (currentView.getDisplayMode) {
            listType = currentView.getDisplayMode();
            if (record && record.get('mob_wr_id')) {
                me.filterChildStores(record.get('mob_wr_id'));
                WorkRequestAction.filterWorkRequestActions([record], false, listType);
                if (listType === Constants.MyWork) {
                    WorkRequestAction.filterWorkRequestActionsForMyWork(record, listType);
                }
            }
        }

        if (NavigationUtil.isWorkRequestEditView(poppedView)) {
            WorkRequestListUtil.setWorkRequestListTitle(me.getMainView(), listType);
            me.getMyWorkToolbar().setHidden(listType === Constants.MyRequests);
        }

        if (NavigationUtil.isMainView(currentView) && poppedView.xtype !== 'workRequestFilterPanel') {
            WorkRequestListUtil.filterAndShowWorkRequestList(me.getMainView(), listType, WorkRequestFilter.additionalFilterArray);
        }

        //KB# 3050818 When return back to Main view, reset view title
        if (currentView.xtype === me.getMainView().xtype) {
            WorkRequestListUtil.setWorkRequestListTitle(me.getMainView(), listType);
        }

        refreshWorkRequestList();

        NavigationUtil.showHideToolbarButtons(navView, currentView);

        if (currentView.xtype === 'workRequestCraftspersonListPanel') {
            me.getCraftspersonList().refresh();
        } else if (currentView.xtype === 'workRequestCostPanel') {
            me.getCostsList().refresh();
        } else if (currentView.xtype === 'floorPlanPanel'
            && poppedView.xtype === 'siteMapPanel') {
            floorPlanController.findRoomAsset(currentView, currentView.getRecord());
        }
    },

    /**
     * @override
     * @param currentView
     */
    displayAddPanel: function (currentView) {
        var me = this,
            customPanelConfig = {
                displayCameraIcon: true
            },
            view = this.getModalAddPanel(currentView, customPanelConfig),
            workRequestListDisplayMode,
            viewIds,
            record;

        // If the current view is the main view and we are
        // creating a new work request
        // we need to determine if the new work request is for
        // My Work or My Request
        if (NavigationUtil.isMainView(currentView)) {
            workRequestListDisplayMode = me.getWorkRequestListView().getDisplayMode();
            if (NavigationUtil.isWorkRequestEditView(view)) {
                view.setRequestType(workRequestListDisplayMode);
            }
        }

        // If the add panel is launched from a child list we
        // need to set the wr_id value of the new view.
        if (currentView instanceof Common.view.navigation.ListBase) {
            viewIds = currentView.getViewIds();
            record = view.getRecord();

            record.set('wr_id', viewIds.workRequestId);
            record.set('mob_wr_id', viewIds.mobileId);
            view.setViewIds(viewIds);
        }

        if (view.xtype === 'workRequestCraftspersonEditPanel') {
            me.afterAddNewCfViewShow(currentView, view);
        }

        Ext.Viewport.add(view);
        view.show();
        return view;
    },

    afterAddNewCfViewShow: function (currentView, addView) {
        var me = this,
            viewStack = me.getMainView().getNavigationBar().getViewStack(),
            workRequestRecord = viewStack[viewStack.length - 2].getRecord();
        if (workRequestRecord.get('is_req_supervisor') === 0 && workRequestRecord.get('is_req_craftsperson') === 1 && ApplicationParameters.isCraftspersonPlanner) {
            addView.setAllFieldsReadOnly();
            addView.down('field[name=cf_id]').setReadOnly(false);
        }

    },

    filterChildStores: function (mobileId) {
        var me = this,
            childStoreIds = me.childStoreIds,
            storeIds = Ext.Array.remove(childStoreIds, 'referenceStore'),
            wrIdFilter = WorkRequestFilter.createFilter('mob_wr_id', mobileId);


        return Promise.all(storeIds.map(function (storeId) {
                me.setFilterAndLoadStore(storeId, [wrIdFilter]);
            }))
            .then(function () {
                return me.loadFilteredReferenceStore(Ext.getStore('referenceStore'), [wrIdFilter]);
            });
    },

    loadFilteredReferenceStore: function (referenceStore, filterArray) {
        var me = this,
            wrStore = Ext.getStore('workRequestsStore');

        return wrStore.retrieveSingleRecord(filterArray)
            .then(function (record) {
                var referenceFilter = WorkRequestFilter.getReferenceStoreFilter(record);
                referenceStore.setFilters(referenceFilter);
                return me.loadStore('referenceStore');
            });

    },

    onShowWorkRequestView: function (view) {
        var record = view.getRecord();
        this.setBadgeText(record);
    },

    /**
     * Initialize the work request list AFTER craftspersonStore and userProfileStore are loaded
     */
    onWorkRequestListInitialized: function () {
        WorkRequestListUtil.initDropDownButtonsAndWorkRequestList(this.getMainView());
    },

    /**
     * @override
     * @param currentView
     */
    saveEditPanel: function (currentView) {
        var me = this,
            record = currentView.getRecord(),
            store = Ext.getStore(currentView.getStoreId()),
            userProfile = Common.util.UserProfile.getUserProfile(),
            isWorkRequestEditView = NavigationUtil.isWorkRequestEditView(currentView),
            workRequestListView = me.getWorkRequestListView(),
            activeWorkSelection = workRequestListView.getDisplayMode(),
            autoSync = store.getAutoSync(),
            onStoreWriteCompleted = function () {
                store.setAutoSync(autoSync);
                store.load(function () {
                    // If we are creating a new work request view we
                    // need to save the Craftsperson record
                    if (isWorkRequestEditView && !currentView.getIsLinkNewForm() && activeWorkSelection === Constants.MyWork && currentView.getIsCreateView()) {
                        // KB 3045951 set the mob_wr_id TODO find a more integrated solution (in the wr store/model?)
                        record.set('mob_wr_id', record.getId());
                        currentView.setIsCreateView(false);
                        me.createCraftspersonRecord(currentView, record);
                    } else {
                        Ext.Viewport.remove(currentView);

                        // Only refresh the store if we are creating a new My Request
                        // The Sencha list rendering is flaky if we refresh the store
                        // after updating a child record.
                        if (activeWorkSelection === Constants.MyRequests) {
                            Ext.getStore('workRequestsStore').loadPage(1);
                        }
                    }
                });
            };

        // Users should use the My Requests tab if they are not a craftsperson
        if (isWorkRequestEditView && activeWorkSelection === Constants.MyWork &&
            currentView.getIsCreateView() && (userProfile.cf_id === null || userProfile.cf_id === '')) {
            Ext.Msg.alert(me.getUserAccountTitle(), me.getUserAccountMessage());
            return;
        }

        // Check validation
        if (record.isValid()) {
            record.setChangedOnMobile();
            me.setTimeAssigned(record);
            me.setMyRequestStatus(currentView, record, activeWorkSelection);
            store.setAutoSync(false);
            store.add(record);
            store.sync(onStoreWriteCompleted, Ext.emptyFn, me);
        } else {
            currentView.displayErrors(record);
        }
    },

    // Set the status to issued for all new My Work records.
    setMyRequestStatus: function (view, record, activeWorkSelection) {
        if (NavigationUtil.isWorkRequestEditView(view)) {
            if (activeWorkSelection === Constants.MyWork) {
                if (view.getIsCreateView()) {
                    record.set('status', 'I');
                    record.set('status_initial', 'I');
                }
                record.set('request_type', 0);
            } else {
                record.set('request_type', 1);
                if (view.getIsCreateView()) {
                    record.set('status_initial', record.get('status'));
                }
            }
        }
    },

    /**
     * Sets the time_assigned value for new craftsperson and new part records to the current time
     * When new models are created the framework uses cached versions of the models when creating the
     * new instances. The time assigned values are reused which causes the record primary key to not
     * be unique.
     * It should be possible to handle this case in the framework. I could not find out how.
     * @param {Ext.data.Model} record  The record to be saved.
     */
    setTimeAssigned: function (record) {
        if (record.phantom && (record instanceof Maintenance.model.WorkRequestCraftsperson ||
            record instanceof Maintenance.model.WorkRequestPart)) {
            record.set('time_assigned', new Date());
        }
    },

    /**
     * Creates the craftsperson record when a My Request work request is created.
     * @param currentView
     * @param {Ext.data.Model} workRequestRecord
     */
    createCraftspersonRecord: function (currentView, workRequestRecord) {
        var me = this,
            craftsPersonModel = Ext.create('Maintenance.model.WorkRequestCraftsperson'),
            craftsPersonStore = Ext.getStore('workRequestCraftspersonsStore'),
            userProfile = Common.util.UserProfile.getUserProfile(),
            onStoreWriteCompleted = function () {
                craftsPersonStore.setAutoSync(true);
                craftsPersonModel.setDisableValidation(false);
                Ext.Viewport.remove(currentView);
                Ext.getStore('workRequestsStore').loadPage(1);
            };

        // The craftsperson check should never be needed since we check the
        // users access in the saveEditPanel function. It is here as a safeguard.
        if (userProfile.cf_id === null || userProfile.cf_id === '') {
            Ext.Msg.alert(LocaleManager.getLocalizedString('Validation',
                'Maintenance.controller.WorkRequestNavigation'),
                LocaleManager.getLocalizedString('Craftsperson is required.',
                    'Maintenance.controller.WorkRequestNavigation'));
            Ext.Viewport.remove(currentView);
            Ext.getStore('workRequestsStore').loadPage(1);
            return;
        }

        // Disable the crafts person store auto sync.
        craftsPersonStore.setAutoSync(false);

        craftsPersonModel.set('cf_id', userProfile.cf_id);
        craftsPersonModel.set('mob_wr_id', workRequestRecord.getId());
        craftsPersonModel.set('mob_is_changed', 1);

        craftsPersonModel.setDisableValidation(true);
        craftsPersonStore.add(craftsPersonModel);

        craftsPersonStore.sync(onStoreWriteCompleted, Ext.emptyFn, me);
    },

    /**
     * Search work requests
     * @param scannedValue search value or scan result object
     * @param storeName store name to search into
     * @param filterFields field list to search into
     * @param scanned value was obtained by scanning a barcode
     */
    onSearch: function (scannedValue, storeName, filterFields, scanned) {
        var me = this,
            filterArray = [],
            value,
            mobWrIdTemplate,
            workRequestListView;

        // Create Filters
        Ext.each(filterFields, function (field) {
            if (scanned) {
                value = scannedValue.fields[field];
            } else {
                value = scannedValue;
            }
            var filter;
            if (field === 'name' || field === 'address1' || field === 'address2') {
                filter = WorkRequestFilter.createFilter('(SELECT ' + field + ' FROM MaintenanceBuilding WHERE MaintenanceBuilding.bl_id = WorkRequest.bl_id)', value, 'OR', false);
            } else if (field === 'mob_wr_id') {
                workRequestListView = me.getWorkRequestListView();
                if (!Ext.isEmpty(workRequestListView)) {
                    mobWrIdTemplate = Ext.String.format(me.getWorkRequestManagerList().mobileWorkRequestIdTemplate, '');
                    filter = WorkRequestFilter.createFilter('(SELECT CASE WHEN wr_id IS NOT NULL THEN NULL ELSE (\'' + mobWrIdTemplate + '\' || id) END)', value, 'OR', false);
                }
            } else if (scanned && (field === 'bl_id' || field === 'fl_id' || field === 'rm_id')) {
                filter = WorkRequestFilter.createScannedRoomFilter(scannedValue);
            } else {
                filter = WorkRequestFilter.createFilter(field, value, 'OR', false);
            }
            filterArray.push(filter);
        });

        WorkRequestFilter.applyWorkRequestListFilter(WorkRequestFilter.listType, filterArray);
    },

    /**
     * Applies the selected sort to the store; grouping and sorting must go together
     */
    onApplySort: function (field, value) {
        var workRequestsStore = Ext.getStore('workRequestsStore');

        switch (value) {
            case 'escalation':
                workRequestsStore.setGrouper({groupFn: workRequestsStore.groupByEscalation});
                workRequestsStore.setSorters(workRequestsStore.getSortByEscalation());
                break;

            case 'location':
                workRequestsStore.setGrouper({groupFn: workRequestsStore.groupByLocation});
                workRequestsStore.setSorters(workRequestsStore.getSortByLocation());
                break;

            case 'problemType':
                workRequestsStore.setGrouper({groupFn: workRequestsStore.groupByProblemType});
                workRequestsStore.setSorters(workRequestsStore.getSortByProblemType());
                break;

            // The status case is the default.
            default:
                workRequestsStore.setGrouper({groupFn: workRequestsStore.groupByStatus});
                workRequestsStore.setSorters(workRequestsStore.getSortByStatus());
                break;
        }

        workRequestsStore.loadPage(1);
    },

    onLocateWorkRequest: function () {
        var me = this,
            record = this.getMainView().getNavigationBar().getCurrentView().getRecord(),
            blId = record.get('bl_id'),
            flId = record.get('fl_id'),
            rmId = record.get('rm_id');

        if (Ext.isEmpty(blId) || Ext.isEmpty(flId) || Ext.isEmpty(rmId)) {
            Ext.Msg.alert(me.getLocateRoomTitle(), me.getLocateRoomMessage());
            return;
        }

        me.loadFloorPlan(record);
    },

    loadFloorPlan: function (record) {
        var view = Ext.create('Maintenance.view.FloorPlan'),
            title = LocaleManager.getLocalizedString('Floor Plans', 'Maintenance.controller.WorkRequestNavigation')
                + ' ' + record.get('bl_id') + '-' + record.get('fl_id');

        view.setRecord(record);

        view.setTitle(title);

        this.getMainView().push(view);
        this.getApplication().getController('Maintenance.controller.FloorPlan').loadFloorPlan();
    },

    onWorkRequestFilterButtonTapped: function () {
        var me = this,
            view = Ext.create('Maintenance.view.manager.WorkRequestFilter', {
                'workRequestDisplayMode': me.getWorkRequestListView().getDisplayMode()
            });
        me.getMainView().push(view);
    },

    loadStore: function (storeId) {
        var store = Ext.getStore(storeId);
        return new Promise(function (resolve, reject) {
            store.load({
                callback: function (records, operation, success) {
                    if (success) {
                        resolve(records);
                    } else {
                        reject('Error loading store: ' + storeId);
                    }
                },
                scope: this
            });
        });
    },

    setFilterAndLoadStore: function (storeId, filterArray) {
        var me = this,
            store = Ext.getStore(storeId);

        store.clearFilter();
        store.setFilters(filterArray);

        return me.loadStore(storeId);
    },

    onGoToHomePage: function () {
        this.getMainView().reset();
    }
});