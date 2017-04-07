// Set up a model to use in the store
Ext.define('Solutions.model.Document', {
    extend : 'Common.data.Model',
    config: {
        fields: [
            {
                name: 'name',
                type: 'string'
            },
            {
                name: 'doc',
                type: 'string',
                isDocumentField: true,
                isSyncField : true
            },
            {
                name: 'doc_contents',
                type: 'string',
                isSyncField : true
            },
            {
                name: 'doc_isnew',
                type: 'boolean',
                defaultValue: false,
                isSyncField : false
            }
        ]
    },

    /**
     * Returns 1 if the doc field in the record has a value.
     */
    getDocumentCount: function() {
        var data = this.getData(),
            documentCount = 0;

        if (!Ext.isEmpty(data.doc)) {
            documentCount = 1;
        }

        return documentCount;
    }
});