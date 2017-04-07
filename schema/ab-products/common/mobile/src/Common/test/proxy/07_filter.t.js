/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {
    t.requireOk('Common.store.proxy.ProxyUtil', 'Common.util.Filter', function () {

        // Test multiple filters containing sub filters.

        var filter1 = Ext.create('Common.util.Filter', {
                property: 'dummyProperty',
                value: 'dummyValue',
                conjunction: 'OR',
                exactMatch: true
            }),
            filter2 = Ext.create('Common.util.Filter', {
                property: 'dummyProperty',
                value: 'dummyValue',
                conjunction: 'OR',
                exactMatch: true
            }),
            subFilterArray = [],
            filterStatement;

        subFilterArray.push({
            property: 'bl_id',
            value: 'HQ',
            conjunction: 'AND'
        });
        subFilterArray.push({
            property: 'fl_id',
            value: '01',
            conjunction: 'AND'
        });

        filter1.setSubFilter(subFilterArray);
        filter2.setSubFilter(subFilterArray);

        filterStatement = ProxyUtil.getFilterRestriction([filter1, filter2]);

        t.is(filterStatement, " WHERE ((bl_id = 'HQ' AND fl_id = '01' ) OR (bl_id = 'HQ' AND fl_id = '01' ))", 'Filters match');

        t.done();

    });
});