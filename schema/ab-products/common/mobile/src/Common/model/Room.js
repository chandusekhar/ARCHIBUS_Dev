/**
 * Domain object for Room.
 * <p>
 *
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.model.Room', {
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
                name: 'rm_id',
                type: 'string'
            },
            {
                name: 'name',
                type: 'string'
            },
            {
                name: 'rm_type',
                type: 'string'
            },
            {
                name: 'rm_use',
                type: 'string'
            },
            {
                name: 'rm_cat',
                type: 'string'
            },
            {
                name: 'rm_std',
                type: 'string'
            },
            {
                name: 'area',
                type: 'string'
            },
            {
                name: 'dv_id',
                type: 'string'
            },
            {
                name: 'dp_id',
                type: 'string'
            },
            {
                name: 'phone',
                type: 'string'
            },
            {
                name: 'survey_photo',
                type: 'string'
            },
            {
                name: 'survey_photo_contents',
                type: 'string',
                isSyncField: false
            }
        ],

        sqlIndexes: [
            {
                indexName: 'idxRoomBlId',
                fields: ['bl_id']
            },
            {
                indexName: 'idxRoomBlFlRmId',
                fields: ['bl_id', 'fl_id', 'rm_id']
            },
            {
                indexName: 'idxRoomBlDvDp',
                fields: ['bl_id', 'dv_id', 'dp_id']
            }
        ],

        uniqueIdentifier: ['bl_id','fl_id','rm_id']
    }
});