Ext.define('MaterialInventory.model.MaterialMsds', {
    extend: 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'id',
                type: 'int'
            },
            {
                name: 'msds_id',
                type: 'IntegerClass'
            },
            {
                name: 'doc',
                type: 'string',
                isDocumentField: true,
                isSyncField: true
            },
            {
                name: 'doc_contents',
                type: 'string',
                isSyncField: true
            },
            {
                name: 'doc_isnew',
                type: 'boolean',
                defaultValue: false,
                isSyncField: false
            },
            {
                name: 'doc_file',
                type: 'string',
                isSyncField: false,
                defaultValue: ''
            }
        ]
    }
});