/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {
    t.requireOk('Common.store.proxy.ProxyUtil', 'Common.util.Filter', function () {

        var createFilter = function (property, value, conjunction, exactMatch) {
            return Ext.create('Common.util.Filter', {
                property: property,
                value: value,
                conjunction: Ext.isDefined(conjunction) ? conjunction : 'AND',
                exactMatch: (!Ext.isDefined(exactMatch) || (Ext.isDefined(exactMatch) && exactMatch === true)),
                anyMatch: (Ext.isDefined(exactMatch) && exactMatch === false)
            });
        };

        var filterArray = [],
            userFilter,
            userSubFilterArray = [],
            stepTypeFilter,
            stepTypeSubFilterArray,
            desiredResult,
            filterStatement;

        userFilter = createFilter('dummyProperty', 'dummyValue');

        userSubFilterArray.push({
            property: 'step_user_name',
            value: 'TRAM',
            conjunction: 'OR'
        });
        userSubFilterArray.push({
            property: 'step_em_id',
            value: 'TRAM, WILL',
            conjunction: 'OR'
        });
        userSubFilterArray.push({
            property: 'step_role_name',
            value: 'SUPERVISOR',
            conjunction: 'OR'
        });
        userFilter.setSubFilter(userSubFilterArray);
        filterArray.push(userFilter);

        stepTypeFilter = createFilter('dummyProperty','dummyValue');
        stepTypeSubFilterArray = [];

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

        desiredResult = " WHERE (step_user_name = 'TRAM' OR step_em_id = 'TRAM, WILL' OR step_role_name = 'SUPERVISOR' ) AND (step_type = 'review' OR step_type = 'approval' )";
        filterStatement = ProxyUtil.getFilterRestriction(filterArray);

        t.is(desiredResult, filterStatement, 'Filter statement is correct');

        t.done();


    });
});