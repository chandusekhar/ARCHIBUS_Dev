Ext.define('AssetAndEquipmentSurvey.model.AssetEmployee', {
    extend: 'Common.data.Model',

    config: {
        uniqueIdentifier: ['em_id'],
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'em_id',
                type: 'string'
            },
            {
                name: 'email',
                type: 'string'
            },
            {
                name: 'bl_id',
                type: 'string'
            },
            {
                name: 'fl_id',
                type: 'string'
            },
            {
                name: 'rm_id',
                type: 'string'
            },
            {
                name: 'phone',
                type: 'string'
            },
            {
                name: 'name_last',
                type: 'string'
            },
            {
                name: 'name_first',
                type: 'string'
            },
            {
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'dp_id',
                type: 'string'
            }
        ],
        sqlIndexes: [
            {
                indexName: 'idxAssetEmployeeEmId',
                fields: ['em_id']
            },
            {
                indexName: 'idxAssetEmployeeEmail',
                fields: ['email']
            }
        ]
    }
});