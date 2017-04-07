Ext.define('SpaceOccupancy.util.Filters', {
    singleton: true,

    /**
     * Create a 'Common.util.Filter' for a specific field.
     *
     * @param fieldId filter's property
     * @param value filter's value
     * @param [isDateField] if true, the value is formatted as 'Y-m-d H:i:s.u'
     * @param [isNotNull] when value is empty and isNotNull is true than a filter 'fieldId IS NOT NULL' is created
     * @param [relOp] by default filter uses conjunction 'AND', but with this parameter values 'AND' or 'OR' can be used
     * @return filter
     */
    getFilter: function (fieldId, value, isDateField, isNotNull, relOp) {
        var filter, conjunction;

        if (Ext.isEmpty(relOp) || (relOp.toUpperCase().trim() !== 'AND' && relOp.toUpperCase().trim() !== 'OR')) {
            conjunction = 'AND';
        } else {
            conjunction = relOp;
        }

        if (!Ext.isEmpty(value)) {
            if (!Ext.isEmpty(isDateField) && isDateField === true) {
                value = Ext.Date.format(value, 'Y-m-d H:i:s.u');
            }

            filter = Ext.create('Common.util.Filter', {
                property: fieldId,
                value: value,
                conjunction: conjunction,
                exactMatch: true
            });
        } else {
            filter = Ext.create('Common.util.Filter', {
                property: fieldId,
                value: '',
                isEqual: isNotNull ? false : true,
                matchIsNullValue: true,
                conjunction: conjunction,
                exactMatch: true
            });
        }
        return filter;
    },

    /**
     * Compose filter for date_start<=currenDate && (date_end is null || date_end>currentDate).
     */
    getCompareDatesFilterArray: function () {
        var filterArray = [], dateStartFilter, dateEndFilter;

        dateStartFilter = Ext.create('Common.util.Filter', {
            conjunction: 'AND',
            property: 'date_start',
            value: SpaceOccupancy.util.Ui.getCurrentDateValueFormatted(),
            operator: '<='
        });
        filterArray.push(dateStartFilter);

        dateEndFilter = Ext.create('Common.util.Filter', {
            conjunction: 'AND',
            anyMatch: true,
            subFilter: [
                {
                    property: 'date_end',
                    value: 'NULL',
                    conjunction: 'OR',
                    matchIsNullValue: true
                },
                {
                    property: 'date_end',
                    value: SpaceOccupancy.util.Ui.getCurrentDateValueFormatted(),
                    conjunction: 'OR',
                    operator: '>',
                    matchIsNullValue: false
                }
            ]
        });
        filterArray.push(dateEndFilter);

        return filterArray;
    },

    filterTransactionSublist: function (record, type, callbackFn, scope) {
        var me = this,
            store,
            filterArray,
            primaryEmFilter;

        filterArray = me.getSurveyLocationFilterArray(record);
        switch (type) {
            case 'em':
                store = Ext.getStore('employeeListStore');
                store.updateViewDefinition();

                //if workspace transactions disabled display only primare_em records, those from em table
                if (!SurveyState.getWorkspaceTransactionsEnabled()) {
                    primaryEmFilter = me.getFilter('primary_em', '1');
                    filterArray.push(primaryEmFilter);
                }

                break;
            case 'dv':
                store = Ext.getStore('departmentListStore');
                store.updateViewDefinition();
                break;
            case 'cat':
                store = Ext.getStore('categoryListStore');
                store.updateViewDefinition();
                break;

        }

        store.clearFilter();
        store.setFilters(filterArray);
        store.load(function (records) {
            me.setListViewTitle(type, records.length);
            if (typeof callbackFn === 'function') {
                callbackFn.call(scope || me, records);
            }
        }, scope || me);
    },

    setListViewTitle: function (type, recordsNumber) {
        var titlebar,
            currentTitle,
            indexOfOldRecordsNumber,
            newTitle;

        switch (type) {
            case 'em':
                titlebar = Ext.ComponentQuery.query('titlebar[itemId=employeeTitleBar]')[0];
                break;
            case 'dv':
                titlebar = Ext.ComponentQuery.query('titlebar[itemId=departmentTitleBar]')[0];
                break;
            case 'cat':
                titlebar = Ext.ComponentQuery.query('titlebar[itemId=categoryTitleBar]')[0];
                break;
        }
        if (titlebar) {
            currentTitle = titlebar.getTitle();
            indexOfOldRecordsNumber = currentTitle.indexOf(' (');
            if (indexOfOldRecordsNumber > 0) {
                newTitle = currentTitle.substring(0, indexOfOldRecordsNumber);
            } else {
                newTitle = currentTitle;
            }

            titlebar.setTitle(Ext.String.format('{0} ({1})', newTitle, recordsNumber));
        }
    },

    getSurveyLocationFilterArray: function (record) {
        var filterArray,
            surveyFilter,
            surveyFilterValue,
            surveyFilterNull,
            subFilterArray = [];

        filterArray = Space.Space.getFilterArray(record.get('bl_id'), record.get('fl_id'), record.get('rm_id'));

        surveyFilter = Ext.create('Common.util.Filter', {
            property: 'dummyProperty',
            value: 'dummyValue',
            conjunction: 'AND',
            exactMatch: true
        });
        surveyFilterValue = {
            property: 'survey_id',
            value: record.get('survey_id'),
            conjunction: 'OR'
        };
        subFilterArray.push(surveyFilterValue);
        surveyFilterNull = {
            property: 'survey_id',
            value: '',
            isEqual: true,
            matchIsNullValue: true,
            conjunction: 'OR'
        };
        subFilterArray.push(surveyFilterNull);
        surveyFilter.setSubFilter(subFilterArray);
        filterArray.push(surveyFilter);

        return filterArray;
    },

    applyFiltersOnRoomSurveyPanel: function (panel, roomRecord) {
        var me = this,
            record;

        record = roomRecord ? roomRecord : panel.getRecord();

        if (record) {
            //apply filter on transaction list store for Workplace Transactions button badge
            SpaceOccupancy.util.NavigationHelper.setWorspaceTransactionButtonBadge(panel.down('segmentedbutton #workspaceTransBtn'),
                record, function () {
                    //filter emList, dvList and catList
                    SpaceOccupancy.util.Filters.filterTransactionSublist(record, 'em', function () {
                        SpaceOccupancy.util.Filters.filterTransactionSublist(record, 'dv', function () {
                            SpaceOccupancy.util.Filters.filterTransactionSublist(record, 'cat');
                        }, me);
                    }, me);
                }, me);
        }
    },

    /**
     * Filter transactions list store for currently active records for the specified survey and location.
     */
    filterTransactionsListStore: function (surveyId, blId, flId, rmId, callbackFn, scope) {
        var me = this, datesFilterArray,
            filterArray = Space.Space.getFilterArray(blId, flId, rmId, surveyId),
            roomPctsStore = Ext.getStore('roomPctsStore');

        // date_start<=currenDate && (date_end is null || date_end>currentDate)
        datesFilterArray = SpaceOccupancy.util.Filters.getCompareDatesFilterArray();
        filterArray = filterArray.concat(datesFilterArray);

        roomPctsStore.clearFilter();
        roomPctsStore.setFilters(filterArray);
        roomPctsStore.load(function () {
            Ext.callback(callbackFn, scope || me);
        }, this);
    },

    filterPlanTypes: function (callback, scope) {
        var spaceOccupancyPlanTypesStore = Ext.getStore('spaceOccupancyPlanTypes'),
            restrictionFilters = [],
            filter,
            workspaceTransactionsEnabled = SpaceOccupancy.util.Ui.isWorkspaceTransactionsEnabled();

        filter = Ext.create('Common.util.Filter', {
            property: 'plantype_group',
            value: workspaceTransactionsEnabled ? 'Mobile Space and Occupancy trans' : 'Mobile Space and Occupancy',
            exactMatch: true
        });
        restrictionFilters.push(filter);

        spaceOccupancyPlanTypesStore.clearFilter();
        spaceOccupancyPlanTypesStore.filter(restrictionFilters);
        spaceOccupancyPlanTypesStore.load(callback, scope);
    },

    onApplyEmPromptFilter: function (value) {
        var store = Ext.getStore('employeesSyncStore'),
            fields = ['em_id', 'name_first', 'name_last', 'bl_id', 'fl_id', 'rm_id', 'dv_id', 'dp_id'],
            filterArray = [];

        // Create Child Filters
        Ext.each(fields, function (field) {
            var filter = Ext.create('Common.util.Filter', {
                property: field,
                value: value,
                conjunction: 'OR',
                anyMatch: true
            });
            filterArray.push(filter);
        });

        store.clearFilter();
        store.setFilters(filterArray);
        store.loadPage(1);
    },

    onClearEmPromptFilter: function () {
        var store = Ext.getStore('employeesSyncStore');

        // Clear filter
        store.clearFilter();
        store.loadPage(1);
    }
});