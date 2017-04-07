Ext.define('Solutions.model.BuildingCode', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'bl_id',
                type: 'string'
            },
            {
                name: 'name',
                type: 'string'
            }
        ],

        sqlIndexes: [
            {
                indexName: 'idxBuildingCodeBlId',
                fields: ['bl_id']
            }
        ],

        uniqueIdentifier: ['bl_id']
    }
});