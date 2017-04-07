Ext.define('SpaceOccupancy.store.EmployeeListStore', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'Common.store.proxy.SqliteView',
        'SpaceOccupancy.model.EmployeeList'
    ],

    config: {
        storeId: 'employeeListStore',
        model: 'SpaceOccupancy.model.EmployeeList',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: null,  // view definition is set in the initializer

            viewName: 'EmployeeList',

            baseTables: ['RoomPct', 'EmployeeSurvey']
        },

        viewDefinitionTpl: "SELECT r.primary_em, r.em_id, r.bl_id, r.fl_id, " +
        "r.rm_id, r.survey_id, r.pct_id FROM RoomPct r " +
        "WHERE r.em_id IS NOT NULL AND r.em_id <> '' AND r.primary_em = 0 " +
        "AND r.date_start<='{0}' AND (r.date_end IS NULL OR r.date_end>'{0}') " +
        "UNION SELECT '1' as primary_em, e.em_id, e.bl_id, e.fl_id, e.rm_id, " +
        "NULL as survey_id, NULL as pct_id FROM EmployeeSurvey e"
    },

    initialize: function () {
        var me = this;

        me.callParent(arguments);
        me.getProxy().setViewDefinition(Ext.String.format(me.getViewDefinitionTpl(), SpaceOccupancy.util.Ui.getCurrentDateValueFormatted()));
    },

    updateViewDefinition: function () {
        var me = this,
            sqlView = me.getProxy();

        sqlView.setViewDefinition(Ext.String.format(me.getViewDefinitionTpl(), SpaceOccupancy.util.Ui.getCurrentDateValueFormatted()));
    }
});



