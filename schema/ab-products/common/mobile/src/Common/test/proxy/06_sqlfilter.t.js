/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {
    t.requireOk('Common.store.proxy.ProxyUtil', 'Common.util.Filter', 'Common.util.SqlFilter',
    function () {

        var filter = Ext.create('Common.util.Filter',
            { property: 'bl_id',
                value: 'HQ',
                conjunction: 'AND',
                anyMatch: true
            });

        var sqlFilter1 = Ext.create('Common.util.SqlFilter', {
            sql: 'Building.fl_id IN(SELECT fl_id FROM Floor)'
        });

        var sqlFilter2 = Ext.create('Common.util.SqlFilter', {
            sql: 'Equipment.eq_id IN(SELECT eq_id FROM EquipmentStandard WHERE EquipmentStandard.eq_std=\'TEST\')'
        });

        var filterStatement = ProxyUtil.getFilterRestriction([filter, sqlFilter1, sqlFilter2]);
        var desiredResult = " WHERE bl_id LIKE '%HQ%' AND Building.fl_id IN(SELECT fl_id FROM Floor) AND Equipment.eq_id IN(SELECT eq_id FROM EquipmentStandard WHERE EquipmentStandard.eq_std='TEST')";
        t.is(filterStatement, desiredResult, 'Filter restriction is correct');
        t.done();

    });
});