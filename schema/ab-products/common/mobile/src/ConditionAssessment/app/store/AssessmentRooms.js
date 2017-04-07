Ext.define('ConditionAssessment.store.AssessmentRooms', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['Common.store.proxy.SqliteView'],

    config: {
        storeId: 'assessmentRoomsStore',
        fields: [
            {name: 'site_id', type: 'string'},
            {name: 'pr_id', type: 'string'},
            {name: 'bl_id', type: 'string'},
            {name: 'fl_id', type: 'string'},
            {name: 'rm_id', type: 'string'},
            {name: 'name', type: 'string'},
            {name: 'rm_type', type: 'string'},
            {name: 'rm_cat', type: 'string'},
            {name: 'rm_std', type: 'string'},
            {name: 'dv_id', type: 'string'},
            {name: 'dp_id', type: 'string'}
        ],
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT bl.site_id,bl.pr_id,rm.bl_id,rm.fl_id,rm.rm_id,rm.name,rm.rm_type,rm.rm_cat,rm.rm_std,rm.dv_id,rm.dp_id'
            + ' FROM Room rm JOIN Building bl ON rm.bl_id = bl.bl_id'
            + ' WHERE EXISTS (SELECT site_id FROM ConditionAssessment WHERE ConditionAssessment.site_id = bl.site_id)',

            viewName: 'AssessmentRoom',

            baseTables: ['Building', 'Room', 'ConditionAssessment']
        }
    }
});