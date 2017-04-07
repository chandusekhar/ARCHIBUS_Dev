Ext.define('Common.model.RoomStandard', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'rm_std',
                type: 'string'
            },
            {
                name: 'description',
                type: 'string'
            },
            {
                name: 'doc_graphic',
                type: 'string'
            },
            {
                name: 'doc_graphic_contents',
                type: 'string',
                isSyncField: false
            },
            {
                name: 'doc_block',
                type: 'string'
            },
            {
                name: 'doc_block_contents',
                type: 'string',
                isSyncField: false
            }
        ]
    }

});