/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {
    t.requireOk('Common.store.proxy.ProxyUtil','Common.util.Filter', function () {

        var filter = Ext.create('Common.util.Filter',
                             { property: 'bl_id',
                                value: 'HQ',
                                conjunction: 'OR'
                             }),
            filterProperties,
            filterStatement,
            filter1,
            filter2;

        t.is(filter.getConjunction(), 'OR', 'Conjuction matches');
        t.is(filter.getProperty(), 'bl_id', 'Property matches');
        t.is(filter.getValue(), 'HQ', 'Value matches');
        t.is(filter.isExtendedFilter, true, 'Extended filter property matches');

        // Check filter property generation
        filterProperties = Common.store.proxy.ProxyUtil.getFilterProperties(filter);

        t.is(filterProperties.value, 'HQ', 'Filter value property matches');
        t.is(filterProperties.property, 'bl_id', 'Filter property property matches');
        t.is(filterProperties.conjunction, 'OR', 'Filter conjunction property matches');
        t.is(filterProperties.matchIsNullValue, false, 'Filter matchIsNull property matches');
        t.is(filterProperties.isEqual, true, 'Filter isEqual property matches');

        // Create filter statement

        filterStatement = ProxyUtil.getFilterRestriction([filter]);
        t.is(filterStatement,  " WHERE bl_id = 'HQ'", 'Filter statement matches');

        // Check compound filters
        filter1 = Ext.create('Common.util.Filter',
                { property: 'bl_id',
                    value: 'ATL',
                    conjunction: 'OR'
                });

        filterStatement = ProxyUtil.getFilterRestriction([filter, filter1]);

        t.is(filterStatement," WHERE (bl_id = 'HQ' OR bl_id = 'ATL')", 'Compound filter statement matches');

        // Check anyMatch property

        filter = Ext.create('Common.util.Filter',
                { property: 'bl_id',
                    value: 'HQ',
                    conjunction: 'OR',
                    anyMatch: true
                });

        filter1 = Ext.create('Common.util.Filter',
                { property: 'bl_id',
                    value: 'ATL',
                    conjunction: 'OR',
                    anyMatch: true
                });

        filterStatement = ProxyUtil.getFilterRestriction([filter, filter1]);
        t.is(filterStatement, " WHERE (bl_id LIKE '%HQ%' OR bl_id LIKE '%ATL%')", 'Any Match statement matches');


        // Mix AND and OR filters
        filter2 = Ext.create('Common.util.Filter',
                { property: 'eq_id',
                    value: '1000',
                    conjunction: 'AND'
                });

        filterStatement = ProxyUtil.getFilterRestriction([filter, filter1, filter2]);
        t.is(filterStatement, " WHERE eq_id = '1000' AND (bl_id LIKE '%HQ%' OR bl_id LIKE '%ATL%')", 'Compound statement matches');

        t.done();
    });

});