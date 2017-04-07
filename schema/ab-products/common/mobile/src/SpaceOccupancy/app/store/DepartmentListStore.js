Ext.define('SpaceOccupancy.store.DepartmentListStore', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'Common.store.proxy.SqliteView',
        'SpaceOccupancy.model.DepartmentList'],

    config: {
        storeId: 'departmentListStore',
        model: 'SpaceOccupancy.model.DepartmentList',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: null,

            viewName: 'DepartmentList',

            baseTables: ['RoomPct']
        },
        viewDefinitionTpl: "SELECT r.pct_id, r.bl_id, r.fl_id, r.rm_id, r.dv_id, r.dp_id, r.survey_id, r.primary_rm " +
        "FROM RoomPct r WHERE ((r.dv_id IS NOT NULL AND r.dv_id <> '') OR (r.dp_id IS NOT NULL AND r.dp_id <> '')) " +
        "AND r.date_start<='{0}' AND (r.date_end IS NULL OR r.date_end>'{0}')"
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



