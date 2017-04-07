/**
 * Domain object for Floor.
 *
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.model.Floor', {
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
                name: 'fl_id',
                type: 'string'
            },
            {
                name: 'name',
                type: 'string'
            }
        ],

        sqlIndexes: [
            {
                indexName: 'idxFloorBlId',
                fields: ['bl_id']
            },
            {
                indexName: 'idxFloorFlId',
                fields: ['fl_id']
            }
        ],

        uniqueIdentifier: ['bl_id','fl_id']
    }
});