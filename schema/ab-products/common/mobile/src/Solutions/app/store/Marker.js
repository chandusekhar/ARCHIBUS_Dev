Ext.define('Solutions.store.Marker', {

    extend: 'Common.store.sync.ValidatingTableStore',

    requires: [
        'Solutions.model.Marker',
        'Common.store.sync.PagedSyncStore'
    ],

    serverTableName: 'afm_redlines',
    serverFieldNames: [
        'auto_number',
        'origin',
        'redline_type',
        'redlines',
        'dwg_name',
        'position_lux',
        'position_luy',
        'position_rlx',
        'position_rly',
        'rotation',
        'layer_name'
    ],
    inventoryKeyNames: ['auto_number'],

    config: {
        model: 'Solutions.model.Marker',
        storeId: 'markerStore',
        enableAutoLoad: true,
        remoteFilter: true,
        remoteSort: true,
        autoSync: true,
        disablePaging: true,
        restriction: [{
            tableName: 'afm_redlines',
            fieldName: 'origin',
            operation: 'EQUALS',
            value: 'HTML5-based Floor Plan'
        },
            {
                tableName: 'afm_redlines',
                fieldName: 'redline_type',
                operation: 'EQUALS',
                value: 'Marker'
            },
            {
                tableName: 'afm_redlines',
                fieldName: 'layer_name',
                operation: 'EQUALS',
                value: 'MY_MARKER_TABLE-assets'
            }],
        proxy: {
            type: 'Sqlite'
        }
    }
});
