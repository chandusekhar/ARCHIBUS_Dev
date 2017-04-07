/**
 * Applies the My Work/ My Requests filter to the work request list
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Maintenance.util.WorkRequestFilter', {
    alternateClassName: ['WorkRequestFilter'],
    requires: [
        'Common.util.Filter',
        'Common.util.SqlFilter'
    ],

    singleton: true,

    listType: Maintenance.util.Constants.MyWork,

    additionalFilterArray: [],

    /**
     * Current restriction values selected by the user in the Filter form
     */
    userSelectedValues: {},

    /**
     * Current user restriction
     */
    userRestriction: [],

    /**
     * Applies filter for the given list type:
     * request type: My Requests or not
     * status: statuses for the list type
     * additional filter (from the Search field)
     *
     * @param listType
     * @param [additionalFilterArray]
     * @param [onCompleted]
     * @param [scope]
     */
    applyWorkRequestListFilter: function (listType, additionalFilterArray, onCompleted, scope) {
        var me = this,
            store = Ext.getStore('workRequestsStore'),
            finalFilterArray;

        me.listType = listType;
        me.additionalFilterArray = additionalFilterArray;

        finalFilterArray = me.getBaseFilterForListType(listType);

        if (!Ext.isEmpty(additionalFilterArray)) {
            finalFilterArray = finalFilterArray.concat(additionalFilterArray);
        }

        if (!Ext.isEmpty(me.userRestriction)) {
            finalFilterArray = finalFilterArray.concat(me.userRestriction);
        }

        finalFilterArray = me.addShowFieldTenOptionRestriction(finalFilterArray);

        store.clearFilter();
        store.setFilters(finalFilterArray);
        store.loadPage(1, function () {
            Ext.callback(onCompleted, scope || me);
        }, me);
    },

    /**
     * Returns the basic filter for the given list type (My Work, My Requests, Requested etc.)
     * @param listType
     * @returns {Array}
     */
    getBaseFilterForListType: function (listType) {
        var me = this,
            userProfile = Common.util.UserProfile.getUserProfile(),
            userRoleName = ApplicationParameters.getUserRoleName(),
            myWorkFilter = me.createFilter('request_type', 0),
            myRequestFilter = Ext.create('Common.util.SqlFilter', {sql: 'request_type=\'1\' or requestor=\'' + userProfile.em_id + '\''}),
            requestedFilter = Ext.create('Common.util.SqlFilter', {sql: 'step_type IN (\'review\',\'approval\') '}),
            assignedToCfFilter = Ext.create('Common.util.SqlFilter', {
                sql: '(wr_id IS NULL OR (wr_id IS NOT NULL AND is_req_craftsperson = 1) OR EXISTS (SELECT 1 FROM WorkRequestCraftsperson wrcf WHERE wrcf.status = \'Active\' and wrcf.wr_id = WorkRequest.wr_id' +
                ' AND wrcf.cf_id = \'' + userProfile.cf_id + '\'))'
            }),
            issuedTabFilter = Ext.create('Common.util.SqlFilter', {
                sql: '( (wr_id IS NOT NULL AND is_req_supervisor = 1) OR EXISTS (SELECT 1 FROM WorkRequestCraftsperson wrcf WHERE wrcf.status = \'Active\' and wrcf.wr_id = WorkRequest.wr_id' +
                ' AND wrcf.cf_id = \'' + userProfile.cf_id + '\')' +
                ' OR (step_type !=\'basic\'))'
            }),
            notNullWorkRequestsFilter = Ext.create('Common.util.Filter', {
                property: 'wr_id',
                matchIsNullValue: true,
                isEqual: false
            }),
            approvedFilter = Ext.create('Common.util.SqlFilter', {
                sql: '(is_wt_self_assign = 1 OR NOT(requestor is not null and requestor=\'' + userProfile.em_id + '\' and is_req_supervisor!=1) OR step_type !=\'basic\')'
            }),
            excludeMyRequestFilter = Ext.create('Common.util.SqlFilter', {
                sql: '(NOT(requestor is not null and requestor=\'' + userProfile.em_id + '\' and is_req_supervisor!=1) OR step_type !=\'basic\')'
            }),
            listTypeFilter = me.createFilter('dummyProperty', 'dummyValue'),
            listTypeSubFilterArray = me.getListTypeSubFilter(listType),
            filterArray = [];

        //kb#3046854: for My Request list, display all the open work requests for which the user is the requestor
        if (listType === Constants.MyRequests) {
            filterArray.push(myRequestFilter);
            filterArray.push(Ext.create('Common.util.SqlFilter', {sql: 'status!=\'Rej\''}));
        } else if (listType === Constants.Requested) {
            filterArray.push(requestedFilter);
            filterArray.push(myWorkFilter);
        } else if (listType === Constants.Approved) {
            filterArray.push(myWorkFilter);
            filterArray.push(approvedFilter);
        } else if (listType === Constants.MyWork) {
            filterArray.push(myWorkFilter);
        } else {
            filterArray.push(myWorkFilter);
            filterArray.push(excludeMyRequestFilter);
        }

        // for My Work list, add new WRs or WRs that are assigned to the logged in craftsperson
        if (listType === Constants.MyWork) {
            filterArray.push(assignedToCfFilter);
        }

        if (listType !== Constants.MyWork && listType !== Constants.MyRequests) {
            filterArray.push(notNullWorkRequestsFilter);
        }

        if (!Ext.isEmpty(listTypeSubFilterArray)) {
            listTypeFilter.setSubFilter(listTypeSubFilterArray);
            filterArray.push(listTypeFilter);
        }

        // kb#3046850: for Supervisor's Issued list, add specified restriction
        if (listType === Constants.Issued) {
            filterArray.push(issuedTabFilter);
        }

        return filterArray;
    },

    /**
     * Adds the Show field - 10 newest / 10 oldest / 10 nearing escalation restriction on the filtered records
     * @param filterArray the complete filter on the work requests
     * @returns {*}
     */
    addShowFieldTenOptionRestriction: function (filterArray) {
        var me = this,
            sqlStatement,
            finalSqlStatement;

        if (!Ext.isEmpty(me.userSelectedValues)
            && !Ext.isEmpty(me.userSelectedValues.show)) {

            sqlStatement = Common.store.proxy.ProxyUtil.getFilterRestriction(filterArray);
            finalSqlStatement = 'wr_id IN (SELECT wr_id FROM WorkRequest ' + sqlStatement + ' {0} ' + ' ORDER BY {1} LIMIT 0, 10)';

            switch (me.userSelectedValues.show) {
                case 'tenNewest':
                    filterArray = [
                        Ext.create('Common.util.SqlFilter', {
                            sql: Ext.String.format(finalSqlStatement, '', ' date_requested DESC, time_requested DESC, wr_id DESC')
                        })
                    ];
                    break;

                case 'tenOldest':
                    filterArray = [
                        Ext.create('Common.util.SqlFilter', {
                            sql: Ext.String.format(finalSqlStatement, '', ' date_requested ASC, time_requested ASC, wr_id ASC')
                        })
                    ];
                    break;


                case 'tenEscalation':
                    filterArray = [
                        Ext.create('Common.util.SqlFilter', {
                            sql: Ext.String.format(finalSqlStatement, ' AND date_escalation_completion >= date(\'now\')', ' date_requested ASC, time_requested ASC, wr_id ASC')
                        })
                    ];
                    break;

                default:
                    break;
            }
        }

        return filterArray;
    },

    /**
     * Returns an array of sub-filter configs with the statuses for the given list type
     *
     * @param listType Work Request list type (display mode)
     * @returns {Array} Array of sub-filter configs
     */
    getListTypeSubFilter: function (listType) {
        var subFilterArray = [],
            workRequestStatuses = this.getListTypeStatuses(listType),
            statusFieldName = 'status_initial',
            i, status, subFilter;

        for (i = 0; i < workRequestStatuses.length; i++) {
            status = workRequestStatuses[i];

            subFilter = {
                property: statusFieldName,
                value: status,
                conjunction: 'OR'
            };

            subFilterArray.push(subFilter);
        }

        return subFilterArray;
    },

    /**
     * Returns an array of work request statuses for the given list type, to use for filtering a work requests store
     *
     * @param listType Work Request list type (display mode)
     * @returns {Array} Array of work request statuses corresponding to the list type
     */
    getListTypeStatuses: function (listType) {
        var workRequestStatuses = [];

        switch (listType) {
            case Constants.MyWork:
                workRequestStatuses = ['I', 'HP', 'HA', 'HL'];
                break;

            case Constants.MyRequests:
                workRequestStatuses = []; // the filter is on request type = 1
                break;

            case Constants.Requested:
                workRequestStatuses = ['R'];
                break;

            case Constants.Approved:
                workRequestStatuses = ['AA'];
                break;

            case Constants.Issued:
                workRequestStatuses = ['I', 'HP', 'HA', 'HL'];
                break;

            case Constants.Completed:
                workRequestStatuses = ['Com'];
                break;

            default:
                break;
        }

        return workRequestStatuses;
    },

    /**
     * Creates and sets the user restriction according the user selected values
     */
    createUserRestriction: function (selectedValues) {
        var me = this,
            fieldName, fieldValue,
            filterArray = [];

        me.userSelectedValues = selectedValues;

        for (fieldName in selectedValues) {
            if (selectedValues.hasOwnProperty(fieldName)) {
                fieldValue = selectedValues[fieldName];

                me.addFilterForField(filterArray, fieldName, fieldValue);
            }
        }

        me.userRestriction = filterArray;
    },

    /**
     * Clears the user selected values and the user restriction
     */
    clearUserRestriction: function () {
        var me = this;

        me.userSelectedValues = {};
        me.userRestriction = [];
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
            simpleFilterFields = ['bl_id', 'fl_id', 'rm_id', 'prob_type', 'dv_id', 'dp_id', 'wr_id', 'eq_id'].join(','),
            dateFields = ['date_requested_from', 'date_requested_to', 'date_assigned_from', 'date_assigned_to'].join(','),
            subSelectFields = ['cf_id', 'part_id'].join(','),
            addFilterForOtherFields,
            tableName;

        addFilterForOtherFields = function (filterArray, fieldName, fieldValue) {
            switch (fieldName) {
                case 'show':
                    me.addShowFieldFilter(filterArray, fieldName, fieldValue);
                    break;

                case 'work_type':
                    me.addWorkTypeFilter(filterArray, fieldValue);
                    break;

                case 'em_id':
                    if (!Ext.isEmpty(fieldValue)) {
                        filterArray.push(me.createFilter('requestor', fieldValue));
                    }
                    break;

                case 'eq_std':
                    me.addEquipmentStandardFilter(filterArray, fieldName, fieldValue);
                    break;

                case 'priority':
                    if (fieldValue !== 'any') {
                        filterArray.push(me.createFilter('priority', fieldValue));
                    }
                    break;

                case 'escalated':
                    if (fieldValue === 1) {
                        me.addEscalatedFilter(filterArray);
                    }
                    break;

                default:
                    break;
            }
        };

        if (simpleFilterFields.indexOf(fieldName) >= 0) {
            if (!Ext.isEmpty(fieldValue)) {
                filterArray.push(me.createFilter(fieldName, fieldValue));
            }
        } else if (dateFields.indexOf(fieldName) >= 0) {
            me.addDateFilter(filterArray, fieldName, fieldValue);
        } else if (subSelectFields.indexOf(fieldName) >= 0) {
            tableName = (fieldName === 'cf_id' ? 'WorkRequestCraftsperson' : 'WorkRequestPart');
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
     * For multi key barcodes such as bl-fl-rm the scanResult contains parsed values. Create filter for selected bl_id, fl_id and rm_id from a multi key barcode.
     * @param scanResult scan result object
     * @returns {Object} filter object
     */
    createScannedRoomFilter: function (scanResult) {
        var fields = ['bl_id', 'fl_id', 'rm_id'],
            subFilterArray = [],
            filter = Ext.create('Common.util.Filter', {
                property: 'dummyProperty',
                value: 'dummyValue',
                conjunction: 'OR',
                exactMatch: true
            });

        Ext.each(fields, function (field) {
            subFilterArray.push({
                property: field,
                value: scanResult.fields[field],
                // if scanned value was parsed use AND else use OR
                conjunction: scanResult.fields[field] === scanResult.code ? 'OR' : 'AND'
            });
        });

        filter.setSubFilter(subFilterArray);

        return filter;
    },

    /**
     * Creates and returns a {@link Common.util.Filter} filter array for the given property.
     *
     * @param property
     * @param {Array} records
     * @param conjunction 'AND' by default
     * @param exactMatch true/false/undefined
     * If true or undefined, sets exactMatch property to true and anyMatch property to false;
     * If false, sets exactMatch property to false and anyMatch property to true.
     * @returns {Array}
     */
    createFilterArray: function (property, records, conjunction, exactMatch) {
        var filterArray = [];

        Ext.Array.each(records, function (record) {
            filterArray.push(Ext.create('Common.util.Filter', {
                property: property,
                value: record.get(property),
                conjunction: Ext.isDefined(conjunction) ? conjunction : 'AND',
                exactMatch: (!Ext.isDefined(exactMatch) || (Ext.isDefined(exactMatch) && exactMatch === true)),
                anyMatch: (Ext.isDefined(exactMatch) && exactMatch === false)
            }));
        });

        return filterArray;
    },

    /**
     * Creates and returns a {@link Common.util.Filter} filter array for the given property.
     * If records array is empty, creates a dummy filter that will return zero records.
     *
     * @param {String} property
     * @param {Array} records
     * @param {String}[conjunction='AND'] conjunction 'AND' by default
     * @param {Object}[exactMatch] exactMatch true/false/undefined
     */
    createNotEmptyFilterArray: function (property, records, conjunction, exactMatch) {
        var me = this,
            filterArray = [];

        if (Ext.isEmpty(records)) {
            filterArray.push(me.createFilter('0', '1'));
        } else {
            filterArray = me.createFilterArray(property, records, conjunction, exactMatch);
        }

        return filterArray;
    },

    /**
     * Adds a sub-select filter to the filter array,
     * by the key: tableName.wr_id = WorkRequest.wr_id
     *
     * @param filterArray
     * @param fieldTable Table name for the field
     * @param fieldName
     * @param fieldValue
     */
    addSubSelectFilter: function (filterArray, fieldTable, fieldName, fieldValue) {
        var me = this,
            subSelectQuery = '(SELECT {0} FROM {1} WHERE {1}.wr_id = WorkRequest.wr_id AND {1}.{0} = \'' + fieldValue + '\' LIMIT 1)';

        if (!Ext.isEmpty(fieldValue)) {
            filterArray.push(me.createFilter(Ext.String.format(subSelectQuery, fieldName, fieldTable), fieldValue));
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
     * Adds Work Type filter to the filter array, if it's the case
     *
     * @param filterArray
     * @param value
     * @private
     */
    addWorkTypeFilter: function (filterArray, value) {
        var me = this;

        if (value === 'onDemand') {
            filterArray.push(
                Ext.create('Common.util.Filter', {
                    property: 'prob_type',
                    value: 'PREVENTIVE MAINT',
                    operator: '<>',
                    conjunction: 'AND'
                })
            );
        } else if (value === 'pm') {
            filterArray.push(me.createFilter('prob_type', 'PREVENTIVE MAINT'));
        }
    },

    /**
     * Adds Escalated filter to the filter array
     *
     * @param filterArray
     * @private
     */
    addEscalatedFilter: function (filterArray) {
        var me = this,
            filter = me.createFilter('dummyProperty', 'dummyValue'),
            subFilterArray = [];

        subFilterArray.push({
            property: 'escalated_response',
            value: 1,
            conjunction: 'OR'
        });

        subFilterArray.push({
            property: 'escalated_completion',
            value: 1,
            conjunction: 'OR'
        });

        filter.setSubFilter(subFilterArray);
        filterArray.push(filter);
    },

    /**
     * Adds equipment standard filter to the filter array.
     * @param filterArray
     * @param fieldName
     * @param fieldValue
     * @private
     */
    addEquipmentStandardFilter: function (filterArray, fieldName, fieldValue) {
        if (!Ext.isEmpty(fieldValue)) {
            filterArray.push(Ext.create('Common.util.SqlFilter', {
                sql: 'eq_id IN (SELECT eq_id FROM Equipment WHERE Equipment.eq_std  = \'' + fieldValue + '\')'
            }));
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
        var me = this,
            userProfile = Common.util.UserProfile.getUserProfile(),
            addMyApprovalFilter = function () {
                var userFilter = me.createFilter('dummyProperty', 'dummyValue'),
                    userSubFilterArray = [],
                    stepTypeFilter,
                    stepTypeSubFilterArray = [];

                userSubFilterArray.push({
                    property: 'step_user_name',
                    value: ConfigFileManager.username,
                    conjunction: 'OR'
                });
                userSubFilterArray.push({
                    property: 'step_em_id',
                    value: userProfile.em_id,
                    conjunction: 'OR'
                });
                userSubFilterArray.push({
                    property: 'step_role_name',
                    value: ApplicationParameters.getUserRoleName(),
                    conjunction: 'OR'
                });
                userFilter.setSubFilter(userSubFilterArray);
                filterArray.push(userFilter);

                stepTypeFilter = me.createFilter('dummyProperty', 'dummyValue');
                stepTypeSubFilterArray.push({
                    property: 'step_type',
                    value: 'review',
                    conjunction: 'OR'
                });

                stepTypeSubFilterArray.push({
                    property: 'step_type',
                    value: 'approval',
                    conjunction: 'OR'
                });
                stepTypeFilter.setSubFilter(stepTypeSubFilterArray);
                filterArray.push(stepTypeFilter);
            };

        switch (fieldValue) {
            case 'escalated':
                filterArray.push(me.createFilter('escalated_completion', 1));
                break;

            case 'myRequests':
                filterArray.push(me.createFilter('requestor', userProfile.em_id));
                break;

            case 'myApproval':
                addMyApprovalFilter();
                break;

            /*OUT OF SCOPE case 'myApproved':
             break;*/

            case 'unassigned':
                filterArray.push(Ext.create('Common.util.Filter', {
                    property: '(SELECT wr_id FROM WorkRequestCraftsperson WHERE WorkRequestCraftsperson.wr_id = WorkRequest.wr_id)',
                    matchIsNullValue: true
                }));
                break;

            case 'tenNewest':
            case 'tenOldest':
            case 'tenEscalation':
                // this is an SQLFilter, defined later
                break;

            default :
                break;
        }
    },

    /**
     * Filters and loads the given stores and calls back the given function after all stores are loaded.
     * @param {Array} storeIds
     * @param {Array} filterArray
     * @param [onCompleted]
     * @param [scope]
     */
    filterAndLoadStores: function (storeIds, filterArray, onCompleted, scope) {
        var me = this,
            numberOfStoresToLoad = storeIds.length,
            onAllStoresLoaded = function (count) {
                if (count === 0) {
                    Ext.callback(onCompleted, scope || me);
                }
            };

        Ext.each(storeIds, function (storeId) {
            var store = Ext.getStore(storeId),
                onStoreLoad = function () {
                    numberOfStoresToLoad -= 1;
                    onAllStoresLoaded(numberOfStoresToLoad);
                };

            store.clearFilter();
            //KB#3050980 Filter and load references document store.
            if (storeId === 'referenceStore') {
                var wrStore = Ext.getStore('workRequestsStore');
                wrStore.retrieveRecord(filterArray, function (record) {
                    var referenceFilter = me.getReferenceStoreFilter(record);
                    store.setFilters(referenceFilter);
                    store.load({
                        callback: onStoreLoad,
                        scope: me
                    });
                }, me);
            } else {
                store.setFilters(filterArray);
                store.load({
                    callback: onStoreLoad,
                    scope: me
                });
            }


        }, me);
    },
    /**
     * KB#3050980
     * Set filters to references store
     * @param record WorkRequest Record
     * @return Array Filter Array
     */
    getReferenceStoreFilter: function (record) {
        var filterArray = [],
            referenceFiter,
            referenceFiterSql,
            eqId,
            pmpId,
            probType;

        if (record) {
            eqId = record.get('eq_id');
            pmpId = record.get('pmp_id');
            probType = record.get('prob_type');
        }

        var filterSql = "";
        if (!Ext.isEmpty(eqId, false)) {
            filterSql = " (eq_std = (select eq_std from Equipment where Equipment.eq_id = '" + eqId + "') AND prob_type IS NULL AND pmp_id IS NULL) ";
        } else {
            filterSql = " (1=2) ";
        }

        if (!Ext.isEmpty(probType, false)) {
            filterSql += " OR (prob_type = '" + probType + "' AND eq_std IS NULL AND pmp_id IS NULL) ";
        }

        if ((!Ext.isEmpty(probType)) && (!Ext.isEmpty(eqId))) {
            filterSql += " OR (prob_type = '" + probType + "' AND prob_type != 'PREVENTIVE MAINT' AND eq_std = (select eq_std from Equipment where Equipment.eq_id = '" + eqId + "') AND pmp_id IS NULL)";
        }

        if (!Ext.isEmpty(pmpId)) {
            filterSql += " OR (prob_type = 'PREVENTIVE MAINT' AND pmp_id = '" + pmpId + "' AND eq_std IS NULL) ";
        }

        if ((!Ext.isEmpty(pmpId)) && (!Ext.isEmpty(eqId))) {
            filterSql += " OR (prob_type = 'PREVENTIVE MAINT' AND pmp_id ='" + pmpId + "' AND eq_std = (select eq_std from Equipment where Equipment.eq_id = '" + eqId + "') ) ";
        }

        referenceFiterSql = " activity_type = 'SERVICE DESK - MAINTENANCE' AND (" + filterSql + ")";

        referenceFiter = Ext.create('Common.util.SqlFilter', {
            sql: referenceFiterSql
        });


        filterArray.push(referenceFiter);

        return filterArray;
    }
});