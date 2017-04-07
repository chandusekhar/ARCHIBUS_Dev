Ext.define('SpaceOccupancy.store.CategoryListStore', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [
        'Common.store.proxy.SqliteView',
        'SpaceOccupancy.model.CategoryList'
    ],

    config: {
        storeId: 'categoryListStore',
        model: 'SpaceOccupancy.model.CategoryList',
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: null,  // view definition is set in the initializer

            viewName: 'CategoryList',

            baseTables: ['RoomPct']
        },

        viewDefinitionTpl: "SELECT r.pct_id, r.bl_id, r.fl_id, r.rm_id, r.rm_cat, r.rm_type, r.survey_id, r.primary_rm " +
        "FROM RoomPct r WHERE ((r.rm_cat IS NOT NULL AND r.rm_cat <> '') OR (r.rm_type IS NOT NULL AND r.rm_type <> '')) " +
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



