Ext.define('MaterialInventory.util.Ui', {
    singleton: true,
    userGroups: [
        {
            userName: ConfigFileManager.username,
            groupName: 'RISK-HAZMAT-MOB-ED',
            isMember: false
        },
        {
            userName: ConfigFileManager.username,
            groupName: 'RISK-HAZMAT-MOB-INV',
            isMember: false
        }
    ],

    /**
     * plan type codes (must match values of the active_plantypes.plan_type table field)
     */
    planTypes: {
        ALLOCATION: '1 - ALLOCATION',
        OCCUPANCY: '4 - OCCUPANCY',
        HAZMAT: '8 - HAZMAT',
        INVENTORY: '18 - INVENTORY',
        LOCATE: '14 - LOCATE RM'
    },

    /**
     * The site selected by user
     */
    selectedSite: '',

    /**
     * Flag for indicating that floor plan needs to be reloaded, used after sync.
     */
    floorPlanNeedsReload: false,

    //appModes: ['review', 'update', 'inventory', 'inventoryUpdate'],

    /**
     * Queries the server for the users RISK-HAZMAT-MOB-ED and RISK-HAZMAT-MOB-INV
     * group membership.
     */
    applyUserGroups: function () {
        return MaterialInventory.util.Ui.checkGroupMembership()
            .then(function () {
                MaterialInventory.util.Ui.setAppMode();
                return Promise.resolve();
            });
    },

    checkGroupMembership: function () {
        var me = this;

        var checkGroups = function () {
            var p = Promise.resolve(),
                userGroups = me.userGroups;
            userGroups.forEach(function (group) {
                p = p.then(function () {
                    return MobileSecurityServiceAdapter.isUserMemberOfGroup(group.groupName)
                        .then(function (isMember) {
                            group.isMember = isMember;
                            return Promise.resolve(isMember);
                        });
                });

            });
            return p;
        };

        return checkGroups();
    },

    /**
     * Sets the AppMode based on user groups.
     * @returns {Object}
     */
    setAppMode: function () {
        var appMode,
            isUpdate = false,
            isInventory = false,
            group,
            i;

        for (i = 0; i < this.userGroups.length; i++) {
            group = this.userGroups[i];
            if (group.groupName === 'RISK-HAZMAT-MOB-ED' && group.isMember) {
                isUpdate = true;
            }

            if (group.groupName === 'RISK-HAZMAT-MOB-INV' && group.isMember) {
                isInventory = true;
            }

        }

        if (isUpdate && isInventory) {
            appMode = 'inventoryUpdate';
        } else if (isUpdate) {
            appMode = 'update';
        } else if (isInventory) {
            appMode = 'inventory';
        } else {
            appMode = 'review';
        }
        AppMode.setAppMode(appMode, AppMode.getInventoryDate());
    },

    getPlanTypes: function () {
        //return [this.planTypes.ALLOCATION, this.planTypes.HAZMAT, this.planTypes.INVENTORY, this.planTypes.OCCUPANCY];
        var planTypes = [],
            planTypesStore = Ext.getStore('materialPlanTypes');

        if (planTypesStore && planTypesStore.getData() && planTypesStore.getData().items) {
            planTypes = Ext.Array.pluck(Ext.Array.pluck(planTypesStore.getData().items, 'data'), 'plan_type');
        }

        planTypes.push(MaterialInventory.util.Ui.planTypes.LOCATE);

        return planTypes;
    },

    updateInventoryPlanHighlights: function (record) {
        var filterFieldsList = ['bl_id', 'fl_id', 'has_materials'],
            roomsStore = Ext.getStore('materialRooms'),
            inventoryDate = AppMode.getInventoryDate(),
            doneInventoryDate,
            filterFieldsObject = Common.util.RoomHighlight.composeFilterFieldsObject(filterFieldsList, record),
            isRoomCompletedFn = function (roomSurveyRecord) {
                doneInventoryDate = roomSurveyRecord.get('done_inventory_date');
                return !Ext.isEmpty(doneInventoryDate) && doneInventoryDate >= inventoryDate;
            };

        // highlight only rooms that have materials
        filterFieldsObject.has_materials = 1;

        Common.util.RoomHighlightHelper.getRoomCodesForFloor(filterFieldsObject, filterFieldsList, roomsStore, isRoomCompletedFn, function (roomCodes, completedRoomCodes) {
            Common.util.RoomHighlightHelper.highlightRooms(roomCodes, completedRoomCodes);
        }, this);
    },

    setColorOfCheckButton: function (checkButton, newRecord) {
        var dateLastInv = newRecord.get('date_last_inv'),
            inventoryStartDate = AppMode.getInventoryDate(),
            isVerified = 0;

        if (checkButton.isHidden()) {
            return;
        }

        if (!Ext.isEmpty(dateLastInv) && !Ext.isEmpty(inventoryStartDate) && dateLastInv.getTime() >= inventoryStartDate.getTime()) {
            isVerified = 1;
        }

        checkButton.removeCls('x-button-icon-green');

        if (isVerified === 1) {
            checkButton.addCls('x-button-icon-green');
        } else {
            checkButton.addCls('ab-icon-button');
        }
    },

    /**
     * Reaload location filters with permanent filters.
     */
    loadLocationStore: function (callbackFn, scope) {
        var storeIds = MaterialInventory.util.Materials.locationStoreNames,
            i,
            store;

        for (i = 0; i < storeIds.length; i++) {
            store = Ext.getStore(storeIds[i]);
            if (store.permanentFilter) {
                store.clearFilter();
                store.setFilters(store.permanentFilter);
            }
        }

        SynchronizationManager.loadStoresInSequence(storeIds, callbackFn, scope);
    }
});