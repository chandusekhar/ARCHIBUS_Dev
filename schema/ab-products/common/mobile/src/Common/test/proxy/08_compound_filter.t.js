/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {
    t.requireOk('Common.store.proxy.ProxyUtil', 'Common.util.Filter', function () {

        // Test multiple filters containing sub filters.

        var nullOrEmptyFilter;
        var filterArray = [];
        var nullFilter;
        var filterStatement;
        var notDeleteFilter = Ext.create('Common.util.Filter', {
            conjunction: 'OR',
            property: 'dummyProperty',
            value: 'dummyValue',
            subFilter: [
                {
                    property: 'mob_action',
                    value: 'NULL',
                    conjunction: 'AND',
                    isEqual: false,
                    matchIsNullValue: true
                },
                {
                    property: 'mob_action',
                    value: 'DELETE',
                    conjunction: 'AND',
                    operator: '<>',
                    matchIsNullValue: false
                }
            ]
        });
        filterArray.push(notDeleteFilter);

        nullFilter = Ext.create('Common.util.Filter', {
            property: 'mob_action',
            value: '',
            isEqual: true,
            matchIsNullValue: true,
            conjunction: 'OR'
        });
        filterArray.push(nullFilter);

        filterStatement = ProxyUtil.getFilterRestriction(filterArray);

        t.is(filterStatement, " WHERE ((mob_action IS NOT NULL AND mob_action <> 'DELETE' ) OR mob_action IS NULL)", 'Filters match');

        t.done();

    });
});