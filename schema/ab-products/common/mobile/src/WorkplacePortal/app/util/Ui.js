Ext.define('WorkplacePortal.util.Ui', {
    singleton: true,

    // actions from menu Requests
    servReqMenuActions: {
        serviceDeskCopy: 'ServiceDeskCopy',
        serviceDeskSpace: 'ServiceDeskSpace',
        serviceDeskFurniture: 'ServiceDeskFurniture',
        hoteling: 'Hoteling',
        serviceDeskMove: 'ServiceDeskMove',
        serviceDeskMaintenance: 'ServiceDeskMaintenance',
        reservations: 'Reservations'
    },

    // actions from menu Information
    facInfMenuActions: {
        locateEmployee: 'LocateEmployee',
        locateRoom: 'LocateRoom',
        myDeptSpace: 'MyDeptSpace',
        myHoteling: 'MyHoteling',
        myReservReq: 'MyReservReq',
        myServiceReq: 'MyServiceReq'
    },

    getMobileActionTitle: function (mobileAction) {
        var store,
            record,
            title = '';

        switch (mobileAction) {
            case 'ServiceDeskCopy':
            case 'ServiceDeskSpace':
            case 'ServiceDeskFurniture':
            case 'Hoteling':
            case 'ServiceDeskMove':
            case 'ServiceDeskMaintenance':
            case 'Reservations':
                store = Ext.getStore('facilityServicesMenusStore');
                break;

            /* the other possible values
             case 'LocateEmployee':
             case 'LocateRoom':
             case 'MyDeptSpace':
             case 'MyHoteling':
             case 'MyReservReq':
             case 'MyServiceReq':*/

            default:
                store = Ext.getStore('mobileMenusStore');
                break;
        }

        record = store.findRecord('mobile_action', mobileAction);
        if (record) {
            title = record.get('title');
        }

        return title;
    },

    getAMonthAgoFormattedDateValue: function () {
        var aMonthAgo = new Date(),
            formattedDate;

        aMonthAgo.setDate(aMonthAgo.getDate() - 30);
        formattedDate = this.formatDate(aMonthAgo);

        return formattedDate;
    },

    formatDate: function (date) {
        return Ext.DateExtras.format(date, 'Y-m-d');
    },

    parseDate: function (date) {
        return Ext.DateExtras.parse(date, 'Y-m-d');
    },

    formatTime: function (time) {
        return Ext.DateExtras.format(time, 'H:i');
    },

    parseTime: function (time) {
        return Ext.DateExtras.parse(time, 'H:i');
    },

    formatDateTime: function (date) {
        return Ext.DateExtras.format(date, 'Y-m-d H:i:s.u');
    },

    /**
     * Returns current date without time.
     */
    getCurrentDateValue: function () {
        var date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0);
    },

    getEnumListDisplayValue: function (tableName, fieldName, fieldValue) {
        var displayValue = '',
            fieldEnumList = TableDef.getEnumeratedList(tableName, fieldName),
            i;

        for (i = 0; i < fieldEnumList.length; i++) {
            if (fieldEnumList[i].objectValue === fieldValue) {
                return fieldEnumList[i].displayValue;
            }
        }

        return displayValue;
    },

    /**
     * Shows/hides all buttons; calls the other showHide functions
     * @param mainView main view
     * @param view the current view
     * @param navControllerScope scope of navigation controller to reference buttons
     */
    showHideToolbarButtons: function (mainView, view, navControllerScope) {
        var addButton = mainView.getNavigationBar().getAddButton(),
            homeButton = navControllerScope.getHomeButton();

        if (addButton) {
            addButton.setHidden(
                (view.xtype !== 'serviceDeskRequestListPanel' || WorkplacePortal.util.NavigationHelper.mobileAction === this.facInfMenuActions.myServiceReq)
                && (view.xtype !== 'reservationListPanel')
                && view.xtype !== 'hotelingListPanel');
        }

        if (homeButton) {
            // Any third and below level page should display the Home icon button.
            homeButton.setHidden(view.xtype === 'mainview' || view.xtype === 'reservationListPanel' || view.xtype === 'hotelingListPanel' || view.xtype === 'serviceDeskRequestListPanel'
                || view.xtype === 'locateRoomPanel' || view.xtype === 'locateEmployeePanel'
                || (view.xtype === 'siteListPanel' && WorkplacePortal.util.NavigationHelper.mobileAction == this.facInfMenuActions.myDeptSpace));
        }

        this.showHidePlansButtons(view, navControllerScope);
        this.showHideDownloadButtons(view, navControllerScope);
        this.showHideSyncButtons(view, navControllerScope);
        this.showCancelServiceRequestButton(view, navControllerScope);
    },

    /**
     * Shows/hides the Cancel buttons
     * @param view current view
     * @param navigationController scope of navigation controller to reference buttons
     */
    showCancelServiceRequestButton: function (view, navigationController) {
        var cancelRequestButton = navigationController.getCancelRequestButton(),
            status;

        if (cancelRequestButton && view.xtype === 'serviceDeskRequestFormPanel') {
            status = view.getRecord().get('status');
            cancelRequestButton.setHidden(!(status === 'REQUESTED' || status === 'APPROVED'));
        }
    },

    /**
     * Shows/hides the plans buttons
     * @param view current view
     * @param navigationController scope of navigation controller to reference buttons
     */
    showHidePlansButtons: function (view, navigationController) {
        var planTypePicker = navigationController.getPlanTypeButtonPicker(),
            sitePlanButton = navigationController.getSitePlanButton(),
            siteMapInfo = navigationController.getSiteMapInfo();

        if (planTypePicker) {
            planTypePicker.setHidden(true);
        }

        if (sitePlanButton) {
            sitePlanButton.setHidden(WorkplacePortal.util.NavigationHelper.mobileAction !== this.facInfMenuActions.locateRoom
                && WorkplacePortal.util.NavigationHelper.mobileAction !== this.facInfMenuActions.locateEmployee
                && WorkplacePortal.util.NavigationHelper.mobileAction !== this.servReqMenuActions.reservations
                && WorkplacePortal.util.NavigationHelper.mobileAction !== this.facInfMenuActions.myReservReq);
        }

        if (siteMapInfo) {
            siteMapInfo.setHidden(view.xtype !== 'sitePanel'
                || (WorkplacePortal.util.NavigationHelper.mobileAction !== this.facInfMenuActions.locateRoom
                && WorkplacePortal.util.NavigationHelper.mobileAction !== this.facInfMenuActions.locateEmployee));
        }
    },

    /**
     * Shows/hides the Download buttons
     * @param view current view
     * @param navigationController scope of navigation controller to reference buttons
     */
    showHideDownloadButtons: function (view, navigationController) {
        var downloadDataButton = navigationController.getDownloadDataButton(),
            downloadSiteFloorPlans = navigationController.getDownloadSiteFloorPlans();

        if (downloadDataButton) {
            downloadDataButton.setHidden(view.xtype !== 'siteListPanel');
        }

        if (downloadSiteFloorPlans) {
            downloadSiteFloorPlans.setHidden(WorkplacePortal.util.NavigationHelper.mobileAction === this.facInfMenuActions.locateRoom
                || WorkplacePortal.util.NavigationHelper.mobileAction === this.facInfMenuActions.locateEmployee
                || WorkplacePortal.util.NavigationHelper.mobileAction === this.servReqMenuActions.reservations
                || WorkplacePortal.util.NavigationHelper.mobileAction === this.facInfMenuActions.myReservReq);
        }
    },

    /**
     * Shows/hides the Sync buttons
     * @param view current view
     * @param navigationController scope of navigation controller to reference buttons
     */
    showHideSyncButtons: function (view, navigationController) {
        var syncServiceDeskRequestsButton = navigationController.getSyncServiceDeskRequestsButton(),
            syncReservationRequestsButton = navigationController.getSyncReservationRequestsButton(),
            syncHotelingBookingsButton = navigationController.getSyncHotelingBookingsButton();

        if (syncServiceDeskRequestsButton) {
            syncServiceDeskRequestsButton.setHidden(view.xtype !== 'serviceDeskRequestListPanel');
        }

        if (syncReservationRequestsButton) {
            syncReservationRequestsButton.setHidden(view.xtype !== 'reservationListPanel');
        }

        if (syncHotelingBookingsButton) {
            syncHotelingBookingsButton.setHidden(view.xtype !== 'hotelingListPanel');
        }
    },

    /**
     * Prepare the drawing view for display, e.g. get the floor plans and determine the edit view class
     * @param currentView current view
     * @param updateView the update view (drawing view to display)
     * @param record current record
     * @param planTypeButtonPicker
     */
    prepareDrawingViewForDisplay: function (currentView, updateView, record, planTypeButtonPicker) {
        // Retrieve drawing data for the selected floor
        Space.SpaceFloorPlan.loadFloorPlanData(updateView, record, planTypeButtonPicker);

        if (updateView.xtype === 'workplacePortalFloorPlanPanel') {
            if ((currentView.xtype === 'hotelingSearchFormPanel'
                || currentView.xtype === 'floorsListPanel')
                && (WorkplacePortal.util.NavigationHelper.mobileAction === this.servReqMenuActions.hoteling
                || WorkplacePortal.util.NavigationHelper.mobileAction === this.facInfMenuActions.myHoteling)) {
                updateView.setEditViewClass('WorkplacePortal.view.HotelingSearchConfirm');
            } else {
                updateView.setEditViewClass('');
            }
        }
    },

    /**
     * Prepare the Campus view for display, e.g. filter the stores before pushing the view
     * @param currentView current view
     * @param record current record
     * @param onCompleted callbask function
     * @param scope scope for the callback function
     */
    prepareSiteListPanelForDisplay: function (currentView, record, onCompleted, scope) {
        if (currentView.xtype === 'hotelingSearchFormPanel') {
            WorkplacePortal.util.Filter.filterHotelingSitesList(record, onCompleted, scope);
        } else {
            WorkplacePortal.util.Filter.filterMyDepartmentSpaceSitesList(onCompleted, scope);
        }
    },

    determineServiceRequestViewClass: function (mobileAction) {
        var editViewClass = '',
            actions = this.servReqMenuActions;

        if (mobileAction === actions.reservations) {
            editViewClass = 'WorkplacePortal.view.ReservationList';
        } else if (mobileAction === actions.hoteling) {
            editViewClass = 'WorkplacePortal.view.HotelingList';
        } else if (mobileAction === actions.serviceDeskSpace
            || mobileAction === actions.serviceDeskCopy
            || mobileAction === actions.serviceDeskFurniture
            || mobileAction === actions.serviceDeskMove
            || mobileAction === actions.serviceDeskMaintenance) {

            editViewClass = 'WorkplacePortal.view.ServiceDeskRequestList';
        }

        return editViewClass;
    },

    determineFacilityInfoViewClass: function (mobileAction) {
        var actions = this.facInfMenuActions;

        switch (mobileAction) {
            case actions.locateRoom:
                return 'WorkplacePortal.view.LocateRoom';
            case actions.locateEmployee:
                return 'WorkplacePortal.view.LocateEmployee';
            case actions.myDeptSpace:
                return 'Space.view.SiteList';
            case actions.myReservReq:
                return 'WorkplacePortal.view.ReservationList';
            case actions.myHoteling:
                return 'WorkplacePortal.view.HotelingList';
            case actions.myServiceReq:
                return 'WorkplacePortal.view.ServiceDeskRequestList';
            default:
                return 'WorkplacePortal.view.ServiceDeskRequestList';
        }
    },

    /**
     * Set info about current displayed floor in the floor plan drawing component.
     * It will display Building Code - Floor Code - Floor Name using headerText proprty of svgcomponent.
     * @param floorPlanPanel
     * @param blId
     * @param flId
     */
    setFloorPlanInfo: function (floorPlanPanel, blId, flId) {
        var svgcomponent,
            floorPlanStore = Ext.getStore('spaceBookFloors'),
            floorFilters = [],
            headerString = "{0} - {1}",
            headerStringWithName = "{0} - {1} - {2}";

        if (floorPlanPanel) {
            svgcomponent = floorPlanPanel.down('svgcomponent');

            if (svgcomponent) {
                floorFilters.push(Ext.create('Common.util.Filter', {
                    property: 'bl_id',
                    value: blId,
                    exactMatch: true
                }));
                floorFilters.push(Ext.create('Common.util.Filter', {
                    property: 'fl_id',
                    value: flId,
                    exactMatch: true
                }));

                floorPlanStore.retrieveRecord(floorFilters, function (floorRecord) {
                    if (Ext.isEmpty(floorRecord.get('name'))) {
                        svgcomponent.setHeaderText(Ext.String.format(headerString, blId, flId));
                    } else {
                        svgcomponent.setHeaderText(Ext.String.format(headerStringWithName, blId, flId, floorRecord.get('name')));
                    }
                });
            }
        }
    }
});