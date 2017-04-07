Ext.define('WorkplacePortal.controller.Navigation', {

    extend: 'Space.controller.Navigation',

    requires: [
        'Common.model.Room',
        'WorkplacePortal.model.LocateRoom',
        'Common.model.Employee',
        'WorkplacePortal.model.ReservationRoomArrange',
        'WorkplacePortal.model.HotelingBookingSearch',
        'WorkplacePortal.model.ReservationEmployee',
        'Common.plugin.ListPaging',
        'Common.device.Contact',
        'Common.view.report.Detail'
    ],

    config: {
        refs: {
            mainView: 'mainview',
            workplaceServicesListView: 'workplaceServicesListPanel',
            serviceRequestListView: 'serviceRequestListPanel',
            facilityInformationListView: 'facilityInformationListPanel',
            serviceDeskRequestListView: 'serviceDeskRequestListPanel',
            floorList: 'floorsListPanel',
            roomList: 'roomslist',
            serviceDeskRequestFormPanel: 'serviceDeskRequestFormPanel',
            reservationAttendeesPanel: 'reservationAttendeesPanel',
            reservationSearchField: 'reservationListPanel search[name=reservationSearchField]',
            filterReservationButton: 'button[action=filterReservationsList]',

            //buttons referenced in WorkplacePortal.util.Ui
            homeButton: 'button[action=goToHomePage]',
            planTypeButtonPicker: 'mainview buttonpicker',
            sitePlanButton: 'toolbarbutton[itemId=sitePlanButton]',
            siteMapInfo: 'button[action=siteMapInfo]',
            downloadDataButton: 'button[itemId=downloadData]',
            downloadSiteFloorPlans: 'button[action=downloadSiteFloorPlans]',
            syncServiceDeskRequestsButton: 'toolbarbutton[itemId=syncServiceDeskRequestsButton]',
            syncReservationRequestsButton: 'toolbarbutton[itemId=syncReservationRequestsButton]',
            syncHotelingBookingsButton: 'toolbarbutton[itemId=syncHotelingBookingsButton]',
            cancelRequestButton: 'button[itemId=cancelRequestButton]',
            floorPlanView: 'workplacePortalFloorPlanPanel',
            floorPlanSearchField: 'workplacePortalFloorPlanPanel search[itemId=floorPlanSearch]'
        },

        control: {
            mainView: {
                pop: 'onViewPopped',
                push: 'onViewPushed'
            },

            serviceRequestListView: {
                itemsingletap: function (list, index, target, record) {
                    this.displayUpdatePanel(list, record);
                }
            },

            cancelRequestButton: {
                tap: 'cancelServiceRequest'
            },

            facilityInformationListView: {
                itemsingletap: function (list, index, target, record) {
                    this.displayUpdatePanel(list, record);
                }
            },
            serviceDeskRequestListView: {
                itemsingletap: function (list, index, target, record) {
                    this.displayUpdatePanel(list, record);
                }
            },
            'reservationListPanel': {
                itemsingletap: function (list, index, target, record) {
                    var detailView = Ext.create('WorkplacePortal.view.ReservationDetailsForm');

                    if (this.getDisableListTapEvent()) {
                        this.setDisableListTapEvent(false);
                        return;
                    }

                    detailView.setRecord(record);
                    this.getMainView().push(detailView);
                }
            },
            floorPlanView: {
                roomtap: 'onRoomTap'
            },
            roomList: {
                itemsingletap: 'onRoomListItemTap'
            },
            'button[action=onDisplayRoomInfoAction]': {
                tap: function (button) {
                    var record = button.getRecord();
                    WorkplacePortal.util.NavigationHelper.onDisplayRoomInfo(record.get('bl_id'), record.get('fl_id'), record.get('rm_id'));
                }
            },
            'button[action=onDisplayAttendees]': {
                tap: function (button) {
                    var record = button.getRecord(),
                        attendeesView = Ext.create('WorkplacePortal.view.ReservationAttendees');

                    attendeesView.setRecord(record);
                    Ext.Viewport.add(attendeesView);
                    attendeesView.show();
                }
            },
            'button[action=onSaveAttendees]': {
                tap: function (button) {
                    var me = this;

                    WorkplacePortal.util.Reservation.onSaveAttendees(button.getRecord(), function () {
                        Ext.Viewport.remove(me.getReservationAttendeesPanel());
                    });
                }
            },
            'button[action=onCloseAttendees]': {
                tap: function () {
                    Ext.Viewport.remove(this.getReservationAttendeesPanel());
                }
            },
            'hotelingListPanel': {
                itemsingletap: function (list, index, target, record) {
                    if (this.getDisableListTapEvent()) {
                        this.setDisableListTapEvent(false);
                        return;
                    }
                    WorkplacePortal.util.NavigationHelper.onDisplayRoomInfo(record.get('bl_id'), record.get('fl_id'), record.get('rm_id'));
                }
            },
            'toolbarbutton[itemId=searchReservationRoomsButton]': {
                tap: function () {
                    WorkplacePortal.util.Reservation.onSearchReservationRooms(this);
                }
            },
            'toolbarbutton[itemId=searchHotelingRoomsButton]': {
                tap: function () {
                    WorkplacePortal.util.Hoteling.onSearchHotelingRooms(this);
                }
            },
            'button[action=selectAvailableRoom]': {
                tap: 'onSelectAvailableRoom'
            },
            'button[itemId=confirmRoomReservationButton]': {
                tap: function () {
                    WorkplacePortal.util.Reservation.onConfirmRoomReservation(this.getMainView());
                }
            },
            'button[itemId=addReservationEmployeeButton]': {
                tap: function () {
                    WorkplacePortal.util.Reservation.onAddReservationEmployee();
                }
            },
            'button[itemId=addReservationContactsButton]': {
                tap: function () {
                    WorkplacePortal.util.Reservation.onAddReservationContacts();
                }
            },
            'button[action=callReservationEmployeeItem]': {
                tap: function (button) {
                    WorkplacePortal.util.Reservation.onCallReservationEmployeeItem(button);
                }
            },
            'button[action=emailReservationEmployeeItem]': {
                tap: function (button) {
                    WorkplacePortal.util.Reservation.onEmailReservationEmployeeItem(button);
                }
            },
            'button[action=deleteReservationEmployeeItem]': {
                tap: function (button) {
                    WorkplacePortal.util.Reservation.onDeleteReservationEmployeeItem(button);
                }
            },
            'button[itemId=confirmRoomHotelingButton]': {
                tap: function () {
                    WorkplacePortal.util.Hoteling.onConfirmRoomHoteling(this.getMainView());
                }
            },
            'button[action=onCancelRoomReservation]': {
                tap: function (button) {
                    // Disable the list tap event to prevent showing the room report
                    this.setDisableListTapEvent(true);

                    WorkplacePortal.util.Reservation.onCancelRoomReservation(button);
                }
            },
            'button[action=onCheckInReservationRoom]': {
                tap: function (button) {
                    // Disable the list tap event to prevent showing the room report
                    this.setDisableListTapEvent(true);

                    WorkplacePortal.util.Reservation.onCheckInReservationRoom(button);
                }
            },
            'button[action=onCheckInHotelingRoom]': {
                tap: function (button) {
                    // Disable the list tap event to prevent showing the room report
                    this.setDisableListTapEvent(true);

                    WorkplacePortal.util.Hoteling.onCheckInHotelingRoom(button);
                }
            },
            'button[action=onCancelRoomHoteling]': {
                tap: function (button) {
                    // Disable the list tap event to prevent showing the room report
                    this.setDisableListTapEvent(true);

                    WorkplacePortal.util.Hoteling.onCancelRoomHoteling(button);
                }
            },
            'toolbarbutton[itemId=locateRoomButton]': {
                tap: 'onLocateRoom'
            },
            'toolbarbutton[itemId=locateEmployeeButton]': {
                tap: 'onLocateEmployee'
            },
            'button[action=onLocateReservationRoom]': {
                tap: 'onLocateReservationRoom'
            },
            'toolbarbutton[itemId=onLocateConfirmRoomButton]': {
                tap: 'onLocateConfirmRoom'
            },
            'button[action=onLocateHotelingRoom]': {
                tap: 'onLocateHotelingRoom'
            },
            sitePlanButton: {
                tap: 'onShowSitePlan'
            },
            buildingsSegmentedButton: {
                toggle: 'onBuildingSegmentedButtonToggled'
            },
            siteMapInfo: {
                tap: 'onShowSiteMapInfo'
            },
            floorList: {
                listitemtap: 'onFloorListTapped'
            },
            floorPlanSearchField: {
                searchkeyup: function () {
                    Space.Space.onSearch(this.getFloorPlanSearchField(), 'roomsStore',
                        ['rm_id', 'name']);
                    Space.SpaceFloorPlan.onHighlightBySearch(this.getFloorPlanView(), this.getFloorPlanSearchField(), Ext.getStore('roomsStore'),
                        ['rm_id', 'name']);
                },
                searchclearicontap: function () {
                    Space.Space.onClearSearchFilter('roomsStore');
                    Space.SpaceFloorPlan.onClearHighlightBySearch(this.getFloorPlanView());
                },
                scancomplete: function (scanResult) {
                    Space.Space.onSearchDecoded(scanResult, this.getFloorPlanSearchField(), 'roomsStore');

                    Space.SpaceFloorPlan.onHighlightBySearch(this.getFloorPlanView(), this.getFloorPlanSearchField(), Ext.getStore('roomsStore'),
                        ['rm_id', 'name'], scanResult);
                }
            },
            reservationSearchField: {
                searchkeyup: function (value) {
                    WorkplacePortal.util.Reservation.onSearchReservation(value);
                },
                searchclearicontap: function () {
                    WorkplacePortal.util.Reservation.onClearSearchReservation();
                },
                scancomplete: function (scanResult) {
                    Space.Space.onSearchDecoded(scanResult, this.getReservationSearchField(), 'userReservationRoomsStore');
                }
            },
            filterReservationButton: {
                tap: 'displayFilterReservationView'
            },
            'filterReservationPanel': {
                applyFilter: 'applyFilterReservation',
                clearFilter: 'clearReservationFilter'
            },
            'toolbarbutton[itemId = resetBackgroundData]': {
                tap: 'resetBackgroundData'
            }
        },

        locateEmployeeTitle: LocaleManager.getLocalizedString('Locate Employee', 'WorkplacePortal.controller.Navigation'),
        noEmText: LocaleManager.getLocalizedString('There is no employee assigned to this room', 'WorkplacePortal.controller.Navigation'),
        locateEmployeeSelectMessage: LocaleManager.getLocalizedString('Please fill in at least one field.', 'WorkplacePortal.controller.Navigation'),
        locateEmployeeMessage: LocaleManager.getLocalizedString('The selected employee is not assigned to a room.', 'WorkplacePortal.controller.Navigation'),
        requestLabel: LocaleManager.getLocalizedString('Request', 'WorkplacePortal.controller.Navigation'),
        noRoomsAvailableMessageTitle: LocaleManager.getLocalizedString('No rooms available', 'WorkplacePortal.controller.Navigation'),
        noRoomsAvailableMessage: LocaleManager.getLocalizedString('No rooms available for selected building', 'WorkplacePortal.controller.Navigation')
    },

    /**
     * Load menu stores on launch to ensure menu display. Filter buildings and floors by department.
     */
    launch: function () {
        var me = this,
            menuStores = ['facilityServicesMenusStore', 'mobileMenusStore'],
            departmentStores = ['departmentBuildingsStore', 'departmentFloorsStore'];

        Mask.displayLoadingMask();
        Promise.all(menuStores.map(me.loadStore))
            .then(function () {
                Mask.hideLoadingMask();
                me.initWorkplaceServicesView();
                Promise.all(departmentStores.map(WorkplacePortal.util.Filter.filterStoreOnUserDepartment));
        });
    },

    initWorkplaceServicesView: function () {
        var me = this,
            serviceRequestList = me.getServiceRequestListView(),
            facilityInformationList = me.getFacilityInformationListView();

        me.initView('facilityServicesMenusStore', serviceRequestList, 'ServiceRequestList');
        me.initView('mobileMenusStore', facilityInformationList, 'FacilityInformationList');
    },

    initView: function(storeId, listView, viewClass) {
        var me = this,
            workplaceServicesListView = me.getWorkplaceServicesListView(),
            store = Ext.getStore(storeId);

        if(store.getTotalCount() > 0) {
            if(!listView) {
                listView = Ext.create('WorkplacePortal.view.' + viewClass, {
                    flex: 1
                });
            }
            workplaceServicesListView.add(listView);
            listView.refresh();
        }
    },

    cancelServiceRequest: function () {
        var me = this,
            mainView = me.getMainView(),
            editFormView = mainView.getNavigationBar().getCurrentView(),
            record = editFormView.getRecord(),
            serviceDeskRequestsStore = Ext.getStore('serviceDeskRequestsStore');

        record.set('status', 'CANCELLED');
        serviceDeskRequestsStore.setAutoSync(false);
        serviceDeskRequestsStore.sync(function () {
            serviceDeskRequestsStore.setAutoSync(true);
            mainView.getNavigationBar().getBackButton().fireEvent('tap');
        });
    },

    onViewPushed: function (mainView, pushedView) {
        var syncServiceDeskRequestsButton = this.getSyncServiceDeskRequestsButton();
        this.callParent(arguments);

        if (syncServiceDeskRequestsButton && pushedView.xtype === 'serviceDeskRequestListPanel') {
            syncServiceDeskRequestsButton.activityType = pushedView.getActivityType();
        }

        WorkplacePortal.util.Ui.showHideToolbarButtons(mainView, pushedView, this);
    },

    onViewPopped: function (mainView) {
        var currentView,
            syncServiceDeskRequestsButton;

        this.callParent(arguments);

        currentView = mainView.getNavigationBar().getCurrentView();
        syncServiceDeskRequestsButton = this.getSyncServiceDeskRequestsButton();

        if (syncServiceDeskRequestsButton && currentView.xtype === 'serviceDeskRequestListPanel') {
            syncServiceDeskRequestsButton.activityType = currentView.getActivityType();
        }

        WorkplacePortal.util.Ui.showHideToolbarButtons(mainView, currentView, this);
    },

    /**
     * Handle tap on a room in Floor Plan view.
     * @param roomCode room code as bl_id;fl_id;rm_id
     */
    onRoomTap: function (roomCode) {
        var me = this,
            codes = roomCode.split(';');

        me.confirmHotelSearchOrDisplayEmployee(codes[0], codes[1], codes[2]);
    },

    /**
     * Handle tap on a room in Room List view.
     * @param list
     * @param index
     * @param target
     * @param record
     */
    onRoomListItemTap: function (list, index, target, record) {
        var me = this,
            location = record.getLocationFields();

        me.confirmHotelSearchOrDisplayEmployee(location.bl_id, location.fl_id, location.rm_id);
    },

    /**
     * @private
     * @param blId
     * @param flId
     * @param rmId
     */
    confirmHotelSearchOrDisplayEmployee: function (blId, flId, rmId) {
        var me = this,
            currentView = me.getMainView().getNavigationBar().getCurrentView();

        if (currentView.getEditViewClass() === 'WorkplacePortal.view.HotelingSearchConfirm') {
            me.goToHotelingConfirmForm(blId, flId, rmId);
        } else if (WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.facInfMenuActions.locateEmployee) {
            me.onDisplayEmployeesInfo(blId, flId, rmId);
        } else {
            WorkplacePortal.util.NavigationHelper.onDisplayRoomInfo(blId, flId, rmId);
        }
    },

    /**
     * Navigate to hoteling confirm room after selected room from list or floor plan.
     * @param blId
     * @param flId
     * @param rmId
     */
    goToHotelingConfirmForm: function (blId, flId, rmId) {
        var record = WorkplacePortal.util.Hoteling.getAvailableRoomRecord(blId, flId, rmId),
            searchFormView = this.getNavigationBar().getCurrentView();

        if (!Ext.isEmpty(record)) {
            this.displayUpdatePanel(searchFormView, record);
        }
    },

    /**
     * Display employee report.
     * @param blId
     * @param flId
     * @param rmId
     */
    onDisplayEmployeesInfo: function (blId, flId, rmId) {
        var me = this,
            employeesStore = Ext.getStore('employeesReportStore'),
            roomPctsStore = Ext.getStore('workspaceTransactionsStore'),
            reportConfig = Space.view.report.Configuration.getEmployeeReportConfiguration(),
            detailView = Ext.create('Common.view.report.Detail', reportConfig),
            filterArray,
            emFilter;

        filterArray = WorkplacePortal.util.Filter.getRoomFilterArray(blId, flId, rmId);
        emFilter = Ext.create('Common.util.Filter', {
            property: 'em_id',
            value: '',
            isEqual: false,
            matchIsNullValue: true,
            conjunction: 'AND',
            exactMatch: true
        });
        filterArray.push(emFilter);

        detailView.setStore('employeesReportStore');

        roomPctsStore.retrieveAllStoreRecords(filterArray, function (records) {
            var emFilterArray = [],
                i;
            if (records && records.length > 0) {
                for (i = 0; i < records.length; i++) {
                    emFilterArray.push(WorkplacePortal.util.Filter.getFilterForField('em_id', records[i].get('em_id'), 'OR'));
                }
                employeesStore.clearFilter();
                employeesStore.setDisablePaging(true);
                employeesStore.setFilters(emFilterArray);
                employeesStore.load(function () {
                    employeesStore.setDisablePaging(false);
                    detailView.show();
                }, me);
            } else {
                Ext.Msg.alert(me.getLocateEmployeeTitle(), me.getNoEmText());
            }
        }, me);
    },

    /**
     * @override
     *
     * Displays an Edit Panel for adding new records to the List View. The displayed Edit Panel is
     * determined by the List View editViewClass configuration setting.
     *
     * @param {Common.view.navigation.EditBase/Common.view.navigation.ListBase} currentView
     * The currently displayed view.
     */
    displayAddPanel: function (currentView) {
        var activityType = currentView.getActivityType(),
            editViewClassName,
            view,
            config = {
                isCreateView: true,
                activityType: activityType
            };

        if (currentView.xtype === 'reservationListPanel') {
            // the edit view class is changed by Locate Room
            currentView.setEditViewClass('WorkplacePortal.view.ReservationSearchForm');
        } else if (currentView.xtype === 'hotelingListPanel') {
            // the edit view class is changed by Locate Room
            currentView.setEditViewClass('WorkplacePortal.view.HotelingSearchForm');
        }

        editViewClassName = currentView.getEditViewClass();

        if (editViewClassName === 'WorkplacePortal.view.ServiceDeskRequestForm') {
            config.title = this.getRequestLabel();
            config.displayCameraIcon = true;

            view = this.getModalAddPanel(currentView, config);

            Ext.Viewport.add(view);
            view.show();

        } else {
            view = Ext.create(editViewClassName, config);

            if (view.xtype === 'reservationSearchFormPanel') {
                view.setRecord(WorkplacePortal.util.NavigationHelper.createReservationRoomArrangeRecord());
            } else if (view.xtype === 'hotelingSearchFormPanel') {
                view.setRecord(Ext.create('WorkplacePortal.model.HotelingBookingSearch'));
            }

            this.getMainView().push(view);
        }
    },

    /**
     * Override
     *
     * @param view
     * @param record
     */
    displayUpdatePanel: function (view, record) {
        var editViewClass,
            updateView;

        if (view.isServiceRequestList || view.isFacilityInformationList) {
            WorkplacePortal.util.NavigationHelper.mobileAction = record.get('mobile_action');
        }

        // get view class to create
        editViewClass = this.determineUpdateViewClass(view);


        // create view
        updateView = this.createUpdateView(view, record, editViewClass);

        // filter stores and push the update view
        this.pushUpdateView(view, updateView, record);
    },

    /**
     * Filter stores and push the update view
     *
     * @param currentView The current view
     * @param updateView The update view to push
     * @param record The current record
     */
    pushUpdateView: function (currentView, updateView, record) {
        var pushView = function () {
            this.getMainView().push(updateView);
        };

        if (updateView.isNavigationList && typeof updateView.setParentId === 'function') {
            WorkplacePortal.util.NavigationHelper.setParentIdToNavigationLists(updateView, record);
        } else if (updateView.isFloorPlanPanel) {
            WorkplacePortal.util.Ui.prepareDrawingViewForDisplay(currentView, updateView, record, this.getPlanTypeButtonPicker());
        } else if (updateView.xtype === 'locateRoomPanel') {
            updateView.setRecord(Ext.create('WorkplacePortal.model.LocateRoom'));
        } else if (updateView.xtype === 'locateEmployeePanel') {
            updateView.setRecord(Ext.create('Common.model.Employee'));
        } else if (updateView.xtype === 'reservationSearchConfirmPanel'
            || updateView.xtype === 'hotelingSearchConfirmPanel'
            || updateView.xtype === 'serviceDeskRequestFormPanel') {
            updateView.setRecord(record);
        }

        if (updateView.xtype === 'siteListPanel') {
            WorkplacePortal.util.Ui.prepareSiteListPanelForDisplay(currentView, record, pushView, this);
        } else if (updateView.xtype === 'serviceDeskRequestListPanel') {
            WorkplacePortal.util.Filter.filterServiceDeskRequestList(this.getServiceDeskRequestListView().down('list'), currentView.isServiceRequestList, record.get('activity_type'), pushView, this);
        } else {
            Ext.callback(pushView, this);
        }

    },

    /**
     * Returns the view class for the update view of the current view
     *
     * @param currentView The current view
     */
    determineUpdateViewClass: function (currentView) {
        var editViewClass;

        if (currentView.isServiceRequestList) {
            editViewClass = WorkplacePortal.util.Ui.determineServiceRequestViewClass(WorkplacePortal.util.NavigationHelper.mobileAction);
        } else if (currentView.isFacilityInformationList) {
            editViewClass = WorkplacePortal.util.Ui.determineFacilityInfoViewClass(WorkplacePortal.util.NavigationHelper.mobileAction);
        } else if (currentView.xtype === 'serviceDeskRequestListPanel'
            && WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.facInfMenuActions.myServiceReq) {
            editViewClass = currentView.getEditViewClass();
        } else {
            editViewClass = currentView.getEditViewClass();
        }

        return editViewClass;
    },

    /**
     * Returns the view object for the given view class name
     *
     * @param currentView The current view
     * @param record The current record
     * @param editViewClass The view class to create
     */
    createUpdateView: function (currentView, record, editViewClass) {
        var me = this,
            updateView,
            activityType;

        if (currentView.isServiceRequestList || currentView.isFacilityInformationList) {
            activityType = record.get('activity_type');
            updateView = Ext.create(editViewClass, {
                activityType: activityType,
                mobileAction: WorkplacePortal.util.NavigationHelper.mobileAction
            });
        } else if (editViewClass === 'WorkplacePortal.view.ServiceDeskRequestForm') {
            updateView = Ext.create(editViewClass, {
                title: me.getRequestLabel()
            });
        } else if (editViewClass === 'WorkplacePortal.view.ReservationSearchResult') {
            updateView = Ext.create(editViewClass, {
                data: record
            });
        } else {
            updateView = Ext.create(editViewClass);
        }

        return updateView;
    },

    /**
     * Override the function from class Common.controller.NavigationController.
     */
    saveEditPanel: function (currentView) {
        if (currentView.xtype === 'serviceDeskRequestFormPanel') {
            WorkplacePortal.util.ServiceDeskRequest.onSubmitServiceDeskRequest(this.getServiceDeskRequestFormPanel());
        } else {
            this.callParent(arguments);
        }
    },

    /**
     * Handle tap on Select button for available room for reservation.
     * @param button Select button or right arrow icon button on phone devices.
     */
    onSelectAvailableRoom: function (button) {
        var record = button.getRecord(),
            availableFormView = this.getNavigationBar().getCurrentView();

        availableFormView.setEditViewClass('WorkplacePortal.view.ReservationSearchConfirm');
        this.displayUpdatePanel(availableFormView, record);
    },

    /**
     * Handle tap on locate icon button for reservation list items.
     * @param button
     */
    onLocateReservationRoom: function (button) {
        var record = button.getRecord();

        // Disable the list tap event to prevent showing the room report
        this.setDisableListTapEvent(true);

        this.selectButtonPickerPlanType(WorkplacePlansHighlight.planTypes.RESERVATIONS);
        this.locateRoom(record);
    },

    /**
     * Handle tap on locate icon button in Cconfirm reservation screen.
     */
    onLocateConfirmRoom: function () {
        var confirmFormView = this.getNavigationBar().getCurrentView(),
            confirmRecord = confirmFormView.getRecord();

        this.selectButtonPickerPlanType(WorkplacePlansHighlight.planTypes.RESERVATIONS);
        this.locateRoom(confirmRecord);
    },

    /**
     * Handle tap on locate icon button for hoteling list items.
     * @param button
     */
    onLocateHotelingRoom: function (button) {
        var record = button.getRecord();

        // Disable the list tap event to prevent showing the room report
        this.setDisableListTapEvent(true);

        this.selectButtonPickerPlanType(WorkplacePlansHighlight.planTypes.HOTELING);
        this.locateRoom(record);
    },

    /**
     * Handle tap on Locate button in Locate Room screen.
     */
    onLocateRoom: function () {
        var searchFormView = this.getNavigationBar().getCurrentView(),
            searchRecord = searchFormView.getRecord();

        if (!searchRecord.isValid()) {
            searchFormView.displayErrors(searchRecord);
            return;
        }

        this.selectButtonPickerPlanType(WorkplacePlansHighlight.planTypes.LOCATE_RM);
        this.locateRoom(searchRecord);
    },

    /**
     * Handle tap on Locate button in Locate Employee screen.
     */
    onLocateEmployee: function () {
        var me = this,
            searchFormView = me.getNavigationBar().getCurrentView(),
            searchRecord = searchFormView.getRecord(),
            nameFirst = searchRecord.get('name_first'),
            nameLast = searchRecord.get('name_last'),
            emId = searchRecord.get('em_id'),
            employeesStore = Ext.getStore('employeesStore'),
            emFilterArray = [],
            roomRecord,
            buildingsStore,
            buildingFilter,
            employeeData;

        if (!Ext.isEmpty(nameFirst)) {
            emFilterArray.push(WorkplacePortal.util.Filter.getFilterForField('name_first', nameFirst));
        }

        if (!Ext.isEmpty(nameLast)) {
            emFilterArray.push(WorkplacePortal.util.Filter.getFilterForField('name_last', nameLast));
        }

        if (!Ext.isEmpty(emId)) {
            emFilterArray.push(WorkplacePortal.util.Filter.getFilterForField('em_id', emId));
        }

        if (Ext.isEmpty(emFilterArray)) {
            Ext.Msg.alert(me.getLocateEmployeeTitle(), me.getLocateEmployeeSelectMessage());
            return;
        }

        employeesStore.retrieveRecord(emFilterArray, function (emRecord) {
            if (me.employeeRecordHasLocation(emRecord)) {
                employeeData = emRecord.getData();
                roomRecord = new Common.model.Room();
                roomRecord.set('bl_id', employeeData.bl_id);
                roomRecord.set('fl_id', employeeData.fl_id);
                roomRecord.set('rm_id', employeeData.rm_id);

                buildingsStore = Ext.getStore('spaceBookBuildings');
                buildingFilter = WorkplacePortal.util.Filter.getFilterForField('bl_id', employeeData.bl_id);

                buildingsStore.retrieveRecord(buildingFilter, function (blRecord) {
                    if (blRecord) {
                        roomRecord.set('site_id', blRecord.get('site_id'));
                    }
                    me.selectButtonPickerPlanType(WorkplacePlansHighlight.planTypes.LOCATE_EM);
                    me.locateRoom(roomRecord);
                }, me);
            } else {
                Ext.Msg.alert(me.getLocateEmployeeTitle(), me.getLocateEmployeeMessage());
            }
        }, me);
    },

    /**
     * Checks if the employee record exists and has a building, floor and room location
     * @private
     *
     * @param employeeRecord
     */
    employeeRecordHasLocation: function (employeeRecord) {
        if (employeeRecord) {
            return ((employeeRecord.get('bl_id') !== null) &&
            (employeeRecord.get('fl_id') !== null) &&
            (employeeRecord.get('rm_id') !== null));

        } else {
            return false;
        }
    },

    selectButtonPickerPlanType: function (planType) {
        var defaultRecord = Space.SpaceFloorPlan.getDefaultPlanTypeRecord(),
            planTypeStore = Ext.getStore('planTypes'),
            planTypeRecord;

        if (planType) {
            planTypeRecord = planTypeStore.findRecord('plan_type', planType);
        }

        this.getPlanTypeButtonPicker().setValue(planTypeRecord || defaultRecord);
    },

    /**
     * Display room on floor plan.
     * @param roomRecord
     */
    locateRoom: function (roomRecord) {
        var me = this,
            searchFormView = me.getNavigationBar().getCurrentView(),
            blId = roomRecord.get('bl_id'),
            flId = roomRecord.get('fl_id'),
            rmId = roomRecord.get('rm_id');

        searchFormView.setEditViewClass('WorkplacePortal.view.FloorPlan');

        // Apply the room list filter
        Space.Space.setPermanentFilterForFields(['bl_id', 'fl_id', 'rm_id'], [blId, flId, rmId], 'roomsStore', [],
            function () {
                me.displayUpdatePanel(searchFormView, roomRecord);
            }, me);
    },

    /**
     * Handle tap on Site button in floor plan screen. Displays site plan and buildings list.
     */
    onShowSitePlan: function () {
        var me =this,
            currentView = this.getNavigationBar().getCurrentView(),
            record = currentView.getRecord(),
            siteId = record.get('site_id'),
            buildingsFilter = WorkplacePortal.util.Filter.getFilterForField('bl_id', record.get('bl_id'));

        if (Ext.isEmpty(siteId)) {
            siteId = me.getSiteForBuilding(record.get('bl_id'));
        }

        currentView.setEditViewClass('Space.view.Site');
        Space.Space.setSitePermanentFilter(siteId, 'spaceBookBuildings', buildingsFilter, function(){
            me.displayUpdatePanel(currentView, record);
            me.setActiveBlButton(siteId);
        });

    },

    getSiteForBuilding: function (blId) {
        var buildingsStore = Ext.getStore('spaceBookBuildings'),
            buildingRecord,
            siteId = '';

        buildingRecord = buildingsStore.findRecord('bl_id', blId);
        if (buildingRecord) {
            siteId = buildingRecord.get('site_id');
        }
        return siteId;
    },

    /**
     * Set active the site map toggle button if the map is available,
     * else activate the list button.
     */
    setActiveBlButton: function (siteId) {
        var sitesStore = Ext.getStore('spaceBookSites'),
            buildingsSegmentedButton = this.getBuildingsSegmentedButton(),
            activeButton,
            siteFilter = WorkplacePortal.util.Filter.getFilterForField('site_id', siteId);

        sitesStore.retrieveRecord(siteFilter, function (siteRecord) {
            activeButton = (siteRecord && siteRecord.get('detail_dwg')) ? 1 : 0;
            if (buildingsSegmentedButton) {
                buildingsSegmentedButton.setPressedButtons(activeButton);
            }
        }, this);
    },

    onBuildingSegmentedButtonToggled: function (segmentedButton, button, isPressed) {
        var blStore = Ext.getStore('spaceBookBuildings'),
            highlightBuildings = function () {
                WorkplacePlansHighlight.updateSitePlanHighlight(blStore);
            };

        Space.Space.onBuildingSegmentedButtonToggled(button, isPressed, highlightBuildings, this);
    },

    onShowSiteMapInfo: function () {
        var me = this,
            currentView = me.getMainView().getNavigationBar().getCurrentView(),
            siteId = currentView.getParentId(),
            store = Ext.getStore('spaceBookSites'),
            siteFilter = WorkplacePortal.util.Filter.getFilterForField('site_id', siteId),
            reportConfig = Space.view.report.Configuration.getSiteReportConfig(),
            detailReport;

        detailReport = Ext.create('Common.view.report.Detail', reportConfig);

        store.retrieveRecord([siteFilter], function (siteRecord) {
            detailReport.setRecord(siteRecord);
            detailReport.show();
        }, me);
    },

    // Can we extend Space.controller.Navigation and include these functions in a different controller?
    //
    onSiteListTapped: function (list, index, target, record) {
        var me = this,
            filter,
            bldgsList;

        if (WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.servReqMenuActions.hoteling
            || WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.facInfMenuActions.myHoteling) {
            bldgsList = WorkplacePortal.util.Filter.getBuildingsList(WorkplacePortal.util.Hoteling.availableRooms);
            filter = WorkplacePortal.util.Filter.getFilterForFieldFromList('bl_id', bldgsList);
        } else {
            filter = WorkplacePortal.util.Filter.getDepartmentFilter('bl_id');
        }

        me.getSiteList().setRecord(record);
        Space.Space.setSitePermanentFilter(record.get('site_id'), 'spaceBookBuildings', filter, function () {
            me.displayUpdatePanel(list, record);
            Space.Space.setActiveBlButton(me);
        }, me);
    },

    onBuildingListTapped: function (list, index, target, record) {
        var blId,
            filter,
            availableRooms;

        if (WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.facInfMenuActions.locateRoom
            || WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.facInfMenuActions.locateEmployee
            || WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.servReqMenuActions.reservations
            || WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.facInfMenuActions.myReservReq) {
            return;
        }

        blId = record.get('bl_id');
        if (blId) {
            if (WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.servReqMenuActions.hoteling
                || WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.facInfMenuActions.myHoteling) {
                availableRooms = WorkplacePortal.util.Hoteling.availableRooms;
                filter = WorkplacePortal.util.Filter.getFloorsFilter(blId, availableRooms);
            } else {
                filter = WorkplacePortal.util.Filter.getDepartmentFilter('fl_id');
            }

            Space.Space.setPermanentFilterForFields(['bl_id'], [blId], 'spaceBookFloors', filter, function () {
                this.displayUpdatePanel(list, record);
            }, this);
        }
    },

    onFloorListTapped: function (list, index, target, record) {
        var me = this,
            userProfile = Common.util.UserProfile.getUserProfile(),
            blId, flId, availableRooms;


        blId = record.get('bl_id');
        flId = record.get('fl_id');
        me.clickedBlId = blId;
        me.clickedFlId = flId;

        list.setEditViewClass('WorkplacePortal.view.FloorPlan');

        if (WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.servReqMenuActions.hoteling
            || WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.facInfMenuActions.myHoteling) {
            me.selectButtonPickerPlanType(WorkplacePlansHighlight.planTypes.HOTELING);

            // Apply the room list filter
            availableRooms = WorkplacePortal.util.Hoteling.getAvailableRoomsForFloor(blId, flId);
            Space.Space.setBuildingFloorAndRoomsPermanentFilter(blId, flId, availableRooms, 'roomsStore', function () {
                me.displayUpdatePanel(list, record);
            }, me);
        } else {
            me.selectButtonPickerPlanType(WorkplacePlansHighlight.planTypes.MY_DEPT_SPACE);

            Space.Space.setPermanentFilterForFields(['bl_id', 'fl_id', 'dv_id', 'dp_id'],
                [blId, flId, userProfile.dv_id, userProfile.dp_id], 'roomsStore', [], function () {
                    me.displayUpdatePanel(list, record);
                }, me);
        }
    },

    /**
     * When a building is clicked on the site map
     *
     * @param blId
     */
    onClickBuilding: function (blId) {
        var me = this.navController,
            siteMapView = me.getSiteMap(),
            filter,
            storeId = 'spaceBookFloors',
            store = Ext.getStore(storeId),
            availableRooms,
            navigateNextScreen = true;

        if (WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.facInfMenuActions.locateRoom
            || WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.facInfMenuActions.locateEmployee
            || WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.servReqMenuActions.reservations
            || WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.facInfMenuActions.myReservReq) {
            return;
        }

        if (blId) {
            if (WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.servReqMenuActions.hoteling
                || WorkplacePortal.util.NavigationHelper.mobileAction === WorkplacePortal.util.Ui.facInfMenuActions.myHoteling) {
                availableRooms = WorkplacePortal.util.Hoteling.availableRooms;
                navigateNextScreen = WorkplacePortal.util.Hoteling.existAvailableRoomsForBl(availableRooms, blId);
                if (!navigateNextScreen) {
                    Ext.Msg.alert(me.getNoRoomsAvailableMessageTitle(), me.getNoRoomsAvailableMessage());
                }
                filter = WorkplacePortal.util.Filter.getFloorsFilter(blId, availableRooms);
            } else {
                filter = WorkplacePortal.util.Filter.getDepartmentFilter('fl_id');
            }

            Space.Space.setPermanentFilterForFields(['bl_id'], [blId], storeId, filter, function () {
                Space.Space.getBuildingRecord(blId, function (buildingRecord) {
                    if (navigateNextScreen) {
                        me.displayUpdatePanel(siteMapView, buildingRecord);

                        // KB3041816 - to call onStoreLoad for 'No More Records' text display
                        store.load();
                    }
                }, me);
            }, me);
        }
    },

    displayFilterReservationView: function () {
        var me = this,
            view = Ext.create('WorkplacePortal.view.FilterReservations');

        me.getMainView().push(view);
    },

    applyFilterReservation: function () {
        var me = this,
            mainView = me.getMainView(),
            navigationBar = mainView.getNavigationBar(),
            filterValues = navigationBar.getCurrentView().getValues(),
            filterArray,
            store = Ext.getStore('userReservationRoomsStore');

        filterArray = WorkplacePortal.util.Filter.createFilterViewRestriction(filterValues);
        store.clearFilter();
        store.setFilters(filterArray);
        store.loadPage(1, function () {
            mainView.pop();
        }, me);
    },

    clearReservationFilter: function () {
        var currentView = this.getMainView().getNavigationBar().getCurrentView(),
            store = Ext.getStore('userReservationRoomsStore');

        if (currentView.xtype === 'filterReservationPanel') {
            currentView.reset();
        }

        WorkplacePortal.util.Filter.filterViewSelectedValues = {};

        store.clearFilter();
        store.loadPage(1);
    },

    // TODO: Duplicated in AppLauncher.controller.Preferences
    resetBackgroundData: function () {
        var downloadStore = Ext.getStore('tableDownloadStore'),
            downloadTime = new Date(1900, 0, 1, 12, 0, 0);

        downloadStore.load(function (records) {
            Ext.each(records, function (record) {
                record.set('downloadTime', downloadTime);
                record.set('reset', 1);
            });
            downloadStore.sync(function() {
                // reload validating stores
                SyncManager.doInSession(function () {
                    return SyncManager.downloadValidatingTables()
                        .then(function () {
                            SyncManager.loadStores(SyncManager.getValidatingStores(true));
                        });
                });
            });
        });
    },

    /**
     * Wraps the Store#load function in a Promise. The Promise is resolved when the load operation
     * is completed.
     * @private
     * @param {String} storeId store id.
     * @returns {Promise}
     */
    loadStore: function(storeId) {
        var store = Ext.getStore(storeId);
        return new Promise(function(resolve) {
            store.load(resolve);
        });
    }
});