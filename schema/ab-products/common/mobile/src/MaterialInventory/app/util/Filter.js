Ext.define('MaterialInventory.util.Filter', {
    singleton: true,

    /**
     * Current restriction values selected by the user in the Filter form
     */
    filterViewSelectedValues: {},

    applyFilters: function (store, filterArray, callbackFn, scope) {
        var me = this;

        store.clearFilter();
        store.setFilters(filterArray);
        store.loadPage(1, function () {
            Ext.callback(callbackFn, scope || me);
        }, me);
    },

    createFilterViewRestriction: function (selectedValues) {
        var me = this,
            fieldName, fieldValue,
            filterArray = [],
            store = Ext.getStore('materialLocations');

        me.filterViewSelectedValues = selectedValues;

        for (fieldName in selectedValues) {
            if (selectedValues.hasOwnProperty(fieldName)) {
                fieldValue = selectedValues[fieldName];

                me.addFilterForField(filterArray, fieldName, fieldValue);
            }
        }

        store.userFilter = filterArray;
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
            simpleFilterFields = ['container_code', 'container_cat', 'container_type', 'container_status', 'tier2', 'custodian_id', 'last_edited_by'],
            dateFields = ['date_updated_from', 'date_updated_to', 'date_last_inv_from', 'date_last_inv_to'],
            subSelectFields = ['product_name', 'manufacturer_id', 'ghs_id'],
            addFilterForOtherFields,
            tableName;

        addFilterForOtherFields = function (filterArray, fieldName, fieldValue) {
            if (fieldName === 'show') {
                me.addShowFieldFilter(filterArray, fieldName, fieldValue);
            }
        };

        if (simpleFilterFields.indexOf(fieldName) >= 0) {
            if ((fieldName === 'container_status' || fieldName === 'tier2') && fieldValue === 'ALL') {
                return;
            }

            if (!Ext.isEmpty(fieldValue)) {
                filterArray.push(me.createFilter(fieldName, fieldValue));
            }
        } else if (dateFields.indexOf(fieldName) >= 0) {
            me.addDateFilter(filterArray, fieldName, fieldValue);
        } else if (subSelectFields.indexOf(fieldName) >= 0) {
            tableName = 'MaterialData';
            me.addSubSelectFilter(filterArray, tableName, fieldName, fieldValue);
        } else {
            addFilterForOtherFields(filterArray, fieldName, fieldValue);
        }
    },

    /**
     * Creates and returns a {@link Common.util.Filter} filter.
     *
     * @param {String} property The record property to set the filter on
     * @param {String} value The value to filter
     * @param {String} [conjunction='AND'] 'AND' by default
     * @param {Boolean} [exactMatch] true/false/undefined
     * If true or undefined, sets exactMatch property to true and anyMatch property to false;
     * If false, sets exactMatch property to false and anyMatch property to true.
     * @returns {Common.util.Filter}
     */
    createFilter: function (property, value, conjunction, exactMatch) {
        return Ext.create('Common.util.Filter', {
            property: property,
            value: value,
            conjunction: Ext.isDefined(conjunction) ? conjunction : 'AND',
            exactMatch: (!Ext.isDefined(exactMatch) || (Ext.isDefined(exactMatch) && exactMatch === true)),
            anyMatch: (Ext.isDefined(exactMatch) && exactMatch === false)
        });
    },

    /**
     * Creates and returns a {@link Common.util.Filter} filter for IS NULL or empty ('') conditions.
     *
     * @param {String} property The record property to set the filter on
     * @returns {Common.util.Filter}
     */
    createIsNullOrEmptyFilter: function (property) {
        var filter,
            subFilterArray = [],
            emptyValue,
            nullValue;

        filter = Ext.create('Common.util.Filter', {
            property: 'dummyProperty',
            value: 'dummyValue',
            conjunction: 'AND',
            exactMatch: true
        });
        emptyValue = {
            property: property,
            value: '',
            conjunction: 'OR'
        };
        subFilterArray.push(emptyValue);
        nullValue = {
            property: property,
            value: '',
            isEqual: true,
            matchIsNullValue: true,
            conjunction: 'OR'
        };
        subFilterArray.push(nullValue);
        filter.setSubFilter(subFilterArray);

        return filter;
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

        filter = Ext.create('Common.util.Filter', {
            property: filterFieldName,
            value: filterFieldValue,
            operator: fieldName.indexOf('_from') >= 0 ? '>=' :
                (fieldName.indexOf('_to') >= 0 ? '<=' : '='),
            conjunction: 'AND'
        });

        filterArray.push(filter);
    },

    /**
     * Adds a sub-select filter to the filter array,
     * by the key: tableName.msds_id = MaterialLocation.msds_id
     *
     * @param filterArray
     * @param fieldTable Table name for the field
     * @param fieldName
     * @param fieldValue
     */
    addSubSelectFilter: function (filterArray, fieldTable, fieldName, fieldValue) {
        var me = this,
            subSelectQuery = '(SELECT {0} FROM {1} WHERE {1}.msds_id = MaterialLocation.msds_id AND {1}.{0} = \'' + fieldValue + '\' LIMIT 1)';

        if (!Ext.isEmpty(fieldValue)) {
            filterArray.push(me.createFilter(Ext.String.format(subSelectQuery, fieldName, fieldTable), fieldValue));
        }
    },

    /**
     * Adds filter to the filter array according to the Show field.
     *
     * @param filterArray
     * @param fieldName
     * @param fieldValue
     * @private
     */
    addShowFieldFilter: function (filterArray, fieldName, fieldValue) {
        var subFilterArray = [],
            notNullFilter,
            lessThenFilter,
            filter;

        if (fieldValue === 0) {
            return;
        }

        // date_last_inv is null OR date_last_inv != date inventory
        filter = Ext.create('Common.util.Filter', {
            property: 'dummyProperty',
            value: 'dummyValue',
            conjunction: 'AND',
            exactMatch: true
        });

        notNullFilter = {
            property: 'date_last_inv',
            value: '',
            isEqual: true,
            matchIsNullValue: true,
            conjunction: 'OR',
            exactMatch: true
        };
        subFilterArray.push(notNullFilter);

        if (AppMode.getInventoryDate()) {
            lessThenFilter = {
                property: 'date_last_inv',
                value: Ext.Date.format(AppMode.getInventoryDate(), 'Y-m-d'),
                operator: '<',
                conjunction: 'OR'
            };
            subFilterArray.push(lessThenFilter);
        }

        filter.setSubFilter(subFilterArray);
        filterArray.push(filter);
    },

    /**
     * Applies filter for the given list type:
     * request type: My Requests or not
     * status: statuses for the list type
     * additional filter (from the Search field)
     *
     * @param [onCompleted]
     * @param [scope]
     */
    applyMaterialLocationFilters: function (onCompleted, scope) {
        var me = this,
            store = Ext.getStore('materialLocations'),
            finalFilterArray = [];

        if (!Ext.isEmpty(store.locationFilter)) {
            finalFilterArray = finalFilterArray.concat(store.locationFilter);
        }

        if (!Ext.isEmpty(store.searchFilter)) {
            finalFilterArray = finalFilterArray.concat(store.searchFilter);
        }

        if (!Ext.isEmpty(store.userFilter)) {
            finalFilterArray = finalFilterArray.concat(store.userFilter);
        }

        me.applyFilters(store, finalFilterArray, onCompleted, scope || me);

    },

    /**
     * Create filters array for a location level.
     * @param level Valid levels are: bl, fl, rm, aisle, cabinet, shelf, bin
     * @param record Source record for filtering values
     * @returns {Array} filters array
     */
    createFiltersForLevel: function (level, record) {
        var locationFiltersArray = [];
        switch (level) {
            case 'bl':
                locationFiltersArray.push(this.createFilter('bl_id', record.get('bl_id')));
                break;
            case 'fl':
                locationFiltersArray.push(this.createFilter('bl_id', record.get('bl_id')));
                locationFiltersArray.push(this.createFilter('fl_id', record.get('fl_id')));
                break;
            case 'rm':
                locationFiltersArray.push(this.createFilter('bl_id', record.get('bl_id')));
                locationFiltersArray.push(this.createFilter('fl_id', record.get('fl_id')));
                locationFiltersArray.push(this.createFilter('rm_id', record.get('rm_id')));
                break;
            case 'aisle':
                locationFiltersArray.push(this.createFilter('bl_id', record.get('bl_id')));
                locationFiltersArray.push(this.createFilter('fl_id', record.get('fl_id')));
                locationFiltersArray.push(this.createFilter('rm_id', record.get('rm_id')));
                locationFiltersArray.push(this.createFilter('aisle_id', record.get('aisle_id')));
                break;
            case 'cabinet':
                locationFiltersArray.push(this.createFilter('bl_id', record.get('bl_id')));
                locationFiltersArray.push(this.createFilter('fl_id', record.get('fl_id')));
                locationFiltersArray.push(this.createFilter('rm_id', record.get('rm_id')));
                locationFiltersArray.push(this.createFilter('aisle_id', record.get('aisle_id')));
                locationFiltersArray.push(this.createFilter('cabinet_id', record.get('cabinet_id')));
                break;
            case 'shelf':
                locationFiltersArray.push(this.createFilter('bl_id', record.get('bl_id')));
                locationFiltersArray.push(this.createFilter('fl_id', record.get('fl_id')));
                locationFiltersArray.push(this.createFilter('rm_id', record.get('rm_id')));
                locationFiltersArray.push(this.createFilter('aisle_id', record.get('aisle_id')));
                locationFiltersArray.push(this.createFilter('cabinet_id', record.get('cabinet_id')));
                locationFiltersArray.push(this.createFilter('shelf_id', record.get('shelf_id')));
                break;
            case 'bin':
                locationFiltersArray.push(this.createFilter('bl_id', record.get('bl_id')));
                locationFiltersArray.push(this.createFilter('fl_id', record.get('fl_id')));
                locationFiltersArray.push(this.createFilter('rm_id', record.get('rm_id')));
                locationFiltersArray.push(this.createFilter('aisle_id', record.get('aisle_id')));
                locationFiltersArray.push(this.createFilter('cabinet_id', record.get('cabinet_id')));
                locationFiltersArray.push(this.createFilter('shelf_id', record.get('shelf_id')));
                locationFiltersArray.push(this.createFilter('bin_id', record.get('bin_id')));
                break;
        }
        return locationFiltersArray;
    },

    /**
     * Create filter with subfilters a location level.
     * @param level Valid levels are: bl, fl, rm, aisle, cabinet, shelf, bin
     * @param record Source record for filtering values
     * @returns {Array} filters array
     */
    createSubFiltersForLevel: function (level, record) {
        var locationFilter,
            subFilterArray = [];

        locationFilter = Ext.create('Common.util.Filter', {
            property: 'dummyProperty',
            value: 'dummyValue',
            conjunction: 'OR',
            exactMatch: true
        });

        switch (level) {
            case 'bin':
                subFilterArray.push({
                    property: 'bin_id',
                    value: record.get('bin_id'),
                    conjunction: 'AND'
                });
            /* falls through */
            case 'shelf':
                subFilterArray.push({
                    property: 'shelf_id',
                    value: record.get('shelf_id'),
                    conjunction: 'AND'
                });
            /* falls through */
            case 'cabinet':
                subFilterArray.push({
                    property: 'cabinet_id',
                    value: record.get('cabinet_id'),
                    conjunction: 'AND'
                });
            /* falls through */
            case 'aisle':
                subFilterArray.push({
                    property: 'aisle_id',
                    value: record.get('aisle_id'),
                    conjunction: 'AND'
                });
            /* falls through */
            case 'rm':
                subFilterArray.push({
                    property: 'rm_id',
                    value: record.get('rm_id'),
                    conjunction: 'AND'
                });
            /* falls through */
            case 'fl':
                subFilterArray.push({
                    property: 'bl_id',
                    value: record.get('bl_id'),
                    conjunction: 'AND'
                });
                subFilterArray.push({
                    property: 'fl_id',
                    value: record.get('fl_id'),
                    conjunction: 'AND'
                });
                break;
            case 'bl':
                locationFilter = this.createFilter('bl_id', record.get('bl_id'), 'OR');
                break;
        }

        locationFilter.setSubFilter(subFilterArray);
        return locationFilter;
    }
});