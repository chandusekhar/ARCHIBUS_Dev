Ext.define('WorkplacePortal.util.Filter', {
    singleton: true,

    /**
     * Current restriction values selected by the user in the Filter form
     */
    filterViewSelectedValues: {},


    getDepartmentFilter: function (fieldName) {
        var departmentStore,
            filterArray = [],
            subFilterArray = [],
            filter,
            userProfile = Common.util.UserProfile.getUserProfile();

        if (fieldName === 'rm_id') {
            filterArray.push(this.getFilterForField('dv_id', userProfile.dv_id));
            filterArray.push(this.getFilterForField('dp_id', userProfile.dp_id));
        } else {
            filter = this.getFilterForField('dummyProperty', 'dummyValue');

            switch (fieldName) {
                case 'site_id':
                case 'bl_id':
                    departmentStore = Ext.getStore('departmentBuildingsStore');
                    break;

                case 'fl_id':
                    departmentStore = Ext.getStore('departmentFloorsStore');
                    break;

                default:
                    break;
            }

            if (departmentStore) {
                departmentStore.each(function (record) {
                    var subFilter = {
                        property: fieldName,
                        value: record.get(fieldName),
                        conjunction: 'OR'
                    };
                    subFilterArray.push(subFilter);
                });
                if (subFilterArray.length !== 0) {
                    filter.setSubFilter(subFilterArray);
                    filterArray.push(filter);
                }
            }
        }

        return filterArray;
    },

    /**
     * Create and return filter for fl_id field for values from roomsList for specified bl_id.
     * @param blId
     * @param roomsList
     * @returns {Array}
     */
    getFloorsFilter: function (blId, roomsList) {
        var floorArray = [],
            filterArray = [],
            subFilterArray = [],
            filter,
            subFilter;

        filter = this.getFilterForField('dummyProperty', 'dummyValue');

        Ext.each(roomsList, function (room) {
            var flId = room.get('fl_id');
            if (room.get('bl_id') === blId
                && (floorArray.indexOf(flId) === -1)) {
                floorArray.push(flId);
                subFilter = {
                    property: 'fl_id',
                    value: flId,
                    conjunction: 'OR',
                    exactMatch: true
                };
                subFilterArray.push(subFilter);
            }
        }, this);

        if (subFilterArray.length !== 0) {
            filter.setSubFilter(subFilterArray);
            filterArray.push(filter);
        }

        return filterArray;
    },

    /**
     * Create and return filter for fieldId with values from list.
     * @param fieldId field name
     * @param list list of values
     * @returns {Array}
     */
    getFilterForFieldFromList: function (fieldId, list) {
        var filterArray = [],
            subFilterArray = [],
            filter;

        filter = this.getFilterForField('dummyProperty', 'dummyValue');

        Ext.each(list, function (fieldValue) {
            var subFilter = {
                property: fieldId,
                value: fieldValue,
                conjunction: 'OR'
            };
            subFilterArray.push(subFilter);
        }, this);
        if (subFilterArray.length !== 0) {
            filter.setSubFilter(subFilterArray);
            filterArray.push(filter);
        }

        return filterArray;
    },

    /**
     * Create and return filter for bl_id, fl_id and rm_id fields
     * @param blId
     * @param flId
     * @param rmId
     * @returns {Array}
     */
    getRoomFilterArray: function (blId, flId, rmId) {
        var filterArray = [];

        filterArray.push(this.getFilterForField('bl_id', blId));
        filterArray.push(this.getFilterForField('fl_id', flId));
        filterArray.push(this.getFilterForField('rm_id', rmId));

        return filterArray;
    },

    /**
     * Filters store on user's dv and dp
     */
    filterStoreOnUserDepartment: function(storeId) {
        var userProfile = Common.util.UserProfile.getUserProfile(),
            userDv = userProfile.dv_id,
            userDp = userProfile.dp_id,
            store = Ext.getStore(storeId);

        store.clearFilter();
        store.filter('dv_id', userDv);
        store.filter('dp_id', userDp);
        
        return WorkplacePortal.util.Filter.loadStore(storeId);
    },

    /**
     * Filter, set permanentFilter and load spaceBookSites store for buildings of availableRooms.
     * @param availableRooms record or records of rooms
     * @param [onCompleted] callback function
     * @param [scope] scope of callback function
     */
    filterHotelingSitesList: function (availableRooms, onCompleted, scope) {
        var me = this,
            spaceBookSitesStore = Ext.getStore('spaceBookSites'),
            bldgsList = me.getBuildingsList(availableRooms),
            buildingsStore = Ext.getStore('spaceBookBuildings');

        buildingsStore.retrieveAllStoreRecords([], function (records) {
            var sites = [],
                sitesFilter;

            Ext.each(records, function (record) {
                if (bldgsList.indexOf(record.get('bl_id')) !== -1) {
                    sites.push(record.get('site_id'));
                }
            });

            sitesFilter = me.getFilterForFieldFromList('site_id', sites);

            spaceBookSitesStore.clearFilter();
            spaceBookSitesStore.permanentFilter = sitesFilter;
            spaceBookSitesStore.filter(sitesFilter);
            spaceBookSitesStore.load(function () {
                Ext.callback(onCompleted, scope || me);
            });
        }, me);
    },

    getBuildingsList: function (roomsList) {
        var blArray = [];

        Ext.each(roomsList, function (room) {
            var blId = room.get('bl_id');
            if (blArray.indexOf(blId) === -1) {
                blArray.push(blId);
            }
        }, this);

        return blArray;
    },

    filterMyDepartmentSpaceSitesList: function (onCompleted, scope) {
        var me = this,
            spaceBookSitesStore = Ext.getStore('spaceBookSites'),
            filterArray = me.getDepartmentFilter('site_id');

        spaceBookSitesStore.clearFilter();
        spaceBookSitesStore.permanentFilter = filterArray;
        spaceBookSitesStore.filter(filterArray);
        spaceBookSitesStore.load(function () {
            Ext.callback(onCompleted, scope || me);
        });
    },

    filterServiceDeskRequestList: function (list, isServiceRequestList, activityType, onCompleted, scope) {
        var me = this,
            requestsStore = Ext.getStore('serviceDeskRequestsStore');

        requestsStore.clearFilter();

        if (isServiceRequestList) {
            // from Request list
            list.setGrouped(false);
            requestsStore.setSorters(requestsStore.getSortByDateRequested());
            requestsStore.filter('activity_type', activityType);
        } else {
            // from Information list
            list.setGrouped(true);
            requestsStore.setSorters(requestsStore.getSortByActivityType());
        }

        requestsStore.load(function () {
            Ext.callback(onCompleted, scope || me);
        }, me);
    },

    /**
     * Create and return filter for fieldId with fieldValue with default values for conjunction ('AND') and exactMatch(true).
     * @param fieldId
     * @param fieldValue
     * @param [conjunction] 'AND' or 'OR', default 'AND'
     * @param [exactMatch] true or false, default true
     */
    getFilterForField: function (fieldId, fieldValue, conjunction, exactMatch, operator) {
        return Ext.create('Common.util.Filter', {
            property: fieldId,
            value: fieldValue,
            conjunction: Ext.isEmpty(conjunction) ? 'AND' : conjunction,
            exactMatch: Ext.isEmpty(exactMatch) ? true : exactMatch,
            operator: Ext.isEmpty(operator) ? '=' : operator
        });
    },

    createFilterViewRestriction: function (selectedValues) {
        var me = this,
            fieldName, fieldValue,
            filterArray = [];

        me.filterViewSelectedValues = selectedValues;

        for (fieldName in selectedValues) {
            if (selectedValues.hasOwnProperty(fieldName)) {
                fieldValue = selectedValues[fieldName];

                me.addFilterForField(filterArray, fieldName, fieldValue);
            }
        }

        return filterArray;
    },
    /**
     * Adds filter to the filter array for the given field.
     *
     * @param filterArray
     * @param fieldName
     * @param fieldValue
     * @private
     */
    addFilterForField: function (filterArray, fieldName, fieldValue) {
        var me = this,
            simpleFilterFields = ['bl_id', 'fl_id', 'rm_id', 'rm_arrange_type_id', 'status', 'user_requested_for'],
            freeTypeFields = ['reservation_name', 'attendees'],
            dateFields = ['date_start_from', 'date_start_to'],
            timeFields = ['time_start_from', 'time_start_to'];

        if (simpleFilterFields.indexOf(fieldName) >= 0) {
            if (fieldName === 'status' && fieldValue === 'ALL') {
                return;
            }

            if (!Ext.isEmpty(fieldValue)) {
                filterArray.push(me.getFilterForField(fieldName, fieldValue));
            }
        } else if (freeTypeFields.indexOf(fieldName) >= 0) {
            if (!Ext.isEmpty(fieldValue)) {
                filterArray.push(me.getFilterForField(fieldName, '%' + fieldValue + '%', 'AND', false, 'LIKE'));
            }
        } else if (dateFields.indexOf(fieldName) >= 0) {
            me.addDateFilter(filterArray, fieldName, fieldValue);
        } else if (timeFields.indexOf(fieldName) >= 0) {
            me.addTimeFilter(filterArray, fieldName, fieldValue);
        }
    },

    /**
     * Adds date filter to the filter array.
     * Sets the operator: '='.
     * If field name is like [...]_from or [...]_to then sets the operator '>=' or '<='
     *
     * @param filterArray
     * @param fieldName
     * @param fieldValue
     */
    addDateFilter: function (filterArray, fieldName, fieldValue) {
        var filterFieldName,
            filterFieldValue,
            filter;

        if (!Ext.isDate(fieldValue) || Ext.isEmpty(fieldValue)) {
            return;
        }

        filterFieldName = fieldName.indexOf('_from') >= 0 ?
            fieldName.substring(0, fieldName.indexOf('_from')) :
            (fieldName.indexOf('_to') >= 0 ? fieldName.substring(0, fieldName.indexOf('_to')) : fieldName);

        filterFieldValue = Ext.Date.format(fieldValue, 'Y-m-d H:i:s.u');

        filter = this.getFilterForField(filterFieldName, filterFieldValue, 'AND', true, fieldName.indexOf('_from') >= 0 ? '>=' :
            (fieldName.indexOf('_to') >= 0 ? '<=' : '='));

        filterArray.push(filter);
    },

    /**
     * Adds time filter to the filter array.
     * Sets the operator: '='.
     * If field name is like [...]_from or [...]_to then sets the operator '>=' or '<='
     *
     * @param filterArray
     * @param fieldName
     * @param fieldValue
     */
    addTimeFilter: function (filterArray, fieldName, fieldValue) {
        var filterFieldName,
            filter,
            filterFieldValue;

        if (!Ext.isDate(fieldValue) || Ext.isEmpty(fieldValue)) {
            return;
        }

        filterFieldName = fieldName.indexOf('_from') >= 0 ?
            fieldName.substring(0, fieldName.indexOf('_from')) :
            (fieldName.indexOf('_to') >= 0 ? fieldName.substring(0, fieldName.indexOf('_to')) : fieldName);

        // initialize date components in order to compare by time
        fieldValue.setFullYear(1970);
        fieldValue.setMonth(0);
        fieldValue.setDate(1);
        filterFieldValue = WorkplacePortal.util.Ui.formatDateTime(fieldValue);

        filter = this.getFilterForField(filterFieldName, filterFieldValue, 'AND', true, fieldName.indexOf('_from') >= 0 ? '>=' :
            (fieldName.indexOf('_to') >= 0 ? '<=' : '='));

        filterArray.push(filter);
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