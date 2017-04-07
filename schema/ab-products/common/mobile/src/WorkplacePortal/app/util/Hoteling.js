Ext.define('WorkplacePortal.util.Hoteling', {
    singleton: true,

    availableRooms: [],

    bookMessage: LocaleManager.getLocalizedString('Booking', 'WorkplacePortal.util.Hoteling'),
    cancelMessage: LocaleManager.getLocalizedString('Canceling', 'WorkplacePortal.util.Hoteling'),
    checkInMessage: LocaleManager.getLocalizedString('Checking in', 'WorkplacePortal.util.Hoteling'),
    searchMessage: LocaleManager.getLocalizedString('Searching', 'WorkplacePortal.util.Hoteling'),
    errorMessageTitle: LocaleManager.getLocalizedString('Error', 'WorkplacePortal.util.Hoteling'),
    checkInHotelingTitle: LocaleManager.getLocalizedString('Check In', 'WorkplacePortal.util.Hoteling'),
    verifiedHotelingMessage: LocaleManager.getLocalizedString('The reservation is already verified', 'WorkplacePortal.util.Hoteling'),
    checkInHotelingMessage: LocaleManager.getLocalizedString('Do you want to check into the space now and claim your reservation?  You may lose your reservation if you do not.', 'WorkplacePortal.util.Hoteling'),
    cancelHotelingTitle: LocaleManager.getLocalizedString('Cancel the Booking', 'WorkplacePortal.util.Hoteling'),
    confirmCancelHotelingMessage: LocaleManager.getLocalizedString('Cancel the Booking Occurrence?', 'WorkplacePortal.util.Hoteling'),
    searchMessageTitle: LocaleManager.getLocalizedString('Search', 'WorkplacePortal.util.Hoteling'),
    noRoomsMatchCriteriaMessage: LocaleManager.getLocalizedString('No rooms match the search criteria', 'WorkplacePortal.util.Hoteling'),

    /**
     * Handle tap on Book button.
     * @param mainView
     */
    onConfirmRoomHoteling: function (mainView) {
        var me = this,
            navigationBar = mainView.getNavigationBar(),
            confirmView = navigationBar.getCurrentView(),
            confirmRecord = confirmView.getRecord(),
            userProfile = Common.util.UserProfile.getUserProfile();

        // add user parameters
        confirmRecord.set('em_id', userProfile.em_id);
        confirmRecord.set('dv_id', userProfile.dv_id);
        confirmRecord.set('dp_id', userProfile.dp_id);

        // call the reservation WFR
        me.confirmRoomHoteling(confirmRecord, function (success) {
            var viewStack,
                i;
            if (success) {
                // refresh the reservations store
                me.onSyncHotelingBookingsButton(function () {
                    // back to the Hoteling list
                    viewStack = navigationBar.getViewStack();
                    for (i = 0; i < viewStack.length; i++) {
                        if (viewStack[i].xtype === 'hotelingListPanel') {
                            mainView.pop(viewStack.length - i - 1);
                        }
                    }
                }, me);
            }
        }, me);
    },

    /**
     * Handle tap on cancel hoteling list item.
     * @param button delete icon button
     */
    onCancelRoomHoteling: function (button) {
        var me = this,
            record = button.getRecord();

        Ext.Msg.confirm(me.cancelHotelingTitle, me.confirmCancelHotelingMessage,
            function (buttonId) {
                if (buttonId === 'yes') {
                    // call the cancel room reservation WFR
                    me.cancelRoomHoteling(record, function (success) {
                        if (success) {
                            // refresh the reservations store
                            me.onSyncHotelingBookingsButton();
                        }
                    }, me);
                }
            });
    },

    /**
     * Handle tap on check in hoteling list item.
     * @param button check icon button
     */
    onCheckInHotelingRoom: function (button) {
        var me = this,
            record = button.getRecord(),
            pctId = record.get('pct_id'),
            isConfirmed = record.get('confirmed');

        if (isConfirmed === 1) {
            Ext.Msg.alert(me.checkInHotelingTitle, me.verifiedHotelingMessage);
            return;
        }

        Ext.Msg.confirm(me.checkInHotelingTitle, me.checkInHotelingMessage,
            function (buttonId) {
                if (buttonId === 'yes') {
                    // call the cancel room reservation WFR
                    me.checkInHotelingRoom(pctId, function (success) {
                        if (success) {
                            // refresh the reservations store
                            me.onSyncHotelingBookingsButton();
                        }
                    }, me);
                }
            });
    },

    onSearchHotelingRooms: function (navigationController) {
        var me = this,
            searchFormView = navigationController.getNavigationBar().getCurrentView(),
            searchRecord = searchFormView.getRecord();

        me.searchAvailableHotelingRooms(searchRecord, function (success, availableRooms) {
            if (success) {
                if (Ext.isEmpty(availableRooms)) {
                    Ext.Msg.alert(me.searchMessageTitle, me.noRoomsMatchCriteriaMessage);
                } else {
                    me.displayHotelingSearchResult(searchFormView, availableRooms, navigationController);
                }
            }
        }, me);
    },

    // subfunction of onConfirmRoomHoteling
    confirmRoomHoteling: function (confirmRecord, onCompleted, scope) {
        var workflowMethodId = 'AbWorkplacePortal-WorkplacePortalHotelingMobileService-createBooking',
            requestParameters = WorkplacePortal.util.WorkflowRules.getParametersForConfirmHoteling(confirmRecord);

        WorkplacePortal.util.WorkflowRules.callWorkflowMethod(workflowMethodId, [requestParameters],
            this.bookMessage, 'confirmHoteling', '', onCompleted, scope);
    },

    // subfunction of onCancelRoomHoteling
    cancelRoomHoteling: function (record, onCompleted, scope) {
        var workflowMethodId = 'AbWorkplacePortal-WorkplacePortalHotelingMobileService-cancelBooking',
            requestParameters = WorkplacePortal.util.WorkflowRules.getParametersForCancelHoteling(record);

        WorkplacePortal.util.WorkflowRules.callWorkflowMethod(workflowMethodId, requestParameters,
            this.cancelMessage, 'cancelHoteling', '', onCompleted, scope);
    },

    // subfunction of onCheckInHotelingRoom
    checkInHotelingRoom: function (pctId, onCompleted, scope) {
        var workflowMethodId = 'AbWorkplacePortal-WorkplacePortalHotelingMobileService-checkInBooking',
            userName = ConfigFileManager.username,
            requestParameters = {pct_id: pctId.toString()};

        WorkplacePortal.util.WorkflowRules.callWorkflowMethod(workflowMethodId, [userName, requestParameters],
            this.checkInMessage, 'checkInHoteling', '', onCompleted, scope);
    },

    // subfunction of onSearchHotelingRooms
    searchAvailableHotelingRooms: function (searchRecord, onCompleted, scope) {
        var workflowMethodId = 'AbWorkplacePortal-WorkplacePortalHotelingMobileService-searchAvailableSpaces',
            requestParameters = WorkplacePortal.util.WorkflowRules.getParametersForHoteling(searchRecord),
            recurringRule = '';

        WorkplacePortal.util.WorkflowRules.callWorkflowMethod(workflowMethodId, [requestParameters, recurringRule],
            this.searchMessage, 'searchHoteling', searchRecord, onCompleted, scope);
    },

    onSyncHotelingBookingsButton: function (onCompleted, scope) {
        var hotelingRequestsStore = Ext.getStore('hotelingRequestsStore'),
            workspaceTransactionsStore = Ext.getStore('workspaceTransactionsStore');

        WorkplacePortal.util.SyncHelper.onSyncValidatingTables([hotelingRequestsStore, workspaceTransactionsStore], onCompleted, scope);
    },

    /**
     * Display hoteling search result: display the floor plan if all results are on the same floor,
     * display the floors list if results are in the same building, or display sites list.
     * @param searchFormView
     * @param availableRooms
     * @param navigationController
     */
    displayHotelingSearchResult: function (searchFormView, availableRooms, navigationController) {
        var flId,
            oneFl = true,
            blId,
            oneBl = true,
            i;

        if (!Ext.isEmpty(availableRooms)) {
            flId = availableRooms[0].get('fl_id');
            blId = availableRooms[0].get('bl_id');
        }

        for (i = 1; i < availableRooms.length; i++) {
            if (availableRooms[i].get('fl_id') !== flId) {
                oneFl = false;
            }
            if (availableRooms[i].get('bl_id') !== blId) {
                oneBl = false;
            }
        }

        if (oneFl) {
            // display floor plan
            this.locateHotelingRooms(searchFormView, availableRooms, navigationController);
        } else if (oneBl) {
            // display floors list
            this.displayHotelingFloorList(searchFormView, availableRooms, navigationController);
        } else {
            // display sites list (buildings can be from different sites)
            searchFormView.setEditViewClass('Space.view.SiteList');
            navigationController.displayUpdatePanel(searchFormView, availableRooms);
        }
    },

    /**
     * Display available rooms on floor plan.
     * @param searchFormView
     * @param availableRooms
     * @param navigationController
     */
    locateHotelingRooms: function (searchFormView, availableRooms, navigationController) {
        var blId = availableRooms[0].get('bl_id'),
            flId = availableRooms[0].get('fl_id'),
            floorPlanPanel;

        searchFormView.setEditViewClass('WorkplacePortal.view.FloorPlan');
        navigationController.selectButtonPickerPlanType(WorkplacePlansHighlight.planTypes.HOTELING);

        // Apply the room list filter
        Space.Space.setBuildingFloorAndRoomsPermanentFilter(blId, flId, availableRooms, 'roomsStore', function () {
            navigationController.displayUpdatePanel(searchFormView, availableRooms[0]);

            floorPlanPanel = navigationController.getFloorPlanView();
            WorkplacePortal.util.Ui.setFloorPlanInfo(floorPlanPanel, blId, flId);
        }, this);
    },

    /**
     * Display the list of floors with available rooms.
     * @param searchFormView
     * @param availableRooms
     * @param navigationController
     */
    displayHotelingFloorList: function (searchFormView, availableRooms, navigationController) {
        var me = this,
            record = availableRooms[0],
            blId = record.get('bl_id'),
            floorsFilter = WorkplacePortal.util.Filter.getFloorsFilter(blId, availableRooms);

        searchFormView.setEditViewClass('Space.view.FloorList');

        Space.Space.setPermanentFilterForFields(['bl_id'], [blId], 'spaceBookFloors', floorsFilter, function () {
            Space.Space.getBuildingRecord(blId, function (buildingRecord) {
                navigationController.displayUpdatePanel(searchFormView, buildingRecord);
            }, me);
        }, me);
    },

    /**
     * Find and return the available room record for specified bl_id, fl_id and rm_id.
     * @param blId
     * @param flId
     * @param rmId
     * @returns {*}
     */
    getAvailableRoomRecord: function (blId, flId, rmId) {
        var rooms = this.availableRooms,
            record = null;

        Ext.each(rooms, function (room) {
            if (room.get('bl_id') === blId
                && room.get('fl_id') === flId
                && room.get('rm_id') === rmId) {
                record = room;
            }
        }, this);

        return record;
    },

    /**
     * Compose and return the array of available room records for specified bl_id and fl_id.
     * @param blId
     * @param flId
     * @returns {*}
     */
    getAvailableRoomsForFloor: function (blId, flId) {
        var rooms = [];

        Ext.each(this.availableRooms, function (room) {
            if (room.get('bl_id') === blId
                && room.get('fl_id') === flId) {
                rooms.push(room);
            }
        }, this);

        return rooms;
    },


    /**
     * Verify if building exists in list of available rooms.
     * @param availableRooms
     * @param blId
     * @returns {boolean}
     */
    existAvailableRoomsForBl: function (availableRooms, blId) {
        var i;

        for (i = 0; i < availableRooms.length; i++) {
            if (availableRooms[i].get('bl_id') === blId) {
                return true;
            }
        }

        return false;
    }
});