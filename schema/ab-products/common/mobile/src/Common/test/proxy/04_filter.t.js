/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {
    t.requireOk('Common.store.proxy.ProxyUtil','Common.util.Filter', function () {

        var filter = Ext.create('Common.util.Filter',
                { property: 'bl_id',
                    value: 'HQ',
                    conjunction: 'AND',
                    anyMatch: true
                }),
            filter1,
            filter2,
            filter3,
            filterStatement;

        filter1 = Ext.create('Common.util.Filter',
                {
                    conjunction: 'AND',
                    anyMatch: true,
                    subFilter: [
                        {
                            property: 'site_id',
                            value: 'ATL',
                            conjunction: 'OR'
                        },
                        {
                            property: 'name',
                            value: 'ATL',
                            conjunction: 'OR'
                        }
                    ]
                });

        filter2 = Ext.create('Common.util.Filter',
                { property: 'bl_id',
                    value: 'HQ',
                    conjunction: 'AND',
                    anyMatch: false
                });

        filterStatement = ProxyUtil.getFilterRestriction([filter, filter1, filter2]);
        t.is(filterStatement, " WHERE bl_id LIKE '%HQ%' AND (site_id = 'ATL' OR name = 'ATL' ) AND bl_id = 'HQ'", 'SubFilter matches');


        // Test matchIsNullValue
        filter = Ext.create('Common.util.Filter',
                {
                    conjunction: 'AND',
                    anyMatch: true,
                    subFilter: [
                        {
                            property: 'dv_id',
                            value: 'ATL',
                            conjunction: 'OR',
                            matchIsNullValue: true,
                            isEqual: true
                        },
                        {
                            property: 'dp_id',
                            value: 'ATL',
                            conjunction: 'OR',
                            matchIsNullValue: true,
                            isEqual: true
                        }
                    ]
                });

        filterStatement = ProxyUtil.getFilterRestriction([filter]);
        t.is(filterStatement, " WHERE (dv_id IS NULL OR dp_id IS NULL )", 'NULL values match');


        filter = Ext.create('Common.util.Filter',
                {
                    conjunction: 'AND',
                    anyMatch: true,
                    subFilter: [
                        {
                            property: 'dv_id',
                            value: 'ATL',
                            conjunction: 'OR',
                            matchIsNullValue: false,
                            isEqual: true
                        },
                        {
                            property: 'dp_id',
                            value: 'ATL',
                            conjunction: 'OR',
                            matchIsNullValue: true,
                            isEqual: true
                        }
                    ]
                });

        filterStatement = ProxyUtil.getFilterRestriction([filter]);
        t.is(filterStatement, " WHERE (dv_id = 'ATL' OR dp_id IS NULL )", 'NULL values match');

        // Test operators
        filter = Ext.create('Common.util.Filter',
                {
                    conjunction: 'AND',
                    property: 'date_assigned',
                    value:  Ext.DateExtras.format(new Date(2013, 0, 1, 12, 0), 'Y-m-d H:i:s.u'),
                    operator: '<='
                });

        filterStatement = ProxyUtil.getFilterRestriction([filter]);
        t.is(filterStatement, " WHERE date_assigned <= '2013-01-01 12:00:00.000'", 'Less Than operator values match');

        // Test operators combined with subFilters
        filter = Ext.create('Common.util.Filter',
                {
                    conjunction: 'AND',
                    property: 'date_start',
                    value:  Ext.DateExtras.format(new Date(2013, 0, 1, 12, 0), 'Y-m-d H:i:s.u'),
                    operator: '<='
                });

        filter2 =  Ext.create('Common.util.Filter',
                {
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
                            value: Ext.DateExtras.format(new Date(2013, 0, 1, 12, 0), 'Y-m-d H:i:s.u'),
                            conjunction: 'OR',
                            operator: '>',
                            matchIsNullValue: false
                        }
                    ]
                });



        filterStatement = ProxyUtil.getFilterRestriction([filter, filter2]);
        t.is(filterStatement, " WHERE date_start <= '2013-01-01 12:00:00.000' AND (date_end IS NULL OR date_end > '2013-01-01 12:00:00.000' )", 'Combined operator values match');

        // Test multiple filters that contain subfilters
        filter3 = Ext.create('Common.util.Filter',
            {
                conjunction: 'AND',
                anyMatch: true,
                subFilter: [
                    {
                        property: 'step_type',
                        value: 'review',
                        conjunction: 'OR'
                    },
                    {
                        property: 'step_type',
                        value: 'approval',
                        conjunction: 'OR'
                    }
                ]
            });

        filterStatement = ProxyUtil.getFilterRestriction([filter2, filter3]);
        t.is(filterStatement, " WHERE (date_end IS NULL OR date_end > '2013-01-01 12:00:00.000' ) AND (step_type = 'review' OR step_type = 'approval' )", 'Multiple sub-filters match');

        t.done();
    });
});