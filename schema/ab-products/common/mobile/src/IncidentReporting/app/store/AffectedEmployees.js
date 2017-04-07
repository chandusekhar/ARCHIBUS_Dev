Ext.define('IncidentReporting.store.AffectedEmployees', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [ 'Common.store.proxy.SqliteView' ],

    config: {
        storeId: 'affectedEmployees',
        fields: [
            {name: 'em_id', type: 'string'},
            {name: 'name_last', type: 'string'},
            {name: 'name_first', type: 'string'},
            {name: 'email', type: 'string'},
            {name: 'dv_id', type: 'string'},
            {name: 'dp_id', type: 'string'},
            {name: 'bl_id', type: 'string'},
            {name: 'fl_id', type: 'string'},
            {name: 'rm_id', type: 'string'}
        ],
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT em_id, name_last, name_first, email, dv_id, dp_id, bl_id, fl_id, rm_id FROM Employee ORDER BY em_id',

            viewName: 'affectedEmployee',

            baseTables: [ 'Employee' ]
        }
    }
});